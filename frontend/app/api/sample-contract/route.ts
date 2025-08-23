import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Utiliser le contrat de test existant depuis le backend
    const sampleContractPath = '/Users/bassiroudiop/autopilot-demo/data/samples/contrat_SCF_JAS_WORK4YOU_28022023_01_DIOP_Bassirou.pdf';
    
    if (fs.existsSync(sampleContractPath)) {
      const fileBuffer = fs.readFileSync(sampleContractPath);
      
      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="contrat_exemple_XYQO.pdf"',
          'Cache-Control': 'public, max-age=3600'
        }
      });
    } else {
      return NextResponse.json(
        { error: 'Contrat exemple non trouvé' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Erreur lors du chargement du contrat exemple:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
