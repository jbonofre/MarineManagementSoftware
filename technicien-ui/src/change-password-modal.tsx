import React, { useState } from 'react';
import { Modal, Form, Input, message } from 'antd';
import api from './api.ts';

interface ChangePasswordModalProps {
    technicienId: number;
    open: boolean;
    onClose: () => void;
}

export default function ChangePasswordModal({ technicienId, open, onClose }: ChangePasswordModalProps) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        let values;
        try {
            values = await form.validateFields();
        } catch {
            return;
        }
        if (values.newPassword !== values.confirmPassword) {
            message.error('Les mots de passe ne correspondent pas');
            return;
        }
        setLoading(true);
        try {
            await api.post('/technicien-portal/change-password', {
                technicienId,
                currentPassword: values.currentPassword || '',
                newPassword: values.newPassword,
            });
            message.success('Mot de passe modifie avec succes');
            form.resetFields();
            onClose();
        } catch {
            message.error('Erreur lors du changement de mot de passe');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            open={open}
            title="Changer le mot de passe"
            okText="Confirmer"
            cancelText="Annuler"
            confirmLoading={loading}
            onOk={handleSubmit}
            onCancel={() => { form.resetFields(); onClose(); }}
            destroyOnHidden
        >
            <Form form={form} layout="vertical" autoComplete="off">
                <Form.Item name="currentPassword" label="Mot de passe actuel">
                    <Input.Password />
                </Form.Item>
                <Form.Item
                    name="newPassword"
                    label="Nouveau mot de passe"
                    rules={[{ required: true, message: 'Le nouveau mot de passe est requis' }]}
                >
                    <Input.Password />
                </Form.Item>
                <Form.Item
                    name="confirmPassword"
                    label="Confirmer le mot de passe"
                    rules={[{ required: true, message: 'La confirmation est requise' }]}
                >
                    <Input.Password />
                </Form.Item>
            </Form>
        </Modal>
    );
}
