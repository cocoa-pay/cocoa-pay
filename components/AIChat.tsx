
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";

interface Message {
  id: number;
  text: string;
  isUser: boolean;
}

const AIChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "안녕하세요! 코코아페이 AI 에이전트입니다. 무엇을 도와드릴까요?", isUser: false }
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [chatSession, setChatSession] = useState<Chat | null>(null);

  // Initialize Gemini Chat
  useEffect(() => {
    const initChat = async () => {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const chat = ai.chats.create({
          model: 'gemini-2.5-flash',
          config: {
            systemInstruction: '당신은 "코코아페이(Kokoapay)"의 AI 상담원입니다. 코코아페이는 숨겨진 정부 보조금과 복지 혜택을 찾아주는 서비스입니다. 사용자의 질문에 친절하고 명확하게 한국어로 답변하세요. 정부 지원금, 복지 정책, 신청 방법 등에 대한 정보를 알기 쉽게 설명해 주세요. 만약 앱의 기능적인 질문(예: 트래픽 오류, 데이터 조회 등)이 나오면, 공공데이터포털 API의 일일 트래픽 제한(100회)이나 Mock 데이터 모드에 대해 설명해 줄 수 있습니다.',
          }
        });
        setChatSession(chat);
      } catch (error) {
        console.error("Failed to initialize AI chat", error);
      }
    };
    initChat();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen, isThinking]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = { id: Date.now(), text: input, isUser: true };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setIsThinking(true);

    try {
      if (chatSession) {
        // Streaming response for better UX
        const result = await chatSession.sendMessageStream({ message: currentInput });
        
        let fullText = "";
        // Create a placeholder message for the AI response
        const aiMsgId = Date.now() + 1;
        setMessages(prev => [...prev, { id: aiMsgId, text: "", isUser: false }]);
        setIsThinking(false); // Stop thinking animation as we start streaming

        for await (const chunk of result) {
          const c = chunk as GenerateContentResponse;
          const text = c.text;
          if (text) {
            fullText += text;
            setMessages(prev => 
              prev.map(msg => msg.id === aiMsgId ? { ...msg, text: fullText } : msg)
            );
          }
        }
      } else {
        // Fallback if chat session isn't ready
        setIsThinking(false);
        setMessages(prev => [...prev, { 
          id: Date.now() + 1, 
          text: "죄송합니다. AI 연결에 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.", 
          isUser: false 
        }]);
      }
    } catch (error) {
      console.error("Chat Error:", error);
      setIsThinking(false);
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        text: "오류가 발생했습니다. 다시 시도해 주세요.", 
        isUser: false 
      }]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-kakao-brown text-kakao-yellow rounded-full shadow-xl flex items-center justify-center transition-all transform hover:scale-110 z-40 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
      >
        <Bot className="w-8 h-8" />
      </button>

      {/* Chat Window */}
      <div className={`fixed bottom-6 right-6 w-[90vw] md:w-96 bg-white rounded-2xl shadow-2xl flex flex-col border border-gray-100 transition-all duration-300 transform z-50 ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`} style={{ height: '500px', maxHeight: '80vh' }}>
        
        {/* Header */}
        <div className="bg-kakao-brown text-white p-4 rounded-t-2xl flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-kakao-yellow rounded-full flex items-center justify-center mr-3">
              <Bot className="w-5 h-5 text-kakao-brown" />
            </div>
            <span className="font-bold">Kokoa AI 코파일럿</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide bg-gray-50">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-3 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed ${
                msg.isUser 
                  ? 'bg-kakao-yellow text-kakao-brown rounded-tr-none font-medium' 
                  : 'bg-white border border-gray-200 text-gray-700 rounded-tl-none shadow-sm'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {isThinking && (
             <div className="flex justify-start">
               <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-tl-none shadow-sm flex space-x-1 items-center">
                 <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
                 <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                 <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
               </div>
             </div>
          )}
          <div ref={bottomRef}></div>
        </div>

        {/* Input */}
        <div className="p-3 border-t border-gray-100 bg-white rounded-b-2xl">
          <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="궁금한 점을 물어보세요..." 
              className="flex-1 bg-transparent focus:outline-none text-sm"
            />
            <button 
              onClick={handleSend}
              disabled={isThinking}
              className={`ml-2 p-1.5 rounded-full transition-colors ${input.trim() ? 'bg-kakao-yellow text-kakao-brown' : 'bg-gray-300 text-white'}`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AIChat;
