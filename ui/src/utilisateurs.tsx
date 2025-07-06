import { Card, Space, Table } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const users = [
  {
      user: 'admin',
      roles: [ 'admin' ],
      password: 'admin',
      email: 'contact@msplaisance.com'
  },
  {
      user: 'accueil',
      roles: [ 'accueil' ],
      password: 'accueil',
      email: 'contact@msplaisance.com'
  }
];

const columns = [
    {
        title: 'Utilisateur',
        dataIndex: 'user',
        key: 'user'
    },
    {
        title: 'Roles',
        dataIndex: 'roles',
        key: 'roles'
    },
    {
        title: 'Mot de Passe',
        dataIndex: 'password',
        key: 'password'
    },
    {
        title: 'E-mail',
        dataIndex: 'email',
        key: 'email'
    }
];

export default function Utilisateurs(props) {
    return(
        <>
        <Card title={<Space><UserOutlined/> Utilisateurs</Space>}>
            <Table columns={columns} dataSource={users} />
        </Card>
        </>
    );
}