import React, { useEffect, useState } from 'react';
import {
    Button,
    Card,
    Col,
    Form,
    Input,
    Modal,
    Popconfirm,
    Row,
    Space,
    Table,
    message
} from 'antd';
import { DeleteOutlined, EditOutlined, PlusCircleOutlined } from '@ant-design/icons';
import axios from 'axios';

interface CompetenceEntity {
    id?: number;
    nom: string;
    description?: string;
    couleur?: string;
}

const defaultCompetence: CompetenceEntity = {
    nom: '',
    description: '',
    couleur: '#1677ff'
};

export default function Competences() {
    const [competences, setCompetences] = useState<CompetenceEntity[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [currentCompetence, setCurrentCompetence] = useState<CompetenceEntity | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [form] = Form.useForm<CompetenceEntity>();

    const fetchCompetences = async (query?: string) => {
        setLoading(true);
        try {
            const endpoint = query && query.trim() ? '/competences/search' : '/competences';
            const response = await axios.get(endpoint, { params: query && query.trim() ? { q: query } : {} });
            setCompetences(response.data || []);
        } catch {
            message.error('Erreur lors du chargement des compétences.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCompetences();
    }, []);

    const openModal = (competence?: CompetenceEntity) => {
        if (competence) {
            setIsEdit(true);
            setCurrentCompetence(competence);
            form.setFieldsValue({
                ...defaultCompetence,
                ...competence,
                couleur: competence.couleur || defaultCompetence.couleur
            });
        } else {
            setIsEdit(false);
            setCurrentCompetence(null);
            form.resetFields();
            form.setFieldsValue(defaultCompetence);
        }
        setModalVisible(true);
    };

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            const payload: CompetenceEntity = {
                nom: values.nom,
                description: values.description || '',
                couleur: values.couleur || defaultCompetence.couleur
            };

            if (isEdit && currentCompetence?.id) {
                await axios.put(`/competences/${currentCompetence.id}`, { ...currentCompetence, ...payload });
                message.success('Compétence modifiée avec succès');
            } else {
                await axios.post('/competences', payload);
                message.success('Compétence ajoutée avec succès');
            }

            setModalVisible(false);
            form.resetFields();
            fetchCompetences(searchQuery);
        } catch {
            // Les erreurs de validation sont affichées par le formulaire.
        }
    };

    const handleDelete = async (id?: number) => {
        if (!id) {
            return;
        }
        try {
            await axios.delete(`/competences/${id}`);
            message.success('Compétence supprimée avec succès');
            fetchCompetences(searchQuery);
        } catch {
            message.error('Erreur lors de la suppression de la compétence.');
        }
    };

    const columns = [
        {
            title: 'Nom',
            dataIndex: 'nom',
            sorter: (a: CompetenceEntity, b: CompetenceEntity) => (a.nom || '').localeCompare(b.nom || '')
        },
        {
            title: 'Description',
            dataIndex: 'description',
            render: (value: string) => value || '-'
        },
        {
            title: 'Couleur',
            dataIndex: 'couleur',
            render: (value?: string) => {
                const color = value || defaultCompetence.couleur;
                return (
                    <Space size={8}>
                        <span
                            style={{
                                display: 'inline-block',
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                backgroundColor: color,
                                border: '1px solid #d9d9d9'
                            }}
                        />
                    </Space>
                );
            }
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: unknown, record: CompetenceEntity) => (
                <Space>
                    <Button icon={<EditOutlined />} onClick={() => openModal(record)} />
                    <Popconfirm
                        title="Supprimer cette compétence ?"
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
        <Card title="Compétences">
            <Row gutter={[16, 16]}>
                <Col span={24}>
                    <Space>
                        <Input.Search
                            placeholder="Rechercher une compétence"
                            enterButton
                            allowClear
                            style={{ width: 600 }}
                            onSearch={(value) => {
                                setSearchQuery(value);
                                fetchCompetences(value);
                            }}
                            onChange={(event) => {
                                if (!event.target.value) {
                                    setSearchQuery('');
                                    fetchCompetences();
                                }
                            }}
                        />
                        <Button type="primary" icon={<PlusCircleOutlined />} onClick={() => openModal()} />
                    </Space>
                </Col>
            </Row>
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col span={24}>
                    <Table
                        rowKey="id"
                        dataSource={competences}
                        columns={columns}
                        loading={loading}
                        pagination={{ pageSize: 10 }}
                        bordered
                    />
                </Col>
            </Row>
            <Modal
                title={isEdit ? 'Modifier une compétence' : 'Ajouter une compétence'}
                open={modalVisible}
                onOk={handleSave}
                onCancel={() => setModalVisible(false)}
                okText="Enregistrer"
                cancelText="Annuler"
                maskClosable={false}
                destroyOnHidden
            >
                <Form form={form} layout="vertical" initialValues={defaultCompetence}>
                    <Form.Item
                        name="nom"
                        label="Nom"
                        rules={[{ required: true, message: 'Le nom est requis' }]}
                    >
                        <Input allowClear />
                    </Form.Item>
                    <Form.Item name="description" label="Description">
                        <Input.TextArea rows={3} allowClear />
                    </Form.Item>
                    <Form.Item
                        name="couleur"
                        label="Couleur"
                        rules={[
                            { pattern: /^#[0-9A-Fa-f]{6}$/, message: 'Format attendu: #RRGGBB' }
                        ]}
                    >
                        <Input type="color" />
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
}
