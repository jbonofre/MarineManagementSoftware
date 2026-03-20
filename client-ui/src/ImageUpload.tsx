import React, { useState, useEffect } from 'react';
import { Upload, Image, message, Button, Input, Space } from 'antd';
import { PlusOutlined, DeleteOutlined, InboxOutlined, LinkOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import axios from 'axios';

const { Dragger } = Upload;

interface ImageUploadProps {
    value?: string[];
    onChange?: (urls: string[]) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ value = [], onChange }) => {
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [urlInput, setUrlInput] = useState('');

    const triggerChange = (urls: string[]) => {
        onChange?.(urls);
    };

    const handleUpload: UploadProps['customRequest'] = async (options) => {
        const { file, onSuccess, onError } = options;
        const formData = new FormData();
        formData.append('files', file as File);
        try {
            const res = await axios.post('/images', formData, {
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

    const handlePreview = (url: string) => {
        setPreviewImage(url);
        setPreviewOpen(true);
    };

    return (
        <div>
            {value.length > 0 && (
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
                            <img
                                src={url}
                                alt={`image-${index}`}
                                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'cover', cursor: 'pointer' }}
                                onClick={() => handlePreview(url)}
                            />
                            <div
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    right: 0,
                                    left: 0,
                                    bottom: 0,
                                    background: 'rgba(0,0,0,0.45)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    opacity: 0,
                                    transition: 'opacity 0.2s',
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.opacity = '0'; }}
                            >
                                <Button
                                    type="text"
                                    icon={<DeleteOutlined style={{ color: '#fff', fontSize: 18 }} />}
                                    onClick={() => handleRemove(index)}
                                />
                            </div>
                        </div>
                    ))}
                </div>
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
            {previewOpen && (
                <Image
                    wrapperStyle={{ display: 'none' }}
                    preview={{
                        visible: previewOpen,
                        onVisibleChange: (visible) => setPreviewOpen(visible),
                    }}
                    src={previewImage}
                />
            )}
        </div>
    );
};

export default ImageUpload;
