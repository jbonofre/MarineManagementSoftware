import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Rate, Space, Popconfirm, message, Select, Image } from 'antd';
import { EditOutlined, DeleteOutlined, PlusCircleOutlined } from '@ant-design/icons';
import axios from 'axios';

const moteurTypes = [
    { text: 'Hors-bord', value: 'Hors-bord' },
    { text: 'In-bord', value: 'In-bord' },
    { text: 'Electrique', value: 'Electrique' },
    { text: 'Diesel', value: 'Diesel' },
];

const defaultMoteur = {
    modele: '',
    marque: '',
    type: '',
    description: '',
    evaluation: 0,
    images: [],
    puissanceCv: 0,
    puissanceKw: 0,
    longueurArbre: '',
    arbre: 0,
    demarrage: '',
    direction: '',
    cylindres: 0,
    cylindree: 0,
    regime: '',
    huileRecommandee: '',
};

const MoteurCatalogue = () => {
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [moteurs, setMoteurs] = useState([]);
    const [form] = Form.useForm();
    const [editingMoteur, setEditingMoteur] = useState(null);

    const fetchMoteurs = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/catalogue/moteurs');
            setMoteurs(res.data ?? []);
        } catch {
            message.error('Erreur lors du chargement des moteurs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMoteurs();
    }, []);

    const openModal = (record = null) => {
        setEditingMoteur(record);
        setModalVisible(true);
        if (record) {
            form.setFieldsValue({ ...record });
        } else {
            form.resetFields();
            form.setFieldsValue(defaultMoteur);
        }
    };

    const handleDelete = async (id: number | undefined) => {
        if (!id) return;
        try {
            await axios.delete(`/catalogue/moteurs/${id}`);
            message.success('Moteur supprimé avec succès');
            fetchMoteurs();
        } catch {
            message.error('Erreur lors de la suppression.');
        }
    };

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            let moteurToSave = { ...values };
            // Clean empty images
            moteurToSave.images = (moteurToSave.images || []).filter((img: string) => !!img);

            if (editingMoteur && editingMoteur.id != null) {
                await axios.put(`/catalogue/moteurs/${editingMoteur.id}`, moteurToSave);
                message.success('Moteur modifié avec succès');
            } else {
                await axios.post('/catalogue/moteurs', moteurToSave);
                message.success('Moteur ajouté avec succès');
            }
            setModalVisible(false);
            fetchMoteurs();
            form.resetFields();
        } catch (err) {
            // Already shown by Form.Item
        }
    };

    const columns = [
        {
            title: 'Modèle',
            dataIndex: 'modele',
            render: (_: any, record: any) => (
                <Space>
                    {record.images && record.images[0] ? (
                        <Image width={50} src={record.images[0]} />
                    ) : null}
                    {record.modele}
                </Space>
            ),
            sorter: (a, b) => a.modele.localeCompare(b.modele),
        },
        {
            title: 'Marque',
            dataIndex: 'marque',
            sorter: (a, b) => a.marque.localeCompare(b.marque),
        },
        {
            title: 'Type',
            dataIndex: 'type',
            sorter: (a, b) => (a.type || '').localeCompare(b.type),
            filters: moteurTypes,
            onFilter: (value, record) => record.type === value,
        },
        {
            title: 'Évaluation',
            dataIndex: 'evaluation',
            render: (_: any, record: any) => <Rate value={record.evaluation} disabled allowHalf={true} />,
            sorter: (a, b) => (a.evaluation || 0) - (b.evaluation || 0),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: any) => (
                <Space>
                    <Button onClick={() => openModal(record)} icon={<EditOutlined />} />
                    <Popconfirm
                        title="Supprimer ce moteur ?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Oui"
                        cancelText="Non"
                    >
                        <Button danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <>
            <Space style={{ marginBottom: 16 }}>
                <Button
                    type="primary"
                    icon={<PlusCircleOutlined />}
                    onClick={() => openModal()}
                >
                    Ajouter un moteur
                </Button>
            </Space>
            <Table
                rowKey="id"
                columns={columns}
                dataSource={moteurs}
                loading={loading}
                pagination={{ pageSize: 10 }}
                bordered
            />
            <Modal
                open={modalVisible}
                title={editingMoteur ? 'Modifier un moteur' : 'Ajouter un moteur'}
                onOk={handleModalOk}
                onCancel={() => setModalVisible(false)}
                maskClosable={false}
                destroyOnClose
                width={900}
            >
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={defaultMoteur}
                >
                    <Form.Item name="modele" label="Modèle" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="marque" label="Marque" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="type" label="Type" rules={[{ required: true }]}>
                        <Select options={moteurTypes.map((t) => ({ label: t.text, value: t.value }))} />
                    </Form.Item>
                    <Form.Item name="description" label="Description">
                        <Input.TextArea rows={3} />
                    </Form.Item>
                    <Form.Item name="evaluation" label="Évaluation">
                        <Rate allowHalf />
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
                                                <Input placeholder="URL de l'image" style={{ width: '500px' }} />
                                            </Form.Item>
                                            <Button
                                                icon={<DeleteOutlined />}
                                                danger
                                                onClick={() => remove(field.name)}
                                            />
                                            {form.getFieldValue(['images', index]) &&
                                                <Image width={80} src={form.getFieldValue(['images', index])} />}
                                        </Space>
                                    ))}
                                    <Button type="dashed" onClick={() => add()} block icon={<PlusCircleOutlined />}>
                                        Ajouter une image
                                    </Button>
                                </>
                            )}
                        </Form.List>
                    </Form.Item>
                    <Form.Item name="puissanceCv" label="Puissance (CV)">
                        <InputNumber min={0} step={0.1} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="puissanceKw" label="Puissance (kW)">
                        <InputNumber min={0} step={0.1} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="longueurArbre" label="Longueur arbre">
                        <Input />
                    </Form.Item>
                    <Form.Item name="arbre" label="Arbre (cm)">
                        <InputNumber min={0} step={0.1} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="demarrage" label="Démarrage">
                        <Input />
                    </Form.Item>
                    <Form.Item name="direction" label="Direction">
                        <Input />
                    </Form.Item>
                    <Form.Item name="cylindres" label="Nombre de cylindres">
                        <InputNumber min={0} step={1} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="cylindree" label="Cylindrée">
                        <InputNumber min={0} step={1} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="regime" label="Régime Max">
                        <Input />
                    </Form.Item>
                    <Form.Item name="huileRecommandee" label="Huile recommandée">
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default MoteurCatalogue;
