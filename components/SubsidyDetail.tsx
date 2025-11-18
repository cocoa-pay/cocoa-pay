
import React, { useEffect, useState } from 'react';
import { Subsidy } from '../types';
import { fetchSubsidyDetail } from '../api';
import { X, Calendar, FileText, ExternalLink, CheckCircle2, Info, Phone } from 'lucide-react';

interface SubsidyDetailProps {
  subsidy: Subsidy;
  onClose: () => void;
  apiKey?: string;
}

const SubsidyDetail: React.FC<SubsidyDetailProps> = ({ subsidy: initialSubsidy, onClose, apiKey }) => {
  const [subsidy, setSubsidy] = useState<Subsidy>(initialSubsidy);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Only fetch if we have a key, it's not fetched yet, and it's not a mock item (Mock usually has no numeric ID logic, but checking key is safer)
    // Also check if provider is supported by API (Central or Local)
    if (apiKey && !subsidy.isDetailFetched && (subsidy.provider === 'Central' || subsidy.provider === 'Local')) {
        setLoading(true);
        fetchSubsidyDetail(subsidy.id, subsidy.provider, apiKey)
            .then(details => {
                setSubsidy(prev => ({ ...prev, ...details }));
            })
            .finally(() => setLoading(false));
    }
  }, [subsidy.id, apiKey, subsidy.provider, subsidy.isDetailFetched]);

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-white w-full md:max-w-2xl h-[90vh] md:h-auto md:max-h-[90vh] rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-kakao-yellow/10 p-6 flex justify-between items-start shrink-0">
          <div className="pr-8">
             <span className="inline-block bg-white/80 backdrop-blur text-kakao-brown text-xs font-bold px-3 py-1 rounded-full mb-3 border border-kakao-yellow/20">
               {subsidy.category} · {subsidy.provider === 'Central' ? '중앙부처' : (subsidy.provider === 'Local' ? '지자체' : '민간')}
             </span>
             <h2 className="text-2xl font-bold text-kakao-brown mb-1 leading-tight">{subsidy.title}</h2>
             <p className="text-sm text-gray-600 mt-2 line-clamp-2">{subsidy.description}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-white/50 rounded-full hover:bg-white transition-colors shrink-0"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 relative">
          {loading && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 border-4 border-kakao-yellow border-t-kakao-brown rounded-full animate-spin mb-2"></div>
                    <span className="text-xs text-gray-500 font-medium">상세 정보 불러오는 중...</span>
                  </div>
              </div>
          )}
          
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <span className="text-xs text-gray-500 block mb-1">지원 혜택</span>
              <span className="text-lg font-bold text-blue-600">{subsidy.amount}</span>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <span className="text-xs text-gray-500 block mb-1">신청 마감</span>
              <span className="text-lg font-bold text-red-500">{subsidy.deadline}</span>
            </div>
          </div>

          {/* Detailed Content from API */}
          {(subsidy.supportContent || subsidy.targetDetail) && (
            <div className="space-y-4 animate-fadeIn">
               <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                  <h4 className="font-bold text-blue-800 mb-2 flex items-center">
                    <Info className="w-4 h-4 mr-2" /> 지원 상세 내용
                  </h4>
                  <p className="text-sm text-blue-900 whitespace-pre-wrap leading-relaxed">
                    {subsidy.supportContent || subsidy.targetDetail}
                  </p>
               </div>
            </div>
          )}

          {/* Selection Criteria */}
          {subsidy.selectionCriteria && (
            <div>
               <h3 className="text-lg font-bold text-kakao-brown mb-3 flex items-center">
                 <CheckCircle2 className="w-5 h-5 mr-2 text-kakao-yellow fill-kakao-brown" />
                 선정 기준
               </h3>
               <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-700 whitespace-pre-wrap leading-relaxed border border-gray-100">
                 {subsidy.selectionCriteria}
               </div>
            </div>
          )}

          {/* Contact Info */}
          {subsidy.contactInfo && (
             <div className="flex items-center text-sm text-gray-600 bg-gray-100 px-4 py-3 rounded-lg">
                <Phone className="w-4 h-4 mr-2 text-gray-500" />
                <span className="font-bold mr-2">문의처:</span> {subsidy.contactInfo}
             </div>
          )}

          {/* Documents Checklist */}
          <div>
             <h3 className="text-lg font-bold text-kakao-brown mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-kakao-yellow fill-kakao-brown" />
              준비 서류
            </h3>
            <div className="bg-gray-50 rounded-xl p-2">
              {subsidy.documents.length > 0 ? subsidy.documents.map((doc, idx) => (
                <label key={idx} className="flex items-center p-3 border-b border-gray-100 last:border-0 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                  <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-kakao-yellow focus:ring-kakao-yellow" />
                  <span className="ml-3 text-gray-700">{doc}</span>
                </label>
              )) : (
                <div className="p-4 text-center text-gray-400 text-sm">별도 제출 서류 없음 (또는 공고 참조)</div>
              )}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-100 bg-white flex space-x-4 shrink-0">
          <button className="flex-1 py-4 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">
            나중에 보기
          </button>
          <a 
            href={subsidy.url || '#'} 
            target="_blank"
            rel="noreferrer"
            className={`flex-[2] py-4 font-bold rounded-xl shadow-lg transition-colors flex justify-center items-center ${
                subsidy.url 
                ? 'bg-kakao-yellow text-kakao-brown hover:bg-yellow-400' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            onClick={(e) => !subsidy.url && e.preventDefault()}
          >
            신청하러 가기 <ExternalLink className="w-4 h-4 ml-2" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default SubsidyDetail;
