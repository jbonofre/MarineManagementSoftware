import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Spin, message } from 'antd';
import api from './api.ts';

interface RemorqueClientEntity {
    id: number;
    immatriculation?: string;
    dateMeS?: string;
    dateAchat?: string;
    dateFinDeGuarantie?: string;
    modele?: { id: number; nom?: string; marque?: string };
}

interface MesRemorquesProps {
    clientId: number;
}

const formatDate = (value?: string) => {
    if (!value) return '-';
    const parsed = new Date(value);
    if (isNaN(parsed.getTime())) return value;
    return parsed.toLocaleDateString('fr-FR');
};

export default function MesRemorques({ clientId }: MesRemorquesProps) {
    const [remorques, setRemorques] = useState<RemorqueClientEntity[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        api.get(`/portal/clients/${clientId}/remorques`)
            .then((res) => setRemorques(res.data || []))
            .catch(() => message.error('Erreur lors du chargement des remorques'))
            .finally(() => setLoading(false));
    }, [clientId]);

    const columns = [
        { title: 'Immatriculation', dataIndex: 'immatriculation', key: 'immatriculation' },
        {
            title: 'Modele',
            key: 'modele',
            render: (_: unknown, record: RemorqueClientEntity) =>
                record.modele ? `${record.modele.marque || ''} ${record.modele.nom || ''}`.trim() || '-' : '-',
        },
        {
            title: 'Date achat',
            dataIndex: 'dateAchat',
            key: 'dateAchat',
            render: (val: string) => formatDate(val),
        },
        {
            title: 'Mise en service',
            dataIndex: 'dateMeS',
            key: 'dateMeS',
            render: (val: string) => formatDate(val),
        },
        {
            title: 'Fin de garantie',
            dataIndex: 'dateFinDeGuarantie',
            key: 'dateFinDeGuarantie',
            render: (val: string) => {
                const formatted = formatDate(val);
                if (!val || formatted === '-') return '-';
                const isExpired = new Date(val) < new Date();
                return <Tag color={isExpired ? 'red' : 'green'}>{formatted}</Tag>;
            },
        },
    ];

    return (
        <Card title="Mes remorques">
            <Spin spinning={loading}>
                <Table
                    rowKey="id"
                    dataSource={remorques}
                    columns={columns}
                    pagination={{ pageSize: 10 }}
                    bordered
                />
            </Spin>
        </Card>
    );
}
