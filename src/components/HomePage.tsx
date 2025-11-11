import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function HomePage() {
  const navigate = useNavigate();

  useEffect(() => {
    // 直接导航到一键创作页面
    navigate('/app/shortplay-entry', { replace: true });
  }, [navigate]);

  return null;
}

export default HomePage; 