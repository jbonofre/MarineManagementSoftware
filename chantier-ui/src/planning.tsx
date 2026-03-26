import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Badge, Button, Card, Col, Empty, Form, Input, Modal, Row, Select, Space, Table, Tag, Typography, message } from 'antd';
import { CalendarOutlined, EditOutlined } from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';
import { useHistory } from 'react-router-dom';

type VenteType = 'DEVIS' | 'FACTURE' | 'COMPTOIR';
type PlanningStatus = 'EN_ATTENTE' | 'PLANIFIEE' | 'EN_COURS' | 'TERMINEE' | 'INCIDENT' | 'ANNULEE';

interface ClientEntity {
    id: number;
    prenom?: string;
    nom: string;
}

interface TechnicienEntity {
    id: number;
    prenom?: string;
    nom?: string;
    couleur?: string;
}

interface ProduitCatalogueEntity {
    id: number;
}

interface VenteForfaitEntry {
    id?: number;
    forfait?: { id: number; nom: string; dureeEstimee?: number };
    quantite?: number;
    technicien?: TechnicienEntity;
    datePlanification?: string;
    dateDebut?: string;
    dateFin?: string;
    status?: PlanningStatus;
    statusDate?: string;
    dureeReelle?: number;
    notes?: string;
}

interface VenteServiceEntry {
    id?: number;
    service?: { id: number; nom: string; dureeEstimee?: number };
    quantite?: number;
    technicien?: TechnicienEntity;
    datePlanification?: string;
    dateDebut?: string;
    dateFin?: string;
    status?: PlanningStatus;
    statusDate?: string;
    dureeReelle?: number;
    notes?: string;
}

interface VenteEntity {
    id?: number;
    status: string;
    type?: VenteType;
    client?: ClientEntity;
    bateau?: { id: number; name?: string };
    produits?: ProduitCatalogueEntity[];
    venteForfaits?: VenteForfaitEntry[];
    venteServices?: VenteServiceEntry[];
    date?: string;
    prixVenteTTC?: number;
    modePaiement?: string;
}

interface PlanningItem {
    id?: number;
    type: 'forfait' | 'service';
    nom: string;
    technicien?: TechnicienEntity;
    datePlanification?: string;
    dateDebut?: string;
    dateFin?: string;
    status?: PlanningStatus;
    statusDate?: string;
    dureeEstimee?: number;
    quantite?: number;
    venteId?: number;
    clientNom?: string;
    bateauNom?: string;
}

interface PlanningFormValues {
    date: string;
    dateDebut?: string;
    dateFin?: string;
    status: PlanningStatus;
    technicienId?: number;
    incidentDate?: string;
    incidentDetails?: string;
}

interface CalendarEvent {
    eventId: string;
    startTime: Date;
    title: string;
    backgroundColor?: string;
    textColor?: string;
}

interface PlanningItemRow {
    key: string;
    vente: VenteEntity;
    item: PlanningItem;
    itemType: 'forfait' | 'service';
    itemIndex: number;
}

