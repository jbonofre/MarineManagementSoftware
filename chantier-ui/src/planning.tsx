import React, { useEffect, useMemo, useState } from 'react';
import { Badge, Button, Card, Col, Empty, Form, Input, Modal, Row, Select, Space, Table, Tag, Typography, message } from 'antd';
import { CalendarOutlined, EditOutlined } from '@ant-design/icons';
import axios from 'axios';
import dayjs, { Dayjs } from 'dayjs';
import { WeeklyCalendar } from 'antd-weekly-calendar';

type VenteStatus = 'EN_ATTENTE' | 'EN_COURS' | 'PAYEE' | 'ANNULEE';
type VenteType = 'DEVIS' | 'FACTURE' | 'COMPTOIR';
type ModePaiement = 'CHEQUE' | 'VIREMENT' | 'CARTE' | 'ESPÈCES';

interface ClientEntity {
    id: number;
    prenom?: string;
    nom: string;
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
    status: VenteStatus;
    type?: VenteType;
    client?: ClientEntity;
    forfaits?: ForfaitEntity[];
    produits?: ProduitCatalogueEntity[];
    services?: ServiceEntity[];
    date?: string;
    prixVenteTTC?: number;
    modePaiement?: ModePaiement;
}

interface PlanningFormValues {
    date: string;
    status: VenteStatus;
}

interface WeeklyCalendarEvent {
    eventId: string;
    startTime: Date;
    endTime: Date;
    title: string;
    backgroundColor?: string;
    textColor?: string;
}

const statusOptions: Array<{ value: VenteStatus; label: string }> = [
    { value: 'EN_ATTENTE', label: 'En attente' },
    { value: 'EN_COURS', label: 'En cours' },
    { value: 'PAYEE', label: 'Payee' },
    { value: 'ANNULEE', label: 'Annulee' }
];

const typeOptions: Array<{ value: VenteType; label: string }> = [
    { value: 'DEVIS', label: 'Devis' },
    { value: 'FACTURE', label: 'Facture' },
    { value: 'COMPTOIR', label: 'Comptoir' }
];

const modePaiementOptions: Array<{ value: ModePaiement; label: string }> = [
    { value: 'CHEQUE', label: 'Cheque' },
    { value: 'VIREMENT', label: 'Virement' },
    { value: 'CARTE', label: 'Carte' },
    { value: 'ESPÈCES', label: 'Especes' }
];

