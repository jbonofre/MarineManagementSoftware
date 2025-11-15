import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Image, Select, message, Popconfirm, Space, Row, Col, Rate } from 'antd';
import axios from 'axios';
import { PlusCircleOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';

const style: React.CSSProperties = { padding: '8px 0' };
const { Search } = Input;
const { TextArea } = Input;

interface MoteurCatalogueEntity {
    id: number;
    modele: string;
    marque: string;
    type: string;
}

interface HeliceCatalogueEntity {
    id?: number;
    modele: string;
    marque: string;
    description?: string;
    images: string[];
    evaluation?: number;
    diametre?: number;
    pas?: string;
    pales?: number;
    cannelures?: number;
    compatible?: MoteurCatalogueEntity[];
    prixPublic?: number;
    frais?: number;
    tauxMarge?: number;
    tauxMarque?: number;
    prixVenteHT?: number;
    tva?: number;
    montantTVA?: number;
    prixVenteTTC?: number;
}

const defaultHelice: HeliceCatalogueEntity = {
    modele: '',
    marque: '',
    description: '',
    images: [],
    evaluation: 0,
    diametre: 0,
    pas: '',
    pales: 0,
    cannelures: 0,
    compatible: [],
    prixPublic: 0,
    frais: 0,
    tauxMarge: 0,
    tauxMarque: 0,
    prixVenteHT: 0,
    tva: 0,
    montantTVA: 0,
    prixVenteTTC: 0,
};
const fetchHelices = async (): Promise<HeliceCatalogueEntity[]> => {
    const res = await fetch('/catalogue/helices');
    if (!res.ok) throw new Error('Échec de récupération du catalogue des hélices');
    return await res.json();
};
const fetchMoteurs = async (): Promise<MoteurCatalogueEntity[]> => {
    const res = await fetch('/catalogue/moteurs');
    if (!res.ok) throw new Error('Échec de récupération du catalogue des moteurs');
    return await res.json();
};

const createHelice = async (helice: HeliceCatalogueEntity) => {
    const res = await fetch('/catalogue/helices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(helice),
    });
    if (!res.ok) throw new Error("Erreur lors de la création");
    return await res.json();
};

