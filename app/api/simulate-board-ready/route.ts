import { NextRequest, NextResponse } from 'next/server';

// Simulateur Board-Ready V2.3 pour tests locaux
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }

    // Simulation d'analyse avec délai réaliste
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Données Board-Ready V2.3 simulées selon le type de contrat
    const filename = file.name.toLowerCase();
    let mockAnalysis;

    if (filename.includes('saas') || filename.includes('it')) {
      mockAnalysis = generateSaaSBoardReady();
    } else if (filename.includes('bail') || filename.includes('commercial')) {
      mockAnalysis = generateBailBoardReady();
    } else if (filename.includes('emploi') || filename.includes('cdi')) {
      mockAnalysis = generateEmploiBoardReady();
    } else {
      mockAnalysis = generateGenericBoardReady();
    }

    return NextResponse.json({
      success: true,
      analysis: mockAnalysis,
      message: "✅ Analyse Board-Ready V2.3 simulée avec succès"
    });

  } catch (error) {
    console.error('Erreur simulation Board-Ready:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de la simulation' 
    }, { status: 500 });
  }
}

function generateSaaSBoardReady() {
  return {
    meta: {
      generator: "YQO-AI-Board-V2.3",
      version: "3.0",
      language: "fr",
      generated_at: new Date().toISOString(),
      locale_guess: "fr_FR",
      source_doc_info: {
        filename: "contrat_saas_test.pdf",
        pages: 8,
        version_label: "Conforme" // Statut RGPD dérivé
      },
      metrics: {
        latency_ms: 2847,
        input_chars: 15420,
        cost_estimate_eur: 0.12,
        coverage_pct: 89.5
      }
    },
    classification: {
      family: "prestation_it_saas",
      subfamily: "saas_b2b",
      parties_type: "B2B",
      sector: "technologie",
      confidence: 0.92,
      explanation: "Contrat SaaS B2B avec DPA RGPD conforme"
    },
    parties: {
      list: [
        {
          role: "Prestataire",
          name: "CloudTech Solutions SAS",
          legal_form: "SAS",
          address: "15 rue de la Paix, 75001 Paris",
          contact: "contact@cloudtech.fr"
        },
        {
          role: "Client",
          name: "InnovCorp SARL",
          legal_form: "SARL",
          address: "42 avenue des Champs, 69000 Lyon"
        }
      ]
    },
    contract: {
      object: "Prestation de développement et hébergement solution SaaS CRM",
      scope: {
        description: "Développement, hébergement et maintenance d'une solution CRM cloud",
        deliverables: [
          "Plateforme SaaS CRM complète",
          "Interface d'administration",
          "API REST documentée",
          "Formation utilisateurs"
        ]
      },
      dates: {
        signature_date: "2024-01-15",
        start_date: "2024-02-01",
        end_date: "2025-01-31",
        notice_period_days: 90
      },
      data_privacy: {
        rgpd: true,
        dpa: {
          present: true,
          processing_roles: "Sous-traitant",
          transfers_outside_EU: false
        }
      },
      service_levels: {
        sla: "99.9% disponibilité garantie",
        penalties: "Pénalités 5% du montant mensuel par tranche de 0.1% en dessous"
      }
    },
    financials: {
      price_model: "Abonnement mensuel avec setup",
      items: [
        { label: "Setup initial", amount: 5000.0, period: "unique" },
        { label: "Licence SaaS mensuelle", amount: 2500.0, period: "mensuel" },
        { label: "Support premium", amount: 500.0, period: "mensuel" }
      ],
      currency: "EUR",
      payment_terms: "Paiement à 30 jours fin de mois"
    },
    governance: {
      termination: {
        by_provider: "Résiliation pour faute avec préavis 30 jours",
        by_customer: "Résiliation libre avec préavis 3 mois"
      },
      liability: "Responsabilité limitée au montant des prestations",
      law: "Droit français",
      jurisdiction: "Tribunaux de Paris",
      confidentiality: true
    },
    summary_plain: "Contrat SaaS entre CloudTech et InnovCorp pour développement CRM cloud. Durée 12 mois, 3000€/mois après setup 5000€. DPA RGPD conforme, SLA 99.9%, hébergement France.",
    risks_red_flags: [],
    missing_info: ["clause_reversibilite_detaillee"],
    
    // ✨ NOUVEAUX CHAMPS BOARD-READY V2.3
    section_confidence: {
      parties: 0.98,
      contract: 0.94,
      financials: 0.96,
      governance: 0.88,
      data_privacy: 0.91
    },
    evidence: {
      citations: [
        {
          field_path: "contract.data_privacy.dpa.processing_roles",
          page: 3,
          snippet: "CloudTech agit en qualité de sous-traitant au sens de l'article 28 du RGPD"
        },
        {
          field_path: "contract.service_levels.sla",
          page: 5,
          snippet: "Garantie de disponibilité de 99,9% calculée sur base mensuelle"
        }
      ]
    },
    extensions: {
      it_services_fr: {
        sla: "99.9% disponibilité avec monitoring 24/7",
        hosting: "Serveurs France - Datacenter OVH Roubaix",
        security_measures: ["Chiffrement AES-256", "Authentification 2FA", "Logs d'audit", "Sauvegarde quotidienne"],
        reversibility: "Export données JSON/CSV sous 30 jours après résiliation"
      }
    },
    operational_actions: {
      jira_summary: "OK sous réserve",
      calendar_events: ["Revue trimestrielle SLA", "Audit sécurité annuel"],
      follow_up_dates: ["2024-05-01", "2024-08-01"]
    },
    
    // Recommandation enrichie (ajoutée par utils)
    __recommendation: {
      label: "OK sous réserve",
      actions: [
        "Préciser clause de réversibilité détaillée",
        "Valider procédures de sauvegarde"
      ]
    }
  };
}

