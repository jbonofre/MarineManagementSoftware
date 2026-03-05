import React, { useEffect, useState } from 'react';
import {
    Button,
    Card,
    List,
    Modal,
    Segmented,
    Space,
    Spin,
    Statistic,
    Tag,
    message,
} from 'antd';
import {
    ShopOutlined,
    ToolOutlined,
    CarOutlined,
    FileTextOutlined,
    UserOutlined,
    LogoutOutlined,
    CreditCardOutlined,
    EyeOutlined,
    ReloadOutlined,
} from '@ant-design/icons';
import axios from 'axios';

interface Client {
    id: number;
    prenom?: string;
    nom: string;
    type: string;
    email?: string;
    telephone?: string;
    adresse?: string;
    siren?: string;
    siret?: string;
    tva?: string;
    naf?: string;
}

interface BateauClientEntity {
    id: number;
    name?: string;
    immatriculation?: string;
    dateFinDeGuarantie?: string;
    localisation?: string;
    modele?: { nom?: string; marque?: string };
}

interface MoteurClientEntity {
    id: number;
    numeroSerie?: string;
    dateFinDeGuarantie?: string;
    modele?: { nom?: string; marque?: string };
}

interface RemorqueClientEntity {
    id: number;
    immatriculation?: string;
    dateFinDeGuarantie?: string;
    modele?: { nom?: string; marque?: string };
}

interface VenteEntity {
    id: number;
    status: string;
    type: string;
    date?: string;
    prixVenteTTC?: number;
    montantHT?: number;
    montantTTC?: number;
    montantTVA?: number;
    remise?: number;
    modePaiement?: string;
    forfaits?: Array<{ id: number; nom: string; reference?: string; prixTTC?: number }>;
    produits?: Array<{ id: number; nom: string; marque?: string; prixVenteTTC?: number }>;
    services?: Array<{ id: number; nom: string; prixTTC?: number }>;
}

interface MobileAppProps {
    user: Client;
    onLogout: () => void;
}

type Page = 'dashboard' | 'bateaux' | 'moteurs' | 'remorques' | 'factures' | 'profil';

const formatDate = (value?: string) => {
    if (!value) return '-';
    const parsed = new Date(value);
    if (isNaN(parsed.getTime())) return value;
    return parsed.toLocaleDateString('fr-FR');
};

const formatEuro = (value?: number) => `${(value || 0).toFixed(2)} EUR`;

const statusColor: Record<string, string> = { EN_ATTENTE: 'orange', EN_COURS: 'blue', PAYEE: 'green', ANNULEE: 'red' };
const statusLabel: Record<string, string> = { EN_ATTENTE: 'En attente', EN_COURS: 'En cours', PAYEE: 'Payee', ANNULEE: 'Annulee' };
const typeLabel: Record<string, string> = { DEVIS: 'Devis', FACTURE: 'Facture', COMMANDE: 'Commande', LIVRAISON: 'Livraison', COMPTOIR: 'Comptoir', PARTICULIER: 'Particulier', PROFESSIONNEL: 'Professionnel', PROFESSIONNEL_MER: 'Pro. de la Mer' };

const warrantyTag = (date?: string) => {
    if (!date) return '-';
    const isExpired = new Date(date) < new Date();
    return <Tag color={isExpired ? 'red' : 'green'}>{formatDate(date)}</Tag>;
};

const modelLabel = (modele?: { nom?: string; marque?: string }) =>
    modele ? `${modele.marque || ''} ${modele.nom || ''}`.trim() || '-' : '-';

