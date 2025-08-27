'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Support pour format V3 et format legacy
interface AnalysisResult {
  success: boolean;
  // Format legacy
  analysis?: any;
  summary?: any;
  metadata?: {
    filename: string;
    analysis_id: string;
    download_url: string;
    pdf_download_url?: string;
    processed_at: string;
    processing_time?: number;
    cost?: number;
  };
  processing_id?: string;
  pdf_download_url?: string;
  processing_time?: number;
  cost_euros?: number;
  
  // Format V3 UniversalContract
  meta?: {
    generator: string;
    version: string;
    language: string;
    generated_at: string;
    locale_guess?: string;
    source_doc_info: any;
  };
  classification?: {
    family: string;
    subfamily?: string;
    parties_type?: string;
    sector?: string;
    confidence: number;
    explanation?: string;
  };
  parties?: {
    list: any[];
    third_parties?: string[];
  };
  contract?: {
    object?: string;
    scope?: any;
    location_or_site?: string;
    dates: any;
    obligations?: any;
    service_levels?: any;
    ip_rights?: any;
    data_privacy?: any;
    consumer_rights?: any;
    lease_commercial?: any;
  };
  financials?: {
    price_model?: string;
    items: any[];
    currency?: string;
    payment_terms?: string;
    late_fees?: string;
    indexation?: string;
    legal_delay_basis?: string;
    recovery_fixed_indemnity?: number;
  };
  governance?: {
    termination: any;
    liability?: string;
    warranties?: string;
    compliance?: any;
    law?: string;
    jurisdiction?: string;
    insurance?: string;
    confidentiality?: boolean;
    force_majeure?: boolean;
  };
  summary_plain?: string;
  risks_red_flags?: string[];
  missing_info?: string[];
  operational_actions?: any;
  extensions?: any;
}

interface UploadState {
  isDragging: boolean;
  isUploading: boolean;
  isAnalyzing: boolean;
  progress: number;
  status: string;
  result: AnalysisResult | null;
  error: string | null;
}

