import React from 'react';
import { ArrowDownOutlined, ArrowUpOutlined, ClockCircleOutlined, WarningOutlined } from '@ant-design/icons';
import { Badge, Button, Card, Col, List, Progress, Row, Space, Statistic, Table, Tag, Typography } from 'antd';

const { Title, Paragraph, Text } = Typography;

type InterventionRow = {
    key: string;
    client: string;
    unite: string;
    type: string;
    technicien: string;
    statut: 'A faire' | 'En cours' | 'Terminee';
};

const interventionColumns = [
    {
        title: 'Client',
        dataIndex: 'client',
        key: 'client'
    },
    {
        title: 'Unite',
        dataIndex: 'unite',
        key: 'unite'
    },
    {
        title: 'Type',
        dataIndex: 'type',
        key: 'type'
    },
    {
        title: 'Technicien',
        dataIndex: 'technicien',
        key: 'technicien'
    },
    {
        title: 'Statut',
        dataIndex: 'statut',
        key: 'statut',
        render: (value: InterventionRow['statut']) => {
            const color = value === 'Terminee' ? 'green' : value === 'En cours' ? 'blue' : 'orange';
            return <Tag color={color}>{value}</Tag>;
        }
    }
];

const interventions: InterventionRow[] = [
    { key: '1', client: 'SAS Port Azur', unite: 'Beneteau Antares 9', type: 'Revision 200h', technicien: 'A. Martin', statut: 'En cours' },
    { key: '2', client: 'M. Duval', unite: 'Jeanneau Cap Camarat', type: 'Diagnostic moteur', technicien: 'L. Simon', statut: 'A faire' },
    { key: '3', client: 'Yacht Club Est', unite: 'Zodiac Pro 7', type: 'Maintenance annuelle', technicien: 'C. Roux', statut: 'Terminee' },
    { key: '4', client: 'Nautic Services', unite: 'Quicksilver 805', type: 'Pose accessoires', technicien: 'M. Bernard', statut: 'A faire' }
];

const alerts = [
    { produit: 'Huile 10W40', niveau: 'Critique', color: 'red' },
    { produit: 'Filtre carburant Yamaha', niveau: 'Bas', color: 'orange' },
    { produit: 'Kit turbine DF140', niveau: 'Bas', color: 'orange' }
];

export default function Dashboard() {
    return (
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <Card>
                <Space direction="vertical" size={0}>
                    <Title level={3} style={{ margin: 0 }}>Tableau de bord</Title>
                    <Paragraph style={{ marginBottom: 0, color: '#8c8c8c' }}>
                        Vue synthese de l'activite atelier et comptoir.
                    </Paragraph>
                </Space>
            </Card>

            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="CA du mois"
                            value={84520}
                            precision={0}
                            suffix="EUR"
                            valueStyle={{ color: '#3f8600' }}
                            prefix={<ArrowUpOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Interventions ouvertes"
                            value={18}
                            valueStyle={{ color: '#1677ff' }}
                            prefix={<ClockCircleOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Retards > 48h"
                            value={4}
                            valueStyle={{ color: '#cf1322' }}
                            prefix={<ArrowDownOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Alertes stock"
                            value={3}
                            valueStyle={{ color: '#d48806' }}
                            prefix={<WarningOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]}>
                <Col xs={24} xl={16}>
                    <Card title="Interventions du jour">
                        <Table
                            columns={interventionColumns}
                            dataSource={interventions}
                            pagination={false}
                            size="small"
                        />
                    </Card>
                </Col>
                <Col xs={24} xl={8}>
                    <Card title="Stock a surveiller">
                        <List
                            dataSource={alerts}
                            renderItem={(item) => (
                                <List.Item>
                                    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                                        <Text>{item.produit}</Text>
                                        <Badge color={item.color} text={item.niveau} />
                                    </Space>
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                    <Card title="Objectifs mensuels">
                        <Space direction="vertical" style={{ width: '100%' }} size={12}>
                            <div>
                                <Text>Heures atelier facturees</Text>
                                <Progress percent={74} status="active" />
                            </div>
                            <div>
                                <Text>Ventes comptoir</Text>
                                <Progress percent={61} />
                            </div>
                            <div>
                                <Text>Contrats de maintenance</Text>
                                <Progress percent={88} />
                            </div>
                        </Space>
                    </Card>
                </Col>
                <Col xs={24} md={12}>
                    <Card title="Actions rapides">
                        <Space direction="vertical" style={{ width: '100%' }} size={10}>
                            <Button type="primary" block>Creer une intervention</Button>
                            <Button block>Planifier un rendez-vous atelier</Button>
                            <Button block>Verifier les retards en cours</Button>
                            <Button block>Consulter le stock critique</Button>
                        </Space>
                    </Card>
                </Col>
            </Row>
        </Space>
    );
}
