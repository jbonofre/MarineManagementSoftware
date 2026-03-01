import React, { useEffect, useMemo, useState } from 'react';
import { Badge, Button, Card, Col, Empty, Form, Input, Modal, Row, Select, Space, Table, Tag, Typography, message } from 'antd';
import { CalendarOutlined, EditOutlined } from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';
import { WeeklyCalendar } from 'antd-weekly-calendar';
import { useHistory } from 'react-router-dom';

type VenteType = 'DEVIS' | 'FACTURE' | 'COMPTOIR';
type TaskStatus = 'EN_ATTENTE' | 'EN_COURS' | 'TERMINEE' | 'INCIDENT' | 'ANNULEE';

interface ClientEntity {
    id: number;
    prenom?: string;
    nom: string;
}

interface TaskEntity {
    id?: number;
    nom?: string;
    status?: TaskStatus;
    dateDebut?: string;
    dateFin?: string;
    statusDate?: string;
}

interface ForfaitEntity {
    id: number;
}

interface ProduitCatalogueEntity {
    id: number;
}

interface ServiceEntity {
    id: number;
}

interface VenteEntity {
    id?: number;
    status: string;
    type?: VenteType;
    client?: ClientEntity;
    forfaits?: ForfaitEntity[];
    produits?: ProduitCatalogueEntity[];
    services?: ServiceEntity[];
    taches?: TaskEntity[];
    date?: string;
    prixVenteTTC?: number;
    modePaiement?: string;
}

interface PlanningFormValues {
    date: string;
    status: TaskStatus;
}

interface WeeklyCalendarEvent {
    eventId: string;
    startTime: Date;
    endTime: Date;
    title: string;
    backgroundColor?: string;
    textColor?: string;
}

interface PendingTaskRow {
    key: string;
    vente: VenteEntity;
    task: TaskEntity;
    taskIndex: number;
}

const taskStatusOptions: Array<{ value: TaskStatus; label: string }> = [
    { value: 'EN_ATTENTE', label: 'En attente' },
    { value: 'EN_COURS', label: 'En cours' },
    { value: 'TERMINEE', label: 'Terminee' },
    { value: 'INCIDENT', label: 'Incident' },
    { value: 'ANNULEE', label: 'Annulee' }
];

const typeOptions: Array<{ value: VenteType; label: string }> = [
    { value: 'DEVIS', label: 'Devis' },
    { value: 'FACTURE', label: 'Facture' },
    { value: 'COMPTOIR', label: 'Comptoir' }
];

const statusColor: Record<TaskStatus, string> = {
    EN_ATTENTE: 'default',
    EN_COURS: 'blue',
    TERMINEE: 'green',
    INCIDENT: 'volcano',
    ANNULEE: 'red'
};

const todayIso = () => new Date().toISOString().slice(0, 10);

const getClientLabel = (client?: ClientEntity) => {
    if (!client) {
        return '-';
    }
    const fullName = `${client.prenom || ''} ${client.nom || ''}`.trim();
    return fullName || `Client #${client.id}`;
};

const toIsoDay = (value?: string) => {
    if (!value) {
        return undefined;
    }
    const parsed = dayjs(value);
    if (!parsed.isValid()) {
        return undefined;
    }
    return parsed.format('YYYY-MM-DD');
};

const toDateTimeLocalValue = (value?: string) => {
    if (!value) {
        return undefined;
    }
    const parsed = dayjs(value);
    if (!parsed.isValid()) {
        return undefined;
    }
    return parsed.format('YYYY-MM-DDTHH:mm');
};

