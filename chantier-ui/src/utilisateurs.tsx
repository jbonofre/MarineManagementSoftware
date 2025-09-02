import { useState, useEffect } from 'react';
import { Card, Space, Table, Select, Input, Button, Form } from 'antd';
import { UserOutlined, PlusCircleOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { backend, userRoles } from './data.tsx';

const columns = [
    {
        title: 'Utilisateur',
        dataIndex: 'user',
        key: 'user',
        sorter: (a,b) => a.user.localeCompare(b.user),
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
            if (record.user === 'admin') {
                return(
                  <Space>
                    <Button icon={<EditOutlined/>}/>
                  </Space>
                );
            } else {
                return(
                    <Space>
                        <Button icon={<EditOutlined/>}/>
                        <Button icon={<DeleteOutlined/>}/>
                    </Space>
                );
            }
        })()}</div>,
    }
];

export default function Utilisateurs(props) {

    const [ users, setUsers ] = useState();

    useEffect(() => {
        fetch(backend + '/users')
            .then((response) => response.json())
            .then((data) => setUsers(data))
            .catch((error) => console.error(error));
    }, [ ]);

    const [ newUserForm ] = Form.useForm();

    const newUserFunction = (values) => {
        console.log(values.user);
    };

    return(
        <>
        <Card title={<Space><UserOutlined/> Utilisateurs</Space>}>
            <Space>
                <Form form={newUserForm} layout='inline' onFinish={newUserFunction}>
                <Form.Item name='user' rules={[{ required: true, message: 'Le nom d\'utilisateur est requis' }]}>
                <Input id='user' style={{ width: 200 }} placeholder="Utilisateur" allowClear={true} />
                </Form.Item>
                <Form.Item name='userRoles'>
                <Select style={{ width: 150 }} options={userRoles} />
                </Form.Item>
                <Form.Item name='password' rules={[{ required: true, message: 'Le mot de passe est requis' }]}>
                <Input.Password style={{ width: 250 }} placeholder="Mot de passe" allowClear={true}/>
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
                <Input.Password style={{ width: 250 }} placeholder="Confirmer le mot de passe" allowClear={true}/>
                </Form.Item>
                <Form.Item name='email' rules={[{ required: true, message: 'Un email est requis' }]}>
                <Input style={{ width: 250 }} placeholder="e-mail" allowClear={true}/>
                </Form.Item>
                <Button type="primary" onClick={() => newUserForm.submit()} icon={<PlusCircleOutlined/>}>Ajouter utilisateur</Button>
                </Form>
            </Space>
            <Table columns={columns} dataSource={users} />
        </Card>
        </>
    );
}