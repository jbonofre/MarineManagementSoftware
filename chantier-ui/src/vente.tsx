import React, { useEffect, useMemo, useState } from 'react';
import {
    Button,
    Card,
    Col,
    Form,
    Input,
    InputNumber,
    Modal,
    Popconfirm,
    Row,
    Select,
    Space,
    Table,
    Tag,
    message
} from 'antd';
import { DeleteOutlined, EditOutlined, MailOutlined, PlusCircleOutlined, PrinterOutlined } from '@ant-design/icons';
import axios from 'axios';

interface ClientEntity {
    id: number;
    prenom?: string;
    nom: string;
    email?: string;
}

interface BateauClientEntity {
    id: number;
    name?: string;
    immatriculation?: string;
}

interface MoteurClientEntity {
    id: number;
    numeroSerie?: string;
}

interface RemorqueClientEntity {
    id: number;
    immatriculation?: string;
}

interface ForfaitEntity {
    id: number;
    reference?: string;
    nom: string;
    prixTTC?: number;
}

interface ProduitCatalogueEntity {
    id: number;
    nom: string;
    marque?: string;
    prixVenteTTC?: number;
}

interface ServiceEntity {
    id: number;
    nom: string;
    prixTTC?: number;
}

type VenteStatus = 'DEVIS' | 'COMMANDEE' | 'PAYEE' | 'TERMINEE' | 'ANNULEE';

interface VenteEntity {
    id?: number;
    status: VenteStatus;
    client?: ClientEntity;
    bateau?: BateauClientEntity;
    moteur?: MoteurClientEntity;
    remorque?: RemorqueClientEntity;
    forfaits?: ForfaitEntity[];
    produits?: ProduitCatalogueEntity[];
    services?: ServiceEntity[];
    date?: string;
    montantHT?: number;
    remise?: number;
    montantTTC?: number;
    tva?: number;
    montantTVA?: number;
    prixVenteTTC?: number;
}

interface VenteFormValues {
    status: VenteStatus;
    clientId?: number;
    bateauId?: number;
    moteurId?: number;
    remorqueId?: number;
    forfaits: Array<{ forfaitId?: number; quantite: number }>;
    produits: Array<{ produitId?: number; quantite: number }>;
    services: Array<{ serviceId?: number; quantite: number }>;
    date?: string;
    montantHT: number;
    remise: number;
    remisePourcentage: number;
    tva: number;
    montantTVA: number;
    montantTTC: number;
    prixVenteTTC: number;
}

interface SearchFilters {
    status?: VenteStatus;
    clientId?: number;
}

const statusOptions: Array<{ value: VenteStatus; label: string }> = [
    { value: 'DEVIS', label: 'Devis' },
    { value: 'COMMANDEE', label: 'Commandee' },
    { value: 'PAYEE', label: 'Payee' },
    { value: 'TERMINEE', label: 'Terminee' },
    { value: 'ANNULEE', label: 'Annulee' }
];

const statusColor: Record<VenteStatus, string> = {
    DEVIS: 'default',
    COMMANDEE: 'blue',
    PAYEE: 'green',
    TERMINEE: 'purple',
    ANNULEE: 'red'
};

const defaultVente: VenteFormValues = {
    status: 'DEVIS',
    forfaits: [],
    produits: [],
    services: [],
    montantHT: 0,
    remise: 0,
    remisePourcentage: 0,
    tva: 20,
    montantTVA: 0,
    montantTTC: 0,
    prixVenteTTC: 0
};

const formatEuro = (value?: number) => `${(value || 0).toFixed(2)} EUR`;
const formatDate = (value?: string) => value || '-';
const escapeHtml = (value: string) =>
    value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

const getClientLabel = (client?: ClientEntity) => {
    if (!client) {
        return '-';
    }
    const fullName = `${client.prenom || ''} ${client.nom || ''}`.trim();
    return fullName || `Client #${client.id}`;
};

