import React, { useEffect, useState } from 'react';
import {
    Badge,
    Button,
    Card,
    Checkbox,
    Col,
    Empty,
    Form,
    Input,
    InputNumber,
    Modal,
    Row,
    Select,
    Space,
    Table,
    Tag,
    message,
} from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, EditOutlined, ExclamationCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import axios from 'axios';

type TaskStatus = 'EN_ATTENTE' | 'PLANIFIEE' | 'EN_COURS' | 'TERMINEE' | 'INCIDENT' | 'ANNULEE';

interface ChecklistItem {
    id?: number;
    nom?: string;
    description?: string;
    done?: boolean;
}

interface PlanningItem {
    itemId?: number;
    venteId?: number;
    itemType?: string;
    itemNom?: string;
    itemStatus?: TaskStatus;
    datePlanification?: string;
    dateDebut?: string;
    dateFin?: string;
    statusDate?: string;
    notes?: string;
    dureeReelle?: number;
    dureeEstimee?: number;
    incidentDate?: string;
    incidentDetails?: string;
    clientNom?: string;
    venteType?: string;
    bateauNom?: string;
    quantite?: number;
    taches?: ChecklistItem[];
}

interface PlanningProps {
    technicienId: number;
}

const taskStatusOptions: Array<{ value: TaskStatus; label: string }> = [
    { value: 'EN_ATTENTE', label: 'En attente' },
    { value: 'PLANIFIEE', label: 'Planifiee' },
    { value: 'EN_COURS', label: 'En cours' },
    { value: 'TERMINEE', label: 'Terminee' },
    { value: 'INCIDENT', label: 'Incident' },
    { value: 'ANNULEE', label: 'Annulee' },
];

const statusColor: Record<string, string> = {
    EN_ATTENTE: 'orange',
    PLANIFIEE: 'cyan',
    EN_COURS: 'blue',
    TERMINEE: 'green',
    INCIDENT: 'red',
    ANNULEE: 'default',
};

const statusLabel: Record<string, string> = {
    EN_ATTENTE: 'En attente',
    PLANIFIEE: 'Planifiee',
    EN_COURS: 'En cours',
    TERMINEE: 'Terminee',
    INCIDENT: 'Incident',
    ANNULEE: 'Annulee',
};

const formatDate = (value?: string) => {
    if (!value) return '-';
    const parsed = new Date(value);
    if (isNaN(parsed.getTime())) return value;
    return parsed.toLocaleDateString('fr-FR');
};

const todayIso = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - offset).toISOString().split('T')[0];
};

