#!/usr/bin/env python3
"""
XYQO Contract Reader Backend - Production Version
FastAPI backend with OpenAI GPT-4o-mini integration for contract analysis
"""

import os
import json
import hashlib
import logging
from datetime import datetime
from typing import Dict, Any, Optional
from io import BytesIO

# FastAPI imports
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, JSONResponse
import uvicorn

# PDF processing
import PyPDF2

# OpenAI integration
import openai

# PDF generation
try:
    from reportlab.lib.pagesizes import letter, A4
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import inch
    from reportlab.lib import colors
    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# In-memory PDF cache (in production, use Redis or database)
pdf_cache = {}

# Initialize FastAPI app
app = FastAPI(
    title="XYQO Contract Reader API",
    description="AI-powered contract analysis with OpenAI GPT-4o-mini",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# OpenAI configuration
openai.api_key = os.getenv("OPENAI_API_KEY")

# Nouveau schéma JSON contractuel professionnel
CONTRACT_JSON_SCHEMA = {
    "executive_summary": "Résumé en 10–20 lignes",
    "parties": [
        {
            "name": "string",
            "role": "CLIENT ou PRESTATAIRE",
            "legal_form": "string",
            "siren_siret": "string",
            "address": "string",
            "representative": "string"
        }
    ],
    "details": {
        "object": "string",
        "location": "string",
        "start_date": "YYYY-MM-DD ou null",
        "end_date": "YYYY-MM-DD ou null",
        "minimum_duration": "nombre de mois ou null",
        "notice_period": "nombre de jours ou null"
    },
    "obligations": {
        "provider": ["string"],
        "client": ["string"]
    },
    "financials": {
        "pricing_model": "forfait | abonnement | à_l_acte | mixte | inconnu",
        "payment_terms": "string",
        "amounts": [{"label": "string", "amount": 0, "currency": "EUR"}]
    },
    "governance": {
        "applicable_law": "string",
        "jurisdiction": "string",
        "liability": "string",
        "confidentiality": "boolean ou null"
    },
    "risks": ["string"],
    "missing_info": ["string"],
    "legal_warning": "Ce résumé est informatif, ne constitue pas un conseil juridique et peut contenir des erreurs."
}

def extract_pdf_text(pdf_content: bytes) -> str:
    """Extract text from PDF content"""
    try:
        pdf_reader = PyPDF2.PdfReader(BytesIO(pdf_content))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        return text.strip()
    except Exception as e:
        logger.error(f"PDF extraction error: {e}")
        raise HTTPException(status_code=400, detail="Impossible de lire le fichier PDF")

def analyze_contract_with_openai(contract_text: str) -> Dict[str, Any]:
    """Analyze contract using OpenAI GPT-4o-mini with new professional schema"""
    try:
        system_prompt = """Tu es un assistant juridique expert en contrats français.  
Ton objectif : produire un résumé contractuel complet, en JSON STRICT, prêt à être converti en PDF.  
Contraintes : 
- Réponds uniquement en JSON valide UTF-8, aucune phrase hors JSON.  
- Respecte exactement la structure ci-dessous.  
- Dates en ISO 8601 (YYYY-MM-DD). Montants en nombre + devise ISO 4217.  
- Si une donnée est absente, mets `null` ou [].  
- Le champ `executive_summary` doit être 10–20 lignes en français clair, compréhensible pour un non-juriste.  
- Masque IBAN, e-mail, téléphone dans les textes.  
- Ne jamais inventer : si tu n'es pas sûr, retourne `null`."""

        user_prompt = f"""Analyse ce contrat et fournis STRICTEMENT ce JSON :

{{
  "executive_summary": "Résumé en 10–20 lignes",
  "parties": [
    {{"name": "...", "role": "CLIENT ou PRESTATAIRE", "legal_form": "...", "siren_siret": "...", "address": "...", "representative": "..."}}
  ],
  "details": {{
    "object": "...",
    "location": "...",
    "start_date": "YYYY-MM-DD ou null",
    "end_date": "YYYY-MM-DD ou null",
    "minimum_duration": "nombre de mois ou null",
    "notice_period": "nombre de jours ou null"
  }},
  "obligations": {{
    "provider": ["..."],
    "client": ["..."]
  }},
  "financials": {{
    "pricing_model": "forfait | abonnement | à_l_acte | mixte | inconnu",
    "payment_terms": "...",
    "amounts": [{{"label": "...", "amount": 0, "currency": "EUR"}}]
  }},
  "governance": {{
    "applicable_law": "...",
    "jurisdiction": "...",
    "liability": "...",
    "confidentiality": true/false/null
  }},
  "risks": ["..."],
  "missing_info": ["..."],
  "legal_warning": "Ce résumé est informatif, ne constitue pas un conseil juridique et peut contenir des erreurs."
}}

<contract_text>
{contract_text[:12000]}
</contract_text>"""

        response = openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            max_tokens=3000,
            temperature=0.1
        )
        
        analysis_text = response.choices[0].message.content.strip()
        
        # Clean and parse JSON
        if analysis_text.startswith("```json"):
            analysis_text = analysis_text[7:]
        if analysis_text.endswith("```"):
            analysis_text = analysis_text[:-3]
        
        analysis = json.loads(analysis_text)
        
        # Validate required fields
        if not analysis.get("executive_summary"):
            analysis["executive_summary"] = "Résumé automatique indisponible - analyse en cours."
        if not analysis.get("legal_warning"):
            analysis["legal_warning"] = "Ce résumé est informatif, ne constitue pas un conseil juridique et peut contenir des erreurs."
            
        return analysis
        
    except json.JSONDecodeError as e:
        logger.error(f"JSON parsing error: {e}")
        return create_fallback_analysis()
    except Exception as e:
        logger.error(f"OpenAI analysis error: {e}")
        return create_fallback_analysis()

