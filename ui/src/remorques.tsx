import React, { useState } from 'react';
import { Space, Button, Row, Col, Table, AutoComplete } from 'antd';
import { EditOutlined, LinkOutlined, DeleteOutlined, PlusCircleOutlined } from '@ant-design/icons';

const style: React.CSSProperties = { padding: '8px 0' };

function Remorque(props) {
    return(
        <p>Détail remorque</p>
    );
}

function List(props) {

    const columns = [
      { title: 'Numéro de série', dataIndex: 'numeroserie', key: 'numeroserie' },
      { title: 'Dénomination', dataIndex: 'denomination', key: 'denomination' },
      { title: 'Immatriculation', dataIndex: 'immatriculation', key: 'immatriculation' },
      { title: 'Propriétaire', dataIndex: 'proprietaire', key: 'proprietaire' },
      {
          title: '',
          key: 'action',
          render: (_,recpord) => (
            <Space>
                <Button onClick={() => props.setRemorque(record.numeroserie)}><EditOutlined /></Button>
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
                            <Button type="primary" icon={<PlusCircleOutlined/>} onClick={() => demo()}>Nouvelle Remorque</Button>
                        </Space>
                    </div>
                </Col>
            </Row>
            <Row gutter={[16,16]}>
                <Col span={24}>
                    <Table columns={columns} dataSource={props.remorques} onRow={(record, rowIndex) => {
                        return {
                            onClick: (event) => { props.setRemorque(record.numeroserie) }
                        };
                    }}/>
                </Col>
            </Row>
        </>
    );
}

export default function Remorques(props) {

    const [ remorque, setRemorque ] = useState();

    if (remorque) {
        return(
          <Remorque remorques={props.remorques} remorque={remorque} setRemorque={setRemorque} />
        );
    } else {
        return(
          <List remorques={props.remorques} setRemorque={setRemorque} />
        );
    }
}