function generateBailBoardReady() {
  return {
    meta: {
      generator: "YQO-AI-Board-V2.3",
      version: "3.0", 
      language: "fr",
      generated_at: new Date().toISOString(),
      source_doc_info: {
        filename: "bail_commercial_test.pdf",
        pages: 12,
        version_label: "N/A" // Pas de DPA nécessaire
      },
      metrics: {
        latency_ms: 3124,
        input_chars: 18750,
        coverage_pct: 94.2
      }
    },
    classification: {
      family: "bail",
      subfamily: "commercial",
      parties_type: "B2B",
      confidence: 0.96,
      explanation: "Bail commercial 3-6-9 avec indice ILC conforme"
    },
    parties: {
      list: [
        {
          role: "Bailleur",
          name: "SCI Immobilier Plus",
          legal_form: "SCI",
          address: "10 rue de Rivoli, 75001 Paris"
        },
        {
          role: "Preneur",
          name: "Boutique Mode SARL",
          legal_form: "SARL",
          address: "Même adresse que les locaux loués"
        }
      ]
    },
    contract: {
      object: "Bail commercial - Local commercial rue de Rivoli",
      location_or_site: "45 rue de Rivoli, 75001 Paris - RDC 120m²",
      dates: {
        signature_date: "2024-01-10",
        start_date: "2024-02-01", 
        end_date: "2033-01-31"
      },
      lease_commercial: {
        index_enum: "ILC",
        destination: "Commerce de détail textile et accessoires"
      }
    },
    financials: {
      price_model: "Loyer fixe avec révision annuelle",
      items: [
        { label: "Loyer mensuel", amount: 4500.0, period: "mensuel" },
        { label: "Charges mensuelles", amount: 300.0, period: "mensuel" },
        { label: "Dépôt de garantie", amount: 13500.0, period: "unique" }
      ],
      currency: "EUR",
      indexation: "Révision annuelle selon ILC base 100 au 1er trimestre 2015",
      payment_terms: "Paiement terme à échoir le 1er de chaque mois"
    },
    governance: {
      law: "Code de commerce français",
      jurisdiction: "Tribunal de commerce de Paris"
    },
    summary_plain: "Bail commercial 3-6-9 pour boutique mode rue de Rivoli. Loyer 4500€/mois + charges 300€. Révision ILC, durée 9 ans avec résiliation triennale.",
    risks_red_flags: [],
    missing_info: [],
    
    section_confidence: {
      parties: 0.99,
      contract: 0.95,
      financials: 0.93,
      governance: 0.87
    },
    evidence: {
      citations: [
        {
          field_path: "contract.lease_commercial.index_enum",
          page: 4,
          snippet: "Le loyer sera révisé selon l'ILC publié par l'INSEE"
        },
        {
          field_path: "contract.lease_commercial.destination",
          page: 2,
          snippet: "Destination exclusive: commerce de détail textile"
        }
      ]
    },
    extensions: {
      lease_fr: {
        lease_type: "commercial_3_6_9",
        commercial_3_6_9: true
      }
    },
    operational_actions: {
      jira_summary: "Conforme",
      calendar_events: ["Révision loyer annuelle ILC"]
    },
    
    __recommendation: {
      label: "Conforme",
      actions: []
    }
  };
}

