import React, { useState, useEffect } from 'react';
import { Card, Avatar, Col, Row, Space, Input, InputNumber, Select, Button, Form, Tabs, Empty, DatePicker, Table, Checkbox, Rate, Spin, Popconfirm, message } from 'antd';
import type { TabsProps } from 'antd';
import { UserOutlined, PlusCircleOutlined, LeftCircleOutlined, DeleteOutlined, EditOutlined, FileAddOutlined, SaveOutlined, PauseCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { demo } from './workspace.tsx';

const style: React.CSSProperties = { padding: '8px 0' };
const { Search } = Input;
const { TextArea } = Input;

function Documents() {
    return(
        <>
        <Space>
            <Button type="primary" icon={<FileAddOutlined/>}>Ajouter un Document</Button>
        </Space>

        </>
    );
}

function Avoirs() {
    return(
      <>
      <p>Liste des avoirs</p>
      </>
    );
}

function Parc() {
    return (
        <Empty/>
    );
}

function Historique() {
    return (
        <Empty/>
    );
}

function Paiements() {
    return (
        <Empty/>
    );
}

function Messagerie() {
    return (
        <Empty/>
    );
}

function List(props) {

    const [ clients, setClients ] = useState();

    const fetchClients = () => {
        fetch('./clients')
        .then((response) => {
            if (!response.ok) {
                throw new Error('Erreur ' + response.status);
            }
            return response.json();
        })
        .then((data) => setClients(data))
        .catch((error) => {
            message.error('Une erreur est survenue: ' + error.message);
            console.error(error);
        });
    };

    useEffect(fetchClients, []);

    if (!clients) {
        return(<Spin/>);
    }

    const deleteClient = (id) => {
        fetch('./clients/' + id, {
            method: 'DELETE'
        })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Erreur ' + response.status);
            }
        })
        .then((data) => {
            message.info('Client supprimé');
            fetchClients();
        })
        .catch((error) => {
            message.error('Une erreur est survenue: ' + error.message);
            console.error(error);
        })
    };

    const columns = [
        {
            title: 'Nom',
            dataIndex: 'nom',
            key: 'nom',
            render: (_,record) => record.prenom + ' ' + record.nom,
            sorter: (a,b) => {
                const anom = a.prenom + ' ' + a.nom;
                const bnom = b.prenom + ' ' + b.nom;
                return(anom.localeCompare(bnom));
            }
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            filters: [
                {
                    text: 'Particulier',
                    value: 'Particulier'
                },
                {
                    text: 'Prospect',
                    value: 'Prospect'
                },
                {
                    text: 'Professionnel',
                    value: 'Professionnel'
                },
                {
                    text: 'Professionnel Exonéré',
                    value: 'Professionnel Exonéré'
                }
            ],
            onFilter: (value, record) => record.type === value,
        },
        {
            title: 'E-mail',
            dataIndex: 'email',
            key: 'email',
            sorter: (a,b) => a.email.localeCompare(b.email)
        },
        {
            title: 'Téléphone',
            dataIndex: 'telephone',
            key: 'telephone',
            sorter: (a,b) => a.telephone.localeCompare(b.telephone)
        },
        {
            title: '',
            key: 'action',
            render: (_,record) => (
                <Space>
                    <Button onClick={() => props.setClient(record.id) }><EditOutlined/></Button>
                    <Popconfirm title="Supprimer le client"
                        description="Etes-vous sûr de vouloir supprimer le client ?"
                        onConfirm={() => deleteClient(record.id)}
                        okText="Oui" cancelText="Non">
                        <Button danger icon={<DeleteOutlined/>}/>
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
                        <Search placeholder="Recherche" enterButton style={{ width: 600 }}/>
                        <Button type="primary" icon={<PlusCircleOutlined/>} onClick={() => props.setClient('new')} />
                    </Space>
                </div>
            </Col>
        </Row>
        <Row gutter={[16,16]}>
            <Col span={24}>
                <Table columns={columns} dataSource={clients} />
            </Col>
        </Row>
      </>
    );
}

function Detail(props) {

    const [ detailForm ] = Form.useForm();
    const [ detail, setDetail ] = useState();

    if (props.client !== 'new') {
        const fetchClient = () => {
            fetch('./clients/' + props.client)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Erreur (code ' + response.status + ')');
                }
                return response.json();
            })
            .then((data) => setDetail(data))
            .catch((error) => {
                message.error('Une erreur est survenue: ' + error.message);
                console.error(error);
            })
        };

        useEffect(fetchClient, []);

        if (!detail) {
            return(<Spin />);
        }
    }

    const tabItems = [
        {
            key: 'documents',
            label: 'Documents',
            children: <Documents/>
        },
        {
            key: 'parc',
            label: 'Parc',
            children: <Parc/>
        },
        {
            key: 'Historique',
            label: 'Historique',
            children: <Historique/>
        },
        {
            key: 'avoirs',
            label: 'Avoirs',
            children: <Avoirs/>
        },
        {
            key: 'paiements',
            label: 'Moyens de Paiement',
            children: <Paiements/>
        },
        {
            key: 'messagerie',
            label: 'Messagerie',
            children: <Messagerie/>
        }
    ];

    let title = 'Nouveau client';
    let date = dayjs();

    if (detail) {
        title = detail.prenom + ' ' + detail.nom;
        date = dayjs(detail.date);
    }

    const initialValues = {...detail, date: date, consentement: true};

    const onFinish = (values) => {
        if (props.client === 'new') {
            fetch('./clients', {
                method: 'POST',
                body: JSON.stringify(values),
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Erreur (code ' + response.status + ')');
                }
                return response.json();
            })
            .then((data) => {
                message.info('Client sauvegardé');
                props.setClient(null);
            })
            .catch((error) => {
                message.error('Une erreur est survenue: ' + error.message);
                console.error(error);
            });
        } else {
            fetch('./clients/' + props.client, {
                method: 'PUT',
                body: JSON.stringify(values),
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Erreur (code ' + response.status + ')');
                }
                return response.json();
            })
            .then((data) => {
                message.info('Client mis à jour');
                props.setClient(null);
            })
            .catch((error) => {
                message.error('Une erreur est survenue: ' + error.message);
                console.error(error);
            })
        }
    };

    return(
        <>
            <Button type="text" onClick={() => props.setClient(null)} icon={<LeftCircleOutlined/>} />
            <Card title={<Space><Avatar size="large" icon={<UserOutlined/>}/>{title}</Space>} style={{ width: '100%' }}>
                    <Form name="client" labelCol={{ span: 8 }}
                        wrapperCol={{ span: 16 }}
                        style={{ width: '80%' }}
                        form={detailForm}
                        initialValues={initialValues}
                        onFinish={onFinish}>
                        <Form.Item label="Prénom" name="prenom">
                            <Input allowClear={true} />
                        </Form.Item>
                        <Form.Item label="Nom" name="nom" rules={[{ required: true, message: 'Le nom est requis' }]}>
                            <Input allowClear={true} />
                        </Form.Item>
                        <Form.Item label="Type de Client" name="type" rules={[{ required: true, message: 'Le type de client est requis' }]}>
                            <Select options={[
                                    { value: 'Particulier', label: 'Particulier' },
                                    { value: 'Professionnel', label: 'Professionnel' },
                                    { value: 'Prospect', label: 'Prospect' },
                                    { value: 'Professionnel Exonéré', label: 'Professionnel Exonéré' },
                                ]}/>
                        </Form.Item>
                        <Form.Item label="E-mail" name="email">
                            <Input allowClear={true} />
                        </Form.Item>
                        <Form.Item label="Téléphone" name="telephone">
                            <Input allowClear={true} />
                        </Form.Item>
                        <Form.Item label="Adresse" name="adresse">
                            <TextArea rows={6} allowClear={true}/>
                        </Form.Item>
                        <Form.Item label="Consentement" name="consentement" valuePropName="checked">
                            <Checkbox />
                        </Form.Item>
                        <Form.Item label="Evaluation" name="evaluation">
                            <Rate />
                        </Form.Item>
                        <Form.Item label="Client depuis " name="date">
                            <DatePicker format="DD-MM-YYYY" />
                        </Form.Item>
                        <Form.Item label="Notes" name="notes">
                            <TextArea rows={6} allowClear={true} />
                        </Form.Item>
                        <Form.Item label="SIREN" name="siren">
                            <Input allowClear={true} />
                        </Form.Item>
                        <Form.Item label="SIRET" name="siret">
                            <Input allowClear={true} />
                        </Form.Item>
                        <Form.Item label="Numéro TVA" name="tva">
                            <Input allowClear={true} />
                        </Form.Item>
                        <Form.Item label="NAF" name="naf">
                            <Input allowClear={true} />
                        </Form.Item>
                        <Form.Item label="Remise" name="remise">
                            <InputNumber addonAfter="%"/>
                        </Form.Item>
                        <Form.Item label={null}>
                            <Space>
                            <Button type="primary" icon={<SaveOutlined/>} onClick={() => detailForm.submit()}>Enregistrer</Button>
                            <Button icon={<PauseCircleOutlined/>} onClick={() => detailForm.resetFields()}>Annuler</Button>
                            </Space>
                        </Form.Item>
                    </Form>
                    <Tabs items={tabItems}/>
                </Card>
        </>
    );
}

export default function Clients(props) {

    const [ client, setClient ] = useState();

    if (client) {
        return (
            <Detail client={client} setClient={setClient} />
        );
    } else {
        return (
            <List setClient={setClient} />
        );
    }

}
