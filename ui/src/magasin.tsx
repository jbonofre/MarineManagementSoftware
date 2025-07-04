import { Row, Col, Input, Select, Button, Space, Table } from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';
import type { TableProps } from 'antd';

interface ReferenceType {
    key: string,
    nom: string,
    marque: string,
    imageUrl: string,
    reference: string,
    stock: number,
    categorie: string
}

const columns: TableProps<ReferenceType>['columns'] = [
    {
        title: 'Nom',
        dataIndex: 'nom',
        key: 'nom',
        render: (text,record) => <a><img width='30px' src={record.imageUrl}/>  {text}</a>,
    },
    {
        title: 'Marque',
        dataIndex: 'marque',
        key: 'marque'
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
        nom: 'Bougie LKAR7C-9 pour MERCURY V6, V8, V10',
        reference: 'LKAR7C-9--8M0176616',
        marque: 'NGK',
        categorie: 'Anodes & Bougies',
        imageUrl: 'https://www.piecesbateaux.com/9338-medium_default/bougie-lkar7c-9-pour-mercury-v6-v8-v10.jpg',
        stock: 24
    },
    {
        key: '2',
        nom: 'Filtre à Huile MERCURY 75 à 150Cv 4Temps EFI',
        reference: '877761Q01--877761K01',
        marque: 'QUICKSILVER',
        categorie: 'Pièces Hors Bord',
        imageUrl: 'https://www.piecesbateaux.com/3879-medium_default/filtre-a-huile-mercury-75-a-150cv-4t-efi.jpg',
        stock: 12
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
                                      { value: 'moteurs', label: 'Moteurs' },
                                      { value: 'bateaux', label: 'Bateaux' },
                                      { value: 'remoraues', label: 'Remorques' },
                                      { value: 'piecehb', label: 'Pièces Hors Bord' },
                                      { value: 'pieceib', label: 'Piècecs Inboard' },
                                      { value: 'helices', label: 'Hélices' },
                                      { value: 'entretien', label: 'Entretien' },
                                      { value: 'anodesbougies', label: 'Anodes & Bougies' },
                                      { value: 'eccastillage', label: 'Accastillage & Confort à Bord' },
                                      { value: 'equipement', label: 'Equipement & Accessoires' },
                                      { value: 'securite', label: 'Naavigation & Sécurité' },
                                      { value: 'sports', label: 'Pneumatiques & Sports Nautiques'},
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