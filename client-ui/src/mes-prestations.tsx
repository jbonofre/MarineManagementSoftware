import React, { useEffect, useState } from 'react';
import { Card, Collapse, Empty, Modal, Progress, Spin, Steps, Table, Tag, message } from 'antd';
import {
    ClockCircleOutlined,
    CheckCircleOutlined,
    ExclamationCircleOutlined,
    SyncOutlined,
    CalendarOutlined,
    StopOutlined,
} from '@ant-design/icons';
import axios from 'axios';

interface PrestationEntity {
    id: number;
    nom: string;
    status: string;
    dateDebut?: string;
    dateFin?: string;
    statusDate?: string;
    description?: string;
    notes?: string;
    technicien?: { id: number; nom: string; prenom?: string };
    dureeEstimee: number;
    dureeReelle: number;
    incidentDate?: string;
    incidentDetails?: string;
    taches?: Array<{ id: number; nom?: string; description?: string; completed: boolean }>;
}

interface VenteEntity {
    id: number;
    status: string;
    type: string;
    date?: string;
    bateau?: { name?: string; immatriculation?: string };
    moteur?: { numeroSerie?: string; modele?: { nom?: string; marque?: string } };
    remorque?: { immatriculation?: string };
    prestations?: PrestationEntity[];
}

interface MesPrestationsProps {
    clientId: number;
}

const formatDate = (value?: string) => {
    if (!value) return '-';
    const parsed = new Date(value);
    if (isNaN(parsed.getTime())) return value;
    return parsed.toLocaleDateString('fr-FR');
};

const taskStatusColor: Record<string, string> = {
    EN_ATTENTE: 'orange',
    PLANIFIEE: 'cyan',
    EN_COURS: 'blue',
    TERMINEE: 'green',
    INCIDENT: 'red',
    ANNULEE: 'default',
};

const taskStatusLabel: Record<string, string> = {
    EN_ATTENTE: 'En attente',
    PLANIFIEE: 'Planifiee',
    EN_COURS: 'En cours',
    TERMINEE: 'Terminee',
    INCIDENT: 'Incident',
    ANNULEE: 'Annulee',
};

const taskStatusIcon: Record<string, React.ReactNode> = {
    EN_ATTENTE: <ClockCircleOutlined />,
    PLANIFIEE: <CalendarOutlined />,
    EN_COURS: <SyncOutlined spin />,
    TERMINEE: <CheckCircleOutlined />,
    INCIDENT: <ExclamationCircleOutlined />,
    ANNULEE: <StopOutlined />,
};

const typeLabel: Record<string, string> = {
    DEVIS: 'Devis',
    FACTURE: 'Facture',
    COMMANDE: 'Commande',
    LIVRAISON: 'Livraison',
    COMPTOIR: 'Comptoir',
};

const statusOrder = ['EN_ATTENTE', 'PLANIFIEE', 'EN_COURS', 'TERMINEE'];

function computeProgress(prestations: PrestationEntity[]): number {
    if (prestations.length === 0) return 0;
    const done = prestations.filter((t) => t.status === 'TERMINEE').length;
    return Math.round((done / prestations.length) * 100);
}

function stepIndex(status: string): number {
    const idx = statusOrder.indexOf(status);
    return idx >= 0 ? idx : 0;
}

function assetLabel(vente: VenteEntity): string {
    if (vente.bateau) return vente.bateau.name || vente.bateau.immatriculation || '';
    if (vente.moteur) {
        const m = vente.moteur;
        return m.modele ? `${m.modele.marque || ''} ${m.modele.nom || ''}`.trim() : m.numeroSerie || '';
    }
    if (vente.remorque) return vente.remorque.immatriculation || '';
    return '';
}

