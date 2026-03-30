import React, { useState } from 'react';
import { Modal, Form, Button, Input, Space, Image, message } from 'antd';
import axios from 'axios';

interface Client {
    id: number;
    prenom?: string;
    nom: string;
    type: string;
    email?: string;
    telephone?: string;
    adresse?: string;
}

interface LoginProps {
    setUser: (client: Client) => void;
}

export default function Login({ setUser }: LoginProps) {
    const [loginForm] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleLogin = async (values: { email: string; password?: string }) => {
        setLoading(true);
        try {
            const res = await axios.post('/portal/login', { email: values.email, password: values.password });
            const { token, ...userData } = res.data;
            localStorage.setItem('moussaillon-client-token', token);
            localStorage.setItem('moussaillon-client-user', JSON.stringify(userData));
            setUser(userData);
        } catch {
            message.error("Email ou mot de passe incorrect.");
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
                title={<Space>Espace Client <Image width={50} src="./logo.png" preview={false} /></Space>}
                open
                okText="Se connecter"
                cancelText="Effacer"
                closable={false}
                confirmLoading={loading}
                onOk={() => loginForm.submit()}
                onCancel={() => loginForm.resetFields()}
            >
                <Form
                    name="login"
                    form={loginForm}
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 16 }}
                    autoComplete="off"
                    onFinish={handleLogin}
                    onKeyUp={(event: React.KeyboardEvent) => {
                        if (event.key === 'Enter') {
                            loginForm.submit();
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
                    <Form.Item
                        name="password"
                        label="Mot de passe"
                        rules={[{ required: true, message: 'Le mot de passe est requis' }]}
                    >
                        <Input.Password />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