export default function Planning() {
    const history = useHistory();
    const [ventes, setVentes] = useState<VenteEntity[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState(todayIso());
    const [selectedStatus, setSelectedStatus] = useState<TaskStatus | undefined>(undefined);
    const [modalVisible, setModalVisible] = useState(false);
    const [saving, setSaving] = useState(false);
    const [currentTaskRow, setCurrentTaskRow] = useState<PendingTaskRow | null>(null);
    const [form] = Form.useForm<PlanningFormValues>();

    const fetchVentes = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/ventes');
            setVentes(response.data || []);
        } catch {
            message.error('Erreur lors du chargement du planning.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVentes();
    }, []);

    const openPlanningModal = (taskRow: PendingTaskRow, forcedDate?: string) => {
        setCurrentTaskRow(taskRow);
        form.setFieldsValue({
            date:
                toDateTimeLocalValue(taskRow.task.statusDate)
                || (forcedDate ? `${forcedDate}T08:00` : undefined)
                || `${selectedDate || todayIso()}T08:00`,
            status: taskRow.task.status || 'EN_ATTENTE'
        });
        setModalVisible(true);
    };

    const allTasks = useMemo<PendingTaskRow[]>(
        () =>
            ventes.flatMap((vente, venteIndex) =>
                (vente.taches || []).map((task, taskIndex) => ({
                    key: `${vente.id || venteIndex}-${task.id || taskIndex}-${taskIndex}`,
                    vente,
                    task,
                    taskIndex
                }))
            ),
        [ventes]
    );

    const pendingTasks = useMemo<PendingTaskRow[]>(
        () =>
            allTasks
                .filter((row) => !row.task.status || row.task.status === 'EN_ATTENTE')
                .filter((row) => !selectedStatus || row.task.status === selectedStatus),
        [allTasks, selectedStatus]
    );

    const pendingTasksForDay = useMemo<PendingTaskRow[]>(
        () => pendingTasks.filter((row) => toIsoDay(row.task.statusDate) === selectedDate),
        [pendingTasks, selectedDate]
    );

    const plannedTasks = useMemo<PendingTaskRow[]>(
        () =>
            allTasks
                .filter((row) => row.task.status === 'EN_COURS')
                .filter((row) => toIsoDay(row.task.statusDate) === selectedDate)
                .filter((row) => !selectedStatus || row.task.status === selectedStatus),
        [allTasks, selectedDate, selectedStatus]
    );

    const weeklyEvents = useMemo<WeeklyCalendarEvent[]>(
        () =>
            allTasks
                .filter((row) => row.task.status === 'EN_COURS')
                .map((row) => {
                    const { vente, task } = row;
                    const startSource = task.dateDebut || task.statusDate || vente.date;
                    if (!startSource) {
                        return null;
                    }
                    const startDate = dayjs(startSource);
                    if (!startDate.isValid()) {
                        return null;
                    }

                    const endSource = task.dateFin;
                    const endDate = endSource && dayjs(endSource).isValid()
                        ? dayjs(endSource)
                        : startDate.add(1, 'hour');

                    return {
                        eventId: row.key,
                        startTime: startDate.toDate(),
                        endTime: endDate.toDate(),
                        title: `#${vente.id} ${task.nom || 'Tache sans nom'} (${getClientLabel(vente.client)})`,
                        backgroundColor: '#1677ff'
                    } as WeeklyCalendarEvent;
                })
                .filter(Boolean) as WeeklyCalendarEvent[],
        [allTasks]
    );

    const handleSavePlanning = async () => {
        if (!currentTaskRow?.vente?.id) {
            return;
        }
        try {
            const values = await form.validateFields();
            setSaving(true);
            const venteId = currentTaskRow.vente.id;
            const latestVenteResponse = await axios.get(`/ventes/${venteId}`);
            const latestVente = (latestVenteResponse.data || currentTaskRow.vente) as VenteEntity;
            const latestTasks = [...(latestVente.taches || [])];

            let taskToUpdateIndex = -1;
            if (currentTaskRow.task.id !== undefined && currentTaskRow.task.id !== null) {
                taskToUpdateIndex = latestTasks.findIndex((task) => task.id === currentTaskRow.task.id);
            }
            if (taskToUpdateIndex < 0) {
                taskToUpdateIndex = Math.min(currentTaskRow.taskIndex, latestTasks.length - 1);
            }
            if (taskToUpdateIndex < 0 || !latestTasks[taskToUpdateIndex]) {
                message.error("Impossible de trouver la tâche à mettre à jour.");
                return;
            }

            latestTasks[taskToUpdateIndex] = {
                ...latestTasks[taskToUpdateIndex],
                status: values.status,
                statusDate: values.date
            };

            const updatedVente: VenteEntity = {
                ...latestVente,
                taches: latestTasks
            };

            await axios.put(`/ventes/${venteId}`, updatedVente);
            message.success('Planning de la tâche mis a jour.');
            setModalVisible(false);
            setCurrentTaskRow(null);
            form.resetFields();
            fetchVentes();
        } catch (error) {
            const formError = error as { errorFields?: unknown[] };
            if (Array.isArray(formError.errorFields) && formError.errorFields.length > 0) {
                // Les erreurs de validation sont affichees par le formulaire.
                return;
            }
            if (axios.isAxiosError(error)) {
                message.error(error.response?.data?.message || "Erreur lors de la mise à jour de la tâche.");
                return;
            }
            message.error("Erreur lors de la mise à jour de la tâche.");
        } finally {
            setSaving(false);
        }
    };

    const commonColumns = [
        {
            title: 'Vente',
            dataIndex: 'id',
            render: (_: unknown, record: PendingTaskRow) => `#${record.vente.id}`
        },
        {
            title: 'Client',
            dataIndex: 'client',
            render: (_: unknown, record: PendingTaskRow) => getClientLabel(record.vente.client)
        },
        {
            title: 'Type',
            dataIndex: 'type',
            render: (_: unknown, record: PendingTaskRow) => typeOptions.find((item) => item.value === record.vente.type)?.label || record.vente.type || '-'
        },
        {
            title: 'Statut tâche',
            dataIndex: 'taskStatus',
            render: (_: unknown, record: PendingTaskRow) => {
                const status = record.task.status || 'EN_ATTENTE';
                const label = taskStatusOptions.find((item) => item.value === status)?.label || status;
                return <Tag color={statusColor[status] || 'default'}>{label}</Tag>;
            }
        },
        {
            title: 'Tâche',
            key: 'taskName',
            render: (_: unknown, record: PendingTaskRow) => record.task.nom || '(Sans nom)'
        }
    ];

    const pendingTaskColumns = [
        ...commonColumns,
        {
            title: 'Date statut',
            key: 'statusDate',
            render: (_: unknown, record: PendingTaskRow) => toIsoDay(record.task.statusDate) || '-'
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: unknown, record: PendingTaskRow) => (
                <Space>
                    <Button type="primary" icon={<CalendarOutlined />} onClick={() => openPlanningModal(record, selectedDate)}>
                        Planifier
                    </Button>
                    {record.vente.id ? (
                        <Button onClick={() => history.push(`/prestations?venteId=${record.vente.id}`)}>
                            Voir prestation
                        </Button>
                    ) : (
                        <Typography.Text type="secondary">-</Typography.Text>
                    )}
                </Space>
            )
        }
    ];

    const dayColumns = [
        ...commonColumns,
        {
            title: 'Date statut',
            key: 'statusDate',
            render: (_: unknown, record: PendingTaskRow) => toIsoDay(record.task.statusDate) || '-'
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: unknown, record: PendingTaskRow) => (
                <Button icon={<EditOutlined />} onClick={() => openPlanningModal(record)}>
                    Replanifier
                </Button>
            )
        }
    ];

    return (
        <Card title="Planning">
            <Row gutter={[16, 16]}>
                <Col span={16}>
                    <Card size="small" title="Vue semaine">
                        <WeeklyCalendar
                            events={weeklyEvents}
                            weekends
                            onSelectDate={(date) => {
                                setSelectedDate(dayjs(date).format('YYYY-MM-DD'));
                            }}
                            onEventClick={(event: WeeklyCalendarEvent) => {
                                const matchedTaskRow = allTasks.find((row) => row.key === event.eventId);
                                if (matchedTaskRow) {
                                    openPlanningModal(matchedTaskRow);
                                }
                            }}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card size="small" title="Filtres">
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <Input type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value || todayIso())} />
                            <Select
                                allowClear
                                options={taskStatusOptions}
                                placeholder="Tous les statuts de tâche"
                                value={selectedStatus}
                                onChange={(value) => setSelectedStatus(value)}
                            />
                        </Space>
                    </Card>

                    <Card size="small" title="Synthese" style={{ marginTop: 16 }}>
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <div>
                                <Badge status="processing" /> Date selectionnee: <strong>{selectedDate}</strong>
                            </div>
                            <div>
                                <Badge status="success" /> Taches EN_COURS du jour: <strong>{plannedTasks.length}</strong>
                            </div>
                            <div>
                                <Badge status="warning" /> Taches en attente (jour): <strong>{pendingTasksForDay.length}</strong>
                            </div>
                            <div>
                                <Badge status="default" /> Taches en attente (total): <strong>{pendingTasks.length}</strong>
                            </div>
                        </Space>
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col span={24}>
                    <Card title={`Planifié le ${selectedDate}`} size="small" bodyStyle={{ padding: plannedTasks.length ? 12 : 24 }}>
                        {plannedTasks.length ? (
                            <Table
                                rowKey="key"
                                loading={loading}
                                dataSource={plannedTasks}
                                columns={dayColumns}
                                pagination={{ pageSize: 8 }}
                                bordered
                            />
                        ) : (
                            <Empty description="Aucune tache EN_COURS avec date de statut pour cette date." />
                        )}
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col span={24}>
                    <Card
                        title="A planifier (taches en attente)"
                        size="small"
                        bodyStyle={{ padding: pendingTasks.length ? 12 : 24 }}
                    >
                        {pendingTasks.length ? (
                            <Table
                                rowKey="key"
                                loading={loading}
                                dataSource={pendingTasks}
                                columns={pendingTaskColumns}
                                pagination={{ pageSize: 6 }}
                                bordered
                            />
                        ) : (
                            <Empty description="Aucune tache en attente." />
                        )}
                    </Card>
                </Col>
            </Row>

            <Modal
                open={modalVisible}
                title={currentTaskRow?.task?.nom ? `Planifier la tâche: ${currentTaskRow.task.nom}` : 'Planifier la tâche'}
                onOk={handleSavePlanning}
                okText="Enregistrer"
                confirmLoading={saving}
                cancelText="Annuler"
                onCancel={() => {
                    setModalVisible(false);
                    setCurrentTaskRow(null);
                    form.resetFields();
                }}
                destroyOnHidden
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="date"
                        label="Date et heure planifiées"
                        rules={[{ required: true, message: 'La date est requise' }]}
                    >
                        <Input type="datetime-local" />
                    </Form.Item>
                    <Form.Item
                        name="status"
                        label="Statut"
                        rules={[{ required: true, message: 'Le statut est requis' }]}
                    >
                        <Select options={taskStatusOptions} />
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
}