const statusOptions: Array<{ value: PlanningStatus; label: string }> = [
    { value: 'EN_ATTENTE', label: 'En attente' },
    { value: 'PLANIFIEE', label: 'Planifiee' },
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

const statusColor: Record<PlanningStatus, string> = {
    EN_ATTENTE: 'default',
    PLANIFIEE: 'cyan',
    EN_COURS: 'blue',
    TERMINEE: 'green',
    INCIDENT: 'volcano',
    ANNULEE: 'red'
};

const technicienPalette = [
    '#1677ff',
    '#13c2c2',
    '#52c41a',
    '#faad14',
    '#722ed1',
    '#eb2f96',
    '#fa541c',
    '#2f54eb'
];

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

const getTechnicienColor = (technicien?: TechnicienEntity) => {
    if (!technicien?.id) {
        return '#8c8c8c';
    }
    if (technicien.couleur) {
        return technicien.couleur;
    }
    const index = Math.abs(technicien.id) % technicienPalette.length;
    return technicienPalette[index];
};

const buildPlanningItems = (ventes: VenteEntity[]): PlanningItemRow[] => {
    const rows: PlanningItemRow[] = [];
    for (const vente of ventes) {
        const clientNom = vente.client ? `${vente.client.prenom || ''} ${vente.client.nom}`.trim() : '';
        const bateauNom = vente.bateau?.name;

        for (let i = 0; i < (vente.venteForfaits || []).length; i++) {
            const vf = vente.venteForfaits![i];
            const item: PlanningItem = {
                id: vf.id,
                type: 'forfait',
                nom: vf.forfait?.nom || '',
                technicien: vf.technicien,
                datePlanification: vf.datePlanification,
                dateDebut: vf.dateDebut,
                dateFin: vf.dateFin,
                status: vf.status,
                statusDate: vf.statusDate,
                dureeEstimee: vf.forfait?.dureeEstimee,
                quantite: vf.quantite,
                venteId: vente.id,
                clientNom,
                bateauNom,
            };
            rows.push({
                key: `vf-${vente.id}-${vf.id || i}-${i}`,
                vente,
                item,
                itemType: 'forfait',
                itemIndex: i,
            });
        }

        for (let i = 0; i < (vente.venteServices || []).length; i++) {
            const vs = vente.venteServices![i];
            const item: PlanningItem = {
                id: vs.id,
                type: 'service',
                nom: vs.service?.nom || '',
                technicien: vs.technicien,
                datePlanification: vs.datePlanification,
                dateDebut: vs.dateDebut,
                dateFin: vs.dateFin,
                status: vs.status,
                statusDate: vs.statusDate,
                dureeEstimee: vs.service?.dureeEstimee,
                quantite: vs.quantite,
                venteId: vente.id,
                clientNom,
                bateauNom,
            };
            rows.push({
                key: `vs-${vente.id}-${vs.id || i}-${i}`,
                vente,
                item,
                itemType: 'service',
                itemIndex: i,
            });
        }
    }
    return rows;
};

export default function Planning() {
    const history = useHistory();
    const [ventes, setVentes] = useState<VenteEntity[]>([]);
    const [techniciens, setTechniciens] = useState<TechnicienEntity[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState(todayIso());
    const [selectedStatus, setSelectedStatus] = useState<PlanningStatus | undefined>(undefined);
    const [selectedTechnicien, setSelectedTechnicien] = useState<number | undefined>(undefined);
    const [modalVisible, setModalVisible] = useState(false);
    const [saving, setSaving] = useState(false);
    const [currentRow, setCurrentRow] = useState<PlanningItemRow | null>(null);
    const [form] = Form.useForm<PlanningFormValues>();
    const calendarRef = useRef<HTMLDivElement>(null);
    const draggedRowRef = useRef<PlanningItemRow | null>(null);
    const [dragOverDay, setDragOverDay] = useState<string | null>(null);
    const [calendarWeekStart, setCalendarWeekStart] = useState<dayjs.Dayjs>(dayjs().startOf('week'));

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

    const fetchTechniciens = async () => {
        try {
            const response = await axios.get('/techniciens');
            setTechniciens(response.data || []);
        } catch {
            message.error('Erreur lors du chargement des techniciens.');
        }
    };

    useEffect(() => {
        fetchVentes();
        fetchTechniciens();
    }, []);

    const technicienOptions = useMemo(
        () =>
            techniciens.map((technicien) => ({
                value: technicien.id,
                label: `${technicien.prenom || ''} ${technicien.nom || ''}`.trim() || `Technicien #${technicien.id}`
            })),
        [techniciens]
    );

    const openPlanningModal = (row: PlanningItemRow, forcedDate?: string) => {
        setCurrentRow(row);
        form.setFieldsValue({
            date:
                toDateTimeLocalValue(row.item.statusDate)
                || (forcedDate ? `${forcedDate}T08:00` : undefined)
                || `${selectedDate || todayIso()}T08:00`,
            dateDebut: row.item.dateDebut || undefined,
            dateFin: row.item.dateFin || undefined,
            status: row.item.status === 'EN_ATTENTE' ? 'PLANIFIEE' : (row.item.status || 'PLANIFIEE'),
            technicienId: row.item.technicien?.id,
        });
        setModalVisible(true);
    };


    const allItems = useMemo<PlanningItemRow[]>(
        () => buildPlanningItems(ventes),
        [ventes]
    );

    const matchesTechnicien = (row: PlanningItemRow) =>
        !selectedTechnicien || row.item.technicien?.id === selectedTechnicien;

    const pendingItems = useMemo<PlanningItemRow[]>(
        () =>
            allItems
                .filter((row) => !row.item.status || row.item.status === 'EN_ATTENTE')
                .filter((row) => !selectedStatus || row.item.status === selectedStatus)
                .filter(matchesTechnicien),
        [allItems, selectedStatus, selectedTechnicien]
    );

    const pendingItemsForDay = useMemo<PlanningItemRow[]>(
        () => pendingItems.filter((row) => toIsoDay(row.item.statusDate) === selectedDate),
        [pendingItems, selectedDate]
    );

    const plannedItems = useMemo<PlanningItemRow[]>(
        () =>
            allItems
                .filter((row) => row.item.status === 'PLANIFIEE' || row.item.status === 'EN_COURS')
                .filter((row) => toIsoDay(row.item.statusDate) === selectedDate)
                .filter((row) => !selectedStatus || row.item.status === selectedStatus)
                .filter(matchesTechnicien),
        [allItems, selectedDate, selectedStatus, selectedTechnicien]
    );

    const weeklyEvents = useMemo<CalendarEvent[]>(
        () =>
            allItems
                .filter((row) => row.item.status === 'PLANIFIEE' || row.item.status === 'EN_COURS')
                .filter(matchesTechnicien)
                .map((row) => {
                    const { vente, item } = row;
                    const startSource = item.dateDebut || item.statusDate || vente.date;
                    if (!startSource) {
                        return null;
                    }
                    const startDate = dayjs(startSource);
                    if (!startDate.isValid()) {
                        return null;
                    }

                    const typeLabel = item.type === 'forfait' ? 'Forfait' : 'Service';

                    return {
                        eventId: row.key,
                        startTime: startDate.toDate(),
                        title: `#${vente.id} [${typeLabel}] ${item.nom || 'Sans nom'} (${getClientLabel(vente.client)})`,
                        backgroundColor: getTechnicienColor(item.technicien),
                        textColor: '#ffffff'
                    } as CalendarEvent;
                })
                .filter(Boolean) as CalendarEvent[],
        [allItems, selectedTechnicien]
    );

    const handleSavePlanning = async () => {
        if (!currentRow?.vente?.id) {
            return;
        }
        try {
            const values = await form.validateFields();
            setSaving(true);
            const venteId = currentRow.vente.id;
            const latestVenteResponse = await axios.get(`/ventes/${venteId}`);
            const latestVente = (latestVenteResponse.data || currentRow.vente) as VenteEntity;

            const listKey = currentRow.itemType === 'forfait' ? 'venteForfaits' : 'venteServices';
            const latestList = [...(latestVente[listKey] || [])];

            let itemToUpdateIndex = -1;
            if (currentRow.item.id !== undefined && currentRow.item.id !== null) {
                itemToUpdateIndex = latestList.findIndex((entry: VenteForfaitEntry | VenteServiceEntry) => entry.id === currentRow.item.id);
            }
            if (itemToUpdateIndex < 0) {
                itemToUpdateIndex = Math.min(currentRow.itemIndex, latestList.length - 1);
            }
            if (itemToUpdateIndex < 0 || !latestList[itemToUpdateIndex]) {
                message.error("Impossible de trouver l'element a mettre a jour.");
                return;
            }

            latestList[itemToUpdateIndex] = {
                ...latestList[itemToUpdateIndex],
                status: values.status,
                statusDate: values.date,
                dateDebut: values.dateDebut || latestList[itemToUpdateIndex].dateDebut,
                dateFin: values.dateFin || latestList[itemToUpdateIndex].dateFin,
                technicien: techniciens.find((technicien) => technicien.id === values.technicienId),
            };

            const updatedVente: VenteEntity = {
                ...latestVente,
                [listKey]: latestList
            };

            const res = await axios.put(`/ventes/${venteId}`, updatedVente);
            message.success('Planning mis a jour.');
            const savedVente = res.data as VenteEntity;
            const savedList = savedVente[listKey] || [];
            const savedEntry = savedList[itemToUpdateIndex] || latestList[itemToUpdateIndex];

            const clientNom = savedVente.client ? `${savedVente.client.prenom || ''} ${savedVente.client.nom}`.trim() : '';
            const bateauNom = savedVente.bateau?.name;
            const savedItem: PlanningItem = currentRow.itemType === 'forfait'
                ? {
                    id: (savedEntry as VenteForfaitEntry).id,
                    type: 'forfait',
                    nom: (savedEntry as VenteForfaitEntry).forfait?.nom || '',
                    technicien: savedEntry.technicien,
                    datePlanification: savedEntry.datePlanification,
                    dateDebut: savedEntry.dateDebut,
                    dateFin: savedEntry.dateFin,
                    status: savedEntry.status,
                    statusDate: savedEntry.statusDate,
                    dureeEstimee: (savedEntry as VenteForfaitEntry).forfait?.dureeEstimee,
                    quantite: savedEntry.quantite,
                    venteId: savedVente.id,
                    clientNom,
                    bateauNom,
                }
                : {
                    id: (savedEntry as VenteServiceEntry).id,
                    type: 'service',
                    nom: (savedEntry as VenteServiceEntry).service?.nom || '',
                    technicien: savedEntry.technicien,
                    datePlanification: savedEntry.datePlanification,
                    dateDebut: savedEntry.dateDebut,
                    dateFin: savedEntry.dateFin,
                    status: savedEntry.status,
                    statusDate: savedEntry.statusDate,
                    dureeEstimee: (savedEntry as VenteServiceEntry).service?.dureeEstimee,
                    quantite: savedEntry.quantite,
                    venteId: savedVente.id,
                    clientNom,
                    bateauNom,
                };

            setCurrentRow({ ...currentRow, vente: savedVente, item: savedItem });
            form.setFieldsValue({
                date: toDateTimeLocalValue(savedEntry.statusDate) || values.date,
                dateDebut: savedEntry.dateDebut || values.dateDebut,
                dateFin: savedEntry.dateFin || values.dateFin,
                status: savedEntry.status || values.status,
                technicienId: savedEntry.technicien?.id || values.technicienId,
            });
            fetchVentes();
        } catch (error) {
            const formError = error as { errorFields?: unknown[] };
            if (Array.isArray(formError.errorFields) && formError.errorFields.length > 0) {
                return;
            }
            if (axios.isAxiosError(error)) {
                message.error(error.response?.data?.message || "Erreur lors de la mise a jour.");
                return;
            }
            message.error("Erreur lors de la mise a jour.");
        } finally {
            setSaving(false);
        }
    };

    const commonColumns = [
        {
            title: 'Vente',
            dataIndex: 'id',
            render: (_: unknown, record: PlanningItemRow) => `#${record.vente.id}`
        },
        {
            title: 'Client',
            dataIndex: 'client',
            render: (_: unknown, record: PlanningItemRow) => getClientLabel(record.vente.client)
        },
        {
            title: 'Type vente',
            dataIndex: 'type',
            render: (_: unknown, record: PlanningItemRow) => typeOptions.find((item) => item.value === record.vente.type)?.label || record.vente.type || '-'
        },
        {
            title: 'Type',
            key: 'itemType',
            render: (_: unknown, record: PlanningItemRow) => (
                <Tag color={record.item.type === 'forfait' ? 'purple' : 'geekblue'}>
                    {record.item.type === 'forfait' ? 'Forfait' : 'Service'}
                </Tag>
            )
        },
        {
            title: 'Statut',
            dataIndex: 'itemStatus',
            render: (_: unknown, record: PlanningItemRow) => {
                const status = record.item.status || 'EN_ATTENTE';
                const label = statusOptions.find((item) => item.value === status)?.label || status;
                return <Tag color={statusColor[status] || 'default'}>{label}</Tag>;
            }
        },
        {
            title: 'Nom',
            key: 'itemName',
            render: (_: unknown, record: PlanningItemRow) => record.item.nom || '(Sans nom)'
        },
        {
            title: 'Debut',
            key: 'dateDebut',
            render: (_: unknown, record: PlanningItemRow) => record.item.dateDebut ? dayjs(record.item.dateDebut).format('DD/MM/YYYY') : '-'
        },
        {
            title: 'Fin',
            key: 'dateFin',
            render: (_: unknown, record: PlanningItemRow) => record.item.dateFin ? dayjs(record.item.dateFin).format('DD/MM/YYYY') : '-'
        }
    ];

    const pendingColumns = [
        ...commonColumns,
        {
            title: 'Date statut',
            key: 'statusDate',
            render: (_: unknown, record: PlanningItemRow) => toIsoDay(record.item.statusDate) || '-'
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: unknown, record: PlanningItemRow) => (
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
            render: (_: unknown, record: PlanningItemRow) => toIsoDay(record.item.statusDate) || '-'
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: unknown, record: PlanningItemRow) => (
                <Space>
                    <Button icon={<EditOutlined />} onClick={() => openPlanningModal(record)}>
                        Replanifier
                    </Button>
                    {record.vente.id && (
                        <Button onClick={() => history.push(`/prestations?venteId=${record.vente.id}`)}>
                            Voir prestation
                        </Button>
                    )}
                </Space>
            )
        }
    ];

    return (
        <Card title="Planning">
            <Row gutter={[16, 16]}>
                <Col flex="auto">
                    <Card size="small" title="Filtres">
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <Input type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value || todayIso())} />
                            <Select
                                allowClear
                                options={statusOptions}
                                placeholder="Tous les statuts"
                                value={selectedStatus}
                                onChange={(value) => setSelectedStatus(value)}
                                style={{ width: '100%' }}
                            />
                            <Select
                                allowClear
                                showSearch
                                options={technicienOptions}
                                placeholder="Tous les techniciens"
                                value={selectedTechnicien}
                                onChange={(value) => setSelectedTechnicien(value)}
                                style={{ width: '100%' }}
                                filterOption={(input, option) =>
                                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                }
                            />
                        </Space>
                    </Card>
                </Col>
                <Col flex="auto">
                    <Card size="small" title="Synthese">
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <div>
                                <Badge status="processing" /> Date: <strong>{selectedDate}</strong>
                            </div>
                            <div>
                                <Badge status="success" /> Planifiees (jour): <strong>{plannedItems.length}</strong>
                            </div>
                            <div>
                                <Badge status="warning" /> En attente (jour): <strong>{pendingItemsForDay.length}</strong>
                            </div>
                            <div>
                                <Badge status="default" /> En attente (total): <strong>{pendingItems.length}</strong>
                            </div>
                        </Space>
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col span={24}>
                    <Card size="small" title={<span>Vue semaine <Typography.Text type="secondary" style={{ fontWeight: 'normal', fontSize: 12 }}>(glisser-deposer un element depuis le tableau ci-dessous)</Typography.Text></span>}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                            <Button size="small" onClick={() => setCalendarWeekStart(calendarWeekStart.subtract(7, 'day'))}>&lt; Semaine precedente</Button>
                            <Button size="small" onClick={() => setCalendarWeekStart(dayjs().startOf('week'))}>Aujourd'hui</Button>
                            <Button size="small" onClick={() => setCalendarWeekStart(calendarWeekStart.add(7, 'day'))}>Semaine suivante &gt;</Button>
                        </div>
                        <div
                            ref={calendarRef}
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(7, 1fr)',
                                gap: 4,
                                border: dragOverDay ? '2px dashed #1677ff' : '2px dashed transparent',
                                borderRadius: 8,
                                transition: 'border-color 0.2s'
                            }}
                        >
                            {Array.from({ length: 7 }, (_, i) => {
                                const day = calendarWeekStart.add(i, 'day');
                                const dayStr = day.format('YYYY-MM-DD');
                                const isToday = dayStr === todayIso();
                                const isSelected = dayStr === selectedDate;
                                const dayEvents = weeklyEvents.filter((ev) => dayjs(ev.startTime).format('YYYY-MM-DD') === dayStr);
                                return (
                                    <div
                                        key={dayStr}
                                        onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDragOverDay(dayStr); }}
                                        onDragLeave={() => setDragOverDay(null)}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            setDragOverDay(null);
                                            const row = draggedRowRef.current;
                                            draggedRowRef.current = null;
                                            if (row) openPlanningModal(row, dayStr);
                                        }}
                                        onClick={() => setSelectedDate(dayStr)}
                                        style={{
                                            minHeight: 320,
                                            border: dragOverDay === dayStr ? '2px dashed #1677ff' : isSelected ? '2px solid #1677ff' : '1px solid #d9d9d9',
                                            borderRadius: 6,
                                            padding: 4,
                                            cursor: 'pointer',
                                            background: isToday ? '#e6f4ff' : '#fff',
                                        }}
                                    >
                                        <div style={{ fontWeight: isToday ? 700 : 500, fontSize: 12, marginBottom: 4, textAlign: 'center' }}>
                                            {day.format('ddd DD/MM')}
                                        </div>
                                        {dayEvents.map((ev) => (
                                            <div
                                                key={ev.eventId}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const matchedRow = allItems.find((row) => row.key === ev.eventId);
                                                    if (matchedRow) openPlanningModal(matchedRow);
                                                }}
                                                style={{
                                                    background: ev.backgroundColor || '#1677ff',
                                                    color: ev.textColor || '#fff',
                                                    borderRadius: 4,
                                                    padding: '2px 6px',
                                                    fontSize: 11,
                                                    marginBottom: 2,
                                                    cursor: 'pointer',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                }}
                                                title={ev.title}
                                            >
                                                {ev.title}
                                            </div>
                                        ))}
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col span={24}>
                    <Card title={`Planifie le ${selectedDate}`} size="small" bodyStyle={{ padding: plannedItems.length ? 12 : 24 }}>
                        {plannedItems.length ? (
                            <Table
                                rowKey="key"
                                loading={loading}
                                dataSource={plannedItems}
                                columns={dayColumns}
                                pagination={{ pageSize: 8 }}
                                bordered
                            />
                        ) : (
                            <Empty description="Aucun element planifie pour cette date." />
                        )}
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col span={24}>
                    <Card
                        title="A planifier (en attente)"
                        size="small"
                        bodyStyle={{ padding: pendingItems.length ? 12 : 24 }}
                    >
                        {pendingItems.length ? (
                            <Table
                                rowKey="key"
                                loading={loading}
                                dataSource={pendingItems}
                                columns={pendingColumns}
                                pagination={{ pageSize: 6 }}
                                bordered
                                onRow={(record) => ({
                                    draggable: true,
                                    style: { cursor: 'grab' },
                                    onDragStart: (e) => {
                                        draggedRowRef.current = record;
                                        e.dataTransfer.effectAllowed = 'move';
                                        e.dataTransfer.setData('text/plain', record.key);
                                    },
                                    onDragEnd: () => {
                                        draggedRowRef.current = null;
                                        setDragOverDay(null);
                                    }
                                })}
                            />
                        ) : (
                            <Empty description="Aucun element en attente." />
                        )}
                    </Card>
                </Col>
            </Row>

            <Modal
                open={modalVisible}
                title={currentRow?.item?.nom ? `Planifier: ${currentRow.item.nom}` : 'Planifier'}
                onOk={handleSavePlanning}
                okText="Enregistrer"
                confirmLoading={saving}
                cancelText="Annuler"
                onCancel={() => {
                    setModalVisible(false);
                    setCurrentRow(null);
                    form.resetFields();
                }}
                destroyOnHidden
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="date"
                        label="Date et heure planifiees"
                        rules={[{ required: true, message: 'La date est requise' }]}
                    >
                        <Input type="datetime-local" />
                    </Form.Item>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="dateDebut" label="Date de debut">
                                <Input type="datetime-local" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="dateFin" label="Date de fin">
                                <Input type="datetime-local" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item
                        name="status"
                        label="Statut"
                        rules={[{ required: true, message: 'Le statut est requis' }]}
                    >
                        <Select options={statusOptions} />
                    </Form.Item>
                    <Form.Item name="technicienId" label="Technicien">
                        <Select allowClear showSearch options={technicienOptions} placeholder="Selectionner un technicien" />
                    </Form.Item>
                    <Form.Item noStyle shouldUpdate={(prev, cur) => prev?.status !== cur?.status}>
                        {({ getFieldValue }) => {
                            if (getFieldValue('status') !== 'INCIDENT') return null;
                            return (
                                <Card size="small" title="Incident" style={{ marginBottom: 12, borderColor: '#ff4d4f' }}>
                                    <Form.Item name="incidentDate" label="Date de l'incident">
                                        <Input type="date" />
                                    </Form.Item>
                                    <Form.Item name="incidentDetails" label="Details de l'incident">
                                        <Input.TextArea rows={3} />
                                    </Form.Item>
                                </Card>
                            );
                        }}
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
}
