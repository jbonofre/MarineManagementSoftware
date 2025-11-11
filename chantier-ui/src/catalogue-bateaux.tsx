import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumb, Card, Table, Row, Col, Button, Modal, Form, Input, InputNumber, Select, Space, Popconfirm, message } from 'antd';
import { ReadOutlined, HomeOutlined, PlusCircleOutlined, LeftCircleOutlined, ZoomInOutlined, StockOutlined, SaveOutlined, PauseCircleOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import Icon from '@ant-design/icons';
import axios from 'axios';
import { ReactComponent as BoatOutlined } from './boat.svg';

const { Option } = Select;
const { Search } = Input;

interface BateauCatalogueEntity {
  id?: number;
  modele: string;
  marque: string;
  images: string[];
  type: string;
  longueurExterieure: number;
  longueurCoque: number;
  hauteur: number;
  largeur: number;
  tirantAir: number;
  tirantEau: number;
  poidsVide: number;
  poidsMoteurMax: number;
  chargeMax: number;
  longueurArbre: string;
  puissanceMax: string;
  reservoirEau: number;
  reservoirCarburant: number;
  nombrePassagersMax: number;
  categorieCe: string;
}

const defaultBateau: BateauCatalogueEntity = {
  modele: '',
  marque: '',
  images: [],
  type: '',
  longueurExterieure: 0,
  longueurCoque: 0,
  hauteur: 0,
  largeur: 0,
  tirantAir: 0,
  tirantEau: 0,
  poidsVide: 0,
  poidsMoteurMax: 0,
  chargeMax: 0,
  longueurArbre: '',
  puissanceMax: '',
  reservoirEau: 0,
  reservoirCarburant: 0,
  nombrePassagersMax: 0,
  categorieCe: '',
};

const CatalogueBateaux: React.FC = () => {
  const [bateaux, setBateaux] = useState<BateauCatalogueEntity[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [currentBateau, setCurrentBateau] = useState<BateauCatalogueEntity | null>(null);
  const [form] = Form.useForm();

  const fetchBateaux = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/catalogue/bateaux');
      setBateaux(res.data);
    } catch {
      message.error('Erreur lors du chargement des bateaux.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBateaux();
  }, []);

  const openModal = (bateau?: BateauCatalogueEntity) => {
    if (bateau) {
      setIsEdit(true);
      setCurrentBateau(bateau);
      form.setFieldsValue({ ...bateau, images: bateau.images?.join(', ') });
    } else {
      setIsEdit(false);
      setCurrentBateau(null);
      form.resetFields();
    }
    setModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const bateauToSave = {
        ...values,
        images: typeof values.images === 'string'
          ? values.images.split(',').map((img: string) => img.trim()).filter((img: string) => img)
          : [],
      };

      if (isEdit && currentBateau && currentBateau.id) {
        await axios.put(`/api/catalogue/bateaux/${currentBateau.id}`, bateauToSave);
        message.success('Bateau modifié avec succès');
      } else {
        await axios.post('/api/catalogue/bateaux', bateauToSave);
        message.success('Bateau ajouté avec succès');
      }
      setModalVisible(false);
      fetchBateaux();
      form.resetFields();
    } catch (err) {
      // Validation error already shown by Form.Item
    }
  };

  const handleDelete = async (id: number | undefined) => {
    if (!id) return;
    try {
      await axios.delete(`/api/catalogue/bateaux/${id}`);
      message.success('Bateau supprimé avec succès');
      fetchBateaux();
    } catch {
      message.error('Erreur lors de la suppression.');
    }
  };

  const columns = [
    {
      title: 'Modèle',
      dataIndex: 'modele',
    },
    {
      title: 'Marque',
      dataIndex: 'marque',
    },
    {
      title: 'Type',
      dataIndex: 'type',
    },
    {
      title: 'Longueur ext.',
      dataIndex: 'longueurExterieure',
      render: (val: number) => val + ' m',
    },
    {
      title: 'Largeur',
      dataIndex: 'largeur',
      render: (val: number) => val + ' m',
    },
    {
      title: 'Nombre passagers',
      dataIndex: 'nombrePassagersMax',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: BateauCatalogueEntity) => (
        <Space>
          <Button type="link" onClick={() => openModal(record)}>
            Modifier
          </Button>
          <Popconfirm
            title="Supprimer ce bateau?"
            onConfirm={() => handleDelete(record.id)}
            okText="Oui"
            cancelText="Non"
          >
            <Button type="link" danger>
              Supprimer
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Breadcrumb items={[
        { title: <Link to="/"><HomeOutlined /></Link> },
        { title: <ReadOutlined /> },
        { title: <Icon component={BoatOutlined} /> }
      ]} />
      <Card title="Bateaux">
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Space>
              <Search
                placeholder="Recherche"
                enterButton
                style={{ width: 600 }}
                onSearch={async (value) => {
                  setLoading(true);
                  try {
                    const response = await axios.get('/api/catalogue/bateaux/search', { params: { search: value } });
                    setBateaux(response.data);
                  } catch (error) {
                    message.error('Erreur lors de la recherche');
                  } finally {
                    setLoading(false);
                  }
                }}
              />
              <Button type="primary" onClick={() => openModal()} style={{ marginBottom: 16 }} />
            </Space>
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Table
              rowKey="id"
              columns={columns}
              dataSource={bateaux}
              loading={loading}
              pagination={{ pageSize: 10 }}
              bordered
            />
            <Modal
              title={isEdit ? 'Modifier un bateau' : 'Ajouter un bateau'}
              open={modalVisible}
              onOk={handleModalOk}
              onCancel={() => setModalVisible(false)}
              maskClosable={false}
              width={640}
              destroyOnClose
            >
              <Form
                form={form}
                layout="vertical"
                initialValues={defaultBateau}
              >
                <Form.Item name="modele" label="Modèle" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
                <Form.Item name="marque" label="Marque" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
                <Form.Item name="type" label="Type" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
                <Form.Item name="images" label="Images (url, séparées par une virgule)">
                  <Input />
                </Form.Item>
                <Form.Item name="longueurExterieure" label="Longueur extérieure (m)">
                  <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item name="longueurCoque" label="Longueur coque (m)">
                  <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item name="hauteur" label="Hauteur (m)">
                  <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item name="largeur" label="Largeur (m)">
                  <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item name="tirantAir" label="Tirant d’air (m)">
                  <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item name="tirantEau" label="Tirant d’eau (m)">
                  <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item name="poidsVide" label="Poids à vide (kg)">
                  <InputNumber min={0} step={1} style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item name="poidsMoteurMax" label="Poids moteur max (kg)">
                  <InputNumber min={0} step={1} style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item name="chargeMax" label="Charge max (kg)">
                  <InputNumber min={0} step={1} style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item name="longueurArbre" label="Longueur arbre">
                  <Input />
                </Form.Item>
                <Form.Item name="puissanceMax" label="Puissance max">
                  <Input />
                </Form.Item>
                <Form.Item name="reservoirEau" label="Réservoir eau (L)">
                  <InputNumber min={0} step={1} style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item name="reservoirCarburant" label="Réservoir carburant (L)">
                  <InputNumber min={0} step={1} style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item name="nombrePassagersMax" label="Nombre passagers max">
                  <InputNumber min={0} step={1} style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item name="categorieCe" label="Catégorie CE">
                  <Input />
                </Form.Item>
              </Form>
            </Modal>
          </Col>
        </Row>
      </Card>
    </>
  );
};

export default CatalogueBateaux;


