import React, { useEffect, useState } from 'react';
import {
    Button,
    Card,
    Form,
    Input,
    Modal,
    Popconfirm,
    Select,
    Space,
    Table,
    Tag,
    message,
} from 'antd';
import { DeleteOutlined, EditOutlined, EyeOutlined, PlusCircleOutlined, SendOutlined } from '@ant-design/icons';
import api from './api.ts';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

interface Campagne {
    id: number;
    nom: string;
    canal: string;
    cible: string;
    statut: string;
    sujet?: string;
    contenu?: string;
    nombreDestinataires?: number;
    dateCreation?: string;
    dateEnvoi?: string;
}

interface Destinataire {
    nom: string;
    email: string;
}

const canalOptions = [
    { value: 'EMAIL', label: 'Email' },
    { value: 'SMS', label: 'SMS' },
];

const cibleOptions = [
    { value: 'PROPRIETAIRE_BATEAU', label: 'Propriétaires de bateaux' },
    { value: 'PROPRIETAIRE_MOTEUR', label: 'Propriétaires de moteurs' },
    { value: 'PROPRIETAIRE_REMORQUE', label: 'Propriétaires de remorques' },
    { value: 'FOURNISSEUR', label: 'Fournisseurs' },
];

const statutColor: Record<string, string> = { BROUILLON: 'orange', ENVOYEE: 'green' };
const statutLabel: Record<string, string> = { BROUILLON: 'Brouillon', ENVOYEE: 'Envoyée' };
const canalLabel: Record<string, string> = { EMAIL: 'Email', SMS: 'SMS' };
const cibleLabel: Record<string, string> = {
    PROPRIETAIRE_BATEAU: 'Propriétaires de bateaux',
    PROPRIETAIRE_MOTEUR: 'Propriétaires de moteurs',
    PROPRIETAIRE_REMORQUE: 'Propriétaires de remorques',
    FOURNISSEUR: 'Fournisseurs',
};

const formatDate = (value?: string) => {
    if (!value) return '-';
    const parsed = new Date(value);
    if (isNaN(parsed.getTime())) return value;
    return parsed.toLocaleDateString('fr-FR') + ' ' + parsed.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
};

