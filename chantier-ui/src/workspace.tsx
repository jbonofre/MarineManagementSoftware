import { fetchWithAuth } from './api.ts';
import React, { useEffect, useState } from 'react';
import { Layout, Input, Col, Row, Image, Menu, Form, Modal, message, ConfigProvider, theme as antdTheme, Switch as AntSwitch } from 'antd';
import { Route, Switch } from 'react-router';
import { BrowserRouter as Router } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { UserOutlined, TeamOutlined, HomeOutlined, AmazonOutlined, SettingOutlined, ToolOutlined, StockOutlined, FileOutlined, FileProtectOutlined, ReadOutlined, DesktopOutlined, DeploymentUnitOutlined, DisconnectOutlined, DashboardOutlined, CalendarOutlined, FileDoneOutlined, CheckSquareOutlined, RedoOutlined, ShoppingCartOutlined, MailOutlined, SendOutlined } from '@ant-design/icons';
import Icon from '@ant-design/icons';
import { ReactComponent as BoatOutlined } from './boat.svg';
import { ReactComponent as EngineOutlined } from './moteur.svg';
import { ReactComponent as ParcOutlined } from './parc.svg';
import { ReactComponent as TailerOutlined } from './remorque.svg';
import { Result } from 'antd';
import Home from './home.tsx';
import Clients from './clients.tsx';
import Produits from './catalogue-produits.tsx';
import CatalogueBateaux from './catalogue-bateaux.tsx';
import CatalogueMoteurs from './catalogue-moteurs.tsx';
import CatalogueHelices from './catalogue-helices.tsx';
import Fournisseurs from './fournisseurs.tsx';
import Societe from './societe.tsx';
import Utilisateurs from './utilisateurs.tsx';
import Forfaits from './forfaits.tsx';
import CatalogueRemorques from './catalogue-remorques.tsx';
import BateauxClients from './clients-bateaux.tsx';
import ClientsMoteurs from './clients-moteurs.tsx';
import RemorquesClients from './clients-remorques.tsx';
import Techniciens from './techniciens.tsx';
import MainOeuvres from './main-oeuvres.tsx';
import Vente from './vente.tsx';
import Planning from './planning.tsx';
import Comptoir from './comptoir.tsx';
import Dashboard from './dashboard.tsx';
import Annonces from './annonces.tsx';
import Campagnes from './campagnes.tsx';
import CommandesFournisseur from './commandes-fournisseur.tsx';
import Emails from './emails.tsx';
import SequenceEmails from './sequence-emails.tsx';

export function demo() {
    message.warning("Vous êtes sur une version de démonstration de moussAIllon. Il n'est pas possible d'ajouter ou supprimer des éléments.")
}

type UserTheme = 'LIGHT' | 'DARK';

function hasRole(roles: string, role: string): boolean {
    if (!roles) return false;
    const roleList = Array.isArray(roles) ? roles : roles.split(',').map(r => r.trim());
    return roleList.includes('admin') || roleList.includes(role);
}

