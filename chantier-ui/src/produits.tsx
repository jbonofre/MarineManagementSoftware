import React, { useState, useEffect } from 'react';
import { Row, Col, Input, Select, Button, Space, Table, Rate, Card, Form, InputNumber, Spin, AutoComplete, Image, message } from 'antd';
import { PlusCircleOutlined, LeftCircleOutlined, ZoomInOutlined, StockOutlined, SaveOutlined, PauseCircleOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { productCategories } from './data.tsx';

const style: React.CSSProperties = { padding: '8px 0' };
const { Search, TextArea } = Input;

function Detail(props) {

    const [ produitForm ] = Form.useForm();
    const [ newImageForm ] = Form.useForm();
    const [ detail, setDetail ] = useState();
    const [ images, setImages ] = useState([]);

    if (props.produit !== 'new') {
        const fetchProduit = () => {
            fetch('./produits/' + props.produit)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Erreur (code ' + response.status + ')');
                }
                return response.json();
            })
            .then((data) => {
                setDetail(data);
                if (data.images) {
                    setImages(data.images);
                } else {
                    setImages([]);
                }
            })
            .catch((error) => {
                message.error('Une erreur est survenue: ' + error.message);
                console.error(error);
            })
        };

        useEffect(fetchProduit, []);

        if (!detail) {
            return(<Spin/>);
        }
    }

    const imagesRender = images.map((image) =>
      <Space><Image width={200} src={image} /><Button icon={<DeleteOutlined/>} onClick={() => {
        const newImages = images.filter((img) => img !== image);
        setImages(newImages);
      }} /></Space>
    );

    const onFinish = (values) => {
        let newProduit = values;
        newProduit.images = images;
        if (props.produit === 'new') {
            fetch('./produits', {
                method: 'POST',
                body: JSON.stringify(newProduit),
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
        } else {
            fetch('./produits/' + props.produit, {
                method: 'PUT',
                body: JSON.stringify(newProduit),
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
                message.info('Produit mis à jour');
                props.setProduit(null);
            })
        }
    };

    let title = <Space>Nouveau Produit</Space>;
    if (detail) {
        title = <Space><img width='200px' src={detail.image}/> {detail.nom}</Space>
    }

    const addImage = (values) => {
        const newImages = [...images,...[values.image]];
        setImages(newImages);
    };

    const onValuesChange = (changedValues, allValues) => {
        if (changedValues.prixVenteHT || changedValues.tva) {
            const prixVenteHT = produitForm.getFieldValue('prixVenteHT');
            const tva = produitForm.getFieldValue('tva');
            const montantTVA = Math.round(((prixVenteHT * (tva / 100)) + Number.EPSILON) * 100) / 100;
            produitForm.setFieldValue('montantTVA', montantTVA);
            const prixVenteTTC = Math.round(((prixVenteHT + montantTVA) + Number.EPSILON) * 100) / 100;
            produitForm.setFieldValue('prixVenteTTC', prixVenteTTC);
        }
        if (changedValues.prixVenteTTC) {
            const prixVenteTTC = produitForm.getFieldValue('prixVenteTTC');
            const tva = produitForm.getFieldValue('tva');
            const montantTVA = Math.round((((prixVenteTTC / (100 + tva)) * tva) + Number.EPSILON) * 100) / 100;
            produitForm.setFieldValue('montantTVA', montantTVA);
            const prixVenteHT = Math.round(((prixVenteTTC - montantTVA) + Number.EPSILON) * 100) / 100;
            produitForm.setFieldValue('prixVenteHT', prixVenteHT);
        }
    };

    return(
        <>
            <Button type="text" onClick={() => props.setProduit(null)} icon={<LeftCircleOutlined/>} />
            <Card title={title}>
                <Row gutter={[16,16]}>
                    <Col span={19}>
                        <Form name="produit" form={produitForm} labelCol={{ span: 8 }}
                            wrapperCol={{ span: 16 }}
                            style={{ width: '80%' }}
                            initialValues={detail}
                            onFinish={onFinish}
                            onValuesChange={onValuesChange}>
                            <Form.Item name="nom" label="Nom" rules={[{ required: true, message: 'Le nom est requis' }]}>
                                <Input allowClear={true} />
                            </Form.Item>
                            <Form.Item name="categorie" label="Catégorie" rules={[{ required: true, message: 'La catégorie est requise' }]}>
                                <Select options={productCategories} />
                            </Form.Item>
                            <Form.Item name="marque" label="Marque">
                                <AutoComplete allowClear={true} options={props.marques} />
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
                                <TextArea rows={6} allowClear={true} />
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
                                <InputNumber addonAfter="%"/>
                            </Form.Item>
                            <Form.Item name="tauxMarge" label="Taux de marge">
                                <InputNumber addonAfter="%"/>
                            </Form.Item>
                            <Form.Item name="tauxMarque" label="Taux de Marque">
                                <InputNumber addonAfter="%"/>
                            </Form.Item>
                            <Form.Item name="prixVenteHT" label="Prix de vente HT">
                                <InputNumber addonAfter="€" />
                            </Form.Item>
                            <Form.Item name="tva" label="TVA">
                                <InputNumber addonAfter="%" />
                            </Form.Item>
                            <Form.Item name="montantTVA" label="Montant de la TVA">
                                <InputNumber addonAfter="€" />
                            </Form.Item>
                            <Form.Item name="prixVenteTTC" label="Prix de vente TTC">
                                <InputNumber addonAfter="€" />
                            </Form.Item>
                        </Form>
                        <Form.Item label={null}>
                            <Space>
                                <Button type="primary" icon={<SaveOutlined/>} onClick={() => produitForm.submit()}>Enregistrer</Button>
                                <Button icon={<PauseCircleOutlined/>} onClick={() => produitForm.resetFields()}>Annuler</Button>
                            </Space>
                        </Form.Item>
                    </Col>
                    <Col span={5}>
                        <Space direction="vertical" align="center">
                            {imagesRender}
                            <Form form={newImageForm} component={false} onFinish={addImage}>
                            <Space.Compact>
                            <Form.Item name="image" rules={[{ required: true, message: 'L\'adresse de l\'image est requise' }]}>
                                <Input placeholder="Adresse de l'image" allowClear={true} />
                            </Form.Item>
                            <Button type="primary" icon={<PlusCircleOutlined/>} onClick={() => newImageForm.submit()} />
                            </Space.Compact>
                            </Form>
                        </Space>
                    </Col>
                </Row>
            </Card>
        </>
    );
}

function List(props) {

    const [ produits, setProduits ] = useState();

    const fetchProduits = () => {
        fetch('./produits')
        .then((response) => {
            if (!response.ok) {
                throw new Error('Erreur ' + response.status);
            }
            return response.json();
        })
        .then((data) => {
            setProduits(data);
            const marquesSet = [...new Set(data.map((produit) => produit.marque))];
            const marques = marquesSet.map((marque) => { return ({value: marque })});
            props.setMarques(marques);
        })
        .catch((error) => {
            message.error('Une erreur est survenue: ' + error.message);
            console.error(error);
        });
    };

    useEffect(fetchProduits, []);

    if (!produits) {
       return(<Spin/>);
    }

    const deleteProduit = (id) => {
        fetch('./produits/' + id, {
            method: 'DELETE',
        })
        .then((response) => {
            if (!response.ok) {
                 throw new Error('Erreur ' + response.status);
            }
        })
        .then((data) => {
            message.info('Produit supprimé');
            fetchProduits();
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
            render: (_,record) => (<Space><img width='30px' src={record.image} /> {record.nom}</Space>),
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
            render: (_,record) => ( <Rate defaultValue={record.evaluation} disabled={true} /> )
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
                                <Search placeholder="Recherche" enterButton style={{ width: 600 }}/>
                                <Button type="primary" icon={<StockOutlined/>} />
                                <Button type="primary" icon={<PlusCircleOutlined/>} onClick={() => props.setProduit('new')} />
                            </Space>
                        </div>
                    </Col>
                </Row>
                <Row gutter={[16,16]}>
                    <Col span={24}>
                        <Table columns={columns} dataSource={produits} />
                    </Col>
                </Row>
        </>
    );
}

export default function Produits() {

    const [ produit, setProduit ] = useState();
    const [ marques, setMarques ] = useState();

    if (produit) {
        return (<Detail produit={produit} setProduit={setProduit} marques={marques} />)
    } else {
        return (
            <List setProduit={setProduit} setMarques={setMarques} />
        );
    }
}