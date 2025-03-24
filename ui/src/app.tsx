import React, { useState } from 'react';
import { Modal, Button, Form, Input, Space, Checkbox, message } from 'antd';
import Login from './login.tsx';

export default function App() {

    const [ user, setUser ] = useState();

    if (user) {
        return(
            <Space>Hello</Space>
        );
    } else {
        return(
            <Login />
        );
    }

}