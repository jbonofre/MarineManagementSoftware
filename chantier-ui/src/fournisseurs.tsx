import { useState, useEffect } from 'react';
import { Space, Button, Spin, Row, Col, Input, Table, Form, Card, Rate, Popconfirm, message } from 'antd';
import { EditOutlined, DeleteOutlined, LeftCircleOutlined, PauseCircleOutlined, PlusCircleOutlined, SaveOutlined } from '@ant-design/icons';

const style: React.CSSProperties = { padding: '8px 0' };

function Detail(props) {

    const [ fournisseurForm ] = Form.useForm();
    const [ detail, setDetail ] = useState();

    if (props.fournisseur !== 'new') {
        const fetchFournisseur = () => {
            fetch('./fournisseurs/' + props.fournisseur)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Erreur ' + response.status);
                }
                return response.json();
            })
            .then((data) => setDetail(data))
            .catch((error) => {
                message.error('Une erreur est survenue: ' + error.message);
                console.error(error);
            })
        };

        useEffect(fetchFournisseur, []);

        if (!detail) {
            return(<Spin/>);
        }
    }

    var title = <Space>Nouveau Fournisseur</Space>;
    if (detail) {
        title = <Space><img width='200px' src={detail.image} /> {detail.nom}</Space>
    }

    const onFinish = (values) => {
        if (props.fournisseur === 'new') {
            fetch('./fournisseurs', {
                method: 'POST',
                body: JSON.stringify(values),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Erreur ' + response.status);
                }
                return response.json();
            })
            .then((data) => {
                message.info('Fournisseur sauvegardé');
                props.setFournisseur(null);
            })
            .catch((error) => {
                message.error('Une erreur est survenue: ' + error.message);
                console.error(error);
            })
        } else {
            fetch('./fournisseurs/' + props.fournisseur, {
                method: 'PUT',
                body: JSON.stringify(values),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Erreur ' + response.status);
                }
                return response.json();
            })
            .then((data) => {
                message.info('Fournisseur mis à jour');
                props.setFournisseur(null);
            })
            .catch((error) => {
                message.error('Une erreur est survenue: ' + error.message);
                console.error(error);
            })
        }
    };

    return(
       <>
       <Button type="text" onClick={() => props.setFournisseur(null)} icon={<LeftCircleOutlined/>} />
       <Card title={title}>
            <Form name="fournisseur" form={fournisseurForm} labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                style={{ width: '80%' }}
                initialValues={detail}
                onFinish={onFinish}>
                <Form.Item name="nom" label="Nom" rules={[{ required: true, message: 'Le nom est requis' }]}>
                    <Input allowClear={true} />
                </Form.Item>
                <Form.Item name="image" label="URL de l'image">
                    <Input allowClear={true} />
                </Form.Item>
                <Form.Item name="email" label="E-mail">
                    <Input allowClear={true} />
                </Form.Item>
                <Form.Item name="telephone" label="Téléphone">
                    <Input allowClear={true} />
                </Form.Item>
                <Form.Item name="adresse" label="Adresse">
                    <Input.TextArea rows={6} allowClear={true} />
                </Form.Item>
                <Form.Item name="evaluation" label="Evaluation">
                    <Rate />
                </Form.Item>
                <Form.Item name="siren" label="SIREN">
                    <Input allowClear={true} />
                </Form.Item>
                <Form.Item name="siret" label="SIRET">
                    <Input allowClear={true} />
                </Form.Item>
                <Form.Item name="tva" label="Numéro de TVA">
                    <Input allowClear={true} />
                </Form.Item>
                <Form.Item name="naf" label="NAF">
                    <Input allowClear={true} />
                </Form.Item>
                <Form.Item name="connexion" label="Connexion">
                    <Input allowClear={true} />
                </Form.Item>
                <Form.Item label={null}>
                    <Space>
                        <Button type="primary" icon={<SaveOutlined/>} onClick={() => fournisseurForm.submit()}>Enregistrer</Button>
                        <Button icon={<PauseCircleOutlined/>} onClick={() => fournisseurForm.resetFields()}>Annuler</Button>
                    </Space>
                </Form.Item>
            </Form>>
       </Card>
       </>
    );
}

function List(props) {

    const [ fournisseurs, setFournisseurs ] = useState();

    const fetchFournisseurs = () => {
        fetch('./fournisseurs')
        .then((response) => {
            if (!response.ok) {
                throw new Error('Erreur ' + response.status);
            }
            return response.json();
        })
        .then((data) => setFournisseurs(data))
        .catch((error) => {
            message.error('Une erreur est survenue: ' + error.message);
            console.error(error);
        })
    };

    useEffect(fetchFournisseurs, []);

    if (!fournisseurs) {
        return(<Spin/>);
    }

    const deleteFournisseur = (id) => {
        fetch('./fournisseurs/' + id, {
            method: 'DELETE'
        })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Erreur ' + response.status);
            }
        })
        .then((data) => {
            message.info('Fournisseur supprimé');
            fetchFournisseurs();
        })
        .catch((error) => {
            message.error('Une erreur est survenue: ' + error.message);
            console.error(error);
        })
    };

    const columns = [
        {
            title: 'Nom',
            dataIndex: 'nom',
            key: 'nom',
            render: (_,record) => (<Space><img width='30px' src={record.image}/> {record.nom}</Space>),
            sorter: (a,b) => a.nom.localeCompare(b.nom),
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            sorter: (a,b) => a.email.localeCompare(b.email),
        },
        {
            title: 'Téléphone',
            dataIndex: 'telephone',
            key: 'telephone',
            sorter: (a,b) => a.telephone.localeCompare(b.telephone),
        },
        {
            title: 'Evaluation',
            dataIndex: 'evaluation',
            key: 'evaluation',
            render: (_,record) => <Rate defaultValue={record.evaluation} disabled={true} />
        },
        {
            title: '',
            key: 'action',
            render: (_,record) => (
                <Space>
                    <Button icon={<EditOutlined/>} onClick={() => props.setFournisseur(record.id)} />
                    <Popconfirm title="Supprimer le fournisseur"
                            description="Etes-vous sûr de vouloir supprimer le fournisseur ?"
                            onConfirm={() => deleteFournisseur(record.id)}
                            okText="Oui" cancelText="Non">
                        <Button danger icon={<DeleteOutlined/>} />
                    </Popconfirm>
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
                        <Button type="primary" icon={<PlusCircleOutlined/>} onClick={() => props.setFournisseur('new')} />
                    </Space>
                </div>
            </Col>
        </Row>
        <Row gutter={[16,16]}>
            <Col span={24}>
                <Table columns={columns} dataSource={fournisseurs} />
            </Col>
        </Row>
        </>
    );
}

export default function Fournisseurs() {

    const [ fournisseur, setFournisseur] = useState();

    if (fournisseur) {
        return(<Detail fournisseur={fournisseur} setFournisseur={setFournisseur} />);
    } else {
        return(<List fournisseur={fournisseur} setFournisseur={setFournisseur} />);
    }

}