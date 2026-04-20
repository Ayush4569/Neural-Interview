'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { Bell, X } from 'lucide-react';
import api from '@/lib/api';

interface NotificationContextProps {
  showNotification: (title: string, message: string) => void;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [notification, setNotification] = useState<{ title: string; message: string } | null>(null);

  const showNotification = (title: string, message: string) => {
    setNotification({ title, message });
    // Play a subtle sound
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audio.volume = 0.2;
    audio.play().catch(() => {});
    
    setTimeout(() => setNotification(null), 8000);
  };

  // useEffect(() => {
  //   // Check for upcoming interviews every minute
  //   const interval = setInterval(async () => {
  //     const userId = localStorage.getItem('userId');
  //     if (!userId) return;

  //     try {
  //       const res = await api.get('/interviews/my');
        
  //       const now = new Date();
  //       const pending = res.data.interviews.filter((i: any) => 
  //           i.status === 'pending' && 
  //           new Date(i.scheduledAt).getTime() > now.getTime() &&
  //           new Date(i.scheduledAt).getTime() - now.getTime() < 5 * 60 * 1000 // Within 5 minutes
  //       );

  //       if (pending.length > 0) {
  //         showNotification(
  //           "Upcoming Interview!", 
  //           `Your session for ${pending[0].jobTitle} starts in less than 5 minutes.`
  //         );
  //       }
  //     } catch (error) {
  //       // Notification check failures are logged by the api interceptor
  //     }
  //   }, 60000);

  //   return () => clearInterval(interval);
  // }, []);

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
        {notification && (
            <div className="fixed top-20 right-4 z-[100] w-80 glassmorphism p-4 rounded-xl shadow-2xl border-l-4 border-l-primary">
              <div className="flex gap-4">
              <div className="bg-primary/10 p-2 rounded-full h-fit">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm">{notification.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
              </div>
              <button onClick={() => setNotification(null)}>
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            </div>
            <div className="mt-3 flex justify-end">
                <button className="text-[10px] font-bold text-primary hover:underline">VIEW DETAILS</button>
            </div>
            </div>
        )}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotification must be used within NotificationProvider");
  return context;
};
