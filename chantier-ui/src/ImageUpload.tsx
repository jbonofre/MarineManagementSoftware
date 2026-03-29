import React, { useState } from 'react';
import { Upload, Image, message, Button, Input, Space } from 'antd';
import { DeleteOutlined, InboxOutlined, LinkOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import api from './api.ts';

const { Dragger } = Upload;

interface ImageUploadProps {
    value?: string[];
    onChange?: (urls: string[]) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ value = [], onChange }) => {
    const [urlInput, setUrlInput] = useState('');

    const triggerChange = (urls: string[]) => {
        onChange?.(urls);
    };

    const handleUpload: UploadProps['customRequest'] = async (options) => {
        const { file, onSuccess, onError } = options;
        const formData = new FormData();
        formData.append('files', file as File);
        try {
            const res = await api.post('/images', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            const urls: string[] = res.data;
            if (urls.length > 0) {
                triggerChange([...value, ...urls]);
            }
            onSuccess?.(res.data);
        } catch (err) {
            message.error("Erreur lors de l'upload de l'image");
            onError?.(err as Error);
        }
    };

    const handleRemove = (index: number) => {
        const newUrls = value.filter((_, i) => i !== index);
        triggerChange(newUrls);
    };

    const handleAddUrl = () => {
        const trimmed = urlInput.trim();
        if (trimmed) {
            triggerChange([...value, trimmed]);
            setUrlInput('');
        }
    };

    return (
        <div>
            {value.length > 0 && (
                <Image.PreviewGroup>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                        {value.map((url, index) => (
                            <div
                                key={index}
                                style={{
                                    position: 'relative',
                                    width: 104,
                                    height: 104,
                                    border: '1px solid #d9d9d9',
                                    borderRadius: 8,
                                    overflow: 'hidden',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: '#fafafa',
                                }}
                            >
                                <Image
                                    src={url}
                                    alt={`image-${index}`}
                                    width={104}
                                    height={104}
                                    style={{ objectFit: 'cover' }}
                                />
                                <Button
                                    type="text"
                                    size="small"
                                    icon={<DeleteOutlined style={{ color: '#fff', fontSize: 14 }} />}
                                    onClick={(e) => { e.stopPropagation(); handleRemove(index); }}
                                    style={{
                                        position: 'absolute',
                                        top: 2,
                                        right: 2,
                                        zIndex: 1,
                                        background: 'rgba(0,0,0,0.5)',
                                        borderRadius: '50%',
                                        width: 24,
                                        height: 24,
                                        minWidth: 24,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                </Image.PreviewGroup>
            )}
            <Dragger
                multiple
                showUploadList={false}
                customRequest={handleUpload}
                accept="image/*"
                style={{ marginBottom: 8 }}
            >
                <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                </p>
                <p className="ant-upload-text">Cliquer ou glisser-déposer des images ici</p>
                <p className="ant-upload-hint">Formats acceptés : JPG, PNG, GIF, WebP</p>
            </Dragger>
            <Space.Compact style={{ width: '100%', marginTop: 8 }}>
                <Input
                    prefix={<LinkOutlined />}
                    placeholder="Ou ajouter une URL d'image"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onPressEnter={handleAddUrl}
                />
                <Button onClick={handleAddUrl}>Ajouter</Button>
            </Space.Compact>
        </div>
    );
};

export default ImageUpload;
