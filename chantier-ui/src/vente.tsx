import React, { useState } from 'react';
import { Card, Space, Button, Table, Modal, Form, Input, DatePicker, Select, InputNumber } from 'antd';
import { PlusCircleOutlined, FileOutlined, DeleteOutlined } from '@ant-design/icons';
import { ventes } from './data.tsx';

const { TextArea } = Input;

const columns = [
    {
        title: 'Numéro', dataIndex: 'numero', key: 'numero',
        render: (text,record) => <a>{text}</a>
    },
    { title: 'Date', dataIndex: 'date', key: 'date' },
    { title: 'Client', dataIndex: 'client', key: 'client' },
    { title: 'Status', dataIndex: 'status', key: 'status' },
    {
        title: '', key: 'action',
        render: (_,record) => (
            <>
            <Button><DeleteOutlined /></Button>
            </>
        )
    }
];

const status = [
  { label: 'Devis', value: 'Devis' },
  { label: 'Commande', value: 'Commande' },
  { label: 'Livrée', value: 'Livrée' },
  { label: 'Payée', value: 'Payée' },
  { label: 'Avoir', value: 'Avoir' },
  { label: 'Retour', value: 'Retour' },
  { label: 'Terminée', value: 'Terminée' }
];

const articlesTable = [
        { title: 'Reference', dataIndex: 'code', key: 'code' },
        { title: 'Description', dataIndex: 'description', key: 'description' },
        { title: 'Quantité', dataIndex: 'quantite', key: 'quantite' },
        { title: 'Prix HT', dataIndex: 'prixht', key: 'prixht' },
        { title: 'Remise', dataIndex: 'remise', key: 'remise' },
        { title: 'TVA', dataIndex: 'tva', key: 'tva'},
        { title: 'Prix TTC', dataIndex: 'prixttc', key: 'prixttc' }
];

function creernumero(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function NouvelleVente(props) {

    const articles = [];

    const numero = creernumero(10);

    return(
        <Modal centered={true} mask={true} title='Vente' open={props.openNew} okText='Sauvegarder'
            onOk={() => demo()}
            closable={true} width={1024} onCancel={() => props.setOpenNew(false)}>
            <Form name="vente" labelCol={{ span: 3 }}
                wrapperCol={{ span: 21 }}
                style={{ width: '100%' }}>
                <Form.Item label="Numéro">
                    <Input value={numero} disabled={true} />
                </Form.Item>
                <Form.Item label="Client">
                    <Input.Search />
                </Form.Item>
                <Form.Item label="Adresse du Client">
                    <TextArea rows={6} />
                </Form.Item>
                <Form.Item label="Date">
                    <DatePicker />
                </Form.Item>
                <Form.Item label="Montant HT">
                    <InputNumber addonAfter="€" />
                </Form.Item>
                <Form.Item label="TVA">
                    <InputNumber addonAfter="%" value="20.00" />
                </Form.Item>
                <Form.Item label="Montant TVA">
                    <InputNumber addonAfter="€" />
                </Form.Item>
                <Form.Item label="Montant TTC">
                    <InputNumber addonAfter="€" />
                </Form.Item>
                <Form.Item label="Articles">
                    <Space direction='vertical'>
                        <Space>
                            <Input placeholder='Référence' />
                            <Input placeholder='Description' />
                            <InputNumber value={1} style={{ width: 70 }}/>
                            <InputNumber placeholder='Prix HT' addonAfter='€'/>
                            <InputNumber value={0} addonAfter='%' style={{ width: 100 }} />
                            <InputNumber value={20} addonAfter='%' style={{ width: 100 }} />
                            <InputNumber placeholder='Prix TTC' addonAfter='€' />
                            <Button type='primary'>Ajouter</Button><Button type='primary'>Scanner</Button>
                        </Space>
                        <Table columns={articlesTable} dataSource={articles} />
                    </Space>
                </Form.Item>
            </Form>
        </Modal>
    );
}

function DetailVente(props) {

    const vente = ventes.filter(record => record.numero === props.numeroVente)[0];

    if (vente === null) {
        message.error('La vente n\'existe pas');
        return (<></>);
    }

    var open = false;
    if (props.numeroVente !== null) {
        open = true;
    }

    var venteNumero = null;

    if (vente != null) {
        venteNumero = vente.numero;
    }

    return(
       <Modal centered={true} mask={true} title={<Space>{venteNumero}</Space>}
                   width={1024} open={open} closable={true} onCancel={() => props.setNumeroVente(null)}>
            <p>Détail vente</p>
       </Modal>
    );
}

export default function Vente(props) {
    const [ openNew, setOpenNew ] = useState(false);
    const [ numeroVente, setNumeroVente ] = useState(null);
    return(
        <>
            <NouvelleVente openNew={openNew} setOpenNew={setOpenNew} />
            <DetailVente numeroVente={numeroVente} setNumeroVente={setNumeroVente} />
            <Card title={<Space><FileOutlined /> Ventes</Space>}>
                <Button type="primary" icon={<PlusCircleOutlined />} onClick={() => setOpenNew(true)}>Nouvelle Vente</Button>
                <Table columns={columns} dataSource={ventes} onRow={(record,rowIndex) => {
                    return {
                        onClick: (event) => { setNumeroVente(record.numero) }
                    };
                }} />
            </Card>
        </>
    );
}