export default function Planning({ technicienId }: PlanningProps) {
    const [items, setItems] = useState<PlanningItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [filterStatus, setFilterStatus] = useState<TaskStatus | undefined>(undefined);
    const [modalVisible, setModalVisible] = useState(false);
    const [currentItem, setCurrentItem] = useState<PlanningItem | null>(null);
    const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
    const [form] = Form.useForm();
    const [saving, setSaving] = useState(false);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/technicien-portal/techniciens/${technicienId}/taches`);
            setItems(res.data || []);
        } catch {
            message.error('Erreur lors du chargement des taches');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, [technicienId]);

    const filteredItems = filterStatus
        ? items.filter((t) => t.itemStatus === filterStatus)
        : items;

    const todayItems = filteredItems.filter((t) => {
        if (!t.statusDate) return false;
        return t.statusDate.startsWith(todayIso());
    });

    const pendingItems = filteredItems.filter((t) => t.itemStatus === 'EN_ATTENTE' || t.itemStatus === 'PLANIFIEE' || t.itemStatus === 'EN_COURS');
    const incidentItems = filteredItems.filter((t) => t.itemStatus === 'INCIDENT');

    const openUpdateModal = (item: PlanningItem) => {
        setCurrentItem(item);
        setChecklist((item.taches || []).map((t) => ({ ...t })));
        form.setFieldsValue({
            status: item.itemStatus || 'EN_COURS',
            dureeReelle: item.dureeReelle || 0,
            notes: item.notes || '',
            incidentDate: item.incidentDate || todayIso(),
            incidentDetails: item.incidentDetails || '',
        });
        setModalVisible(true);
    };

    const nowIso = () => {
        const now = new Date();
        const offset = now.getTimezoneOffset() * 60000;
        return new Date(now.getTime() - offset).toISOString().slice(0, 19);
    };

    const handleStart = async (item: PlanningItem) => {
        try {
            const endpoint = item.itemType === 'forfait'
                ? `/technicien-portal/forfaits/${item.itemId}`
                : `/technicien-portal/services/${item.itemId}`;
            const res = await axios.put(endpoint, {
                status: 'EN_COURS',
                dateDebut: nowIso(),
                dureeReelle: item.dureeReelle || 0,
                notes: item.notes || '',
            });
            message.success('Intervention demarrée');
            const updated = res.data;
            setCurrentItem({ ...item, ...updated, itemStatus: updated.itemStatus || 'EN_COURS' });
            setChecklist((updated.taches || item.taches || []).map((t: ChecklistItem) => ({ ...t })));
            form.setFieldsValue({
                status: 'EN_COURS',
                dureeReelle: updated.dureeReelle ?? item.dureeReelle ?? 0,
                notes: updated.notes ?? item.notes ?? '',
                incidentDate: todayIso(),
                incidentDetails: '',
            });
            setModalVisible(true);
            fetchItems();
        } catch {
            message.error('Erreur lors du demarrage');
        }
    };

    const handleChecklistChange = (index: number, done: boolean) => {
        setChecklist((prev) => {
            const updated = prev.map((c, i) => i === index ? { ...c, done } : c);
            // If all checked, auto-set status to TERMINEE and dateFin, compute dureeReelle
            if (updated.length > 0 && updated.every((c) => c.done)) {
                const finIso = nowIso();
                let dureeReelle = 0;
                if (currentItem?.dateDebut) {
                    const debut = new Date(currentItem.dateDebut).getTime();
                    const fin = new Date(finIso).getTime();
                    if (!isNaN(debut) && !isNaN(fin) && fin > debut) {
                        dureeReelle = Math.round(((fin - debut) / 3600000) * 100) / 100;
                    }
                }
                form.setFieldsValue({ status: 'TERMINEE', dureeReelle });
                // Auto-save with dateFin
                const saveComplete = async () => {
                    if (!currentItem) return;
                    try {
                        setSaving(true);
                        const values = form.getFieldsValue();
                        const endpoint = currentItem.itemType === 'forfait'
                            ? `/technicien-portal/forfaits/${currentItem.itemId}`
                            : `/technicien-portal/services/${currentItem.itemId}`;
                        await axios.put(endpoint, {
                            status: 'TERMINEE',
                            dateFin: finIso,
                            dureeReelle,
                            notes: values.notes || '',
                            taches: updated.map((c) => ({ taskId: c.id, done: c.done })),
                        });
                        message.success('Intervention terminée');
                        fetchItems();
                    } catch {
                        message.error('Erreur lors de la cloture');
                    } finally {
                        setSaving(false);
                    }
                };
                saveComplete();
            }
            return updated;
        });
    };

    const handleSave = async () => {
        if (!currentItem) return;
        try {
            const values = await form.validateFields();
            setSaving(true);
            const endpoint = currentItem.itemType === 'forfait'
                ? `/technicien-portal/forfaits/${currentItem.itemId}`
                : `/technicien-portal/services/${currentItem.itemId}`;
            const res = await axios.put(endpoint, {
                status: values.status,
                dureeReelle: values.dureeReelle || 0,
                dateFin: values.status === 'TERMINEE' ? nowIso() : undefined,
                notes: values.notes || '',
                incidentDate: values.status === 'INCIDENT' ? values.incidentDate : null,
                incidentDetails: values.status === 'INCIDENT' ? values.incidentDetails : null,
                taches: checklist.map((c) => ({ taskId: c.id, done: c.done })),
            });
            message.success('Tache mise a jour');
            const updated = res.data;
            setCurrentItem({ ...currentItem, ...updated, itemStatus: updated.itemStatus || values.status });
            if (updated.taches) {
                setChecklist(updated.taches.map((t: ChecklistItem) => ({ ...t })));
            }
            form.setFieldsValue({
                status: updated.itemStatus || values.status,
                dureeReelle: updated.dureeReelle ?? values.dureeReelle,
                notes: updated.notes ?? values.notes,
                incidentDate: updated.incidentDate || values.incidentDate,
                incidentDetails: updated.incidentDetails || values.incidentDetails,
            });
            fetchItems();
        } catch {
            message.error('Erreur lors de la mise a jour');
        } finally {
            setSaving(false);
        }
    };

    const columns = [
        {
            title: 'Tache',
            dataIndex: 'itemNom',
            key: 'itemNom',
            render: (val: string) => val || '-',
        },
        {
            title: 'Type',
            dataIndex: 'itemType',
            key: 'itemType',
            render: (val: string) => val ? <Tag>{val}</Tag> : '-',
        },
        {
            title: 'Client',
            dataIndex: 'clientNom',
            key: 'clientNom',
            render: (val: string) => val || '-',
        },
        {
            title: 'Bateau',
            dataIndex: 'bateauNom',
            key: 'bateauNom',
            render: (val: string) => val || '-',
        },
        {
            title: 'Statut',
            dataIndex: 'itemStatus',
            key: 'itemStatus',
            render: (val: string) => <Tag color={statusColor[val]}>{statusLabel[val] || val}</Tag>,
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
            title: 'Date planifiee',
            dataIndex: 'statusDate',
            key: 'statusDate',
            render: (val: string) => formatDate(val),
        },
        {
            title: 'Estimee',
            dataIndex: 'dureeEstimee',
            key: 'dureeEstimee',
            render: (val: number) => val ? `${val}h` : '-',
        },
        {
            title: 'Reelle',
            dataIndex: 'dureeReelle',
            key: 'dureeReelle',
            render: (val: number) => val ? `${val}h` : '-',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: unknown, record: PlanningItem) => {
                if (record.itemStatus === 'TERMINEE') return null;
                return (
                    <Space>
                        <Button
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => openUpdateModal(record)}
                        >
                            Editer
                        </Button>
                        {(record.itemStatus === 'EN_ATTENTE' || record.itemStatus === 'PLANIFIEE') && (
                            <Button
                                size="small"
                                icon={<ClockCircleOutlined />}
                                onClick={() => handleStart(record)}
                            >
                                Demarrer
                            </Button>
                        )}
                        {record.itemStatus !== 'ANNULEE' && (
                            <Button
                                size="small"
                                danger
                                icon={<ExclamationCircleOutlined />}
                                onClick={() => {
                                    setCurrentItem(record);
                                    setChecklist((record.taches || []).map((t) => ({ ...t })));
                                    form.setFieldsValue({
                                        status: 'INCIDENT',
                                        dureeReelle: record.dureeReelle || 0,
                                        notes: record.notes || '',
                                        incidentDate: record.incidentDate || todayIso(),
                                        incidentDetails: record.incidentDetails || '',
                                    });
                                    setModalVisible(true);
                                }}
                            >
                                Incident
                            </Button>
                        )}
                        {(record.itemStatus === 'PLANIFIEE' || record.itemStatus === 'EN_COURS') && (
                            <Button
                                size="small"
                                type="primary"
                                icon={<CheckCircleOutlined />}
                                onClick={() => {
                                    let dureeReelle = record.dureeReelle || 0;
                                    if (record.dateDebut) {
                                        const debut = new Date(record.dateDebut).getTime();
                                        const fin = Date.now();
                                        if (!isNaN(debut) && fin > debut) {
                                            dureeReelle = Math.round(((fin - debut) / 3600000) * 100) / 100;
                                        }
                                    }
                                    setCurrentItem(record);
                                    setChecklist((record.taches || []).map((t) => ({ ...t })));
                                    form.setFieldsValue({
                                        status: 'TERMINEE',
                                        dureeReelle,
                                        notes: record.notes || '',
                                        incidentDate: todayIso(),
                                        incidentDetails: '',
                                    });
                                    setModalVisible(true);
                                }}
                            >
                                Terminer
                            </Button>
                        )}
                    </Space>
                );
            },
        },
    ];

    return (
        <div>
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col xs={24} sm={8} lg={6}>
                    <Card>
                        <Badge status="processing" /> Aujourd'hui: <strong>{todayItems.length}</strong> tache(s)
                    </Card>
                </Col>
                <Col xs={24} sm={8} lg={6}>
                    <Card>
                        <Badge status="warning" /> A faire: <strong>{pendingItems.length}</strong>
                    </Card>
                </Col>
                <Col xs={24} sm={8} lg={6}>
                    <Card>
                        <Badge status="error" /> Incidents: <strong>{incidentItems.length}</strong>
                    </Card>
                </Col>
                <Col xs={24} sm={8} lg={6}>
                    <Card>
                        <Space>
                            <Select
                                allowClear
                                options={taskStatusOptions}
                                placeholder="Filtrer par statut"
                                value={filterStatus}
                                onChange={(val) => setFilterStatus(val)}
                                style={{ width: 180 }}
                            />
                            <Button icon={<ReloadOutlined />} onClick={fetchItems} />
                        </Space>
                    </Card>
                </Col>
            </Row>

            <Card title={`Taches du jour (${todayIso()})`} style={{ marginBottom: 16 }}>
                {todayItems.length > 0 ? (
                    <Table
                        rowKey="itemId"
                        dataSource={todayItems}
                        columns={columns}
                        loading={loading}
                        pagination={false}
                        bordered
                    />
                ) : (
                    <Empty description="Aucune tache planifiee aujourd'hui" />
                )}
            </Card>

            <Card title="Toutes mes taches">
                <Table
                    rowKey="itemId"
                    dataSource={filteredItems}
                    columns={columns}
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    bordered
                />
            </Card>

            <Modal
                open={modalVisible}
                title={currentItem ? `Mise a jour: ${currentItem.itemNom || 'Tache'}` : 'Mise a jour'}
                onOk={handleSave}
                okText="Enregistrer"
                cancelText="Annuler"
                confirmLoading={saving}
                onCancel={() => {
                    setModalVisible(false);
                    setCurrentItem(null);
                    setChecklist([]);
                    form.resetFields();
                }}
                destroyOnHidden
                width={600}
                footer={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            {currentItem && currentItem.itemStatus !== 'INCIDENT' && currentItem.itemStatus !== 'TERMINEE' && currentItem.itemStatus !== 'ANNULEE' && (
                                <Button danger icon={<ExclamationCircleOutlined />} onClick={() => form.setFieldsValue({ status: 'INCIDENT' })}>
                                    Incident
                                </Button>
                            )}
                        </div>
                        <Space>
                            <Button onClick={() => { setModalVisible(false); setCurrentItem(null); setChecklist([]); form.resetFields(); }}>
                                Annuler
                            </Button>
                            <Button type="primary" loading={saving} onClick={handleSave}>
                                Enregistrer
                            </Button>
                        </Space>
                    </div>
                }
            >
                {currentItem && (
                    <Card size="small" style={{ marginBottom: 16, background: '#fafafa' }}>
                        <p><strong>Nom:</strong> {currentItem.itemNom || '-'}</p>
                        <p><strong>Client:</strong> {currentItem.clientNom || '-'}</p>
                        <p><strong>Bateau:</strong> {currentItem.bateauNom || '-'}</p>
                        {currentItem.dureeEstimee != null && currentItem.dureeEstimee > 0 && (
                            <p><strong>Duree estimee:</strong> {currentItem.dureeEstimee}h</p>
                        )}
                    </Card>
                )}
                <Form form={form} layout="vertical">
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="status"
                                label="Statut"
                                rules={[{ required: true, message: 'Le statut est requis' }]}
                            >
                                <Select options={taskStatusOptions} disabled />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="dureeReelle" label="Temps passe (heures)">
                                <InputNumber min={0} step={0.25} precision={2} style={{ width: '100%' }} addonAfter="h" disabled />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item name="notes" label="Notes">
                        <Input.TextArea rows={3} />
                    </Form.Item>
                    {checklist.length > 0 && (
                        <Card size="small" title="Checklist" style={{ marginBottom: 12 }}>
                            {checklist.map((item, index) => (
                                <div key={item.id || index} style={{ marginBottom: 4 }}>
                                    <Checkbox
                                        checked={item.done}
                                        onChange={(e) => handleChecklistChange(index, e.target.checked)}
                                    >
                                        <span style={{ fontWeight: 500 }}>{item.nom || `Tache ${index + 1}`}</span>
                                    </Checkbox>
                                    {item.description && (
                                        <p style={{ margin: '0 0 0 24px', fontSize: 12, color: '#999' }}>{item.description}</p>
                                    )}
                                </div>
                            ))}
                        </Card>
                    )}
                    <Form.Item noStyle shouldUpdate={(prev, cur) => prev?.status !== cur?.status}>
                        {({ getFieldValue }) => {
                            if (getFieldValue('status') !== 'INCIDENT') return null;
                            return (
                                <Card size="small" title="Incident" style={{ marginBottom: 12, borderColor: '#ff4d4f' }}>
                                    <Form.Item
                                        name="incidentDate"
                                        label="Date de l'incident"
                                        rules={[{ required: true, message: "La date de l'incident est requise" }]}
                                    >
                                        <Input type="date" />
                                    </Form.Item>
                                    <Form.Item
                                        name="incidentDetails"
                                        label="Details de l'incident"
                                        rules={[{ required: true, message: "Les details de l'incident sont requis" }]}
                                    >
                                        <Input.TextArea rows={3} />
                                    </Form.Item>
                                </Card>
                            );
                        }}
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
