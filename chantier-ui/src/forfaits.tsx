import React, { useState, useEffect, useRef } from 'react';
import { Col, Row, Space, Table, Button, Input, Card, Avatar, Form, InputNumber, Select, Tabs, message, Popconfirm, Modal } from 'antd';
import { PlusCircleOutlined, EditOutlined, DeleteOutlined, FileDoneOutlined } from '@ant-design/icons';
import axios from 'axios';

const style: React.CSSProperties = { padding: '8px 0' };
const { TextArea, Search } = Input;

interface ForfaitEntity {
    id?: number;
    nom: string;
    moteurs?: any[];
    bateaux?: any[];
    heuresFonctionnement?: number;
    joursFrequence?: number;
    competences?: string[];
    prixHT?: number;
    tva?: number;
    montantTVA?: number;
    prixTTC?: number;
}

function List(props) {
    const [forfaits, setForfaits] = useState<ForfaitEntity[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchForfaits = async (query?: string) => {
        setLoading(true);
        try {
            let url = '/forfaits';
            if (query && query.trim()) {
                url = `/forfaits/search?q=${encodeURIComponent(query)}`;
            }
            const res = await axios.get(url);
            setForfaits(res.data);
        } catch (error) {
            message.error('Erreur lors du chargement des forfaits');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchForfaits();
    }, [props.refreshKey]);

    const handleSearch = (value: string) => {
        setSearchQuery(value);
        fetchForfaits(value);
    };

    const handleDelete = async (id: number) => {
        try {
            await axios.delete(`/forfaits/${id}`);
            message.success('Forfait supprimé');
            fetchForfaits(searchQuery);
        } catch (error) {
            message.error('Erreur lors de la suppression');
        }
    };

    const handleNewForfait = () => {
        props.setForfait({ nom: '' } as ForfaitEntity);
    };

    const columns = [
        {
            title: 'Forfait',
            dataIndex: 'nom',
            key: 'nom',
            sorter: (a, b) => (a.nom || '').localeCompare(b.nom || ''),
            render: (_, record) => (
                <a onClick={() => props.setForfait(record)}>{record.nom}</a>
            )
        },
        {
            title: 'Application',
            render: (_, record) => (
                <>
                    {record.competences && record.competences.length > 0 ? (
                        record.competences.map((item, index) => (
                            <span key={index}>{item} </span>
                        ))
                    ) : (
                        <span>-</span>
                    )}
                </>
            ),
        },
        {
            title: 'Programmation',
            render: (_, record) => {
                const parts: string[] = [];
                if (record.heuresFonctionnement) {
                    parts.push(`${record.heuresFonctionnement} heures`);
                }
                if (record.joursFrequence) {
                    parts.push(`${record.joursFrequence} jours`);
                }
                return <div>{parts.length > 0 ? parts.join(' ou ') : '-'}</div>;
            },
        },
        {
            title: '',
            render: (_, record) => (
                <Space>
                    <Button onClick={() => props.setForfait(record)}><EditOutlined/></Button>
                    <Popconfirm
                        title="Supprimer ce forfait ?"
                        onConfirm={() => handleDelete(record.id!)}
                        okText="Oui"
                        cancelText="Non"
                    >
                        <Button danger><DeleteOutlined/></Button>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return(
        <>
            <Row gutter={[16,16]}>
                <Col span={24}>
                    <div style={style}>
                        <Space>
                            <Search 
                                placeholder="Recherche" 
                                enterButton 
                                style={{ width: 600 }}
                                onSearch={handleSearch}
                                allowClear
                                onChange={(e) => {
                                    if (!e.target.value) {
                                        setSearchQuery('');
                                        fetchForfaits();
                                    }
                                }}
                            />
                            <Button type="primary" icon={<PlusCircleOutlined/>} onClick={handleNewForfait}/>
                        </Space>
                    </div>
                </Col>
            </Row>
            <Row gutter={[16,16]}>
                <Col span={24}>
                    <Table 
                        columns={columns} 
                        dataSource={forfaits} 
                        loading={loading}
                        rowKey="id"
                        onRow={(record) => {
                            return {
                                onClick: (event) => { 
                                    if ((event.target as HTMLElement).tagName !== 'BUTTON' && 
                                        !(event.target as HTMLElement).closest('button')) {
                                        props.setForfait(record);
                                    }
                                }
                            };
                        }} 
                    />
                </Col>
            </Row>
        </>
    );
}

function Catalogue(props: { forfait: ForfaitEntity | null }) {
    const forfaitDetail = props.forfait;

    if (!forfaitDetail) {
        return <div>Aucun forfait sélectionné</div>;
    }

    const moteursColumns = [
        {
            title: 'Référence',
            dataIndex: 'ref',
            key: 'ref',
            render: (_, record) => record.ref || record.nom || '-'
        },
        {
            title: 'Type',
            key: 'type',
            render: () => 'Moteur'
        },
        {
            title: null,
            render: (_, record) => (
                <Space>
                    <Popconfirm
                        title="Retirer ce moteur ?"
                        onConfirm={() => {
                            // TODO: Implement remove moteur from forfait
                            message.info('Fonctionnalité à implémenter');
                        }}
                        okText="Oui"
                        cancelText="Non"
                    >
                        <Button><DeleteOutlined/></Button>
                    </Popconfirm>
                </Space>
            ),
        }
    ];

    const bateauxColumns = [
        {
            title: 'Référence',
            dataIndex: 'ref',
            key: 'ref',
            render: (_, record) => record.ref || record.nom || '-'
        },
        {
            title: 'Type',
            key: 'type',
            render: () => 'Bateau'
        },
        {
            title: null,
            render: (_, record) => (
                <Space>
                    <Popconfirm
                        title="Retirer ce bateau ?"
                        onConfirm={() => {
                            // TODO: Implement remove bateau from forfait
                            message.info('Fonctionnalité à implémenter');
                        }}
                        okText="Oui"
                        cancelText="Non"
                    >
                        <Button><DeleteOutlined/></Button>
                    </Popconfirm>
                </Space>
            ),
        }
    ];

    return(
      <>
      <Row gutter={[16,16]}>
        <Col span={24}>
            <div style={style}>
                <Space>
                    <Search placeholder="Recherche" enterButton style={{ width: 350 }}/>
                    <InputNumber placeholder="Quantité" />
                    <Button type="primary" icon={<PlusCircleOutlined/>} onClick={() => {
                        message.info('Fonctionnalité d\'ajout à implémenter');
                    }}>Ajouter</Button>
                </Space>
            </div>
        </Col>
      </Row>
      {forfaitDetail.moteurs && forfaitDetail.moteurs.length > 0 && (
        <Row gutter={[16,16]} style={{ marginTop: 16 }}>
            <Col span={24}>
                <h4>Moteurs</h4>
                <Table columns={moteursColumns} dataSource={forfaitDetail.moteurs} rowKey="id" />
            </Col>
        </Row>
      )}
      {forfaitDetail.bateaux && forfaitDetail.bateaux.length > 0 && (
        <Row gutter={[16,16]} style={{ marginTop: 16 }}>
            <Col span={24}>
                <h4>Bateaux</h4>
                <Table columns={bateauxColumns} dataSource={forfaitDetail.bateaux} rowKey="id" />
            </Col>
        </Row>
      )}
      {(!forfaitDetail.moteurs || forfaitDetail.moteurs.length === 0) && 
       (!forfaitDetail.bateaux || forfaitDetail.bateaux.length === 0) && (
        <Row gutter={[16,16]} style={{ marginTop: 16 }}>
            <Col span={24}>
                <p>Aucun élément dans le catalogue</p>
            </Col>
        </Row>
      )}
      </>
    );
}

function Detail(props) {
    const [forfaitDetail, setForfaitDetail] = useState<ForfaitEntity | null>(null);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        if (props.forfait?.id) {
            fetchForfait();
        } else {
            // New forfait
            const newForfait: ForfaitEntity = {
                nom: '',
                competences: [],
                moteurs: [],
                bateaux: [],
                heuresFonctionnement: 0,
                joursFrequence: 0,
                prixHT: 0,
                tva: 0,
                montantTVA: 0,
                prixTTC: 0
            };
            setForfaitDetail(newForfait);
            form.setFieldsValue(newForfait);
        }
    }, [props.forfait?.id]);

    useEffect(() => {
        if (props.onSubmitRef) {
            props.onSubmitRef.current = async () => {
                try {
                    await form.validateFields();
                    form.submit();
                } catch (error) {
                    // Form validation errors are handled by antd
                }
            };
        }
    }, [form, props.onSubmitRef]);

    const fetchForfait = async () => {
        if (!props.forfait?.id) return;
        setLoading(true);
        try {
            const res = await axios.get(`/forfaits/${props.forfait.id}`);
            setForfaitDetail(res.data);
            form.setFieldsValue(res.data);
        } catch (error) {
            message.error('Erreur lors du chargement du forfait');
        }
        setLoading(false);
    };

    const handleSave = async (values: any) => {
        setLoading(true);
        try {
            if (props.forfait?.id) {
                // Update
                await axios.put(`/forfaits/${props.forfait.id}`, values);
                message.success('Forfait mis à jour');
                fetchForfait();
                props.onSaveSuccess?.();
            } else {
                // Create
                const res = await axios.post('/forfaits', values);
                message.success('Forfait créé');
                props.onSaveSuccess?.();
                props.setForfait(res.data);
            }
        } catch (error) {
            message.error('Erreur lors de l\'enregistrement');
        }
        setLoading(false);
    };

    const tabs = [
        {
            key: 'catalogue',
            label: 'Catalogue',
            children: (<Catalogue forfait={forfaitDetail || props.forfait} />),
        },
        {
            key: 'application',
            label: 'Application',
            children: (
                <Form.Item name="competences" label="Compétences">
                    <Select
                        mode="tags"
                        placeholder="Ajouter des compétences"
                        style={{ width: '100%' }}
                        tokenSeparators={[',']}
                    />
                </Form.Item>
            )
        },
        {
            key: 'programmation',
            label: 'Programmation',
            children: (
                <>
                    <Form.Item name="heuresFonctionnement" label="Heures de fonctionnement">
                        <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="joursFrequence" label="Jours de fréquence">
                        <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                </>
            )
        }
    ];

    if (!forfaitDetail && props.forfait?.id) {
        return <div>Chargement...</div>;
    }

    return(
      <Card 
        title={<Space><Avatar size="large" icon={<FileDoneOutlined/>} /> {forfaitDetail?.nom || 'Nouveau forfait'}</Space>} 
        style={{ width: '100%' }}
        loading={loading}
      >
        <Form 
            form={form}
            name="forfaitDetailForm" 
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            style={{ width: '100%' }}
            initialValues={forfaitDetail || undefined}
            onFinish={handleSave}
        >
            <Form.Item name="nom" label="Nom" required={true} rules={[{ required: true, message: 'Le nom du forfait est requis' }]}>
                <Input allowClear={true} />
            </Form.Item>
            <Form.Item name="prixHT" label="Prix HT">
                <InputNumber addonAfter="€" style={{ width: '100%' }} min={0} step={0.01} />
            </Form.Item>
            <Form.Item name="tva" label="Taux TVA (%)">
                <InputNumber addonAfter="%" style={{ width: '100%' }} min={0} max={100} step={0.01} />
            </Form.Item>
            <Form.Item name="montantTVA" label="Montant TVA">
                <InputNumber addonAfter="€" style={{ width: '100%' }} min={0} step={0.01} />
            </Form.Item>
            <Form.Item name="prixTTC" label="Prix TTC">
                <InputNumber addonAfter="€" style={{ width: '100%' }} min={0} step={0.01} />
            </Form.Item>
            <Tabs items={tabs} />
        </Form>
      </Card>
    );
}

export default function Forfaits() {
    const [forfait, setForfait] = useState<ForfaitEntity | null>(null);
    const [listRefreshKey, setListRefreshKey] = useState(0);
    const submitFormRef = useRef<(() => Promise<void>) | null>(null);

    const handleModalOk = async () => {
        if (submitFormRef.current) {
            await submitFormRef.current();
        }
    };

    const handleModalCancel = () => {
        setForfait(null);
    };

    const handleSaveSuccess = () => {
        setForfait(null);
        setListRefreshKey(prev => prev + 1);
    };

    return(
        <>
            <List setForfait={setForfait} refreshKey={listRefreshKey} />
            <Modal
                open={forfait !== null}
                title={forfait?.id ? "Modifier le forfait" : "Ajouter un forfait"}
                onCancel={handleModalCancel}
                onOk={handleModalOk}
                okText="Enregistrer"
                cancelText="Annuler"
                destroyOnClose
                width={1024}
            >
                <Detail 
                    forfait={forfait} 
                    setForfait={setForfait} 
                    onSaveSuccess={handleSaveSuccess}
                    onSubmitRef={submitFormRef}
                />
            </Modal>
        </>
    );
}