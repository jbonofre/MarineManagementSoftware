import React, { useState } from 'react';
import { Modal, Button, Form, Input, Space, Checkbox, message } from 'antd';
import Login from './login.tsx';
import Workspace from './workspace.tsx';

import './app.css';

export default function App() {

    const [ user, setUser ] = useState(() => {
        const stored = localStorage.getItem('moussaillon-user');
        return stored ? JSON.parse(stored) : null;
    });

    const handleSetUser = (u) => {
        if (u) {
            setUser(u);
        } else {
            localStorage.removeItem('moussaillon-token');
            localStorage.removeItem('moussaillon-user');
            setUser(null);
        }
    };

    if (user) {
        return(
            <Workspace user={user.name} roles={user.roles} setUser={handleSetUser} />
        );
    } else {
        return(
            <Login user={user} setUser={handleSetUser} />
        );
    }

}
