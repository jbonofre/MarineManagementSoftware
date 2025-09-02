import { Card, Space, Table, Select, Input, Button } from 'antd';
import { UserOutlined, PlusCircleOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { users, userRoles } from './data.tsx';

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
            <Input.Password value={record.password} />
        )
    },
    {
        title: 'E-mail',
        dataIndex: 'email',
        key: 'email',
        render: (_,record) => (
            <Input value={record.email} />
        )
    },
    {
        title: '',
        key: 'action',
        render: (_,record) => (
            <Space>
            <Button icon={<EditOutlined/>} />
            <Button icon={<DeleteOutlined/>} />
            </Space>
        )
    }
];

export default function Utilisateurs(props) {
    return(
        <>
        <Card title={<Space><UserOutlined/> Utilisateurs</Space>}>
            <Space>
                <Input placeholder="Utilisateur" required={true} />
                <Select style={{ width: 200 }} options={userRoles} />
                <Input.Password style={{ width: 250 }} placeholder="Mot de passe" required={true} />
                <Input.Password style={{ width: 250 }} placeholder="Confirmer le mot de passe" required={true}/>
                <Input style={{ width: 250 }} placeholder="e-mail" required={true} />
                <Button type="primary" icon={<PlusCircleOutlined/>}>Nouvel utilisateur</Button>
            </Space>
            <Table columns={columns} dataSource={users} />
        </Card>
        </>
    );
}