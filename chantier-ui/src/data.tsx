export var chantier = {
    nom: 'MS Plaisance',
    siren: '790 458 616',
    siret: '790 458 616 00022',
    ape: '3315Z',
    rcs: '790458616',
    forme: 'EURL',
    capital: 3500,
    numerotva: 'FR79790458616',
    adresse: 'ZA Le Band\n29670 Henvic',
    telephone: '0256455037',
    email: 'contact@msplaisance.com',
    bancaire: 'Banque : CREDIT AGRICOLE CHEQUE\nRIB : 12906000345743433700594\nIBAN : FR7612906000345743433700594\nBIC : AGRIFRPP829',
    images: [
        'https://www.msplaisance.com/img/logo.png',
        'https://media.bateaux.com/src/applications/showroom/images/images-produit/7003aaf9d3da1267ec84c6892b7f917b.png',
        'https://media.bateaux.com/src/applications/showroom/images/images-produit/6f20847f0c57af433795fe664fbd2308.jpg'
    ]
}

export const users = [
  {
      user: 'admin',
      roles: 'admin',
      password: 'admin',
      email: 'contact@msplaisance.com'
  },
  {
      user: 'accueil',
      roles: 'accueil',
      password: 'accueil',
      email: 'contact@msplaisance.com'
  }
];

export const clients = [
    {
        key: '1',
        nom: 'Onofré',
        prenom: 'Jean-Baptiste',
        type: 'Particulier',
        email: 'jb@nanthrax.net',
        adresse: 'Lieu dit Coatalec\n29670 Henvic',
        consentement: true,
        date: '25-05-2023',
        evaluation: 5
    },
    {
        key: '2',
        nom: 'Aventure Pêche',
        prenom: null,
        type: 'Professionnel',
        email: 'contact@aventurepechebretagne.com',
        adresse: 'Port de Plaisance du Port du Bloscon\n29680 Roscoff',
        consentement: true,
        date: '02-03-2020',
        evaluation: 4,
        notes: 'Partenaire loueur'
    },
    {
        key: '3',
        nom: 'Les Viviers de Carantec',
        prenom: null,
        type: 'Professionnel Exonere',
        email: 'contact@lesviviersdecarantec.fr',
        adresse: '38 Chem. du Varquez\n29660 Carantec',
        consentement: false,
        date: '10-01-2025',
        evaluation: 3
    },
    {
        key: '4',
        nom: 'Jourdan',
        prenom: 'Pierre',
        type: 'Particulier',
        consentement: true,
        date: '01-07-2025',
        evaluation: 4
    }
];

