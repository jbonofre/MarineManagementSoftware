import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Statistic, Typography, Space } from 'antd';
import { ShopOutlined, ToolOutlined, CarOutlined, FileTextOutlined } from '@ant-design/icons';
import api from './api.ts';

const { Title, Paragraph } = Typography;

interface DashboardProps {
    clientId: number;
}

export default function Dashboard({ clientId }: DashboardProps) {
    const [bateauxCount, setBateauxCount] = useState(0);
    const [moteursCount, setMoteursCount] = useState(0);
    const [remorquesCount, setRemorquesCount] = useState(0);
    const [ventesCount, setVentesCount] = useState(0);

    useEffect(() => {
        Promise.all([
            api.get(`/portal/clients/${clientId}/bateaux`),
            api.get(`/portal/clients/${clientId}/moteurs`),
            api.get(`/portal/clients/${clientId}/remorques`),
            api.get(`/portal/clients/${clientId}/ventes`),
        ]).then(([bateaux, moteurs, remorques, ventes]) => {
            setBateauxCount(bateaux.data.length);
            setMoteursCount(moteurs.data.length);
            setRemorquesCount(remorques.data.length);
            setVentesCount(ventes.data.length);
        });
    }, [clientId]);

    return (
        <Space direction="vertical" size={20} style={{ width: '100%' }}>
            <div>
                <Title level={3} style={{ margin: 0, fontWeight: 700 }}>Tableau de bord</Title>
                <Paragraph style={{ marginBottom: 0, color: '#8c8c8c' }}>
                    Vue d'ensemble de votre espace client.
                </Paragraph>
            </div>
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card style={{ borderTop: '3px solid #1677ff' }}>
                        <Statistic title="Mes bateaux" value={bateauxCount} valueStyle={{ fontWeight: 700, color: '#1677ff' }} prefix={<ShopOutlined />} />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card style={{ borderTop: '3px solid #52c41a' }}>
                        <Statistic title="Mes moteurs" value={moteursCount} valueStyle={{ fontWeight: 700, color: '#52c41a' }} prefix={<ToolOutlined />} />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card style={{ borderTop: '3px solid #faad14' }}>
                        <Statistic title="Mes remorques" value={remorquesCount} valueStyle={{ fontWeight: 700, color: '#faad14' }} prefix={<CarOutlined />} />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card style={{ borderTop: '3px solid #722ed1' }}>
                        <Statistic title="Mes ventes & prestations" value={ventesCount} valueStyle={{ fontWeight: 700, color: '#722ed1' }} prefix={<FileTextOutlined />} />
                    </Card>
                </Col>
            </Row>
        </Space>
    );
}
