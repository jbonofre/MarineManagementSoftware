import React, { useState } from 'react';
import { Layout, Input, Col, Row, Image, Menu, Button, message } from 'antd';
import { Route, Switch } from 'react-router';
import { BrowserRouter as Router } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { UserOutlined, TeamOutlined, HomeOutlined, AmazonOutlined, SettingOutlined, ToolOutlined, StockOutlined, FileOutlined, FileProtectOutlined, ReadOutlined, DesktopOutlined, DeploymentUnitOutlined, DisconnectOutlined } from '@ant-design/icons';
import Icon from '@ant-design/icons';
import { ReactComponent as BoatOutlined } from './boat.svg';
import { ReactComponent as EngineOutlined } from './moteur.svg';
import { ReactComponent as ParcOutlined } from './parc.svg';
import { ReactComponent as TailerOutlined } from './remorque.svg';
import Home from './home.tsx';
import Clients from './clients.tsx';
import Bateaux from './bateaux.tsx';
import Moteurs from './moteurs.tsx';
import Remorques from './remorques.tsx';
import Magasin from './magasin.tsx';
import Interventions from './interventions.tsx';
import Chantier from './chantier.tsx';
import Utilisateurs from './utilisateurs.tsx';
import Caisse from './caisse.tsx';
import Vente from './vente.tsx';

interface Client {
    key: string,
    nom: string,
    prenom: string,
    type: string,
    email: string
}

interface MoteurBateau {
    nom: string,
    marque: string,
    denomination: string,
    numeroserie: string,
    type: string,
    puissance: string,
    carburant: string
    helice: string,
    diametre: string,
    pas: string,
    lames: number,
    notes: string
}

interface ElectroniqueBateau {
    nom: string,
    type: string
}

interface Bateau {
    key: string,
    nom: string,
    imageUrl: string,
    immatriculation: string,
    proprietaire: string,
    proprietairekey: string,
    numeroserie: string,
    numeroclef: string,
    marque: string,
    denomination: string,
    type: string,
    assureur: string,
    numeroassurance: string,
    longueurexterieure: number,
    longueurcoque: number,
    hauteur: number,
    largeur: number,
    tirantair: number,
    tiranteau: number,
    poidsvide: number,
    poidsmaxmoteur: number,
    chargemax: number,
    longueurarbre: string,
    puissancemax: string,
    reservoireau: number,
    reservoircarburant: number,
    nombremaxpassagers: number,
    categoriece: string,
    photos: string[],
    localisation: string,
    localisationgps: string,
    moteurs: MoteurBateau[],
    electronique: ElectroniqueBateau[]
}