export default function Vente() {
    const [ventes, setVentes] = useState<VenteEntity[]>([]);
    const [clients, setClients] = useState<ClientEntity[]>([]);
    const [bateaux, setBateaux] = useState<BateauClientEntity[]>([]);
    const [moteurs, setMoteurs] = useState<MoteurClientEntity[]>([]);
    const [remorques, setRemorques] = useState<RemorqueClientEntity[]>([]);
    const [forfaits, setForfaits] = useState<ForfaitEntity[]>([]);
    const [produits, setProduits] = useState<ProduitCatalogueEntity[]>([]);
    const [services, setServices] = useState<ServiceEntity[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [currentVente, setCurrentVente] = useState<VenteEntity | null>(null);
    const [filters, setFilters] = useState<SearchFilters>({});
    const [searchForm] = Form.useForm<SearchFilters>();
    const [form] = Form.useForm<VenteFormValues>();

    const clientOptions = useMemo(
        () => clients.map((client) => ({ value: client.id, label: getClientLabel(client) })),
        [clients]
    );

    const bateauOptions = useMemo(
        () => bateaux.map((bateau) => ({ value: bateau.id, label: bateau.name || bateau.immatriculation || `Bateau #${bateau.id}` })),
        [bateaux]
    );

    const moteurOptions = useMemo(
        () => moteurs.map((moteur) => ({ value: moteur.id, label: moteur.numeroSerie || `Moteur #${moteur.id}` })),
        [moteurs]
    );

    const remorqueOptions = useMemo(
        () => remorques.map((remorque) => ({ value: remorque.id, label: remorque.immatriculation || `Remorque #${remorque.id}` })),
        [remorques]
    );

    const forfaitOptions = useMemo(
        () =>
            forfaits.map((forfait) => ({
                value: forfait.id,
                label: forfait.reference ? `${forfait.reference} - ${forfait.nom}` : forfait.nom,
                searchText: (forfait.reference || '').toLowerCase()
            })),
        [forfaits]
    );

    const produitOptions = useMemo(
        () => produits.map((produit) => ({ value: produit.id, label: `${produit.nom}${produit.marque ? ` (${produit.marque})` : ''}` })),
        [produits]
    );

    const serviceOptions = useMemo(
        () => services.map((service) => ({ value: service.id, label: service.nom })),
        [services]
    );

    const fetchVentes = async (nextFilters?: SearchFilters) => {
        setLoading(true);
        try {
            const activeFilters = nextFilters || {};
            const hasStatus = !!activeFilters.status;
            const hasClient = activeFilters.clientId !== undefined;
            const endpoint = hasStatus || hasClient ? '/ventes/search' : '/ventes';
            const response = await axios.get(endpoint, {
                params: {
                    ...(hasStatus ? { status: activeFilters.status } : {}),
                    ...(hasClient ? { clientId: activeFilters.clientId } : {})
                }
            });
            setVentes(response.data || []);
        } catch {
            message.error('Erreur lors du chargement des ventes.');
        } finally {
            setLoading(false);
        }
    };

    const fetchOptions = async () => {
        try {
            const [
                clientsRes,
                bateauxRes,
                moteursRes,
                remorquesRes,
                forfaitsRes,
                produitsRes,
                servicesRes
            ] = await Promise.all([
                axios.get('/clients'),
                axios.get('/bateaux'),
                axios.get('/moteurs'),
                axios.get('/remorques'),
                axios.get('/forfaits'),
                axios.get('/catalogue/produits'),
                axios.get('/services')
            ]);
            setClients(clientsRes.data || []);
            setBateaux(bateauxRes.data || []);
            setMoteurs(moteursRes.data || []);
            setRemorques(remorquesRes.data || []);
            setForfaits(forfaitsRes.data || []);
            setProduits(produitsRes.data || []);
            setServices(servicesRes.data || []);
        } catch {
            message.error('Erreur lors du chargement des listes de reference.');
        }
    };

    useEffect(() => {
        fetchVentes();
        fetchOptions();
    }, []);

    const openModal = (vente?: VenteEntity) => {
        if (vente) {
            setIsEdit(true);
            setCurrentVente(vente);
            form.setFieldsValue({
                status: vente.status || 'DEVIS',
                clientId: vente.client?.id,
                bateauId: vente.bateau?.id,
                moteurId: vente.moteur?.id,
                remorqueId: vente.remorque?.id,
                forfaits: (vente.forfaits || [])
                    .filter((item) => !!item?.id)
                    .map((item) => ({ forfaitId: item.id, quantite: 1 })),
                produits: (vente.produits || [])
                    .filter((item) => !!item?.id)
                    .map((item) => ({ produitId: item.id, quantite: 1 })),
                services: (vente.services || [])
                    .filter((item) => !!item?.id)
                    .map((item) => ({ serviceId: item.id, quantite: 1 })),
                date: vente.date || undefined,
                montantHT: vente.montantHT || 0,
                remise: vente.remise || 0,
                remisePourcentage: vente.montantTTC ? Math.round((((vente.remise || 0) / vente.montantTTC) * 100 + Number.EPSILON) * 100) / 100 : 0,
                tva: vente.tva || 0,
                montantTVA: vente.montantTVA || 0,
                montantTTC: vente.montantTTC || 0,
                prixVenteTTC: vente.prixVenteTTC || 0
            });
        } else {
            setIsEdit(false);
            setCurrentVente(null);
            form.resetFields();
            form.setFieldsValue(defaultVente);
        }
        setModalVisible(true);
    };

    const expandByQuantity = <T,>(items: T[], quantite: number): T[] => {
        const safeQuantity = Math.max(1, Math.floor(quantite || 1));
        return Array.from({ length: safeQuantity }, () => items).flat();
    };

    const toPayload = (values: VenteFormValues): VenteEntity => ({
        status: values.status,
        client: clients.find((client) => client.id === values.clientId),
        bateau: bateaux.find((bateau) => bateau.id === values.bateauId),
        moteur: moteurs.find((moteur) => moteur.id === values.moteurId),
        remorque: remorques.find((remorque) => remorque.id === values.remorqueId),
        forfaits: (values.forfaits || [])
            .filter((line) => line.forfaitId)
            .flatMap((line) => {
                const item = forfaits.find((forfait) => forfait.id === line.forfaitId);
                return item ? expandByQuantity([item], line.quantite) : [];
            }) as ForfaitEntity[],
        produits: (values.produits || [])
            .filter((line) => line.produitId)
            .flatMap((line) => {
                const item = produits.find((produit) => produit.id === line.produitId);
                return item ? expandByQuantity([item], line.quantite) : [];
            }) as ProduitCatalogueEntity[],
        services: (values.services || [])
            .filter((line) => line.serviceId)
            .flatMap((line) => {
                const item = services.find((service) => service.id === line.serviceId);
                return item ? expandByQuantity([item], line.quantite) : [];
            }) as ServiceEntity[],
        date: values.date,
        montantHT: values.montantHT || 0,
        remise: values.remise || 0,
        tva: values.tva || 0,
        montantTVA: values.montantTVA || 0,
        montantTTC: values.montantTTC || 0,
        prixVenteTTC: values.prixVenteTTC || 0
    });

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            const payload = toPayload(values);
            if (isEdit && currentVente?.id) {
                await axios.put(`/ventes/${currentVente.id}`, { ...currentVente, ...payload });
                message.success('Vente modifiee avec succes');
            } else {
                await axios.post('/ventes', payload);
                message.success('Vente ajoutee avec succes');
            }
            setModalVisible(false);
            form.resetFields();
            fetchVentes(filters);
        } catch {
            // Les erreurs de validation sont affichees par le formulaire.
        }
    };

    const handleDelete = async (id?: number) => {
        if (!id) {
            return;
        }
        try {
            await axios.delete(`/ventes/${id}`);
            message.success('Vente supprimee avec succes');
            fetchVentes(filters);
        } catch {
            message.error('Erreur lors de la suppression de la vente.');
        }
    };

    const handlePrint = (vente: VenteEntity) => {
        const popup = window.open('', '_blank', 'width=900,height=700,noopener,noreferrer');
        if (!popup) {
            message.error("Impossible d'ouvrir la fenetre d'impression.");
            return;
        }

        const title = `Vente #${vente.id || '-'}`;
        const forfaitLines = (vente.forfaits || []).map((item) => item.reference ? `${item.reference} - ${item.nom}` : item.nom);
        const produitLines = (vente.produits || []).map((item) => `${item.nom}${item.marque ? ` (${item.marque})` : ''}`);
        const serviceLines = (vente.services || []).map((item) => item.nom);
        const listToHtml = (items: string[]) =>
            items.length > 0
                ? `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`
                : '<p>Aucun element</p>';

        popup.document.write(`
            <html>
            <head>
                <title>${escapeHtml(title)}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 24px; color: #1f1f1f; }
                    h1 { margin-bottom: 8px; }
                    .meta { margin-bottom: 20px; color: #595959; }
                    .row { margin-bottom: 8px; }
                    .section { margin-top: 20px; }
                    ul { margin: 8px 0 0 20px; }
                </style>
            </head>
            <body>
                <h1>${escapeHtml(title)}</h1>
                <div class="meta">Date: ${escapeHtml(formatDate(vente.date))}</div>
                <div class="row"><strong>Statut:</strong> ${escapeHtml(vente.status || '-')}</div>
                <div class="row"><strong>Client:</strong> ${escapeHtml(getClientLabel(vente.client))}</div>
                <div class="row"><strong>Montant TTC:</strong> ${escapeHtml(formatEuro(vente.montantTTC))}</div>
                <div class="row"><strong>Remise:</strong> ${escapeHtml(formatEuro(vente.remise))}</div>
                <div class="row"><strong>Prix vente TTC:</strong> ${escapeHtml(formatEuro(vente.prixVenteTTC))}</div>

                <div class="section">
                    <h3>Forfaits</h3>
                    ${listToHtml(forfaitLines)}
                </div>
                <div class="section">
                    <h3>Produits</h3>
                    ${listToHtml(produitLines)}
                </div>
                <div class="section">
                    <h3>Services</h3>
                    ${listToHtml(serviceLines)}
                </div>
            </body>
            </html>
        `);
        popup.document.close();
        popup.focus();
        popup.print();
    };

    const handleEmail = (vente: VenteEntity) => {
        const email = vente.client?.email || '';
        if (!email) {
            message.warning("Aucun email client n'est renseigne pour cette vente.");
        }

        const subject = encodeURIComponent(`Vente #${vente.id || '-'}`);
        const body = encodeURIComponent(
            [
                `Bonjour ${getClientLabel(vente.client)},`,
                '',
                `Veuillez trouver les informations de votre vente #${vente.id || '-'}.`,
                `Date: ${formatDate(vente.date)}`,
                `Statut: ${vente.status || '-'}`,
                `Prix vente TTC: ${formatEuro(vente.prixVenteTTC)}`,
                '',
                'Cordialement,'
            ].join('\n')
        );

        window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    };

    const recalculateFromLines = (remiseSource: 'amount' | 'percentage' | 'auto' = 'auto') => {
        const forfaitLines = form.getFieldValue('forfaits') || [];
        const produitLines = form.getFieldValue('produits') || [];
        const serviceLines = form.getFieldValue('services') || [];
        let remise = form.getFieldValue('remise') || 0;
        let remisePourcentage = form.getFieldValue('remisePourcentage') || 0;
        const tva = form.getFieldValue('tva') || 0;

        const forfaitsTTC = forfaitLines.reduce((sum: number, line: { forfaitId?: number; quantite?: number }) => {
            const prixUnitaire = forfaits.find((item) => item.id === line.forfaitId)?.prixTTC || 0;
            const quantite = Math.max(1, Math.floor(line.quantite || 1));
            return sum + (prixUnitaire * quantite);
        }, 0);
        const produitsTTC = produitLines.reduce((sum: number, line: { produitId?: number; quantite?: number }) => {
            const prixUnitaire = produits.find((item) => item.id === line.produitId)?.prixVenteTTC || 0;
            const quantite = Math.max(1, Math.floor(line.quantite || 1));
            return sum + (prixUnitaire * quantite);
        }, 0);
        const servicesTTC = serviceLines.reduce((sum: number, line: { serviceId?: number; quantite?: number }) => {
            const prixUnitaire = services.find((item) => item.id === line.serviceId)?.prixTTC || 0;
            const quantite = Math.max(1, Math.floor(line.quantite || 1));
            return sum + (prixUnitaire * quantite);
        }, 0);

        const montantTTC = Math.round(((forfaitsTTC + produitsTTC + servicesTTC) + Number.EPSILON) * 100) / 100;
        const montantTVA = Math.round((((montantTTC / (100 + tva)) * tva) + Number.EPSILON) * 100) / 100;
        const montantHT = Math.round(((montantTTC - montantTVA) + Number.EPSILON) * 100) / 100;

        if (remiseSource === 'percentage') {
            remise = Math.round((((montantTTC * remisePourcentage) / 100) + Number.EPSILON) * 100) / 100;
        } else {
            remisePourcentage = montantTTC > 0
                ? Math.round((((remise / montantTTC) * 100) + Number.EPSILON) * 100) / 100
                : 0;
        }

        const prixVenteTTC = Math.round(((montantTTC - remise) + Number.EPSILON) * 100) / 100;

        form.setFieldValue('montantHT', montantHT);
        form.setFieldValue('montantTVA', montantTVA);
        form.setFieldValue('montantTTC', montantTTC);
        form.setFieldValue('remise', remise);
        form.setFieldValue('remisePourcentage', remisePourcentage);
        form.setFieldValue('prixVenteTTC', prixVenteTTC);
    };

    const onValuesChange = (changedValues: Partial<VenteFormValues>) => {
        if (
            changedValues.forfaits !== undefined ||
            changedValues.produits !== undefined ||
            changedValues.services !== undefined ||
            changedValues.tva !== undefined ||
            changedValues.remisePourcentage !== undefined ||
            changedValues.remise !== undefined
        ) {
            if (changedValues.remisePourcentage !== undefined) {
                recalculateFromLines('percentage');
                return;
            }
            if (changedValues.remise !== undefined) {
                recalculateFromLines('amount');
                return;
            }
            recalculateFromLines('auto');
        }
    };

    const columns = [
        {
            title: 'Date',
            dataIndex: 'date',
            render: (value: string) => value || '-'
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
            title: 'Client',
            dataIndex: 'client',
            render: (value: ClientEntity) => getClientLabel(value)
        },
        {
            title: 'Forfaits',
            dataIndex: 'forfaits',
            render: (values: ForfaitEntity[]) => values?.length || 0
        },
        {
            title: 'Produits',
            dataIndex: 'produits',
            render: (values: ProduitCatalogueEntity[]) => values?.length || 0
        },
        {
            title: 'Services',
            dataIndex: 'services',
            render: (values: ServiceEntity[]) => values?.length || 0
        },
        {
            title: 'Prix vente TTC',
            dataIndex: 'prixVenteTTC',
            sorter: (a: VenteEntity, b: VenteEntity) => (a.prixVenteTTC || 0) - (b.prixVenteTTC || 0),
            render: (value: number) => formatEuro(value)
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: unknown, record: VenteEntity) => (
                <Space>
                    <Button title="Imprimer" icon={<PrinterOutlined />} onClick={() => handlePrint(record)} />
                    <Button title="Envoyer par email" icon={<MailOutlined />} onClick={() => handleEmail(record)} />
                    <Button icon={<EditOutlined />} onClick={() => openModal(record)} />
                    <Popconfirm
                        title="Supprimer cette vente ?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Oui"
                        cancelText="Non"
                    >
                        <Button danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <Card title="Vente & Prestations">
            <Form
                form={searchForm}
                layout="vertical"
                initialValues={{ status: undefined, clientId: undefined }}
                onFinish={(values) => {
                    const nextFilters: SearchFilters = {
                        status: values.status,
                        clientId: values.clientId
                    };
                    setFilters(nextFilters);
                    fetchVentes(nextFilters);
                }}
            >
                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item name="status" label="Statut">
                            <Select allowClear options={statusOptions} placeholder="Tous les statuts" />
                        </Form.Item>
                    </Col>
                    <Col span={10}>
                        <Form.Item name="clientId" label="Client">
                            <Select allowClear showSearch options={clientOptions} placeholder="Tous les clients" />
                        </Form.Item>
                    </Col>
                    <Col span={6} style={{ display: 'flex', alignItems: 'end' }}>
                        <Space>
                            <Button type="primary" htmlType="submit">Rechercher</Button>
                            <Button
                                onClick={() => {
                                    searchForm.resetFields();
                                    setFilters({});
                                    fetchVentes();
                                }}
                            >
                                Reinitialiser
                            </Button>
                            <Button type="primary" icon={<PlusCircleOutlined />} onClick={() => openModal()} />
                        </Space>
                    </Col>
                </Row>
            </Form>

            <Row gutter={[16, 16]} style={{ marginTop: 8 }}>
                <Col span={24}>
                    <Table
                        rowKey="id"
                        dataSource={ventes}
                        columns={columns}
                        loading={loading}
                        pagination={{ pageSize: 10 }}
                        bordered
                    />
                </Col>
            </Row>

            <Modal
                title={isEdit ? 'Modifier une vente' : 'Ajouter une vente'}
                open={modalVisible}
                onOk={handleSave}
                onCancel={() => setModalVisible(false)}
                okText="Enregistrer"
                cancelText="Annuler"
                maskClosable={false}
                destroyOnHidden
                width={1100}
            >
                <Form form={form} layout="vertical" initialValues={defaultVente} onValuesChange={onValuesChange}>
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item
                                name="status"
                                label="Statut"
                                rules={[{ required: true, message: 'Le statut est requis' }]}
                            >
                                <Select options={statusOptions} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="date" label="Date">
                                <Input type="date" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="clientId" label="Client">
                                <Select allowClear showSearch options={clientOptions} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="bateauId" label="Bateau">
                                <Select allowClear showSearch options={bateauOptions} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="moteurId" label="Moteur">
                                <Select allowClear showSearch options={moteurOptions} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="remorqueId" label="Remorque">
                                <Select allowClear showSearch options={remorqueOptions} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item label="Forfaits">
                        <Form.List name="forfaits">
                            {(fields, { add, remove }) => (
                                <>
                                    {fields.map((field) => (
                                        <Space key={field.key} align="baseline" style={{ display: 'flex', marginBottom: 8 }}>
                                            <Form.Item
                                                {...field}
                                                name={[field.name, 'forfaitId']}
                                                rules={[{ required: true, message: 'Forfait requis' }]}
                                                style={{ width: 520 }}
                                            >
                                                <Select
                                                    allowClear
                                                    showSearch
                                                    options={forfaitOptions}
                                                    placeholder="Forfait"
                                                    filterOption={(input, option) =>
                                                        (((option as { searchText?: string } | undefined)?.searchText) || '').includes(input.toLowerCase())
                                                    }
                                                />
                                            </Form.Item>
                                            <Form.Item
                                                {...field}
                                                name={[field.name, 'quantite']}
                                                rules={[{ required: true, message: 'Quantite requise' }]}
                                                style={{ width: 180 }}
                                            >
                                                <InputNumber min={1} step={1} style={{ width: '100%' }} placeholder="Qte" />
                                            </Form.Item>
                                            <Form.Item noStyle shouldUpdate>
                                                {({ getFieldValue }) => {
                                                    const forfaitId = getFieldValue(['forfaits', field.name, 'forfaitId']);
                                                    const quantite = getFieldValue(['forfaits', field.name, 'quantite']) || 0;
                                                    const prixUnitaireTTC = forfaits.find((item) => item.id === forfaitId)?.prixTTC || 0;
                                                    const prixTTC = Math.round(((prixUnitaireTTC * quantite) + Number.EPSILON) * 100) / 100;

                                                    return (
                                                        <Form.Item style={{ width: 180 }}>
                                                            <InputNumber addonAfter="EUR" value={prixTTC} style={{ width: '100%' }} disabled />
                                                        </Form.Item>
                                                    );
                                                }}
                                            </Form.Item>
                                            <Button danger icon={<DeleteOutlined />} onClick={() => remove(field.name)} />
                                        </Space>
                                    ))}
                                    <Button type="dashed" onClick={() => add({ quantite: 1 })} block icon={<PlusCircleOutlined />}>
                                        Ajouter un forfait
                                    </Button>
                                </>
                            )}
                        </Form.List>
                    </Form.Item>

                    <Form.Item label="Produits">
                        <Form.List name="produits">
                            {(fields, { add, remove }) => (
                                <>
                                    {fields.map((field) => (
                                        <Space key={field.key} align="baseline" style={{ display: 'flex', marginBottom: 8 }}>
                                            <Form.Item
                                                {...field}
                                                name={[field.name, 'produitId']}
                                                rules={[{ required: true, message: 'Produit requis' }]}
                                                style={{ width: 520 }}
                                            >
                                                <Select allowClear showSearch options={produitOptions} placeholder="Produit" />
                                            </Form.Item>
                                            <Form.Item
                                                {...field}
                                                name={[field.name, 'quantite']}
                                                rules={[{ required: true, message: 'Quantite requise' }]}
                                                style={{ width: 180 }}
                                            >
                                                <InputNumber min={1} step={1} style={{ width: '100%' }} placeholder="Qte" />
                                            </Form.Item>
                                            <Form.Item noStyle shouldUpdate>
                                                {({ getFieldValue }) => {
                                                    const produitId = getFieldValue(['produits', field.name, 'produitId']);
                                                    const quantite = getFieldValue(['produits', field.name, 'quantite']) || 0;
                                                    const prixUnitaireTTC = produits.find((item) => item.id === produitId)?.prixVenteTTC || 0;
                                                    const prixTTC = Math.round(((prixUnitaireTTC * quantite) + Number.EPSILON) * 100) / 100;

                                                    return (
                                                        <Form.Item style={{ width: 180 }}>
                                                            <InputNumber addonAfter="EUR" value={prixTTC} style={{ width: '100%' }} disabled />
                                                        </Form.Item>
                                                    );
                                                }}
                                            </Form.Item>
                                            <Button danger icon={<DeleteOutlined />} onClick={() => remove(field.name)} />
                                        </Space>
                                    ))}
                                    <Button type="dashed" onClick={() => add({ quantite: 1 })} block icon={<PlusCircleOutlined />}>
                                        Ajouter un produit
                                    </Button>
                                </>
                            )}
                        </Form.List>
                    </Form.Item>

                    <Form.Item label="Services">
                        <Form.List name="services">
                            {(fields, { add, remove }) => (
                                <>
                                    {fields.map((field) => (
                                        <Space key={field.key} align="baseline" style={{ display: 'flex', marginBottom: 8 }}>
                                            <Form.Item
                                                {...field}
                                                name={[field.name, 'serviceId']}
                                                rules={[{ required: true, message: 'Service requis' }]}
                                                style={{ width: 520 }}
                                            >
                                                <Select allowClear showSearch options={serviceOptions} placeholder="Service" />
                                            </Form.Item>
                                            <Form.Item
                                                {...field}
                                                name={[field.name, 'quantite']}
                                                rules={[{ required: true, message: 'Quantite requise' }]}
                                                style={{ width: 180 }}
                                            >
                                                <InputNumber min={1} step={1} style={{ width: '100%' }} placeholder="Qte" />
                                            </Form.Item>
                                            <Form.Item noStyle shouldUpdate>
                                                {({ getFieldValue }) => {
                                                    const serviceId = getFieldValue(['services', field.name, 'serviceId']);
                                                    const quantite = getFieldValue(['services', field.name, 'quantite']) || 0;
                                                    const prixUnitaireTTC = services.find((item) => item.id === serviceId)?.prixTTC || 0;
                                                    const prixTTC = Math.round(((prixUnitaireTTC * quantite) + Number.EPSILON) * 100) / 100;

                                                    return (
                                                        <Form.Item style={{ width: 180 }}>
                                                            <InputNumber addonAfter="EUR" value={prixTTC} style={{ width: '100%' }} disabled />
                                                        </Form.Item>
                                                    );
                                                }}
                                            </Form.Item>
                                            <Button danger icon={<DeleteOutlined />} onClick={() => remove(field.name)} />
                                        </Space>
                                    ))}
                                    <Button type="dashed" onClick={() => add({ quantite: 1 })} block icon={<PlusCircleOutlined />}>
                                        Ajouter un service
                                    </Button>
                                </>
                            )}
                        </Form.List>
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={6}>
                            <Form.Item name="montantHT" label="Montant HT">
                                <InputNumber addonAfter="EUR" min={0} step={0.01} style={{ width: '100%' }} disabled />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name="tva" label="TVA (%)">
                                <InputNumber addonAfter="%" min={0} max={100} step={0.01} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name="remisePourcentage" label="Remise (%)">
                                <InputNumber addonAfter="%" min={0} max={100} step={0.01} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name="remise" label="Remise (EUR)">
                                <InputNumber addonAfter="EUR" min={0} step={0.01} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item name="montantTVA" label="Montant TVA">
                                <InputNumber addonAfter="EUR" min={0} step={0.01} style={{ width: '100%' }} disabled />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="montantTTC" label="Montant TTC">
                                <InputNumber addonAfter="EUR" min={0} step={0.01} style={{ width: '100%' }} disabled />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="prixVenteTTC" label="Prix vente TTC">
                                <InputNumber addonAfter="EUR" min={0} step={0.01} style={{ width: '100%' }} disabled />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        </Card>
    );
}
