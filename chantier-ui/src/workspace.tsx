import React, { useState } from 'react';
import { Layout, Input, Col, Row, Image, Menu, Button, message } from 'antd';
import { Route, Switch } from 'react-router';
import { BrowserRouter as Router } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { UserOutlined, TeamOutlined, HomeOutlined, AmazonOutlined, SettingOutlined, ToolOutlined, StockOutlined, FileOutlined, FileProtectOutlined, ReadOutlined, DesktopOutlined, DeploymentUnitOutlined, DisconnectOutlined, DashboardOutlined, CalendarOutlined, FileDoneOutlined, CheckSquareOutlined, BarsOutlined } from '@ant-design/icons';
import Icon from '@ant-design/icons';
import { ReactComponent as BoatOutlined } from './boat.svg';
import { ReactComponent as EngineOutlined } from './moteur.svg';
import { ReactComponent as ParcOutlined } from './parc.svg';
import { ReactComponent as TailerOutlined } from './remorque.svg';
import Home from './home.tsx';
import Clients from './clients.tsx';
import Produits from './catalogue-produits.tsx';
import CatalogueBateaux from './catalogue-bateaux.tsx';
import CatalogueMoteurs from './catalogue-moteurs.tsx';
import CatalogueHelices from './catalogue-helices.tsx';
import Fournisseurs from './fournisseurs.tsx';
import Transactions from './transactions.tsx';
import Prestations from './prestations.tsx';
import Societe from './societe.tsx';
import Utilisateurs from './utilisateurs.tsx';
import Forfaits from './forfaits.tsx';
import CatalogueRemorques from './catalogue-remorques.tsx';
import BateauxClients from './clients-bateaux.tsx';
import ClientsMoteurs from './clients-moteurs.tsx';
import RemorquesClients from './clients-remorques.tsx';

export function demo() {
    message.warning("Vous êtes sur une version de démonstration de Marine Management Software. Il n'est pas possible d'ajouter ou supprimer des éléments.")
}

function SideMenu(props) {

    const [ collapsed, setCollapsed ] = useState(false);

    const menuItems = [
      { key: 'home', label: <Link to="/">Accueil</Link>, icon: <HomeOutlined/> },
      { key: 'dashboard', label: 'Tableau de Bord', icon: <DashboardOutlined/> },
      { key: 'parc', label: 'Parc', icon: <Icon component={ ParcOutlined } />, children: [
        { key: 'clients', label: <Link to="/clients">Clients</Link>, icon: <TeamOutlined /> },
        { key: 'bateaux', label: <Link to="/clients/bateaux">Bateaux</Link>, icon: <Icon component={ BoatOutlined } />},
        { key: 'moteurs', label: <Link to="/clients/moteurs">Moteurs</Link>, icon: <Icon component={ EngineOutlined } /> },
        { key: 'remorques', label: <Link to="/clients/remorques">Remorques</Link>, icon: <Icon component={ TailerOutlined } /> }
      ] },
      { key: 'catalogue', label: 'Catalogue', icon: <ReadOutlined/>, children: [
        { key: 'produits', label: <Link to="/catalogue/produits">Produits</Link>, icon: <StockOutlined /> },
        { key: 'bateaux', label: <Link to="/catalogue/bateaux">Bateaux</Link>, icon: <Icon component={ BoatOutlined } /> },
        { key: 'moteurs', label: <Link to="/catalogue/moteurs">Moteurs</Link>, icon: <Icon component={ EngineOutlined } /> },
        { key: 'helices', label: <Link to="/catalogue/helices">Hélices</Link>, icon: <DeploymentUnitOutlined /> },
        { key: 'remorques', label: <Link to="/catalogue/remorques">Remorques</Link>, icon: <Icon component={ TailerOutlined } /> },
        { key: 'fournisseurs', label: <Link to="/catalogue/fournisseurs">Fournisseurs</Link>, icon: <FileProtectOutlined/> },
      ]},
      { key: 'transactions', label: 'Transactions', icon: <FileOutlined/>, children: [
        { key: 'transactions', label: <Link to="/transactions">Transactions</Link>, icon: <FileOutlined/> },
      ]},
      { key: 'atelier', label: 'Atelier', icon: <ToolOutlined/>, children: [
        { key: 'prestations', label: <Link to="/prestations">Prestations</Link>, icon: <CheckSquareOutlined/> },
        { key: 'planning', label: 'Planning', icon: <CalendarOutlined/> },
        { key: 'equipe', label: 'Equipe', icon: <TeamOutlined/> },
        { key: 'forfaits', label: <Link to="/forfaits">Forfaits</Link>, icon: <FileDoneOutlined/> },
      ] },
      { key: 'market', label: 'Market', icon: <AmazonOutlined/>, children: [
        { key: 'marchands', label: 'Marchands' },
        { key: 'site', label: 'Site ecommerce' },
        { key: 'marketing', label: 'Marketing' }
      ] },
      { key: 'parametrage', label: 'Paramétrage', icon: <SettingOutlined/>, children: [
        { key: 'societe', label: <Link to="/societe">Société</Link>, icon: <DeploymentUnitOutlined/> },
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
            <Row align="middle" justify="center" wrap={false}>
                <Col span={3}><Image src="/logo.png" preview={false} width={75}/></Col>
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
                    <Route path="/clients" key="clients" exact={true}>
                        <Clients />
                    </Route>
                    <Route path="/clients/bateaux" key="clients-bateaux">
                        <BateauxClients />
                    </Route>
                    <Route path="/clients/moteurs" key="clients-moteurs">
                        <ClientsMoteurs />
                    </Route>
                    <Route path="/clients/remorques" key="clients-remorques">
                        <RemorquesClients />
                    </Route>
                    <Route path="/catalogue/produits" key="produits">
                        <Produits />
                    </Route>
                    <Route path="/catalogue/bateaux" key="catalogue-bateaux">
                        <CatalogueBateaux />
                    </Route>
                    <Route path="/catalogue/moteurs" key="catalogue-moteurs">
                        <CatalogueMoteurs />
                    </Route>
                    <Route path="/catalogue/helices" key="helices">
                        <CatalogueHelices />
                    </Route>
                    <Route path="/catalogue/remorques" key="catalogue-remorques">
                        <CatalogueRemorques />
                    </Route>
                    <Route path="/catalogue/fournisseurs" key="fournisseurs">
                        <Fournisseurs />
                    </Route>
                    <Route path="/transactions" key="transactions">
                        <Transactions />
                    </Route>
                    <Route path="/societe" key="societe">
                        <Societe />
                    </Route>
                    <Route path="/utilisateurs" key="utilisateurs">
                        <Utilisateurs />
                    </Route>
                    <Route path="/prestations" key="prestations">
                        <Prestations />
                    </Route>
                    <Route path="/forfaits" key="forfaits">
                        <Forfaits />
                    </Route>
                </Switch>
            </Layout.Content>
            </Router>
          </Layout>
          <Layout.Footer>Copyright © 2025 - Jean-Baptiste Onofré - Tous droits réservés</Layout.Footer>
        </Layout>
    );

}
