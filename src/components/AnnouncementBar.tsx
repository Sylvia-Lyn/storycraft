import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import QRCodeModal from './QRCodeModal';

interface AnnouncementBarProps {
  onTabClick?: (tab: string) => void;
}

const AnnouncementBar: React.FC<AnnouncementBarProps> = ({ onTabClick = () => {} }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isQRCodeModalOpen, setIsQRCodeModalOpen] = useState(false);
  const qrCodeImage = 'src/assets/fufei.jpg';

  const handleAnnouncementClick = () => {
    setIsQRCodeModalOpen(true);
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVisible(false);
    onTabClick('close');
  };

  if (!isVisible) return null;

  return (
    <div className="w-full bg-red-500 text-white">
      <div className="max-w-[1400px] mx-auto px-4 py-2 flex items-center justify-between w-full">
        {/* 公告文字 - 可点击区域 */}
        <div 
          className="flex-1 text-center text-sm cursor-pointer"
          onClick={handleAnnouncementClick}
        >
          <span>公告：点击查看详情</span>
        </div>
        
        {/* 关闭按钮 */}
        <button 
          onClick={handleClose}
          className="text-white hover:bg-red-600 ml-4 flex items-center justify-center w-6 h-6 rounded-full transition-colors"
          aria-label="关闭公告"
          title="关闭公告"
        >
          ×
        </button>
      </div>

      {/* 二维码弹窗 */}
      <QRCodeModal
        open={isQRCodeModalOpen}
        onClose={() => setIsQRCodeModalOpen(false)}
        qrCodeImage={qrCodeImage}
      />
    </div>
  );
};

export default AnnouncementBar;
