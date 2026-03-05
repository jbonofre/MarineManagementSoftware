import React, { useEffect, useState } from 'react';
import { Button, Card, Descriptions, Spin, Tag, message } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import axios from 'axios';

interface Client {
    id: number;
    prenom?: string;
    nom: string;
    type: string;
    email?: string;
    telephone?: string;
    adresse?: string;
    consentement?: boolean;
    siren?: string;
    siret?: string;
    tva?: string;
    naf?: string;
}

interface MonProfilProps {
    clientId: number;
}

const typeLabel: Record<string, string> = {
    PARTICULIER: 'Particulier',
    PROFESSIONNEL: 'Professionnel',
    PROFESSIONNEL_MER: 'Professionnel de la Mer',
};

export default function MonProfil({ clientId }: MonProfilProps) {
    const [client, setClient] = useState<Client | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchProfile = () => {
        setLoading(true);
        axios.get(`/portal/clients/${clientId}`)
            .then((res) => setClient(res.data))
            .catch(() => message.error('Erreur lors du chargement du profil'))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchProfile();
    }, [clientId]);

    return (
        <Card
            title="Mon profil"
            extra={<Button icon={<ReloadOutlined />} onClick={fetchProfile}>Actualiser</Button>}
        >
            <Spin spinning={loading}>
                {client && (
                    <Descriptions bordered column={2}>
                        <Descriptions.Item label="Nom">{client.nom}</Descriptions.Item>
                        <Descriptions.Item label="Prenom">{client.prenom || '-'}</Descriptions.Item>
                        <Descriptions.Item label="Type">
                            <Tag>{typeLabel[client.type] || client.type}</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Email">{client.email || '-'}</Descriptions.Item>
                        <Descriptions.Item label="Telephone">{client.telephone || '-'}</Descriptions.Item>
                        <Descriptions.Item label="Adresse">{client.adresse || '-'}</Descriptions.Item>
                        {client.type !== 'PARTICULIER' && (
                            <>
                                <Descriptions.Item label="SIREN">{client.siren || '-'}</Descriptions.Item>
                                <Descriptions.Item label="SIRET">{client.siret || '-'}</Descriptions.Item>
                                <Descriptions.Item label="TVA">{client.tva || '-'}</Descriptions.Item>
                                <Descriptions.Item label="NAF">{client.naf || '-'}</Descriptions.Item>
                            </>
                        )}
                    </Descriptions>
                )}
            </Spin>
        </Card>
    );
}
