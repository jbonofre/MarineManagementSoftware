import React, { useState } from 'react';
import { Layout, Image, Menu } from 'antd';

function SideMenu() {

    const [ collapsed, setCollapsed ] = useState(false);

    return(
        <Layout.Sider collapsible={true} collapsed={collapsed} onCollapse={newValue => setCollapsed(newValue)}>
            <div className="logo" align="center">
                <Image width={70} src="./logo.png" preview={false}/>
            </div>
            <Menu items={[ { key: 'clients', label: 'Clients' }, { key: 'bateau', label: 'Bateaux' } ]} mode="inline" />
        </Layout.Sider>
    );

}

export default function Workspace(props) {

    return(
        <Layout className="layout" hasSider={true}>
            <SideMenu />
            <Layout className="site-layout">
                <Layout.Header style={{ background: '#ffffff', width: '100%' }}>
                    <div align="right">User: {props.user}</div>
                </Layout.Header>
                <div>Test</div>
                <Layout.Footer>©2025 - Jean-Baptiste Onofré</Layout.Footer>
            </Layout>
        </Layout>
    );

}