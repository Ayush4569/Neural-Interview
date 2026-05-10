'use client';

import { createContext, useContext, useState } from 'react';
import { Bell, X } from 'lucide-react';

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

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
        {notification && (
            <div className="fixed top-20 right-4 z-[100] w-80 bg-[#161920] border border-gray-800 p-4 rounded-xl shadow-2xl border-l-4 border-l-purple-500 text-white">
              <div className="flex gap-4">
              <div className="bg-purple-500/10 p-2 rounded-full h-fit">
                <Bell className="h-5 w-5 text-purple-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm tracking-wide">{notification.title}</h4>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">{notification.message}</p>
              </div>
              <button onClick={() => setNotification(null)}>
                <X className="h-4 w-4 text-gray-500 hover:text-white" />
              </button>
            </div>
            <div className="mt-3 flex justify-end">
                <button className="text-[10px] font-bold tracking-widest text-purple-400 hover:text-purple-300">DISMISS</button>
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
