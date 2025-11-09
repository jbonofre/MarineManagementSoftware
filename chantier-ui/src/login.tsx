import React, { useState } from 'react';
import { Modal, Form, Button, Input, Space, Checkbox, Image, message } from 'antd';

export default function Login(props) {

    const [ loginForm ] = Form.useForm();
    const [ checked, setChecked ] = useState(true);

    return (
        <Modal centered={true} mask={false} title={<Space>Bienvenue sur Marine Management Software <Image width={50} src="/logo.png" preview={false}/></Space>} open={true} okText="Se connecter" cancelText="Effacer" closable={false} onOk={() => loginForm.submit()} onCancel={() => loginForm.resetFields()}>
            <Form name="login" form={loginForm} labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} autoComplete="off" onFinish={(values) => {
                fetch('./users/authenticate', {
                    method: 'POST',
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
                    props.setUser(data.name);
                })
                .catch((error) => {
                    message.error('Une erreur est survenue: ' + error.message);
                    console.error(error)
                })
            }} onKeyUp={(event) => {
                             if (event.keyCode === 13) {
                               loginForm.submit();
                             }
                         }}>
                <Form.Item name="name" label="Utilisateur" rules={[{ required: true, message: 'L\'utilisateur est requis' }]}><Input /></Form.Item>
                <Form.Item name="password" label="Mot de Passe" rules={[{ required: true, message: 'Le mot de passe est requis' }]}><Input.Password /></Form.Item>
            </Form>
        </Modal>
    );

}
