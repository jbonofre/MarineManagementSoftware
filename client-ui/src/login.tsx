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

    const handleLogin = async (values: { email: string }) => {
        setLoading(true);
        try {
            const res = await axios.post('/portal/login', { email: values.email });
            setUser(res.data);
        } catch {
            message.error("Aucun compte client trouve avec cet email.");
        } finally {
            setLoading(false);
        }
    };

    return (
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
            </Form>
        </Modal>
    );
}
