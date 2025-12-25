import React, { useEffect, useState } from 'react';
import { Space, Table, Button, Input, Form, Modal, Avatar, Spin, Select, Popconfirm, message, Row, Col } from 'antd';
import { UserOutlined, PlusCircleOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const style: React.CSSProperties = { padding: '8px 0' };
const { Search } = Input;

// Roles for demonstration
const USER_ROLES = [
    { label: "Administrateur", value: "admin" },
    { label: "Utilisateur", value: "user" }
];

// User Form Modal component
const UserFormModal = ({ visible, onCancel, onSubmit, initialValues, loading }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (visible) {
            form.resetFields();
            form.setFieldsValue(initialValues || {});
        }
    }, [visible, initialValues]);

    return (
        <Modal
            open={visible}
            title={initialValues && initialValues.name ? "Modifier l'utilisateur" : "Créer un utilisateur"}
            onCancel={onCancel}
            onOk={() => {
                form
                    .validateFields()
                    .then((values) => {
                        onSubmit(values);
                    })
                    .catch(() => {});
            }}
            confirmLoading={loading}
            destroyOnHidden
            okText="Enregistrer"
            cancelText="Annuler"
        >
            <Form form={form} layout="vertical" initialValues={initialValues}>
                <Form.Item
                    label="Utilisateur"
                    name="name"
                    rules={[{ required: true, message: "Champ requis" }]}
                >
                    <Input disabled={!!(initialValues && initialValues.name)} />
                </Form.Item>
                <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                        { required: true, message: "Champ requis" },
                        { type: "email", message: "Email invalide" }
                    ]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="Mot de passe"
                    name="password"
                    rules={
                        initialValues && initialValues.name
                            ? []
                            : [{ required: true, message: "Champ requis" }]
                    }
                >
                    <Input.Password autoComplete="new-password" />
                </Form.Item>
                <Form.Item
                    label="Roles"
                    name="roles"
                    rules={[{ required: true, message: "Le(s) rôle(s) est/sont requis" }]}
                >
                    <Select mode="tags" options={USER_ROLES} placeholder="Ajouter les rôles" />
                </Form.Item>
            </Form>
        </Modal>
    );
};


export default function Utilisateurs() {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [editUser, setEditUser] = useState(null);

    // Fetch users
    const fetchUsers = (query = '') => {
        setLoading(true);
        let url = '/users';
        if (query) {
            url = `/users/search?q=${encodeURIComponent(query)}`;
        }
        fetch(url)
            .then(r => {
                if (!r.ok) throw new Error("Erreur HTTP: " + r.status);
                return r.json();
            })
            .then(setUsers)
            .catch(e => {
                message.error("Erreur lors du chargement des utilisateurs: " + e.message);
                setUsers([]);
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Create User
    const handleCreate = (data) => {
        setModalLoading(true);
        fetch('/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
            .then(async res => {
                if (!res.ok) {
                    const errTxt = await res.text();
                    throw new Error(errTxt || "Erreur réseau");
                }
                return res.json();
            })
            .then(() => {
                message.success("Utilisateur créé !");
                setModalOpen(false);
                fetchUsers();
            })
            .catch(e => message.error("Erreur création: " + e.message))
            .finally(() => setModalLoading(false));
    };

    // Update User
    const handleUpdate = (data) => {
        setModalLoading(true);
        fetch(`/users/${encodeURIComponent(editUser.name)}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...editUser, ...data })
        })
            .then(async res => {
                if (!res.ok) {
                    const errTxt = await res.text();
                    throw new Error(errTxt || "Erreur réseau");
                }
                return res.json();
            })
            .then(() => {
                message.success("Utilisateur modifié !");
                setModalOpen(false);
                setEditUser(null);
                fetchUsers();
            })
            .catch(e => message.error("Erreur modification: " + e.message))
            .finally(() => setModalLoading(false));
    };

    // Delete User
    const handleDelete = user => {
        fetch(`/users/${encodeURIComponent(user.name)}`, { method: 'DELETE' })
            .then(res => {
                if (!res.ok) throw new Error("Erreur HTTP: " + res.status);
                message.success("Utilisateur supprimé");
                fetchUsers();
            })
            .catch(e => {
                message.error("Erreur suppression: " + e.message);
            });
    };

    // Table columns
    const columns = [
        {
            title: '',
            dataIndex: '',
            key: 'avatar',
            render: (_, r) => <Avatar icon={<UserOutlined />} />
        },
        {
            title: "Nom d'utilisateur",
            dataIndex: "name",
            key: "name",
            render: (text, record) => <b>{text}{record.name === 'admin' ? ' 👑' : ''}</b>,
            sorter: (a,b) => a.name.localeCompare(b.name),
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
            sorter: (a,b) => a.email.localeCompare(b.email),
        },
        {
            title: "Roles",
            dataIndex: "roles",
            key: "roles",
            render: (roles) =>
                Array.isArray(roles)
                    ? roles.map((role, idx) => (
                          <span key={role} style={{ marginRight: 4 }}>
                              <Button size="small" type="dashed" disabled>
                                  {role}
                              </Button>
                          </span>
                      ))
                    : null,
            filters: USER_ROLES,
            onFilter: (value, record) => record.roles.includes(value),
        },
        {
            title: "Actions",
            key: "actions",
            render: (_, record) => (
                <Space>
                    <Button
                        icon={<EditOutlined />}
                        size="small"
                        onClick={() => {
                            setEditUser(record);
                            setModalOpen(true);
                        }}
                    />
                    <Popconfirm
                        title="Confirmer la suppression"
                        description={`Supprimer l'utilisateur ${record.name} ?`}
                        disabled={record.name === 'admin'}
                        onConfirm={() => handleDelete(record)}
                        okButtonProps={{ danger: true }}
                        okText="Supprimer"
                        cancelText="Annuler"
                    >
                        <Button
                            icon={<DeleteOutlined />}
                            size="small"
                            danger
                            disabled={record.name === 'admin'}
                        />
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <>
            <Row gutter={[16,16]}>
                <Col span={24}>
                    <div style={style}>
                        <Space>
                            <Search placeholder="Recherche" allowClear enterButton style={{ width: 600 }} onSearch={value => {
                                setSearch(value);
                                fetchUsers(value);
                            }} value={search} onChange={e => setSearch(e.target.value)}/>
                            <Button type="primary" icon={<PlusCircleOutlined/>} onClick={() => {
                                setEditUser(null);
                                setModalOpen(true);
                            }} />
                        </Space>
                    </div>
                    </Col>
            </Row>
            <Row gutter={[16,16]}>
                <Col span={24}>
                {loading ? (
                    <Spin />
                ) : (
                    <Table
                        rowKey="name"
                        dataSource={users}
                        columns={columns}
                        pagination={{ pageSize: 8, showSizeChanger: false }}
                    />
                )}
                </Col>
            </Row>
            <UserFormModal
                visible={modalOpen}
                onCancel={() => { setModalOpen(false); setEditUser(null);} }
                onSubmit={editUser ? handleUpdate : handleCreate}
                initialValues={editUser}
                loading={modalLoading}
            />
            </>
    );
}