export default function Campagnes() {
    const [campagnes, setCampagnes] = useState<Campagne[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<Campagne | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [detailCampagne, setDetailCampagne] = useState<Campagne | null>(null);
    const [destinataires, setDestinataires] = useState<Destinataire[]>([]);
    const [destLoading, setDestLoading] = useState(false);
    const [contenu, setContenu] = useState('');
    const [selectedCanal, setSelectedCanal] = useState<string>('EMAIL');
    const [form] = Form.useForm();
    const [formDirty, setFormDirty] = useState(false);

    const fetchCampagnes = () => {
        setLoading(true);
        api.get('/campagnes')
            .then((res) => setCampagnes(res.data || []))
            .catch(() => message.error('Erreur lors du chargement des campagnes'))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchCampagnes();
    }, []);

    const openCreate = () => {
        setEditing(null);
        form.resetFields();
        form.setFieldsValue({ canal: 'EMAIL', cible: 'PROPRIETAIRE_BATEAU' });
        setContenu('');
        setSelectedCanal('EMAIL');
        setFormDirty(false);
        setModalOpen(true);
    };

    const openEdit = (campagne: Campagne) => {
        setEditing(campagne);
        form.setFieldsValue({
            nom: campagne.nom,
            canal: campagne.canal,
            cible: campagne.cible,
            sujet: campagne.sujet,
        });
        setContenu(campagne.contenu || '');
        setSelectedCanal(campagne.canal);
        setFormDirty(false);
        setModalOpen(true);
    };

    const handleModalCancel = () => {
        if (formDirty) {
            Modal.confirm({
                title: "Modifications non enregistrées",
                content: "Vous avez des modifications non enregistrées. Voulez-vous vraiment fermer ?",
                okText: "Fermer",
                cancelText: "Annuler",
                onOk: () => {
                    setFormDirty(false);
                    setModalOpen(false);
                },
            });
        } else {
            setModalOpen(false);
        }
    };

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            const payload = {
                nom: values.nom,
                canal: values.canal,
                cible: values.cible,
                sujet: values.sujet,
                contenu: contenu,
            };
            if (editing) {
                await api.put(`/campagnes/${editing.id}`, payload);
                message.success('Campagne mise à jour');
            } else {
                await api.post('/campagnes', payload);
                message.success('Campagne créée');
            }
            setFormDirty(false);
            setModalOpen(false);
            fetchCampagnes();
        } catch {
            // validation error
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await api.delete(`/campagnes/${id}`);
            message.success('Campagne supprimée');
            fetchCampagnes();
        } catch {
            message.error('Erreur lors de la suppression');
        }
    };

    const openDetail = (campagne: Campagne) => {
        setDetailCampagne(campagne);
        setDestinataires([]);
        setDetailOpen(true);
        setDestLoading(true);
        api.get(`/campagnes/${campagne.id}/destinataires`)
            .then((res) => setDestinataires(res.data || []))
            .catch(() => {})
            .finally(() => setDestLoading(false));
    };

    const handleEnvoyer = async (campagne: Campagne) => {
        try {
            await api.post(`/campagnes/${campagne.id}/envoyer`);
            message.success('Campagne envoyée avec succès');
            fetchCampagnes();
        } catch (err: any) {
            const msg = err?.response?.data || 'Erreur lors de l\'envoi';
            message.error(typeof msg === 'string' ? msg : 'Erreur lors de l\'envoi');
        }
    };

    const columns = [
        { title: 'Nom', dataIndex: 'nom', key: 'nom' },
        {
            title: 'Canal',
            dataIndex: 'canal',
            key: 'canal',
            render: (val: string) => <Tag color={val === 'EMAIL' ? 'blue' : 'purple'}>{canalLabel[val] || val}</Tag>,
        },
        {
            title: 'Cible',
            dataIndex: 'cible',
            key: 'cible',
            render: (val: string) => cibleLabel[val] || val,
        },
        {
            title: 'Statut',
            dataIndex: 'statut',
            key: 'statut',
            render: (val: string) => <Tag color={statutColor[val]}>{statutLabel[val] || val}</Tag>,
        },
        {
            title: 'Destinataires',
            dataIndex: 'nombreDestinataires',
            key: 'nombreDestinataires',
            render: (val: number, record: Campagne) => record.statut === 'ENVOYEE' ? val : '-',
        },
        {
            title: 'Date envoi',
            dataIndex: 'dateEnvoi',
            key: 'dateEnvoi',
            render: (val: string) => formatDate(val),
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 280,
            render: (_: unknown, record: Campagne) => (
                <Space wrap size={[4, 4]}>
                    <Button size="small" icon={<EyeOutlined />} onClick={() => openDetail(record)} />
                    {record.statut === 'BROUILLON' && (
                        <>
                            <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
                            <Popconfirm
                                title="Envoyer cette campagne ?"
                                description="Cette action est irréversible."
                                onConfirm={() => handleEnvoyer(record)}
                            >
                                <Button size="small" type="primary" icon={<SendOutlined />}>Envoyer</Button>
                            </Popconfirm>
                        </>
                    )}
                    <Popconfirm title="Supprimer cette campagne ?" onConfirm={() => handleDelete(record.id)}>
                        <Button size="small" icon={<DeleteOutlined />} danger />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const destColumns = [
        { title: 'Nom', dataIndex: 'nom', key: 'nom' },
        { title: selectedCanal === 'SMS' ? 'Téléphone' : 'Email', dataIndex: 'email', key: 'email' },
    ];

    return (
        <Card
            title="Campagnes marketing"
            extra={
                <Button type="primary" icon={<PlusCircleOutlined />} onClick={openCreate}>
                    Nouvelle campagne
                </Button>
            }
        >
            <Table
                rowKey="id"
                dataSource={campagnes}
                columns={columns}
                loading={loading}
                pagination={{ pageSize: 10 }}
                bordered
            />

            <Modal
                title={editing ? 'Modifier la campagne' : 'Nouvelle campagne'}
                open={modalOpen}
                onCancel={handleModalCancel}
                onOk={handleSave}
                okText={editing ? 'Mettre à jour' : 'Créer'}
                cancelText="Annuler"
                width={750}
                destroyOnHidden
            >
                <Form form={form} layout="vertical" onValuesChange={(changed) => {
                    setFormDirty(true);
                    if (changed.canal) {
                        setSelectedCanal(changed.canal);
                    }
                }}>
                    <Form.Item name="nom" label="Nom de la campagne" rules={[{ required: true, message: 'Le nom est requis' }]}>
                        <Input placeholder="Ex: Promotion hivernage 2026" />
                    </Form.Item>
                    <Form.Item name="canal" label="Canal" rules={[{ required: true, message: 'Le canal est requis' }]}>
                        <Select options={canalOptions} />
                    </Form.Item>
                    <Form.Item name="cible" label="Cible" rules={[{ required: true, message: 'La cible est requise' }]}>
                        <Select options={cibleOptions} />
                    </Form.Item>
                    {selectedCanal === 'EMAIL' && (
                        <Form.Item name="sujet" label="Sujet de l'email" rules={[{ required: true, message: 'Le sujet est requis' }]}>
                            <Input placeholder="Ex: Offre spéciale hivernage" />
                        </Form.Item>
                    )}
                    <Form.Item label={selectedCanal === 'EMAIL' ? "Contenu de l'email" : "Contenu du SMS"}>
                        {selectedCanal === 'EMAIL' ? (
                            <ReactQuill
                                theme="snow"
                                value={contenu}
                                onChange={(val) => { setContenu(val); setFormDirty(true); }}
                                style={{ height: 250, marginBottom: 42 }}
                            />
                        ) : (
                            <Input.TextArea
                                rows={4}
                                value={contenu}
                                onChange={(e) => { setContenu(e.target.value); setFormDirty(true); }}
                                placeholder="Contenu du SMS..."
                                maxLength={160}
                                showCount
                            />
                        )}
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title={`Campagne : ${detailCampagne?.nom || ''}`}
                open={detailOpen}
                onCancel={() => setDetailOpen(false)}
                footer={null}
                width={700}
            >
                {detailCampagne && (
                    <div>
                        <p><strong>Canal :</strong> <Tag color={detailCampagne.canal === 'EMAIL' ? 'blue' : 'purple'}>{canalLabel[detailCampagne.canal] || detailCampagne.canal}</Tag></p>
                        <p><strong>Cible :</strong> {cibleLabel[detailCampagne.cible] || detailCampagne.cible}</p>
                        <p><strong>Statut :</strong> <Tag color={statutColor[detailCampagne.statut]}>{statutLabel[detailCampagne.statut] || detailCampagne.statut}</Tag></p>
                        {detailCampagne.sujet && <p><strong>Sujet :</strong> {detailCampagne.sujet}</p>}
                        {detailCampagne.dateCreation && <p><strong>Date de création :</strong> {formatDate(detailCampagne.dateCreation)}</p>}
                        {detailCampagne.dateEnvoi && <p><strong>Date d'envoi :</strong> {formatDate(detailCampagne.dateEnvoi)}</p>}
                        {detailCampagne.statut === 'ENVOYEE' && <p><strong>Nombre de destinataires :</strong> {detailCampagne.nombreDestinataires}</p>}
                        {detailCampagne.contenu && (
                            <>
                                <p><strong>Contenu :</strong></p>
                                {detailCampagne.canal === 'EMAIL' ? (
                                    <div style={{ background: '#fafafa', padding: 12, borderRadius: 4 }} dangerouslySetInnerHTML={{ __html: detailCampagne.contenu }} />
                                ) : (
                                    <p style={{ whiteSpace: 'pre-wrap', background: '#fafafa', padding: 12, borderRadius: 4 }}>{detailCampagne.contenu}</p>
                                )}
                            </>
                        )}
                        <p style={{ marginTop: 16 }}><strong>Destinataires ({destinataires.length}) :</strong></p>
                        <Table
                            rowKey="email"
                            dataSource={destinataires}
                            columns={destColumns}
                            loading={destLoading}
                            pagination={{ pageSize: 5 }}
                            size="small"
                            bordered
                        />
                    </div>
                )}
            </Modal>
        </Card>
    );
}
