import React, { useState } from 'react';
import { Layout, Menu, Image, Button } from 'antd';
import {
    DashboardOutlined,
    ShopOutlined,
    ToolOutlined,
    CarOutlined,
    FileTextOutlined,
    UserOutlined,
    LogoutOutlined,
    TagsOutlined,
} from '@ant-design/icons';
import Login from './login.tsx';
import Dashboard from './dashboard.tsx';
import MesBateaux from './mes-bateaux.tsx';
import MesMoteurs from './mes-moteurs.tsx';
import MesRemorques from './mes-remorques.tsx';
import MesFactures from './mes-factures.tsx';
import MonProfil from './mon-profil.tsx';
import PetitesAnnonces from './petites-annonces.tsx';
import MobileApp from './mobile-app.tsx';
import useIsMobile from './use-is-mobile.tsx';

import './app.css';

const { Header, Content, Sider, Footer } = Layout;

interface Client {
    id: number;
    prenom?: string;
    nom: string;
    type: string;
    email?: string;
    telephone?: string;
    adresse?: string;
}

export default function App() {
    const [user, setUser] = useState<Client | null>(null);
    const [currentPage, setCurrentPage] = useState('dashboard');
    const isMobile = useIsMobile();

    if (!user) {
        return <Login setUser={setUser} />;
    }

    if (isMobile) {
        return <MobileApp user={user} onLogout={() => { setUser(null); setCurrentPage('dashboard'); }} />;
    }

    const clientName = `${user.prenom || ''} ${user.nom}`.trim();

    const menuItems = [
        { key: 'dashboard', icon: <DashboardOutlined />, label: 'Tableau de bord' },
        { key: 'bateaux', icon: <ShopOutlined />, label: 'Mes bateaux' },
        { key: 'moteurs', icon: <ToolOutlined />, label: 'Mes moteurs' },
        { key: 'remorques', icon: <CarOutlined />, label: 'Mes remorques' },
        { key: 'factures', icon: <FileTextOutlined />, label: 'Mes factures' },
        { key: 'annonces', icon: <TagsOutlined />, label: 'Petites annonces' },
        { key: 'profil', icon: <UserOutlined />, label: 'Mon profil' },
    ];

    const renderPage = () => {
        switch (currentPage) {
            case 'bateaux':
                return <MesBateaux clientId={user.id} />;
            case 'moteurs':
                return <MesMoteurs clientId={user.id} />;
            case 'remorques':
                return <MesRemorques clientId={user.id} />;
            case 'factures':
                return <MesFactures clientId={user.id} />;
            case 'annonces':
                return <PetitesAnnonces clientId={user.id} />;
            case 'profil':
                return <MonProfil clientId={user.id} />;
            default:
                return <Dashboard clientId={user.id} />;
        }
    };

    return (
        <Layout className="layout">
            <Sider breakpoint="lg" collapsedWidth="0">
                <div className="logo">
                    <Image width={36} src="./logo.png" preview={false} />
                    <span>moussAIllon</span>
                </div>
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[currentPage]}
                    items={menuItems}
                    onClick={({ key }) => setCurrentPage(key)}
                />
            </Sider>
            <Layout>
                <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                    <span style={{ marginRight: 16 }}>
                        <UserOutlined /> {clientName}
                    </span>
                    <Button
                        icon={<LogoutOutlined />}
                        onClick={() => { setUser(null); setCurrentPage('dashboard'); }}
                    >
                        Deconnexion
                    </Button>
                </Header>
                <Content style={{ margin: '24px 16px', padding: 24, background: '#fff', minHeight: 280 }}>
                    {renderPage()}
                </Content>
                <Footer>moussAIllon - Espace Client</Footer>
            </Layout>
        </Layout>
    );
}