function SideMenu(props) {

    const [ collapsed, setCollapsed ] = useState(false);
    const roles = props.roles || '';

    const allMenuItems = [
      { key: 'home', label: <Link to="/">Accueil</Link>, icon: <HomeOutlined/> },
      { key: 'dashboard', label: <Link to="/dashboard">Tableau de Bord</Link>, icon: <DashboardOutlined/> },
      { key: 'parc', label: 'Parc', icon: <Icon component={ ParcOutlined } />, requiredRole: 'manager', children: [
        { key: 'clients', label: <Link to="/clients">Clients</Link>, icon: <TeamOutlined /> },
        { key: 'bateaux', label: <Link to="/clients/bateaux">Bateaux</Link>, icon: <Icon component={ BoatOutlined } />},
        { key: 'moteurs', label: <Link to="/clients/moteurs">Moteurs</Link>, icon: <Icon component={ EngineOutlined } /> },
        { key: 'remorques', label: <Link to="/clients/remorques">Remorques</Link>, icon: <Icon component={ TailerOutlined } /> }
      ] },
      { key: 'catalogue', label: 'Catalogue', icon: <ReadOutlined/>, requiredRole: 'magasinier', children: [
        { key: 'produits', label: <Link to="/catalogue/produits">Produits</Link>, icon: <StockOutlined /> },
        { key: 'bateaux', label: <Link to="/catalogue/bateaux">Bateaux</Link>, icon: <Icon component={ BoatOutlined } /> },
        { key: 'moteurs', label: <Link to="/catalogue/moteurs">Moteurs</Link>, icon: <Icon component={ EngineOutlined } /> },
        { key: 'helices', label: <Link to="/catalogue/helices">Hélices</Link>, icon: <DeploymentUnitOutlined /> },
        { key: 'remorques', label: <Link to="/catalogue/remorques">Remorques</Link>, icon: <Icon component={ TailerOutlined } /> },
        { key: 'fournisseurs', label: <Link to="/catalogue/fournisseurs">Fournisseurs</Link>, icon: <FileProtectOutlined/> },
        { key: 'commandes-fournisseur', label: <Link to="/commandes-fournisseur">Commandes Fournisseur</Link>, icon: <ShoppingCartOutlined/> },
      ]},
      { key: 'Vente', label: 'Vente', icon: <StockOutlined/>, requiredRole: 'vendeur', children: [
        { key: 'comptoir', label: <Link to="/comptoir">Comptoir</Link>, icon: <DesktopOutlined/> },
        { key: 'prestations', label: <Link to="/prestations">Prestations</Link>, icon: <CheckSquareOutlined/> },
      ]},
      { key: 'atelier', label: 'Atelier', icon: <ToolOutlined/>, requiredRole: 'admin', children: [
        { key: 'main-oeuvres', label: <Link to="/main-oeuvres">Main d'Oeuvres</Link>, icon: <RedoOutlined/> },
        { key: 'forfaits', label: <Link to="/forfaits">Forfaits</Link>, icon: <FileDoneOutlined/> },
        { key: 'equipe', label: <Link to="/techniciens">Equipe</Link>, icon: <TeamOutlined/> },
        { key: 'planning', label: <Link to="/planning">Planning</Link>, icon: <CalendarOutlined/> },
      ] },
      { key: 'market', label: 'Marketing', icon: <AmazonOutlined/>, requiredRole: 'admin', children: [
        { key: 'annonces', label: <Link to="/annonces">Petites annonces</Link>, icon: <FileOutlined/> },
        { key: 'campagnes', label: <Link to="/campagnes">Campagnes</Link>, icon: <SendOutlined/> }
      ] },
      { key: 'parametrage', label: 'Paramétrage', icon: <SettingOutlined/>, requiredRole: 'admin', children: [
        { key: 'societe', label: <Link to="/societe">Société</Link>, icon: <DeploymentUnitOutlined/> },
        { key: 'utilisateurs', label: <Link to="/utilisateurs">Utilisateurs</Link>, icon: <UserOutlined/> },
        { key: 'emails', label: <Link to="/emails">Emails</Link>, icon: <MailOutlined/> },
        { key: 'sequence-emails', label: <Link to="/sequence-emails">Séquence emails</Link>, icon: <SendOutlined/> }
      ] }
    ];

    const menuItems = allMenuItems.filter(item => !item.requiredRole || hasRole(roles, item.requiredRole));

    return(
        <Layout.Sider
            theme={props.theme === 'DARK' ? 'dark' : 'light'}
            style={props.theme === 'DARK' ? { background: '#141414' } : { background: '#fff' }}
            collapsible={true}
            collapsed={collapsed}
            onCollapse={newValue => setCollapsed(newValue)}
        >
            <Menu
                theme={props.theme === 'DARK' ? 'dark' : 'light'}
                items={menuItems}
                mode="inline"
            />
        </Layout.Sider>
    );

}

function Header(props) {

    const { Search } = Input;
    const [ preferencesVisible, setPreferencesVisible ] = useState(false);
    const [ preferencesLoading, setPreferencesLoading ] = useState(false);
    const [ preferencesForm ] = Form.useForm();
    const [ selectedTheme, setSelectedTheme ] = useState<UserTheme>(props.theme || 'LIGHT');
    const [ formDirty, setFormDirty ] = useState(false);

    const handlePreferencesCancel = () => {
        if (formDirty) {
            Modal.confirm({
                title: "Modifications non enregistrées",
                content: "Vous avez des modifications non enregistrées. Voulez-vous vraiment fermer ?",
                okText: "Fermer",
                cancelText: "Annuler",
                onOk: () => {
                    setFormDirty(false);
                    preferencesForm.resetFields();
                    setPreferencesVisible(false);
                },
            });
        } else {
            preferencesForm.resetFields();
            setPreferencesVisible(false);
        }
    };

    const roleLabels = { admin: 'Admin', manager: 'Manager', magasinier: 'Magasinier', vendeur: 'Vendeur' };
    const userRoles = props.roles ? (Array.isArray(props.roles) ? props.roles : props.roles.split(',').map(r => r.trim())) : [];
    const roleDisplay = userRoles.map(r => roleLabels[r] || r).join(', ');

    const menuUser = [
              { key: 'user', label: <span>{props.user} <span style={{ fontSize: '0.8em', opacity: 0.7 }}>({roleDisplay})</span></span>, icon: <UserOutlined />, children: [
                { key: 'preferences', label: 'Préférences', icon: <SettingOutlined/> },
                { key: 'deconnexion', label: 'Déconnexion', icon: <DisconnectOutlined/> }
              ]}
    ];

    return(
        <Layout.Header style={{
            height: "80px",
            background: props.theme === 'DARK' ? '#1f1f1f' : '#fff',
            color: props.theme === 'DARK' ? '#f5f5f5' : undefined,
            padding: "5px",
            margin: "10px",
            borderRadius: 8
        }}>
            <Row align="middle" justify="center" wrap={false}>
                <Col span={3}><Image src="/logo.png" preview={false} width={75}/></Col>
                <Col span={19}><Search /></Col>
                <Col span={2}><Menu items={menuUser} onClick={(e) => {
                    if (e.key === 'deconnexion') {
                        props.setUser(null);
                    }
                    if (e.key === 'preferences') {
                        setSelectedTheme(props.theme || 'LIGHT');
                        preferencesForm.setFieldsValue({
                            currentPassword: '',
                            newPassword: '',
                            confirmPassword: ''
                        });
                        setFormDirty(false);
                        setPreferencesVisible(true);
                    }
                }} /></Col>
            </Row>
            <Modal
                open={preferencesVisible}
                title="Préférences"
                okText="Enregistrer"
                cancelText="Annuler"
                confirmLoading={preferencesLoading}
                onOk={() => preferencesForm.submit()}
                onCancel={handlePreferencesCancel}
                destroyOnHidden
            >
                <Form
                    form={preferencesForm}
                    layout="vertical"
                    onValuesChange={() => setFormDirty(true)}
                    onFinish={(values) => {
                        const shouldChangePassword = !!values.newPassword;
                        const shouldChangeTheme = selectedTheme !== props.theme;

                        if (!shouldChangePassword && !shouldChangeTheme) {
                            message.info('Aucune modification à enregistrer.');
                            return;
                        }

                        setPreferencesLoading(true);

                        const updatePassword = () => {
                            if (!shouldChangePassword) {
                                return Promise.resolve();
                            }
                            return fetchWithAuth(`/users/${encodeURIComponent(props.user)}/change-password`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    currentPassword: values.currentPassword,
                                    newPassword: values.newPassword
                                })
                            }).then(async (response) => {
                                if (!response.ok) {
                                    const errorText = await response.text();
                                    throw new Error(errorText || ('Erreur (code ' + response.status + ')'));
                                }
                            });
                        };

                        const updateTheme = () => {
                            if (!shouldChangeTheme) {
                                return Promise.resolve();
                            }
                            return fetchWithAuth(`/users/${encodeURIComponent(props.user)}`)
                                .then(async (response) => {
                                    if (!response.ok) {
                                        const errorText = await response.text();
                                        throw new Error(errorText || ('Erreur (code ' + response.status + ')'));
                                    }
                                    return response.json();
                                })
                                .then((userData) => {
                                    return fetchWithAuth(`/users/${encodeURIComponent(props.user)}`, {
                                        method: 'PUT',
                                        headers: {
                                            'Content-Type': 'application/json'
                                        },
                                        body: JSON.stringify({
                                            ...userData,
                                            theme: selectedTheme
                                        })
                                    });
                                })
                                .then(async (response) => {
                                    if (!response.ok) {
                                        const errorText = await response.text();
                                        throw new Error(errorText || ('Erreur (code ' + response.status + ')'));
                                    }
                                });
                        };

                        Promise.all([ updatePassword(), updateTheme() ])
                            .then(() => {
                                if (shouldChangePassword && shouldChangeTheme) {
                                    message.success('Préférences mises à jour.');
                                } else if (shouldChangePassword) {
                                    message.success('Mot de passe mis à jour.');
                                } else {
                                    message.success('Thème mis à jour.');
                                }
                                if (shouldChangeTheme) {
                                    props.setTheme(selectedTheme);
                                }
                                setFormDirty(false);
                                preferencesForm.resetFields();
                                setPreferencesVisible(false);
                            })
                            .catch((error) => {
                                message.error('Une erreur est survenue: ' + error.message);
                            })
                            .finally(() => {
                                setPreferencesLoading(false);
                            });
                    }}
                >
                    <Form.Item
                        name="currentPassword"
                        label="Mot de passe actuel"
                        rules={[
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    const hasNewPassword = !!getFieldValue('newPassword');
                                    if (!hasNewPassword || (value && value.trim())) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Le mot de passe actuel est requis pour modifier le mot de passe.'));
                                }
                            })
                        ]}
                    >
                        <Input.Password autoComplete="current-password" />
                    </Form.Item>
                    <Form.Item
                        name="newPassword"
                        label="Nouveau mot de passe"
                        rules={[
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    const hasCurrentPassword = !!getFieldValue('currentPassword');
                                    if (!value && !hasCurrentPassword) {
                                        return Promise.resolve();
                                    }
                                    if (!value) {
                                        return Promise.reject(new Error('Le nouveau mot de passe est requis.'));
                                    }
                                    if (value.length < 6) {
                                        return Promise.reject(new Error('Le mot de passe doit contenir au moins 6 caractères.'));
                                    }
                                    return Promise.resolve();
                                }
                            })
                        ]}
                    >
                        <Input.Password autoComplete="new-password" />
                    </Form.Item>
                    <Form.Item
                        name="confirmPassword"
                        label="Confirmation du mot de passe"
                        dependencies={['newPassword']}
                        rules={[
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    const nextPassword = getFieldValue('newPassword');
                                    if (!nextPassword && !value) {
                                        return Promise.resolve();
                                    }
                                    if (!value) {
                                        return Promise.reject(new Error('La confirmation du mot de passe est requise.'));
                                    }
                                    if (nextPassword === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('La confirmation ne correspond pas au nouveau mot de passe.'));
                                }
                            })
                        ]}
                    >
                        <Input.Password autoComplete="new-password" />
                    </Form.Item>
                    <Form.Item label="Thème">
                        <AntSwitch
                            checked={selectedTheme === 'DARK'}
                            checkedChildren="Sombre"
                            unCheckedChildren="Clair"
                            onChange={(checked) => setSelectedTheme(checked ? 'DARK' : 'LIGHT')}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </Layout.Header>
    );

}

