import { Card, Space, Table, Select, Input, Button } from 'antd';
import { UserOutlined, PlusCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import { users } from './data.tsx';

const columns = [
    {
        title: 'Utilisateur',
        dataIndex: 'user',
        key: 'user'
    },
    {
        title: 'Roles',
        dataIndex: 'roles',
        key: 'roles',
        render: (_,record) => (
            <Select style={{ width: 200 }} defaultValue={record.roles} options={[
                { value: 'admin', label: 'admin' },
                { value: 'accueil', label: 'accueil' },
                { value: 'atelier', label: 'atelier' },
                { value: 'magasin', label: 'magasin' }
            ]} />
        )
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
            <Button icon={<DeleteOutlined/>} />
        )
    }
];

export default function Utilisateurs(props) {
    return(
        <>
        <Card title={<Space><UserOutlined/> Utilisateurs</Space>}>
            <Table columns={columns} dataSource={users} />
            <Button type="primary" icon={<PlusCircleOutlined/>}>Nouvel Utilisateur</Button>
        </Card>
        </>
    );
}