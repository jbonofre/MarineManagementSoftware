// export const societe = {
//     nom: 'MS Plaisance',
//     siren: '790 458 616',
//    siret: '790 458 616 00022',
//    ape: '3315Z',
//    rcs: '790458616',
//    forme: 'EURL',
//    capital: 3500,
//    numerotva: 'FR79790458616',
//    adresse: 'ZA Le Band\n29670 Henvic',
//    telephone: '0256455037',
//    email: 'contact@msplaisance.com',
//    bancaire: 'Banque : CREDIT AGRICOLE CHEQUE\nRIB : 12906000345743433700594\nIBAN : FR7612906000345743433700594\nBIC : AGRIFRPP829',
//    images: [
//        'https://www.msplaisance.com/img/logo.png',
//        'https://media.bateaux.com/src/applications/showroom/images/images-produit/7003aaf9d3da1267ec84c6892b7f917b.png',
//        'https://media.bateaux.com/src/applications/showroom/images/images-produit/6f20847f0c57af433795fe664fbd2308.jpg'
//    ]
//};

export const userRoles = [
    { value: 'admin', label: 'admin', text: 'admin' },
    { value: 'atelier', label: 'atelier', text: 'atelier' },
    { value: 'accueil', label: 'accueil', text: 'accueil' },
    { value: 'magazin', label: 'magazin', text: 'magazin' }
];

export const transactions = [
  {
    numero: 'SXZADAX121',
    codeclient: 'CL01797',
    client: 'Jean-Baptiste Onofré',
    adresseclient: 'Lieu dit Coatalec\n29670 Henvic',
    date: '08-06-2024',
    montantht: 20.10,
    tauxtva: 20.00,
    montantttc: 24.00,
    montanttva: 4.02,
    acompte: 0,
    netapayer: 24,
    soldedu: 0,
    modereglement: 'CB',
    items: [
        {
            code: '13311',
            description: 'Bouée de mouillage rigide orange, diam 25cm',
            quantite: 1,
            remise: 0,
            prixht: 20.10,
            tva: 20,
            prixttc: 24
        }
    ]
  },
  {
    numero: 'DSDXZ21SQ',
    date: '06-06-2024',
    montantht: 20.10,
    tauxtva: 20.00,
    montantttc: 24.00,
    netapayer: 24,
    modereglement: 'CB',
    items: [
        {
           code: '13311',
            description: 'Bouée de mouillage rigide orange, diam 25cm',
            quantite: 1,
            remise: 0,
            prixht: 20.10,
            tva: 20,
            prixttc: 24
        }
    ]
  }
];

export const ventes = [
    {
        numero: 'SDAXZ1SA2',
        client: 'Jean-Baptiste Onofré',
        adresseclient: 'Lieu dit Coatalec\n29670 Henvic',
        status: 'Devis',
        date: '25-07-2025',
        montantht: 20.10,
        tauxtva: 20.00,
        montantttc: 24.00,
        monntanttva: 4.02,
        acompte: 0,
        netapayer: 24,
        soldedu: 0,
        reglement: 'CB',
        avoir: 0,
        items: [
            {
                code: '13311',
                description: 'Bouée de mouillage rigide orange, diam 25cm',
                quantite: 1,
                remise: 0,
                prixht: 20.10,
                tva: 20,
                prixttc: 24
            }
        ]
    }
];

export const forfaits = [
  {
    nom: 'Sortie eau - Pont de la Corde - Henvic',
    description: 'Opération de sortie d\'eau au Pont de la Corde à Henvic',
    prixht: 80.0,
    prixttc: 96.0,
    tva: 16.0,
    catalogue: [
        { ref: 'Manutention', quantite: 2 }
    ],
    application: [ '*' ],
  },
  {
    nom: 'Entretien Mercury FS75',
    catalogue: [
        { ref: 'Mécanique 1', quantite: 0.5 },
        { ref: 'Bougie NGK BU8H', quantite: 4 },
        { ref: 'Huile 10W30', quantite: 2 },
    ],
    application: [ 'Mercury', 'FS75', 'Rosko' ],
    heures: 100,
    periode: 'Annuel',
  }
];