export default function MesPrestations({ clientId }: MesPrestationsProps) {
    const [ventes, setVentes] = useState<VenteEntity[]>([]);
    const [loading, setLoading] = useState(false);
    const [detailTask, setDetailTask] = useState<PrestationEntity | null>(null);

    useEffect(() => {
        setLoading(true);
        axios.get(`/portal/clients/${clientId}/ventes`)
            .then((res) => setVentes((res.data || []).filter((v: VenteEntity) => (v.prestations || []).length > 0)))
            .catch(() => message.error('Erreur lors du chargement des prestations'))
            .finally(() => setLoading(false));
    }, [clientId]);

    const allTasks = ventes.flatMap((v) => (v.prestations || []).map((t) => ({ ...t, venteId: v.id, venteType: v.type })));
    const enCours = allTasks.filter((t) => t.status === 'EN_COURS').length;
    const terminees = allTasks.filter((t) => t.status === 'TERMINEE').length;
    const incidents = allTasks.filter((t) => t.status === 'INCIDENT').length;
    const globalProgress = allTasks.length > 0 ? Math.round((terminees / allTasks.length) * 100) : 0;

    const columns = [
        {
            title: 'Prestation',
            dataIndex: 'nom',
            key: 'nom',
            render: (val: string, record: PrestationEntity) => (
                <a onClick={() => setDetailTask(record)}>{val || `Tache #${record.id}`}</a>
            ),
        },
        {
            title: 'Statut',
            dataIndex: 'status',
            key: 'status',
            render: (val: string) => (
                <Tag icon={taskStatusIcon[val]} color={taskStatusColor[val]}>
                    {taskStatusLabel[val] || val}
                </Tag>
            ),
        },
        {
            title: 'Debut',
            dataIndex: 'dateDebut',
            key: 'dateDebut',
            render: (val: string) => formatDate(val),
        },
        {
            title: 'Fin',
            dataIndex: 'dateFin',
            key: 'dateFin',
            render: (val: string) => formatDate(val),
        },
        {
            title: 'Technicien',
            dataIndex: 'technicien',
            key: 'technicien',
            render: (tech: PrestationEntity['technicien']) =>
                tech ? `${tech.prenom || ''} ${tech.nom}`.trim() : '-',
        },
    ];

    return (
        <Card title="Suivi de mes prestations">
            <Spin spinning={loading}>
                {/* Summary cards */}
                <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
                    <Card size="small" style={{ flex: 1, minWidth: 140, textAlign: 'center' }}>
                        <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>{allTasks.length}</div>
                        <div>Total prestations</div>
                    </Card>
                    <Card size="small" style={{ flex: 1, minWidth: 140, textAlign: 'center' }}>
                        <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>{enCours}</div>
                        <div>En cours</div>
                    </Card>
                    <Card size="small" style={{ flex: 1, minWidth: 140, textAlign: 'center' }}>
                        <div style={{ fontSize: 24, fontWeight: 'bold', color: '#52c41a' }}>{terminees}</div>
                        <div>Terminees</div>
                    </Card>
                    {incidents > 0 && (
                        <Card size="small" style={{ flex: 1, minWidth: 140, textAlign: 'center' }}>
                            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#ff4d4f' }}>{incidents}</div>
                            <div>Incidents</div>
                        </Card>
                    )}
                    <Card size="small" style={{ flex: 1, minWidth: 180, textAlign: 'center' }}>
                        <Progress type="circle" percent={globalProgress} size={60} />
                        <div style={{ marginTop: 4 }}>Avancement global</div>
                    </Card>
                </div>

                {ventes.length === 0 && !loading && (
                    <Empty description="Aucune prestation en cours" />
                )}

                {/* Ventes with tasks */}
                <Collapse
                    defaultActiveKey={ventes.filter((v) => (v.prestations || []).some((t) => t.status !== 'TERMINEE' && t.status !== 'ANNULEE')).map((v) => String(v.id))}
                    items={ventes.map((vente) => {
                        const prestations = vente.prestations || [];
                        const progress = computeProgress(prestations);
                        const asset = assetLabel(vente);
                        const title = `${typeLabel[vente.type] || vente.type} #${vente.id}${asset ? ` - ${asset}` : ''} (${formatDate(vente.date)})`;

                        return {
                            key: String(vente.id),
                            label: (
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                    <span>{title}</span>
                                    <Progress percent={progress} size="small" style={{ width: 120, marginLeft: 16 }} />
                                </div>
                            ),
                            children: (
                                <Table
                                    rowKey="id"
                                    dataSource={prestations}
                                    columns={columns}
                                    pagination={false}
                                    size="small"
                                    bordered
                                />
                            ),
                        };
                    })}
                />
            </Spin>

            {/* Task detail modal */}
            <Modal
                title={detailTask ? (detailTask.nom || `Tache #${detailTask.id}`) : ''}
                open={!!detailTask}
                onCancel={() => setDetailTask(null)}
                footer={null}
                width={600}
            >
                {detailTask && (
                    <div>
                        <Steps
                            current={stepIndex(detailTask.status)}
                            status={detailTask.status === 'INCIDENT' ? 'error' : undefined}
                            size="small"
                            style={{ marginBottom: 24 }}
                            items={[
                                { title: 'En attente' },
                                { title: 'Planifiee' },
                                { title: 'En cours' },
                                { title: 'Terminee' },
                            ]}
                        />

                        <p><strong>Statut :</strong>{' '}
                            <Tag icon={taskStatusIcon[detailTask.status]} color={taskStatusColor[detailTask.status]}>
                                {taskStatusLabel[detailTask.status] || detailTask.status}
                            </Tag>
                        </p>
                        {detailTask.description && (
                            <p><strong>Description :</strong> {detailTask.description}</p>
                        )}
                        <p><strong>Date de debut :</strong> {formatDate(detailTask.dateDebut)}</p>
                        <p><strong>Date de fin :</strong> {formatDate(detailTask.dateFin)}</p>
                        <p><strong>Technicien :</strong>{' '}
                            {detailTask.technicien
                                ? `${detailTask.technicien.prenom || ''} ${detailTask.technicien.nom}`.trim()
                                : 'Non assigne'}
                        </p>
                        <p><strong>Duree estimee :</strong> {detailTask.dureeEstimee != null ? `${detailTask.dureeEstimee}h` : '-'}</p>
                        <p><strong>Duree reelle :</strong> {detailTask.dureeReelle != null ? `${detailTask.dureeReelle}h` : '-'}</p>
                        {detailTask.notes && (
                            <p><strong>Notes :</strong> {detailTask.notes}</p>
                        )}

                        {(detailTask.taches || []).length > 0 && (
                            <div style={{ marginTop: 12 }}>
                                <strong>Checklist :</strong>
                                <ul style={{ listStyle: 'none', padding: 0, marginTop: 8 }}>
                                    {detailTask.taches!.map((tache) => (
                                        <li key={tache.id} style={{ padding: '4px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <CheckCircleOutlined style={{ color: tache.completed ? '#52c41a' : '#d9d9d9' }} />
                                            <span style={{ textDecoration: tache.completed ? 'line-through' : 'none', color: tache.completed ? '#999' : undefined }}>
                                                {tache.nom || tache.description || `Tache #${tache.id}`}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {detailTask.status === 'INCIDENT' && (
                            <Card size="small" style={{ background: '#fff2f0', borderColor: '#ffccc7', marginTop: 12 }}>
                                <p style={{ color: '#ff4d4f', fontWeight: 'bold', marginBottom: 4 }}>
                                    <ExclamationCircleOutlined /> Incident signale
                                </p>
                                <p><strong>Date :</strong> {formatDate(detailTask.incidentDate)}</p>
                                <p style={{ margin: 0 }}>{detailTask.incidentDetails || 'Aucun detail'}</p>
                            </Card>
                        )}

                        {detailTask.statusDate && (
                            <p style={{ marginTop: 12, color: '#999', fontSize: 12 }}>
                                Derniere mise a jour : {new Date(detailTask.statusDate).toLocaleString('fr-FR')}
                            </p>
                        )}
                    </div>
                )}
            </Modal>
        </Card>
    );
}
