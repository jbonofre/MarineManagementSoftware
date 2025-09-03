import { useState, useEffect } from 'react';
import { Card, Row, Col, Space, Image, Button, Form, Input, InputNumber, Spin, message } from 'antd';
import { PlusCircleOutlined, PauseCircleOutlined, DeleteOutlined, DeploymentUnitOutlined, SaveOutlined } from '@ant-design/icons';
import { demo } from './workspace.tsx';

const { TextArea } = Input;

export default function Societe(props) {

    const [ societe, setSociete ] = useState();

    const [ societeForm ] = Form.useForm();
    const [ newImageForm ] = Form.useForm();

    useEffect(() => {
       fetch('./societe')
       .then((response) => {
            if (!response.ok) {
                throw new Error('Erreur (code ' + response.status + ')');
            };
            return response.json();
       })
       .then(data => setSociete(data))
       .catch((error) => {
            message.error('Une erreur est survenue: ' + error.message);
            console.error(error)
       })
    }, []);

    if (!societe) {
        return(<Spin/>);
    }

    let images = [];
    if (societe.images) {
        images = societe.images.map((image) => <Space><Image width={200} src={image} /><Button onClick={() => {
            fetch('./societe', {
                method: 'DELETE',
                headers: {
                    'mms-image': image
                }
            })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Erreur (code ' + response.status + ')');
                }
                return response.json();
            })
            .then(data => {
                setSociete(data);
                message.info('L\'image a été supprimée');
            })
            .catch((error) => {
                message.error('Une erreur est survenue: ' + error.message);
                console.error(error)
            })
        }} icon={<DeleteOutlined/>} /></Space> );
    }

    const updateSocieteFunction = (values) => {
        fetch('./societe', {
            method: 'PUT',
            body: JSON.stringify(values),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Erreur (code ' + response.status + ')');
            }
            return response.json();
        })
        .then((data) => {
            setSociete(data);
            message.info('La société a été mise à jour.')
        })
        .catch((error) => {
            message.error('Une erreur est survenue: ' + error.message);
            console.error(error)
        });
    };

    const addImage = (values) => {
        fetch('./societe', {
            method: 'POST',
            headers: {
                'mms-image': values.image
            }
        })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Erreur (code ' + response.status + ')');
            }
            return response.json();
        })
        .then((data) => {
            setSociete(data);
            message.info('L\'image a été ajoutée')
        })
        .catch((error) => {
            message.error('Une erreur est survenue: ' + error.message);
            console.error(error)
        })
    };

    return(
      <>
      <Card title={<Space><DeploymentUnitOutlined/> Société</Space>}>
        <Row gutter={[16,16]}>
            <Col span={19}>
                <Form name="societe" labelCol={{ span: 8 }}
                    form={societeForm}
                    onFinish={updateSocieteFunction}
                    wrapperCol={{ span: 16 }}
                    style={{ width: '80%' }} initialValues={societe}>
                    <Form.Item name="nom" label="Nom" rules={[{required: true, message: 'Le nom est requis'}]}>
                        <Input allowClear={true} />
                    </Form.Item>
                    <Form.Item name="siren" label="SIREN" rules={[{required: true, message: 'Le SIREN est requis'}]}>
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
                    <Form.Item name="adresse" label="Adresse" rules={[{ required: true, message: 'L\'adresse est requise' }]}>
                        <TextArea rows={6} allowClear={true} />
                    </Form.Item>
                    <Form.Item name="telephone" label="Numéro de téléphone">
                        <Input allowClear={true} />
                    </Form.Item>
                    <Form.Item name="email" label="Email">
                        <Input allowClear={true} />
                    </Form.Item>
                    <Form.Item name="bancaire" label="Coordonnées bancaires">
                        <TextArea rows={6} allowClear={true} />
                    </Form.Item>
                    <Form.Item label={null}>
                        <Space>
                            <Button onClick={() => societeForm.submit()} type="primary" icon={<SaveOutlined/>}>Enregistrer</Button>
                            <Button onClick={() => societeForm.resetFields()} icon={<PauseCircleOutlined/>}>Annuler</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Col>
            <Col span={5}>
                <Space direction="vertical" align="center">
                {images}
                <Form form={newImageForm} component={false} onFinish={addImage}>
                <Space.Compact>
                <Form.Item name="image" rules={[{ required: true, message: 'L\'adresse de l\'image est requise' }]}>
                <Input placeholder="Adresse de l'image" allowClear={true} />
                </Form.Item>
                <Button type="primary" icon={<PlusCircleOutlined/>} onClick={() => newImageForm.submit()}>Ajouter</Button>
                </Space.Compact>
                </Form>
                </Space>
            </Col>
        </Row>
      </Card>
      </>
    );

}