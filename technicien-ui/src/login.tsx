import React, { useState } from 'react';
import { Modal, Form, Input, Space, Image, message } from 'antd';
import axios from 'axios';

interface Technicien {
    id: number;
    prenom?: string;
    nom: string;
    email?: string;
    telephone?: string;
    couleur?: string;
}

interface LoginProps {
    setUser: (technicien: Technicien) => void;
}

export default function Login({ setUser }: LoginProps) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleLogin = async (values: { email: string; motDePasse?: string }) => {
        setLoading(true);
        try {
            const res = await axios.post('/technicien-portal/login', {
                email: values.email,
                motDePasse: values.motDePasse || ''
            });
            setUser(res.data);
        } catch {
            message.error("Identifiants invalides.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundImage: 'url(./login-background.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
        }}>
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0, 30, 60, 0.5)',
            }} />
            <Modal
                centered
                mask={false}
                title={<Space>Espace Technicien <Image width={50} src="./logo.png" preview={false} /></Space>}
                open
                okText="Se connecter"
                cancelText="Effacer"
                closable={false}
                confirmLoading={loading}
                onOk={() => form.submit()}
                onCancel={() => form.resetFields()}
            >
                <Form
                    name="login"
                    form={form}
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 16 }}
                    autoComplete="off"
                    onFinish={handleLogin}
                    onKeyUp={(event: React.KeyboardEvent) => {
                        if (event.key === 'Enter') {
                            form.submit();
                        }
                    }}
                >
                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: "L'email est requis" },
                            { type: 'email', message: "Format d'email invalide" },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item name="motDePasse" label="Mot de passe">
                        <Input.Password />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
