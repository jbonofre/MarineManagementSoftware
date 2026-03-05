import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Spin, message } from 'antd';
import axios from 'axios';

interface BateauClientEntity {
    id: number;
    name?: string;
    immatriculation?: string;
    numeroSerie?: string;
    dateMeS?: string;
    dateAchat?: string;
    dateFinDeGuarantie?: string;
    localisation?: string;
    modele?: { id: number; nom?: string; marque?: string };
    moteurs?: Array<{ id: number; nom?: string; marque?: string }>;
    equipements?: Array<{ id: number; nom?: string }>;
}

interface MesBateauxProps {
    clientId: number;
}

const formatDate = (value?: string) => {
    if (!value) return '-';
    const parsed = new Date(value);
    if (isNaN(parsed.getTime())) return value;
    return parsed.toLocaleDateString('fr-FR');
};

export default function MesBateaux({ clientId }: MesBateauxProps) {
    const [bateaux, setBateaux] = useState<BateauClientEntity[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        axios.get(`/portal/clients/${clientId}/bateaux`)
            .then((res) => setBateaux(res.data || []))
            .catch(() => message.error('Erreur lors du chargement des bateaux'))
            .finally(() => setLoading(false));
    }, [clientId]);

    const columns = [
        { title: 'Nom', dataIndex: 'name', key: 'name' },
        { title: 'Immatriculation', dataIndex: 'immatriculation', key: 'immatriculation' },
        {
            title: 'Modele',
            key: 'modele',
            render: (_: unknown, record: BateauClientEntity) =>
                record.modele ? `${record.modele.marque || ''} ${record.modele.nom || ''}`.trim() || '-' : '-',
        },
        { title: 'N/S', dataIndex: 'numeroSerie', key: 'numeroSerie' },
        { title: 'Localisation', dataIndex: 'localisation', key: 'localisation' },
        {
            title: 'Date achat',
            dataIndex: 'dateAchat',
            key: 'dateAchat',
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
        {
            title: 'Moteurs',
            key: 'moteurs',
            render: (_: unknown, record: BateauClientEntity) =>
                (record.moteurs || []).map((m) => (
                    <Tag key={m.id}>{m.marque ? `${m.marque} ${m.nom || ''}` : m.nom || `#${m.id}`}</Tag>
                )),
        },
    ];

    return (
        <Card title="Mes bateaux">
            <Spin spinning={loading}>
                <Table
                    rowKey="id"
                    dataSource={bateaux}
                    columns={columns}
                    pagination={{ pageSize: 10 }}
                    bordered
                />
            </Spin>
        </Card>
    );
}
