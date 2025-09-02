import React, { useState } from 'react';
import { Col, Row, Space, Table, Button, Input } from 'antd';
import { PlusCircleOutlined, EditOutlined, DeleteOutlined, LeftCircleOutlined } from '@ant-design/icons';
import { forfaits } from './data.tsx';

const style: React.CSSProperties = { padding: '8px 0' };
const { Search } = Input;

function Detail(props) {
    return(
      <p>Détail</p>
    );
}

function List(props) {

    const columns = [
      {
        title: 'Forfait',
        dataIndex: 'nom',
        sorter: (a,b) => a.nom.localeCompare(b.nom),
        render: (_,record) => (
            <a onClick={() => props.setForfait(record.nom)}>{record.nom}</a>
        )
      },
      {
        title: 'Opérations',
        dataIndex: 'operations',
        render: (_,record) => (record.operations.length),
        sorter: (a,b) => a.operations.length < b.operations.length,
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
                            <Button type="primary" icon={<PlusCircleOutlined/>}>Nouveau Forfait</Button>
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

export default function Forfait() {

    const [ forfait, setForfait ] = useState();

    if (forfait) {
        return(
          <Detail setForfait={setForfait} />
        );
    } else {
        return(
          <List setForfait={setForfait} />
        );
    }

}