import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Utiliser un contrat de test générique
    const sampleContractPath = path.join(process.cwd(), 'test-contracts', 'contrat_exemple_generique.txt');
    
    if (fs.existsSync(sampleContractPath)) {
      const fileBuffer = fs.readFileSync(sampleContractPath);
      
      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain',
          'Content-Disposition': 'attachment; filename="contrat_exemple_XYQO.txt"',
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
