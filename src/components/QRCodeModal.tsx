import React from 'react';
import { Icon } from '@iconify/react';

interface QRCodeModalProps {
  open: boolean;
  onClose: () => void;
  qrCodeImage: string;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({ open, onClose, qrCodeImage }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* 背景遮罩 */}
      <div className="fixed inset-0 bg-black bg-opacity-50"></div>
      
      {/* 弹窗内容 */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">公告二维码</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <Icon icon="ri:close-line" className="w-5 h-5" />
              </button>
            </div>
            <div className="flex justify-center">
              <img
                src={qrCodeImage}
                alt="公告二维码"
                className="max-w-full max-h-[600px]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;