function generateEmploiBoardReady() {
  return {
    meta: {
      generator: "YQO-AI-Board-V2.3",
      version: "3.0",
      language: "fr", 
      generated_at: new Date().toISOString(),
      source_doc_info: {
        filename: "cdi_incomplet_test.pdf",
        pages: 4,
        version_label: "N/A"
      },
      metrics: {
        latency_ms: 2156,
        input_chars: 8420,
        coverage_pct: 67.8
      }
    },
    classification: {
      family: "emploi",
      subfamily: "cdi",
      parties_type: "B2C",
      confidence: 0.73,
      explanation: "CDI avec informations manquantes - confiance réduite"
    },
    parties: {
      list: [
        {
          role: "Employeur",
          name: "TechStart SARL",
          legal_form: "SARL",
          address: "25 rue du Commerce, 75015 Paris"
        },
        {
          role: "Salarié",
          name: "Jean Dupont",
          address: "12 avenue de la République, 92100 Boulogne"
        }
      ]
    },
    contract: {
      object: "Contrat de travail - Développeur Full Stack",
      dates: {
        start_date: "2024-03-01"
      },
      consumer_rights: {} // ❌ Manque cooling_off_applicable
    },
    financials: {
      items: [] // ❌ Rémunération manquante
    },
    summary_plain: "CDI développeur chez TechStart. Informations importantes manquantes: rémunération, période d'essai, droit de rétractation B2C.",
    risks_red_flags: [
      "b2c_cooling_off_missing",
      "employment_missing_probation", 
      "employment_missing_remuneration"
    ],
    missing_info: [
      "remuneration_details",
      "probation_period",
      "cooling_off_rights",
      "working_hours",
      "benefits"
    ],
    
    section_confidence: {
      parties: 0.92,
      contract: 0.65,
      financials: 0.15, // Très faible - pas de rémunération
      governance: 0.45
    },
    evidence: {
      citations: [
        {
          field_path: "contract.object",
          page: 1,
          snippet: "Poste: Développeur Full Stack - Équipe produit"
        }
      ]
    },
    extensions: {
      employment_fr: {
        contract_type: "CDI"
        // ❌ Manque probation_months
      }
    },
    operational_actions: {
      jira_summary: "Escalade revue experte",
      follow_up_dates: ["2024-02-20"] // Avant signature
    },
    
    __recommendation: {
      label: "Escalade revue experte",
      actions: [
        "Compléter rémunération et avantages",
        "Définir période d'essai légale",
        "Ajouter clause droit de rétractation B2C"
      ]
    }
  };
}

function generateGenericBoardReady() {
  return {
    meta: {
      generator: "YQO-AI-Board-V2.3",
      version: "3.0",
      language: "fr",
      generated_at: new Date().toISOString(),
      source_doc_info: {
        filename: "contrat_generique_test.pdf", 
        pages: 6,
        version_label: "À vérifier"
      },
      metrics: {
        latency_ms: 2634,
        input_chars: 12340,
        coverage_pct: 78.5
      }
    },
    classification: {
      family: "prestation_services",
      parties_type: "B2B",
      confidence: 0.81,
      explanation: "Contrat de prestation générique"
    },
    parties: {
      list: [
        {
          role: "Prestataire",
          name: "Services Pro SARL"
        },
        {
          role: "Client", 
          name: "Entreprise Cliente SA"
        }
      ]
    },
    contract: {
      object: "Prestation de services professionnels"
    },
    financials: {
      price_model: "Forfait",
      items: [
        { label: "Prestation", amount: 15000.0 }
      ],
      currency: "EUR"
    },
    summary_plain: "Contrat de prestation générique entre Services Pro et Entreprise Cliente.",
    risks_red_flags: [],
    missing_info: ["scope_details", "timeline"],
    
    section_confidence: {
      parties: 0.85,
      contract: 0.78,
      financials: 0.82
    },
    
    __recommendation: {
      label: "OK sous réserve",
      actions: ["Préciser périmètre et planning"]
    }
  };
}
