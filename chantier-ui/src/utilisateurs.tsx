import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumb, Card, Space, Table, Select, Input, Button, Form, Avatar, Spin, message } from 'antd';
import { HomeOutlined, UserOutlined, PlusCircleOutlined, EditOutlined, DeleteOutlined, PauseCircleOutlined, ReloadOutlined, LeftCircleOutlined, SaveOutlined } from '@ant-design/icons';
import { userRoles } from './data.tsx';

function Utilisateur(props) {

    const [ details, setDetails ] = useState();

    const [ userForm ] = Form.useForm();

    const fetchUser = () => {
        fetch('./users/' + props.user)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erreur (code ' + response.status + ')');
                }
                return response.json();
            })
            .then(response => setDetails(response))
            .catch((error) => {
                message.error('Une erreur est survenue: ' + error.message);
                console.error(error)
            })
        };

    useEffect(fetchUser, []);

    if (!details) {
        return(<Spin/>);
    }

    const updateUserFunction = (values) => {
        fetch('./users/' + props.user, {
          method: 'PUT',
          body: JSON.stringify(values),
          headers: {
            'Content-Type': 'application/json'
          }
        })
        .then((response) => {
          if (!response.ok) {
              throw new Error('Erreur (code ' + response.status + ')');
          };
          return response.json();
        })
        .then((response) => {
            message.info('L\'utilisateur ' + props.user + ' a été mis à jour');
            setDetails(response);
            props.fetchUsers();
        })
        .catch((error) => {
            message.error('Une erreur est survenue: ' + error.message);
            console.error(error)
        })
    };

    let disabledSelect = false;
    if (props.user === 'admin') {
        disabledSelect = true;
    };

    return(
      <>
      <Breadcrumb items={[
          { title: <Link to="/"><HomeOutlined/></Link> },
          { title: <Button type="text" size="small" onClick={() => props.setUser(null)}>Utilisateurs</Button> }
      ]} />
      <Card title={<Space><Avatar size="large" icon={<UserOutlined/>} />{details.name}</Space>} style={{ width: '100%' }}>
        <Form name="userForm" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} style={{ width: '80%' }} initialValues={details}
            form={userForm} onFinish={updateUserFunction}>
            <Form.Item name="name" label="Nom d'utilisateur">
                <Input disabled={true}/>
            </Form.Item>
            <Form.Item name="roles" label="Roles" rules={[{ required: true, message: 'Le role de l\'utilisateur est requis' }]}>
                <Select options={userRoles} disabled={disabledSelect} />
            </Form.Item>
            <Form.Item name="password" label="Mot de passe" rules={[{ required: true, message: 'Le mot de passe est requis' }]}>
                <Input.Password allowClear={true} />
            </Form.Item>
            <Form.Item name="email" label="E-mail" rules={[{ required: true, message: 'L\'e-mail est requis' }]}>
                <Input allowClear={true} />
            </Form.Item>
            <Form.Item label={null}>
                <Space>
                <Button type="primary" icon={<SaveOutlined/>} onClick={() => userForm.submit()}>Enregistrer</Button>
                <Button icon={<PauseCircleOutlined/>} onClick={() => userForm.resetFields()}>Annuler</Button>
                </Space>
            </Form.Item>
        </Form>
      </Card>
      </>
    );
}

export default function Utilisateurs(props) {

    const [ users, setUsers ] = useState();
    const [ user, setUser ] = useState();

    const fetchUsers = () => {
        fetch('./users')
            .then((response) => {
                if(!response.ok) {
                    throw new Error('Erreur (code ' + response.status + ')');
                }
                return response.json();
            })
            .then((data) => setUsers(data))
            .catch((error) => {
                message.error('Une erreur est survenue: ' + error.message);
                console.error(error)
            })
    };

    useEffect(fetchUsers, []);

    const [ newUserForm ] = Form.useForm();

    if (!users) {
        return(<Spin/>);
    }

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
            filters: userRoles,
            onFilter: (value,record) => record.roles === value,
            sorter: (a,b) => a.roles.localeCompare(b.roles),
        },
        {
            title: 'E-mail',
            dataIndex: 'email',
            key: 'email',
            sorter: (a,b) => a.email.localeCompare(b.email),
        },
        {
            title: '',
            key: 'action',
            render: (_,record) => <div>{(() => {
                if (record.name === 'admin') {
                    return(
                        <Space>
                        <Button icon={<EditOutlined/>} onClick={() => setUser(record.name)} />
                        </Space>
                    );
                } else {
                    return(
                        <Space>
                        <Button icon={<EditOutlined/>} onClick={() => setUser(record.name)} />
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

    if (user) {
        return(
          <Utilisateur user={user} setUser={setUser} fetchUsers={fetchUsers}/>
        );
    } else {
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
                <Space>
                <Button type="primary" onClick={() => newUserForm.submit()} icon={<PlusCircleOutlined/>} />
                <Button onClick={() => newUserForm.resetFields()} icon={<PauseCircleOutlined/>} />
                <Button onClick={() => fetchUsers()} icon={<ReloadOutlined/>}/>
                </Space>
                </Form>
            </Space>
            <Table columns={columns} dataSource={users} />
        </Card>
        </>
        );
    }
}