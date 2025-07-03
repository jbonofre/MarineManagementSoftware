import { Card, Avatar, Col, Row, Space, Input, Select, Button, Form, Tabs, Empty, Pagination, DatePicker } from 'antd';
import type { TabsProps } from 'antd';
import { UserOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { ReactComponent as BoatOutlined } from './boat.svg';

function Documents() {
    return(
        <Empty/>
    );
}

function Photos() {
    return(
        <Empty/>
    );
}

function Interventions() {
    return (
        <Empty/>
    );
}

function Entretien() {
    return (
        <Empty/>
    );
}

function Vente() {
    return (
      <Empty/>
    );
}

export default function Parc() {

    const style: React.CSSProperties = { padding: '8px 0' };
    const { Search } = Input;
    const { TextArea } = Input;

    const tabItems: TabsProps['items'] = [
        {
            key: 'photos',
            label: 'Photos',
            children: <Photos/>
        },
        {
            key: 'documents',
            label: 'Documents',
            children: <Documents/>
        },
        {
            key: 'interventions',
            label: 'Interventions',
            children: <Interventions/>
        },
        {
            key: 'programme',
            label: 'Programme Entretien',
            children: <Entretien/>
        },
        {
            key: 'vente',
            label: 'Vente',
            children: <Vente/>
        }
    ];

    return(
        <>
        <Row gutter={[16,16]}>
            <Col span={24}>
                <div style={style}>
                    <Space>
                        <Search placeholder="Recherche" enterButton style={{ width: 350 }}/>
                        <Select mode="tags" placeholder="Type" style={{ width: 350 }} options={[
                              { value: '', label: ''},
                              { value: 'bateaumoteur', label: 'Bateau Moteur' },
                              { value: 'voilier', label: 'Voilier' },
                              { value: 'moteur', label: 'Moteur' },
                              { value: 'remorque', label: 'Remorque' }
                            ]}/>
                        <Button type="primary" icon={<PlusCircleOutlined/>}>Nouveau</Button>
                    </Space>
                </div>
            </Col>
        </Row>
        <Row gutter={[16,16]}>
            <Col span={24}>
            <div style={style}>
                <Card title={<Space><Avatar size="large" icon={<BoatOutlined/>}/>Rosco</Space>} style={{ width: '100%' }}>
                    <Form name="client" labelCol={{ span: 8 }}
                        wrapperCol={{ span: 16 }}
                        style={{ width: '80%' }}
                        initialValues={{ remember: true }}>
                        <Form.Item label="Identifiant" name="identifiant" rules={[{ required: true, message: 'Identifiant requis' }]}>
                            <Input allowClear={true} defaultValue="Rosko" />
                        </Form.Item>
                        <Form.Item label="Numéro" name="numero" rules={[{ required: true, message: 'Le numéro est requis' }]}>
                            <Input allowClear={true} defaultValue="MXDSQDSQ" />
                        </Form.Item>
                        <Form.Item label={null} name="type">
                            <Select defaultValue="bateaumoteur"
                                options={[
                                    { value: 'bateaumoteur', label: 'Bateau Moteur' },
                                    { value: 'voilier', label: 'Voilier' },
                                    { value: 'moteur', label: 'Moteur' },
                                    { value: 'remorque', label: 'Remorque' }
                                ]}/>
                        </Form.Item>
                        <Form.Item label="Date de Mise en Service" name="datemes">
                            <DatePicker/>
                        </Form.Item>
                        <Form.Item label="Date d'Achat" name="dateachat">
                            <DatePicker/>
                        </Form.Item>
                        <Form.Item label="Description" name="description">
                            <TextArea rows={6}/>
                        </Form.Item>
                        <Form.Item label="Propriétaire" name="proprietaire">
                            <Input allowClear={true} defaultValue="Jean-Baptiste Onofré" />
                        </Form.Item>
                        <Form.Item label={null}>
                            <Space>
                            <Button type="primary" htmlType="submit">Enregistrer</Button><Button htmlType="button">Annuler</Button>
                            </Space>
                        </Form.Item>
                    </Form>
                    <Tabs items={tabItems}/>
                </Card>
            </div>
            </Col>
        </Row>
        <Row gutter={[16,16]} justify="center">
            <Pagination align="center" total={2} />
        </Row>
        </>
    );

}