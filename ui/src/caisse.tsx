import React, { useState } from 'react';
import { Card, Space, Button, Table, Modal } from 'antd';
import { DesktopOutlined, PlusCircleOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { demo } from './workspace.tsx';

const transactions = [
  {
    numero: 1,
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
            qte: 1,
            remise: 0,
            tva: 20,
            puttc: 24,
            montantttc: 24
        }
    ]
  }
];

const columns = [
  {
    title: 'Numéro',
    dataIndex: 'numero',
    key: 'numero'
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

function NouvelleTransaction(props) {
    return(
        <Modal centered={true} mask={true} title='Nouvelle Transaction' open={props.openNew} okText='Sauvegarder' closable={true}>
            <p>Nouvelle Transaction</p>
        </Modal>
    );
}

function DetailTransaction(props) {

    const transaction = transactions.filter(record => record.numero === props.numeroTransaction)[0];

    var open = false;
    if (props.numeroTransaction !== null) {
        open = true;
    }

    var transactionType = null;
    var transactionNumero = null;
    if (transaction != null) {
        transactionType = transaction.type;
        transactionNumero = transaction.numero;
    }

    return(
      <Modal centered={true} mask={true} title={<Space>{transactionType}{transactionNumero}</Space>}
            width={800} open={open} closable={true}>
        <p>Test</p>
      </Modal>
    );
}

export default function Caisse(props) {
    const [ openNew, setOpenNew ] = useState(false);
    const [ numeroTransaction, setNumeroTransaction ] = useState(null);
    return(
      <>
      <NouvelleTransaction openNew={openNew} />
      <DetailTransaction numeroTransaction={numeroTransaction} />
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