import { Card, Col, Row, Space, Button } from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';

export default function Clients() {

    return(
        <>
        <Row>
            <Col span={24}>
              <Space>
                <Button type="primary" icon={<PlusCircleOutlined/>}>Nouveau Client</Button>
              </Space>
            </Col>
        </Row>
        <Row>
            <Col span={24}>
                Jean-Baptiste Onofré (particulier)
            </Col>
        </Row>
        </>
    );

}