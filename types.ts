
export type StoryType = 'text' | 'video';
export type StoryStatus = 'Today' | 'Archive';

export interface Story {
  id: string;
  date: string;
  title: string;
  type: StoryType;
  content: string; // The text story or the video prompt/description
  videoUrl?: string; // Optional URL for video
  question: string;
  status: StoryStatus;
}

export interface StudentResponse {
  id: string;
  timestamp: string;
  storyId: string;
  storyTitle: string;
  studentName: string;
  className: string;
  answer: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export type ViewState = 'home' | 'form' | 'chat' | 'archive' | 'admin_stories' | 'admin_responses' | 'admin_settings';
