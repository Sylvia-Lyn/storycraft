import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import QRCodeModal from './QRCodeModal';
import { useI18n } from '../contexts/I18nContext';

interface AnnouncementBarProps {
  onTabClick?: (tab: string) => void;
  featureName: string;
}

const AnnouncementBar: React.FC<AnnouncementBarProps> = ({ onTabClick = () => { }, featureName }) => {
  const { t } = useI18n();
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
    <div className="w-full z-30">
      <div className="px-4 py-2">
        <div className="bg-pink-50 border-2 border-red-300 rounded-lg shadow-md">
          <div className="flex items-center justify-between px-4 py-2">
            {/* 公告文字 - 可点击区域 */}
            <div
              className="flex-1 text-center text-sm cursor-pointer text-red-600 hover:text-red-700 transition-colors"
              onClick={handleAnnouncementClick}
            >
              <span>{t('announcementBar.clickToUnlock', { featureName })}</span>
            </div>

            {/* 关闭按钮 */}
            <button
              onClick={handleClose}
              className="text-red-400 hover:text-red-600 ml-4 flex items-center justify-center w-6 h-6 rounded-full transition-colors"
              aria-label={t('announcementBar.closeAnnouncement')}
              title={t('announcementBar.closeAnnouncement')}
            >
              ×
            </button>
          </div>
        </div>
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
