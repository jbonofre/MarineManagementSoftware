import React, { useEffect, useState } from 'react';
import { ArrowDownOutlined, ArrowUpOutlined, ClockCircleOutlined, WarningOutlined } from '@ant-design/icons';
import { Badge, Button, Card, Col, Empty, List, Progress, Row, Space, Spin, Statistic, Table, Tag, Typography } from 'antd';
import dayjs from 'dayjs';

const { Title, Paragraph, Text } = Typography;

type InterventionRow = {
    key: string;
    client: string;
    unite: string;
    type: string;
    technicien: string;
    statut: 'A faire' | 'En cours' | 'Terminee';
};

type StockAlert = {
    produit: string;
    niveau: string;
    color: string;
};

type DashboardData = {
    caDuMois: number;
    interventionsOuvertes: number;
    retards48h: number;
    alertesStock: number;
    interventions: InterventionRow[];
    stockAlerts: StockAlert[];
    heuresAtelierPct: number;
    ventesComptoirPct: number;
    contratsMaintenancePct: number;
};

type PlanningWarning = {
    key: string;
    venteId: number;
    nom: string;
    type: 'forfait' | 'service';
    technicien: string;
    datePlanification: string;
    dureeEstimee?: number;
    dureeReelle?: number;
    warning: 'late' | 'overrun';
};

const buildWarnings = (ventes: Array<Record<string, unknown>>): PlanningWarning[] => {
    const now = dayjs();
    const warnings: PlanningWarning[] = [];

    for (const vente of ventes) {
        const venteId = vente.id as number;
        const entries: Array<{ list: Array<Record<string, unknown>>; type: 'forfait' | 'service'; nameKey: string }> = [
            { list: (vente.venteForfaits || []) as Array<Record<string, unknown>>, type: 'forfait', nameKey: 'forfait' },
            { list: (vente.venteServices || []) as Array<Record<string, unknown>>, type: 'service', nameKey: 'service' },
        ];

        for (const { list, type, nameKey } of entries) {
            for (let i = 0; i < list.length; i++) {
                const entry = list[i];
                const status = entry.status as string | undefined;
                if (status !== 'PLANIFIEE' && status !== 'EN_COURS') continue;

                const nested = entry[nameKey] as Record<string, unknown> | undefined;
                const nom = (nested?.nom as string) || '(Sans nom)';
                const dureeEstimee = nested?.dureeEstimee as number | undefined;
                const dureeReelle = entry.dureeReelle as number | undefined;
                const statusDate = entry.statusDate as string | undefined;
                const tech = entry.technicien as Record<string, unknown> | undefined;
                const techLabel = tech ? `${tech.prenom || ''} ${tech.nom || ''}`.trim() || `#${tech.id}` : '-';

                const isLate = statusDate && dayjs(statusDate).isValid() && dayjs(statusDate).isBefore(now);
                const isOverrun = dureeEstimee != null && dureeReelle != null && dureeReelle > dureeEstimee;

                if (isLate) {
                    warnings.push({
                        key: `${type}-${venteId}-${entry.id || i}-late`,
                        venteId, nom, type, technicien: techLabel,
                        datePlanification: dayjs(statusDate).format('DD/MM/YYYY HH:mm'),
                        dureeEstimee, dureeReelle, warning: 'late',
                    });
                }
                if (isOverrun) {
                    warnings.push({
                        key: `${type}-${venteId}-${entry.id || i}-overrun`,
                        venteId, nom, type, technicien: techLabel,
                        datePlanification: statusDate ? dayjs(statusDate).format('DD/MM/YYYY HH:mm') : '-',
                        dureeEstimee, dureeReelle, warning: 'overrun',
                    });
                }
            }
        }
    }
    return warnings;
};

