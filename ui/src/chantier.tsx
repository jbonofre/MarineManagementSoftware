import { Card, Row, Col, Space, Image, Button, Form, Input } from 'antd';
import { PlusCircleOutlined, PauseCircleOutlined, DeleteOutlined, DeploymentUnitOutlined } from '@ant-design/icons';
import { demo } from './workspace.tsx';

const { TextArea } = Input;
const adresse = 'ZA Le Band\n29670 Henvic';
const bancaires = 'Banque : CREDIT AGRICOLE CHEQUE\nRIB : 12906000345743433700594\nIBAN : FR7612906000345743433700594\nBIC : AGRIFRPP829';

export default function Chantier(props) {

    return(
      <>
      <Card title={<Space><DeploymentUnitOutlined/> Société</Space>}>
        <Row guttern={[16,16]}>
            <Col span={19}>
                <Form name="chantier" labelCol={{ span: 8 }}
                    wrapperCol={{ span: 16 }}
                    style={{ width: '80%' }}>
                    <Form.Item label="Nom">
                        <Input value="MS Plaisance"/>
                    </Form.Item>
                    <Form.Item label="SIREN">
                        <Input value="790 458 616"/>
                    </Form.Item>
                    <Form.Item label="SIRET">
                        <Input value="790 458 616 00022"/>
                    </Form.Item>
                    <Form.Item label="APE">
                        <Input value="3315Z"/>
                    </Form.Item>
                    <Form.Item label="RCS">
                        <Input value="790458616"/>
                    </Form.Item>
                    <Form.Item label="Forme juridique">
                        <Input value="EURL"/>
                    </Form.Item>
                    <Form.Item label="Capital">
                        <Input value="3500"/>
                    </Form.Item>
                    <Form.Item label="Numéro de TVA">
                        <Input value="FR79790458616"/>
                    </Form.Item>
                    <Form.Item label="Adresse">
                        <TextArea rows={6} value={adresse} />
                    </Form.Item>
                    <Form.Item label="Numéro de téléphone">
                        <Input value="0256455037" />
                    </Form.Item>
                    <Form.Item label="Email">
                        <Input value="contact@msplaisance.com"/>
                    </Form.Item>
                    <Form.Item label="Coordonnées bancaires">
                        <TextArea rows={6} value={bancaires} />
                    </Form.Item>
                    <Form.Item label={null}>
                        <Space>
                            <Button onClick={() => demo()} type="primary" htmlType="submit" icon={<PlusCircleOutlined/>}>Enregistrer</Button>
                            <Button icon={<PauseCircleOutlined/>}>Annuler</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Col>
            <Col span={5}>
                <Space direction="vertical" align="center">
                    <Space><Image width={200} src='https://www.msplaisance.com/img/logo.png' /><Button onClick={() => demo()} icon={<DeleteOutlined/>} /></Space>
                    <Space><Image width={200} src='https://media.bateaux.com/src/applications/showroom/images/images-produit/7003aaf9d3da1267ec84c6892b7f917b.png' /><Button onClick={() => demo()} icon={<DeleteOutlined/>} /></Space>
                    <Space><Image width={200} src='https://media.bateaux.com/src/applications/showroom/images/images-produit/6f20847f0c57af433795fe664fbd2308.jpg' /><Button onClick={() => demo()} icon={<DeleteOutlined/>} /></Space>
                    <Button onClick={() => demo()} icon={<PlusCircleOutlined/>}>Ajouter une photo</Button>
                </Space>
            </Col>
        </Row>
      </Card>
      </>
    );

}