import React, { useState, useEffect } from 'react';
import { Row, Col, Input, Select, Button, Space, Table, Rate, Card, Form, InputNumber, Spin, message } from 'antd';
import { PlusCircleOutlined, LeftCircleOutlined, ZoomInOutlined, StockOutlined, SaveOutlined, PauseCircleOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { productCategories } from './data.tsx';

const style: React.CSSProperties = { padding: '8px 0' };
const { Search, TextArea } = Input;

function EditProduit(props) {

    return(
      <div>Hello {props.produit}</div>
    );
}

function NewProduit(props) {

    const [ newProduitForm ] = Form.useForm();

    const createProduit = (values) => {
        fetch('./catalogue', {
            method: 'POST',
            body: JSON.stringify(values),
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Erreur (code ' + response.status + ')');
            }
            return response.json();
        })
        .then((data) => {
            message.info('Produit sauvegardé');
            props.setProduit(null);
        })
        .catch((error) => {
            message.error('Une erreur est survenue: ' + error.message);
            console.error(error);
        })
    };

    return(
        <>
            <Button type="text" onClick={() => props.setProduit(null)} icon={<LeftCircleOutlined/>} />
            <Card title={ <Space>Nouveau produit</Space> }>
               <Form name="produit" form={newProduitForm} labelCol={{ span: 8 }}
                    wrapperCol={{ span: 16 }}
                    style={{ width: '80%' }}
                    onFinish={createProduit}>
                <Form.Item name="nom" label="Nom" rules={[{ required: true, message: 'Le nom est requis' }]}>
                    <Input allowClear={true} />
                </Form.Item>
                <Form.Item name="categorie" label="Catégorie" rules={[{ required: true, message: 'La catégorie est requise' }]}>
                    <Select options={productCategories} />
                </Form.Item>
                <Form.Item name="marque" label="Marque">
                    <Input allowClear={true} />
                </Form.Item>
                <Form.Item name="image" label="Adresse de l'image">
                    <Input allowClear={true} />
                </Form.Item>
                <Form.Item name="ref" label="Référence interne">
                    <Input allowClear={true} />
                </Form.Item>
                <Form.Item name="refs" label="Références">
                    <Select mode="tags" suffixIcon={<PlusCircleOutlined/>} />
                </Form.Item>
                <Form.Item name="description" label="Description">
                    <TextArea rows={6} />
                </Form.Item>
                <Form.Item name="evaluation" label="Note produit">
                    <Rate />
                </Form.Item>
                <Form.Item name="stock" label="Stock">
                    <InputNumber addonAfter="Scanner" />
                </Form.Item>
                <Form.Item name="stockMini" label="Stock Minimal">
                    <InputNumber addonAfter="Scanner" />
                </Form.Item>
                <Form.Item name="emplacement" label="Emplacement">
                    <Input allowClear={true} />
                </Form.Item>
                <Form.Item name="prixCatalogue" label="Prix catalogue">
                    <InputNumber addonAfter="€" />
                </Form.Item>
                <Form.Item name="prixAchat" label="Prix d'achat">
                    <InputNumber addonAfter="€" />
                </Form.Item>
                <Form.Item name="frais" label="Frais">
                    <Input addonAfter="%"/>
                </Form.Item>
                <Form.Item name="tauxMarge" label="Taux de marge">
                    <Input addonAfter="%"/>
                </Form.Item>
                <Form.Item name="tauxMarque" label="Taux de Marque">
                    <Input addonAfter="%"/>
                </Form.Item>
                <Form.Item name="prixVenteHT" label="Prix de vente HT">
                    <InputNumber addonAfter="€" />
                </Form.Item>
                <Form.Item name="TVA" label="TVA">
                    <InputNumber addonAfter="%" />
                </Form.Item>
                <Form.Item name="montantTVA" label="Montant de la TVA">
                    <InputNumber addonAfter="€" disabled={true} />
                </Form.Item>
                <Form.Item name="prixVenteTTC" label="Prix de vente TTC">
                    <InputNumber addonAfter="€" />
                </Form.Item>
               </Form>
               <Form.Item label={null}>
                    <Space>
                    <Button type="primary" icon={<SaveOutlined/>} onClick={() => newProduitForm.submit()}>Enregistrer</Button>
                    <Button icon={<PauseCircleOutlined/>} onClick={() => newProduitForm.resetFields()}>Annuler</Button>
                    </Space>
               </Form.Item>
            </Card>
        </>
    );
}

function List(props) {

    const [ catalogue, setCatalogue ] = useState();

    const fetchCatalog = () => {
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
    };

    useEffect(fetchCatalog, []);

    if (!catalogue) {
       return(<Spin/>);
    }

    const deleteProduit = (id) => {
        fetch('./catalogue/' + id, {
            method: 'DELETE',
        })
        .then((response) => {
            if (!response.ok) {
                 throw new Error('Erreur ' + response.status);
            }
        })
        .then((data) => {
            message.info('Produit supprimé');
            fetchCatalog();
        })
        .catch((error) => {
            message.error('Une erreur est survenue: ' + error.message);
            console.error(error);
        })
    };

    const columns = [
        {
            title: 'Nom',
            dataIndex: 'nom',
            key: 'nom',
            sorter: (a,b) => a.nom.localeCompare(b.nom),
        },
        {
            title: 'Marque',
            dataIndex: 'marque',
            key: 'marque',
            sorter: (a,b) => a.marque.localeCompare(b.marque),
        },
        {
            title: 'Référence',
            dataIndex: 'ref',
            key: 'ref'
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
            render: (_,record) => ( <Rate defaultValue={3.5} disabled={true} /> )
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
                    <Button icon={<EditOutlined/>} onClick={() => props.setProduit(record.id)} />
                    <Button icon={<DeleteOutlined/>} onClick={() => deleteProduit(record.id)} />
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
        if (produit === 'new') {
            return (<NewProduit produit={produit} setProduit={setProduit} />);
        } else {
            return(<EditProduit produit={produit} setProduit={setProduit} />);
        }
    } else {
        return (
            <List setProduit={setProduit} />
        );
    }
}