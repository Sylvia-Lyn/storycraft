import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface CreateWorkModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (name: string) => void;
    initialName?: string;
}

const CreateWorkModal: React.FC<CreateWorkModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    initialName = ''
}) => {
    const [workName, setWorkName] = useState(initialName);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
            setWorkName(initialName);
        }
    }, [isOpen, initialName]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (workName.trim()) {
            onConfirm(workName.trim());
            setWorkName('');
        } else {
            toast.error('请输入作品名称');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
                <h3 className="text-lg font-bold mb-4 text-gray-800">创建新作品</h3>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            作品名称
                        </label>
                        <input
                            ref={inputRef}
                            type="text"
                            value={workName}
                            onChange={(e) => setWorkName(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="请输入作品名称"
                            maxLength={50}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            {workName.length}/50 字符
                        </p>
                    </div>
                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            取消
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            disabled={!workName.trim()}
                        >
                            创建
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateWorkModal; 