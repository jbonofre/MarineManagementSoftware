import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  AutoComplete,
  Image,
  Space,
  message,
  Popconfirm,
  Card,
  Spin,
  Rate,
  Row,
  Col,
  DatePicker,
  Checkbox,
} from "antd";
import {
  PlusCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import axios from "axios";
import ImageUpload from './ImageUpload.tsx';
import dayjs from "dayjs";

const { Option } = Select;
const { Search } = Input;

// Minimal typing for MoteurClient
interface MoteurClient {
  id?: number;
  images?: string[];
  numeroSerie?: string;
  numeroClef?: string;
  dateMeS?: string;
  dateAchat?: string;
  dateFinDeGuarantie?: string;
  proprietaire?: any;
  modele?: any;
}

const defaultMoteur: MoteurClient = {
  images: [],
  numeroSerie: "",
  numeroClef: "",
  dateMeS: null,
  dateAchat: null,
  dateFinDeGuarantie: null,
  proprietaire: null,
  modele: null,
};

interface ClientsMoteursProps {
  clientId?: number;
}

const ClientsMoteurs: React.FC<ClientsMoteursProps> = ({ clientId }) => {
  const [moteurs, setMoteurs] = useState<MoteurClient[]>([]);
  const [catalogueMoteurs, setCatalogueMoteurs] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<MoteurClient | null>(null);
  const [form] = Form.useForm();
  const [catalogueModalVisible, setCatalogueModalVisible] = useState(false);
  const [catalogueForm] = Form.useForm();
  const [clientModalVisible, setClientModalVisible] = useState(false);
  const [clientForm] = Form.useForm();

  const fetchMoteurs = async (q = "") => {
    setLoading(true);
    try {
      let url = "/moteurs";
      if (q && q.trim() !== "") {
        url = `/moteurs/search?q=${encodeURIComponent(q)}`;
      }
      const res = await axios.get(url);
      let moteursData = res.data;
      // Filter by clientId if provided
      if (clientId) {
        moteursData = moteursData.filter((moteur: MoteurClient) =>
          moteur.proprietaire && ((moteur.proprietaire.id || moteur.proprietaire) === clientId)
        );
      }
      setMoteurs(moteursData);
    } catch {
      message.error("Erreur lors du chargement des moteurs");
    }
    setLoading(false);
  };

  const fetchCatalogueMoteurs = async () => {
    try {
      const res = await axios.get("/catalogue/moteurs");
      setCatalogueMoteurs(res.data);
    } catch {
      message.error("Erreur lors du chargement du catalogue de moteurs");
      setCatalogueMoteurs([]);
    }
  };

  const fetchClients = async () => {
    try {
      const res = await axios.get("/clients");
      setClients(res.data);
    } catch {
      setClients([]);
    }
  };

  useEffect(() => {
    fetchMoteurs();
    fetchCatalogueMoteurs();
    fetchClients();
    // eslint-disable-next-line
  }, [clientId]);

  const handleAdd = () => {
    setEditing(null);
    form.resetFields();
    if (clientId) {
      form.setFieldsValue({ proprietaireId: clientId });
    }
    setModalVisible(true);
  };

  const handleEdit = (record: MoteurClient) => {
    setEditing(record);
    form.setFieldsValue({
      ...record,
      dateMeS: record.dateMeS ? dayjs(record.dateMeS) : null,
      dateAchat: record.dateAchat ? dayjs(record.dateAchat) : null,
      dateFinDeGuarantie: record.dateFinDeGuarantie ? dayjs(record.dateFinDeGuarantie) : null,
      modeleId: record.modele?.id || undefined,
      proprietaireId: record.proprietaire?.id || record.proprietaire || undefined,
      images: record.images ?? [],
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: number | undefined) => {
    if (!id) return;
    setLoading(true);
    try {
      await axios.delete(`/moteurs/${id}`);
      message.success("Moteur supprimé");
      fetchMoteurs();
    } catch {
      message.error("Erreur lors de la suppression");
    }
    setLoading(false);
  };

  const handleClientAdd = async () => {
    try {
      const values = await clientForm.validateFields();
      const res = await axios.post("/clients", values);
      message.success("Client ajouté");
      setClientModalVisible(false);
      clientForm.resetFields();
      await fetchClients();
      form.setFieldsValue({ proprietaireId: res.data.id });
    } catch (e: any) {
      if (e && e.response) {
        message.error("Erreur lors de l'ajout du client");
      }
    }
  };

  const handleCatalogueAdd = async () => {
    try {
      const values = await catalogueForm.validateFields();
      const res = await axios.post("/catalogue/moteurs", values);
      message.success("Moteur catalogue ajouté");
      setCatalogueModalVisible(false);
      catalogueForm.resetFields();
      await fetchCatalogueMoteurs();
      form.setFieldsValue({ modeleId: res.data.id });
    } catch (e: any) {
      if (e && e.response) {
        message.error("Erreur lors de l'ajout du moteur catalogue");
      }
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      const { modeleId, proprietaireId, dateMeS, dateAchat, dateFinDeGuarantie, ...restValues } = values;
      const payload = {
        ...restValues,
        dateMeS: dateMeS ? dateMeS.format("YYYY-MM-DD") : null,
        dateAchat: dateAchat ? dateAchat.format("YYYY-MM-DD") : null,
        dateFinDeGuarantie: dateFinDeGuarantie ? dateFinDeGuarantie.format("YYYY-MM-DD") : null,
        modele: modeleId ? { id: modeleId } : null,
        proprietaire: proprietaireId ? { id: proprietaireId } : null,
      };
      if (editing && editing.id) {
        // update
        const res = await axios.put(`/moteurs/${editing.id}`, payload);
        message.success("Moteur modifié");
        const updated = res.data;
        setEditing(updated);
        form.setFieldsValue({
          ...updated,
          dateMeS: updated.dateMeS ? dayjs(updated.dateMeS) : null,
          dateAchat: updated.dateAchat ? dayjs(updated.dateAchat) : null,
          dateFinDeGuarantie: updated.dateFinDeGuarantie ? dayjs(updated.dateFinDeGuarantie) : null,
          modeleId: updated.modele?.id || undefined,
          proprietaireId: updated.proprietaire?.id || undefined,
          images: updated.images ?? [],
        });
      } else {
        // create
        const res = await axios.post("/moteurs", payload);
        message.success("Moteur ajouté");
        const created = res.data;
        setEditing(created);
        form.setFieldsValue({
          ...created,
          dateMeS: created.dateMeS ? dayjs(created.dateMeS) : null,
          dateAchat: created.dateAchat ? dayjs(created.dateAchat) : null,
          dateFinDeGuarantie: created.dateFinDeGuarantie ? dayjs(created.dateFinDeGuarantie) : null,
          modeleId: created.modele?.id || undefined,
          proprietaireId: created.proprietaire?.id || undefined,
          images: created.images ?? [],
        });
      }
      fetchMoteurs();
    } catch (e: any) {
      if (e && e.response) {
        message.error("Erreur lors de la sauvegarde");
      }
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: "Numéro de série", dataIndex: "numeroSerie", key: "numeroSerie", sorter: (a, b) => a.numeroSerie.localeCompare(b.numeroSerie) },
    {
      title: "Propriétaire",
      dataIndex: "proprietaire",
      key: "proprietaire",
      render: (proprietaire: any) => proprietaire ? `${proprietaire.prenom ?? ""} ${proprietaire.nom ?? ""}` : "",
      filters: clients.map((client: any) => ({ text: `${client.prenom} ${client.nom}`, value: client.id })),
      onFilter: (value, record) => record.proprietaire?.id === value,
    },
    {
      title: "Modèle",
      dataIndex: "modele",
      key: "modele",
      render: (modele: any) =>
        modele
          ? [
              modele.marque,
              modele.modele,
              modele.annee && `(${modele.annee})`
            ].filter(Boolean).join(" ")
          : "",
      filters: catalogueMoteurs.map((modele) => ({ text: `${modele.marque} ${modele.modele} ${modele.annee ? `(${modele.annee})` : ""}`, value: modele.id })),
      onFilter: (value, record) => record.modele?.id === value,
    },
    {
      title: "Date achat",
      dataIndex: "dateAchat",
      key: "dateAchat",
      sorter: (a, b) => a.dateAchat.localeCompare(b.dateAchat),
    },
    {
      title: "Date fin garantie",
      dataIndex: "dateFinDeGuarantie",
      key: "dateFinDeGuarantie",
      sorter: (a, b) => a.dateFinDeGuarantie.localeCompare(b.dateFinDeGuarantie),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: MoteurClient) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)} />
          <Popconfirm title="Supprimer ce moteur ?" onConfirm={() => handleDelete(record.id)}>
            <Button icon={<DeleteOutlined />} danger size="small" />
          </Popconfirm>
        </Space>
      ),
      width: 120,
    },
  ];

  return (
    <Card title="Moteurs Clients">
      <Space style={{ marginBottom: 16 }}>
        <Search
          placeholder="Recherche"
          enterButton
          allowClear={true}
          style={{ width: 600 }}
          onSearch={fetchMoteurs}
        />
        <Button type="primary" icon={<PlusCircleOutlined />} onClick={handleAdd} />
      </Space>
      <Spin spinning={loading}>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={moteurs}
          bordered
          pagination={{ pageSize: 10 }}
        />
      </Spin>
      <Modal
        open={modalVisible}
        title={editing ? "Modifier le moteur" : "Ajouter un moteur"}
        onCancel={() => setModalVisible(false)}
        onOk={handleModalOk}
        okText="Enregistrer"
        cancelText="Annuler"
        destroyOnHidden
        width={1024}
      >
        <Form layout="vertical" form={form} initialValues={defaultMoteur}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Numéro de série" name="numeroSerie" rules={[{ required: true, message: "Numéro de série requis" }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Numéro de clef" name="numeroClef">
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Date MeS" name="dateMeS">
                <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Date achat" name="dateAchat">
                <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="Date fin garantie" name="dateFinDeGuarantie">
            <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label="Modèle catalogue" style={{ marginBottom: 0 }}>
            <Space.Compact style={{ width: "100%" }}>
              <Form.Item name="modeleId" noStyle>
                <Select
                  showSearch
                  placeholder="Associer à un modèle du catalogue"
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    `${option?.children ?? ""}`.toLowerCase().includes(input.toLowerCase())
                  }
                  allowClear
                  style={{ width: "100%" }}
                >
                  {catalogueMoteurs.map((modele) => (
                    <Option key={modele.id} value={modele.id}>
                      {modele.marque} {modele.modele} {modele.annee ? `(${modele.annee})` : ''}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Button
                icon={<PlusCircleOutlined />}
                onClick={() => {
                  catalogueForm.resetFields();
                  setCatalogueModalVisible(true);
                }}
              />
            </Space.Compact>
          </Form.Item>
          <Form.Item label="Propriétaire" style={{ marginBottom: 0 }}>
            <Space.Compact style={{ width: "100%" }}>
              <Form.Item name="proprietaireId" noStyle>
                <Select
                  showSearch
                  placeholder="Sélectionner le client propriétaire"
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    `${option?.children ?? ""}`.toLowerCase().includes(input.toLowerCase())
                  }
                  allowClear
                  style={{ width: "100%" }}
                >
                  {clients.map((client: any) => (
                    <Option key={client.id} value={client.id}>
                      {client.prenom} {client.nom}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Button
                icon={<PlusCircleOutlined />}
                onClick={() => {
                  clientForm.resetFields();
                  setClientModalVisible(true);
                }}
              />
            </Space.Compact>
          </Form.Item>
          <Form.Item label="Images" name="images">
            <ImageUpload />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        open={catalogueModalVisible}
        title="Ajouter un moteur catalogue"
        onCancel={() => setCatalogueModalVisible(false)}
        onOk={handleCatalogueAdd}
        okText="Ajouter"
        cancelText="Annuler"
        destroyOnHidden
        width={1024}
      >
        <Form
          layout="vertical"
          form={catalogueForm}
          initialValues={{ tva: 20 }}
          onValuesChange={(changedValues) => {
            const CV_TO_KW_FACTOR = 0.735499;
            const roundPower = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;
            if (Object.prototype.hasOwnProperty.call(changedValues, 'puissanceCv')
              && !Object.prototype.hasOwnProperty.call(changedValues, 'puissanceKw')) {
              const puissanceCv = Number(catalogueForm.getFieldValue('puissanceCv')) || 0;
              catalogueForm.setFieldValue('puissanceKw', roundPower(puissanceCv * CV_TO_KW_FACTOR));
            }
            if (Object.prototype.hasOwnProperty.call(changedValues, 'puissanceKw')
              && !Object.prototype.hasOwnProperty.call(changedValues, 'puissanceCv')) {
              const puissanceKw = Number(catalogueForm.getFieldValue('puissanceKw')) || 0;
              catalogueForm.setFieldValue('puissanceCv', roundPower(puissanceKw / CV_TO_KW_FACTOR));
            }
            if (changedValues.prixVenteHT || changedValues.tva) {
              const prixVenteHT = catalogueForm.getFieldValue('prixVenteHT');
              const tva = catalogueForm.getFieldValue('tva');
              const montantTVA = Math.round(((prixVenteHT * (tva / 100)) + Number.EPSILON) * 100) / 100;
              catalogueForm.setFieldValue('montantTVA', montantTVA);
              const prixVenteTTC = Math.round(((prixVenteHT + montantTVA) + Number.EPSILON) * 100) / 100;
              catalogueForm.setFieldValue('prixVenteTTC', prixVenteTTC);
            }
            if (changedValues.prixVenteTTC) {
              const prixVenteTTC = catalogueForm.getFieldValue('prixVenteTTC');
              const tva = catalogueForm.getFieldValue('tva');
              const montantTVA = Math.round((((prixVenteTTC / (100 + tva)) * tva) + Number.EPSILON) * 100) / 100;
              catalogueForm.setFieldValue('montantTVA', montantTVA);
              const prixVenteHT = Math.round(((prixVenteTTC - montantTVA) + Number.EPSILON) * 100) / 100;
              catalogueForm.setFieldValue('prixVenteHT', prixVenteHT);
            }
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="marque" label="Marque" rules={[{ required: true, message: "La marque est requise" }]}>
                <AutoComplete
                  allowClear
                  options={catalogueMoteurs.map((m) => ({ value: m.marque })).filter((v, i, a) => a.findIndex((t) => t.value === v.value) === i)}
                  placeholder="Saisir ou sélectionner une marque"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="modele" label="Modèle" rules={[{ required: true, message: "Le modèle est requis" }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="type" label="Type" rules={[{ required: true, message: "Le type est requis" }]}>
                <Select>
                  <Select.Option value="Hors-bord">Hors-bord</Select.Option>
                  <Select.Option value="In-bord">In-bord</Select.Option>
                  <Select.Option value="Electrique">Electrique</Select.Option>
                  <Select.Option value="Diesel">Diesel</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="evaluation" label="Évaluation">
                <Rate allowHalf />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="images" label="Images">
            <ImageUpload />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="puissanceCv" label="Puissance">
                <InputNumber min={0} step={0.1} style={{ width: '100%' }} addonAfter="cv" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="puissanceKw" label="Puissance">
                <InputNumber min={0} step={0.1} style={{ width: '100%' }} addonAfter="kW" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="longueurArbre" label="Longueur arbre">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="arbre" label="Arbre">
                <InputNumber min={0} step={0.1} style={{ width: '100%' }} addonAfter="cm" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="demarrage" label="Démarrage">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="direction" label="Direction">
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="cylindres" label="Nombre de cylindres">
                <InputNumber min={0} step={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="cylindree" label="Cylindrée">
                <InputNumber min={0} step={1} style={{ width: '100%' }} addonAfter="cm3" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="regime" label="Régime Max">
                <InputNumber min={0} step={1} style={{ width: '100%' }} addonAfter="tr/min" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="huileRecommandee" label="Huile recommandée">
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="stock" label="Stock">
                <InputNumber min={0} step={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="stockAlerte" label="Stock alerte">
                <InputNumber min={0} step={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="emplacement" label="Emplacement">
            <Input />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="prixPublic" label="Prix public">
                <InputNumber min={0} step={0.01} style={{ width: '100%' }} addonAfter="€" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="frais" label="Frais">
                <InputNumber min={0} step={0.01} style={{ width: '100%' }} addonAfter="€" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="tauxMarge" label="Taux de marge">
                <InputNumber min={0} step={0.01} style={{ width: '100%' }} addonAfter="%" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="tauxMarque" label="Taux de marque">
                <InputNumber min={0} step={0.01} style={{ width: '100%' }} addonAfter="%" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="prixVenteHT" label="Prix de vente HT">
                <InputNumber min={0} step={0.01} style={{ width: '100%' }} addonAfter="€" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="tva" label="TVA">
                <InputNumber min={0} step={0.01} style={{ width: '100%' }} addonAfter="%" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="montantTVA" label="Montant TVA">
                <InputNumber min={0} step={0.01} style={{ width: '100%' }} addonAfter="€" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="prixVenteTTC" label="Prix de vente TTC">
                <InputNumber min={0} step={0.01} style={{ width: '100%' }} addonAfter="€" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
      <Modal
        open={clientModalVisible}
        title="Ajouter un client"
        onCancel={() => setClientModalVisible(false)}
        onOk={handleClientAdd}
        okText="Ajouter"
        cancelText="Annuler"
        destroyOnHidden
        width={1024}
      >
        <Form layout="vertical" form={clientForm} initialValues={{ type: "PARTICULIER", consentement: false, remise: 0 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Type" name="type" rules={[{ required: true }]}>
                <Select>
                  <Select.Option value="PARTICULIER">Particulier</Select.Option>
                  <Select.Option value="PROFESSIONNEL">Professionnel</Select.Option>
                  <Select.Option value="PROFESSIONNEL_MER">Professionnel de la Mer</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Form.Item noStyle shouldUpdate={(prev, cur) => prev.type !== cur.type}>
              {({ getFieldValue }) =>
                getFieldValue("type") === "PARTICULIER" && (
                  <Col span={12}>
                    <Form.Item label="Prénom" name="prenom">
                      <Input />
                    </Form.Item>
                  </Col>
                )
              }
            </Form.Item>
            <Col span={12}>
              <Form.Item label="Nom" name="nom" rules={[{ required: true, message: "Le nom est requis" }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Email" name="email">
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="consentement" valuePropName="checked">
                <Checkbox>Consentement</Checkbox>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="Téléphone" name="telephone">
            <Input style={{ width: "50%" }} />
          </Form.Item>
          <Form.Item label="Adresse" name="adresse">
            <Input.TextArea autoSize={{ minRows: 3, maxRows: 6 }} />
          </Form.Item>
          <Form.Item noStyle shouldUpdate={(prev, cur) => prev.type !== cur.type}>
            {({ getFieldValue }) =>
              getFieldValue("type") !== "PARTICULIER" && (
                <>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item label="SIREN" name="siren">
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="SIRET" name="siret">
                        <Input />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item label="TVA" name="tva">
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="NAF" name="naf">
                        <Input />
                      </Form.Item>
                    </Col>
                  </Row>
                </>
              )
            }
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Remise (%)" name="remise">
                <Input type="number" min={0} max={100} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Évaluation" name="evaluation">
                <Rate allowClear />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="Notes" name="notes">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default ClientsMoteurs;

