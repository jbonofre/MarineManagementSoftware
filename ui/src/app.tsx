import React, { useState } from 'react';
import type { FormProps } from 'antd';
import { Modal, Button, Form, Input, Space, Checkbox, message } from 'antd';

type FieldType = {
    username?: string;
    password?: string;
    remember?: string;
}

const onFinish: FormProps<FieldType>['onFinish'] = (values) => {
    console.log('Success:', values);
};

const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (values) => {
    console.log('Failed:', values);
};

export default function App() {

    const [ user, setUser ] = useState();
    const [ loginForm ] = Form.useForm();

    if (user) {
        return(
            <Space>Hello</Space>
        );
    } else {
        return(
            <Modal centered mask={false} title="Bienvenue sur ShipyardSo" open={true} okText="Se connecter" cancelText="Effacer" closable={false} onOK={loginForm.submit} onCancel={() => loginForm.resetFields()}>
                 <Form name="login" form={loginForm} labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} autoComplete="off" onFinish={(values) => {
                   if (values.username !== 'admin' && values.username !== 'msplaisance' && values.username !== 'franck') {
                       message.error("Please use valid user");
                   } else {
                       setUser(values.username);
                   }
                 }} onKeyUp={(event) => {
                     if (event.keyCode === 13) {
                       loginForm.submit();
                     }
                 }}>
                      <Form.Item name="username" label="Username" rules={[{ required: true, message: 'Please input a persona username!' }]}><Input /></Form.Item>
                      <Form.Item name="password" label="Password" rules={[{ required: true }]}><Input.Password /></Form.Item>
                      <Form.Item name="remember"><Checkbox>Remember me</Checkbox></Form.Item>
                 </Form>
            </Modal>
        );
    }

}