const updateHelice = async (id: number, helice: HeliceCatalogueEntity) => {
    const res = await fetch(`/catalogue/helices/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(helice),
    });
    if (!res.ok) throw new Error("Erreur lors de la mise à jour");
    return await res.json();
};

const deleteHelice = async (id: number) => {
    const res = await fetch(`/catalogue/helices/${id}`, {
        method: 'DELETE'
    });
    if (!res.ok) throw new Error("Erreur lors de la suppression");
};

const HeliceCatalogueView: React.FC = () => {
    const [helices, setHelices] = useState<HeliceCatalogueEntity[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<HeliceCatalogueEntity | null>(null);
    const [form] = Form.useForm();
    const [moteurs, setMoteurs] = useState<MoteurCatalogueEntity[]>([]);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

    const loadHelices = async () => {
        setLoading(true);
        try {
            setHelices(await fetchHelices());
        } catch (e: any) {
            message.error(e.message);
        }
        setLoading(false);
    };

    const loadMoteurs = async () => {
        try {
            setMoteurs(await fetchMoteurs());
        } catch (e: any) {
            message.error(e.message);
        }
    };

    useEffect(() => {
        loadHelices();
        loadMoteurs();
    }, []);

    const handleDelete = async (id: number) => {
        try {
            await deleteHelice(id);
            message.success('Supprimé avec succès');
            loadHelices();
        } catch (e: any) {
            message.error(e.message);
        }
    };

    const openEditModal = (record: HeliceCatalogueEntity) => {
        setEditing(record);
        setModalMode('edit');
        setModalOpen(true);
        form.setFieldsValue({
            ...record,
            compatible: record.compatible?.map(m => m.id),
        });
    };

    const openCreateModal = () => {
        setEditing(null);
        setModalMode('create');
        setModalOpen(true);
        form.resetFields();
    };

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            // handle compatible moteurs
            const selectedMoteurs = moteurs.filter(m => (values.compatible || []).includes(m.id));
            const heliceToSend = {
                ...values,
                compatible: selectedMoteurs,
            };
            let result;
            if (modalMode === 'edit' && editing?.id) {
                result = await updateHelice(editing.id, heliceToSend);
                message.success('Hélice mise à jour');
            } else {
                result = await createHelice(heliceToSend);
                message.success('Hélice créée');
            }
            setModalOpen(false);
            loadHelices();
        } catch (e: any) {
            if (e.errorFields || e instanceof Array) {
                // Validation errors
                return;
            }
            message.error(e.message || "Erreur imprévue");
        }
    };

    const columns = [
        { title: 'Modèle', dataIndex: 'modele', key: 'modele',
            render: (_, record) => (
                <Space>
                    <Image width={50} src={record.images[0]} />
                    {record.modele}
                </Space>
            ),
            sorter: (a, b) => a.modele.localeCompare(b.modele),
         },
        { title: 'Marque', dataIndex: 'marque', key: 'marque',
            sorter: (a, b) => a.marque.localeCompare(b.marque),
        },
        { title: 'Évaluation', dataIndex: 'evaluation', key: 'evaluation',
            render: (_, record) => (
                <Rate defaultValue={record.evaluation} disabled={true} />
            ),
            sorter: (a, b) => a.evaluation - b.evaluation,
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: HeliceCatalogueEntity) => (
                <>
                    <Space>
                    <Button icon={<EditOutlined/>} onClick={() => openEditModal(record)} />
                    <Popconfirm title="Supprimer cette hélice ?" onConfirm={() => handleDelete(record.id!)} okText="Oui" cancelText="Non">
                        <Button icon={<DeleteOutlined/>} danger />
                    </Popconfirm>
                    </Space>
                </>
            )
        }
    ];

    const onValuesChange = (changedValues, allValues) => {
        if (changedValues.prixVenteHT || changedValues.tva) {
            const prixVenteHT = form.getFieldValue('prixVenteHT');
            const tva = form.getFieldValue('tva');
            const montantTVA = Math.round(((prixVenteHT * (tva / 100)) + Number.EPSILON) * 100) / 100;
            form.setFieldValue('montantTVA', montantTVA);
            const prixVenteTTC = Math.round(((prixVenteHT + montantTVA) + Number.EPSILON) * 100) / 100;
            form.setFieldValue('prixVenteTTC', prixVenteTTC);
        }
        if (changedValues.prixVenteTTC) {
            const prixVenteTTC = form.getFieldValue('prixVenteTTC');
            const tva = form.getFieldValue('tva');
            const montantTVA = Math.round((((prixVenteTTC / (100 + tva)) * tva) + Number.EPSILON) * 100) / 100;
            form.setFieldValue('montantTVA', montantTVA);
            const prixVenteHT = Math.round(((prixVenteTTC - montantTVA) + Number.EPSILON) * 100) / 100;
            form.setFieldValue('prixVenteHT', prixVenteHT);
        }
    };

    return (
        <>
            <Row gutter={[16, 16]}>
                <Col span={24}>
                    <div style={style}>
                        <Space>
                            <Search
                                placeholder="Recherche"
                                enterButton
                                style={{ width: 600 }}
                                allowClear={true}
                                onSearch={async (value) => {
                                    setLoading(true);
                                    try {
                                        const response = await axios.get('/catalogue/helices/search', { params: { q: value } });
                                        setHelices(response.data);
                                    } catch (error) {
                                        message.error('Erreur lors de la recherche');
                                    } finally {
                                        setLoading(false);
                                    }
                                }}
                            />
                            <Button type="primary" icon={<PlusCircleOutlined />} onClick={() => openCreateModal()} />
                        </Space>
                    </div>
                </Col>
            </Row>
            <Row gutter={[16, 16]}>
                <Col span={24}>
                    <Table columns={columns} dataSource={helices} loading={loading} />
                    <Modal
                        open={modalOpen}
                        title={modalMode === 'edit' ? 'Modifier une Hélice' : 'Nouvelle Hélice'}
                        onCancel={() => setModalOpen(false)}
                        onOk={handleModalOk}
                        okText="Valider"
                        cancelText="Annuler"
                        destroyOnClose
                        width={1024}
                    >
                        <Form
                            form={form}
                            layout="vertical"
                            initialValues={defaultHelice}
                            onValuesChange={onValuesChange}
                        >
                            <Form.Item
                                name="modele"
                                label="Modèle"
                                rules={[{ required: true, message: "Champ obligatoire" }]}
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item
                                name="marque"
                                label="Marque"
                                rules={[{ required: true, message: "Champ obligatoire" }]}
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item name="description" label="Description">
                                <TextArea rows={2} />
                            </Form.Item>
                            <Form.Item name="images" label="Images">
                                <Form.List name="images">
                                    {(fields, { add, remove }) => (
                                        <>
                                            {fields.map((field, index) => (
                                                <Space key={field.key} align="baseline" style={{ display: 'flex', marginBottom: 8 }}>
                                                    <Form.Item
                                                        {...field}
                                                        name={[field.name]}
                                                        fieldKey={[field.fieldKey ?? field.key]}
                                                        rules={[{ required: true, message: 'Veuillez entrer une URL d\'image' }]}
                                                        style={{ flex: 1 }}
                                                    >
                                                        <Input placeholder="URL de l'image" style={{ width: '700px' }} />
                                                    </Form.Item>
                                                    <Button
                                                        icon={<DeleteOutlined />}
                                                        danger
                                                        onClick={() => remove(field.name)}
                                                    />
                                                    {form.getFieldValue(['images', index]) &&
                                                        <Image width={100} src={form.getFieldValue(['images', index])} />
                                                    }
                                                </Space>
                                            ))}
                                            <Button type="dashed" onClick={() => add()} block icon={<PlusCircleOutlined />}>
                                                Ajouter une image
                                            </Button>
                                        </>
                                    )}
                                </Form.List>
                            </Form.Item>
                            <Form.Item name="evaluation" label="Évaluation">
                                <Rate allowHalf />
                            </Form.Item>
                            <Form.Item name="diametre" label="Diamètre (mm)">
                                <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
                            </Form.Item>
                            <Form.Item name="pas" label="Pas">
                                <Input />
                            </Form.Item>
                            <Form.Item name="pales" label="Pales">
                                <InputNumber min={1} style={{ width: '100%' }} />
                            </Form.Item>
                            <Form.Item name="cannelures" label="Cannelures">
                                <InputNumber min={0} style={{ width: '100%' }} />
                            </Form.Item>
                            <Form.Item name="compatible" label="Moteurs compatibles">
                                <Select mode="multiple" optionFilterProp="children" showSearch>
                                    {moteurs.map(m => (
                                        <Select.Option key={m.id} value={m.id}>
                                            {m.marque + " " + m.modele}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                            <Form.Item name="prixPublic" label="Prix Public">
                                <InputNumber min={0} step={0.01} addonAfter="€" style={{ width: '100%' }} />
                            </Form.Item>
                            <Form.Item name="frais" label="Frais">
                                <InputNumber min={0} step={0.01} addonAfter="€" style={{ width: '100%' }} />
                            </Form.Item>
                            <Form.Item name="tauxMarge" label="Taux Marge (%)">
                                <InputNumber min={0} max={100} step={0.01} addonAfter="%" style={{ width: '100%' }} />
                            </Form.Item>
                            <Form.Item name="tauxMarque" label="Taux Marque (%)">
                                <InputNumber min={0} max={100} step={0.01} addonAfter="%" style={{ width: '100%' }} />
                            </Form.Item>
                            <Form.Item name="prixVenteHT" label="Prix Vente HT">
                                <InputNumber min={0} step={0.01} addonAfter="€" style={{ width: '100%' }} />
                            </Form.Item>
                            <Form.Item name="tva" label="TVA (%)">
                                <InputNumber min={0} max={100} step={0.01} addonAfter="%" style={{ width: '100%' }} />
                            </Form.Item>
                            <Form.Item name="montantTVA" label="Montant TVA">
                                <InputNumber min={0} step={0.01} addonAfter="€" style={{ width: '100%' }} />
                            </Form.Item>
                            <Form.Item name="prixVenteTTC" label="Prix Vente TTC">
                                <InputNumber min={0} step={0.01} addonAfter="€" style={{ width: '100%' }} />
                            </Form.Item>
                        </Form>
                    </Modal>
                </Col>
            </Row>
        </>
    );
};

export default HeliceCatalogueView;
