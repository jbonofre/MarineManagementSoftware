import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  InputNumber,
  Input,
  Popconfirm,
  message,
  Space,
  Select,
  Card,
  Row,
  Col,
  Spin,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusCircleOutlined,
  SaveOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import axios from "axios";

const { Option } = Select;

type Fournisseur = {
  id: number;
  nom: string;
}

type Bateau = {
  id: number;
  marque: string;
  modele: string;
};

type FournisseurBateau = {
  id?: number;
  fournisseur: Fournisseur;
  bateau: Bateau;
  prixAchatHT?: number;
  tva?: number;
  montantTVA?: number;
  prixAchatTTC?: number;
  portForfaitaire?: number;
  portParUnite?: number;
  nombreMinACommander?: number;
  notes?: string;
}

const defaultFournisseurBateau: Partial<FournisseurBateau> = {
  prixAchatHT: 0,
  tva: 20,
  montantTVA: 0,
  prixAchatTTC: 0,
  portForfaitaire: 0,
  portParUnite: 0,
  nombreMinACommander: 1,
  notes: "",
};

const FournisseurBateaux = ({ fournisseurId }: { fournisseurId: number }) => {
  const [bateauxAssocies, setBateauxAssocies] = useState<FournisseurBateau[]>([]);
  const [bateauxCatalogue, setBateauxCatalogue] = useState<Bateau[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<Partial<FournisseurBateau> | null>(null);
  const [form] = Form.useForm();

  // Fetch all association entries for this fournisseur
  const fetchAssocies = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`/fournisseur-bateau/fournisseur/${fournisseurId}`);
      setBateauxAssocies(data);
    } catch {
      message.error("Erreur lors du chargement des bateaux associés");
    } finally {
      setLoading(false);
    }
  };

  const fetchBateauxCatalogue = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/catalogue/bateaux");
      setBateauxCatalogue(data);
    } catch {
      message.error("Erreur lors du chargement du catalogue de bateaux");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (fournisseurId) {
      fetchAssocies();
      fetchBateauxCatalogue();
    }
  }, [fournisseurId]);

  // Add
  const handleNew = () => {
    setEditing({
      ...defaultFournisseurBateau,
      fournisseur: { id: fournisseurId, nom: "" }, // nom optional here
      bateau: undefined,
    });
    setModalVisible(true);
    setTimeout(() => form.resetFields());
  };

  // Edit
  const handleEdit = (record: FournisseurBateau) => {
    setEditing({ ...record, bateau: { ...record.bateau } });
    setModalVisible(true);
    setTimeout(() => form.setFieldsValue({ ...record, bateauId: record.bateau.id }));
  };

  // Delete
  const handleDelete = async (id: number | undefined) => {
    if (!id) return;
    setLoading(true);
    try {
      await axios.delete(`/fournisseur-bateau/${id}`);
      message.success("Supprimé avec succès");
      fetchAssocies();
    } catch {
      message.error("Erreur lors de la suppression");
    } finally {
      setLoading(false);
    }
  };

  // Create / Update
  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      let selectedBateau = bateauxCatalogue.find((b) => b.id === values.bateauId);
      let body: FournisseurBateau = {
        ...editing,
        ...values,
        bateau: selectedBateau!,
        fournisseur: { id: fournisseurId, nom: "" },
      };
      setLoading(true);

      if (editing && editing.id) {
        // update
        await axios.put(`/fournisseur-bateau/${editing.id}`, body);
        message.success("Modifié avec succès");
      } else {
        // create
        await axios.post("/fournisseur-bateau", body);
        message.success("Ajouté avec succès");
      }
      setModalVisible(false);
      fetchAssocies();
    } catch (e: any) {
      if (e.errorFields) return;
      message.error("Erreur lors de la sauvegarde");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Bateau",
      dataIndex: ["bateau", "id"],
      key: "bateau",
      render: (_: any, record: FournisseurBateau) =>
        <span>{record.bateau.marque} {record.bateau.modele}</span>
    },
    { title: "Prix Achat HT", dataIndex: "prixAchatHT", key: "prixAchatHT" },
    { title: "TVA (%)", dataIndex: "tva", key: "tva" },
    { title: "Montant TVA", dataIndex: "montantTVA", key: "montantTVA" },
    { title: "Prix Achat TTC", dataIndex: "prixAchatTTC", key: "prixAchatTTC" },
    { title: "Port forfaitaire", dataIndex: "portForfaitaire", key: "portForfaitaire" },
    { title: "Port/unité", dataIndex: "portParUnite", key: "portParUnite" },
    { title: "Qte min. commande", dataIndex: "nombreMinACommander", key: "nombreMinACommander" },
    { title: "Notes", dataIndex: "notes", key: "notes", render: val => <span style={{ whiteSpace: 'pre-wrap' }}>{val}</span> },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: FournisseurBateau) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} size="small" />
          <Popconfirm title="Confirmer la suppression ?" onConfirm={() => handleDelete(record.id)}>
            <Button icon={<DeleteOutlined />} danger size="small" />
          </Popconfirm>
        </Space>
      ),
      width: 110,
    }
  ];

  return (
    <Card
      title="Catalogue Bateaux du Fournisseur"
      extra={<Button type="primary" icon={<PlusCircleOutlined />} onClick={handleNew}>Associer un bateau</Button>}
      style={{ marginTop: 24 }}
    >
      <Spin spinning={loading}>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={bateauxAssocies}
          bordered
          pagination={{ pageSize: 10 }}
        />
      </Spin>

      <Modal
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleModalOk}
        destroyOnClose
        title={editing && editing.id ? "Modifier l'association" : "Associer un Bateau"}
        okText="Enregistrer"
        cancelText="Annuler"
        width={640}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={editing || defaultFournisseurBateau}
          onValuesChange={(changed, all) => {
            // Compute montantTVA et TTC dynamiquement
            if ("prixAchatHT" in changed || "tva" in changed) {
              let prixAchatHT = all.prixAchatHT ?? 0;
              let tva = all.tva ?? 20;
              let montantTVA = prixAchatHT * (tva / 100);
              let prixAchatTTC = prixAchatHT + montantTVA;
              form.setFieldsValue({ montantTVA, prixAchatTTC });
            }
          }}
        >
          <Form.Item
            label="Bateau catalogue"
            name="bateauId"
            rules={[{ required: true, message: "Sélectionnez un bateau du catalogue" }]}
          >
            <Select
              showSearch
              placeholder="Choisissez un bateau"
              optionFilterProp="children"
              filterOption={(input, option: any) =>
                `${option.children}`.toLowerCase().includes(input.toLowerCase())
              }
              disabled={!!(editing && editing.id)}
            >
              {bateauxCatalogue.map(b => (
                <Option key={b.id} value={b.id}>
                  {b.marque} {b.modele}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Row gutter={8}>
            <Col span={12}>
              <Form.Item
                label="Prix Achat HT (€)"
                name="prixAchatHT"
                rules={[{ required: true, message: "Prix achat HT requis" }]}
              >
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label="TVA (%)"
                name="tva"
                rules={[{ required: true }]}
                initialValue={20}
              >
                <InputNumber min={0} max={100} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="Montant TVA (€)" name="montantTVA">
                <InputNumber min={0} style={{ width: "100%" }} disabled />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={8}>
            <Col span={12}>
              <Form.Item label="Prix Achat TTC (€)" name="prixAchatTTC">
                <InputNumber min={0} style={{ width: "100%" }} disabled />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Qte min. à commander"
                name="nombreMinACommander"
                rules={[{ required: true, type: "number", message: "Quantité min. requise" }]}
              >
                <InputNumber min={1} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={8}>
            <Col span={12}>
              <Form.Item label="Port forfaitaire (€)" name="portForfaitaire">
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Port par unité (€)" name="portParUnite">
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="Notes" name="notes">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default FournisseurBateaux;
