import React, { useState } from 'react';
import { Card, Space, Button, Table, Modal, Form, Input, Select, DatePicker, InputNumber } from 'antd';
import { DesktopOutlined, PlusCircleOutlined, EditOutlined, DeleteOutlined, PrinterOutlined, SendOutlined, CreditCardOutlined } from '@ant-design/icons';
import { demo } from './workspace.tsx';
import dayjs from 'dayjs';

const types = [
  { value: 'Ticket de Caisse', label: 'Ticket de Caisse' },
  { value: 'Devis', label: 'Devis' },
  { value: 'Commande', label: 'Commande' },
  { value: 'Facture', label: 'Facture' },
  { value: 'Facture payée', label: 'Facture payée' }
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

const reglement = [
    { value: 'Espèce', label: 'Espèce' },
    { value: 'Chéque', label: 'Chéque' },
    { value: 'CB', label: 'CB' },
    { value: 'Paypal', label: 'Paypal' },
    { value: 'Virement', label: 'Virement' }
];

const { TextArea } = Input;

const transactions = [
  {
    numero: 'SXZADAX121',
    type: 'Facture payée',
    codeclient: 'CL01797',
    client: 'Jean-Baptiste Onofré',
    adresseclient: 'Lieu dit Coatalec\n29670 Henvic',
    date: '08-06-2024',
    datelivraison: '08-06-2024',
    dateecheance: '08-06-2024',
    montantht: 20.10,
    tauxtva: 20.00,
    montantttc: 24.00,
    montanttva: 4.02,
    acompte: 0,
    netapayer: 24,
    soldedu: 0,
    modereglement: 'CB',
    items: [
        {
            code: '13311',
            description: 'Bouée de mouillage rigide orange, diam 25cm',
            quantite: 1,
            remise: 0,
            prixht: 20.10,
            tva: 20,
            prixttc: 24
        }
    ]
  },
  {
    numero: 'DSDXZ21SQ',
    type: 'Ticket de Caisse',
    date: '06-06-2024',
    montantht: 20.10,
    tauxtva: 20.00,
    montantttc: 24.00,
    netapayer: 24,
    modereglement: 'CB',
    items: [
        {
           code: '13311',
            description: 'Bouée de mouillage rigide orange, diam 25cm',
            quantite: 1,
            remise: 0,
            prixht: 20.10,
            tva: 20,
            prixttc: 24
        }
    ]
  }
];

const columns = [
  {
    title: 'Numéro',
    dataIndex: 'numero',
    key: 'numero',
    render: (text,record) => <a>{text}</a>
  },
  {
    title: 'Type',
    dataIndex: 'type',
    key: 'type'
  },
  {
    title: 'Date',
    dataIndex: 'date',
    key: 'date'
  },
  {
    title: 'Client',
    dataIndex: 'client',
    key: 'client'
  },
  {
    title: 'Montant TTC',
    dataIndex: 'montantttc',
    key: 'montantttc'
  },
  {
    title: '',
    key: 'action',
    render: (_,record) => (
        <>
        <Button onClick={() => demo()}><DeleteOutlined/></Button>
        </>
    )
  }
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

function NouvelleTransaction(props) {

    const articles = [];

    const numero = creernumero(10);

    return(
        <Modal centered={true} mask={true} title='Nouvelle Transaction' open={props.openNew} okText='Sauvegarder'
            onOk={() => demo()}
            closable={true} width={1024} onCancel={() => props.setOpenNew(false)}>
            <Form name="client" labelCol={{ span: 3 }}
                 wrapperCol={{ span: 21 }}
                 style={{ width: '100%' }}
                 initialValues={{ remember: true }}>
                <Form.Item label="Numéro">
                    <Input value={numero} disabled={true} />
                </Form.Item>
                <Form.Item label="Type">
                    <Select options={types} defaultValue='Ticket de Caisse' />
                </Form.Item>
                <Form.Item label="Client">
                    <Input.Search />
                </Form.Item>
                <Form.Item label="Adresse du Client">
                    <TextArea rows={6}/>
                </Form.Item>
                <Form.Item label="Date">
                    <DatePicker />
                </Form.Item>
                <Form.Item label="Date de livraison">
                    <DatePicker />
                </Form.Item>
                <Form.Item label="Date d'échéance">
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
            <Space>
                <Button type="primary" icon={<PrinterOutlined/>}>Imprimer</Button>
                <Button type="primary" icon={<SendOutlined/>}>Envoyer par e-mail</Button>
                <Button type="primary" icon={<CreditCardOutlined/>}>Paiement</Button>
            </Space>
        </Modal>
    );
}

function DetailTransaction(props) {

    const transaction = transactions.filter(record => record.numero === props.numeroTransaction)[0];

    if (transaction === null) {
        message.error('La transaction n\'existe pas');
        return(<></>);
    }

    var open = false;
    if (props.numeroTransaction !== null) {
        open = true;
    }

    var transactionType = null;
    var transactionNumero = null;
    var transactionType = null;
    var transactionClient = null;
    var transactionAdresseClient = null;
    var transactionDate = null;
    var transactionDateLivraison = null;
    var transactionDateEcheance = null;
    var transactionArticles = [];
    var transactionMontantHt = null;
    var transactionTauxTva = null;
    var transactionMontantTva = null;
    var transactionMontantTtc = null;

    if (transaction != null) {
        transactionType = transaction.type;
        transactionNumero = transaction.numero;
        transactionType = transaction.type;
        transactionClient = transaction.client;
        transactionAdresseClient = transaction.adresseclient;
        transactionDate = transaction.date;
        transactionDateLivraison = transaction.datelivraison;
        transactionDateEcheance = transaction.dateecheance;
        transactionArticles = transaction.items;
        transactionMontantHt = transaction.montantht;
        transactionTauxTva = transaction.tauxtva;
        transactionMontantTva = transaction.montanttva;
        transactionMontantTtc = transaction.montantttc;
    }

    return(
      <Modal centered={true} mask={true} title={<Space>{transactionType}{transactionNumero}</Space>}
            width={1024} open={open} closable={true} onCancel={() => props.setNumeroTransaction(null)}>
            <Form name="client" labelCol={{ span: 3 }}
                 wrapperCol={{ span: 21 }}
                 style={{ width: '100%' }}
                 initialValues={{ remember: true }}>
                <Form.Item label="Numéro">
                    <Input value={transactionNumero} disabled={true} />
                </Form.Item>
                <Form.Item label="Type">
                    <Select options={types} defaultValue={transactionType} disabled={true} />
                </Form.Item>
                <Form.Item label="Client">
                    <Input value={transactionClient} disabled={true} />
                </Form.Item>
                <Form.Item label="Adresse du Client">
                    <TextArea rows={6} value={transactionAdresseClient} disabled={true}/>
                </Form.Item>
                <Form.Item label="Date">
                    <DatePicker value={dayjs(transactionDate, 'DD-MM-YYYY')} format='DD-MM-YYYY' disabled={true} />
                </Form.Item>
                <Form.Item label="Date de livraison">
                    <DatePicker value={dayjs(transactionDateLivraison, 'DD-MM-YYYY')} format='DD-MM-YYYY' disabled={true} />
                </Form.Item>
                <Form.Item label="Date d'échéance">
                    <DatePicker value={dayjs(transactionDateEcheance, 'DD-MM-YYYY')} format='DD-MM-YYYY' disabled={true} />
                </Form.Item>
                <Form.Item label="Montant HT">
                    <InputNumber value={transactionMontantHt} addonAfter="€" disabled={true} />
                </Form.Item>
                <Form.Item label="TVA">
                    <InputNumber addonAfter="%" value={transactionTauxTva} disabled={true} />
                </Form.Item>
                <Form.Item label="Montant TVA">
                    <InputNumber addonAfter="€" value={transactionMontantTva} disabled={true} />
                </Form.Item>
                <Form.Item label="Montant TTC">
                    <InputNumber addonAfter="€" value={transactionMontantTtc} disabled={true} />
                </Form.Item>
                <Form.Item label="Articles">
                    <Table columns={articlesTable} dataSource={transactionArticles} />
                </Form.Item>
            </Form>
            <Space>
                <Button type="primary" icon={<PrinterOutlined/>}>Imprimer</Button>
                <Button type="primary" icon={<SendOutlined/>}>Envoyer par e-mail</Button>
                <Button type="primary" icon={<CreditCardOutlined/>}>Paiement</Button>
            </Space>
        </Modal>
    );
}

export default function Caisse(props) {
    const [ openNew, setOpenNew ] = useState(false);
    const [ numeroTransaction, setNumeroTransaction ] = useState(null);
    return(
      <>
      <NouvelleTransaction openNew={openNew} setOpenNew={setOpenNew} />
      <DetailTransaction numeroTransaction={numeroTransaction} setNumeroTransaction={setNumeroTransaction} />
      <Card title={<Space><DesktopOutlined/> Guichet</Space>}>
        <Button type="primary" icon={<PlusCircleOutlined/>} onClick={() => setOpenNew(true) }>Nouvelle transaction</Button>
        <Table columns={columns} dataSource={transactions} onRow={(record, rowIndex) => {
            return {
                onClick: (event) => { setNumeroTransaction(record.numero) }
            };
        }}/>
      </Card>
      </>
    );
}