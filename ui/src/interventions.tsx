import { Row, Col, Space, Select, Button, Input } from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';

const { Search } = Input;
const style: React.CSSProperties = { padding: '8px 0' };

export default function Interventions() {
    return(
        <>
            <Row gutter={[16,16]}>
                <Col span={24}>
                    <div style={style}>
                        <Space>
                            <Search placeholder="Recherche" enterButton style={{ width: 350 }}/>
                            <Select mode="tags" placeholder="Status" style={{ width: 350 }} options={[
                                    { value: '', label: ''},
                                    { value: 'devis', label: 'Devis' },
                                    { value: 'reception', label: 'Réception' },
                                    { value: 'encours', label: 'En cours' },
                                    { value: 'terminee', label: 'Terminée' }
                                ]}/>
                            <Button type="primary" icon={<PlusCircleOutlined/>}>Créer une intervention</Button>
                        </Space>
                    </div>
                </Col>
            </Row>
            <Row gutter={[16,16]}>
                <Col span={24}>

                </Col>
            </Row>
        </>
    );
}