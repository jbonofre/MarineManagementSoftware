import { Card, Row, Col, Space, Image, Button, Form, Input, InputNumber } from 'antd';
import { PlusCircleOutlined, PauseCircleOutlined, DeleteOutlined, DeploymentUnitOutlined } from '@ant-design/icons';
import { demo } from './workspace.tsx';
import { societe } from './data.tsx';

const { TextArea } = Input;

export default function Societe(props) {

    const [form] = Form.useForm();

    const onFinish = (values) => {
        props.societe.nom = values.nom;
        props.societe.siren = values.siren;
        props.societe.siret = values.siret;
        props.societe.ape = values.ape;
        props.societe.rcs = values.rcs;
        props.societe.forme = values.forme;
        props.societe.capital = values.capital;
        props.societe.numerotva = values.numerotva;
        props.societe.adresse = values.adresse;
        props.societe.telephone = values.telephone;
        props.societe.email = values.email;
        props.societe.bancaire = values.bancaire;
    };

    const onReset = () => {
        form.resetFields();
    };

    return(
      <>
      <Card title={<Space><DeploymentUnitOutlined/> Société</Space>}>
        <Row gutter={[16,16]}>
            <Col span={19}>
                <Form name="societe" labelCol={{ span: 8 }}
                    form={form}
                    onFinish={onFinish}
                    wrapperCol={{ span: 16 }}
                    style={{ width: '80%' }} initialValues={societe}>
                    <Form.Item name="nom" label="Nom" required={true} rules={[{required: true, message: 'Le nom est requis'}]}>
                        <Input allowClear={true} />
                    </Form.Item>
                    <Form.Item name="siren" label="SIREN" required={true} rules={[{required: true, message: 'Le SIREN est requis'}]}>
                        <Input allowClear={true} />
                    </Form.Item>
                    <Form.Item name="siret" label="SIRET">
                        <Input allowClear={true} />
                    </Form.Item>
                    <Form.Item name="ape" label="APE">
                        <Input allowClear={true} />
                    </Form.Item>
                    <Form.Item name="rcs" label="RCS">
                        <Input allowClear={true} />
                    </Form.Item>
                    <Form.Item name="forme" label="Forme juridique">
                        <Input allowClear={true} />
                    </Form.Item>
                    <Form.Item name="capital" label="Capital">
                        <InputNumber addonAfter="€" allowClear={true} />
                    </Form.Item>
                    <Form.Item name="numerotva" label="Numéro de TVA">
                        <Input allowClear={true} />
                    </Form.Item>
                    <Form.Item name="adresse" label="Adresse" required={true} rules={[{ required: true, message: 'L\'adresse est requise' }]}>
                        <TextArea rows={6} allowClear={true} />
                    </Form.Item>
                    <Form.Item name="telephone" label="Numéro de téléphone">
                        <Input allowClear={true} />
                    </Form.Item>
                    <Form.Item name="email" label="Email" required={true} rules={[{ required: true, message: 'L\'e-mail est requis' }]}>
                        <Input allowClear={true} />
                    </Form.Item>
                    <Form.Item name="bancaire" label="Coordonnées bancaires">
                        <TextArea rows={6} allowClear={true} />
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
                {
                    societe.images.map((image) => <Space><Image width={200} src={image} /><Button onClick={() => demo()} icon={<DeleteOutlined/>} /></Space> )
                }
                <Button onClick={() => demo()} icon={<PlusCircleOutlined/>}>Ajouter une photo</Button>
                </Space>
            </Col>
        </Row>
      </Card>
      </>
    );

}