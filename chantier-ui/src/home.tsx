import React from 'react';
import { Typography, Row, Col, Card } from 'antd';
import { SmileOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

export default function Home() {
    return (
        <Card bordered={false} style={{ marginBottom: 24, background: '#fafafa' }}>
            <Row align="middle">
                <Col flex="40px">
                    <SmileOutlined style={{ fontSize: 40, color: '#1890ff' }} />
                </Col>
                <Col flex="auto" style={{ paddingLeft: 16 }}>
                    <Title level={2} style={{ marginBottom: 0 }}>Bienvenue sur Marine Management Software</Title>
                    <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                        Gérez vos clients, bateaux, moteurs, remorques et plus encore en toute simplicité.<br />
                        Utilisez le menu latéral pour naviguer entre les différentes fonctionnalités.<br />
                        Nous vous souhaitons une excellente expérience sur notre plateforme.
                    </Paragraph>
                </Col>
            </Row>
        </Card>
    );
}