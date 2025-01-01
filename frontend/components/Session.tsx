'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

const SessionWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const router = useRouter();
    // useEffect(() => {
    //   window.scrollTo(0, 0);
    // }, []); // Runs when layout is mounted
  
      useEffect(() => {
      const handleCookieChange = () => {
        const token = Cookies.get('token');
        if (!token) {
          router.push('/login?unauthorized=true');
        }
      };
  
      const cookieChangeInterval = setInterval(handleCookieChange, 5000);
  
      return () => clearInterval(cookieChangeInterval);
    }, [router]);
  
    return <>{children}</>;
  };

export default SessionWrapper;