function ProtectedRoute({ roles, requiredRole, children }) {
    if (requiredRole && !hasRole(roles, requiredRole)) {
        return <Result status="403" title="Accès refusé" subTitle="Vous n'avez pas les droits nécessaires pour accéder à cette page." />;
    }
    return children;
}

export default function Workspace(props) {
    const [ theme, setTheme ] = useState<UserTheme>('LIGHT');

    useEffect(() => {
        fetchWithAuth(`/users/${encodeURIComponent(props.user)}`)
            .then((response) => {
                if (!response.ok) {
                    return null;
                }
                return response.json();
            })
            .then((userData) => {
                if (!userData || !userData.theme) {
                    return;
                }
                const nextTheme = userData.theme === 'DARK' ? 'DARK' : 'LIGHT';
                setTheme(nextTheme);
            })
            .catch(() => {
                // Keep default LIGHT theme when user preferences cannot be loaded.
            });
    }, [ props.user ]);

    const isDarkTheme = theme === 'DARK';

    return(
        <ConfigProvider theme={{ algorithm: isDarkTheme ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm }}>
            <Layout style={{ height: "105vh", background: isDarkTheme ? '#101010' : '#f5f5f5' }}>
              <Header user={props.user} roles={props.roles} setUser={props.setUser} theme={theme} setTheme={setTheme} />
              <Layout hasSider={true}>
                <Router>
                <SideMenu user={props.user} roles={props.roles} theme={theme} />
                <Layout.Content style={{ margin: "15px", color: isDarkTheme ? '#f5f5f5' : undefined }}>
                    <Switch>
                        <Route path="/" key="home" exact={true}>
                            <Home/>
                        </Route>
                        <Route path="/dashboard" key="dashboard" exact={true}>
                            <Dashboard />
                        </Route>
                        <Route path="/clients" key="clients" exact={true}>
                            <ProtectedRoute roles={props.roles} requiredRole="manager"><Clients /></ProtectedRoute>
                        </Route>
                        <Route path="/clients/bateaux" key="clients-bateaux">
                            <ProtectedRoute roles={props.roles} requiredRole="manager"><BateauxClients /></ProtectedRoute>
                        </Route>
                        <Route path="/clients/moteurs" key="clients-moteurs">
                            <ProtectedRoute roles={props.roles} requiredRole="manager"><ClientsMoteurs /></ProtectedRoute>
                        </Route>
                        <Route path="/clients/remorques" key="clients-remorques">
                            <ProtectedRoute roles={props.roles} requiredRole="manager"><RemorquesClients /></ProtectedRoute>
                        </Route>
                        <Route path="/catalogue/produits" key="produits">
                            <ProtectedRoute roles={props.roles} requiredRole="magasinier"><Produits /></ProtectedRoute>
                        </Route>
                        <Route path="/catalogue/bateaux" key="catalogue-bateaux">
                            <ProtectedRoute roles={props.roles} requiredRole="magasinier"><CatalogueBateaux /></ProtectedRoute>
                        </Route>
                        <Route path="/catalogue/moteurs" key="catalogue-moteurs">
                            <ProtectedRoute roles={props.roles} requiredRole="magasinier"><CatalogueMoteurs /></ProtectedRoute>
                        </Route>
                        <Route path="/catalogue/helices" key="helices">
                            <ProtectedRoute roles={props.roles} requiredRole="magasinier"><CatalogueHelices /></ProtectedRoute>
                        </Route>
                        <Route path="/catalogue/remorques" key="catalogue-remorques">
                            <ProtectedRoute roles={props.roles} requiredRole="magasinier"><CatalogueRemorques /></ProtectedRoute>
                        </Route>
                        <Route path="/catalogue/fournisseurs" key="fournisseurs">
                            <ProtectedRoute roles={props.roles} requiredRole="magasinier"><Fournisseurs /></ProtectedRoute>
                        </Route>
                        <Route path="/commandes-fournisseur" key="commandes-fournisseur">
                            <ProtectedRoute roles={props.roles} requiredRole="magasinier"><CommandesFournisseur /></ProtectedRoute>
                        </Route>
                        <Route path="/societe" key="societe">
                            <ProtectedRoute roles={props.roles} requiredRole="admin"><Societe /></ProtectedRoute>
                        </Route>
                        <Route path="/utilisateurs" key="utilisateurs">
                            <ProtectedRoute roles={props.roles} requiredRole="admin"><Utilisateurs /></ProtectedRoute>
                        </Route>
                        <Route path="/emails" key="emails">
                            <ProtectedRoute roles={props.roles} requiredRole="admin"><Emails /></ProtectedRoute>
                        </Route>
                        <Route path="/sequence-emails" key="sequence-emails">
                            <ProtectedRoute roles={props.roles} requiredRole="admin"><SequenceEmails /></ProtectedRoute>
                        </Route>
                        <Route path="/prestations" key="prestations">
                            <ProtectedRoute roles={props.roles} requiredRole="vendeur"><Vente /></ProtectedRoute>
                        </Route>
                        <Route path="/comptoir" key="comptoir">
                            <ProtectedRoute roles={props.roles} requiredRole="vendeur"><Comptoir /></ProtectedRoute>
                        </Route>
                        <Route path="/forfaits" key="forfaits">
                            <ProtectedRoute roles={props.roles} requiredRole="admin"><Forfaits /></ProtectedRoute>
                        </Route>
                        <Route path="/techniciens" key="techniciens">
                            <ProtectedRoute roles={props.roles} requiredRole="admin"><Techniciens /></ProtectedRoute>
                        </Route>
                        <Route path="/main-oeuvres" key="main-oeuvres">
                            <ProtectedRoute roles={props.roles} requiredRole="admin"><MainOeuvres /></ProtectedRoute>
                        </Route>
                        <Route path="/planning" key="planning">
                            <ProtectedRoute roles={props.roles} requiredRole="admin"><Planning /></ProtectedRoute>
                        </Route>
                        <Route path="/annonces" key="annonces">
                            <ProtectedRoute roles={props.roles} requiredRole="admin"><Annonces /></ProtectedRoute>
                        </Route>
                        <Route path="/campagnes" key="campagnes">
                            <ProtectedRoute roles={props.roles} requiredRole="admin"><Campagnes /></ProtectedRoute>
                        </Route>
                    </Switch>
                </Layout.Content>
                </Router>
              </Layout>
              <Layout.Footer style={{ background: isDarkTheme ? '#141414' : undefined, color: isDarkTheme ? '#f5f5f5' : undefined }}>
                  Copyright © 2025-2026 - NOSE Experts - Tous droits réservés
              </Layout.Footer>
            </Layout>
        </ConfigProvider>
    );

}
