import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumb, Row, Col, Space, Form, Card, Input, InputNumber, Button, Table, Spin, Image, Rate, message } from 'antd';
import { HomeOutlined, PlusCircleOutlined, EditOutlined, DeleteOutlined, LeftCircleOutlined, SaveOutlined, PauseCircleOutlined } from '@ant-design/icons';

const style: React.CSSProperties = { padding: '8px 0' };

function Detail(props) {

    const [ heliceForm ] = Form.useForm();
    const [ newImageForm ] = Form.useForm();
    const [ detail, setDetail ] = useState();
    const [ images, setImages] = useState([]);

    if (props.helice !== 'new') {
        const fetchHelice = () => {
            fetch('./helices/' + props.helice)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Erreur ' + response.status);
                }
                return reposnse.json();
            })
            .then((data) => {
                setDetail(data);
                if (data.images) {
                    setImages(data.images);
                } else {
                    setImages([]);
                }
            })
            .catch((error) => {
                message.error('Une erreur est survenue: ' + error.message);
                console.error(error);
            })
        };

        useEffect(fetchHelice, []);

        if (!detail) {
            return(<Spin/>);
        }
    }

    const imagesRender = images.map((image) =>
        <Space><Image width={200} src={image} /><Button icon={<DeleteOutlined/>} onClick={() => {
            const newImages = images.filter((img) => img !== image);
            setImages(newImages);
        }} /></Space>
    );

    var title = 'Nouvelle hélice';
    if (detail) {
        title = <Space><img width='200px' src={detail.image} /> {detail.marque} {detail.modele}</Space>
    }

    const addImage = (values) => {
        const newImages = [...images,...[values.image]];
        setImages(newImages);
    };

    return(
        <>
        <Breadcrumb items={[
            { title: <Link to="/"><HomeOutlined/></Link> },
            { title: <Button type="text" size="small" onClick={() => props.setHelice(null)} >Hélices</Button> }
        ]} />
        <Card title={title}>
            <Row gutter={[16,16]}>
                <Col span={19}>
                    <Form name="helice" form={heliceForm} labelCol={{ span: 8 }}
                        wrapperCol={{ span: 16 }}
                        style={{ width: '80%' }}
                        initialValues={detail}>
                        <Form.Item name="marque" label="Marque">
                            <Input allowClear={true} />
                        </Form.Item>
                        <Form.Item name="modele" label="Modéle">
                            <Input allowClear={true} />
                        </Form.Item>
                        <Form.Item name="description" label="Description">
                            <Input.TextArea rows={6} allowClear={true} />
                        </Form.Item>
                        <Form.Item name="evaluation" label="Evaluation">
                            <Rate />
                        </Form.Item>
                        <Form.Item name="diametre" label="Diamétre">
                            <InputNumber addonAfter="cm" allowClear={true}/>
                        </Form.Item>
                        <Form.Item name="pas" label="Pas">
                            <Input allowClear={true} />
                        </Form.Item>
                        <Form.Item name="pales" label="Pales">
                            <InputNumber allowClear={true} />
                        </Form.Item>
                        <Form.Item name="cannelures" label="Cannelures">
                            <InputNumber allowClear={true} />
                        </Form.Item>
                        <Form.Item label={null}>
                            <Button type="primary" icon={<SaveOutlined/>} onClick={() => heliceForm.submit()}>Enregistrer</Button>
                            <Button icon={<PauseCircleOutlined/>} onClick={() => heliceForm.resetFields()}>Annuler</Button>
                        </Form.Item>
                    </Form>
                </Col>
                <Col span={5}>
                    <Space direction="vertical" align="center">
                        {imagesRender}
                        <Form form={newImageForm} component={false} onFinish={addImage}>
                        <Space.Compact>
                            <Form.Item name="image" rules={[{ required: true, message: 'L\'adresse de l\'image est requise' }]}>
                                <Input placeholder="Adresse de l'image" allowClear={true} />
                            </Form.Item>
                            <Button type="primary" icon={<PlusCircleOutlined/>} onClick={() => newImageForm.submit()} />
                        </Space.Compact>
                        </Form>
                    </Space>
                </Col>
            </Row>
        </Card>
        </>
    );
}

function List(props) {

    const [ helices, setHelices ] = useState();

    const fetchHelices = () => {
        fetch('./helices')
        .then((response) => {
            if (!response.ok) {
                throw new Error('Erreur ' + response.status);
            }
            return response.json();
        })
        .then((data) => setHelices(data))
        .catch((error) => {
            message.error('Une erreur est survenue: ' + error.message);
            console.error(error);
        })
    };

    useEffect(fetchHelices, []);

    if (!helices) {
        return(<Spin/>);
    }

    const columns = [
        {
            title: 'Modèle',
            key: 'modele',
            dataIndex: 'modele',
        },
        {
            title: 'Marques',
            key: 'marque',
            dataIndex: 'marque',
        },
        {
            title: 'Evaluation',
            key: 'evaluation',
            dataIndex: 'evaluation'
        },
        {
            title: '',
            key: 'action',
            render: (_,record) => (
                <Space>
                    <Button icon={<EditOutlined/>} />
                    <Button icon={<DeleteOutlined/>} />
                </Space>
            ),
        }
    ];

    return(
      <>
      <Row gutter={[16,16]}>
        <Col span={24}>
            <div style={style}>
                <Space>
                    <Input.Search placeholder="Recherche" enterButton style={{ width: 600 }} />
                    <Button type="primary" icon={<PlusCircleOutlined/>} onClick={() => props.setHelice('new')} />
                </Space>
            </div>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
            <Table columns={columns} dataSource={helices} />
        </Col>
      </Row>
      </>
    );
}

export default function Helices() {

    const [ helice, setHelice ] = useState();

    if (helice) {
        return(<Detail helice={helice} setHelice={setHelice} />);
    } else {
        return(<List setHelice={setHelice} />);
    }

}