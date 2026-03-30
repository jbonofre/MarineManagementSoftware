import React, { useEffect, useState } from 'react';
import { Button, Card, Modal, Table, Tag, Spin, message } from 'antd';
import { EyeOutlined, CreditCardOutlined } from '@ant-design/icons';
import api from './api.ts';

interface VenteEntity {
    id: number;
    status: string;
    type: string;
    date?: string;
    montantHT?: number;
    montantTTC?: number;
    montantTVA?: number;
    remise?: number;
    prixVenteTTC?: number;
    modePaiement?: string;
    forfaits?: Array<{ id: number; nom: string; reference?: string; prixTTC?: number }>;
    produits?: Array<{ id: number; nom: string; marque?: string; prixVenteTTC?: number }>;
    services?: Array<{ id: number; nom: string; prixTTC?: number }>;
}

interface MesFacturesProps {
    clientId: number;
}

const formatDate = (value?: string) => {
    if (!value) return '-';
    const parsed = new Date(value);
    if (isNaN(parsed.getTime())) return value;
    return parsed.toLocaleDateString('fr-FR');
};

const formatEuro = (value?: number) => `${(value || 0).toFixed(2)} EUR`;

const statusColor: Record<string, string> = {
    EN_ATTENTE: 'orange',
    EN_COURS: 'blue',
    PAYEE: 'green',
    ANNULEE: 'red',
};

const statusLabel: Record<string, string> = {
    EN_ATTENTE: 'En attente',
    EN_COURS: 'En cours',
    PAYEE: 'Payee',
    ANNULEE: 'Annulee',
};

const typeLabel: Record<string, string> = {
    DEVIS: 'Devis',
    FACTURE: 'Facture',
    COMMANDE: 'Commande',
    LIVRAISON: 'Livraison',
    COMPTOIR: 'Comptoir',
};

export default function MesFactures({ clientId }: MesFacturesProps) {
    const [ventes, setVentes] = useState<VenteEntity[]>([]);
    const [loading, setLoading] = useState(false);
    const [detailVente, setDetailVente] = useState<VenteEntity | null>(null);

    useEffect(() => {
        setLoading(true);
        api.get(`/portal/clients/${clientId}/ventes`)
            .then((res) => setVentes(res.data || []))
            .catch(() => message.error('Erreur lors du chargement des factures'))
            .finally(() => setLoading(false));
    }, [clientId]);

    const handlePayment = async (vente: VenteEntity, provider: 'stripe' | 'payplug') => {
        try {
            const res = await api.post(`/ventes/${vente.id}/payment-link/${provider}`);
            window.open(res.data.url, '_blank', 'noopener,noreferrer');
        } catch {
            message.error(`Erreur lors de la creation du lien de paiement`);
        }
    };

    const columns = [
        {
            title: 'N',
            dataIndex: 'id',
            key: 'id',
            render: (val: number) => `#${val}`,
        },
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            render: (val: string) => formatDate(val),
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            render: (val: string) => typeLabel[val] || val,
        },
        {
            title: 'Statut',
            dataIndex: 'status',
            key: 'status',
            render: (val: string) => <Tag color={statusColor[val]}>{statusLabel[val] || val}</Tag>,
        },
        {
            title: 'Total TTC',
            dataIndex: 'prixVenteTTC',
            key: 'prixVenteTTC',
            render: (val: number) => formatEuro(val),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: unknown, record: VenteEntity) => (
                <span>
                    <Button
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => setDetailVente(record)}
                        style={{ marginRight: 8 }}
                    >
                        Detail
                    </Button>
                    {record.status !== 'PAYEE' && record.status !== 'ANNULEE' && (
                        <>
                            <Button
                                size="small"
                                icon={<CreditCardOutlined />}
                                onClick={() => handlePayment(record, 'stripe')}
                                style={{ marginRight: 4 }}
                            >
                                Stripe
                            </Button>
                            <Button
                                size="small"
                                icon={<CreditCardOutlined />}
                                onClick={() => handlePayment(record, 'payplug')}
                            >
                                PayPlug
                            </Button>
                        </>
                    )}
                </span>
            ),
        },
    ];

    const detailLines = detailVente ? [
        ...(detailVente.forfaits || []).map((f) => ({
            key: `forfait-${f.id}`,
            type: 'Forfait',
            designation: f.reference ? `${f.reference} - ${f.nom}` : f.nom,
            prix: formatEuro(f.prixTTC),
        })),
        ...(detailVente.produits || []).map((p, i) => ({
            key: `produit-${p.id}-${i}`,
            type: 'Produit',
            designation: p.marque ? `${p.nom} (${p.marque})` : p.nom,
            prix: formatEuro(p.prixVenteTTC),
        })),
        ...(detailVente.services || []).map((s) => ({
            key: `service-${s.id}`,
            type: 'Service',
            designation: s.nom,
            prix: formatEuro(s.prixTTC),
        })),
    ] : [];

    return (
        <Card title="Mes factures et devis">
            <Spin spinning={loading}>
                <Table
                    rowKey="id"
                    dataSource={ventes}
                    columns={columns}
                    pagination={{ pageSize: 10 }}
                    bordered
                />
            </Spin>

            <Modal
                title={detailVente ? `Detail - ${typeLabel[detailVente.type] || detailVente.type} #${detailVente.id}` : ''}
                open={!!detailVente}
                onCancel={() => setDetailVente(null)}
                footer={null}
                width={700}
            >
                {detailVente && (
                    <div>
                        <p><strong>Date :</strong> {formatDate(detailVente.date)}</p>
                        <p><strong>Statut :</strong> <Tag color={statusColor[detailVente.status]}>{statusLabel[detailVente.status]}</Tag></p>
                        <p><strong>Mode de paiement :</strong> {detailVente.modePaiement || '-'}</p>

                        <Table
                            dataSource={detailLines}
                            columns={[
                                { title: 'Type', dataIndex: 'type', key: 'type' },
                                { title: 'Designation', dataIndex: 'designation', key: 'designation' },
                                { title: 'Prix TTC', dataIndex: 'prix', key: 'prix' },
                            ]}
                            pagination={false}
                            size="small"
                            bordered
                            style={{ marginBottom: 16 }}
                        />

                        <p><strong>Montant HT :</strong> {formatEuro(detailVente.montantHT)}</p>
                        <p><strong>TVA :</strong> {formatEuro(detailVente.montantTVA)}</p>
                        <p><strong>Montant TTC :</strong> {formatEuro(detailVente.montantTTC)}</p>
                        {(detailVente.remise || 0) > 0 && (
                            <p><strong>Remise :</strong> {formatEuro(detailVente.remise)}</p>
                        )}
                        <p style={{ fontSize: 16 }}><strong>Total a payer : {formatEuro(detailVente.prixVenteTTC)}</strong></p>
                    </div>
                )}
            </Modal>
        </Card>
    );
}