const warningColumns = [
    {
        title: 'Vente',
        dataIndex: 'venteId',
        key: 'venteId',
        render: (v: number) => `#${v}`,
    },
    {
        title: 'Nom',
        dataIndex: 'nom',
        key: 'nom',
    },
    {
        title: 'Type',
        dataIndex: 'type',
        key: 'type',
        render: (v: string) => <Tag color={v === 'forfait' ? 'purple' : 'geekblue'}>{v === 'forfait' ? 'Forfait' : 'Service'}</Tag>,
    },
    {
        title: 'Technicien',
        dataIndex: 'technicien',
        key: 'technicien',
    },
    {
        title: 'Date planification',
        dataIndex: 'datePlanification',
        key: 'datePlanification',
    },
    {
        title: 'Durée',
        key: 'duree',
        render: (_: unknown, record: PlanningWarning) => {
            const overrun = record.warning === 'overrun';
            return (
                <span style={overrun ? { color: '#fa541c', fontWeight: 600 } : undefined}>
                    {record.dureeReelle != null ? `${record.dureeReelle}h` : '-'} / {record.dureeEstimee != null ? `${record.dureeEstimee}h` : '-'}
                    {overrun && <WarningOutlined style={{ marginLeft: 6, color: '#fa541c' }} />}
                </span>
            );
        },
    },
    {
        title: 'Alerte',
        dataIndex: 'warning',
        key: 'warning',
        render: (v: string) => v === 'late'
            ? <Tag color="volcano"><WarningOutlined /> En retard</Tag>
            : <Tag color="orange"><WarningOutlined /> Dépassement durée</Tag>,
    },
];

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

export default function Dashboard() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [warnings, setWarnings] = useState<PlanningWarning[]>([]);

    useEffect(() => {
        const ventesPromise = fetch('/ventes')
            .then(res => res.json())
            .then((ventes: Array<Record<string, unknown>>) => {
                setWarnings(buildWarnings(ventes));
                const now = dayjs();
                const startOfMonth = now.startOf('month');
                const caDuMois = ventes
                    .filter(v => v.status === 'PAYEE' && v.date && dayjs(v.date as string).isAfter(startOfMonth))
                    .reduce((sum, v) => sum + ((v.prixVenteTTC as number) || 0), 0);
                return caDuMois;
            });

        Promise.all([
            fetch('/dashboard').then(res => res.json()),
            ventesPromise,
        ])
            .then(([d, caDuMois]: [DashboardData, number]) => {
                setData({ ...d, caDuMois });
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading || !data) {
        return <Spin size="large" style={{ display: 'flex', justifyContent: 'center', marginTop: 100 }} />;
    }

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
                            value={data.caDuMois}
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
                            value={data.interventionsOuvertes}
                            valueStyle={{ color: '#1677ff' }}
                            prefix={<ClockCircleOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Retards > 48h"
                            value={data.retards48h}
                            valueStyle={{ color: '#cf1322' }}
                            prefix={<ArrowDownOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Alertes stock"
                            value={data.alertesStock}
                            valueStyle={{ color: '#d48806' }}
                            prefix={<WarningOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            {warnings.length > 0 && (
                <Card
                    title={
                        <span style={{ color: '#fa541c' }}>
                            <WarningOutlined /> Alertes planning ({warnings.length})
                        </span>
                    }
                    style={{ borderColor: '#fa541c' }}
                >
                    <Table
                        columns={warningColumns}
                        dataSource={warnings}
                        rowKey="key"
                        pagination={{ pageSize: 5 }}
                        size="small"
                    />
                </Card>
            )}

            <Row gutter={[16, 16]}>
                <Col xs={24} xl={16}>
                    <Card title="Interventions du jour">
                        <Table
                            columns={interventionColumns}
                            dataSource={data.interventions}
                            pagination={false}
                            size="small"
                        />
                    </Card>
                </Col>
                <Col xs={24} xl={8}>
                    <Card title="Stock a surveiller">
                        <List
                            dataSource={data.stockAlerts}
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
                                <Progress percent={data.heuresAtelierPct} status="active" />
                            </div>
                            <div>
                                <Text>Ventes comptoir</Text>
                                <Progress percent={data.ventesComptoirPct} />
                            </div>
                            <div>
                                <Text>Contrats de maintenance</Text>
                                <Progress percent={data.contratsMaintenancePct} />
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
