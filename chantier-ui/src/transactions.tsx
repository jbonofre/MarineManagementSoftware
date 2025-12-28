import React, { useEffect, useState } from 'react';
import { Table, Button, message, Modal, Form, Input, DatePicker, Select, InputNumber, Popconfirm, Space, Tag, Row, Col } from 'antd';
import { PlusCircleOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import moment from 'moment';

const { Option } = Select;

// Helper for date fields
const formatDate = (dateStr?: string | Date) => dateStr ? moment(dateStr) : null;

const statusColors: Record<string, string> = {
  PAID: 'green',
  PENDING: 'orange',
  CANCELLED: 'red',
  // add more mapping as needed
};

function TransactionForm({ open, onClose, onSubmit, initialValues, clients, isSubmitting }: any) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open)
      form.setFieldsValue({
        ...initialValues,
        changementStatusDate: initialValues && initialValues.changementStatusDate ? moment(initialValues.changementStatusDate) : null,
        dateCreation: initialValues && initialValues.dateCreation ? moment(initialValues.dateCreation) : null,
        dateLivraison: initialValues && initialValues.dateLivraison ? moment(initialValues.dateLivraison) : null,
        datePaiement: initialValues && initialValues.datePaiement ? moment(initialValues.datePaiement) : null,
        dateEcheance: initialValues && initialValues.dateEcheance ? moment(initialValues.dateEcheance) : null,
        client: initialValues && initialValues.client ? initialValues.client.id : null,
      });
    else
      form.resetFields();
  }, [open, initialValues, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onSubmit({
        ...initialValues,
        ...values,
        changementStatusDate: values.changementStatusDate ? values.changementStatusDate.format('YYYY-MM-DD') : null,
        dateCreation: values.dateCreation ? values.dateCreation.format('YYYY-MM-DD') : null,
        dateLivraison: values.dateLivraison ? values.dateLivraison.format('YYYY-MM-DD') : null,
        datePaiement: values.datePaiement ? values.datePaiement.format('YYYY-MM-DD') : null,
        dateEcheance: values.dateEcheance ? values.dateEcheance.format('YYYY-MM-DD') : null,
        client: clients.find((c: any) => c.id === values.client) || null,
      });
    } catch (error) {
      // Form validation errors are handled by antd
    }
  };

  return (
    <Modal
      title={initialValues && initialValues.id ? 'Modifier Transaction' : 'Nouvelle Transaction'}
      width={1024}
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      okText="Enregistrer"
      cancelText="Annuler"
      confirmLoading={isSubmitting}
      destroyOnClose
    >
      <Form layout="vertical" form={form} disabled={isSubmitting}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="status" label="Statut" rules={[{ required: true, message: "Statut requis" }]}>
              <Input />
            </Form.Item>
            <Form.Item name="changementStatusDate" label="Date Changement Statut">
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="dateCreation" label="Date Création">
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="dateLivraison" label="Date Livraison">
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="datePaiement" label="Date Paiement">
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="dateEcheance" label="Date Echéance">
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="montantHT" label="Montant HT" rules={[{ required: true, message: "Montant HT requis" }]}>
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="remise" label="Remise">
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="client" label="Client" rules={[{ required: true, message: "Client requis" }]}>
              <Select showSearch placeholder="Sélectionner un client">
                {clients.map((client: any) =>
                  <Option key={client.id} value={client.id}>{client.name}</Option>
                )}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="Articles" name="articles">
          <Table
            dataSource={form.getFieldValue('produits') || []}
            rowKey={(record: any) => record.id || Math.random()}
            pagination={false}
            size="small"
            columns={[
              { title: 'Article', dataIndex: 'name', key: 'name' },
              { title: 'Quantité', dataIndex: 'quantite', key: 'quantite' },
              { title: 'Prix Unitaire', dataIndex: 'prix', key: 'prix' },
            ]}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default function Transactions() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formInit, setFormInit] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [reloadKey, setReloadKey] = useState(0);

  // Fetch clients on mount (used for selects)
  useEffect(() => {
    fetch('/clients') // Adjust endpoint as needed
      .then(res => res.json()).then(setClients).catch(() => setClients([]));
  }, []);

  // Fetch transactions list (reloadKey is used for refreshing after submit/delete)
  useEffect(() => {
    setLoading(true);
    fetch('/transactions')
      .then(res => res.json())
      .then(setTransactions)
      .catch(() => message.error("Impossible de charger les transactions"))
      .finally(() => setLoading(false));
  }, [reloadKey]);

  const handleCreate = () => {
    setFormInit(null);
    setModalOpen(true);
  };

  const handleEdit = (record: any) => {
    setFormInit({
      ...record,
      // Map dates to moment for the form, handled in useEffect of form
    });
    setModalOpen(true);
  };

  const handleDelete = (id: number) => {
    fetch(`/api/transactions/${id}`, { method: 'DELETE' })
      .then(res => {
        if (res.status === 204) {
          message.success('Transaction supprimée');
          setReloadKey(k => k + 1);
        } else {
          throw new Error();
        }
      })
      .catch(() => message.error("Erreur suppression"));
  };

  const submitForm = (values: any) => {
    setIsSubmitting(true);
    const isEdit = values.id != null;
    const method = isEdit ? 'PUT' : 'POST';
    const url = isEdit ? `/api/transactions/${values.id}` : '/api/transactions';
    // Remove id for POST, leave for PUT
    if(!isEdit) delete values.id;
    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    })
      .then(async res => {
        if ((isEdit && res.ok) || (!isEdit && res.status === 201)) {
          message.success('Transaction enregistrée');
          setModalOpen(false);
          setReloadKey(k => k + 1);
        } else {
          throw new Error(await res.text());
        }
      })
      .catch(() => message.error("Erreur lors de l'enregistrement"))
      .finally(() => setIsSubmitting(false));
  };

  const columns = [
    { title: "Numéro", dataIndex: "id", width: 70 },
    { title: "Status", dataIndex: "status",
      render: (text: string) => <Tag color={statusColors[text] || "blue"}>{text}</Tag>
    },
    { title: "Date Création", dataIndex: "dateCreation",
      render: (date: string) => date ? moment(date).format('YYYY-MM-DD') : "-"
    },
    { title: "Date Status", dataIndex: "dateStatus",
      render: (date: string) => date ? moment(date).format('YYYY-MM-DD') : "-"
    },
    { title: "Montant TTC", dataIndex: "montantTTC", render: (v: number) => (v/100).toFixed(2) + " €" },
    { title: "Client", dataIndex: ["client", "name"], render: (name: string, record: any) => record.client ? record.client.name : "-" },
    {
      title: "Actions", key: "actions", render: (_:any, record: any) =>
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Popconfirm title="Supprimer ?" onConfirm={() => handleDelete(record.id)} okText="Oui" cancelText="Non">
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
    }
  ];

  return (
    <div style={{ padding: 24, background: "#fff" }}>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusCircleOutlined />} onClick={handleCreate} />
      </Space>
      <Table
        rowKey="id"
        dataSource={transactions}
        columns={columns}
        loading={loading}
        pagination={{ pageSize: 12 }}
      />

      <TransactionForm
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={submitForm}
        initialValues={formInit}
        clients={clients}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
