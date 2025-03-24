import React, { useState } from 'react';
import { Layout, Input, Space, Image, Menu } from 'antd';
import { UserOutlined, TeamOutlined } from '@ant-design/icons';

function SideMenu(props) {

    const [ collapsed, setCollapsed ] = useState(false);

    const menuItems = [
      { key: 'clients', label: 'Clients', icon: <TeamOutlined /> },
      { key: 'bateaux', label: 'Bateaux' },
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
      ] },
      { key: 'user', label: props.user, icon: <UserOutlined />, children: [
        { key: 'preferences', label: 'Préférences' },
        { key: 'deconnexion', label: 'Déconnexion' }
      ]}
    ];


    return(
        <Layout.Sider collapsible={true} collapsed={collapsed} onCollapse={newValue => setCollapsed(newValue)}>
            <div className="logo" align="center">
                <Image width={75} src="./logo.png" preview={false}/>
            </div>
            <Menu items={menuItems} mode="inline" />
        </Layout.Sider>
    );

}

export default function Workspace(props) {

    const { Search } = Input;

    return(
        <Layout className="layout" hasSider={true}>
            <SideMenu user={props.user} />
            <Layout className="site-layout">
                <Layout.Header style={{ background: '#ffffff', width: '100%' }}>
                    <div align="right">
                        <Search onSearch={() => console.log("search")} style={{ width: 400 }} />
                    </div>
                </Layout.Header>
                <div>Test</div>
                <Layout.Footer>©2025 - Jean-Baptiste Onofré</Layout.Footer>
            </Layout>
        </Layout>
    );

}