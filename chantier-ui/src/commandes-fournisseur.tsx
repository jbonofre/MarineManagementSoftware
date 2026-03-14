import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  InputNumber,
  Input,
  Select,
  Popconfirm,
  message,
  Space,
  Card,
  Row,
  Col,
  Spin,
  Tag,
  DatePicker,
  Divider,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusCircleOutlined,
  PlusOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";

const { Option } = Select;
const { TextArea } = Input;

type Fournisseur = {
  id: number;
  nom: string;
};

type Produit = {
  id: number;
  nom: string;
  marque?: string;
  categorie?: string;
};

type FournisseurProduit = {
  id: number;
  produit: Produit;
  prixAchatHT: number;
  tva: number;
  montantTVA: number;
  prixAchatTTC: number;
  portForfaitaire: number;
  portParUnite: number;
  nombreMinACommander: number;
};

type CommandeFournisseurLigne = {
  id?: number;
  produit?: Produit;
  quantite: number;
  prixUnitaireHT: number;
  tva: number;
  montantTVA: number;
  prixTotalHT: number;
  prixTotalTTC: number;
};

type CommandeFournisseurStatus = "BROUILLON" | "EN_ATTENTE" | "CONFIRMEE" | "EXPEDIEE" | "RECUE" | "ANNULEE";

type CommandeFournisseur = {
  id?: number;
  status: CommandeFournisseurStatus;
  fournisseur: Fournisseur;
  date?: string;
  dateReception?: string;
  reference?: string;
  referenceFournisseur?: string;
  lignes: CommandeFournisseurLigne[];
  montantHT: number;
  tva: number;
  montantTVA: number;
  montantTTC: number;
  portTotal: number;
  notes?: string;
  stockIncremented: boolean;
};

const statusColors: Record<CommandeFournisseurStatus, string> = {
  BROUILLON: "default",
  EN_ATTENTE: "orange",
  CONFIRMEE: "blue",
  EXPEDIEE: "cyan",
  RECUE: "green",
  ANNULEE: "red",
};

const statusLabels: Record<CommandeFournisseurStatus, string> = {
  BROUILLON: "Brouillon",
  EN_ATTENTE: "En attente",
  CONFIRMEE: "Confirmée",
  EXPEDIEE: "Expédiée",
  RECUE: "Reçue",
  ANNULEE: "Annulée",
};

