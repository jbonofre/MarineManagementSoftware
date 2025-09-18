import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumb, Col, Row, Space, Table, Button, Input, Card, Avatar, Form, InputNumber, Select, Tabs } from 'antd';
import { HomeOutlined, PlusCircleOutlined, EditOutlined, DeleteOutlined, LeftCircleOutlined, FileDoneOutlined } from '@ant-design/icons';
import { demo } from './workspace.tsx';
import { forfaits } from './data.tsx';

const style: React.CSSProperties = { padding: '8px 0' };
const { TextArea, Search } = Input;

function List(props) {

    const columns = [
        {
            title: 'Forfait',
            dataIndex: 'nom',
            key: 'nom',
            sorter: (a,b) => a.nom.localeCompare(b.nom),
            render: (_,record) => (
                <a onClick={() => props.setForfait(record.nom)}>{record.nom}</a>
            )
        },
        {
            title: 'Application',
            dataIndex: 'application',
            render: (_,record) => (
                <>
                {record.application.map((item) => {
                        return(<>{item} </>);
                })}
                </>
            ),
        },
        {
            title: 'Programmation',
            render: (_,record) => <div>{(() => {
                if (record.heures && record.periode) {
                    return(<>{record.heures} heures ou {record.periode}</>)
                } else if (record.heures) {
                    return(<>{record.heures} heures</>)
                } else if (record.periode) {
                    return(<>{record.periode}</>)
                }
            })()}</div>,
        },
        {
            title: '',
            render: (_,record) => (
                <Space>
                    <Button onClick={() => props.setForfait(record.nom)}><EditOutlined/></Button>
                    <Button onClick={() => demo()}><DeleteOutlined/></Button>
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
                            <Search placeholder="Recherche" enterButton style={{ width: 350 }}/>
                            <Button type="primary" icon={<PlusCircleOutlined/>}>Nouveau forfait</Button>
                        </Space>
                    </div>
                </Col>
            </Row>
            <Row gutter={[16,16]}>
                <Col span={24}>
                    <Table columns={columns} dataSource={forfaits} onRow={(record, rowIndex) => {
                       return {
                         onClick: (event) => { props.setForfait(record.nom) }
                       };
                    }} />
                </Col>
            </Row>
        </>
    );
}

function Catalogue(props) {

    const forfaitDetail = forfaits.filter(record => record.nom === props.forfait[0])[0];

    const columns = [
        {
            title: 'Référence',
            dataIndex: 'ref',
            key: 'ref'
        },
        {
            title: 'Quantité',
            dataIndex: 'quantite',
            key: 'quantite'
        },
        {
            title: null,
            render: (_,record) => (
                <Space>
                    <Button><DeleteOutlined/></Button>
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
                    <InputNumber />
                    <Button type="primary" icon={<PlusCircleOutlined/>} onClick={() => demo()}>Ajouter</Button>
                </Space>
            </div>
        </Col>
      </Row>
      <Row gutter={[16,16]}>
        <Col span={24}>
            <Table columns={columns} dataSource={forfaitDetail.catalogue} />
        </Col>
      </Row>
      </>
    );
}

function Detail(props) {

    const forfaitDetail = forfaits.filter(record => record.nom === props.forfait)[0];

    const tabs = [
        {
            key: 'catalogue',
            label: 'Catalogue',
            children: (<Catalogue forfait={[ props.forfait ]} />),
        },
        {
            key: 'application',
            label: 'Application',
            children: <p>Application</p>
        },
        {
            key: 'programmation',
            label: 'Programmation',
            children: <p>Programmation</p>
        }
    ];

    return(
      <>
      <Breadcrumb items={[
        { title: <Link to="/"><HomeOutlined/></Link> },
        { title: <Button type="text" size="small" onClick={() => props.setForfait(null) }>Forfaits</Button> }
      ]} />
      <Card title={<Space><Avatar size="large" icon={<FileDoneOutlined/>} /> {forfaitDetail.nom}</Space>} style={{ width: '100%' }}>
        <Form name="forfaitDetailForm" labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            style={{ width: '80%' }}
            initialValues={forfaitDetail}>
            <Form.Item name="nom" label="Nom" required={true} rules={[{ required: true, message: 'Le nom du forfait est requis' }]}>
                <Input allowClear={true} />
            </Form.Item>
            <Form.Item name="description" label="Description">
                <TextArea rows={6} allowClear={true} />
            </Form.Item>
            <Form.Item name="prixht" label="Prix HT">
                <InputNumber addonAfter="€"/>
            </Form.Item>
            <Form.Item name="tva" label="Montant TVA">
                <InputNumber addonAfter="€"/>
            </Form.Item>
            <Form.Item name="prixttc" label="Prix TTC">
                <InputNumber addonAfter="€"/>
            </Form.Item>
            <Form.Item label={null}>
                <Space>
                <Button type="primary">Enregistrer</Button>
                <Button>Annuler</Button>
                </Space>
            </Form.Item>
        </Form>
        <Tabs items={tabs} />
      </Card>
      </>
    );
}

export default function Forfaits() {

    const [ forfait, setForfait ] = useState();

    if (forfait) {
        return(
            <Detail forfait={forfait} setForfait={setForfait} />
        );
    } else {
        return(
            <List setForfait={setForfait} />
        );
    }
}