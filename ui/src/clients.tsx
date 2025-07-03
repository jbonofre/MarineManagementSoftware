import { Card, Avatar, Col, Row, Space, Input, Select, Button } from 'antd';
import { UserOutlined, PlusCircleOutlined } from '@ant-design/icons';

export default function Clients() {

    const style: React.CSSProperties = { padding: '8px 0' };
    const { Search } = Input;

    return(
        <>
        <Row gutter={[16,16]}>
            <Col span={24}>
                <div style={style}>
                    <Space>
                        <Search placeholder="Recherche client" enterButton style={{ width: 350 }}/>
                        <Select mode="tags" placeholder="Type de client" style={{ width: 350 }} options={[
                              { value: '', label: ''},
                              { value: 'particulier', label: 'Particulier' },
                              { value: 'professionnel', label: 'Professionnel'}
                            ]}/>
                        <Button type="primary" icon={<PlusCircleOutlined/>}>Nouveau Client</Button>
                    </Space>
                </div>
            </Col>
        </Row>
        <Row gutter={[16,16]}>
            <Col span={24}>
            <div style={style}>
                <Card title={<Space><Avatar size="large" icon={<UserOutlined/>}/>Jean-Baptiste Onofré</Space>} style={{ width: '100%' }}>
                    <p>Hello</p>
                </Card>
            </div>
            </Col>
        </Row>
        </>
    );

}