import React, { useState } from 'react';
import { Card, Avatar, Col, Row, Space, Input, Select, Button, Form, Tabs, Empty, Pagination, DatePicker, Table, Checkbox, Rate, AutoComplete, message } from 'antd';
import type { TabsProps } from 'antd';
import { UserOutlined, PlusCircleOutlined, LeftCircleOutlined, DeleteOutlined, EditOutlined, FileAddOutlined } from '@ant-design/icons';
import { demo } from './workspace.tsx';
import dayjs from 'dayjs';

interface ClientType {
    key: string,
    name: string,
    type: string,
    email: string
}

const types = [
  { value: 'particulier', label: 'Particulier' },
  { value: 'professionnel', label: 'Professionnel' },
  { value: 'professionnel_mer', label: 'Professionnel de la Mer' }
];

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

    const columns: TableProps<ClientType>['columns'] = [
        {
            title: 'Nom',
            dataIndex: 'nom',
            key: 'nom',
            render: (_,record) => (
                <a onClick={() => props.setClient(record.key)}>{record.prenom} {record.nom}</a>
            ),
            sorter: (a,b) => a.nom.localeCompare(b.nom)
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
                    text: 'Professionnel',
                    value: 'Professionnel'
                },
                {
                    text: 'Professionnel de la Mer',
                    value: 'Professionnel de la Mer'
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
            title: '',
            key: 'action',
            render: (_,record) => (
                <Space>
                    <Button onClick={() => props.setClient(record.key) }><EditOutlined/></Button>
                    <Button onClick={() => demo() }><DeleteOutlined/></Button>
                </Space>
            )
        }
    ];

    var researchOptions = [];
    props.clients.forEach((client) => {
       var labelValue;
       if (client.prenom != null) {
            labelValue = client.prenom + ' ' + client.nom;
       } else {
            labelValue = client.nom;
       }
       const item = [ { label: labelValue, value: client.key } ];
       researchOptions = researchOptions.concat(item);
    });

    return(
      <>
        <Row gutter={[16,16]}>
            <Col span={24}>
                <div style={style}>
                    <Space>
                        <AutoComplete options={researchOptions} style={{ width: 350 }} placeholder="Recherche client" onSelect={(search) => {
                            props.setClient(search);
                        }} onChange={() => {

                        }}/>
                        <Button type="primary" icon={<PlusCircleOutlined/>} onClick={() => demo()}>Nouveau Client</Button>
                    </Space>
                </div>
            </Col>
        </Row>
        <Row gutter={[16,16]}>
            <Col span={24}>
                <Table<ClientType> columns={columns} dataSource={props.clients} onRow={(record, rowIndex) => {
                  return {
                    onClick: (event) => { props.setClient(record.key) }
                  };
                }}/>
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
            key: 'Historique',
            label: 'Historique',
            children: <Historique/>
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

    const clientDetail = props.clients.filter(record => record.key === props.client)[0];

    return(
        <>
            <a onClick={ () => props.setClient(null) }><LeftCircleOutlined/> Retour à la liste des clients</a>
                <Card title={<Space><Avatar size="large" icon={<UserOutlined/>}/>{clientDetail.prenom}{clientDetail.nom}</Space>} style={{ width: '100%' }}>
                    <Form name="client" labelCol={{ span: 8 }}
                        wrapperCol={{ span: 16 }}
                        style={{ width: '80%' }}
                        initialValues={{ remember: true }}>
                        <Form.Item label="Prénom" name="prenom" rules={[{ required: true, message: 'Le prénom est requis' }]}>
                            <Input allowClear={true} defaultValue={clientDetail.prenom}/>
                        </Form.Item>
                        <Form.Item label="Nom" name="nom" rules={[{ required: true, message: 'Le nom est requis' }]}>
                            <Input allowClear={true} defaultValue={clientDetail.nom} />
                        </Form.Item>
                        <Form.Item label={null} name="type">
                            <Select defaultValue="particulier"
                                options={[
                                    { value: 'particulier', label: 'Particulier' },
                                    { value: 'professionnel', label: 'Professionnel' }
                                ]}/>
                        </Form.Item>
                        <Form.Item label="E-mail" name="email">
                            <Input allowClear={true} defaultValue={clientDetail.email} />
                        </Form.Item>
                        <Form.Item label="Adresse">
                            <TextArea rows={6} value={clientDetail.adresse}/>
                        </Form.Item>
                        <Form.Item label="Consentement" name="consentement">
                            <Checkbox defaultChecked={clientDetail.consentement}/>
                        </Form.Item>
                        <Form.Item label="Client depuis ">
                            <DatePicker defaultValue={dayjs(clientDetail.date, 'DD-MM-YYYY')} format='DD-MM-YYYY' />
                        </Form.Item>
                        <Form.Item label="Evaluation" name="evaluation">
                            <Rate defaultValue={clientDetail.evaluation}/>
                        </Form.Item>
                        <Form.Item label="Notes">
                            <TextArea rows={6} value={clientDetail.notes}/>
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

export default function Clients(props) {

    const [ client, setClient ] = useState();

    if (client) {
        return (
            <Detail client={client} setClient={setClient} clients={props.clients} />
        );
    } else {
        return (
            <List setClient={setClient} clients={props.clients} />
        );
    }

}