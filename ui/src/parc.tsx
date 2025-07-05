import React, { useState } from 'react';
import { Card, Avatar, Col, Row, Space, Input, Select, Button, Form, Table, Tabs, Empty, Pagination, DatePicker, AutoComplete } from 'antd';
import type { TableTabsProps } from 'antd';
import type { Parc } from './parc.tsx';
import { UserOutlined, PlusCircleOutlined, LeftCircleOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { ReactComponent as BoatOutlined } from './boat.svg';
import { demo } from './workspace.tsx';

const style: React.CSSProperties = { padding: '8px 0' };
const { Search } = Input;
const { TextArea } = Input;

function List(props) {

    const columns: TablesProps<Parc>['columns'] = [
        {
            title: 'Nom',
            dataIndex: 'nom',
            key: 'nom',
            render: (_,record) => (
                <a onClick={() => props.setDetail(record.key)}><img width='30px' url={record.imageUrl} /> {record.nom}</a>
            )
        },
        {
            title: 'Marque',
            dataIndex: 'marque',
            key: 'marque'
        },
        {
            title: 'Dénomination',
            dataIndex: 'denomination',
            key: 'denomination'
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type'
        },
        {
            title: 'Propriétaire',
            dataIndex: 'proprietaire',
            key: 'proprietaire',
            render: (_,record) => (
                <a>{record.proprietaire}</a>
            )
        },
        {
            title: '',
            key: 'action',
            render: (_,record) => (
                <Space>
                    <Button onClick={() => props.setDetail(record.key)}><EditOutlined/></Button>
                    <Button onClick={() => demo()}><DeleteOutlined/></Button>
                </Space>
            )
        }
    ];

    var searchOptions = [];
    props.parc.forEach((parc) => {
        const item = [ { label: parc.nom, value: parc.key } ];
        searchOptions = searchOptions.concat(item);
    });

    return(
        <>
            <Row gutter={[16,16]}>
                <Col span={24}>
                    <div style={style}>
                        <Space>
                            <AutoComplete options={searchOptions} style={{ width: 350 }} placeholder="Recherche" />
                            <Button type="primary" icon={<PlusCircleOutlined/>} onClick={() => demo()}>Enregistrer</Button>
                        </Space>
                    </div>
                </Col>
            </Row>
            <Row guttern={[16,16]}>
                <Col span={24}>
                    <Table<Parc> columns={columns} dataSource={props.parc} />
                </Col>
            </Row>
        </>
    );

}

function Documents() {
    return(
        <Empty/>
    );
}

function Photos() {
    return(
        <Empty/>
    );
}

function Interventions() {
    return (
        <Empty/>
    );
}

function Entretien() {
    return (
        <Empty/>
    );
}

function Vente() {
    return (
      <Empty/>
    );
}

function Detail(props) {
    const tabItems: TabsProps['items'] = [
        {
            key: 'photos',
            label: 'Photos',
            children: <Photos/>
        },
        {
            key: 'documents',
            label: 'Documents',
            children: <Documents/>
        },
        {
            key: 'interventions',
            label: 'Interventions',
            children: <Interventions/>
        },
        {
            key: 'programme',
            label: 'Programme Entretien',
            children: <Entretien/>
        },
        {
            key: 'vente',
            label: 'Vente',
            children: <Vente/>
        }
    ];

    return(
        <>
            <a onClick={() => ( props.setDetail(null) )}><LeftCircleOutlined/> Retour au parc</a>
                <Card title={<Space><Avatar size="large" icon={<BoatOutlined/>}/>Rosco</Space>} style={{ width: '100%' }}>
                    <Form name="client" labelCol={{ span: 8 }}
                        wrapperCol={{ span: 16 }}
                        style={{ width: '80%' }}
                        initialValues={{ remember: true }}>
                        <Form.Item label="Identifiant" name="identifiant" rules={[{ required: true, message: 'Identifiant requis' }]}>
                            <Input allowClear={true} defaultValue="Rosko" />
                        </Form.Item>
                        <Form.Item label="Numéro" name="numero" rules={[{ required: true, message: 'Le numéro est requis' }]}>
                            <Input allowClear={true} defaultValue="MXDSQDSQ" />
                        </Form.Item>
                        <Form.Item label={null} name="type">
                            <Select defaultValue="bateaumoteur"
                                options={[
                                    { value: 'bateaumoteur', label: 'Bateau Moteur' },
                                    { value: 'voilier', label: 'Voilier' },
                                    { value: 'moteur', label: 'Moteur' },
                                    { value: 'remorque', label: 'Remorque' }
                                ]}/>
                        </Form.Item>
                        <Form.Item label="Date de Mise en Service" name="datemes">
                            <DatePicker/>
                        </Form.Item>
                        <Form.Item label="Date d'Achat" name="dateachat">
                            <DatePicker/>
                        </Form.Item>
                        <Form.Item label="Description" name="description">
                            <TextArea rows={6}/>
                        </Form.Item>
                        <Form.Item label="Propriétaire" name="proprietaire">
                            <Input allowClear={true} defaultValue="Jean-Baptiste Onofré" />
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

export default function Parc(props) {

    const [ detail, setDetail ] = useState();

    if (detail) {
        return(
            <Detail setDetail={setDetail} />
        );
    } else {
        return(
            <List parc={props.parc} setDetail={setDetail} />
        );
    }

}