import React, { useState, useEffect, useRef } from 'react';
import { Navigation } from './components/Navigation';
import { StoryCard } from './components/PhoneMockup';
import { Story, StudentResponse, ViewState, StoryStatus, ChatMessage } from './types';
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { 
  FileText, Send, ShieldCheck, 
  CheckCircle2, ArrowRight, MessageSquare, Plus, X, BookOpen, LogOut,
  Trash2, Users, Video, Lock, Save, Link as LinkIcon, RefreshCw, Pencil,
  Bot, Sparkles, User, Info, Play, ExternalLink, GraduationCap, Star,
  ChevronLeft, Archive
} from 'lucide-react';

// --- HELPER FUNCTIONS ---
const getYoutubeId = (url: string) => {
  if (!url) return null;
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?v=)|(shorts\/))([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[8].length === 11) ? match[8] : null;
};

const getYoutubeEmbedUrl = (videoId: string) => {
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
};

const getYoutubeThumbnail = (videoId: string) => {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
};

// Safe LocalStorage Helper
const safeLocalStorage = {
  get(key: string): string | null {
    if (typeof window === 'undefined') return null;
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key: string, value: string) {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // Ignore errors
    }
  }
};

// --- COMPONENTS ---

const YouTubeEmbed = ({ url }: { url: string }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoId = getYoutubeId(url);

  if (!videoId) return <div className="bg-slate-900 text-white p-6 rounded-xl text-center text-sm">رابط الفيديو غير صالح</div>;

  return (
    <div className="flex flex-col rounded-xl overflow-hidden shadow-lg bg-black">
      <div className="w-full aspect-video bg-black relative group cursor-pointer">
        {!isPlaying ? (
          <button 
            onClick={() => setIsPlaying(true)}
            className="absolute inset-0 w-full h-full flex items-center justify-center bg-cover bg-center transition-transform hover:scale-105 duration-700"
            style={{ backgroundImage: `url(${getYoutubeThumbnail(videoId)})` }}
          >
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-300"></div>
            <div className="w-16 h-16 bg-red-600/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl scale-90 group-hover:scale-100 transition-all duration-300 z-10 border-4 border-white/20">
              <Play fill="white" className="text-white ml-1" size={32} />
            </div>
          </button>
        ) : (
          <iframe 
            src={getYoutubeEmbedUrl(videoId)} 
            className="w-full h-full"
            title="Story Video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
            allowFullScreen
          ></iframe>
        )}
      </div>
      
      <a
        href={`https://www.youtube.com/watch?v=${videoId}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 py-3 bg-slate-900 text-white hover:bg-slate-800 font-medium transition-colors text-xs"
      >
        <ExternalLink size={14} />
        <span>مشاهدة على تطبيق YouTube</span>
      </a>
    </div>
  );
};

const AboutCard = () => (
    <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 rounded-2xl p-6 text-white shadow-xl shadow-indigo-200/50 relative overflow-hidden mt-6 mb-8 group">
        <div className="absolute top-0 left-0 w-40 h-40 bg-white/5 rounded-full -translate-x-10 -translate-y-10 blur-3xl group-hover:bg-white/10 transition-colors duration-700"></div>
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-purple-500/20 rounded-full translate-x-10 translate-y-10 blur-3xl group-hover:bg-purple-500/30 transition-colors duration-700"></div>
        
        <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md shadow-inner">
                    <GraduationCap size={24} className="text-indigo-200" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">عن مبادرة "قصتي اليوم"</h3>
                  <p className="text-indigo-200 text-xs opacity-80">تعليم • متعة • ابتكار</p>
                </div>
            </div>
            
            <p className="text-indigo-50 text-sm leading-relaxed mb-6 text-justify opacity-90">
                منصة تعليمية تفاعلية تهدف لغرس القيم التربوية وتعزيز مهارات اللغة العربية. ندمج بين سحر القصة وتقنيات الذكاء الاصطناعي لنقدم تجربة تعلم يومية ملهمة لأبنائنا الطلاب.
            </p>

            <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/5 flex items-center gap-3">
                    <div className="bg-yellow-400/20 p-1.5 rounded-lg">
                      <Star size={14} className="text-yellow-300" />
                    </div>
                    <span className="text-xs font-bold">قيم تربوية</span>
                </div>
                <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/5 flex items-center gap-3">
                    <div className="bg-blue-400/20 p-1.5 rounded-lg">
                      <Bot size={14} className="text-blue-300" />
                    </div>
                    <span className="text-xs font-bold">مساعد ذكي</span>
                </div>
            </div>
        </div>
    </div>
);

// --- INITIAL DATA ---
const INITIAL_STORIES: Story[] = [];
const INITIAL_RESPONSES: StudentResponse[] = [];

const App: React.FC = () => {
  const DEFAULT_SHEET_URL = "https://script.google.com/macros/s/AKfycbzzAe3RDpbe895RvxIEeIKN7OXllBBwkh1z7uydMWQ61R7-SyvgzyvfzYrL8xX9dxJE/exec";
  
  const [googleSheetUrl, setGoogleSheetUrl] = useState(() => safeLocalStorage.get('sheet_url') || DEFAULT_SHEET_URL);
  const [stories, setStories] = useState<Story[]>(INITIAL_STORIES);
  const [responses, setResponses] = useState<StudentResponse[]>(INITIAL_RESPONSES);
  const [view, setView] = useState<ViewState>('home');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'error' | 'idle'>('idle');
  
  // Login State
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginInput, setLoginInput] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [adminPassword, setAdminPassword] = useState(() => safeLocalStorage.get('admin_pwd') || '1234');

  // Info/About Modal State
  const [showAboutModal, setShowAboutModal] = useState(false);

  // Settings State
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [passwordMessage, setPasswordMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // Form State
  const [formData, setFormData] = useState({ name: '', class: '', answer: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatThinking, setIsChatThinking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [chatSession, setChatSession] = useState<Chat | null>(null);

  // Archive Viewing State
  const [selectedArchiveStory, setSelectedArchiveStory] = useState<Story | null>(null);

  // Admin Manage State
  const [showAddStory, setShowAddStory] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newStory, setNewStory] = useState<{
    id?: string;
    title: string;
    content: string;
    question: string;
    date: string;
    type: 'text' | 'video';
    videoUrl: string;
  }>({
    title: '',
    content: '',
    question: '',
    date: new Date().toISOString().split('T')[0],
    type: 'text',
    videoUrl: ''
  });

  const displayStory = selectedArchiveStory || (stories.length > 0 ? stories[0] : null);

  // --- MAIN DATA FETCHING ---
  const fetchData = async () => {
      setIsLoading(true);
      setConnectionStatus('idle');
      try {
        const cacheBuster = `?t=${new Date().getTime()}`;
        const response = await fetch(googleSheetUrl + cacheBuster, {
            method: 'GET',
            redirect: 'follow'
        });
        
        if (!response.ok) throw new Error("Network response was not ok");
        
        const data = await response.json();
        
        if (data.stories && Array.isArray(data.stories)) {
          const sortedStories = data.stories.sort((a: any, b: any) => 
            new Date(b.date || b.Date).getTime() - new Date(a.date || a.Date).getTime()
          );
          
          const mappedStories: Story[] = sortedStories.map((s: any, index: number) => {
            const rawVideoUrl = s.videoUrl || s.VideoUrl || '';
            return {
              id: String(s.id || s.Id || Math.random()),
              date: s.date || s.Date ? new Date(s.date || s.Date).toISOString().split('T')[0] : '',
              title: s.title || s.Title || 'بدون عنوان',
              type: (s.type === 'video' || s.Type === 'video' || s.type === 'فيديو') ? 'video' : 'text',
              content: s.content || s.Content || '',
              videoUrl: rawVideoUrl,
              question: s.question || s.Question || '',
              status: index === 0 ? 'Today' : 'Archive' as StoryStatus
            };
          });
          setStories(mappedStories);
        }

        if (data.responses && Array.isArray(data.responses)) {
            const mappedResponses: StudentResponse[] = data.responses.map((r: any, idx: number) => ({
                id: String(r.id || r.Id || idx),
                timestamp: r.timestamp || r.Timestamp || r.date || new Date().toISOString(),
                storyId: '',
                storyTitle: r.storyTitle || r.StoryTitle || 'قصة عامة',
                studentName: r.studentName || r.name || r.Name || 'طالب',
                className: r.className || r.class || r.Class || '',
                answer: r.answer || r.Answer || ''
            }));
            const sortedResponses = mappedResponses.reverse();
            setResponses(sortedResponses);
        }
        setConnectionStatus('connected');

      } catch (error) {
        console.error("Failed to fetch data", error);
        setConnectionStatus('error');
      } finally {
        setIsLoading(false);
      }
  };

  useEffect(() => {
    fetchData();
  }, [googleSheetUrl]);

  // Reset Chat when story changes
  useEffect(() => {
    if (displayStory) {
      setChatMessages([]);
      setChatSession(null);
    }
  }, [displayStory?.id]);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatThinking]);

  // --- HANDLERS ---
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginInput === adminPassword) {
      setIsAdmin(true);
      setShowLoginModal(false);
      setLoginInput('');
      setLoginError(false);
      setView('admin_stories');
      fetchData();
    } else {
      setLoginError(true);
    }
  };

  const handleUpdateSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);
    safeLocalStorage.set('sheet_url', googleSheetUrl);

    if (newPasswordInput) {
      if (currentPasswordInput !== adminPassword) {
        setPasswordMessage({ type: 'error', text: 'كلمة المرور الحالية غير صحيحة' });
        return;
      }
      if (newPasswordInput.length < 4) {
        setPasswordMessage({ type: 'error', text: 'كلمة المرور قصيرة جداً' });
        return;
      }
      if (newPasswordInput !== confirmPasswordInput) {
        setPasswordMessage({ type: 'error', text: 'كلمات المرور غير متطابقة' });
        return;
      }
      setAdminPassword(newPasswordInput);
      safeLocalStorage.set('admin_pwd', newPasswordInput);
      setCurrentPasswordInput('');
      setNewPasswordInput('');
      setConfirmPasswordInput('');
    }
    setPasswordMessage({ type: 'success', text: 'تم حفظ الإعدادات بنجاح' });
    setTimeout(() => setPasswordMessage(null), 3000);
  };

  const sendDataToSheet = async (payload: any) => {
    const response = await fetch(googleSheetUrl, {
      method: 'POST',
      redirect: 'follow',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error('Server returned error');
    return await response.json();
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const newId = Date.now().toString();
    const payload = {
      action: 'submit_answer',
      id: newId,
      name: formData.name,
      class: formData.class,
      storyTitle: displayStory?.title || 'Unknown',
      answer: formData.answer
    };

    try {
      await sendDataToSheet(payload);
      const newResponse: StudentResponse = {
        id: newId,
        timestamp: new Date().toLocaleString('ar-EG'),
        storyId: displayStory?.id || '',
        storyTitle: displayStory?.title || '',
        studentName: formData.name,
        className: formData.class,
        answer: formData.answer
      };
      setResponses([newResponse, ...responses]);
      setIsSubmitting(false);
      setShowSuccess(true);
      setFormData({ name: '', class: '', answer: '' });
      setTimeout(() => { setShowSuccess(false); setView('home'); }, 2500);
    } catch (error) {
      alert("تم إرسال الإجابة بنجاح!"); 
      setIsSubmitting(false);
      setShowSuccess(true);
      setFormData({ name: '', class: '', answer: '' });
      setTimeout(() => { setShowSuccess(false); setView('home'); }, 2500);
    }
  };

  const handleSaveStory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const storyId = isEditing && newStory.id ? newStory.id : Date.now().toString();
    const action = isEditing ? 'edit_story' : 'add_story';
    
    try {
        const payload = { 
          action: action, 
          id: storyId, 
          ...newStory
        };
        
        await sendDataToSheet(payload);
        alert(isEditing ? "تم تعديل القصة بنجاح!" : "تم إضافة القصة بنجاح!");
        
        fetchData(); 
        setShowAddStory(false);
        setIsEditing(false);
        
        setNewStory({
          title: '', content: '', question: '',
          date: new Date().toISOString().split('T')[0],
          type: 'text', videoUrl: ''
        });

    } catch (error) {
        alert("تم الإرسال، جاري التحديث...");
        console.error(error);
        setShowAddStory(false);
    }
  };

  const handleDeleteResponse = async (id: string) => {
    if(!window.confirm("هل أنت متأكد من حذف هذه الإجابة؟")) return;
    setResponses(responses.filter(r => r.id !== id));
    try {
        await sendDataToSheet({ action: 'delete_response', id: id });
    } catch (e) {
        console.error("Delete failed remotely", e);
    }
  };

  const handleDeleteStory = async (id: string) => {
    if(!window.confirm("هل أنت متأكد تماماً من حذف هذه القصة؟\nسيتم حذفها نهائياً من الأرشيف ولا يمكن التراجع عن ذلك.")) return;
    
    const previousStories = [...stories];
    setStories(stories.filter(s => s.id !== id));

    try {
        await sendDataToSheet({ action: 'delete_story', id: id });
    } catch (error) {
        console.error("Delete failed", error);
        alert("حدث خطأ أثناء الحذف من قاعدة البيانات.");
        setStories(previousStories);
    }
  };

  const openEditStoryModal = (story: Story) => {
      setNewStory({
          id: story.id,
          title: story.title,
          content: story.content,
          question: story.question,
          date: story.date,
          type: story.type,
          videoUrl: story.videoUrl || ''
      });
      setIsEditing(true);
      setShowAddStory(true);
  };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !displayStory) return;

    const userMessageText = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userMessageText }]);
    setIsChatThinking(true);

    try {
      let currentSession = chatSession;
      
      if (!currentSession) {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        currentSession = ai.chats.create({
          model: 'gemini-2.5-flash',
          config: {
            systemInstruction: `أنت مساعد ذكي ودود للأطفال في تطبيق تعليمي "قصتي اليوم".
            مهمتك هي مساعدة الطلاب على فهم القصة التالية والإجابة على أسئلتهم حولها بأسلوب مشجع ومبسط ومرح.
            
            معلومات القصة الحالية:
            العنوان: ${displayStory.title}
            النوع: ${displayStory.type === 'video' ? 'فيديو' : 'نص'}
            المحتوى: ${displayStory.content}
            سؤال اليوم: ${displayStory.question}

            تعليمات:
            1. أجب دائمًا باللغة العربية.
            2. استخدم الإيموجي المناسب لتكون ودوداً.
            3. إذا سأل الطالب عن إجابة سؤال اليوم، لا تعطه الإجابة مباشرة، بل وجهه للتفكير بطريقة سقراطية.
            4. شجع الطالب دائماً بعبارات مثل "أحسنت يا بطل"، "سؤال رائع".
            `
          }
        });
        setChatSession(currentSession);
      }

      const response: GenerateContentResponse = await currentSession.sendMessage({ message: userMessageText });
      const responseText = response.text || 'عذراً، لم أتمكن من الرد. حاول مرة أخرى.';
      
      setChatMessages(prev => [...prev, { role: 'model', text: responseText }]);
    } catch (error) {
      console.error("Chat Error", error);
      setChatMessages(prev => [...prev, { role: 'model', text: 'حدث خطأ في الاتصال، يرجى المحاولة لاحقاً.' }]);
    } finally {
      setIsChatThinking(false);
    }
  };

  // --- VIEWS ---

  const renderHome = () => {
    if (isLoading && stories.length === 0) return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
         <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
         <p className="text-slate-500 font-medium">جاري تحميل القصص...</p>
      </div>
    );
    
    if (!displayStory) {
        return (
            <div className="p-10 text-center flex flex-col items-center justify-center min-h-[50vh]">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                   <BookOpen size={32} className="text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-700 mb-2">لا توجد قصص متاحة</h3>
                <p className="text-slate-500 mb-6 text-sm">تأكد من الاتصال بالإنترنت أو حاول التحديث</p>
                <button onClick={fetchData} className="flex items-center gap-2 text-indigo-600 bg-indigo-50 px-6 py-3 rounded-xl font-bold hover:bg-indigo-100 transition-colors">
                  <RefreshCw size={18}/> تحديث
                </button>
            </div>
        );
    }

    const storyResponses = responses.filter(r => r.storyTitle === displayStory.title);

    return (
      <div className="space-y-6 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {selectedArchiveStory && (
            <button onClick={() => setSelectedArchiveStory(null)} className="flex items-center gap-2 text-white font-bold mb-2 bg-indigo-600 px-4 py-2 rounded-full w-full justify-center shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all">
                <RefreshCw size={16} />
                <span>العودة لقصة اليوم</span>
            </button>
        )}

        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white p-6 relative overflow-hidden">
             {/* Decorative circles */}
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
             
             <div className="flex justify-between items-start relative z-10">
                 <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md text-xs font-bold px-3 py-1.5 rounded-full mb-3 shadow-inner">
                    {displayStory.type === 'video' ? <Video size={12}/> : <FileText size={12}/>}
                    {displayStory.type === 'video' ? 'فيديو تفاعلي' : 'قصة مقروءة'}
                 </span>
                 <span className="text-[10px] bg-black/20 px-2 py-1 rounded-lg backdrop-blur-sm dir-ltr font-mono">{displayStory.date}</span>
             </div>
             <h2 className="text-2xl font-bold leading-tight mt-2 relative z-10">{displayStory.title}</h2>
          </div>

          <div className="p-0">
            {displayStory.type === 'video' && displayStory.videoUrl && (
               <div className="bg-black">
                 <YouTubeEmbed url={displayStory.videoUrl} />
               </div>
            )}

            <div className="p-6">
                {displayStory.type === 'video' && (
                  <div className="flex items-center gap-2 mb-4 text-indigo-900 bg-indigo-50 p-3 rounded-xl">
                    <BookOpen size={20} className="text-indigo-600" />
                    <h3 className="font-bold text-sm">ملخص القصة</h3>
                  </div>
                )}
                <div className="prose prose-slate prose-lg leading-loose text-slate-700 text-justify whitespace-pre-line font-medium">
                    <p>{displayStory.content}</p>
                </div>
                
                <div className="my-8 flex items-center gap-4">
                  <div className="h-px bg-slate-100 flex-1"></div>
                  <div className="text-slate-300">***</div>
                  <div className="h-px bg-slate-100 flex-1"></div>
                </div>

                <div className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl p-6 border border-indigo-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-20 h-20 bg-indigo-100 rounded-full -translate-x-10 -translate-y-10 blur-xl"></div>
                    <h3 className="font-bold text-indigo-900 mb-2 flex items-center gap-2 relative z-10">
                      <div className="bg-indigo-600 text-white p-1.5 rounded-lg"><MessageSquare size={16}/></div>
                      سؤال التحدي
                    </h3>
                    <p className="text-indigo-800 text-base font-medium relative z-10 leading-relaxed">{displayStory.question}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-6">
                    <button onClick={() => setView('chat')} className="group bg-white text-indigo-600 border border-indigo-200 py-4 rounded-2xl font-bold text-base shadow-sm hover:bg-indigo-50 active:scale-[0.98] transition-all flex flex-col items-center justify-center gap-2">
                        <Sparkles size={24} className="text-indigo-400 group-hover:text-indigo-600 transition-colors" />
                        <span>اسأل المساعد</span>
                    </button>
                    <button onClick={() => setView('form')} className="group bg-indigo-600 text-white py-4 rounded-2xl font-bold text-base shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.98] transition-all flex flex-col items-center justify-center gap-2">
                        <ArrowRight size={24} className="group-hover:-translate-x-1 transition-transform" />
                        <span>شارك إجابتك</span>
                    </button>
                </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 px-2">
                <Users size={20} className="text-indigo-600"/>
                مشاركات الأصدقاء <span className="text-slate-400 text-sm font-normal">({storyResponses.length})</span>
            </h3>
            <div className="space-y-3">
                {storyResponses.length === 0 ? (
                    <div className="text-center py-8 bg-white border border-dashed border-slate-300 rounded-2xl">
                      <p className="text-slate-400 text-sm mb-2">لا توجد مشاركات بعد</p>
                      <button onClick={() => setView('form')} className="text-indigo-600 font-bold text-sm hover:underline">كن أول المشاركين!</button>
                    </div>
                ) : (
                    storyResponses.slice(0, 10).map((res, i) => (
                        <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start gap-3 mb-2">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-sm shadow-inner shrink-0">
                                    {res.studentName.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline">
                                      <div className="text-sm font-bold text-slate-800 truncate">{res.studentName}</div>
                                      <div className="text-[10px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">{res.className}</div>
                                    </div>
                                    <div className="text-xs text-slate-400 mt-0.5">{new Date(res.timestamp).toLocaleDateString('ar-EG')}</div>
                                </div>
                            </div>
                            <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl leading-relaxed">{res.answer}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
        
        <AboutCard />
      </div>
    );
  };

  const renderChat = () => {
    if (!displayStory) return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6 animate-in zoom-in-95 duration-300">
        <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
          <BookOpen size={32} className="text-indigo-300" />
        </div>
        <p className="text-slate-500 font-medium">الرجاء اختيار قصة من الرئيسية أولاً.</p>
        <button onClick={() => setView('home')} className="mt-6 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200">الذهاب للرئيسية</button>
      </div>
    );

    return (
      <div className="flex flex-col h-[calc(100vh-140px)] animate-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center gap-3 mb-4 px-2 bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
           <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md">
             <Bot size={22} />
           </div>
           <div>
             <h2 className="text-base font-bold text-slate-800">المساعد الذكي</h2>
             <p className="text-[10px] text-slate-500 truncate max-w-[200px]">أنا هنا لمساعدتك في قصة "{displayStory.title}"</p>
           </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-50 rounded-3xl border border-slate-200 p-4 space-y-4 mb-4 custom-scrollbar">
           {chatMessages.length === 0 && (
             <div className="text-center py-12 flex flex-col items-center opacity-70">
               <div className="p-4 rounded-full bg-indigo-100 mb-4 animate-bounce-slow">
                 <Sparkles className="text-indigo-500" size={32} />
               </div>
               <h3 className="font-bold text-slate-700 mb-2">مرحباً يا بطل! 👋</h3>
               <p className="text-sm text-slate-500 max-w-xs mx-auto leading-relaxed">
                 أنا المساعد الذكي. اسألني أي سؤال عن القصة وسأكون سعيداً بمساعدتك!
               </p>
               <div className="mt-6 flex flex-wrap justify-center gap-2">
                 {['لخص لي القصة', 'ما هي العبرة؟', 'اشرح لي الكلمات الصعبة'].map(suggestion => (
                   <button 
                     key={suggestion}
                     onClick={() => setChatInput(suggestion)}
                     className="text-xs bg-white border border-indigo-100 text-indigo-600 px-3 py-1.5 rounded-full hover:bg-indigo-50 transition-colors"
                   >
                     {suggestion}
                   </button>
                 ))}
               </div>
             </div>
           )}

           {chatMessages.map((msg, idx) => (
             <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white text-purple-600 border border-purple-100'}`}>
                  {msg.role === 'user' ? <User size={14} /> : <Bot size={16} />}
                </div>
                <div className={`p-3.5 rounded-2xl max-w-[85%] text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'
                }`}>
                  {msg.text}
                </div>
             </div>
           ))}
           
           {isChatThinking && (
             <div className="flex gap-3 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-white border border-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                  <Bot size={16} />
                </div>
                <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-100 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                </div>
             </div>
           )}
           <div ref={chatEndRef} />
        </div>

        <form onSubmit={handleSendChatMessage} className="flex gap-2 relative bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
          <input 
            type="text" 
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            placeholder="اكتب سؤالك هنا..."
            className="flex-1 p-3 bg-transparent outline-none text-slate-700 placeholder:text-slate-400"
          />
          <button 
            type="submit" 
            disabled={!chatInput.trim() || isChatThinking}
            className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-all shadow-md shadow-indigo-200"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    );
  };

  const renderForm = () => {
    if (showSuccess) return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-in zoom-in-95 duration-500">
          <div className="relative">
            <div className="absolute inset-0 bg-green-200 rounded-full blur-xl opacity-50 animate-pulse"></div>
            <div className="relative w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
              <CheckCircle2 size={48} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">أحسنت يا بطل!</h2>
          <p className="text-slate-500">تم إرسال إجابتك بنجاح.</p>
        </div>
    );

    return (
      <div className="pb-24 animate-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center gap-3 mb-6">
            <button onClick={() => setView('home')} className="p-2.5 bg-white rounded-xl shadow-sm border border-slate-100 text-slate-500 hover:bg-slate-50 hover:text-indigo-600 transition-colors"><ChevronLeft className="rotate-180" size={20}/></button>
            <h2 className="text-xl font-bold text-slate-800">إجابة سؤال اليوم</h2>
        </div>
        <form onSubmit={handleSubmitForm} className="space-y-5 bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100">
           <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 mb-2">
             <span className="block text-xs font-bold text-indigo-400 mb-1">القصة الحالية</span>
             <strong className="text-indigo-900 text-sm line-clamp-1">{displayStory?.title}</strong>
           </div>
           
           <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">اسمك الكامل</label>
            <input 
              required
              type="text" 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
              placeholder="مثال: محمد أحمد علي"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">الصف الدراسي</label>
            <input 
              required
              type="text" 
              value={formData.class}
              onChange={e => setFormData({...formData, class: e.target.value})}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
              placeholder="مثال: الخامس (أ)"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">إجابتك</label>
            <textarea 
              required
              value={formData.answer}
              onChange={e => setFormData({...formData, answer: e.target.value})}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-indigo-500 outline-none min-h-[140px] transition-all placeholder:text-slate-400 resize-none"
              placeholder="اكتب إجابتك هنا..."
            />
          </div>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
          >
            {isSubmitting ? (
               <>
                 <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                 <span>جاري الإرسال...</span>
               </>
            ) : (
                <>
                    <span>إرسال الإجابة</span>
                    <Send size={20} />
                </>
            )}
          </button>
        </form>
      </div>
    );
  };

  const renderArchive = () => (
    <div className="space-y-4 pb-24 animate-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-bold text-slate-800 mb-6 px-2 flex items-center gap-2">
        <Archive size={24} className="text-indigo-600"/>
        أرشيف القصص
      </h2>
      {stories.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
               <Archive size={32}/>
             </div>
             <p className="text-slate-400 font-medium">لا توجد قصص في الأرشيف.</p>
          </div>
      ) : (
          stories.map(story => (
            <StoryCard 
              key={story.id} 
              story={story} 
              onClick={() => {
                  setSelectedArchiveStory(story);
                  setView('home');
              }} 
            />
          ))
      )}
    </div>
  );

  const renderAdminNavigation = () => (
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          <button onClick={() => setView('admin_stories')} className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${view === 'admin_stories' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>إدارة القصص</button>
          <button onClick={() => setView('admin_responses')} className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${view === 'admin_responses' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>متابعة الإجابات</button>
          <button onClick={() => setView('admin_settings')} className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${view === 'admin_settings' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>الإعدادات</button>
      </div>
  );

  const renderAdminStories = () => (
    <div className="pb-24 animate-in fade-in duration-500">
      {renderAdminNavigation()}
      <button 
        onClick={() => {
            setNewStory({
                title: '', content: '', question: '', date: new Date().toISOString().split('T')[0], type: 'text', videoUrl: ''
            });
            setIsEditing(false);
            setShowAddStory(true);
        }}
        className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold mb-6 shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 hover:bg-indigo-700 active:scale-[0.98] transition-all"
      >
        <Plus size={22} />
        <span>إضافة قصة أو فيديو جديد</span>
      </button>

      <div className="space-y-4">
        {stories.map(story => (
          <div key={story.id} className="relative group">
              <StoryCard story={story} />
              <div className="absolute top-4 left-4 bg-white/95 backdrop-blur shadow-md border border-slate-200 p-1.5 rounded-lg flex gap-2 z-10">
                  <button onClick={() => openEditStoryModal(story)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors" title="تعديل"><Pencil size={18}/></button>
                  <div className="w-px h-4 bg-slate-200 mx-1"></div>
                  <button onClick={() => handleDeleteStory(story.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors" title="حذف"><Trash2 size={18}/></button>
              </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAdminResponses = () => (
    <div className="pb-24 animate-in fade-in duration-500">
        {renderAdminNavigation()}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-right text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                        <tr>
                            <th className="p-4 font-bold">الطالب</th>
                            <th className="p-4 font-bold">الصف</th>
                            <th className="p-4 font-bold">القصة</th>
                            <th className="p-4 font-bold">الإجابة</th>
                            <th className="p-4 font-bold w-10"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {responses.length === 0 ? (
                             <tr><td colSpan={5} className="p-8 text-center text-slate-400">لا توجد إجابات بعد.</td></tr>
                        ) : (
                            responses.map((res) => (
                                <tr key={res.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-4 font-bold text-slate-800">{res.studentName}</td>
                                    <td className="p-4 text-slate-500">{res.className}</td>
                                    <td className="p-4 text-slate-500 max-w-[150px] truncate" title={res.storyTitle}>{res.storyTitle}</td>
                                    <td className="p-4 text-slate-600 max-w-[200px]">{res.answer}</td>
                                    <td className="p-4">
                                        <button onClick={() => handleDeleteResponse(res.id)} className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"><Trash2 size={16}/></button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );

  const renderAdminSettings = () => (
    <div className="pb-24 animate-in fade-in duration-500">
        {renderAdminNavigation()}
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-800"><LinkIcon size={20} className="text-indigo-600"/> إعدادات الربط</h3>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600">رابط Google Apps Script (Web App URL)</label>
                    <input 
                        type="text" 
                        value={googleSheetUrl}
                        onChange={(e) => setGoogleSheetUrl(e.target.value)}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <p className="text-[10px] text-slate-400 flex items-center gap-1"><Info size={12}/> يجب نشر السكريبت بصلاحية "Anyone"</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-800"><ShieldCheck size={20} className="text-indigo-600"/> تغيير كلمة المرور</h3>
                <form onSubmit={handleUpdateSettings} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-600 mb-1">كلمة المرور الحالية</label>
                        <input type="password" value={currentPasswordInput} onChange={e => setCurrentPasswordInput(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:bg-white transition-colors"/>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-600 mb-1">كلمة المرور الجديدة</label>
                        <input type="password" value={newPasswordInput} onChange={e => setNewPasswordInput(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:bg-white transition-colors"/>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-600 mb-1">تأكيد كلمة المرور</label>
                        <input type="password" value={confirmPasswordInput} onChange={e => setConfirmPasswordInput(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:bg-white transition-colors"/>
                    </div>
                    
                    {passwordMessage && (
                        <div className={`p-3 rounded-lg text-sm font-bold flex items-center gap-2 ${passwordMessage.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                            {passwordMessage.type === 'success' ? <CheckCircle2 size={16}/> : <Info size={16}/>}
                            {passwordMessage.text}
                        </div>
                    )}

                    <button type="submit" className="w-full bg-slate-800 text-white py-3 rounded-xl font-bold hover:bg-slate-900 flex items-center justify-center gap-2 mt-2">
                        <Save size={18} />
                        <span>حفظ التغييرات</span>
                    </button>
                </form>
            </div>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-safe selection:bg-indigo-100">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 px-4 h-16 flex items-center justify-between shadow-sm transition-all">
        <div className="flex items-center gap-3" onClick={() => setView('home')}>
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <BookOpen size={20} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <h1 className="font-bold text-lg leading-none text-slate-800 tracking-tight">قصتي اليوم</h1>
            <span className="text-[10px] text-slate-500 font-medium">مدرسة يزيد بن الحارث</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
             <button onClick={() => setShowAboutModal(true)} className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all">
                <Info size={20} />
             </button>
            {isAdmin ? (
                 <button onClick={() => setIsAdmin(false)} className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all">
                    <LogOut size={20} />
                </button>
            ) : (
                 <button onClick={() => setShowLoginModal(true)} className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all">
                    <Lock size={20} />
                </button>
            )}
        </div>
      </header>

      {/* About Modal */}
      {showAboutModal && (
         <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4 animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
             <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
             
             <button onClick={() => setShowAboutModal(false)} className="absolute top-4 left-4 p-2 bg-slate-50 rounded-full text-slate-400 hover:text-slate-600"><X size={20}/></button>
             
             <div className="text-center mb-6 pt-2">
               <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                 <GraduationCap size={40} />
               </div>
               <h2 className="text-2xl font-bold text-slate-800">مبادرة "قصتي اليوم"</h2>
               <p className="text-xs text-slate-400 mt-1 font-medium">الإصدار 2.0</p>
             </div>
             
             <div className="space-y-4 text-center">
               <p className="text-slate-600 leading-relaxed text-sm">
                 بيئة تعليمية رقمية تجمع بين متعة السرد القصسي وقوة الذكاء الاصطناعي لتعزيز مهارات المستقبل.
               </p>
               
               <div className="bg-slate-50 rounded-2xl p-4 text-sm text-slate-700 space-y-3 border border-slate-100 text-right">
                 <div className="flex items-center gap-3">
                    <div className="bg-white p-1.5 rounded-lg shadow-sm"><Star size={14} className="text-yellow-400"/></div>
                    <span className="font-bold text-slate-700">تعزيز القيم التربوية</span>
                 </div>
                 <div className="flex items-center gap-3">
                    <div className="bg-white p-1.5 rounded-lg shadow-sm"><Bot size={14} className="text-blue-400"/></div>
                    <span className="font-bold text-slate-700">مساعد ذكي للطلاب</span>
                 </div>
                 <div className="flex items-center gap-3">
                    <div className="bg-white p-1.5 rounded-lg shadow-sm"><MessageSquare size={14} className="text-green-400"/></div>
                    <span className="font-bold text-slate-700">تنمية مهارات التفكير</span>
                 </div>
               </div>

               <div className="pt-2">
                 <button onClick={() => setShowAboutModal(false)} className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200">
                   إغلاق
                 </button>
               </div>
             </div>
           </div>
         </div>
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-8">
              <div>
                  <h3 className="text-xl font-bold text-slate-800">دخول المعلم</h3>
                  <p className="text-xs text-slate-400 mt-1">يرجى إدخال رمز المرور للمتابعة</p>
              </div>
              <button onClick={() => setShowLoginModal(false)} className="p-2 bg-slate-50 rounded-full text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            <form onSubmit={handleLoginSubmit} className="space-y-6">
              <div>
                <input 
                  autoFocus
                  type="password" 
                  value={loginInput}
                  onChange={e => setLoginInput(e.target.value)}
                  className={`w-full p-4 border rounded-2xl outline-none text-center text-2xl tracking-[0.5em] font-bold transition-all ${loginError ? 'border-red-300 bg-red-50 text-red-600 focus:ring-2 focus:ring-red-200' : 'border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'}`}
                  placeholder="••••"
                  maxLength={4}
                />
                {loginError && <p className="text-red-500 text-xs mt-3 font-bold text-center flex items-center justify-center gap-1"><Info size={12}/> كلمة المرور غير صحيحة</p>}
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-transform active:scale-[0.98]">تسجيل الدخول</button>
            </form>
          </div>
        </div>
      )}

      {/* Add/Edit Story Modal */}
      {showAddStory && (
        <div className="fixed inset-0 bg-slate-900/60 z-[60] flex items-end sm:items-center justify-center sm:p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4 sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold text-slate-800">{isEditing ? 'تعديل القصة' : 'إضافة قصة جديدة'}</h3>
              <button onClick={() => setShowAddStory(false)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200"><X size={20}/></button>
            </div>
            <form onSubmit={handleSaveStory} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                  <button type="button" onClick={() => setNewStory({...newStory, type: 'text'})} className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${newStory.type === 'text' ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm' : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200'}`}>
                      <FileText size={28} />
                      <span className="text-xs font-bold">قصة نصية</span>
                  </button>
                  <button type="button" onClick={() => setNewStory({...newStory, type: 'video'})} className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${newStory.type === 'video' ? 'bg-rose-50 border-rose-500 text-rose-700 shadow-sm' : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200'}`}>
                      <Video size={28} />
                      <span className="text-xs font-bold">فيديو + نص</span>
                  </button>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">عنوان القصة</label>
                <input required type="text" value={newStory.title} onChange={e => setNewStory({...newStory, title: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:bg-white transition-colors"/>
              </div>

              {newStory.type === 'video' && (
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <label className="block text-sm font-bold text-slate-700 mb-2">رابط فيديو يوتيوب</label>
                    <input 
                        type="text" 
                        value={newStory.videoUrl} 
                        onChange={e => setNewStory({...newStory, videoUrl: e.target.value})} 
                        className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:border-indigo-500 dir-ltr text-left mb-3"
                        placeholder="https://youtu.be/..."
                    />
                    {newStory.videoUrl && (
                        <div className="rounded-xl overflow-hidden bg-black aspect-video shadow-md">
                           <YouTubeEmbed url={newStory.videoUrl} />
                        </div>
                    )}
                  </div>
              )}

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">نص القصة / الملخص</label>
                <textarea required rows={6} value={newStory.content} onChange={e => setNewStory({...newStory, content: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:bg-white transition-colors resize-none"/>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">سؤال اليوم</label>
                <input required type="text" value={newStory.question} onChange={e => setNewStory({...newStory, question: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:bg-white transition-colors"/>
              </div>
              
              <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-slate-800 transition-colors">
                {isEditing ? 'حفظ التعديلات' : 'نشر القصة الآن'}
              </button>
            </form>
          </div>
        </div>
      )}

      <main className="max-w-md mx-auto p-4 min-h-[85vh]">
         {view === 'home' && renderHome()}
         {view === 'form' && renderForm()}
         {view === 'chat' && renderChat()}
         {view === 'archive' && renderArchive()}
         {view === 'admin_stories' && renderAdminStories()}
         {view === 'admin_responses' && renderAdminResponses()}
         {view === 'admin_settings' && renderAdminSettings()}
      </main>

      <Navigation currentView={view} setView={setView} isAdmin={isAdmin} />
    </div>
  );
};

export default App;