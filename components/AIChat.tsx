
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';

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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMsg = { id: Date.now(), text: input, isUser: true };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input; // Capture for closure logic
    setInput('');
    setIsThinking(true);

    // Simulate AI response
    setTimeout(() => {
      setIsThinking(false);
      
      let responseText = "";
      const lowerInput = currentInput.toLowerCase();

      // Keyword matching logic
      if (lowerInput.includes('실제') || lowerInput.includes('가짜') || lowerInput.includes('mock') || lowerInput.includes('맞아')) {
        responseText = "네, 예리하시네요! 🕵️\n\n현재 보시는 데이터는 앱의 기능을 보여드리기 위한 **가상 데이터(Mock Data)**입니다.\n\n실제 서비스 단계에서는 '정부24' 및 '복지로'의 공공 API와 실시간으로 연동되어, 고객님께 딱 맞는 정확한 정보를 제공하게 됩니다.";
      } else if (lowerInput.includes('트래픽') || lowerInput.includes('traffic') || lowerInput.includes('호출') || lowerInput.includes('제한') || lowerInput.includes('안돼')) {
        responseText = "🚦 **트래픽(Traffic)이란?**\n\nAPI를 통해 데이터를 주고받을 수 있는 '일일 허용 량'을 의미합니다.\n\n현재 사용 중인 공공데이터포털 개발 계정은 **하루 100회**의 호출로 제한되어 있습니다. 조회 버튼을 누를 때마다 중앙부처/지자체 API를 각각 호출하므로 트래픽이 소모됩니다.\n\n⚠️ **검색이 안 되나요?**\n오늘의 허용 트래픽을 모두 소진했을 가능성이 높습니다. 내일 다시 시도하시거나, API 키를 발급받아 설정에서 등록해주시면 계속 이용 가능합니다!";
      } else if (lowerInput.includes('100개') || lowerInput.includes('더') || lowerInput.includes('전체') || lowerInput.includes('페이지')) {
        responseText = "📊 **데이터 조회 안내**\n\n효율적인 트래픽 관리를 위해 한 번에 **최대 100건**의 데이터를 가져오도록 설정되어 있습니다.\n\n100개씩 계속 불러오는 기능도 기술적으로는 가능하지만, 개발 계정의 트래픽 제한(일 100회)으로 인해 금방 차단될 수 있어 현재는 막아두었습니다.\n\n대신 **페이지네이션** 기능을 통해 가져온 100개의 데이터를 편하게 보실 수 있도록 제공하고 있습니다! 😊";
      } else {
        const responses = [
          "말씀하신 조건이라면 '청년내일채움공제'도 함께 알아보시는 게 좋겠어요!",
          "해당 지원금은 예산 소진 시 조기 마감될 수 있으니 서두르시는 게 좋습니다.",
          "소득 서류는 정부24에서 '소득금액증명원'을 발급받으시면 됩니다.",
          "네, 중복 신청 가능한지 확인해드릴게요. 잠시만요...",
          "더 궁금한 점이 있으시면 언제든 물어봐주세요!",
          "현재 고객님의 프로필에 최적화된 플랜을 분석 중입니다.",
          "트래픽 제한이나 API 관련 궁금한 점이 있으시면 '트래픽'이라고 물어봐주세요!"
        ];
        responseText = responses[Math.floor(Math.random() * responses.length)];
      }
      
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        text: responseText, 
        isUser: false 
      }]);
    }, 1000);
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
            <span className="font-bold">Cocoa AI 코파일럿</span>
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
              placeholder="궁금한 점을 물어보세요... (예: 트래픽이 뭔가요?)" 
              className="flex-1 bg-transparent focus:outline-none text-sm"
            />
            <button 
              onClick={handleSend}
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
