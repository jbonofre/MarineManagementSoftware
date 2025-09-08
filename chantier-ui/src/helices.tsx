import { useState, useEffect } from 'react';
import { Row, Col, Space, Input, Button, Table, Spin, message } from 'antd';
import { PlusCircleOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const style: React.CSSProperties = { padding: '8px 0' };

function Detail(props) {
    return(<p>Helice</p>);
}

function List() {

    const [ helices, setHelices ] = useState();

    const fetchHelices = () => {
        fetch('./helices')
        .then((response) => {
            if (!response.ok) {
                throw new Error('Erreur ' + response.status);
            }
            return response.json();
        })
        .then((data) => setHelices(data))
        .catch((error) => {
            message.error('Une erreur est survenue: ' + error.message);
            console.error(error);
        })
    };

    useEffect(fetchHelices, []);

    if (!helices) {
        return(<Spin/>);
    }

    const columns = [
        {
            title: 'Modèle',
            key: 'modele',
            dataIndex: 'modele',
        },
        {
            title: 'Marques',
            key: 'marque',
            dataIndex: 'marque',
        },
        {
            title: 'Evaluation',
            key: 'evaluation',
            dataIndex: 'evaluation'
        },
        {
            title: '',
            key: 'action',
            render: (_,record) => (
                <Space>
                    <Button icon={<EditOutlined/>} />
                    <Button icon={<DeleteOutlined/>} />
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
                    <Input.Search placeholder="Recherche" enterButton style={{ width: 600 }} />
                    <Button type="primary" icon={<PlusCircleOutlined/>} />
                </Space>
            </div>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
            <Table columns={columns} dataSource={helices} />
        </Col>
      </Row>
      </>
    );
}

export default function Helices() {

    const [ helice, setHelice ] = useState();

    if (helice) {
        return(<Detail helice={helice} />);
    } else {
        return(<List />);
    }

}