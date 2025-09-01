import React, { useState } from 'react';
import { Row, Col, Input, Select, Button, Space, Table, Rate, Card, Form, InputNumber } from 'antd';
import { PlusCircleOutlined, LeftCircleOutlined, ZoomInOutlined, StockOutlined } from '@ant-design/icons';

const style: React.CSSProperties = { padding: '8px 0' };
const { Search, TextArea } = Input;

function Detail(props) {

    const description = "Bougie LKAR7C-9\n\nRéférences Mercury: 8M0135348, 8M0204737, 8M0176616\n\nMercury 175, 200, 225Cv 3.4L V6\n\nMercury 225, 250, 300Cv 4.6L V8\n\nMercury 350 et 400Cv 5.7L V10\n";

    return(
        <>
            <a onClick={ () => props.setDetail(null) }><LeftCircleOutlined/> Retour au magasin</a>
            <Card title={ <Space><img width='30px' src='https://www.piecesbateaux.com/9338-medium_default/bougie-lkar7c-9-pour-mercury-v6-v8-v10.jpg'/> Bougie LKAR7C-9 pour MERCURY V6, V8, V10</Space> }>
               <Form name="detail" labelCol={{ span: 8 }}
                    wrapperCol={{ span: 16 }}
                    style={{ width: '80%' }}>
                <Form.Item label="Nom">
                    <Input value="Bougie LKAR7C-9 pour MERCURY V6, V8, V10" />
                </Form.Item>
                <Form.Item label="Marque">
                    <Input value="NGK" addonAfter={<ZoomInOutlined/>} />
                </Form.Item>
                <Form.Item label="Références">
                    <Select mode="tags" options={[
                        { value: '8M0135348', label: '8M0135348'},
                        { value: '8M0204737', label: '8M0204737'},
                        { value: '8M0176616', label: '8M0176616'}
                    ]} defaultValue={[ '8M0135348', '8M0204737', '8M0176616']} suffixIcon={<PlusCircleOutlined/>} />
                </Form.Item>
                <Form.Item label="Description">
                    <TextArea rows={6} value={description}/>
                </Form.Item>
                <Form.Item label="Stock">
                    <InputNumber value={24} addonAfter="Scanner" />
                </Form.Item>
                <Form.Item label="Stock Minimal">
                    <InputNumber value={3} addonAfter="Scanner" />
                </Form.Item>
                <Form.Item label="Emplacement">
                    <Input value="A-26 Bas" />
                </Form.Item>
                <Form.Item label="Prix catalogue">
                    <InputNumber value={12} addonAfter="€" />
                </Form.Item>
                <Form.Item label="Prix d'achat">
                    <InputNumber value={10} addonAfter="€" />
                </Form.Item>
                <Form.Item label="Frais">
                    <Input value="6" addonAfter="%"/>
                </Form.Item>
                <Form.Item label="Taux de marge">
                    <Input value="6" addonAfter="%"/>
                </Form.Item>
                <Form.Item label="Taux de Marque">
                    <Input value="6" addonAfter="%"/>
                </Form.Item>
                <Form.Item label="Prix de vente HT">
                    <InputNumber value={10} addonAfter="€" />
                </Form.Item>
                <Form.Item label="TVA">
                    <InputNumber value={20} addonAfter="%" />
                </Form.Item>
                <Form.Item label="Prix de vente TTC">
                    <InputNumber value={13} addonAfter="€" />
                </Form.Item>
               </Form>

            </Card>
        </>
    );
}

function List(props) {

    const columns = [
        {
            title: 'Nom',
            dataIndex: 'nom',
            key: 'nom',
            render: (text,record) => <a onClick={ () => { props.setDetail(record.key) }}><img width='30px' src={record.imageUrl}/>  {text}</a>,
        },
        {
            title: 'Marque',
            dataIndex: 'marque',
            key: 'marque'
        },
        {
            title: 'Référence',
            dataIndex: 'reference',
            key: 'reference'
        },
        {
            title: 'Catégorie',
            dataIndex: 'categorie',
            key: 'categorie'
        },
        {
            title: 'Evaluation',
            dataIndex: 'evaluation',
            key: 'evaluation',
            render: (_,record) => ( <Rate defaultValue={3.5}/> )
        },
        {
            title: 'Stock',
            dataIndex: 'stock',
            key: 'stock'
        },
        {
            title: '',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Button>Editer</Button>
                    <Button>Supprimer</Button>
                </Space>
            )
        }
    ]

    const data = [
        {
            key: '1',
            nom: 'Bougie LKAR7C-9 pour MERCURY V6, V8, V10',
            reference: 'LKAR7C-9--8M0176616',
            marque: 'NGK',
            categorie: 'Anodes & Bougies',
            imageUrl: 'https://www.piecesbateaux.com/9338-medium_default/bougie-lkar7c-9-pour-mercury-v6-v8-v10.jpg',
            stock: 24
        },
        {
            key: '2',
            nom: 'Filtre à Huile MERCURY 75 à 150Cv 4Temps EFI',
            reference: '877761Q01--877761K01',
            marque: 'QUICKSILVER',
            categorie: 'Pièces Hors Bord',
            imageUrl: 'https://www.piecesbateaux.com/3879-medium_default/filtre-a-huile-mercury-75-a-150cv-4t-efi.jpg',
            stock: 12
        },
        {
            key: '3',
            nom: 'Manutention',
            reference: 'Manutention 1',
            marque: 'MS Plaisance',
            categorie: 'Atelier',
            imageUrl: '',
            stock: 0
        }
    ];

    return (
        <>
                <Row gutter={[16,16]}>
                    <Col span={24}>
                        <div style={style}>
                            <Space>
                                <Search placeholder="Recherche" enterButton style={{ width: 350 }}/>
                                <Select mode="tags" placeholder="Catégories" style={{ width: 350 }} options={[
                                      { value: '', label: ''},
                                      { value: 'service', label: 'Service' },
                                      { value: 'moteurs', label: 'Moteurs' },
                                      { value: 'bateaux', label: 'Bateaux' },
                                      { value: 'remoraues', label: 'Remorques' },
                                      { value: 'piecehb', label: 'Pièces Hors Bord' },
                                      { value: 'pieceib', label: 'Piècecs Inboard' },
                                      { value: 'helices', label: 'Hélices' },
                                      { value: 'entretien', label: 'Entretien' },
                                      { value: 'anodesbougies', label: 'Anodes & Bougies' },
                                      { value: 'eccastillage', label: 'Accastillage & Confort à Bord' },
                                      { value: 'equipement', label: 'Equipement & Accessoires' },
                                      { value: 'securite', label: 'Navigation & Sécurité' },
                                      { value: 'sports', label: 'Pneumatiques & Sports Nautiques'},
                                    ]}/>
                                <Button type="primary" icon={<StockOutlined/>}>Mise à jour du stock</Button>
                                <Button type="primary" icon={<PlusCircleOutlined/>}>Ajouter Référence</Button>
                            </Space>
                        </div>
                    </Col>
                </Row>
                <Row gutter={[16,16]}>
                    <Col span={24}>
                        <Table<ReferenceType> columns={columns} dataSource={data} />
                    </Col>
                </Row>
        </>
    );
}

export default function Magasin() {

    const [ detail, setDetail ] = useState();

    if (detail) {
        return (
            <Detail detail={detail} setDetail={setDetail} />
        );
    } else {
        return (
            <List setDetail={setDetail} />
        );
    }
}