export default function MobileApp({ user, onLogout }: MobileAppProps) {
    const [page, setPage] = useState<Page>('dashboard');
    const [loading, setLoading] = useState(false);
    const [bateaux, setBateaux] = useState<BateauClientEntity[]>([]);
    const [moteurs, setMoteurs] = useState<MoteurClientEntity[]>([]);
    const [remorques, setRemorques] = useState<RemorqueClientEntity[]>([]);
    const [ventes, setVentes] = useState<VenteEntity[]>([]);
    const [detailVente, setDetailVente] = useState<VenteEntity | null>(null);
    const [profile, setProfile] = useState<Client | null>(null);

    const clientName = `${user.prenom || ''} ${user.nom}`.trim();
    const clientId = user.id;

    const fetchData = async (p: Page) => {
        setLoading(true);
        try {
            switch (p) {
                case 'dashboard': {
                    const [b, m, r, v] = await Promise.all([
                        axios.get(`/portal/clients/${clientId}/bateaux`),
                        axios.get(`/portal/clients/${clientId}/moteurs`),
                        axios.get(`/portal/clients/${clientId}/remorques`),
                        axios.get(`/portal/clients/${clientId}/ventes`),
                    ]);
                    setBateaux(b.data || []);
                    setMoteurs(m.data || []);
                    setRemorques(r.data || []);
                    setVentes(v.data || []);
                    break;
                }
                case 'bateaux': {
                    const res = await axios.get(`/portal/clients/${clientId}/bateaux`);
                    setBateaux(res.data || []);
                    break;
                }
                case 'moteurs': {
                    const res = await axios.get(`/portal/clients/${clientId}/moteurs`);
                    setMoteurs(res.data || []);
                    break;
                }
                case 'remorques': {
                    const res = await axios.get(`/portal/clients/${clientId}/remorques`);
                    setRemorques(res.data || []);
                    break;
                }
                case 'factures': {
                    const res = await axios.get(`/portal/clients/${clientId}/ventes`);
                    setVentes(res.data || []);
                    break;
                }
                case 'profil': {
                    const res = await axios.get(`/portal/clients/${clientId}`);
                    setProfile(res.data);
                    break;
                }
            }
        } catch {
            message.error('Erreur lors du chargement');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(page);
    }, [page, clientId]);

    const handlePayment = async (vente: VenteEntity, provider: 'stripe' | 'payplug') => {
        try {
            const res = await axios.post(`/ventes/${vente.id}/payment-link/${provider}`);
            window.open(res.data.url, '_blank', 'noopener,noreferrer');
        } catch {
            message.error('Erreur lors de la creation du lien de paiement');
        }
    };

    const renderDashboard = () => (
        <div>
            <Card size="small" style={{ marginBottom: 8 }}><Statistic title="Bateaux" value={bateaux.length} prefix={<ShopOutlined />} /></Card>
            <Card size="small" style={{ marginBottom: 8 }}><Statistic title="Moteurs" value={moteurs.length} prefix={<ToolOutlined />} /></Card>
            <Card size="small" style={{ marginBottom: 8 }}><Statistic title="Remorques" value={remorques.length} prefix={<CarOutlined />} /></Card>
            <Card size="small" style={{ marginBottom: 8 }}><Statistic title="Factures" value={ventes.length} prefix={<FileTextOutlined />} /></Card>
        </div>
    );

    const renderBateaux = () => (
        <List
            dataSource={bateaux}
            renderItem={(b) => (
                <Card size="small" style={{ marginBottom: 8 }}>
                    <p style={{ fontWeight: 'bold', marginBottom: 4 }}>{b.name || b.immatriculation || `Bateau #${b.id}`}</p>
                    <p style={{ margin: 0 }}>Modele: {modelLabel(b.modele)}</p>
                    <p style={{ margin: 0 }}>Immat.: {b.immatriculation || '-'}</p>
                    <p style={{ margin: 0 }}>Lieu: {b.localisation || '-'}</p>
                    <p style={{ margin: 0 }}>Garantie: {warrantyTag(b.dateFinDeGuarantie)}</p>
                </Card>
            )}
        />
    );

    const renderMoteurs = () => (
        <List
            dataSource={moteurs}
            renderItem={(m) => (
                <Card size="small" style={{ marginBottom: 8 }}>
                    <p style={{ fontWeight: 'bold', marginBottom: 4 }}>{m.numeroSerie || `Moteur #${m.id}`}</p>
                    <p style={{ margin: 0 }}>Modele: {modelLabel(m.modele)}</p>
                    <p style={{ margin: 0 }}>Garantie: {warrantyTag(m.dateFinDeGuarantie)}</p>
                </Card>
            )}
        />
    );

    const renderRemorques = () => (
        <List
            dataSource={remorques}
            renderItem={(r) => (
                <Card size="small" style={{ marginBottom: 8 }}>
                    <p style={{ fontWeight: 'bold', marginBottom: 4 }}>{r.immatriculation || `Remorque #${r.id}`}</p>
                    <p style={{ margin: 0 }}>Modele: {modelLabel(r.modele)}</p>
                    <p style={{ margin: 0 }}>Garantie: {warrantyTag(r.dateFinDeGuarantie)}</p>
                </Card>
            )}
        />
    );

    const renderFactures = () => (
        <>
            <List
                dataSource={ventes}
                renderItem={(v) => (
                    <Card size="small" style={{ marginBottom: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                            <span style={{ fontWeight: 'bold' }}>#{v.id} - {typeLabel[v.type] || v.type}</span>
                            <Tag color={statusColor[v.status]}>{statusLabel[v.status] || v.status}</Tag>
                        </div>
                        <p style={{ margin: 0 }}>Date: {formatDate(v.date)}</p>
                        <p style={{ margin: 0, fontWeight: 'bold' }}>Total: {formatEuro(v.prixVenteTTC)}</p>
                        <Space style={{ marginTop: 8 }} wrap>
                            <Button size="small" icon={<EyeOutlined />} onClick={() => setDetailVente(v)}>Detail</Button>
                            {v.status !== 'PAYEE' && v.status !== 'ANNULEE' && (
                                <>
                                    <Button size="small" icon={<CreditCardOutlined />} onClick={() => handlePayment(v, 'stripe')}>Stripe</Button>
                                    <Button size="small" icon={<CreditCardOutlined />} onClick={() => handlePayment(v, 'payplug')}>PayPlug</Button>
                                </>
                            )}
                        </Space>
                    </Card>
                )}
            />
            <Modal
                title={detailVente ? `${typeLabel[detailVente.type] || detailVente.type} #${detailVente.id}` : ''}
                open={!!detailVente}
                onCancel={() => setDetailVente(null)}
                footer={null}
                width="95vw"
                style={{ top: 20 }}
            >
                {detailVente && (
                    <div>
                        <p><strong>Date:</strong> {formatDate(detailVente.date)}</p>
                        <p><strong>Statut:</strong> <Tag color={statusColor[detailVente.status]}>{statusLabel[detailVente.status]}</Tag></p>
                        <p><strong>Paiement:</strong> {detailVente.modePaiement || '-'}</p>
                        {(detailVente.forfaits || []).map((f) => (
                            <Card size="small" key={`f-${f.id}`} style={{ marginBottom: 4 }}>
                                <span>Forfait: {f.reference ? `${f.reference} - ` : ''}{f.nom}</span>
                                <span style={{ float: 'right' }}>{formatEuro(f.prixTTC)}</span>
                            </Card>
                        ))}
                        {(detailVente.produits || []).map((p, i) => (
                            <Card size="small" key={`p-${p.id}-${i}`} style={{ marginBottom: 4 }}>
                                <span>Produit: {p.marque ? `${p.nom} (${p.marque})` : p.nom}</span>
                                <span style={{ float: 'right' }}>{formatEuro(p.prixVenteTTC)}</span>
                            </Card>
                        ))}
                        {(detailVente.services || []).map((s) => (
                            <Card size="small" key={`s-${s.id}`} style={{ marginBottom: 4 }}>
                                <span>Service: {s.nom}</span>
                                <span style={{ float: 'right' }}>{formatEuro(s.prixTTC)}</span>
                            </Card>
                        ))}
                        <div style={{ marginTop: 12, borderTop: '1px solid #f0f0f0', paddingTop: 8 }}>
                            <p><strong>HT:</strong> {formatEuro(detailVente.montantHT)}</p>
                            <p><strong>TVA:</strong> {formatEuro(detailVente.montantTVA)}</p>
                            <p><strong>TTC:</strong> {formatEuro(detailVente.montantTTC)}</p>
                            {(detailVente.remise || 0) > 0 && <p><strong>Remise:</strong> {formatEuro(detailVente.remise)}</p>}
                            <p style={{ fontSize: 16 }}><strong>Total: {formatEuro(detailVente.prixVenteTTC)}</strong></p>
                        </div>
                    </div>
                )}
            </Modal>
        </>
    );

    const renderProfil = () => (
        <Card size="small">
            {profile && (
                <div>
                    <p><strong>Nom:</strong> {profile.nom}</p>
                    <p><strong>Prenom:</strong> {profile.prenom || '-'}</p>
                    <p><strong>Type:</strong> <Tag>{typeLabel[profile.type] || profile.type}</Tag></p>
                    <p><strong>Email:</strong> {profile.email || '-'}</p>
                    <p><strong>Telephone:</strong> {profile.telephone || '-'}</p>
                    <p><strong>Adresse:</strong> {profile.adresse || '-'}</p>
                    {profile.type !== 'PARTICULIER' && (
                        <>
                            <p><strong>SIREN:</strong> {profile.siren || '-'}</p>
                            <p><strong>SIRET:</strong> {profile.siret || '-'}</p>
                            <p><strong>TVA:</strong> {profile.tva || '-'}</p>
                            <p><strong>NAF:</strong> {profile.naf || '-'}</p>
                        </>
                    )}
                </div>
            )}
        </Card>
    );

    const pageTitle: Record<Page, string> = {
        dashboard: 'Tableau de bord',
        bateaux: 'Mes bateaux',
        moteurs: 'Mes moteurs',
        remorques: 'Mes remorques',
        factures: 'Mes factures',
        profil: 'Mon profil',
    };

    const renderContent = () => {
        switch (page) {
            case 'bateaux': return renderBateaux();
            case 'moteurs': return renderMoteurs();
            case 'remorques': return renderRemorques();
            case 'factures': return renderFactures();
            case 'profil': return renderProfil();
            default: return renderDashboard();
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            {/* Header */}
            <div style={{ background: '#001529', color: '#fff', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold' }}><UserOutlined /> {clientName}</span>
                <Button size="small" icon={<LogoutOutlined />} onClick={onLogout} ghost>Quitter</Button>
            </div>

            {/* Content */}
            <div style={{ flex: 1, padding: 12, background: '#f5f5f5' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <h3 style={{ margin: 0 }}>{pageTitle[page]}</h3>
                    <Button size="small" icon={<ReloadOutlined />} onClick={() => fetchData(page)} />
                </div>
                <Spin spinning={loading}>
                    {renderContent()}
                </Spin>
            </div>

            {/* Bottom tab bar */}
            <div style={{ borderTop: '1px solid #e8e8e8', background: '#fff', padding: '4px 0', position: 'sticky', bottom: 0 }}>
                <Segmented
                    block
                    value={page}
                    onChange={(val) => setPage(val as Page)}
                    options={[
                        { value: 'dashboard', icon: <ShopOutlined />, label: '' },
                        { value: 'bateaux', icon: <ShopOutlined />, label: '' },
                        { value: 'moteurs', icon: <ToolOutlined />, label: '' },
                        { value: 'remorques', icon: <CarOutlined />, label: '' },
                        { value: 'factures', icon: <FileTextOutlined />, label: '' },
                        { value: 'profil', icon: <UserOutlined />, label: '' },
                    ]}
                    style={{ borderRadius: 0 }}
                />
            </div>
        </div>
    );
}
