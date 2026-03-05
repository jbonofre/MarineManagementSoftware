import React, { useState } from 'react';
import { Layout, Menu, Image, Button } from 'antd';
import {
    ScheduleOutlined,
    UserOutlined,
    LogoutOutlined,
} from '@ant-design/icons';
import Login from './login.tsx';
import Planning from './planning.tsx';

import './app.css';

const { Header, Content, Sider, Footer } = Layout;

interface Technicien {
    id: number;
    prenom?: string;
    nom: string;
    email?: string;
    telephone?: string;
    couleur?: string;
}

export default function App() {
    const [user, setUser] = useState<Technicien | null>(null);

    if (!user) {
        return <Login setUser={setUser} />;
    }

    const technicienName = `${user.prenom || ''} ${user.nom}`.trim();

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
                    selectedKeys={['planning']}
                    items={[
                        { key: 'planning', icon: <ScheduleOutlined />, label: 'Mon planning' },
                    ]}
                />
            </Sider>
            <Layout>
                <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                    <span style={{ marginRight: 16 }}>
                        <UserOutlined /> {technicienName}
                    </span>
                    <Button
                        icon={<LogoutOutlined />}
                        onClick={() => setUser(null)}
                    >
                        Deconnexion
                    </Button>
                </Header>
                <Content style={{ margin: '24px 16px', padding: 24, background: '#fff', minHeight: 280 }}>
                    <Planning technicienId={user.id} />
                </Content>
                <Footer>moussAIllon - Espace Technicien</Footer>
            </Layout>
        </Layout>
    );
}
