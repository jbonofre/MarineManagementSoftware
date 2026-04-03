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
    ScheduleOutlined,
} from '@ant-design/icons';
import Login from './login.tsx';
import Dashboard from './dashboard.tsx';
import MesBateaux from './mes-bateaux.tsx';
import MesMoteurs from './mes-moteurs.tsx';
import MesRemorques from './mes-remorques.tsx';
import MesFactures from './mes-factures.tsx';
import MesPrestations from './mes-prestations.tsx';
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

export interface AnnoncePreSelection {
    photos: string[];
    bateauId?: number;
}

export default function App() {
    const [user, setUser] = useState<Client | null>(() => {
        const stored = localStorage.getItem('moussaillon-client-user');
        return stored ? JSON.parse(stored) : null;
    });
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [annoncePreSelection, setAnnoncePreSelection] = useState<AnnoncePreSelection | null>(null);
    const isMobile = useIsMobile();

    const handleLogout = () => {
        localStorage.removeItem('moussaillon-client-token');
        localStorage.removeItem('moussaillon-client-user');
        setUser(null);
        setCurrentPage('dashboard');
    };

    if (!user) {
        return <Login setUser={setUser} />;
    }

    if (isMobile) {
        return <MobileApp user={user} onLogout={handleLogout} />;
    }

    const clientName = `${user.prenom || ''} ${user.nom}`.trim();

    const menuItems = [
        { key: 'dashboard', icon: <DashboardOutlined />, label: 'Tableau de bord' },
        { key: 'bateaux', icon: <ShopOutlined />, label: 'Mes bateaux' },
        { key: 'moteurs', icon: <ToolOutlined />, label: 'Mes moteurs' },
        { key: 'remorques', icon: <CarOutlined />, label: 'Mes remorques' },
        { key: 'factures', icon: <FileTextOutlined />, label: 'Mes factures' },
        { key: 'prestations', icon: <ScheduleOutlined />, label: 'Mes prestations' },
        { key: 'annonces', icon: <TagsOutlined />, label: 'Petites annonces' },
        { key: 'profil', icon: <UserOutlined />, label: 'Mon profil' },
    ];

    const handleCreateAnnonceWithImages = (photos: string[], bateauId?: number) => {
        setAnnoncePreSelection({ photos, bateauId });
        setCurrentPage('annonces');
    };

    const renderPage = () => {
        switch (currentPage) {
            case 'bateaux':
                return <MesBateaux clientId={user.id} onCreateAnnonce={handleCreateAnnonceWithImages} />;
            case 'moteurs':
                return <MesMoteurs clientId={user.id} onCreateAnnonce={handleCreateAnnonceWithImages} />;
            case 'remorques':
                return <MesRemorques clientId={user.id} onCreateAnnonce={handleCreateAnnonceWithImages} />;
            case 'factures':
                return <MesFactures clientId={user.id} />;
            case 'prestations':
                return <MesPrestations clientId={user.id} />;
            case 'annonces': {
                const preSelection = annoncePreSelection;
                if (preSelection) setAnnoncePreSelection(null);
                return <PetitesAnnonces clientId={user.id} initialPhotos={preSelection?.photos} initialBateauId={preSelection?.bateauId} />;
            }
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
                        onClick={handleLogout}
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
