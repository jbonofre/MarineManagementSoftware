import React, { useState } from 'react';
import { Card, Col, Row, Space, Input, InputNumber, Select, Button, Form, Table, Tabs, Empty, Pagination, DatePicker, AutoComplete, Image, Collapse } from 'antd';
import type { TableTabsProps } from 'antd';
import type { Bateau } from './workspace.tsx';
import { UserOutlined, PlusCircleOutlined, LeftCircleOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { ReactComponent as BoatOutlined } from './boat.svg';
import { demo } from './workspace.tsx';
import dayjs from 'dayjs';

const style: React.CSSProperties = { padding: '8px 0' };
const { Search } = Input;
const { TextArea } = Input;

function List(props) {

    const columns: TablesProps<Bateau>['columns'] = [
        {
            title: 'Nom',
            dataIndex: 'nom',
            key: 'nom',
            render: (_,record) => (
                <a onClick={() => props.setBateau(record.key)}><img width='30px' src={record.imageUrl} /> {record.nom}</a>
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
                    <Button onClick={() => props.setBateau(record.key)}><EditOutlined/></Button>
                    <Button onClick={() => demo()}><DeleteOutlined/></Button>
                </Space>
            )
        }
    ];

    var searchOptions = [];
    props.bateaux.forEach((bateau) => {
        const item = [ { label: bateau.nom, value: bateau.key } ];
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
                    <Table<Bateau> columns={columns} dataSource={props.bateaux} />
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

function Specifications(props) {
    return(
        <>
        <Form.Item label="Longueur extérieure">
            <InputNumber value={props.bateau.longueurexterieure} />
        </Form.Item>
        <Form.Item label="Longueur coque">
            <InputNumber value={props.bateau.longueurcoque} />
        </Form.Item>
        <Form.Item label="Hauteur">
            <InputNumber value={props.bateau.hauteur} />
        </Form.Item>
        <Form.Item label="Largeur">
            <InputNumber value={props.bateau.largeur} />
        </Form.Item>
        <Form.Item label="Tirant d'air">
            <InputNumber value={props.bateau.tirantair} />
        </Form.Item>
        <Form.Item label="Tirant d'eau">
            <InputNumber value={props.bateau.tiranteau} />
        </Form.Item>
        <Form.Item label="Poids à vide">
            <InputNumber value={props.bateau.poidsvide} />
        </Form.Item>
        <Form.Item label="Poids maximal du moteur">
            <InputNumber value={props.bateau.poidsmaxmoteur} />
        </Form.Item>
        <Form.Item label="Charge maximale du bateau">
            <InputNumber value={props.bateau.chargemax} />
        </Form.Item>
        <Form.Item label="Longueur d'arbre moteur">
            <Input style={{ width: 100 }} value={props.bateau.longueurarbre} />
        </Form.Item>
        <Form.Item label="Puissance maximum">
            <Input style={{ width: 200 }} value={props.bateau.puissancemax} />
        </Form.Item>
        <Form.Item label="Réservoir eau">
            <InputNumber value={props.bateau.reservoireau} />
        </Form.Item>
        <Form.Item label="Réservoir carburant">
            <InputNumber value={props.bateau.reservoircarburant} />
        </Form.Item>
        <Form.Item label="Nombre maximal de passagers">
            <InputNumber value={props.bateau.nombremaxpassagers} />
        </Form.Item>
        <Form.Item label="Catégorie CE">
            <Input style={{ width: 60 }} value={props.bateau.categoriece} />
        </Form.Item>
        </>
    );
}

function Assurance(props) {
    return(
        <>
        <Form.Item label="Assureur">
            <Input value={props.bateau.assureur} />
        </Form.Item>
        <Form.Item label="Numéro d'assurance">
            <Input value={props.bateau.numeroassurance} />
        </Form.Item>
        </>
    );
}

function Bateau(props) {
    const tabItems: TabsProps['items'] = [
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

    const bateauDetail = props.bateaux.filter(record => record.key === props.bateau)[0];

    var collapseItems: CollapseProps['items'] = [
        {
            key: '1',
            label: 'Spécifications',
            children: <Specifications bateau={bateauDetail} />
        },
        {
            key: '2',
            label: 'Assurance',
            children: <Assurance bateau={bateauDetail} />
        },
        {
            key: '3',
            label: 'Localisation',
            children: <p>Hello</p>
        },
        {
            key: '4',
            label: 'Moteurs',
            children: <p>Hello</p>
        },
        {
            key: '5',
            label: 'Electronique',
            children: <p>Hello</p>
        },
        {
            key: '6',
            label: 'Equipement',
            children: <p>Hello</p>
        },
        {
            key: '7',
            label: 'Remorque',
            children: <p>Hello</p>
        }
    ];

    if (bateauDetail.type === 'Voilier') {
        collapseItems[3].label = 'Voile';
    }

    return(
        <>
            <a onClick={() => ( props.setBateau(null) )}><LeftCircleOutlined/> Retour aux bateaux</a>
                <Card title={<Space><img width='60px' src={bateauDetail.imageUrl}/> {bateauDetail.nom}</Space>} style={{ width: '100%' }}>
                    <Row gutter={[16,16]}>
                    <Col span={19}>
                    <Form name="client" labelCol={{ span: 8 }}
                        wrapperCol={{ span: 16 }}
                        style={{ width: '80%' }}
                        initialValues={{ remember: true }}>
                        <Form.Item label="Nom" rules={[{ required: true, message: 'Nom requis' }]}>
                            <Input allowClear={true} defaultValue={bateauDetail.nom} />
                        </Form.Item>
                        <Form.Item label="Immatriculation">
                            <Input allowClear={true} defaultValue={bateauDetail.immatriculation} />
                        </Form.Item>
                        <Form.Item label="Numéro de Série">
                            <Input allowClear={true} defaultValue={bateauDetail.numeroserie} />
                        </Form.Item>
                        <Form.Item label="Marque">
                            <Input allowClear={true} defaultValue={bateauDetail.marque} />
                        </Form.Item>
                        <Form.Item label="Dénomination">
                            <Input allowClear={true} defaultValue={bateauDetail.denomination} />
                        </Form.Item>
                        <Form.Item label={null}>
                            <Select defaultValue={bateauDetail.type}
                                options={[
                                    { value: 'Bateau à Moteur', label: 'Bateau à Moteur' },
                                    { value: 'Voilier', label: 'Voilier' },
                                    { value: 'Moteur', label: 'Moteur' },
                                    { value: 'Remorque', label: 'Remorque' }
                                ]}/>
                        </Form.Item>
                        <Form.Item label="Date de Mise en Service">
                            <DatePicker defaultValue={dayjs(bateauDetail.datemes, 'DD-MM-YYYY')} format='DD-MM-YYYY'/>
                        </Form.Item>
                        <Form.Item label="Date d'Achat">
                            <DatePicker defaultValue={dayjs(bateauDetail.dateachat, 'DD-MM-YYYY')} format='DD-MM-YYYY'/>
                        </Form.Item>
                        <Form.Item label="Date de fin de guarantie">
                            <DatePicker defaultValue={dayjs(bateauDetail.datefinguarantie, 'DD-MM-YYYY')} format='DD-MM-YYYY'/>
                        </Form.Item>
                        <Form.Item label="Description">
                            <TextArea rows={6} value={bateauDetail.description} />
                        </Form.Item>
                        <Form.Item label="Propriétaire">
                            <Input allowClear={true} defaultValue={bateauDetail.proprietaire} />
                        </Form.Item>
                        <Collapse style={{ margin: '0 0 24px 0'}} items={collapseItems} />
                        <Form.Item label={null}>
                            <Space>
                            <Button type="primary" htmlType="submit">Sauvegarder</Button><Button htmlType="button">Annuler</Button>
                            </Space>
                        </Form.Item>
                    </Form>
                    </Col>
                    <Col span={5}>
                        <Space direction="vertical" align="center">
                            <Space><Image width={200} src={bateauDetail.imageUrl} /><Button onClick={() => demo()} icon={<DeleteOutlined/>} /></Space>
                            {
                                bateauDetail.photos.map((photo) => <Space><Image width={200} src={photo}/><Button onClick={() => demo()} icon={<DeleteOutlined/>} /></Space> )
                            }
                            <Button onClick={() => demo()} icon={<PlusCircleOutlined />}>Ajouter une image</Button>
                        </Space>
                    </Col>
                    </Row>
                    <Row gutter={[16,16]}>
                    <Col span={24}>
                        <Tabs items={tabItems}/>
                    </Col>
                    </Row>
                </Card>
        </>
    );
}

export default function Bateaux(props) {

    const [ bateau, setBateau ] = useState();

    if (bateau) {
        return(
            <Bateau bateaux={props.bateaux} bateau={bateau} setBateau={setBateau} />
        );
    } else {
        return(
            <List bateaux={props.bateaux} setBateau={setBateau} />
        );
    }

}