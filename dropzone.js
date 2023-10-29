import React, { useState, useRef, useEffect } from 'react';

const Dropzone = ({ onFilesChange, field, onChange }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [files, setFiles] = useState([]);
    const [error, setError] = useState(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);
    const [dragIndex, setDragIndex] = useState(null);

    const dropRef = useRef(null);
    const fileInputRef = useRef(null);
    const fileListRef = useRef(null);

    useEffect(() => {
        const dropEl = dropRef.current;
        const listEl = fileListRef.current;

        // File upload events
        dropEl.addEventListener('dragenter', (e) => handleEventFiles(e, handleFiles));
        dropEl.addEventListener('dragleave', handleDragLeave);
        dropEl.addEventListener('dragover', (e) => handleEventFiles(e, handleFiles));
        dropEl.addEventListener('drop', (e) => handleEventFiles(e, handleFiles));

        // Sorting events
        if (listEl) {
            listEl.addEventListener('dragenter', handleDragEnterSort);
            listEl.addEventListener('dragend', handleDragEnd);
        }

        return () => {
            // Cleanup
            dropEl.removeEventListener('dragenter', (e) => handleEventFiles(e, handleFiles));
            dropEl.removeEventListener('dragleave', handleDragLeave);
            dropEl.removeEventListener('dragover', (e) => handleEventFiles(e, handleFiles));
            dropEl.removeEventListener('drop', (e) => handleEventFiles(e, handleFiles));

            if (listEl) {
                listEl.removeEventListener('dragenter', handleDragEnterSort);
                listEl.removeEventListener('dragend', handleDragEnd);
            }
        };
    }, [files]);

    const updateFiles = (newFiles) => {
        setFiles(newFiles);
        if (onFilesChange) {
            onFilesChange(newFiles, field);
        }
        if (onChange) {
            onChange(newFiles[0]);
        }
    };


    const handleEventFiles = (e, handler) => {
        e.preventDefault();
        e.stopPropagation();
        handler(e.dataTransfer ? e.dataTransfer.files : e.target.files);
    };

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleFiles(e.dataTransfer.files);
        setIsDragging(false);
    };

    const validateFile = (file) => {
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'text/plain'];
        const isValidType = validTypes.includes(file.type);
        const isValidSize = file.size <= 100000000;
        return isValidType && isValidSize;
    };

    const handleFiles = (fileList) => {
        setError(null);
        const validFiles = Array.from(fileList).filter(validateFile);

        if (validFiles.length === 0) {
            setError('Invalid file type or size');
            return;
        }

        updateFiles([...files, ...validFiles]);
    };

    const handleChange = (e) => {
        handleEventFiles(e, handleFiles);
    };

    const removeFile = (index) => {
        const newFiles = [...files];
        newFiles.splice(index, 1);
        updateFiles(newFiles);
    };

    const handleClick = () => {
        fileInputRef.current.click();
    };


    const handleDragStart = (e, index) => {
        setDragIndex(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();

        if (dragIndex === index) return;

        // Swap files and update state
        const newFiles = [...files];
        [newFiles[dragIndex], newFiles[index]] = [newFiles[index], newFiles[dragIndex]];
        updateFiles(newFiles);
        setDragIndex(index);
    };

    const handleDragEnterSort = (e, index) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOverIndex(index);
    };


    const handleDragEnd = (e) => {
        setDragIndex(null);
    };

    return (
        <div className="flex flex-col items-center mt-8 mb-8">
            <div
                ref={dropRef}
                className={`p-6 w-80 h-48 border-4 border-dashed rounded-md transition-all duration-300 ease-in-out ${isDragging ? 'border-blue-400 bg-blue-100' : 'border-gray-300 bg-white'} flex items-center justify-center mb-4 cursor-pointer`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={handleClick}
            >
                <p className={`text-lg ${isDragging ? 'text-blue-500' : 'text-gray-500'}`}>Drop your files here, or click to select files</p>
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleChange}
                />
            </div>
                <div className="w-60">
                    {error && <div className="text-red-500 mb-2">{error}</div>}
                    <div ref={fileListRef}>
                        {files.map((file, index) => {
                            const isDragOver = dragOverIndex === index;
                            if (!file || !file.type) return null;
                            return (
                                <div
                                    key={index}
                                    className={`flex justify-between items-center p-2 bg-white rounded-md shadow-sm mb-2 hover:bg-gray-100 cursor-pointer ${dragIndex === index ? 'bg-gray-300 transform scale-105' : ''} ${isDragOver ? 'bg-green-200' : ''}`}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, index)}
                                    onDragOver={(e) => handleDragOver(e, index)}
                                    onDragEnd={handleDragEnd}
                                >
                                    {file.type.startsWith('image/') && (
                                        <img
                                            src={URL.createObjectURL(file)}
                                            alt={file.name}
                                            className="w-36 h-36 object-cover"
                                        />
                                    )}
                                    <button
                                        className="ml-4 text-red-500"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeFile(index);
                                        }}
                                    >
                                        Remove
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
        </div>
    );

};


export default Dropzone;
