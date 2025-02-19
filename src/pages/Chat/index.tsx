import { isMobile } from '@/utils/deviceDetect';
import React, { useEffect, useState } from 'react';
import MobileChat from './mobile';
import WebChat from './web';

const ChatPage: React.FC = () => {
  const [isMobileView, setIsMobileView] = useState(isMobile());

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    const handleResize = () => setIsMobileView(mediaQuery.matches);

    mediaQuery.addEventListener('change', handleResize);
    return () => mediaQuery.removeEventListener('change', handleResize);
  }, []);

  return isMobileView ? <MobileChat /> : <WebChat />;
};

export default ChatPage;
