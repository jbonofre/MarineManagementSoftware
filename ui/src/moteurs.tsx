import React, { useState } from 'react';
import { Space, Button, Row, Col, AutoComplete, Table } from 'antd';
import { EditOutlined, DeleteOutlined, PlusCircleOutlined, LinkOutlined } from '@ant-design/icons';
import { demo } from './workspace.tsx';

const style: React.CSSProperties = { padding: '8px 0' };

function Moteur() {
    return(
      <p>Détails Moteur</p>
    );
}

function List(props) {

    const columns = [
        { title: 'Numéro de série', dataIndex: 'numeroserie', key: 'numeroserie' },
        { title: 'Dénomination', dataIndex: 'denomination', key: 'denomination' },
        { title: 'Propriétaire', dataIndex: 'proprietaire', key: 'proprietaire' },
        {
            title: '',
            key: 'action',
            render: (_,record) => (
                <Space>
                    <Button onClick={() => props.setMoteur(record.numeroserie)}><EditOutlined /></Button>
                    <Button><LinkOutlined /></Button>
                    <Button onClick={() => demo()}><DeleteOutlined /></Button>
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
                            <AutoComplete style={{ width: 350 }} placeholder="Recherche" />
                            <Button type="primary" icon={<PlusCircleOutlined/>} onClick={() => demo()}>Nouveau Moteur</Button>
                        </Space>
                    </div>
                </Col>
            </Row>
            <Row guttern={[16,16]}>
                <Col span={24}>
                    <Table columns={columns} dataSource={props.moteurs} onRow={(record, rowIndex) => {
                        return {
                            onClick: (event) => { props.setMoteur(record.numeroserie) }
                        };
                    }}/>
                </Col>
            </Row>
      </>
    );
}

export default function Moteurs(props) {

    const [ moteur, setMoteur ] = useState();

    if (moteur) {
        return(
          <Moteur moteurs={props.moteurs} moteur={moteur} />
        );
    } else {
        return(
            <List moteurs={props.moteurs} setMoteur={setMoteur} />
        );
    }
}