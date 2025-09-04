import React, { useState, useEffect } from 'react';
import { Row, Col, Input, Select, Button, Space, Table, Rate, Card, Form, InputNumber, Spin, message } from 'antd';
import { PlusCircleOutlined, LeftCircleOutlined, ZoomInOutlined, StockOutlined, SaveOutlined, PauseCircleOutlined } from '@ant-design/icons';
import { productCategories } from './data.tsx';

const style: React.CSSProperties = { padding: '8px 0' };
const { Search, TextArea } = Input;

function Produit(props) {

    const newProduct = {
      nom: 'Nouveau produit',
      image: '',
      images: [],
      references: [ 'test', 'test' ],
    };

    const [ detail, setDetail ] = useState(newProduct);

    if (props.produit && (props.produit !== 'new')) {
        setDetail({
           nom: 'Bougie LKAR7C-9 pour MERCURY V6, V8, V10',
           description: 'Bougie LKAR7C-9\n\nRéférences Mercury: 8M0135348, 8M0204737, 8M0176616\n\nMercury 175, 200, 225Cv 3.4L V6\n\nMercury 225, 250, 300Cv 4.6L V8\n\nMercury 350 et 400Cv 5.7L V10\n',
           marque: 'NGK',
           image: 'https://www.piecesbateaux.com/9338-medium_default/bougie-lkar7c-9-pour-mercury-v6-v8-v10.jpg',
           images: [],
           reference: '',
           references: [ '8M0135348', '8M0204737', '8M0176616' ],
           stock: 24,
           stockMini: 3,
           emplacement: 'A-26 bas',
           prixCatalogue: 12.0,
           prixAchat: 10.0,
           frais: 6.0,
           tauxMarge: 6.0,
           tauxMarque: 6.0,
           prixVenteHT: 10.0,
           tva: 20.0,
           montantTva: 0.0,
           prixVenteTTC: 13
        });
    }

    const [ produitForm ] = Form.useForm();

    return(
        <>
            <Button type="text" onClick={() => props.setProduit(null)} icon={<LeftCircleOutlined/>} />
            <Card title={ <Space><img width='30px' src={detail.image}/> {detail.nom}</Space> }>
               <Form name="produit" form={produitForm} labelCol={{ span: 8 }}
                    wrapperCol={{ span: 16 }}
                    style={{ width: '80%' }} initialValues={detail}>
                <Form.Item label="Nom">
                    <Input />
                </Form.Item>
                <Form.Item label="Marque">
                    <Input addonAfter={<ZoomInOutlined/>} />
                </Form.Item>
                <Form.Item label="Références">
                    <Select mode="tags" defaultValue={detail.references} suffixIcon={<PlusCircleOutlined/>} />
                </Form.Item>
                <Form.Item label="Description">
                    <TextArea rows={6} />
                </Form.Item>
                <Form.Item label="Stock">
                    <InputNumber addonAfter="Scanner" />
                </Form.Item>
                <Form.Item label="Stock Minimal">
                    <InputNumber addonAfter="Scanner" />
                </Form.Item>
                <Form.Item label="Emplacement">
                    <Input />
                </Form.Item>
                <Form.Item label="Prix catalogue">
                    <InputNumber addonAfter="€" />
                </Form.Item>
                <Form.Item label="Prix d'achat">
                    <InputNumber addonAfter="€" />
                </Form.Item>
                <Form.Item label="Frais">
                    <Input addonAfter="%"/>
                </Form.Item>
                <Form.Item label="Taux de marge">
                    <Input addonAfter="%"/>
                </Form.Item>
                <Form.Item label="Taux de Marque">
                    <Input addonAfter="%"/>
                </Form.Item>
                <Form.Item label="Prix de vente HT">
                    <InputNumber addonAfter="€" />
                </Form.Item>
                <Form.Item label="TVA">
                    <InputNumber addonAfter="%" />
                </Form.Item>
                <Form.Item label="Prix de vente TTC">
                    <InputNumber addonAfter="€" />
                </Form.Item>
               </Form>
               <Form.Item label={null}>
                    <Space>
                    <Button type="primary" icon={<SaveOutlined/>}>Enregistrer</Button>
                    <Button icon={<PauseCircleOutlined/>}>Annuler</Button>
                    </Space>
               </Form.Item>
            </Card>
        </>
    );
}

function List(props) {

    const [ catalogue, setCatalogue ] = useState();

    useEffect(() => {
        fetch('./catalogue')
        .then((response) => {
            if (!response.ok) {
                throw new Error('Erreur ' + response.status);
            }
            return response.json();
        })
        .then((data) => setCatalogue(data))
        .catch((error) => {
            message.error('Une erreur est survenue: ' + error.message);
            console.error(error);
        });
    }, []);

    if (!catalogue) {
       return(<Spin/>);
    }

    const columns = [
        {
            title: 'Nom',
            dataIndex: 'nom',
            key: 'nom',
            sorter: (a,b) => a.nom.localeCompare(b.nom),
            render: (text,record) => <a onClick={ () => { props.setProduit(record.id) }}><img width='30px' src={record.image}/>  {text}</a>,
        },
        {
            title: 'Marque',
            dataIndex: 'marque',
            key: 'marque',
            sorter: (a,b) => a.marque.localeCompare(b.marque),
        },
        {
            title: 'Référence',
            dataIndex: 'reference',
            key: 'reference'
        },
        {
            title: 'Catégorie',
            dataIndex: 'categorie',
            key: 'categorie',
            filters: productCategories,
            onFilter: (value, record) => record.categorie === value,
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
                    <Button icon={<EditOutlined/>} />
                    <Button icon={<DeleteOutlined/>} />
                </Space>
            )
        }
    ]

    return (
        <>
                <Row gutter={[16,16]}>
                    <Col span={24}>
                        <div style={style}>
                            <Space>
                                <Search placeholder="Recherche" enterButton style={{ width: 350 }}/>
                                <Select mode="tags" placeholder="Catégories" style={{ width: 350 }} options={productCategories} />
                                <Button type="primary" icon={<StockOutlined/>} />
                                <Button type="primary" icon={<PlusCircleOutlined/>} onClick={() => props.setProduit('new')} />
                            </Space>
                        </div>
                    </Col>
                </Row>
                <Row gutter={[16,16]}>
                    <Col span={24}>
                        <Table columns={columns} dataSource={catalogue} />
                    </Col>
                </Row>
        </>
    );
}

export default function Catalogue() {

    const [ produit, setProduit ] = useState();

    if (produit) {
        return (
            <Produit produit={produit} setProduit={setProduit} />
        );
    } else {
        return (
            <List setProduit={setProduit} />
        );
    }
}