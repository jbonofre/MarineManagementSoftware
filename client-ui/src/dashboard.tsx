import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Statistic } from 'antd';
import { ShopOutlined, ToolOutlined, CarOutlined, FileTextOutlined } from '@ant-design/icons';
import api from './api.ts';

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
        <div>
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic title="Mes bateaux" value={bateauxCount} prefix={<ShopOutlined />} />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic title="Mes moteurs" value={moteursCount} prefix={<ToolOutlined />} />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic title="Mes remorques" value={remorquesCount} prefix={<CarOutlined />} />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic title="Mes factures" value={ventesCount} prefix={<FileTextOutlined />} />
                    </Card>
                </Col>
            </Row>
        </div>
    );
}