def create_fallback_analysis() -> Dict[str, Any]:
    """Create fallback analysis when OpenAI fails"""
    return {
        "executive_summary": "Analyse automatique indisponible. Ce contrat nécessite une révision manuelle par un expert juridique pour identifier les clauses principales, les obligations des parties, les aspects financiers et les risques potentiels. Veuillez consulter un professionnel du droit pour une analyse complète et des conseils adaptés à votre situation spécifique.",
        "parties": [
            {"name": "Partie A", "role": "PRESTATAIRE", "legal_form": null, "siren_siret": null, "address": null, "representative": null},
            {"name": "Partie B", "role": "CLIENT", "legal_form": null, "siren_siret": null, "address": null, "representative": null}
        ],
        "details": {
            "object": "Prestation de services",
            "location": null,
            "start_date": null,
            "end_date": null,
            "minimum_duration": null,
            "notice_period": null
        },
        "obligations": {
            "provider": ["Fourniture des services convenus"],
            "client": ["Paiement des services"]
        },
        "financials": {
            "pricing_model": "inconnu",
            "payment_terms": "Non spécifié",
            "amounts": []
        },
        "governance": {
            "applicable_law": "Droit français",
            "jurisdiction": "Tribunaux compétents",
            "liability": "Non spécifié",
            "confidentiality": null
        },
        "risks": ["Analyse automatique indisponible - révision manuelle requise"],
        "missing_info": ["Montants financiers", "Dates contractuelles", "Obligations spécifiques", "Clauses de résiliation"],
        "legal_warning": "Ce résumé est informatif, ne constitue pas un conseil juridique et peut contenir des erreurs."
    }

