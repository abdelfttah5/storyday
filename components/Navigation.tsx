import React from 'react';
import { Home, Archive, LayoutDashboard, MessageCircle } from 'lucide-react';
import { ViewState } from '../types';

interface BottomNavProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  isAdmin: boolean;
}

export const Navigation: React.FC<BottomNavProps> = ({ currentView, setView, isAdmin }) => {
  const navItemClass = (isActive: boolean) => 
    `flex flex-col items-center justify-center w-full py-3 transition-all duration-300 ${
      isActive 
        ? 'text-indigo-600 -translate-y-1' 
        : 'text-slate-400 hover:text-slate-600'
    }`;

  const iconContainerClass = (isActive: boolean) =>
    `p-1 rounded-xl transition-all duration-300 ${
      isActive ? 'bg-indigo-50 shadow-sm' : 'bg-transparent'
    }`;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pb-safe">
      {/* Gradient fade above nav */}
      <div className="absolute bottom-full left-0 right-0 h-12 bg-gradient-to-t from-slate-50 to-transparent pointer-events-none" />
      
      <div className="bg-white/90 backdrop-blur-lg border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center h-20 max-w-md mx-auto px-2">
          <button 
            onClick={() => setView('home')} 
            className={navItemClass(currentView === 'home' || currentView === 'form')}
          >
            <div className={iconContainerClass(currentView === 'home' || currentView === 'form')}>
              <Home size={24} strokeWidth={currentView === 'home' ? 2.5 : 2} />
            </div>
            <span className={`text-[10px] mt-1 font-bold ${currentView === 'home' ? 'opacity-100' : 'opacity-70'}`}>الرئيسية</span>
          </button>

          <button 
            onClick={() => setView('chat')} 
            className={navItemClass(currentView === 'chat')}
          >
            <div className={iconContainerClass(currentView === 'chat')}>
              <MessageCircle size={24} strokeWidth={currentView === 'chat' ? 2.5 : 2} />
            </div>
            <span className={`text-[10px] mt-1 font-bold ${currentView === 'chat' ? 'opacity-100' : 'opacity-70'}`}>المساعد</span>
          </button>

          <button 
            onClick={() => setView('archive')} 
            className={navItemClass(currentView === 'archive')}
          >
            <div className={iconContainerClass(currentView === 'archive')}>
              <Archive size={24} strokeWidth={currentView === 'archive' ? 2.5 : 2} />
            </div>
            <span className={`text-[10px] mt-1 font-bold ${currentView === 'archive' ? 'opacity-100' : 'opacity-70'}`}>الأرشيف</span>
          </button>

          {isAdmin && (
            <button 
              onClick={() => setView('admin_stories')} 
              className={navItemClass(currentView.startsWith('admin'))}
            >
              <div className={iconContainerClass(currentView.startsWith('admin'))}>
                <LayoutDashboard size={24} strokeWidth={currentView.startsWith('admin') ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] mt-1 font-bold ${currentView.startsWith('admin') ? 'opacity-100' : 'opacity-70'}`}>الإدارة</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};