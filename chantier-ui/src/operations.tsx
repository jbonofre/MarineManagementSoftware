import React, { useState } from 'react';
import { Col, Row, Space, Table, Button, Input, Card, Avatar, Form, InputNumber, Select, Tabs } from 'antd';
import { PlusCircleOutlined, EditOutlined, DeleteOutlined, LeftCircleOutlined, FileDoneOutlined } from '@ant-design/icons';
import { demo } from './workspace.tsx';
import { operations } from './data.tsx';

const style: React.CSSProperties = { padding: '8px 0' };
const { TextArea, Search } = Input;

function List(props) {

    const columns = [
        {
            title: 'Opération',
            dataIndex: 'nom',
            key: 'nom',
            sorter: (a,b) => a.nom.localeCompare(b.nom),
            render: (_,record) => (
                <a onClick={() => props.setOperation(record.nom)}>{record.nom}</a>
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
                    <Button onClick={() => props.setOperation(record.nom)}><EditOutlined/></Button>
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
                            <Button type="primary" icon={<PlusCircleOutlined/>}>Nouvelle Opération</Button>
                        </Space>
                    </div>
                </Col>
            </Row>
            <Row gutter={[16,16]}>
                <Col span={24}>
                    <Table columns={columns} dataSource={props.operations} onRow={(record, rowIndex) => {
                       return {
                         onClick: (event) => { props.setOperation(record.nom) }
                       };
                    }} />
                </Col>
            </Row>
        </>
    );
}

function Catalogue(props) {
    return(
      <p>Catalogue</p>
    );
}

function Detail(props) {

    const tabs = [
        {
            key: 'catalogue',
            label: 'Catalogue',
            children: <Catalogue />,
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

    const operationDetail = operations.filter(record => record.nom === props.operation)[0];

    return(
      <>
      <a onClick={() => props.setOperation(null)}><LeftCircleOutlined/> Retour à la liste des opérations</a>
      <Card title={<Space><Avatar size="large" icon={<FileDoneOutlined/>} /> {operationDetail.nom}</Space>} style={{ width: '100%' }}>
        <Form name="operationDetailForm" labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            style={{ width: '80%' }}
            initialValues={operationDetail}>
            <Form.Item name="nom" label="Nom" required={true} rules={[{ required: true, message: 'Le nom de l\'opération est requis' }]}>
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

export default function Operations() {

    const [ operation, setOperation ] = useState();

    if (operation) {
        return(
            <Detail operation={operation} setOperation={setOperation} />
        );
    } else {
        return(
            <List setOperation={setOperation} operations={operations} />
        );
    }
}