import { useState, useEffect } from 'react';
import { Card, Space, Table, Select, Input, Button, Form, message } from 'antd';
import { UserOutlined, PlusCircleOutlined, EditOutlined, DeleteOutlined, PauseCircleOutlined } from '@ant-design/icons';
import { userRoles } from './data.tsx';

export default function Utilisateurs(props) {

    const [ users, setUsers ] = useState();

    const fetchUsers = () => {
        fetch('./users')
            .then((response) => response.json())
            .then((data) => setUsers(data))
            .catch((error) => {
                message.error('Une erreur est survenue: ' + error.message);
                console.error({error})
            })
    };

    useEffect(fetchUsers, []);

    const [ newUserForm ] = Form.useForm();

    const newUserFunction = (values) => {
        fetch('./users', {
                method: 'POST',
                body: JSON.stringify(values),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Erreur (code ' + response.status + ')');
                }
                return response.json();
            })
            .then((data) => {
                message.info('Utilisateur sauvegardé');
                fetchUsers();
            })
            .catch((error) => {
                message.error('Une erreur est survenue: ' + error.message);
                console.error(error);
            })
    };

    const columns = [
        {
            title: 'Utilisateur',
            dataIndex: 'name',
            key: 'name',
            sorter: (a,b) => a.name.localeCompare(b.name),
        },
        {
            title: 'Roles',
            dataIndex: 'roles',
            key: 'roles',
            render: (_,record) => (
                <Select style={{ width: 200 }} defaultValue={record.roles} options={userRoles} />
            ),
            filters: userRoles,
            onFilter: (value,record) => record.roles === value,
        },
        {
            title: 'Mot de Passe',
            dataIndex: 'password',
            key: 'password',
            render: (_,record) => (
                <Input.Password defaultValue={record.password} />
            )
        },
        {
            title: 'E-mail',
            dataIndex: 'email',
            key: 'email',
            render: (_,record) => (
                <Input defaultValue={record.email} allowClear={true}/>
            ),
            sorter: (a,b) => a.email.localeCompare(b.email),
        },
        {
            title: '',
            key: 'action',
            render: (_,record) => <div>{(() => {
                if (record.name === 'admin') {
                    return(
                        <Space>
                        <Button icon={<EditOutlined/>}/>
                        </Space>
                    );
                } else {
                    return(
                        <Space>
                        <Button icon={<EditOutlined/>}/>
                        <Button onClick={() => {
                            fetch('./users/' + record.name, {
                                method: 'DELETE'
                            })
                            .then((response) => {
                                if (!response.ok) {
                                    throw new Error('Erreur (code ' + response.status + ')');
                                }
                            })
                            .then((data) => {
                                message.info('Utilisateur supprimé');
                                fetchUsers();
                            })
                            .catch((error) => {
                                message.error('Une erreur est survenue: ' + error.message);
                                console.error(error);
                            })
                            }} icon={<DeleteOutlined/>}/>
                        </Space>
                    );
                }
            })()}</div>,
        }
    ];

    return(
        <>
        <Card title={<Space><UserOutlined/> Utilisateurs</Space>}>
            <Space>
                <Form form={newUserForm} layout='inline' onFinish={newUserFunction}>
                <Form.Item name='name' rules={[{ required: true, message: 'Le nom d\'utilisateur est requis' }]}>
                <Input style={{ width: 200 }} placeholder="Utilisateur" allowClear={true} />
                </Form.Item>
                <Form.Item name='roles' rules={[{ required: true, message: 'Le role de l\'utilisateur est requis' }]}>
                <Select style={{ width: 150 }} options={userRoles} />
                </Form.Item>
                <Form.Item name='password' rules={[{ required: true, message: 'Le mot de passe est requis' }]}>
                <Input.Password style={{ width: 200 }} placeholder="Mot de passe" allowClear={true}/>
                </Form.Item>
                <Form.Item name='confirmPassword' rules={[
                    {
                        required: true,
                        message: 'Veuillez confirmer le mot de passe'
                    },
                    ({ getFieldValue }) => ({
                        validator(_,value) {
                            if (!value || getFieldValue('password') === value) {
                                return Promise.resolve();
                            }
                            return Promise.reject(new Error('Les mots de passe ne correspondent pas'));
                        },
                    }),
                ]}>
                <Input.Password style={{ width: 200 }} placeholder="Confirmer le mot de passe" allowClear={true}/>
                </Form.Item>
                <Form.Item name='email' rules={[{ required: true, message: 'Un email est requis' }]}>
                <Input style={{ width: 250 }} placeholder="e-mail" allowClear={true}/>
                </Form.Item>
                <Button type="primary" onClick={() => newUserForm.submit()} icon={<PlusCircleOutlined/>}>Ajouter utilisateur</Button>
                <Button onClick={() => newUserForm.resetFields()} icon={<PauseCircleOutlined/>}>Annuler</Button>
                </Form>
            </Space>
            <Table columns={columns} dataSource={users} />
        </Card>
        </>
    );
}