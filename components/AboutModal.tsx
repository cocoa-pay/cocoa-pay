
import React from 'react';
import { X, Coffee } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
      <div 
        className="bg-white w-full max-w-xs md:max-w-sm rounded-3xl shadow-2xl overflow-hidden m-4 p-6 relative animate-scaleIn" 
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-300 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        
        <div className="flex flex-col items-center text-center space-y-5 mt-4">
          <div className="relative">
            <div className="w-20 h-20 bg-kakao-yellow rounded-full flex items-center justify-center shadow-sm relative z-10">
               <Coffee className="w-10 h-10 text-kakao-brown" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-kakao-brown rounded-full flex items-center justify-center border-2 border-white z-20">
                <span className="text-kakao-yellow text-xs font-bold">AI</span>
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-kakao-brown mb-1">
              코코아페이
            </h2>
            <p className="text-xs text-gray-400 font-medium tracking-widest uppercase">About Us</p>
          </div>
          
          <div className="space-y-4 px-2">
            <p className="text-lg font-semibold text-gray-800 leading-snug break-keep">
              "코코아 한잔처럼<br/>따뜻한 보조금을 찾아주는 서비스"
            </p>
            
            <div className="w-12 h-1 bg-gray-100 mx-auto rounded-full"></div>
            
            <p className="text-sm text-gray-600 leading-relaxed break-keep">
              나도 모르게 놓치고 있던 정부 혜택,<br/>
              <strong>코코아페이 AI</strong>가 분석하여<br/>
              꼭 필요한 정보만 따뜻하게 전해드립니다.
            </p>
          </div>
          
          <button 
            onClick={onClose}
            className="w-full py-3.5 bg-kakao-brown text-kakao-yellow font-bold rounded-xl hover:bg-[#2C1516] transition-colors shadow-md mt-4"
          >
            확인했어요
          </button>
        </div>
      </div>
    </div>
  );
};

export default AboutModal;
