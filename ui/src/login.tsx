import React, { useState } from 'react';
import { Modal, Form, Button, Input, Space, Checkbox, Image, message } from 'antd';

export default function Login(props) {

    const [ loginForm ] = Form.useForm();
    const [ checked, setChecked ] = useState(true);

    return (
        <Modal centered={true} mask={false} title={<Space>Bienvenue sur ShipyardSo <Image width={50} src="./logo.png" preview={false}/></Space>} open={true} okText="Se connecter" cancelText="Effacer" closable={false} onOk={() => loginForm.submit()} onCancel={() => loginForm.resetFields()}>
            <Form name="login" form={loginForm} labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} autoComplete="off" onFinish={(values) => {
                if (values.username !== 'admin' && values.username !== 'msplaisance' && values.username !== 'franck') {
                    message.error("L'utilisateur ou le mot de passe ne sont pas correct.");
                } else {
                    props.setUser(values.username);
                }
            }} onKeyUp={(event) => {
                             if (event.keyCode === 13) {
                               loginForm.submit();
                             }
                         }}>
                <Form.Item name="username" label="Utilisateur" rules={[{ required: true, message: 'L\'utilisateur est requis' }]}><Input /></Form.Item>
                <Form.Item name="password" label="Mot de Passe" rules={[{ required: true, message: 'Le mot de passe est requis' }]}><Input.Password /></Form.Item>
                <Form.Item name="remember"><Checkbox checked={checked} onChange={() => {
                    if (checked === true) {
                        setChecked(false);
                    } else {
                        setChecked(true);
                    }
                }}>Se souvenir de moi</Checkbox></Form.Item>
            </Form>
        </Modal>
    );

}