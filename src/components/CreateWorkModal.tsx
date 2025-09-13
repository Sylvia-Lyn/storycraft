import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useI18n } from '../contexts/I18nContext';

interface CreateWorkModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (name: string, type: string) => void;
    initialName?: string;
}

const CreateWorkModal: React.FC<CreateWorkModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    initialName = ''
}) => {
    const [workName, setWorkName] = useState(initialName);
    const [workType, setWorkType] = useState('script');
    const inputRef = useRef<HTMLInputElement>(null);
    const { t } = useI18n();

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
            setWorkName(initialName);
        }
    }, [isOpen, initialName]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (workName.trim()) {
            onConfirm(workName.trim(), workType);
            setWorkName('');
            setWorkType('script');
        } else {
            toast.error(t('createWork.pleaseEnterWorkName'));
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
                <h3 className="text-lg font-bold mb-4 text-gray-800">{t('createWork.title')}</h3>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('createWork.workName')}
                        </label>
                        <input
                            ref={inputRef}
                            type="text"
                            value={workName}
                            onChange={(e) => setWorkName(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder={t('createWork.enterWorkName')}
                            maxLength={50}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            {workName.length}/50 {t('createWork.characters')}
                        </p>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('createWork.workType')}
                        </label>
                        <select
                            value={workType}
                            onChange={(e) => setWorkType(e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="script">{t('createWork.script')}</option>
                            <option value="web_novel">{t('createWork.webNovel')}</option>
                            <option value="outline">{t('createWork.outline')}</option>
                            <option value="character">{t('createWork.character')}</option>
                        </select>
                    </div>
                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            disabled={!workName.trim()}
                        >
                            {t('createWork.create')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateWorkModal; 