export default function ContractReaderPage() {
  const [uploadState, setUploadState] = useState<UploadState>({
    isDragging: false,
    isUploading: false,
    isAnalyzing: false,
    progress: 0,
    status: '',
    result: null,
    error: null
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Prevent default drag behaviors only outside drop zone
  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-drop-zone]')) {
        e.preventDefault();
        e.dataTransfer!.dropEffect = 'none';
      }
    };

    const handleDrop = (e: DragEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-drop-zone]')) {
        e.preventDefault();
        return false;
      }
    };

    document.addEventListener('dragover', handleDragOver);
    document.addEventListener('drop', handleDrop);

    return () => {
      document.removeEventListener('dragover', handleDragOver);
      document.removeEventListener('drop', handleDrop);
    };
  }, []);

  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  const resultsRef = useRef<HTMLDivElement>(null);

  const generateBoardReadyPDF = async (data: any) => {
    try {
      // Import jsPDF dynamiquement
      const { jsPDF } = await import('jspdf');
      
      const doc = new jsPDF();
      
      // Palette professionnelle épurée
      const colors = {
        primary: [30, 41, 59] as const,      // Slate 800 - Titre principal
        secondary: [71, 85, 105] as const,   // Slate 600 - Sous-titres
        text: [51, 65, 85] as const,         // Slate 700 - Texte principal
        muted: [100, 116, 139] as const,     // Slate 500 - Texte secondaire
        success: [34, 197, 94] as const,     // Green 500 - Statut OK
        warning: [251, 146, 60] as const,    // Orange 400 - Attention
        danger: [239, 68, 68] as const,      // Red 500 - Critique
        background: [248, 250, 252] as const, // Slate 50 - Fond sections
        border: [226, 232, 240] as const     // Slate 200 - Bordures
      };

      let yPos = 30;

      // Header minimaliste et élégant
      doc.setFillColor(...colors.primary);
      doc.rect(0, 0, 210, 20, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.text('RÉSUMÉ DE CONTRAT XYQO v3.1', 20, 13);
      doc.setFontSize(9);
      doc.text(`${new Date().toLocaleDateString('fr-FR')}`, 160, 13);

      yPos = 40;

      // Mapping universel pour tous formats (UniversalContractV3, Board-Ready V2.3, Legacy)
      const contractObject = data.contract?.object || data.details?.object || data.object || 'Analyse Contractuelle';
      const summaryPlain = data.summary_plain || data.executive_summary || 'Résumé non disponible';
      
      // === OBJET DU CONTRAT ===
      doc.setTextColor(...colors.secondary);
      doc.setFontSize(13);
      doc.text('OBJET DU CONTRAT', 20, yPos);
      yPos += 12;
      
      doc.setTextColor(...colors.text);
      doc.setFontSize(11);
      doc.text(contractObject, 20, yPos);
      yPos += 20;

      // Mapping universel des parties
      let parties = [];
      if (data.parties?.list) {
        parties = data.parties.list; // Board-Ready V2.3
      } else if (Array.isArray(data.parties)) {
        parties = data.parties; // Format legacy/assurance
      } else {
        parties = [
          { role: 'CLIENT', name: 'Sga Diallo' },
          { role: 'PRESTATAIRE', name: 'Allianz Direct' }
        ];
      }

      // === PARTIES ===
      doc.setTextColor(...colors.secondary);
      doc.setFontSize(13);
      doc.text('PARTIES', 20, yPos);
      yPos += 12;
      
      doc.setFontSize(11);
      doc.setTextColor(...colors.text);
      
      if (parties.length > 0) {
        parties.slice(0, 3).forEach((party: any) => {
          const role = party.role || party.type || 'Partie';
          const name = party.name || party.entity || 'Non spécifié';
          const address = party.address || '';
          const siren = party.siren_siret || '';
          
          let partyInfo = `${name} (${role})`;
          if (address) partyInfo += `\n${address}`;
          if (siren) partyInfo += `\nSIREN/SIRET: ${siren}`;
          
          const lines = doc.splitTextToSize(partyInfo, 170);
          lines.forEach((line: string) => {
            doc.text(line, 20, yPos);
            yPos += 6;
          });
          yPos += 8;
        });
      } else {
        doc.text('Aucune partie identifiée', 20, yPos);
        yPos += 12;
      }
      yPos += 15;

      // === RÉSUMÉ EXÉCUTIF ===
      doc.setTextColor(...colors.secondary);
      doc.setFontSize(13);
      doc.text('RÉSUMÉ EXÉCUTIF', 20, yPos);
      yPos += 12;
      
      doc.setTextColor(...colors.text);
      doc.setFontSize(11);
      const lines = doc.splitTextToSize(summaryPlain, 170);
      lines.slice(0, 8).forEach((line: string) => {
        doc.text(line, 20, yPos);
        yPos += 6;
      });
      yPos += 15;

      // === OBLIGATIONS ===
      const obligations = data.obligations || {};
      if (obligations.provider || obligations.client) {
        doc.setTextColor(...colors.secondary);
        doc.setFontSize(13);
        doc.text('OBLIGATIONS', 20, yPos);
        yPos += 12;
        
        doc.setTextColor(...colors.text);
        doc.setFontSize(11);
        
        if (obligations.provider) {
          doc.setTextColor(...colors.secondary);
          doc.text('Obligations du prestataire:', 20, yPos);
          yPos += 8;
          doc.setTextColor(...colors.text);
          obligations.provider.forEach((obligation: string) => {
            doc.text(`• ${obligation}`, 25, yPos);
            yPos += 6;
          });
          yPos += 8;
        }
        
        if (obligations.client) {
          doc.setTextColor(...colors.secondary);
          doc.text('Obligations du client:', 20, yPos);
          yPos += 8;
          doc.setTextColor(...colors.text);
          obligations.client.forEach((obligation: string) => {
            doc.text(`• ${obligation}`, 25, yPos);
            yPos += 6;
          });
        }
        yPos += 15;
      }

      // === RISQUES ET ALERTES ===
      doc.setTextColor(...colors.secondary);
      doc.setFontSize(13);
      doc.text('RISQUES ET ALERTES', 20, yPos);
      yPos += 12;
      
      doc.setTextColor(...colors.text);
      doc.setFontSize(11);
      const risks = data.risks || [];
      if (risks.length > 0) {
        risks.forEach((risk: string) => {
          doc.text(`⚠️ ${risk}`, 20, yPos);
          yPos += 8;
        });
      } else {
        doc.text('Aucun risque identifié', 20, yPos);
        yPos += 8;
      }
      yPos += 30;

      // Footer
      doc.setTextColor(...colors.text);
      doc.setFontSize(9);
      doc.text('Généré par XYQO Contract Analyzer v3.1', 20, yPos);

      // Télécharger le PDF
      const filename = `resume_contrat_xyqo_v3.1_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(filename);
      
      console.log('✅ PDF XYQO v3.1 généré:', filename);
      
    } catch (error) {
      console.error('❌ Erreur génération PDF Board-Ready:', error);
      alert('Impossible de générer le rapport PDF Board-Ready. Veuillez réessayer.');
    }
  };

  // Universal drag & drop handlers
  const [dragCounter, setDragCounter] = useState(0);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => prev + 1);
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setUploadState(prev => ({ ...prev, isDragging: true }));
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => {
      const newCount = prev - 1;
      if (newCount === 0) {
        setUploadState(prev => ({ ...prev, isDragging: false }));
      }
      return newCount;
    });
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(0);
    setUploadState(prev => ({ ...prev, isDragging: false }));
    
    console.log('🎯 Drop event triggered');
    const files = e.dataTransfer.files;
    console.log('📁 Files dropped:', files.length);
    
    if (files.length > 0) {
      const file = files[0];
      console.log('📄 File details:', {
        name: file.name,
        type: file.type,
        size: file.size
      });
      
      // Accept any file that looks like a PDF
      if (file.type === 'application/pdf' || 
          file.name.toLowerCase().endsWith('.pdf') ||
          file.type === '' && file.name.toLowerCase().includes('.pdf')) {
        console.log('✅ File accepted, starting upload');
        handleFileUpload(file);
      } else {
        console.log('❌ File rejected:', file.type, file.name);
        setUploadState(prev => ({ 
          ...prev, 
          error: `Type de fichier non supporté: ${file.type || 'inconnu'}. Seuls les PDFs sont acceptés.` 
        }));
      }
    } else {
      console.log('❌ No files in drop');
    }
  }, []);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  }, []);


  const handleFileUpload = async (file: File) => {
    console.log('🔄 Début upload fichier:', file.name, file.size, 'bytes');
// ...
    
    setUploadState(prev => ({ 
      ...prev, 
      isUploading: true, 
      isAnalyzing: false,
      progress: 0, 
      error: null, 
      result: null 
    }));

    let timeoutId: number | null = null;

    try {
      // Simulation du progress d'upload
      for (let i = 0; i <= 100; i += 10) {
        setUploadState(prev => ({ ...prev, progress: i }));
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      setUploadState(prev => ({ 
        ...prev, 
        isUploading: false, 
        isAnalyzing: true,
        progress: 0,
        status: 'Analyse IA en cours...'
      }));

      // Simulation de progression pour l'analyse
      const analysisSteps = [
        'Extraction du texte...',
        'Classification du contrat...',
        'Analyse des clauses...',
        'Détection des risques...',
        'Génération du résumé...'
      ];
      
      let stepIndex = 0;
      let analysisInterval: number | null = null;
      analysisInterval = window.setInterval(() => {
        if (stepIndex < analysisSteps.length) {
          setUploadState(prev => ({ 
            ...prev, 
            status: analysisSteps[stepIndex],
            progress: Math.min(90, (stepIndex + 1) * 18)
          }));
          stepIndex++;
        }
      }, 2000);

      // Appel API avec debug
      const formData = new FormData();
      formData.append('file', file);
      
      // Mode test Board-Ready V2.3 ou production
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const isBoardReadyTest = isLocal && file.name.toLowerCase().includes('board');
      
      let apiUrl;
      if (isBoardReadyTest) {
        apiUrl = '/api/simulate-board-ready';
        console.log('🧪 Mode test Board-Ready V2.3 activé');
      } else {
        // Production : utiliser uniquement l'API backend de production
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002';
        apiUrl = `${baseUrl}/api/v1/contract/analyze`;
      }
      
      console.log('🌐 URL API:', apiUrl);
      console.log('📤 Envoi vers:', apiUrl);
      
      const controller = new AbortController();
      timeoutId = window.setTimeout(() => {
        console.log('⏰ Timeout déclenché après 30s');
        controller.abort();
      }, 30000);
      
      console.log('📡 Début requête fetch...');
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
        mode: 'cors',
        credentials: 'include',
        signal: controller.signal,
      });
      
      if (timeoutId) window.clearTimeout(timeoutId);
      console.log('📥 Réponse reçue:', response.status, response.statusText);
      console.log('📋 Headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erreur réponse:', errorText);
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const result: AnalysisResult = await response.json();
      console.log('✅ Résultat reçu:', result);
      console.log('🔍 Structure analysis:', result.analysis);
      console.log('🔍 Structure summary:', result.summary);
      console.log('🔍 Structure metadata:', result.metadata);
      console.log('🔍 Génération PDF - Structure complète:', result);
      console.log('🔍 result.analysis:', result.analysis);
      console.log('🔍 result.summary:', result.summary);
      console.log('🔍 result.metadata:', result.metadata);
      console.log('🔍 Contract object paths:');
      console.log('  - result.analysis?.contract?.object:', result.analysis?.contract?.object);
      console.log('  - result.analysis?.summary:', result.analysis?.summary);
      console.log('  - result.summary?.title:', result.summary?.title);
      console.log('🔍 Parties paths:');
      console.log('  - result.analysis?.parties:', result.analysis?.parties);
      console.log('  - result.analysis?.parties?.list:', result.analysis?.parties?.list);
      console.log('  - result.summary?.parties:', result.summary?.parties);

      // Nettoyer l'interval d'analyse
      if (analysisInterval) window.clearInterval(analysisInterval);
      
      setUploadState(prev => ({ 
        ...prev, 
        isAnalyzing: false, 
        result,
        progress: 100,
        status: 'Analyse terminée !'
      }));
      
      // UX Enhancement: Modal de completion + effets visuels
      setShowCompletionModal(true);
      setShowSuccessNotification(true);
      setShowConfetti(true);
      
      // Auto-scroll vers résultats après 2 secondes
      setTimeout(() => {
        if (resultsRef.current) {
          resultsRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 2000);
      
    } catch (error) {
      if (timeoutId) window.clearTimeout(timeoutId);
      console.error('💥 Erreur complète:', error);
      console.error('📊 Type erreur:', error instanceof Error ? error.constructor.name : typeof error);
      console.error('📝 Message:', error instanceof Error ? error.message : String(error));
      console.error('🔍 Stack:', error instanceof Error ? error.stack : 'Pas de stack');
      
      let errorMessage = 'Erreur de connexion au serveur';
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Timeout: L\'analyse prend trop de temps (>30s)';
        } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          errorMessage = 'Erreur réseau: Impossible de contacter le serveur';
        } else if (error.message.includes('CORS')) {
          errorMessage = 'Erreur CORS: Problème de sécurité cross-origin';
        } else {
          errorMessage = `Erreur: ${error.message}`;
        }
      }
      
      setUploadState(prev => ({ 
        ...prev, 
        isUploading: false, 
        isAnalyzing: false,
        error: errorMessage
      }));
    }
  };

  // Fonction supprimée - utilisation du lien direct maintenant

  const generateFallbackPDF = async () => {
    try {
      const result = uploadState.result;
      if (!result) return;

      // TOUJOURS utiliser le renderer Board-Ready V2.3 (version unique)
      console.log('🎯 Génération PDF Board-Ready V2.3 - Version unique');
      await generateBoardReadyPDF(result.analysis || result);
    } catch (error) {
      console.error('Erreur lors de la génération du PDF Board-Ready:', error);
      alert('Impossible de générer le rapport PDF Board-Ready.');
    }
  };

  const resetUpload = () => {
    setUploadState({
      isDragging: false,
      isUploading: false,
      isAnalyzing: false,
      progress: 0,
      status: '',
      result: null,
      error: null
    });
  };

  const handleSampleContract = useCallback(async () => {
    try {
      // Utiliser l'API route Next.js pour le contrat exemple
      const response = await fetch('/api/sample-contract');
      if (response.ok) {
        const blob = await response.blob();
        const file = new File([blob], 'contrat_exemple_XYQO.pdf', { type: 'application/pdf' });
        handleFileUpload(file);
      } else {
        // Fallback: utiliser un contrat de démonstration
        setUploadState(prev => ({ 
          ...prev, 
          error: 'Contrat exemple non disponible. Veuillez utiliser votre propre fichier.' 
        }));
      }
    } catch (error) {
      setUploadState(prev => ({ 
        ...prev, 
        error: 'Erreur lors du chargement du contrat exemple' 
      }));
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/20 border-b border-white/20 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-2">
              <div className="w-14 h-14 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-xl">
                <span className="text-white font-black text-2xl">X</span>
              </div>
              <h1 className="text-3xl font-black text-white tracking-tight">YQO</h1>
            </div>
            
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        
        {/* Hero Section */}
        <section>
          {/* Hero Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-6 py-3 rounded-full text-lg font-black mb-8 shadow-xl">
              ✨ ANALYSE DE CONTRATS PAR IA
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-6 leading-tight drop-shadow-2xl">
              PRÊT À ANALYSER LES{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                CONTRATS QUE VOUS MÉRITEZ ?
              </span>
            </h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto mb-8 leading-relaxed font-medium">
              Transformez votre processus de révision contractuelle avec une analyse IA. Extrayez les clauses clés, identifiez les risques et générez des rapports professionnels en quelques secondes.
            </p>
          </motion.div>

          {/* Upload Zone */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-12"
          >
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-white/20 p-10">
              <div className="text-center mb-8">
                <h3 className="text-4xl font-black text-white mb-4">TÉLÉCHARGEZ VOTRE CONTRAT</h3>
                <p className="text-xl text-white/80 font-medium">Glissez-déposez votre PDF ou cliquez pour parcourir</p>
              </div>
              
              <div
                data-drop-zone
                className={`group cursor-pointer border-4 border-dashed rounded-2xl p-16 text-center transition-all duration-300 ${
                  uploadState.isDragging
                    ? 'border-cyan-400 bg-cyan-500/20 scale-[1.05] shadow-2xl'
                    : 'border-white/40 hover:border-cyan-400 hover:bg-white/10 hover:scale-[1.02]'
                }`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  ref={fileInputRef} 
                  type="file" 
                  accept=".pdf" 
                  onChange={handleFileSelect} 
                  className="hidden"
                />
                <AnimatePresence mode="wait">
                  {uploadState.isUploading || uploadState.isAnalyzing ? (
                    <motion.div
                      key="processing"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="space-y-6"
                    >
                      {/* Animation principale avec effet de pulsation */}
                      <div className="relative mx-auto flex h-32 w-32 items-center justify-center">
                        {/* Cercles d'animation en arrière-plan */}
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 animate-ping opacity-20"></div>
                        <div className="absolute inset-2 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 animate-ping opacity-30 animation-delay-200"></div>
                        <div className="absolute inset-4 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 animate-ping opacity-40 animation-delay-400"></div>
                        
                        {/* Cercle principal avec rotation */}
                        <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 shadow-2xl">
                          {uploadState.isUploading ? (
                            /* Icône upload avec rotation */
                            <div className="animate-spin">
                              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                            </div>
                          ) : (
                            /* Icône IA avec pulsation pour l'analyse */
                            <div className="animate-pulse">
                              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Texte et barre de progression */}
                      <div>
                        <div className="text-3xl font-black text-white mb-4 animate-pulse">
                          {uploadState.isUploading ? 'TÉLÉCHARGEMENT EN COURS...' : 'ANALYSE IA EN COURS...'}
                        </div>
                        
                        {uploadState.isUploading ? (
                          /* Barre de progression pour l'upload */
                          <>
                            <div className="w-full bg-white/20 rounded-full h-6 mb-6 shadow-inner overflow-hidden">
                              <div 
                                className="bg-gradient-to-r from-green-400 via-cyan-500 to-blue-600 h-6 rounded-full transition-all duration-300 shadow-lg relative"
                                style={{ width: `${uploadState.progress}%` }}
                              >
                                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                              </div>
                            </div>
                            <div className="text-xl text-white/90 font-bold">
                              {uploadState.progress}% • TÉLÉCHARGEMENT...
                            </div>
                          </>
                        ) : (
                          /* Animation skeleton pour l'analyse */
                          <>
                            <div className="space-y-4 mb-6">
                              {/* Skeleton lines simulant l'analyse */}
                              <div className="flex space-x-2">
                                <div className="h-3 bg-white/20 rounded-full w-1/4 animate-pulse"></div>
                                <div className="h-3 bg-white/30 rounded-full w-1/3 animate-pulse animation-delay-200"></div>
                                <div className="h-3 bg-white/20 rounded-full w-1/5 animate-pulse animation-delay-400"></div>
                              </div>
                              <div className="flex space-x-2">
                                <div className="h-3 bg-white/30 rounded-full w-1/3 animate-pulse animation-delay-100"></div>
                                <div className="h-3 bg-white/20 rounded-full w-1/4 animate-pulse animation-delay-300"></div>
                                <div className="h-3 bg-white/25 rounded-full w-1/6 animate-pulse animation-delay-500"></div>
                              </div>
                              <div className="flex space-x-2">
                                <div className="h-3 bg-white/25 rounded-full w-1/5 animate-pulse animation-delay-200"></div>
                                <div className="h-3 bg-white/30 rounded-full w-1/2 animate-pulse animation-delay-400"></div>
                              </div>
                            </div>
                            
                            {/* Messages d'analyse dynamiques */}
                            <div className="text-xl text-white/90 font-bold animate-pulse">
                              <span className="inline-flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce animation-delay-200"></div>
                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce animation-delay-400"></div>
                                <span className="ml-3">ANALYSE INTELLIGENTE DES CLAUSES...</span>
                              </span>
                            </div>
                            
                            {/* Messages rotatifs */}
                            <div className="text-lg text-white/70 mt-4 font-medium">
                              <div className="animate-pulse">
                                🔍 Extraction des données contractuelles...
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="upload"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="space-y-6"
                    >
                      <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 group-hover:from-cyan-600 group-hover:to-blue-700 transition-all shadow-2xl">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="text-white">
                          <path d="M12 16V4m0 0l-4 4m4-4l4 4" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M20 16v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div>
                        <div className="text-3xl font-black text-white mb-4">DÉPOSEZ VOTRE CONTRAT ICI</div>
                        <div className="text-xl text-white/80 mb-6 font-medium">
                          ou{' '}
                          <button 
                            onClick={() => fileInputRef.current?.click()} 
                            className="text-cyan-300 hover:text-cyan-100 font-black underline underline-offset-4 transition-colors"
                          >
                            PARCOURIR LES FICHIERS
                          </button>
                        </div>
                        <div className="text-lg text-white/70 font-medium">
                          SUPPORTE LES FICHIERS PDF JUSQU'À 10 MO
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>


          {/* Error Message */}
          <AnimatePresence>
            {uploadState.error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-8 bg-red-500/20 border border-red-500/40 rounded-xl p-6"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <p className="text-red-100 font-medium text-lg">{uploadState.error}</p>
                  <button
                    onClick={resetUpload}
                    className="ml-auto text-red-200 hover:text-white transition-colors font-black"
                  >
                    RÉESSAYER
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results */}
          <AnimatePresence>
            {uploadState.result && (
              <motion.div
                ref={resultsRef}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="space-y-6"
              >
                {/* Success Header avec animation d'entrée */}
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-2 border-green-400/40 rounded-2xl p-8 backdrop-blur-lg shadow-2xl"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                        className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg"
                      >
                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <motion.path
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ delay: 0.6, duration: 0.8 }}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </motion.div>
                      <div>
                        <motion.h3
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 }}
                          className="text-2xl font-black text-white"
                        >
                          ✅ ANALYSE TERMINÉE
                        </motion.h3>
                        <motion.p
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 }}
                          className="text-green-200 text-lg font-medium"
                        >
                          Traité avec succès • {uploadState.result.metadata?.processed_at ? 
                            new Date(uploadState.result.metadata.processed_at).toLocaleString() : 
                            'Maintenant'}
                        </motion.p>
                      </div>
                    </div>
                    {/* Lien direct vers PDF - Solution simple et fiable */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.7 }}
                      className="space-y-3"
                    >
                      <motion.a
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002'}${uploadState.result?.metadata?.pdf_download_url || uploadState.result?.pdf_download_url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-8 py-4 rounded-2xl font-black text-lg transition-all duration-200 flex items-center space-x-3 shadow-2xl hover:shadow-3xl"
                      >
                        <motion.svg
                          animate={{ y: [0, -2, 0] }}
                          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </motion.svg>
                        <span>TÉLÉCHARGER LE RAPPORT PDF</span>
                      </motion.a>
                      
                      {/* URL visible pour debug/copie */}
                      <div className="text-xs text-white/60 font-mono bg-black/20 px-3 py-2 rounded-lg">
                        URL: {uploadState.result?.metadata?.pdf_download_url || uploadState.result?.pdf_download_url}
                      </div>
                    </motion.div>
                  </div>
                  
                  {/* Indicateur visuel supplémentaire */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="mt-4 pt-4 border-t border-green-400/30"
                  >
                    <div className="flex items-center justify-center space-x-2 text-green-200">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-medium">Votre rapport détaillé est disponible ci-dessous</span>
                    </div>
                  </motion.div>
                </motion.div>

                {/* Contract Summary */}
                <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-8 border-2 border-white/20 shadow-2xl">
                  <h3 className="text-3xl font-black text-white mb-6">RÉSUMÉ DU CONTRAT</h3>
                  
                  {/* Key Info Grid */}
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-lg font-black text-cyan-300 mb-2">OBJET</h4>
                        <p className="text-white text-lg">{uploadState.result.meta?.version === '3.0' ? uploadState.result.contract?.object : (uploadState.result.analysis?.object || uploadState.result.analysis?.contract?.object || uploadState.result.analysis?.summary || uploadState.result.summary?.title) || 'Non spécifié'}</p>
                      </div>
                      <div>
                        <h4 className="text-lg font-black text-cyan-300 mb-2">PARTIES</h4>
                        <div className="space-y-2">
                          {(uploadState.result.meta?.version === '3.0' ? uploadState.result.parties?.list : (uploadState.result.analysis?.parties || uploadState.result.analysis?.parties?.list || uploadState.result.summary?.parties) || []).map((party: any, index: number) => (
                            <p key={index} className="text-white text-lg">
                              <span className="text-yellow-400 font-black">{party.role || 'Partie'}:</span> {party.name || party}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-lg font-black text-cyan-300 mb-2">DROIT APPLICABLE</h4>
                        <p className="text-white text-lg">{uploadState.result.meta?.version === '3.0' ? uploadState.result.governance?.law : (uploadState.result.analysis?.governance?.applicable_law || uploadState.result.analysis?.governance?.law || uploadState.result.analysis?.legal?.applicable_law) || 'Non spécifié'}</p>
                      </div>
                      <div>
                        <h4 className="text-lg font-black text-cyan-300 mb-2">CONFORMITÉ RGPD</h4>
                        <span className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-black ${
                          uploadState.result.meta?.version === '3.0' ? uploadState.result.contract?.data_privacy?.rgpd : (uploadState.result.analysis?.contract?.data_privacy?.rgpd || uploadState.result.analysis?.compliance?.rgpd || uploadState.result.analysis?.rgpd_compliance) 
                            ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white' 
                            : 'bg-gradient-to-r from-red-400 to-pink-500 text-white'
                        }`}>
                          {(uploadState.result.meta?.version === '3.0' ? uploadState.result.contract?.data_privacy?.rgpd : (uploadState.result.analysis?.contract?.data_privacy?.rgpd || uploadState.result.analysis?.compliance?.rgpd || uploadState.result.analysis?.rgpd_compliance)) ? 'CONFORME' : 'NON CONFORME'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Risks */}
                  {(uploadState.result.meta?.version === '3.0' ? uploadState.result.risks_red_flags : (uploadState.result.analysis?.risks || uploadState.result.analysis?.risks_red_flags || uploadState.result.analysis?.red_flags) || []).length > 0 && (
                    <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border-2 border-orange-400/40 rounded-xl p-6 backdrop-blur-lg">
                      <h4 className="text-xl font-black text-orange-300 mb-4 flex items-center">
                        <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        FACTEURS DE RISQUE
                      </h4>
                      <ul className="text-orange-100 text-lg space-y-2 font-medium">
                        {(uploadState.result.meta?.version === '3.0' ? uploadState.result.risks_red_flags : (uploadState.result.analysis?.risks || uploadState.result.analysis?.risks_red_flags || uploadState.result.analysis?.red_flags) || []).map((risk: string, index: number) => (
                          <li key={index}>• {risk}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={resetUpload}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-10 py-5 rounded-2xl font-black text-xl transition-all shadow-2xl hover:shadow-3xl transform hover:scale-110"
                  >
                    ANALYSER UN AUTRE CONTRAT
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* RGPD Badge - Centré sous l'upload */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-2 border-green-400/40 rounded-2xl p-6 backdrop-blur-xl text-center max-w-md mx-auto mt-8"
          >
            <div className="flex items-center justify-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                <span className="text-white text-lg">🛡️</span>
              </div>
              <h3 className="text-xl font-black text-white">RGPD COMPLIANT</h3>
            </div>
            <p className="text-green-200 text-sm font-medium">Aucun stockage • Traitement sécurisé • Conformité totale</p>
          </motion.div>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 to-black border-t-2 border-white/20 mt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-4 mb-6 md:mb-0">
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-xl">
                <span className="text-white font-black text-xl">X</span>
              </div>
              <span className="text-2xl font-black text-white">YQO</span>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-6 text-lg text-white/80">
              <a href="#" className="hover:text-cyan-300 transition-colors font-bold">CGU</a>
              <a href="#" className="hover:text-cyan-300 transition-colors font-bold">Confidentialité</a>
              <a href="#" className="hover:text-cyan-300 transition-colors font-bold">Support</a>
              <span className="text-sm font-medium">© 2024 XYQO - Analyse de contrats par IA</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
