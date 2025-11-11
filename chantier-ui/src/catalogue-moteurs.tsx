import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, message, Popconfirm } from 'antd';

const { TextArea } = Input;

// Definition of fields (based on MoteurCatalogueEntity)
const moteurFields = [
  { name: ['modele'], label: 'Modèle', required: true, type: 'text' },
  { name: ['marque'], label: 'Marque', required: true, type: 'text' },
  { name: ['type'], label: 'Type', required: true, type: 'text' },
  { name: ['notes'], label: 'Notes', type: 'textarea' },
  { name: ['evaluation'], label: 'Évaluation', type: 'number' },
  { name: ['image'], label: 'Image (URL)', type: 'text' },
  { name: ['puissanceCv'], label: 'Puissance (CV)', type: 'number' },
  { name: ['puissanceKw'], label: 'Puissance (KW)', type: 'number' },
  { name: ['longueurArbre'], label: "Longueur d'Arbre", type: 'text' },
  { name: ['arbre'], label: "Arbre", type: 'number' },
  { name: ['demarrage'], label: "Démarrage", type: 'text' },
  { name: ['barre'], label: "Barre", type: 'text' },
  { name: ['cylindres'], label: "Cylindres", type: 'number' },
  { name: ['cylindree'], label: "Cylindrée", type: 'number' },
  { name: ['regime'], label: "Régime", type: 'text' },
  { name: ['huileRecommandee'], label: "Huile Recommandée", type: 'text' }
];

function MoteurForm({ visible, onCancel, onOk, initialValues }) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) form.setFieldsValue(initialValues || {});
  }, [visible, initialValues]);

  return (
    <Modal
      visible={visible}
      title={initialValues ? "Éditer un moteur" : "Ajouter un moteur"}
      onCancel={onCancel}
      onOk={() => {
        form
          .validateFields()
          .then(values => {
            onOk(values);
            form.resetFields();
          })
          .catch(() => {});
      }}
      destroyOnClose
    >
      <Form form={form} layout="vertical" initialValues={initialValues}>
        {moteurFields.map(field => (
          <Form.Item
            key={field.name[0]}
            name={field.name}
            label={field.label}
            rules={field.required ? [{ required: true, message: `Veuillez indiquer ${field.label.toLowerCase()}` }] : []}
          >
            {field.type === 'textarea' ? (
              <TextArea rows={2} />
            ) : field.type === 'number' ? (
              <InputNumber style={{ width: '100%' }} />
            ) : (
              <Input />
            )}
          </Form.Item>
        ))}
      </Form>
    </Modal>
  );
}

const API_URL = "/catalogue/moteurs";

export default function CatalogueMoteurs() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMoteur, setEditingMoteur] = useState(null);

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Erreur de serveur');
      const result = await res.json();
      setData(result);
    } catch (e) {
      message.error('Erreur lors du chargement du catalogue moteurs');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Create or update item
  const handleSave = async values => {
    try {
      let response;
      if (editingMoteur) {
        response = await fetch(`${API_URL}/${editingMoteur.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...editingMoteur, ...values })
        });
      } else {
        response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values)
        });
      }
      if (!response.ok) throw new Error();
      message.success('Moteur sauvegardé');
      setModalVisible(false);
      setEditingMoteur(null);
      fetchData();
    } catch {
      message.error('Erreur lors de la sauvegarde');
    }
  };

  // Delete item
  const handleDelete = async id => {
    try {
      const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error();
      message.success('Moteur supprimé');
      fetchData();
    } catch {
      message.error('Erreur lors de la suppression');
    }
  };

  // Table columns
  const columns = [
    { title: 'Modèle', dataIndex: 'modele', key: 'modele' },
    { title: 'Marque', dataIndex: 'marque', key: 'marque' },
    { title: 'Type', dataIndex: 'type', key: 'type' },
    { title: 'Puissance (CV)', dataIndex: 'puissanceCv', key: 'puissanceCv' },
    { title: 'Puissance (KW)', dataIndex: 'puissanceKw', key: 'puissanceKw' },
    { title: 'Cylindres', dataIndex: 'cylindres', key: 'cylindres' },
    { title: 'Image', dataIndex: 'image', key: 'image', render: url => url ? <img src={url} alt="" style={{ height: 40 }} /> : null },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <>
          <Button size="small" onClick={() => { setEditingMoteur(record); setModalVisible(true); }}>Éditer</Button>
          <Popconfirm
            title="Supprimer ce moteur ?"
            onConfirm={() => handleDelete(record.id)}
            okText="Oui" cancelText="Non"
          >
            <Button danger size="small" style={{ marginLeft: 8 }}>
              Supprimer
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h2>Catalogue Moteurs</h2>
      <Button type="primary" style={{ marginBottom: 16 }} onClick={() => { setEditingMoteur(null); setModalVisible(true); }}>
        Ajouter un moteur
      </Button>
      <Table
        loading={loading}
        dataSource={data}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        bordered
      />
      <MoteurForm
        visible={modalVisible}
        onCancel={() => { setModalVisible(false); setEditingMoteur(null); }}
        onOk={handleSave}
        initialValues={editingMoteur}
      />
    </div>
  );
}
