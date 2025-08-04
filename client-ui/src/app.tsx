import React, { useState } from 'react';
import { Modal, Button, Form, Input, Space, Checkbox, message } from 'antd';
import Login from './login.tsx';

import './app.css';

export default function App() {

    const [ user, setUser ] = useState();

    if (user) {
        return(
            <p>Hello Client</p>
        );
    } else {
        return(
            <Login user={user} setUser={setUser} />
        );
    }

}