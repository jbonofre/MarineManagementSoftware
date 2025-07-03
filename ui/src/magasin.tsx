import { Row, Col, Input, Select, Button, Space, Table } from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';
import type { TableProps } from 'antd';

interface ReferenceType {
    key: string,
    nom: string,
    reference: string,
    stock: number,
    categorie: string
}

const columns: TableProps<ReferenceType>['columns'] = [
    {
        title: 'Nom',
        dataIndex: 'nom',
        key: 'nom',
        render: (text) => <a>{text}</a>,
    },
    {
        title: 'Référence',
        dataIndex: 'reference',
        key: 'reference'
    },
    {
        title: 'Catégorie',
        dataIndex: 'categorie',
        key: 'categorie'
    },
    {
        title: 'Stock',
        dataIndex: 'stock',
        key: 'stock'
    },
    {
        title: '',
        key: 'action',
        render: (_, record) => (
            <Space>
                <Button>Editer</Button>
                <Button>Supprimer</Button>
            </Space>
        )
    }
]

const data: ReferenceType[] = [
    {
        key: '1',
        nom: 'Bougie NGK XX4',
        reference: 'N3317DSA8DSD7F',
        categorie: 'Mécanique',
        stock: 24
    }
]

export default function Magasin() {

    const style: React.CSSProperties = { padding: '8px 0' };
    const { Search } = Input;

    return (
        <>
                <Row gutter={[16,16]}>
                    <Col span={24}>
                        <div style={style}>
                            <Space>
                                <Search placeholder="Recherche" enterButton style={{ width: 350 }}/>
                                <Select mode="tags" placeholder="Catégories" style={{ width: 350 }} options={[
                                      { value: '', label: ''},
                                      { value: 'moteur', label: 'Moteur' },
                                      { value: 'bateau', label: 'Bateau' },
                                      { value: 'mecanique', label: 'Mécanique' },
                                      { value: 'eccastillage', label: 'Accastillage' },
                                      { value: 'electronique', label: 'Electronique' },
                                      { value: 'securite', label: 'Securité' }
                                    ]}/>
                                <Button type="primary" icon={<PlusCircleOutlined/>}>Ajouter Référence</Button>
                            </Space>
                        </div>
                    </Col>
                </Row>
                <Row gutter={[16,16]}>
                    <Col span={24}>
                        <Table<ReferenceType> columns={columns} dataSource={data} />
                    </Col>
                </Row>
        </>
    );
}