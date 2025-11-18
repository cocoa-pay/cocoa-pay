import React, { useEffect, useState } from 'react';
import { Subsidy } from '../types';
import { fetchSubsidyDetail } from '../api';
import { X, Calendar, FileText, ExternalLink, CheckCircle2, Info, Phone, Check, Download, Globe, BookOpen, FileDown, PhoneCall, File, Building2, Target } from 'lucide-react';

interface SubsidyDetailProps {
  subsidy: Subsidy;
  onClose: () => void;
  apiKey?: string;
}

const SubsidyDetail: React.FC<SubsidyDetailProps> = ({ subsidy: initialSubsidy, onClose, apiKey }) => {
  const [subsidy, setSubsidy] = useState<Subsidy>(initialSubsidy);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (apiKey && !subsidy.isDetailFetched && (subsidy.provider === 'Central' || subsidy.provider === 'Local')) {
        setLoading(true);
        fetchSubsidyDetail(subsidy.id, subsidy.provider, apiKey)
            .then(details => {
                setSubsidy(prev => ({ ...prev, ...details }));
            })
            .finally(() => setLoading(false));
    }
  }, [subsidy.id, apiKey, subsidy.provider, subsidy.isDetailFetched]);

  const hasContacts = (subsidy.contacts && subsidy.contacts.length > 0) || subsidy.contactInfo;
  const hasWebsites = subsidy.relatedWebsites && subsidy.relatedWebsites.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-white w-full md:max-w-2xl h-[90vh] md:h-auto md:max-h-[90vh] rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-slideUp relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#FFFBE6] p-6 shrink-0 relative">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 bg-white/50 rounded-full hover:bg-white transition-colors z-10"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>

          <span className="inline-block bg-white text-kakao-brown text-xs font-bold px-3 py-1 rounded-full mb-2 border border-gray-200 shadow-sm">
            {subsidy.category} · {subsidy.provider === 'Central' ? '중앙부처' : (subsidy.provider === 'Local' ? '지자체' : '민간')}
          </span>
          <h2 className="text-2xl font-bold text-[#371D1E] mb-2 leading-tight pr-8 break-keep">{subsidy.title}</h2>
          
          {subsidy.competentOrg && (
            <div className="flex items-center text-sm text-gray-600 mb-2 font-medium">
                <Building2 className="w-4 h-4 mr-1.5 text-kakao-brown" />
                {subsidy.competentOrg}
            </div>
          )}
          
          <p className="text-sm text-gray-600 mt-1 line-clamp-2 leading-relaxed">
            {subsidy.description}
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 relative scrollbar-hide">
          {loading && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-20">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 border-4 border-kakao-yellow border-t-kakao-brown rounded-full animate-spin mb-2"></div>
                    <span className="text-xs text-gray-500 font-medium">상세 정보 불러오는 중...</span>
                  </div>
              </div>
          )}
          
          {/* Purpose / Outline */}
          {subsidy.purpose && (
              <div>
                 <h3 className="text-lg font-bold text-[#371D1E] mb-3 flex items-center">
                   <Target className="w-5 h-5 mr-2 text-[#371D1E] fill-[#FAE100]" />
                   사업 목적
                 </h3>
                 <div className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">
                   {subsidy.purpose}
                 </div>
              </div>
          )}

          {/* Selection Criteria */}
          <div>
             <h3 className="text-lg font-bold text-[#371D1E] mb-3 flex items-center">
               <CheckCircle2 className="w-5 h-5 mr-2 text-[#371D1E] fill-[#FAE100]" />
               선정 기준
             </h3>
             <div className="bg-gray-50 p-5 rounded-xl text-gray-700 text-sm whitespace-pre-wrap leading-relaxed border border-gray-100">
               {subsidy.selectionCriteria || '별도 선정 기준 없음 (상세 문의 필요)'}
             </div>
          </div>

          {/* Steps Timeline */}
          {subsidy.steps && subsidy.steps.length > 0 && (
            <div>
               <h3 className="text-lg font-bold text-[#371D1E] mb-4 flex items-center">
                 <Calendar className="w-5 h-5 mr-2 text-[#371D1E] fill-[#FAE100]" />
                 신청 절차
               </h3>
               <div className="relative pl-2">
                 <div className="absolute left-[15px] top-2 bottom-4 w-0.5 bg-gray-200"></div>
                 <div className="space-y-6">
                   {subsidy.steps.map((step) => (
                     <div key={step.order} className="relative flex items-start group">
                        <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center border-2 shrink-0 bg-white transition-colors ${step.isDone ? 'border-[#FAE100] text-[#371D1E]' : 'border-gray-300 text-gray-400'}`}>
                          {step.isDone ? <Check className="w-4 h-4" /> : <span className="text-xs font-bold">{step.order}</span>}
                        </div>
                        <div className="ml-4 pt-1">
                          <h4 className={`font-bold text-sm ${step.isDone ? 'text-gray-800' : 'text-[#371D1E]'}`}>
                            {step.title}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1 leading-relaxed">{step.description}</p>
                        </div>
                     </div>
                   ))}
                 </div>
               </div>
            </div>
          )}

          {/* Documents */}
          <div>
             <h3 className="text-lg font-bold text-[#371D1E] mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-[#371D1E] fill-[#FAE100]" />
              준비 서류
            </h3>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              {subsidy.documents.length > 0 ? (
                  <div className="space-y-2">
                      {subsidy.documents.map((doc, idx) => (
                        <div key={idx} className="flex items-center">
                            <div className="w-8 h-8 rounded bg-[#4B4B4B] flex items-center justify-center shrink-0 mr-3">
                                <File className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-gray-700 font-medium text-sm">{doc}</span>
                        </div>
                      ))}
                  </div>
              ) : (
                <div className="text-center text-gray-400 text-sm py-2">
                    선정 기준에 따른 증빙 서류가 필요할 수 있습니다.<br/>
                    (상세 공고문 또는 문의처 확인 권장)
                </div>
              )}
            </div>
          </div>

          {/* Additional Info Section */}
          <div className="space-y-6 pt-6 border-t border-gray-100">
            
            {/* Contacts & Websites */}
            {(hasContacts || hasWebsites) && (
              <div>
                 <h3 className="text-lg font-bold text-[#371D1E] mb-4">문의 및 관련 사이트</h3>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Contacts */}
                    {subsidy.contacts && subsidy.contacts.length > 0 ? (
                        subsidy.contacts.map((contact, idx) => (
                           <a key={idx} href={`tel:${contact.url}`} className="flex items-center p-4 bg-white rounded-xl hover:bg-yellow-50 border border-gray-200 transition-colors group shadow-sm">
                              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 group-hover:text-[#371D1E] transition-colors mr-3 shrink-0">
                                <PhoneCall className="w-5 h-5" />
                              </div>
                              <div className="min-w-0 flex flex-col">
                                <div className="text-xs text-gray-500">{contact.name}</div>
                                <div className="text-sm font-bold text-blue-600 truncate">{contact.url}</div>
                              </div>
                           </a>
                        ))
                    ) : subsidy.contactInfo ? (
                        <div className="flex items-center p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                           <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 mr-3 shrink-0">
                              <Phone className="w-5 h-5" />
                           </div>
                           <span className="text-sm text-gray-600 font-bold">{subsidy.contactInfo}</span>
                        </div>
                    ) : null}

                    {/* Websites */}
                    {subsidy.relatedWebsites?.map((site, idx) => (
                       <a key={idx} href={site.url} target="_blank" rel="noreferrer" className="flex items-center p-4 bg-white rounded-xl hover:bg-blue-50 border border-gray-200 transition-colors group shadow-sm">
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 group-hover:text-blue-600 transition-colors mr-3 shrink-0">
                            <Globe className="w-5 h-5" />
                          </div>
                          <div className="min-w-0 overflow-hidden">
                            <div className="text-xs text-gray-500 truncate">{site.url}</div>
                            <div className="text-sm font-bold text-gray-800 truncate group-hover:text-blue-600">{site.name}</div>
                          </div>
                       </a>
                    ))}
                 </div>
              </div>
            )}

            {/* Legal Basis */}
            {subsidy.legalBases && subsidy.legalBases.length > 0 && (
                <div>
                    <h3 className="text-lg font-bold text-[#371D1E] mb-3 flex items-center">
                        <BookOpen className="w-5 h-5 mr-2 text-gray-600" /> 근거 법령
                    </h3>
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 space-y-2">
                        {subsidy.legalBases.map((law, idx) => (
                            <div key={idx} className="flex items-center justify-between">
                                <div className="flex items-center text-sm text-gray-700">
                                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mr-2 shrink-0"></span>
                                    {law.name}
                                </div>
                                {law.url && (
                                    <a href={law.url} target="_blank" rel="noreferrer" className="ml-2 p-1 text-blue-500 hover:bg-blue-50 rounded transition-colors">
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Files */}
            {subsidy.referenceFiles && subsidy.referenceFiles.length > 0 && (
                <div>
                    <h3 className="text-lg font-bold text-[#371D1E] mb-4 flex items-center">
                        <FileDown className="w-5 h-5 mr-2 text-gray-600" />
                        서식 및 자료 다운로드
                    </h3>
                    <div className="space-y-3">
                        {subsidy.referenceFiles.map((item, idx) => (
                            <div key={idx} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex items-center overflow-hidden">
                                    <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center shrink-0 mr-3 border border-red-100">
                                        <span className="text-[10px] font-bold text-red-500">PDF</span>
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-sm font-bold text-gray-800 truncate pr-2" title={item.name}>{item.name}</span>
                                        <span className="text-xs text-gray-500">자료 확인 및 저장</span>
                                    </div>
                                </div>
                                {item.url && (
                                    <a 
                                        href={item.url}
                                        target="_blank" 
                                        rel="noreferrer" 
                                        className="shrink-0 px-4 py-2.5 rounded-lg text-xs font-bold bg-[#371D1E] text-[#FAE100] hover:bg-gray-800 transition-colors flex items-center justify-center shadow-sm"
                                    >
                                        <Download className="w-3 h-3 mr-1.5" /> 다운로드
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-100 bg-white flex space-x-4 shrink-0 rounded-b-3xl">
          <button onClick={onClose} className="flex-1 py-4 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">
            나중에 보기
          </button>
          <a 
            href={subsidy.url || '#'} 
            target="_blank"
            rel="noreferrer"
            className={`flex-[2] py-4 font-bold rounded-xl shadow-lg transition-colors flex justify-center items-center ${
                subsidy.url 
                ? 'bg-[#FAE100] text-[#371D1E] hover:bg-yellow-400' 
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