export const bateaux = [
    {
        key: '1',
        nom: 'Rosko',
        imageUrl: 'https://www.quicksilver-boats.com/media/tichx5ki/605-open-running-0362-grey.jpg',
        immatriculation: 'MX65SEADA',
        numeroserie: '221309DSAD',
        numeroclef: '19314',
        marque: 'Quicksilver',
        denomination: 'Activ 605 Open',
        type: 'Bateau à Moteur',
        datemes: '01-06-2024',
        dateachat: '04-08-2024',
        datefinguarantie: '04-08-2026',
        proprietaire: 'Jean-Baptiste Onofré',
        proprietairekey: '1',
        longueurexterieure: 6.46,
        longueurcoque: 5.75,
        hauteur: 2.00,
        largeur: 2.40,
        tirantair: 1.55,
        tiranteau: 0.38,
        poidsvide: 904,
        poidsmaxmoteur: 211,
        chargemax: 587,
        longueurarbre: 'XL',
        puissancemax: '150 cv (110 kv)',
        reservoireau: 45,
        reservoircarburant: 160,
        nombremaxpassagers: 7,
        categoriece: 'C',
        photos: [
            'https://www.quicksilver-boats.com/media/yezdee5q/605-open-details-0455-v2_bow-roller_f.jpg',
            'https://www.quicksilver-boats.com/media/4vjdv0yg/605-open-details-1490_rod-holders_f.jpg'
        ],
        assureur: 'GMF',
        numeroassurance: 'DSQDJCCE',
        localisation: 'I66\nPort du Bloscon\n29680 Roscoff',
        localisationgps: '3,57550 48,42541',
        moteurs: [
            {
                nom: 'Moteur 1',
                marque: 'Mercury',
                denomination: 'Pro XS 150',
                type: 'Hors Bord',
                carburant: 'Essence',
                puissance: '150cv (110 kw)',
                numeroserie: 'DSDASX231',
                helice: 'Solas Lexor4',
                diametre: '14 1/4',
                pas: '17R',
                lame: 4
            }
        ],
        electronique: [
            {
                nom: 'Garmin Echomap 92SV UHD',
                type: 'Combiné GPS & Sondeur'
            }
        ],
        equipement: [
            {
                nom: 'Mat de ski / wakeboard H 1,20m',
                type: 'Tour de wake, anneau de traction et roll-bar'
            }
        ],
        remorque: []
    },
    {
        key: '2',
        nom: 'Goupil',
        imageUrl: 'https://www.hisse-et-oh.com/store/medias/sailing/61c/ea5/363/large/61cea53639819f08ce1bb81b.jpg',
        immatriculation: 'MX321EZA',
        proprietaire: 'Pierre Jourdan',
        proprietairekey: '4',
        marque: 'RM Yachts',
        denomination: 'RM 980',
        type: 'Voilier',
        dateachat: '02-02-2024',
        datemes: '01-01-2005',
        datefinguarantie: '01-01-2007',
        longueurcoque: 9.80,
        largeur: 3.50,
        poidsvide: 3500,
        description: 'Version deux cabines',
        photos: [
            'https://idata.over-blog.com/0/56/75/49/le-bateau/amenagements-jour.jpg',
            'https://marclombard.com/wp-content/uploads/2023/01/lesud-e1672741821685.jpg'
        ],
        localisation: 'E55\nPort du Bloscon\n29680 Roscoff',
        moteurs: [],
        electronique: []
    }
];

export const moteurs = [
  {
    numeroserie: 'DSDQSD231',
    denomination: 'Mercury 20 cv ELPHPT Arbre Long',
    imageUrl: '',
    marque: 'Mercury',
    type: 'Hors-Bord',
    puissancecv: 20,
    puissancekw: 14.7,
    longueurarbre: 'L',
    arbre: 508,
    demarrage: 'Electrique',
    barre: 'Franche',
    cylindres: 2,
    cylindree: 333,
    regime: '5700-6200',
    huilerecommandee: '10W30',
    proprietaire: 'Les Viviers de Carantec',
    proprietairekey: '3',
    dateachat: '03-05-2025',
    datemes: '07-05-2025',
    heures: 30,
    notes: '',
    helice: 'Mercury Standard',
    diametre: '8',
    pas: '8R',
    lame: 4
  }
];

export const remorques = [
  {
    numeroserie: 'DSDASD3213',
    denomination: 'Porte Bateau Multi-Rouleaux Galaxy - GS13 / G1000',
    immatriculation: 'XX-344-AA',
    type: 'Multi-rouleaux',
    proprietaire: 'Les Viviers de Carantec',
    proprietairekey: '3',
    ptac: 1300,
    massevide: 370,
    charge: 980,
    longueur: 703,
    largeur: 214,
    longueurbateau: 5.52,
    fleche: 'Galvanisé à chaud en V',
    chassis: 'Galvanisé à chaud',
    roues: '165R14C',
    equipement: 'Essieu frein à tambour\nFeux LEDs étanches et support de plaque pivotant\nTreuil deux vitesses auto-freiné\nSupport de treuil réglable et butée étrave réglable 3D\nRoue jockey diamètre 60'
  }
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