const clients: Client[] = [
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
        type: 'Professionnel de la Mer',
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

const bateaux: Bateau[] = [
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

const moteurs = [
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

const remorques = [
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

export function demo() {
    message.warning("Vous êtes sur une version de démonstration de Marine Management Software. Il n'est pas possible d'ajouter ou supprimer des éléments.")
}

function SideMenu(props) {

    const [ collapsed, setCollapsed ] = useState(false);

    const menuItems = [
      { key: 'home', label: <Link to="/">Accueil</Link>, icon: <HomeOutlined/> },
      { key: 'clients', label: <Link to="/clients">Clients</Link>, icon: <TeamOutlined /> },
      { key: 'parc', label: 'Parc', icon: <Icon component={ ParcOutlined } />, children: [
        { key: 'bateaux', label: <Link to="/bateaux">Bateaux</Link>, icon: <Icon component={ BoatOutlined } />},
        { key: 'moteurs', label: <Link to="/moteurs">Moteurs</Link>, icon: <Icon component={ EngineOutlined } /> },
        { key: 'remorques', label: <Link to="/remorques">Remorques</Link>, icon: <Icon component= { TailerOutlined } /> }
      ] },
      { key: 'magasin', label: 'Magasin', icon: <StockOutlined/>, children: [
        { key: 'guichet', label: <Link to="/caisse">Comptoir</Link>, icon: <DesktopOutlined/> },
        { key: 'documents', label: <Link to="/vente">Documents de Vente</Link>, icon: <FileOutlined/> },
        { key: 'catalogue', label: <Link to="/magasin">Catalogue</Link>, icon: <ReadOutlined/> },
        { key: 'fournisseurs', label: 'Fournisseurs', icon: <FileProtectOutlined/> }
      ] },
      { key: 'atelier', label: 'Atelier', icon: <ToolOutlined/>, children: [
        { key: 'prestations', label: 'Prestations' },
        { key: 'forfaits', label: 'Forfaits' },
        { key: 'interventions', label: <Link to="/interventions">Interventions</Link> },
        { key: 'planning', label: 'Planning' },
        { key: 'equipe', label: 'Equipe' },
      ] },
      { key: 'market', label: 'Market', icon: <AmazonOutlined/>, children: [
        { key: 'marchands', label: 'Marchands' },
        { key: 'site', label: 'Site ecommerce' },
        { key: 'marketing', label: 'Marketing' }
      ] },
      { key: 'parametrage', label: 'Paramétrage', icon: <SettingOutlined/>, children: [
        { key: 'chantier', label: <Link to="/chantier">Société</Link>, icon: <DeploymentUnitOutlined/> },
        { key: 'utilisateurs', label: <Link to="/utilisateurs">Utilisateurs</Link>, icon: <UserOutlined/> }
      ] }
    ];

    return(
        <Layout.Sider collapsible={true} collapsed={collapsed} onCollapse={newValue => setCollapsed(newValue)}>
            <Menu items={menuItems} mode="inline" />
        </Layout.Sider>
    );

}

function Header(props) {

    const { Search } = Input;

    const menuUser = [
              { key: 'user', label: props.user, icon: <UserOutlined />, children: [
                { key: 'preferences', label: 'Préférences', icon: <SettingOutlined/> },
                { key: 'deconnexion', label: 'Déconnexion', icon: <DisconnectOutlined/> }
              ]}
    ];

    return(
        <Layout.Header style={{ height: "80px", background: "#fff", padding: "5px", margin: "10px" }}>
            <Row align="middle" justify="center" wrap="false">
                <Col span={3}><Image src="./logo.png" preview={false} width={75}/></Col>
                <Col span={19}><Search /></Col>
                <Col span={2}><Menu items={menuUser} onClick={(e) => {
                    if (e.key === 'deconnexion') {
                        props.setUser(null);
                    }
                    if (e.key === 'preferences') {
                        console.log(e);
                    }
                }} /></Col>
            </Row>
        </Layout.Header>
    );

}

export default function Workspace(props) {

    return(
        <Layout style={{ height: "105vh" }}>
          <Header user={props.user} setUser={props.setUser} />
          <Layout hasSider={true}>
            <Router>
            <SideMenu user={props.user}/>
            <Layout.Content style={{ margin: "15px" }}>
                <Switch>
                    <Route path="/" key="home" exact={true}>
                        <Home/>
                    </Route>
                    <Route path="/clients" key="clients">
                        <Clients clients={clients} />
                    </Route>
                    <Route path="/bateaux" key="bateaux">
                        <Bateaux bateaux={bateaux} />
                    </Route>
                    <Route path="/moteurs" key="moteurs">
                        <Moteurs moteurs={moteurs} />
                    </Route>
                    <Route path="/remorques" key="remorques">
                        <Remorques remorques={remorques} />
                    </Route>
                    <Route path="/magasin" key="magasin">
                        <Magasin />
                    </Route>
                    <Route path="/interventions" key="interventions">
                        <Interventions />
                    </Route>
                    <Route path="/chantier" key="chantier">
                        <Chantier />
                    </Route>
                    <Route path="/utilisateurs" key="utilisateurs">
                        <Utilisateurs />
                    </Route>
                    <Route path="/caisse" key="caisse">
                        <Caisse />
                    </Route>
                    <Route path="/vente" key="vente">
                        <Vente />
                    </Route>
                </Switch>
            </Layout.Content>
            </Router>
          </Layout>
          <Layout.Footer>Copyright © 2025 - Jean-Baptiste Onofré - Tous droits réservés</Layout.Footer>
        </Layout>
    );

}