const CommandesFournisseur = ({ fournisseurId }: { fournisseurId?: number }) => {
  const [commandes, setCommandes] = useState<CommandeFournisseur[]>([]);
  const [fournisseurProduits, setFournisseurProduits] = useState<FournisseurProduit[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<CommandeFournisseur | null>(null);
  const [lignes, setLignes] = useState<CommandeFournisseurLigne[]>([]);
  const [form] = Form.useForm();

  const fetchCommandes = async () => {
    setLoading(true);
    try {
      const url = fournisseurId
        ? `/commandes-fournisseur/search?fournisseurId=${fournisseurId}`
        : "/commandes-fournisseur";
      const { data } = await axios.get(url);
      setCommandes(data);
    } catch {
      message.error("Erreur lors du chargement des commandes fournisseur");
    } finally {
      setLoading(false);
    }
  };

  const fetchFournisseurProduits = async (fId: number) => {
    try {
      const { data } = await axios.get(`/fournisseur-produit/fournisseur/${fId}/produits`);
      setFournisseurProduits(data);
    } catch {
      message.error("Erreur lors du chargement des produits du fournisseur");
    }
  };

  useEffect(() => {
    fetchCommandes();
    if (fournisseurId) {
      fetchFournisseurProduits(fournisseurId);
    }
  }, [fournisseurId]);

  const recalcTotals = (currentLignes: CommandeFournisseurLigne[]) => {
    const montantHT = currentLignes.reduce((sum, l) => sum + l.prixTotalHT, 0);
    const montantTVA = currentLignes.reduce((sum, l) => sum + l.montantTVA, 0);
    const montantTTC = currentLignes.reduce((sum, l) => sum + l.prixTotalTTC, 0);
    const portTotal = form.getFieldValue("portTotal") || 0;
    form.setFieldsValue({
      montantHT: Math.round(montantHT * 100) / 100,
      montantTVA: Math.round(montantTVA * 100) / 100,
      montantTTC: Math.round((montantTTC + portTotal) * 100) / 100,
    });
  };

  const handleNew = () => {
    setEditing(null);
    setLignes([]);
    form.resetFields();
    form.setFieldsValue({
      status: "BROUILLON",
      portTotal: 0,
      montantHT: 0,
      montantTVA: 0,
      montantTTC: 0,
      tva: 20,
    });
    setModalVisible(true);
  };

  const handleEdit = (record: CommandeFournisseur) => {
    setEditing(record);
    setLignes(record.lignes || []);
    if (record.fournisseur?.id && !fournisseurId) {
      fetchFournisseurProduits(record.fournisseur.id);
    }
    form.setFieldsValue({
      ...record,
      date: record.date ? dayjs(record.date) : undefined,
      dateReception: record.dateReception ? dayjs(record.dateReception) : undefined,
    });
    setModalVisible(true);
  };

  const handleDelete = async (id?: number) => {
    if (!id) return;
    setLoading(true);
    try {
      await axios.delete(`/commandes-fournisseur/${id}`);
      message.success("Commande supprimée");
      fetchCommandes();
    } catch {
      message.error("Erreur lors de la suppression");
    } finally {
      setLoading(false);
    }
  };

  const handleAddLigne = () => {
    setLignes([...lignes, { quantite: 1, prixUnitaireHT: 0, tva: 20, montantTVA: 0, prixTotalHT: 0, prixTotalTTC: 0 }]);
  };

  const handleRemoveLigne = (index: number) => {
    const updated = lignes.filter((_, i) => i !== index);
    setLignes(updated);
    recalcTotals(updated);
  };

  const handleLigneChange = (index: number, field: string, value: any) => {
    const updated = [...lignes];
    const ligne = { ...updated[index], [field]: value };

    if (field === "produitId") {
      const fp = fournisseurProduits.find((fp) => fp.produit.id === value);
      if (fp) {
        ligne.produit = fp.produit;
        ligne.prixUnitaireHT = fp.prixAchatHT;
        ligne.tva = fp.tva;
      }
    }

    // Recalculate line totals
    ligne.prixTotalHT = Math.round(ligne.prixUnitaireHT * ligne.quantite * 100) / 100;
    ligne.montantTVA = Math.round(ligne.prixTotalHT * (ligne.tva / 100) * 100) / 100;
    ligne.prixTotalTTC = Math.round((ligne.prixTotalHT + ligne.montantTVA) * 100) / 100;

    updated[index] = ligne;
    setLignes(updated);
    recalcTotals(updated);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const body: any = {
        ...values,
        fournisseur: { id: fournisseurId || values.fournisseurId },
        date: values.date ? values.date.format("YYYY-MM-DD HH:mm:ss") : null,
        dateReception: values.dateReception ? values.dateReception.format("YYYY-MM-DD HH:mm:ss") : null,
        lignes: lignes.map((l) => ({
          produit: l.produit ? { id: l.produit.id } : null,
          quantite: l.quantite,
          prixUnitaireHT: l.prixUnitaireHT,
          tva: l.tva,
          montantTVA: l.montantTVA,
          prixTotalHT: l.prixTotalHT,
          prixTotalTTC: l.prixTotalTTC,
        })),
        stockIncremented: editing?.stockIncremented || false,
      };
      delete body.fournisseurId;

      setLoading(true);
      if (editing && editing.id) {
        await axios.put(`/commandes-fournisseur/${editing.id}`, body);
        message.success("Commande modifiée");
      } else {
        await axios.post("/commandes-fournisseur", body);
        message.success("Commande créée");
      }
      setModalVisible(false);
      fetchCommandes();
    } catch (e: any) {
      if (e.errorFields) return;
      message.error("Erreur lors de la sauvegarde");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: "Référence", dataIndex: "reference", key: "reference", sorter: (a: any, b: any) => (a.reference || "").localeCompare(b.reference || "") },
    ...(!fournisseurId
      ? [{
          title: "Fournisseur",
          dataIndex: ["fournisseur", "nom"],
          key: "fournisseur",
          sorter: (a: any, b: any) => (a.fournisseur?.nom || "").localeCompare(b.fournisseur?.nom || ""),
        }]
      : []),
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (val: string) => (val ? dayjs(val).format("DD/MM/YYYY") : "-"),
      sorter: (a: any, b: any) => (a.date || "").localeCompare(b.date || ""),
    },
    {
      title: "Statut",
      dataIndex: "status",
      key: "status",
      render: (val: CommandeFournisseurStatus) => (
        <Tag color={statusColors[val]}>{statusLabels[val] || val}</Tag>
      ),
      filters: Object.keys(statusLabels).map((k) => ({ text: statusLabels[k as CommandeFournisseurStatus], value: k })),
      onFilter: (value: any, record: any) => record.status === value,
    },
    {
      title: "Nb lignes",
      key: "nbLignes",
      render: (_: any, record: CommandeFournisseur) => record.lignes?.length || 0,
    },
    {
      title: "Montant TTC",
      dataIndex: "montantTTC",
      key: "montantTTC",
      render: (val: number) => `${(val || 0).toFixed(2)} €`,
      sorter: (a: any, b: any) => (a.montantTTC || 0) - (b.montantTTC || 0),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: CommandeFournisseur) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} size="small" />
          <Popconfirm title="Confirmer la suppression ?" onConfirm={() => handleDelete(record.id)}>
            <Button icon={<DeleteOutlined />} danger size="small" />
          </Popconfirm>
        </Space>
      ),
      width: 110,
    },
  ];

  return (
    <Card
      title="Commandes Fournisseur"
      extra={
        <Button type="primary" icon={<PlusCircleOutlined />} onClick={handleNew}>
          Nouvelle commande
        </Button>
      }
      style={fournisseurId ? { marginTop: 24 } : undefined}
    >
      <Spin spinning={loading}>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={commandes}
          bordered
          pagination={{ pageSize: 10 }}
        />
      </Spin>

      <Modal
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleModalOk}
        destroyOnHidden
        title={editing ? "Modifier la commande" : "Nouvelle commande fournisseur"}
        okText="Enregistrer"
        cancelText="Annuler"
        width={900}
        maskClosable={false}
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Statut"
                name="status"
                rules={[{ required: true, message: "Statut requis" }]}
              >
                <Select>
                  {Object.entries(statusLabels).map(([key, label]) => (
                    <Option key={key} value={key}>{label}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Référence" name="reference">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Réf. fournisseur" name="referenceFournisseur">
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Date" name="date">
                <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Date de réception" name="dateReception">
                <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">Lignes de commande</Divider>

          {lignes.map((ligne, index) => (
            <Row gutter={8} key={index} align="middle" style={{ marginBottom: 8 }}>
              <Col span={8}>
                <Select
                  showSearch
                  placeholder="Produit"
                  optionFilterProp="children"
                  filterOption={(input, option: any) =>
                    `${option.children}`.toLowerCase().includes(input.toLowerCase())
                  }
                  value={ligne.produit?.id}
                  onChange={(val) => handleLigneChange(index, "produitId", val)}
                  style={{ width: "100%" }}
                >
                  {fournisseurProduits.map((fp) => (
                    <Option key={fp.produit.id} value={fp.produit.id}>
                      {fp.produit.nom}{fp.produit.marque ? ` (${fp.produit.marque})` : ""}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col span={3}>
                <InputNumber
                  min={1}
                  placeholder="Qté"
                  value={ligne.quantite}
                  onChange={(val) => handleLigneChange(index, "quantite", val || 1)}
                  style={{ width: "100%" }}
                />
              </Col>
              <Col span={4}>
                <InputNumber
                  min={0}
                  placeholder="Prix unit. HT"
                  value={ligne.prixUnitaireHT}
                  onChange={(val) => handleLigneChange(index, "prixUnitaireHT", val || 0)}
                  style={{ width: "100%" }}
                  addonAfter="€"
                />
              </Col>
              <Col span={3}>
                <InputNumber
                  min={0}
                  max={100}
                  placeholder="TVA %"
                  value={ligne.tva}
                  onChange={(val) => handleLigneChange(index, "tva", val || 0)}
                  style={{ width: "100%" }}
                  addonAfter="%"
                />
              </Col>
              <Col span={4}>
                <InputNumber
                  value={ligne.prixTotalTTC}
                  disabled
                  style={{ width: "100%" }}
                  addonAfter="€ TTC"
                />
              </Col>
              <Col span={2}>
                <Button
                  icon={<MinusCircleOutlined />}
                  danger
                  onClick={() => handleRemoveLigne(index)}
                  size="small"
                />
              </Col>
            </Row>
          ))}

          <Button
            type="dashed"
            onClick={handleAddLigne}
            icon={<PlusOutlined />}
            style={{ width: "100%", marginBottom: 16 }}
          >
            Ajouter un produit
          </Button>

          <Divider orientation="left">Totaux</Divider>

          <Row gutter={16}>
            <Col span={6}>
              <Form.Item label="Port total (€)" name="portTotal">
                <InputNumber
                  min={0}
                  style={{ width: "100%" }}
                  onChange={() => {
                    setTimeout(() => recalcTotals(lignes));
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="Montant HT (€)" name="montantHT">
                <InputNumber disabled style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="Montant TVA (€)" name="montantTVA">
                <InputNumber disabled style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="Montant TTC (€)" name="montantTTC">
                <InputNumber disabled style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Notes" name="notes">
            <TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default CommandesFournisseur;
