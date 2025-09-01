import { Card, Row, Col, Space, Image, Button, Form, Input, message } from 'antd';
import { PlusCircleOutlined, PauseCircleOutlined, DeleteOutlined, DeploymentUnitOutlined } from '@ant-design/icons';
import { demo } from './workspace.tsx';

const { TextArea } = Input;

export default function Chantier(props) {

    const [form] = Form.useForm();

    const onFinish = (values) => {
        props.chantier.nom = values.nom;
        props.chantier.siren = values.siren;
        props.chantier.siret = values.siret;
        props.chantier.ape = values.ape;
        props.chantier.rcs = values.rcs;
        props.chantier.forme = values.forme;
        props.chantier.capital = values.capital;
        props.chantier.numerotva = values.numerotva;
        props.chantier.adresse = values.adresse;
    };

    const onReset = () => {
        form.resetFields();
    };

    return(
      <>
      <Card title={<Space><DeploymentUnitOutlined/> Société</Space>}>
        <Row guttern={[16,16]}>
            <Col span={19}>
                <Form name="chantier" labelCol={{ span: 8 }}
                    form={form}
                    onFinish={onFinish}
                    wrapperCol={{ span: 16 }}
                    style={{ width: '80%' }}>
                    <Form.Item name="nom" label="Nom" initialValue={props.chantier.nom} required={true} rules={[{required: true, message: 'Le nom est requis'}]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="siren" label="SIREN" initialValue={props.chantier.siren} required={true} rules={[{required: true, message: 'Le SIREN est requis'}]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="siret" label="SIRET" initialValue={props.chantier.siret}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="ape" label="APE" initialValue={props.chantier.ape}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="rcs" label="RCS" initialValue={props.chantier.rcs}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="forme" label="Forme juridique" initialValue={props.chantier.forme}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="capital" label="Capital" initialValue={props.chantier.capital}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="numerotva" label="Numéro de TVA" initialValue={props.chantier.numerotva}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="adresse" label="Adresse" initialValue={props.chantier.adresse}>
                        <TextArea rows={6} />
                    </Form.Item>
                    <Form.Item name="telephone" label="Numéro de téléphone" initialValue={props.chantier.telephone}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="email" label="Email" initialValue={props.chantier.email}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="bancaire" label="Coordonnées bancaires" initialValue={props.chantier.bancaire}>
                        <TextArea rows={6} />
                    </Form.Item>
                    <Form.Item label={null}>
                        <Space>
                            <Button onClick={form.submit()} type="primary" htmlType="submit" icon={<PlusCircleOutlined/>}>Enregistrer</Button>
                            <Button onClick={onReset} icon={<PauseCircleOutlined/>}>Annuler</Button>
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