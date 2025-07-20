import React, { useState, useRef } from 'react';
import { Upload, X, File, FileText, FileImage } from 'lucide-react';

const FileUpload = ({ chatId, onFileUploaded, onFileDeleted }) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const fileInputRef = useRef(null);

    const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
        'text/plain',
        'text/markdown',
        'application/rtf'
    ];

    const getFileIcon = (fileType) => {
        switch (fileType) {
            case 'pdf':
                return <File className="w-4 h-4" />;
            case 'docx':
            case 'doc':
                return <FileText className="w-4 h-4" />;
            case 'txt':
            case 'md':
                return <FileText className="w-4 h-4" />;
            default:
                return <File className="w-4 h-4" />;
        }
    };

    const getFileType = (filename) => {
        const ext = filename.split('.').pop().toLowerCase();
        return ext;
    };

    const handleFileSelect = async (files) => {
        const fileArray = Array.from(files);
        await uploadFiles(fileArray);
    };

    const uploadFiles = async (files) => {
        setUploading(true);

        for (const file of files) {
            if (!allowedTypes.includes(file.type)) {
                alert(`File type not supported: ${file.name}. Supported types: PDF, DOCX, DOC, TXT, MD, RTF`);
                continue;
            }

            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                alert(`File too large: ${file.name}. Maximum size: 10MB`);
                continue;
            }

            const formData = new FormData();
            formData.append('file', file);

            try {
                const response = await fetch(`/api/chats/${chatId}/files`, {
                    method: 'POST',
                    body: formData,
                });

                if (response.ok) {
                    const uploadedFile = await response.json();
                    setUploadedFiles(prev => [...prev, uploadedFile]);
                    if (onFileUploaded) {
                        onFileUploaded(uploadedFile);
                    }
                } else {
                    const error = await response.json();
                    alert(`Error uploading ${file.name}: ${error.detail}`);
                }
            } catch (error) {
                console.error('Upload error:', error);
                alert(`Error uploading ${file.name}: ${error.message}`);
            }
        }

        setUploading(false);
    };

    const deleteFile = async (fileId) => {
        try {
            const response = await fetch(`/api/chats/${chatId}/files/${fileId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
                if (onFileDeleted) {
                    onFileDeleted(fileId);
                }
            } else {
                alert('Error deleting file');
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('Error deleting file');
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        const files = e.dataTransfer.files;
        handleFileSelect(files);
    };

    const loadExistingFiles = async () => {
        try {
            const response = await fetch(`/api/chats/${chatId}/files`);
            if (response.ok) {
                const data = await response.json();
                setUploadedFiles(data.files || []);
            }
        } catch (error) {
            console.error('Error loading files:', error);
        }
    };

    // Load existing files when component mounts
    React.useEffect(() => {
        if (chatId) {
            loadExistingFiles();
        }
    }, [chatId]);

    return (
        <div className="file-upload-container">
            {/* Upload Area */}
            <div
                className={`upload-area ${isDragOver ? 'drag-over' : ''} ${uploading ? 'uploading' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.docx,.doc,.txt,.md,.rtf"
                    onChange={(e) => handleFileSelect(e.target.files)}
                    style={{ display: 'none' }}
                />
                <Upload className="w-8 h-8 text-gray-400" />
                <p className="text-sm text-gray-600">
                    {uploading ? 'Uploading...' : 'Drop files here or click to upload'}
                </p>
                <p className="text-xs text-gray-500">
                    Supported: PDF, DOCX, DOC, TXT, MD, RTF (max 10MB)
                </p>
            </div>

            {/* Uploaded Files List */}
            {uploadedFiles.length > 0 && (
                <div className="uploaded-files">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Uploaded Files:</h4>
                    <div className="space-y-2">
                        {uploadedFiles.map((file) => (
                            <div key={file.id} className="file-item">
                                <div className="file-info">
                                    {getFileIcon(getFileType(file.original_filename))}
                                    <span className="file-name">{file.original_filename}</span>
                                    <span className="file-size">
                                        ({(file.file_size / 1024).toFixed(1)} KB)
                                    </span>
                                </div>
                                <button
                                    onClick={() => deleteFile(file.id)}
                                    className="delete-btn"
                                    title="Delete file"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FileUpload; 