def generate_pdf_report(analysis: Dict[str, Any], processing_id: str) -> bytes:
    """Generate professional PDF report with new schema"""
    if not REPORTLAB_AVAILABLE:
        return generate_text_fallback(analysis, processing_id)
    
    try:
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=72, leftMargin=72, topMargin=72, bottomMargin=18)
        
        # Styles
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=18,
            spaceAfter=30,
            textColor=colors.HexColor('#1e40af'),
            alignment=1  # Center
        )
        
        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=14,
            spaceAfter=12,
            textColor=colors.HexColor('#1e40af'),
            borderWidth=1,
            borderColor=colors.HexColor('#e5e7eb'),
            borderPadding=5,
            backColor=colors.HexColor('#f8fafc')
        )
        
        summary_style = ParagraphStyle(
            'SummaryStyle',
            parent=styles['Normal'],
            fontSize=11,
            spaceAfter=12,
            leftIndent=20,
            rightIndent=20,
            backColor=colors.HexColor('#f9fafb'),
            borderWidth=1,
            borderColor=colors.HexColor('#e5e7eb'),
            borderPadding=10
        )
        
        # Content
        story = []
        
        # Title
        story.append(Paragraph("RAPPORT D'ANALYSE CONTRACTUELLE", title_style))
        story.append(Paragraph(f"XYQO Contract Reader - {datetime.now().strftime('%d/%m/%Y %H:%M')}", styles['Normal']))
        story.append(Spacer(1, 20))
        
        # Executive Summary
        story.append(Paragraph("RÉSUMÉ EXÉCUTIF", heading_style))
        executive_summary = analysis.get('executive_summary', 'Résumé non disponible')
        story.append(Paragraph(executive_summary, summary_style))
        story.append(Spacer(1, 20))
        
        # Contract Details
        story.append(Paragraph("DÉTAILS DU CONTRAT", heading_style))
        details = analysis.get('details', {})
        contract_info = [
            ['Objet:', details.get('object', 'Non spécifié')],
            ['Lieu:', details.get('location', 'Non spécifié')],
            ['Date début:', details.get('start_date', 'Non spécifié')],
            ['Date fin:', details.get('end_date', 'Non spécifié')],
            ['Durée minimale:', f"{details.get('minimum_duration', 'Non spécifié')} mois" if details.get('minimum_duration') else 'Non spécifié'],
            ['Préavis:', f"{details.get('notice_period', 'Non spécifié')} jours" if details.get('notice_period') else 'Non spécifié'],
        ]
        
        table = Table(contract_info, colWidths=[2*inch, 4*inch])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f3f4f6')),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#e5e7eb')),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ]))
        story.append(table)
        story.append(Spacer(1, 20))
        
        # Parties
        story.append(Paragraph("PARTIES CONTRACTUELLES", heading_style))
        parties = analysis.get('parties', [])
        for i, party in enumerate(parties):
            story.append(Paragraph(f"<b>Partie {i+1}: {party.get('name', 'Non spécifié')}</b>", styles['Normal']))
            story.append(Paragraph(f"Rôle: {party.get('role', 'Non spécifié')}", styles['Normal']))
            story.append(Paragraph(f"Forme juridique: {party.get('legal_form', 'Non spécifié')}", styles['Normal']))
            if party.get('siren_siret'):
                story.append(Paragraph(f"SIREN/SIRET: {party.get('siren_siret')}", styles['Normal']))
            if party.get('representative'):
                story.append(Paragraph(f"Représentant: {party.get('representative')}", styles['Normal']))
            story.append(Spacer(1, 10))
        
        # Obligations
        story.append(Paragraph("OBLIGATIONS", heading_style))
        obligations = analysis.get('obligations', {})
        
        if obligations.get('provider'):
            story.append(Paragraph("<b>Obligations du prestataire:</b>", styles['Normal']))
            for obligation in obligations.get('provider', []):
                story.append(Paragraph(f"• {obligation}", styles['Normal']))
            story.append(Spacer(1, 10))
        
        if obligations.get('client'):
            story.append(Paragraph("<b>Obligations du client:</b>", styles['Normal']))
            for obligation in obligations.get('client', []):
                story.append(Paragraph(f"• {obligation}", styles['Normal']))
            story.append(Spacer(1, 15))
        
        # Financial
        story.append(Paragraph("ASPECTS FINANCIERS", heading_style))
        financials = analysis.get('financials', {})
        story.append(Paragraph(f"<b>Modèle tarifaire:</b> {financials.get('pricing_model', 'Non spécifié')}", styles['Normal']))
        story.append(Paragraph(f"<b>Conditions de paiement:</b> {financials.get('payment_terms', 'Non spécifié')}", styles['Normal']))
        
        amounts = financials.get('amounts', [])
        if amounts:
            story.append(Paragraph("<b>Montants:</b>", styles['Normal']))
            for amount in amounts:
                story.append(Paragraph(f"• {amount.get('label', 'Montant')}: {amount.get('amount', 0)} {amount.get('currency', 'EUR')}", styles['Normal']))
        story.append(Spacer(1, 15))
        
        # Governance
        story.append(Paragraph("GOUVERNANCE", heading_style))
        governance = analysis.get('governance', {})
        story.append(Paragraph(f"<b>Droit applicable:</b> {governance.get('applicable_law', 'Non spécifié')}", styles['Normal']))
        story.append(Paragraph(f"<b>Juridiction:</b> {governance.get('jurisdiction', 'Non spécifié')}", styles['Normal']))
        story.append(Paragraph(f"<b>Responsabilité:</b> {governance.get('liability', 'Non spécifié')}", styles['Normal']))
        confidentiality = governance.get('confidentiality')
        if confidentiality is not None:
            story.append(Paragraph(f"<b>Confidentialité:</b> {'Oui' if confidentiality else 'Non'}", styles['Normal']))
        story.append(Spacer(1, 15))
        
        # Risks
        risks = analysis.get('risks', [])
        if risks:
            story.append(Paragraph("FACTEURS DE RISQUE", heading_style))
            for risk in risks:
                story.append(Paragraph(f"• {risk}", styles['Normal']))
            story.append(Spacer(1, 15))
        
        # Missing Info
        missing_info = analysis.get('missing_info', [])
        if missing_info:
            story.append(Paragraph("INFORMATIONS MANQUANTES", heading_style))
            for info in missing_info:
                story.append(Paragraph(f"• {info}", styles['Normal']))
            story.append(Spacer(1, 15))
        
        # Legal Warning
        legal_warning = analysis.get('legal_warning', '')
        if legal_warning:
            story.append(Paragraph("AVERTISSEMENT JURIDIQUE", heading_style))
            story.append(Paragraph(legal_warning, summary_style))
            story.append(Spacer(1, 15))
        
        # Footer
        story.append(Spacer(1, 30))
        story.append(Paragraph("Rapport généré par XYQO Contract Reader", styles['Normal']))
        story.append(Paragraph(f"ID de traitement: {processing_id}", styles['Normal']))
        story.append(Paragraph(f"Date de génération: {datetime.now().strftime('%d/%m/%Y à %H:%M')}", styles['Normal']))
        
        doc.build(story)
        buffer.seek(0)
        return buffer.getvalue()
        
    except Exception as e:
        logger.error(f"PDF generation error: {e}")
        return generate_text_fallback(analysis, processing_id)

