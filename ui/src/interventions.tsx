import React, { useState } from 'react';
import { Row, Col, Space, Select, Button, Input, Table } from 'antd';
import type { TableProps } from 'antd';
import { PlusCircleOutlined, LeftCircleOutlined } from '@ant-design/icons';

const { Search } = Input;
const style: React.CSSProperties = { padding: '8px 0' };

interface InterventionType {
    key: string,
    numero: string,
    client: string,
    date: string,
    status: string
}

function Detail(props) {
    return(
        <>
        <a onClick={ () => props.setIntervention(null) }><LeftCircleOutlined/> Retour à la liste des intervention</a>
        <p>Detail {props.intervention}</p>
        </>
    );
}

function List(props) {
       const columns: TableProps<InterventionType>['columns'] = [
               {
                   title: 'Numéro',
                   dataIndex: 'numero',
                   key: 'numero',
                   render: (text,record) => <a onClick={ () => props.setIntervention(record.key) }>{text}</a>
               },
               {
                   title: 'Client',
                   dataIndex: 'client',
                   key: 'client'
               },
               {
                   title: 'Date',
                   dataIndex: 'date',
                   key: 'date'
               },
               {
                   title: 'Status',
                   dataIndex: 'status',
                   key: 'status'
               },
               {
                   title: '',
                   key: 'action',
                   render: (_, record) => (
                       <Space>
                           <Button>Voir</Button>
                           <Button>Supprimer</Button>
                       </Space>
                   )
               }
           ]

           const data: InterventionType[] = [
               {
                   key: '1',
                   numero: 'YB3E2DSDA',
                   client: 'Jean-Baptiste Onofré',
                   date: '22-06-2025',
                   status: 'Paiement'
               },
               {
                   key: '2',
                   numero: 'SEAXZ43423T0',
                   client: 'John Duff',
                   date: '25-06-2025',
                   status: 'Devis'
               }
           ]
       return(
           <>
               <Row gutter={[16,16]}>
                   <Col span={24}>
                       <div style={style}>
                           <Space>
                               <Search placeholder="Recherche" enterButton style={{ width: 350 }}/>
                               <Select mode="tags" placeholder="Status" style={{ width: 350 }} options={[
                                       { value: '', label: ''},
                                       { value: 'devis', label: 'Devis' },
                                       { value: 'reception', label: 'Réception' },
                                       { value: 'encours', label: 'En cours' },
                                       { value: 'paiement', label: 'Paiement' },
                                       { value: 'terminee', label: 'Terminée' }
                                   ]}/>
                               <Button type="primary" icon={<PlusCircleOutlined/>}>Créer une intervention</Button>
                           </Space>
                       </div>
                   </Col>
               </Row>
               <Row gutter={[16,16]}>
                   <Col span={24}>
                       <Table<InterventionType> columns={columns} dataSource={data} />
                   </Col>
               </Row>
           </>
       );
}

export default function Interventions() {

    const [ intervention, setIntervention ] = useState();

    if (intervention) {
        return(
            <Detail intervention={intervention} setIntervention={setIntervention} />
        );
    } else {
        return(
            <List setIntervention={setIntervention} />
        );
    }
}