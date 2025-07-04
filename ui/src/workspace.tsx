import React, { useState } from 'react';
import { Layout, Input, Col, Row, Image, Menu } from 'antd';
import { Route, Switch } from 'react-router';
import { BrowserRouter as Router } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { UserOutlined, TeamOutlined, HomeOutlined, AmazonOutlined, SettingOutlined, ToolOutlined, StockOutlined, FileProtectOutlined } from '@ant-design/icons';
import Icon from '@ant-design/icons';
import { ReactComponent as BoatOutlined } from './boat.svg';
import Home from './home.tsx';
import Clients from './clients.tsx';
import Parc from './parc.tsx';
import Magasin from './magasin.tsx';
import Interventions from './interventions.tsx';

function SideMenu(props) {

    const [ collapsed, setCollapsed ] = useState(false);

    const menuItems = [
      { key: 'home', label: <Link to="/">Accueil</Link>, icon: <HomeOutlined/> },
      { key: 'clients', label: <Link to="/clients">Clients</Link>, icon: <TeamOutlined /> },
      { key: 'parc', label: <Link to="/parc">Parc</Link>, icon: <Icon component={ BoatOutlined } /> },
      { key: 'magasin', label: <Link to="/magasin">Magasin</Link>, icon: <StockOutlined/>, children: [
        { key: 'caisse', label: 'Caisse'},
        { key: 'fournisseurs', label: 'Fournisseurs', icon: <FileProtectOutlined/> }
      ] },
      { key: 'atelier', label: 'Atelier', icon: <ToolOutlined/>, children: [
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
      { key: 'parametrage', label: 'Paramétrage', icon: <SettingOutlined/> }
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
                { key: 'preferences', label: 'Préférences' },
                { key: 'deconnexion', label: 'Déconnexion' }
              ]}
    ];

    const onClick : MenuProps['onClick'] = (e) => {
        console.log('click', e);
    };

    return(
        <Layout.Header style={{ height: "80px", background: "#fff", padding: "5px", margin: "10px" }}>
            <Row align="middle" justify="center" wrap="false">
                <Col span={3}><Image src="./logo.png" preview={false} width={75}/></Col>
                <Col span={19}><Search /></Col>
                <Col span={2}><Menu items={menuUser} onClick={onClick} /></Col>
            </Row>
        </Layout.Header>
    );

}

export default function Workspace(props) {

    return(
        <Layout style={{ height: "105vh" }}>
          <Header user={props.user} />
          <Layout hasSider={true}>
            <Router>
            <SideMenu user={props.user} />
            <Layout.Content style={{ margin: "15px" }}>
                <Switch>
                    <Route path="/" key="home" exact={true}>
                        <Home/>
                    </Route>
                    <Route path="/clients" key="clients">
                        <Clients/>
                    </Route>
                    <Route path="/parc" key="parc">
                        <Parc/>
                    </Route>
                    <Route path="/magasin" key="magasin">
                        <Magasin />
                    </Route>
                    <Route path="/interventions" key="interventions">
                        <Interventions />
                    </Route>
                </Switch>
            </Layout.Content>
            </Router>
          </Layout>
          <Layout.Footer>Copyright © 2025 - Jean-Baptiste Onofré - Tous droits réservés</Layout.Footer>
        </Layout>
    );

}