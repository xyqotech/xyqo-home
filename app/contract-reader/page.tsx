'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AnalysisResult {
  success: boolean;
  analysis?: any;
  summary?: any;
  metadata?: {
    filename: string;
    analysis_id: string;
    download_url: string;
    processed_at: string;
  };
  processing_id?: string;
  pdf_download_url?: string;
  processing_time?: number;
  cost_euros?: number;
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

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setUploadState(prev => ({ ...prev, isDragging: true }));
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setUploadState(prev => ({ ...prev, isDragging: false }));
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setUploadState(prev => ({ ...prev, isDragging: false }));
    
    const files = Array.from(e.dataTransfer.files);
    const pdfFile = files.find(file => file.type === 'application/pdf');
    
    if (pdfFile) {
      handleFileUpload(pdfFile);
    } else {
      setUploadState(prev => ({ 
        ...prev, 
        error: 'Veuillez sélectionner un fichier PDF valide' 
      }));
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  }, []);

  const handleFileUpload = async (file: File) => {
    console.log('🔄 Début upload fichier:', file.name, file.size, 'bytes');
    
    setUploadState(prev => ({ 
      ...prev, 
      isUploading: true, 
      isAnalyzing: false,
      progress: 0, 
      error: null, 
      result: null 
    }));

    let timeoutId: NodeJS.Timeout | null = null;

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
        progress: 0 
      }));

      // Appel API avec debug
      const formData = new FormData();
      formData.append('file', file);
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://xyqo-home.onrender.com';
      console.log('🌐 URL API:', apiUrl);
      console.log('📤 Envoi vers:', `${apiUrl}/api/v1/contract/analyze`);
      
      const controller = new AbortController();
      timeoutId = setTimeout(() => {
        console.log('⏰ Timeout déclenché après 30s');
        controller.abort();
      }, 30000);
      
      console.log('📡 Début requête fetch...');
      const response = await fetch(`${apiUrl}/api/v1/contract/analyze`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
        mode: 'cors',
        credentials: 'omit',
        signal: controller.signal,
      });
      
      if (timeoutId) clearTimeout(timeoutId);
      console.log('📥 Réponse reçue:', response.status, response.statusText);
      console.log('📋 Headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erreur réponse:', errorText);
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const result: AnalysisResult = await response.json();
      console.log('✅ Résultat reçu:', result);

      setUploadState(prev => ({ 
        ...prev, 
        isAnalyzing: false, 
        result,
        progress: 100 
      }));

    } catch (error) {
      if (timeoutId) clearTimeout(timeoutId);
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

  const handleDownloadPDF = async () => {
    const downloadUrl = uploadState.result?.metadata?.download_url || uploadState.result?.pdf_download_url;
    const analysisId = uploadState.result?.metadata?.analysis_id || uploadState.result?.processing_id;
    
    if (!downloadUrl && !uploadState.result) {
      console.error('Aucune analyse disponible pour générer le PDF');
      return;
    }
    
    // Si pas d'URL de téléchargement, générer directement le PDF de fallback
    if (!downloadUrl) {
      console.log('🔄 Pas d\'URL de téléchargement, génération PDF directe...');
      generateFallbackPDF();
      return;
    }

    try {
      console.log('🔄 Tentative de téléchargement PDF:', downloadUrl);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://xyqo-home.onrender.com';
      const fullUrl = `${apiUrl}${downloadUrl}`;
      
      console.log('📡 URL complète:', fullUrl);
      const response = await fetch(fullUrl);
      
      console.log('📥 Réponse téléchargement:', response.status, response.statusText);
      
      if (!response.ok) {
        console.error('❌ Erreur téléchargement:', response.status, response.statusText);
        
        // Si l'endpoint n'existe pas, générer un PDF de fallback
        if (response.status === 404) {
          console.log('🔄 Génération PDF de fallback...');
          generateFallbackPDF();
          return;
        }
        
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      console.log('📄 PDF reçu, taille:', blob.size, 'bytes');
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `resume_contrat_${analysisId || 'analyse'}.pdf`;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      
      // Ouvrir aussi le PDF dans le navigateur pour visualisation
      setTimeout(() => {
        window.open(url, '_blank');
      }, 100);
      
      // Nettoyer après un délai pour permettre l'ouverture
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 1000);
      
    } catch (error) {
      console.error('💥 Erreur téléchargement PDF:', error);
      
      // En cas d'erreur, générer un PDF de fallback
      console.log('🔄 Génération PDF de fallback suite à l\'erreur...');
      generateFallbackPDF();
    }
  };

  const generateFallbackPDF = async () => {
    try {
      const result = uploadState.result;
      if (!result) return;

      // Import jsPDF dynamiquement
      const { jsPDF } = await import('jspdf');
      
      // Créer un nouveau document PDF
      const doc = new jsPDF();
      
      // Configuration des couleurs et styles
      const primaryColor = [30, 64, 175] as const; // Bleu XYQO
      const textColor = [17, 24, 39] as const; // Gris foncé
      const lightGray = [107, 114, 128] as const; // Gris clair
      
      let yPosition = 20;
      
      // En-tête
      doc.setFontSize(20);
      doc.setTextColor(...primaryColor);
      doc.text('RAPPORT D\'ANALYSE CONTRACTUELLE', 105, yPosition, { align: 'center' });
      
      yPosition += 10;
      doc.setFontSize(12);
      doc.setTextColor(...lightGray);
      doc.text(`XYQO Contract Reader - ${new Date().toLocaleDateString('fr-FR')}`, 105, yPosition, { align: 'center' });
      
      yPosition += 20;
      
      // Section Informations Générales
      doc.setFontSize(14);
      doc.setTextColor(...primaryColor);
      doc.text('INFORMATIONS GÉNÉRALES', 20, yPosition);
      yPosition += 10;
      
      doc.setFontSize(10);
      doc.setTextColor(...textColor);
      
      const contractInfo = [
        ['Objet:', result.analysis?.contract?.object || result.summary?.title || 'Non spécifié'],
        ['Type:', result.analysis?.contract?.type || result.summary?.contract_type || 'Non spécifié'],
        ['Langue:', result.analysis?.contract?.language || 'Français'],
        ['Traité le:', result.metadata?.processed_at ? new Date(result.metadata.processed_at).toLocaleString('fr-FR') : new Date().toLocaleString('fr-FR')]
      ];
      
      contractInfo.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(label, 25, yPosition);
        doc.setFont('helvetica', 'normal');
        doc.text(value, 70, yPosition);
        yPosition += 6;
      });
      
      yPosition += 10;
      
      // Section Parties Contractuelles
      doc.setFontSize(14);
      doc.setTextColor(...primaryColor);
      doc.text('PARTIES CONTRACTUELLES', 20, yPosition);
      yPosition += 10;
      
      doc.setFontSize(10);
      doc.setTextColor(...textColor);
      
      const parties = result.analysis?.parties?.list || result.summary?.parties || ['Partie A', 'Partie B'];
      parties.forEach((party: any, index: number) => {
        const partyName = typeof party === 'string' ? party : party.name || `Partie ${index + 1}`;
        const partyRole = typeof party === 'object' && party.role ? ` (${party.role})` : '';
        
        doc.setFont('helvetica', 'bold');
        doc.text(`Partie ${index + 1}:`, 25, yPosition);
        doc.setFont('helvetica', 'normal');
        doc.text(`${partyName}${partyRole}`, 70, yPosition);
        yPosition += 6;
      });
      
      yPosition += 10;
      
      // Section Aspects Financiers
      doc.setFontSize(14);
      doc.setTextColor(...primaryColor);
      doc.text('ASPECTS FINANCIERS', 20, yPosition);
      yPosition += 10;
      
      doc.setFontSize(10);
      doc.setTextColor(...textColor);
      
      const financialInfo = [
        ['Montant:', result.analysis?.financial?.amount || 'Non spécifié'],
        ['Devise:', result.analysis?.financial?.currency || 'EUR'],
        ['Conditions:', result.analysis?.financial?.payment_terms || 'Non spécifié']
      ];
      
      financialInfo.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(label, 25, yPosition);
        doc.setFont('helvetica', 'normal');
        doc.text(value, 70, yPosition);
        yPosition += 6;
      });
      
      yPosition += 10;
      
      // Section Facteurs de Risque (si présents)
      const risks = result.analysis?.risks_red_flags || [];
      if (risks.length > 0) {
        doc.setFontSize(14);
        doc.setTextColor(...primaryColor);
        doc.text('FACTEURS DE RISQUE', 20, yPosition);
        yPosition += 10;
        
        doc.setFontSize(10);
        doc.setTextColor(...textColor);
        
        risks.forEach((risk: string) => {
          // Gérer les textes longs avec wrapping
          const lines = doc.splitTextToSize(`• ${risk}`, 160);
          lines.forEach((line: string) => {
            if (yPosition > 270) { // Nouvelle page si nécessaire
              doc.addPage();
              yPosition = 20;
            }
            doc.text(line, 25, yPosition);
            yPosition += 6;
          });
        });
        
        yPosition += 10;
      }
      
      // Pied de page
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      
      yPosition += 20;
      doc.setFontSize(9);
      doc.setTextColor(...lightGray);
      doc.text('Rapport généré par XYQO Contract Reader', 105, yPosition, { align: 'center' });
      yPosition += 5;
      doc.text(`ID de traitement: ${result.metadata?.analysis_id || result.processing_id || 'N/A'}`, 105, yPosition, { align: 'center' });
      yPosition += 5;
      doc.text(`Temps de traitement: ${result.processing_time || 'N/A'}s • Coût: ${result.cost_euros || 'N/A'}€`, 105, yPosition, { align: 'center' });
      
      // Télécharger le PDF
      const analysisId = result.metadata?.analysis_id || result.processing_id || 'analyse';
      const filename = `rapport_contrat_${analysisId}_${new Date().toISOString().split('T')[0]}.pdf`;
      
      doc.save(filename);
      
      console.log('✅ PDF généré et téléchargé avec succès:', filename);
      
    } catch (error) {
      console.error('❌ Erreur génération PDF:', error);
      alert('Impossible de générer le rapport PDF. Veuillez réessayer.');
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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
            <div className="flex items-center space-x-6">
              <div className="w-14 h-14 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-xl">
                <span className="text-white font-black text-2xl">X</span>
              </div>
              <div className="flex items-center space-x-4">
                <h1 className="text-3xl font-black text-white tracking-tight">XYQO Contract Reader</h1>
                <span className="bg-gradient-to-r from-green-400 to-emerald-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                  🛡️ RGPD COMPLIANT
                </span>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center space-x-10">
              <a href="#" className="text-white/90 hover:text-cyan-300 font-bold text-lg transition-colors">Fonctionnalités</a>
              <a href="#" className="text-white/90 hover:text-cyan-300 font-bold text-lg transition-colors">Tarifs</a>
              <a href="#" className="text-white/90 hover:text-cyan-300 font-bold text-lg transition-colors">Documentation</a>
              <button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-black text-lg transition-all shadow-xl hover:shadow-2xl transform hover:scale-105">
                COMMENCER
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Hero Section */}
        <section className="lg:col-span-8">
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
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-12 py-6 rounded-2xl text-2xl font-black transition-all duration-200 shadow-2xl hover:shadow-3xl transform hover:scale-110">
                ANALYSE GRATUITE
              </button>
              <button className="text-white hover:text-cyan-300 px-12 py-6 rounded-2xl text-2xl font-bold transition-colors flex items-center space-x-3 border-2 border-white/30 hover:border-cyan-300">
                <span>🎥</span>
                <span>VOIR LA DÉMO</span>
              </button>
            </div>
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
                className={`group cursor-pointer border-4 border-dashed rounded-2xl p-16 text-center transition-all duration-300 ${
                  uploadState.isDragging
                    ? 'border-cyan-400 bg-cyan-500/20 scale-[1.05] shadow-2xl'
                    : 'border-white/40 hover:border-cyan-400 hover:bg-white/10 hover:scale-[1.02]'
                }`}
              >
                <input 
                  ref={fileInputRef} 
                  type="file" 
                  accept=".pdf" 
                  onChange={handleFileSelect} 
                  className="hidden"
                />
                <AnimatePresence mode="wait">
                  {uploadState.isUploading ? (
                    <motion.div
                      key="uploading"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="space-y-6"
                    >
                      <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 animate-spin shadow-2xl">
                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-3xl font-black text-white mb-4">
                          {uploadState.status || 'ANALYSE DE VOTRE CONTRAT...'}
                        </div>
                        <div className="w-full bg-white/20 rounded-full h-6 mb-6 shadow-inner">
                          <div 
                            className="bg-gradient-to-r from-green-400 via-cyan-500 to-blue-600 h-6 rounded-full transition-all duration-300 shadow-lg"
                            style={{ width: `${uploadState.progress}%` }}
                          />
                        </div>
                        <div className="text-xl text-white/90 font-bold">
                          {uploadState.progress}% • ANALYSE IA EN COURS...
                        </div>
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

          {/* Sample Contract CTA */}
          <div className="text-center mb-20">
            <button
              onClick={handleSampleContract}
              className="inline-flex items-center space-x-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-10 py-5 rounded-2xl font-black text-xl transition-all shadow-2xl hover:shadow-3xl transform hover:scale-110"
            >
              <span className="text-2xl">📄</span>
              <span>ESSAYER AVEC UN CONTRAT EXEMPLE</span>
            </button>
            <p className="text-lg text-white/80 mt-6 max-w-2xl mx-auto font-medium">
              🔒 AUCUNE DONNÉE STOCKÉE • 🛡️ TRAITEMENT SÉCURISÉ • 📊 TÉLÉCHARGEMENT PDF ET JSON STRUCTURÉ
            </p>
          </div>

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
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="space-y-6"
              >
                {/* Success Header */}
                <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-2 border-green-400/40 rounded-2xl p-8 backdrop-blur-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-white">ANALYSE TERMINÉE</h3>
                        <p className="text-green-200 text-lg font-medium">
                          Traité avec succès • {uploadState.result.metadata?.processed_at ? 
                            new Date(uploadState.result.metadata.processed_at).toLocaleString() : 
                            'Maintenant'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleDownloadPDF}
                      className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-8 py-4 rounded-2xl font-black text-lg transition-all duration-200 flex items-center space-x-3 shadow-2xl hover:shadow-3xl transform hover:scale-105"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>TÉLÉCHARGER LE RAPPORT PDF</span>
                    </button>
                  </div>
                </div>

                {/* Contract Summary */}
                <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-8 border-2 border-white/20 shadow-2xl">
                  <h3 className="text-3xl font-black text-white mb-6">RÉSUMÉ DU CONTRAT</h3>
                  
                  {/* Key Info Grid */}
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-lg font-black text-cyan-300 mb-2">OBJET</h4>
                        <p className="text-white text-lg">{uploadState.result.analysis?.contract?.object || uploadState.result.analysis?.summary || uploadState.result.summary?.title || 'Non spécifié'}</p>
                      </div>
                      <div>
                        <h4 className="text-lg font-black text-cyan-300 mb-2">PARTIES</h4>
                        <div className="space-y-2">
                          {(uploadState.result.analysis?.parties || uploadState.result.analysis?.parties?.list || uploadState.result.summary?.parties || []).map((party: any, index: number) => (
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
                        <p className="text-white text-lg">{uploadState.result.analysis?.governance?.applicable_law || uploadState.result.analysis?.governance?.law || uploadState.result.analysis?.legal?.applicable_law || 'Non spécifié'}</p>
                      </div>
                      <div>
                        <h4 className="text-lg font-black text-cyan-300 mb-2">CONFORMITÉ RGPD</h4>
                        <span className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-black ${
                          uploadState.result.analysis?.contract?.data_privacy?.rgpd || uploadState.result.analysis?.compliance?.rgpd || uploadState.result.analysis?.rgpd_compliance 
                            ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white' 
                            : 'bg-gradient-to-r from-red-400 to-pink-500 text-white'
                        }`}>
                          {(uploadState.result.analysis?.contract?.data_privacy?.rgpd || uploadState.result.analysis?.compliance?.rgpd || uploadState.result.analysis?.rgpd_compliance) ? 'CONFORME' : 'NON CONFORME'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Risks */}
                  {(uploadState.result.analysis?.risks_red_flags || uploadState.result.analysis?.risks || uploadState.result.analysis?.red_flags || []).length > 0 && (
                    <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border-2 border-orange-400/40 rounded-xl p-6 backdrop-blur-lg">
                      <h4 className="text-xl font-black text-orange-300 mb-4 flex items-center">
                        <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        FACTEURS DE RISQUE
                      </h4>
                      <ul className="text-orange-100 text-lg space-y-2 font-medium">
                        {(uploadState.result.analysis?.risks_red_flags || uploadState.result.analysis?.risks || uploadState.result.analysis?.red_flags || []).map((risk: string, index: number) => (
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
        </section>

        {/* Features Sidebar */}
        <aside className="lg:col-span-4 hidden lg:block">
          <div className="space-y-8">
            {/* Pricing Cards */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl shadow-2xl border-2 border-white/20 p-8"
            >
              <h3 className="text-2xl font-black text-white mb-8">TARIFS FLEXIBLES</h3>
              <div className="space-y-6">
                <div className="border-2 border-cyan-400/40 rounded-xl p-6 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-black text-white text-lg">GRATUIT</h4>
                    <span className="text-3xl font-black text-cyan-300">0€</span>
                  </div>
                  <p className="text-lg text-white/80 mb-4 font-medium">Parfait pour essayer</p>
                  <ul className="text-white/90 space-y-2 font-medium">
                    <li>✓ 5 contrats/mois</li>
                    <li>✓ Analyse de base</li>
                    <li>✓ Export PDF</li>
                  </ul>
                </div>
                
                <div className="border-2 border-yellow-400 rounded-xl p-6 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-lg relative">
                  <div className="absolute -top-3 left-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-sm px-4 py-1 rounded-full font-black">
                    POPULAIRE
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-black text-white text-lg">PRO</h4>
                    <span className="text-3xl font-black text-yellow-300">29€</span>
                  </div>
                  <p className="text-lg text-white/80 mb-4 font-medium">Pour les professionnels</p>
                  <ul className="text-white/90 space-y-2 font-medium">
                    <li>✓ Contrats illimités</li>
                    <li>✓ Analyse IA avancée</li>
                    <li>✓ Accès API</li>
                    <li>✓ Support prioritaire</li>
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* Features Block */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl shadow-2xl border-2 border-white/20 p-8"
            >
              <h3 className="text-2xl font-black text-white mb-8">POURQUOI CHOISIR XYQO ?</h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <span className="text-2xl">🤖</span>
                  </div>
                  <div>
                    <h4 className="font-black text-white text-lg mb-2">ANALYSE PAR IA</h4>
                    <p className="text-white/80 font-medium">NLP avancé pour une analyse précise des contrats</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <span className="text-2xl">📄</span>
                  </div>
                  <div>
                    <h4 className="font-black text-white text-lg mb-2">RAPPORTS PROFESSIONNELS</h4>
                    <p className="text-white/80 font-medium">Résumés exécutifs + JSON structuré</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <span className="text-2xl">🛡️</span>
                  </div>
                  <div>
                    <h4 className="font-black text-white text-lg mb-2">CONFORME RGPD</h4>
                    <p className="text-white/80 font-medium">Aucun stockage, traitement sécurisé</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </aside>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 to-black border-t-2 border-white/20 mt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-4 mb-6 md:mb-0">
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-xl">
                <span className="text-white font-black text-xl">X</span>
              </div>
              <span className="text-2xl font-black text-white">XYQO Contract Reader</span>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-6 text-lg text-white/80">
              <a href="#" className="hover:text-cyan-300 transition-colors font-bold">CGU</a>
              <a href="#" className="hover:text-cyan-300 transition-colors font-bold">Confidentialité</a>
              <a href="#" className="hover:text-cyan-300 transition-colors font-bold">Support</a>
              <span className="text-sm font-medium">Propulsé par FastAPI • GPT-4o-mini • Claude</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
