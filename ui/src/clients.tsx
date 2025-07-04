import React, { useState } from 'react';
import { Card, Avatar, Col, Row, Space, Input, Select, Button, Form, Tabs, Empty, Pagination, DatePicker, Table } from 'antd';
import type { TabsProps } from 'antd';
import { UserOutlined, PlusCircleOutlined, LeftCircleOutlined } from '@ant-design/icons';

interface ClientType {
    key: string,
    name: string,
    type: string,
    email: string
}

const types = [
  { value: 'particulier', label: 'Particulier' },
  { value: 'professionnel', label: 'Professionnel' }
];

const style: React.CSSProperties = { padding: '8px 0' };
const { Search } = Input;
const { TextArea } = Input;

function Documents() {
    return(
        <Empty/>
    );
}

function Parc() {
    return (
        <Empty/>
    );
}

function Interventions() {
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

    const columns: TableProps<ClientType>['columns'] = [
        {
            title: 'Nom',
            dataIndex: 'nom',
            key: 'nom',
            render: (text,record) => (
                <a onClick={() => props.setClient(record.key)}>{text}</a>
            )
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type'
        },
        {
            title: 'E-mail',
            dataIndex: 'email',
            key: 'email'
        },
        {
            title: '',
            key: 'action',
            render: (_,record) => (
                <Space>
                    <Button>Voir</Button>
                    <Button>Supprimer</Button>
                </Space>
            )
        }
    ];

    const data: ClientType[] = [
        {
            key: '1',
            nom: 'Jean-Baptiste Onofré',
            type: 'Particulier',
            email: 'jb@nanthrax.net'
        }
    ];

    return(
      <>
        <Row gutter={[16,16]}>
            <Col span={24}>
                <div style={style}>
                    <Space>
                        <Search placeholder="Recherche client" enterButton style={{ width: 350 }}/>
                        <Select mode="tags" placeholder="Type de client" style={{ width: 350 }} options={types}/>
                        <Button type="primary" icon={<PlusCircleOutlined/>}>Nouveau Client</Button>
                    </Space>
                </div>
            </Col>
        </Row>
        <Row gutter={[16,16]}>
            <Col span={24}>
                <Table<ClientType> columns={columns} dataSource={data} />
            </Col>
        </Row>
      </>
    );
}

function Detail(props) {
    const tabItems: TabsProps['items'] = [
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
            key: 'interventions',
            label: 'Interventions',
            children: <Interventions/>
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

    return(
        <>
            <a onClick={ () => props.setClient(null) }><LeftCircleOutlined/> Retour à la liste des clients</a>
                <Card title={<Space><Avatar size="large" icon={<UserOutlined/>}/>Jean-Baptiste Onofré</Space>} style={{ width: '100%' }}>
                    <Form name="client" labelCol={{ span: 8 }}
                        wrapperCol={{ span: 16 }}
                        style={{ width: '80%' }}
                        initialValues={{ remember: true }}>
                        <Form.Item label="Prénom" name="prenom" rules={[{ required: true, message: 'Le prénom est requis' }]}>
                            <Input allowClear={true} defaultValue="Jean-Baptiste" />
                        </Form.Item>
                        <Form.Item label="Nom" name="nom" rules={[{ required: true, message: 'Le nom est requis' }]}>
                            <Input allowClear={true} defaultValue="Onofré" />
                        </Form.Item>
                        <Form.Item label={null} name="type">
                            <Select defaultValue="particulier"
                                options={[
                                    { value: 'particulier', label: 'Particulier' },
                                    { value: 'professionnel', label: 'Professionnel' }
                                ]}/>
                        </Form.Item>
                        <Form.Item label="E-mail" name="email">
                            <Input allowClear={true} defaultValue="jb@nanthrax.net" />
                        </Form.Item>
                        <Form.Item label="Adresse" name="adresse">
                            <TextArea rows={6}>Lieu dit Coatalec, 29670 Henvic</TextArea>
                        </Form.Item>
                        <Form.Item label="Client depuis " name="date">
                            <DatePicker />
                        </Form.Item>
                        <Form.Item label={null}>
                            <Space>
                            <Button type="primary" htmlType="submit">Enregistrer</Button><Button htmlType="button">Annuler</Button>
                            </Space>
                        </Form.Item>
                    </Form>
                    <Tabs items={tabItems}/>
                </Card>
        </>
    );
}

export default function Clients() {

    const [ client, setClient ] = useState();

    if (client) {
        return (
            <Detail client={client} setClient={setClient} />
        );
    } else {
        return (
            <List setClient={setClient}/>
        );
    }

}