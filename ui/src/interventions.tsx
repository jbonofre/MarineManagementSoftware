import React, { useState } from 'react';
import { Row, Col, Space, Select, Button, Input, Table, Card, QRCode, Form, DatePicker, Tabs } from 'antd';
import type { TableProps, TabsProps } from 'antd';
import { PlusCircleOutlined, LeftCircleOutlined } from '@ant-design/icons';

const { Search, TextArea } = Input;
const style: React.CSSProperties = { padding: '8px 0' };

interface InterventionType {
    key: string,
    numero: string,
    client: string,
    date: string,
    status: string
}

const status = [
    { value: '', label: ''},
    { value: 'devis', label: 'Devis' },
    { value: 'reception', label: 'Réception' },
    { value: 'encours', label: 'En cours' },
    { value: 'paiement', label: 'Paiement' },
    { value: 'terminee', label: 'Terminée' }
];

const tabItems: TabsProps['items'] = [
    {
        key: 'pieces',
        label: 'Pièces et Accessoires',
        children: 'Piéces'
    },
    {
        key: 'photos',
        label: 'Photos',
        children: 'Photos'
    },
    {
        key: 'documents',
        label: 'Documents',
        children: 'Documents'
    },
    {
        key: 'fiche',
        label: 'Fiche',
        children: 'Fiche'
    }
];

function Detail(props) {
    const descriptionValue = "Installation d'un compas, vérification";
    return(
        <>
        <a onClick={ () => props.setIntervention(null) }><LeftCircleOutlined/> Retour à la liste des intervention</a>
        <Card title={
                <Space>
                    <QRCode size={80} value="dqdqsdqd"/>
                    Intervention YB3E2DSDA | Jean-Baptiste Onofré
                </Space>
            } style={{ width: '100%' }}>
            <Form name="intervention" labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                style={{ width: '80%' }}
                initialValue={{ remember: true }}>
                <Form.Item label="Numéro" name="numero">
                    <Input defaultValue="YB3E2DSDA" disabled={true}/>
                </Form.Item>
                <Form.Item label="Client" name="client">
                    <Search defaultValue="Jean-Baptiste Onofré" enterButton />
                </Form.Item>
                <Form.Item label="Status" name="status">
                    <Space>
                        <Select options={status} defaultValue="paiement" style={{ width: 200 }} />
                        <DatePicker />
                    </Space>
                </Form.Item>
                <Form.Item label="Description" name="description">
                    <TextArea defaultValue={descriptionValue} rows={4}>Détail</TextArea>
                </Form.Item>
            </Form>
            <Tabs items={tabItems} />
        </Card>
        </>
    );
}

function List(props) {
       const columns: TableProps<InterventionType>['columns'] = [
               {
                   title: 'Numéro',
                   dataIndex: 'numero',
                   key: 'numero',
                   render: (text,record) => <a onClick={ () => props.setIntervention(record.key) }>{text}</a>
               },
               {
                   title: 'Client',
                   dataIndex: 'client',
                   key: 'client'
               },
               {
                   title: 'Date',
                   dataIndex: 'date',
                   key: 'date'
               },
               {
                   title: 'Status',
                   dataIndex: 'status',
                   key: 'status'
               },
               {
                   title: '',
                   key: 'action',
                   render: (_, record) => (
                       <Space>
                           <Button>Voir</Button>
                           <Button>Supprimer</Button>
                       </Space>
                   )
               }
           ]

           const data: InterventionType[] = [
               {
                   key: '1',
                   numero: 'YB3E2DSDA',
                   client: 'Jean-Baptiste Onofré',
                   date: '22-06-2025',
                   status: 'Paiement'
               },
               {
                   key: '2',
                   numero: 'SEAXZ43423T0',
                   client: 'John Duff',
                   date: '25-06-2025',
                   status: 'Devis'
               }
           ]
       return(
           <>
               <Row gutter={[16,16]}>
                   <Col span={24}>
                       <div style={style}>
                           <Space>
                               <Search placeholder="Recherche" enterButton style={{ width: 350 }}/>
                               <Select mode="tags" placeholder="Status" style={{ width: 350 }} options={status}/>
                               <Button type="primary" icon={<PlusCircleOutlined/>}>Créer une intervention</Button>
                           </Space>
                       </div>
                   </Col>
               </Row>
               <Row gutter={[16,16]}>
                   <Col span={24}>
                       <Table<InterventionType> columns={columns} dataSource={data} />
                   </Col>
               </Row>
           </>
       );
}

export default function Interventions() {

    const [ intervention, setIntervention ] = useState();

    if (intervention) {
        return(
            <Detail intervention={intervention} setIntervention={setIntervention} />
        );
    } else {
        return(
            <List setIntervention={setIntervention} />
        );
    }
}