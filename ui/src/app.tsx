import React, { useState } from 'react';
import { Modal, Button, Form, Input, Space, Checkbox, message } from 'antd';
import Login from './login.tsx';
import Workspace from './workspace.tsx';

import './app.css';

export default function App() {

    const [ user, setUser ] = useState();

    if (user) {
        return(
            <Workspace user={user} setUser={setUser} />
        );
    } else {
        return(
            <Login user={user} setUser={setUser} />
        );
    }

}