const statusColor: Record<VenteStatus, string> = {
    EN_ATTENTE: 'default',
    EN_COURS: 'blue',
    PAYEE: 'green',
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

const formatEuro = (value?: number) => `${(value || 0).toFixed(2)} EUR`;

export default function Planning() {
    const [ventes, setVentes] = useState<VenteEntity[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState(todayIso());
    const [selectedStatus, setSelectedStatus] = useState<VenteStatus | undefined>(undefined);
    const [modalVisible, setModalVisible] = useState(false);
    const [saving, setSaving] = useState(false);
    const [currentVente, setCurrentVente] = useState<VenteEntity | null>(null);
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

    const openPlanningModal = (vente: VenteEntity, forcedDate?: string) => {
        setCurrentVente(vente);
        form.setFieldsValue({
            date: forcedDate || vente.date || selectedDate || todayIso(),
            status: vente.status || 'EN_ATTENTE'
        });
        setModalVisible(true);
    };

    const unscheduledVentes = useMemo(
        () => ventes.filter((vente) => !vente.date),
        [ventes]
    );

    const plannedVentes = useMemo(
        () =>
            ventes
                .filter((vente) => vente.date === selectedDate)
                .filter((vente) => !selectedStatus || vente.status === selectedStatus),
        [ventes, selectedDate, selectedStatus]
    );

    const ventesByDate = useMemo(() => {
        const grouped: Record<string, VenteEntity[]> = {};
        ventes.forEach((vente) => {
            if (!vente.date) {
                return;
            }
            if (!grouped[vente.date]) {
                grouped[vente.date] = [];
            }
            grouped[vente.date].push(vente);
        });
        return grouped;
    }, [ventes]);

    const weeklyEvents = useMemo<WeeklyCalendarEvent[]>(
        () =>
            ventes
                .filter((vente) => Boolean(vente.date))
                .filter((vente) => !selectedStatus || vente.status === selectedStatus)
                .map((vente) => {
                    const eventDate = dayjs(vente.date);
                    const statusLabel = statusOptions.find((item) => item.value === vente.status)?.label || vente.status;
                    return {
                        eventId: String(vente.id || ''),
                        startTime: eventDate.hour(8).minute(0).second(0).millisecond(0).toDate(),
                        endTime: eventDate.hour(9).minute(0).second(0).millisecond(0).toDate(),
                        title: `#${vente.id} ${getClientLabel(vente.client)} (${statusLabel})`,
                        backgroundColor:
                            vente.status === 'PAYEE'
                                ? '#52c41a'
                                : vente.status === 'EN_COURS'
                                    ? '#1677ff'
                                    : vente.status === 'ANNULEE'
                                        ? '#ff4d4f'
                                        : undefined
                    };
                }),
        [ventes, selectedStatus]
    );

    const handleSavePlanning = async () => {
        if (!currentVente?.id) {
            return;
        }
        try {
            const values = await form.validateFields();
            setSaving(true);
            await axios.put(`/ventes/${currentVente.id}`, {
                ...currentVente,
                date: values.date,
                status: values.status
            });
            message.success('Planning de la vente mis a jour.');
            setModalVisible(false);
            setCurrentVente(null);
            form.resetFields();
            fetchVentes();
        } catch {
            // Les erreurs de validation sont affichees par le formulaire.
        } finally {
            setSaving(false);
        }
    };

    const commonColumns = [
        {
            title: 'Vente',
            dataIndex: 'id',
            render: (value: number) => `#${value}`
        },
        {
            title: 'Client',
            dataIndex: 'client',
            render: (value: ClientEntity) => getClientLabel(value)
        },
        {
            title: 'Type',
            dataIndex: 'type',
            render: (value: VenteType) => typeOptions.find((item) => item.value === value)?.label || value || '-'
        },
        {
            title: 'Statut',
            dataIndex: 'status',
            render: (value: VenteStatus) => {
                const label = statusOptions.find((item) => item.value === value)?.label || value;
                return <Tag color={statusColor[value] || 'default'}>{label}</Tag>;
            }
        },
        {
            title: 'Prestations',
            key: 'prestations',
            render: (_: unknown, record: VenteEntity) =>
                (record.forfaits?.length || 0) + (record.produits?.length || 0) + (record.services?.length || 0)
        },
        {
            title: 'Prix vente TTC',
            dataIndex: 'prixVenteTTC',
            render: (value: number) => formatEuro(value)
        },
        {
            title: 'Mode paiement',
            dataIndex: 'modePaiement',
            render: (value: ModePaiement) => modePaiementOptions.find((item) => item.value === value)?.label || value || '-'
        }
    ];

    const unscheduledColumns = [
        ...commonColumns,
        {
            title: 'Actions',
            key: 'actions',
            render: (_: unknown, record: VenteEntity) => (
                <Button type="primary" icon={<CalendarOutlined />} onClick={() => openPlanningModal(record, selectedDate)}>
                    Planifier
                </Button>
            )
        }
    ];

    const dayColumns = [
        ...commonColumns,
        {
            title: 'Actions',
            key: 'actions',
            render: (_: unknown, record: VenteEntity) => (
                <Button icon={<EditOutlined />} onClick={() => openPlanningModal(record)}>
                    Replanifier
                </Button>
            )
        }
    ];

    const renderDayContent = (value: Dayjs) => {
        const isoDate = value.format('YYYY-MM-DD');
        const dayVentes = (ventesByDate[isoDate] || [])
            .filter((vente) => !selectedStatus || vente.status === selectedStatus)
            .slice(0, 3);
        const remaining = Math.max(0, (ventesByDate[isoDate] || []).filter((vente) => !selectedStatus || vente.status === selectedStatus).length - dayVentes.length);

        if (!dayVentes.length) {
            return null;
        }

        return (
            <Space direction="vertical" size={2} style={{ width: '100%' }}>
                {dayVentes.map((vente) => (
                    <Tag
                        key={vente.id}
                        color={statusColor[vente.status] || 'default'}
                        style={{ marginInlineEnd: 0, cursor: 'pointer' }}
                        onClick={() => openPlanningModal(vente)}
                    >
                        #{vente.id} {getClientLabel(vente.client)}
                    </Tag>
                ))}
                {remaining > 0 && <Typography.Text type="secondary">+ {remaining} autre(s)</Typography.Text>}
            </Space>
        );
    };

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
                                const matchedVente = ventes.find((vente) => String(vente.id) === event.eventId);
                                if (matchedVente) {
                                    openPlanningModal(matchedVente);
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
                                options={statusOptions}
                                placeholder="Tous les statuts"
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
                                <Badge status="success" /> Ventes du jour: <strong>{plannedVentes.length}</strong>
                            </div>
                            <div>
                                <Badge status="warning" /> Total TTC: <strong>{formatEuro(plannedVentes.reduce((sum, item) => sum + (item.prixVenteTTC || 0), 0))}</strong>
                            </div>
                            <div>
                                <Badge status="default" /> Ventes non planifiees: <strong>{unscheduledVentes.length}</strong>
                            </div>
                        </Space>
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col span={24}>
                    <Card title={`Planifié le ${selectedDate}`} size="small" bodyStyle={{ padding: plannedVentes.length ? 12 : 24 }}>
                        {plannedVentes.length ? (
                            <Table
                                rowKey="id"
                                loading={loading}
                                dataSource={plannedVentes}
                                columns={dayColumns}
                                pagination={{ pageSize: 8 }}
                                bordered
                            />
                        ) : (
                            <Empty description="Aucune vente planifiee pour cette date." />
                        )}
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col span={24}>
                    <Card
                        title="A planifier"
                        size="small"
                        bodyStyle={{ padding: unscheduledVentes.length ? 12 : 24 }}
                    >
                        {unscheduledVentes.length ? (
                            <Table
                                rowKey="id"
                                loading={loading}
                                dataSource={unscheduledVentes}
                                columns={unscheduledColumns}
                                pagination={{ pageSize: 6 }}
                                bordered
                            />
                        ) : (
                            <Empty description="Toutes les ventes ont une date planifiee." />
                        )}
                    </Card>
                </Col>
            </Row>

            <Modal
                open={modalVisible}
                title={currentVente?.id ? `Planifier la vente #${currentVente.id}` : 'Planifier la vente'}
                onOk={handleSavePlanning}
                okText="Enregistrer"
                confirmLoading={saving}
                cancelText="Annuler"
                onCancel={() => {
                    setModalVisible(false);
                    setCurrentVente(null);
                    form.resetFields();
                }}
                destroyOnHidden
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="date"
                        label="Date planifiee"
                        rules={[{ required: true, message: 'La date est requise' }]}
                    >
                        <Input type="date" />
                    </Form.Item>
                    <Form.Item
                        name="status"
                        label="Statut"
                        rules={[{ required: true, message: 'Le statut est requis' }]}
                    >
                        <Select options={statusOptions} />
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
}
