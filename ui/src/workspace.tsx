import React, { useState } from 'react';
import { Layout, Input, Col, Row, Image, Menu } from 'antd';
import { UserOutlined, TeamOutlined } from '@ant-design/icons';
import Icon from '@ant-design/icons';
import { ReactComponent as BoatOutlined } from './boat.svg';
import Home from './home.tsx';

function SideMenu(props) {

    const [ collapsed, setCollapsed ] = useState(false);

    const menuItems = [
      { key: 'clients', label: 'Clients', icon: <TeamOutlined /> },
      { key: 'bateaux', label: 'Bateaux', icon: <Icon component={ BoatOutlined } /> },
      { key: 'partenaires', label: 'Partenaires', children: [
        { key: 'fournisseurs', label: 'Fournisseurs' },
        { key: 'loueurs', label: 'Loueurs' },
        { key: 'annonceurs', label: 'Annonceurs' }
      ] },
      { key: 'atelier', label: 'Atelier', children: [
        { key: 'pieces', label: 'Piéces et Accessoires' },
        { key: 'equipe', label: 'Equipe' },
        { key: 'entretien', label: 'Programme Entretien' },
        { key: 'planning', label: 'Planning' }
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
                { key: 'preferences', label: 'Préférences' },
                { key: 'deconnexion', label: 'Déconnexion' }
              ]}
    ];

    return(
        <Layout.Header style={{ height: "80px", background: "#fff", padding: "5px", margin: "10px" }}>
            <Row align="middle" justify="center" wrap="false">
                <Col span={3}><Image src="./logo.png" preview={false} width={75}/></Col>
                <Col span={19}><Search /></Col>
                <Col span={2}><Menu items={menuUser} /></Col>
            </Row>
        </Layout.Header>
    );

}

export default function Workspace(props) {

    return(
        <Layout style={{ height: "105vh" }}>
          <Header user={props.user} />
          <Layout hasSider={true}>
            <SideMenu user={props.user} />
            <Layout.Content style={{ margin: "15px" }}>
                <Home/>
            </Layout.Content>
          </Layout>
          <Layout.Footer>Copyright © 2025 - Jean-Baptiste Onofré - Tous droits réservés</Layout.Footer>
        </Layout>
    );

}