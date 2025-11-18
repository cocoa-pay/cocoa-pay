import React, { useState } from 'react';
import { Key, ShieldAlert, X, Check, Server } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (key: string) => void;
  currentKey: string;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onSave, currentKey }) => {
  const [inputKey, setInputKey] = useState(currentKey);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden m-4 animate-scaleIn">
        <div className="bg-kakao-brown p-4 flex justify-between items-center">
          <div className="flex items-center text-white">
            <Server className="w-5 h-5 mr-2 text-kakao-yellow" />
            <h2 className="font-bold text-lg">실제 공공데이터 연결</h2>
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3 flex items-start">
            <ShieldAlert className="w-5 h-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
            <p className="text-xs text-yellow-800 leading-relaxed">
              <strong>주의:</strong> 공공데이터포털의 인증키(Decoding Key)를 입력해주세요. 
              브라우저 보안 정책(CORS)으로 인해 로컬 환경에서는 API 호출이 차단될 수 있습니다.
            </p>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              공공데이터포털 인증키 (Encoding/Decoding)
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="인증키를 여기에 붙여넣으세요"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-kakao-yellow focus:border-transparent transition-all font-mono text-sm bg-white text-gray-900"
              />
            </div>
            <p className="text-xs text-gray-400 mt-2 pl-1">
              * 키는 브라우저 메모리에만 임시 저장되며 서버로 전송되지 않습니다.
            </p>
          </div>

          <div className="pt-2 flex space-x-3">
            <button 
              onClick={() => onSave('')}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors text-sm"
            >
              Mock 모드 사용
            </button>
            <button 
              onClick={() => onSave(inputKey)}
              className="flex-1 px-4 py-3 bg-kakao-yellow text-kakao-brown font-bold rounded-xl hover:bg-yellow-400 transition-colors shadow-md flex justify-center items-center"
            >
              <Check className="w-4 h-4 mr-1" />
              연결 및 저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;