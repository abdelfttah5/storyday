import React from 'react';
import { Video, FileText, Calendar, ChevronLeft } from 'lucide-react';
import { Story } from '../types';

interface StoryCardProps {
  story: Story;
  onClick?: () => void;
  compact?: boolean;
}

export const StoryCard: React.FC<StoryCardProps> = ({ story, onClick, compact = false }) => {
  return (
    <div 
      onClick={onClick}
      className={`group bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden transition-all duration-300 ${
        onClick ? 'cursor-pointer hover:shadow-md hover:border-indigo-100 active:scale-[0.98]' : ''
      }`}
    >
      <div className={`p-4 ${compact ? 'flex items-center gap-4' : ''}`}>
        <div className={`
          flex items-center justify-center rounded-xl transition-colors duration-300
          ${story.type === 'video' ? 'bg-rose-50 text-rose-500 group-hover:bg-rose-100' : 'bg-indigo-50 text-indigo-500 group-hover:bg-indigo-100'}
          ${compact ? 'w-14 h-14 shrink-0' : 'w-full h-40 mb-4'}
        `}>
          {story.type === 'video' ? (
            <Video size={compact ? 24 : 40} strokeWidth={1.5} />
          ) : (
            <FileText size={compact ? 24 : 40} strokeWidth={1.5} />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <Calendar size={12} />
              <span className="dir-ltr">{story.date}</span>
            </div>
            {story.status === 'Today' && (
              <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm">
                جديد اليوم
              </span>
            )}
          </div>
          
          <h3 className={`font-bold text-slate-900 leading-tight truncate ${compact ? 'text-base mb-1' : 'text-lg mb-2'}`}>
            {story.title}
          </h3>
          
          {!compact && (
            <p className="text-slate-500 text-sm leading-relaxed line-clamp-2">
               {story.content}
            </p>
          )}

          {compact && onClick && (
             <div className="flex items-center text-xs text-indigo-600 font-bold mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                قراءة المزيد <ChevronLeft size={12} />
             </div>
          )}
        </div>
      </div>
    </div>
  );
};