def generate_text_fallback(analysis: Dict[str, Any], processing_id: str) -> bytes:
    """Generate text-based fallback report"""
    report = f"""
RAPPORT D'ANALYSE CONTRACTUELLE
XYQO Contract Reader - {datetime.now().strftime('%d/%m/%Y %H:%M')}

INFORMATIONS GÉNÉRALES
Objet: {analysis.get('contract', {}).get('object', 'Non spécifié')}
Type: {analysis.get('contract', {}).get('type', 'Non spécifié')}
Langue: {analysis.get('contract', {}).get('language', 'Non spécifié')}

PARTIES CONTRACTUELLES
"""
    
    parties = analysis.get('parties', {}).get('list', [])
    for i, party in enumerate(parties):
        report += f"Partie {i+1}: {party.get('name', 'Non spécifié')} ({party.get('role', 'Non spécifié')})\n"
    
    report += f"""
ASPECTS FINANCIERS
Montant: {analysis.get('financial', {}).get('amount', 'Non spécifié')}
Devise: {analysis.get('financial', {}).get('currency', 'Non spécifié')}

ID de traitement: {processing_id}
"""
    
    return report.encode('utf-8')

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "xyqo-backend",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "openai_available": bool(openai.api_key),
        "version": "1.0.0"
    }

@app.post("/api/v1/contract/analyze")
async def analyze_contract(file: UploadFile = File(...)):
    """Analyze uploaded contract"""
    start_time = datetime.now()
    
    try:
        # Validate file
        if not file.filename.lower().endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Seuls les fichiers PDF sont acceptés")
        
        # Read file content
        content = await file.read()
        if len(content) > 10 * 1024 * 1024:  # 10MB limit
            raise HTTPException(status_code=400, detail="Fichier trop volumineux (max 10MB)")
        
        # Generate processing ID
        processing_id = hashlib.sha256(content).hexdigest()[:16]
        
        # Extract text from PDF
        contract_text = extract_pdf_text(content)
        if len(contract_text) < 100:
            raise HTTPException(status_code=400, detail="Le PDF ne contient pas assez de texte analysable")
        
        # Analyze with OpenAI
        analysis = analyze_contract_with_openai(contract_text)
        
        # Generate PDF report
        pdf_content = generate_pdf_report(analysis, processing_id)
        
        # Calculate processing time and cost
        processing_time = (datetime.now() - start_time).total_seconds()
        cost_euros = 0.01  # Estimated cost
        
        # Store PDF content in memory for download (in production, use Redis or database)
        pdf_cache[processing_id] = pdf_content
        
        return {
            "success": True,
            "analysis": analysis,
            "metadata": {
                "filename": file.filename,
                "analysis_id": processing_id,
                "download_url": f"/download/{processing_id}.pdf",
                "processed_at": datetime.utcnow().isoformat() + "Z"
            },
            "processing_time": round(processing_time, 2),
            "cost_euros": cost_euros
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Analysis error: {e}")
        raise HTTPException(status_code=500, detail="Erreur lors de l'analyse du contrat")

@app.get("/download/{processing_id}.pdf")
async def download_pdf(processing_id: str):
    """Download generated PDF report"""
    try:
        # Get PDF from cache
        pdf_content = pdf_cache.get(processing_id)
        
        if not pdf_content:
            # If not in cache, generate fallback PDF
            logger.warning(f"PDF not found in cache for ID: {processing_id}")
            analysis = create_fallback_analysis()
            pdf_content = generate_pdf_report(analysis, processing_id)
        
        return Response(
            content=pdf_content,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=rapport_contrat_{processing_id}.pdf",
                "Content-Type": "application/pdf"
            }
        )
        
    except Exception as e:
        logger.error(f"PDF download error: {e}")
        raise HTTPException(status_code=500, detail="Erreur lors de la génération du PDF")

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8080))
    uvicorn.run(app, host="0.0.0.0", port=port)
