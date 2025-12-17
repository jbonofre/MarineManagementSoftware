import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Space,
  message,
  Popconfirm,
  Row,
  Col,
  Select,
  Rate,
  Spin,
  Card,
} from "antd";
import { PlusCircleOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from "@ant-design/icons";
import axios from "axios";
import FournisseurRemorques from "./fournisseur-remorques.tsx";

const style: React.CSSProperties = { padding: '8px 0' };
const { Search } = Input;

// Defaults for a Remorque
const defaultRemorque = {
  modele: "",
  marque: "",
  description: "",
  evaluation: 0,
  ptac: 0,
  chargeAVide: 0,
  chargeUtile: 0,
  longueur: 0,
  largeur: 0,
  longueurMaxBateau: 0,
  largeurMaxBateau: 0,
  fleche: "",
  typeChassis: "",
  roues: "",
  equipement: "",
  stock: 0,
  stockAlerte: 0,
  emplacement: "",
  prixPublic: 0,
  frais: 0,
  tauxMarge: 0,
  tauxMarque: 0,
  prixVenteHT: 0,
  tva: 20,
  montantTVA: 0,
  prixVenteTTC: 0,
};

const typeChassisList = [
  { label: "Standard", value: "Standard" },
  { label: "Renforcé", value: "Renforcé" },
];

const rouesList = [
  { label: "Simple", value: "Simple" },
  { label: "Double", value: "Double" },
];

const RemorqueCatalogue: React.FC = () => {
  const [remorques, setRemorques] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [form] = Form.useForm();
  const [editingRemorque, setEditingRemorque] = useState<any>(null);

  // Fetch all remorques
  const fetchRemorques = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/catalogue/remorques");
      setRemorques(response.data || []);
    } catch (e) {
      message.error("Erreur lors du chargement des remorques");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRemorques();
  }, []);

  // Modal open for add/edit
  const openModal = (remorque: any = null) => {
    setEditingRemorque(remorque);
    if (remorque) {
      form.setFieldsValue(remorque);
    } else {
      form.setFieldsValue(defaultRemorque);
    }
    setModalVisible(true);
  };

  // Delete remorque
  const handleDelete = async (id: number) => {
    setLoading(true);
    try {
      await axios.delete(`/catalogue/remorques/${id}`);
      message.success("Remorque supprimée");
      fetchRemorques();
    } catch {
      message.error("Erreur lors de la suppression");
    } finally {
      setLoading(false);
    }
  };

  // Add/edit submit
  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      // Calcul TVA & prixVenteHT
      if (!values.tva) values.tva = 20;
      const prixVenteTTC = values.prixVenteTTC || 0;
      const tva = values.tva;
      const montantTVA = Math.round((((prixVenteTTC / (100 + tva)) * tva) + Number.EPSILON) * 100) / 100;
      values.montantTVA = montantTVA;
      values.prixVenteHT = Math.round(((prixVenteTTC - montantTVA) + Number.EPSILON) * 100) / 100;

      setLoading(true);
      if (editingRemorque && editingRemorque.id) {
        await axios.put(`/catalogue/remorques/${editingRemorque.id}`, { ...editingRemorque, ...values });
        message.success("Remorque modifiée");
      } else {
        await axios.post("/catalogue/remorques", values);
        message.success("Remorque ajoutée");
      }
      setModalVisible(false);
      fetchRemorques();
    } catch (e: any) {
      if (e?.errorFields) return; // Ant design form error
      message.error("Erreur lors de la sauvegarde");
    } finally {
      setLoading(false);
    }
  };

  // When change TTC/TVA
  const onValuesChange = (changed: any, all: any) => {
    if (typeof changed.prixVenteTTC !== "undefined" || typeof changed.tva !== "undefined") {
      const prixVenteTTC = all.prixVenteTTC ?? 0;
      const tva = all.tva ?? 20;
      const montantTVA = Math.round((((prixVenteTTC / (100 + tva)) * tva) + Number.EPSILON) * 100) / 100;
      form.setFieldsValue({ montantTVA });
      form.setFieldsValue({ prixVenteHT: Math.round(((prixVenteTTC - montantTVA) + Number.EPSILON) * 100) / 100 });
    }
  };

  // Search
  const handleSearch = async (value: string) => {
    setLoading(true);
    try {
      const response = await axios.get("/catalogue/remorques/search", {
        params: value
          ? {
              modele: value,
              marque: value,
              description: value,
            }
          : {},
      });
      setRemorques(response.data);
    } catch {
      message.error("Erreur lors de la recherche");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: "Modèle", dataIndex: "modele", key: "modele" },
    { title: "Marque", dataIndex: "marque", key: "marque" },
    {
      title: "Évaluation",
      dataIndex: "evaluation",
      key: "evaluation",
      render: (rate: number) => <Rate allowHalf disabled value={rate} />,
      width: 130,
    },
    { title: "Longueur", dataIndex: "longueur", key: "longueur" },
    { title: "Stock", dataIndex: "stock", key: "stock" },
    { title: "Prix TTC", dataIndex: "prixVenteTTC", key: "prixVenteTTC" },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => openModal(record)}
          />
          <Popconfirm
            title="Confirmer la suppression ?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      ),
      width: 100,
    },
  ];

  return (
    <>
    <Card title="Catalogue Remorques">
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <div style={style}>
          <Space>
            <Search
              allowClear
              placeholder="Rechercher"
              onSearch={handleSearch}
              style={{ width: 600 }} 
              enterButton={<SearchOutlined />}
            />
            <Button
              icon={<PlusCircleOutlined />}
              type="primary"
              onClick={() => openModal()}
            / >
            {loading && <Spin />}
          </Space>
          </div>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <Table
            rowKey="id"
            columns={columns}
            dataSource={remorques}
            loading={loading}
            pagination={{ pageSize: 10 }}
            bordered
          />
        </Col>
      </Row>
      <Modal
        open={modalVisible}
        title={editingRemorque ? "Modifier une remorque" : "Ajouter une remorque"}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        maskClosable={false}
        okText="Enregistrer"
        cancelText="Annuler"
        destroyOnClose
        width={1024}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={defaultRemorque}
          onValuesChange={onValuesChange}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="modele"
                label="Modèle"
                rules={[{ required: true, message: "Champ requis" }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="marque"
                label="Marque"
                rules={[{ required: true, message: "Champ requis" }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="evaluation" label="Évaluation">
            <Rate allowHalf />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="ptac" label="PTAC (kg)">
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="chargeAVide" label="Charge à vide (kg)">
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="chargeUtile" label="Charge utile (kg)">
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="longueur" label="Longueur (mm)">
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="largeur" label="Largeur (mm)">
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="longueurMaxBateau" label="Long. Max. Bateau (mm)">
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="largeurMaxBateau" label="Larg. Max. Bateau (mm)">
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="fleche" label="Flèche">
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="typeChassis" label="Type de châssis">
                <Select options={typeChassisList} allowClear />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="roues" label="Roues">
                <Select options={rouesList} allowClear />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="equipement" label="Équipement">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="emplacement" label="Emplacement">
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="stock" label="Stock">
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="stockAlerte" label="Stock alerte">
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="prixPublic" label="Prix public (€)">
                <InputNumber min={0} style={{ width: "100%" }} step={100} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="frais" label="Frais (€)">
                <InputNumber min={0} style={{ width: "100%" }} step={10} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="tauxMarge" label="Taux de marge (%)">
                <InputNumber min={0} max={100} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="tauxMarque" label="Taux de marque (%)">
                <InputNumber min={0} max={100} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="prixVenteHT" label="Prix Vente HT">
                <InputNumber min={0} style={{ width: "100%" }} step={100} disabled />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="tva" label="TVA (%)">
                <InputNumber min={0} max={100} style={{ width: "100%" }} step={1} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="montantTVA" label="Montant TVA">
                <InputNumber min={0} style={{ width: "100%" }} step={1} disabled />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="prixVenteTTC" label="Prix Vente TTC">
                <InputNumber min={0} style={{ width: "100%" }} step={100} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
        {editingRemorque && editingRemorque.id && (
          <FournisseurRemorques remorqueId={editingRemorque.id} />
        )}
      </Modal>
    </Card>
    </>
  );
};

export default RemorqueCatalogue;
