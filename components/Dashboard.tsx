
import React, { useMemo, useState, useEffect } from 'react';
import { UserProfile, Subsidy, SubsidySource } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { CheckCircle, AlertCircle, ChevronRight, Clock, FileText, Settings, Filter, ChevronLeft } from 'lucide-react';

interface DashboardProps {
  profile: UserProfile;
  subsidies: Subsidy[];
  onSelectSubsidy: (subsidy: Subsidy) => void;
  onOpenSettings?: () => void;
  isRealData?: boolean;
  selectedSources: SubsidySource[];
  onToggleSource: (source: SubsidySource) => void;
}

const COLORS = ['#FAE100', '#371D1E', '#9CA3AF', '#FDBA74', '#60A5FA'];
const ITEMS_PER_PAGE = 10;

const Dashboard: React.FC<DashboardProps> = ({ 
  profile, 
  subsidies, 
  onSelectSubsidy, 
  onOpenSettings, 
  isRealData = false,
  selectedSources,
  onToggleSource
}) => {
  
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to page 1 when filters change or data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedSources, subsidies, profile.interests]);
  
  const matchedSubsidies = useMemo(() => {
    // Unified filtering logic for both Mock and Real data
    return subsidies.filter(s => 
      (profile.interests.length === 0 || profile.interests.includes(s.category)) &&
      ((s.provider === 'Central' && selectedSources.includes('Central')) ||
       (s.provider === 'Local' && selectedSources.includes('Local')))
    ).sort((a, b) => b.matchRate - a.matchRate);
  }, [subsidies, profile, selectedSources]);

  const chartData = useMemo(() => {
    const counts: Record<string, number> = {};
    if (matchedSubsidies.length === 0) return [{name: '데이터 없음', value: 1}];
    
    matchedSubsidies.forEach(s => {
      counts[s.category] = (counts[s.category] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [matchedSubsidies]);

  const totalAmount = isRealData ? "산정 중" : "540만원+a"; 

  // Pagination Logic
  const totalPages = Math.ceil(matchedSubsidies.length / ITEMS_PER_PAGE);
  const displayedSubsidies = matchedSubsidies.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
        setCurrentPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6 pb-24">
      {/* Header Summary */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative group">
        {onOpenSettings && (
          <button 
            onClick={onOpenSettings}
            className="absolute top-4 right-4 p-2 text-gray-300 hover:text-kakao-brown transition-colors"
            title="데이터 설정"
          >
            <Settings className="w-5 h-5" />
          </button>
        )}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <div className="flex items-center space-x-2 mb-1">
                <p className="text-gray-500 text-sm">오늘 업데이트</p>
                {isRealData ? (
                  <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                    REAL API
                  </span>
                ) : (
                  <span className="bg-gray-200 text-gray-600 text-[10px] px-2 py-0.5 rounded-full font-bold">PROTOTYPE</span>
                )}
            </div>
            <h2 className="text-2xl font-bold text-kakao-brown">
              {profile.region} 거주 {profile.age}세 <br className="md:hidden"/>맞춤 리포트
            </h2>
          </div>
          <div className="mt-4 md:mt-0 bg-yellow-50 px-4 py-2 rounded-lg border border-yellow-100 mr-8 md:mr-0">
            <span className="text-yellow-700 text-sm font-semibold">예상 수혜 금액</span>
            <p className="text-2xl font-bold text-kakao-brown">{totalAmount}</p>
          </div>
        </div>
      </div>

      {/* Source Filter & Stats Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Stats Chart - Shows Global Stats */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 md:col-span-1 flex flex-col items-center justify-center h-fit md:sticky md:top-20">
          <h3 className="text-sm font-semibold text-gray-500 mb-4 w-full text-left">분야별 혜택 분포 (전체)</h3>
          <div className="w-full h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={60}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 justify-center mt-2">
            {chartData.map((entry, index) => (
              <span key={entry.name} className="text-xs flex items-center">
                <span className="w-2 h-2 rounded-full mr-1" style={{backgroundColor: COLORS[index % COLORS.length]}}></span>
                {entry.name}
              </span>
            ))}
          </div>
        </div>

        {/* List Section */}
        <div className="md:col-span-2 space-y-4">
           
           {/* Filter Controls */}
           <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
             {/* Row 1: Source Selection */}
             <div className="flex justify-between items-center">
                <div className="flex items-center text-kakao-brown font-bold">
                    <Filter className="w-5 h-5 mr-2 text-kakao-yellow" />
                    <span>조회 필터</span>
                </div>
                <div className="flex space-x-4">
                  <label className="flex items-center cursor-pointer select-none hover:bg-gray-50 px-2 py-1 rounded-lg transition-colors">
                    <input 
                        type="checkbox" 
                        checked={selectedSources.includes('Central')} 
                        onChange={() => onToggleSource('Central')}
                        className="w-4 h-4 text-kakao-yellow rounded focus:ring-kakao-yellow mr-2" 
                    />
                    <span className={`text-sm ${selectedSources.includes('Central') ? 'text-gray-800 font-semibold' : 'text-gray-400'}`}>중앙부처</span>
                  </label>
                  <label className="flex items-center cursor-pointer select-none hover:bg-gray-50 px-2 py-1 rounded-lg transition-colors">
                    <input 
                        type="checkbox" 
                        checked={selectedSources.includes('Local')} 
                        onChange={() => onToggleSource('Local')}
                        className="w-4 h-4 text-kakao-yellow rounded focus:ring-kakao-yellow mr-2" 
                    />
                    <span className={`text-sm ${selectedSources.includes('Local') ? 'text-gray-800 font-semibold' : 'text-gray-400'}`}>지자체</span>
                  </label>
                </div>
             </div>

             {/* Row 2: Active Interest Tags */}
             <div className="flex items-start pt-3 border-t border-gray-100">
                <span className="text-xs font-bold text-gray-500 mt-1.5 mr-3 shrink-0">선택한 관심분야</span>
                <div className="flex flex-wrap gap-2">
                    {profile.interests.length > 0 ? profile.interests.map(tag => (
                        <span key={tag} className="px-2.5 py-1 bg-kakao-yellow/20 text-kakao-brown text-xs rounded-full font-medium border border-kakao-yellow/10">
                            {tag}
                        </span>
                    )) : (
                        <span className="text-xs text-gray-400 mt-1.5">전체 보기</span>
                    )}
                </div>
             </div>
           </div>

           <h3 className="text-lg font-bold text-kakao-brown flex items-center px-1">
             <CheckCircle className="w-5 h-5 text-kakao-yellow mr-2" fill="#371D1E" />
             {isRealData ? '실시간 조회 결과' : '신청 가능성이 높은 혜택'} ({matchedSubsidies.length}건)
           </h3>
           
           {matchedSubsidies.length === 0 && (
             <div className="bg-white p-8 rounded-xl text-center text-gray-400 border border-dashed border-gray-200">
               선택하신 조건에 맞는 혜택이 없습니다.<br/>
               필터를 변경하거나 잠시 후 다시 시도해주세요.
             </div>
           )}

           {/* Paginated List */}
           <div className="space-y-3">
             {displayedSubsidies.map((subsidy) => (
               <div 
                key={subsidy.id}
                onClick={() => onSelectSubsidy(subsidy)}
                className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-kakao-yellow transition-all cursor-pointer group"
               >
                 <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-md font-medium">
                        {subsidy.category}
                      </span>
                      {subsidy.matchRate >= 90 && (
                        <span className="bg-red-50 text-red-500 text-xs px-2 py-1 rounded-md font-bold flex items-center">
                          <AlertCircle className="w-3 h-3 mr-1" /> 강력 추천
                        </span>
                      )}
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border ${subsidy.provider === 'Central' ? 'border-blue-200 text-blue-600' : 'border-green-200 text-green-600'}`}>
                        {subsidy.provider === 'Central' ? '중앙' : '지자체'}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-blue-600 whitespace-nowrap ml-2">{subsidy.amount}</span>
                 </div>
                 <h4 className="text-lg font-bold text-gray-800 group-hover:text-kakao-brown mb-1">
                   {subsidy.title}
                 </h4>
                 <p className="text-sm text-gray-500 line-clamp-1 mb-3">{subsidy.description}</p>
                 
                 <div className="flex justify-between items-center border-t border-gray-50 pt-3">
                    <div className="flex space-x-4 text-xs text-gray-400">
                      <span className="flex items-center"><Clock className="w-3 h-3 mr-1"/> {subsidy.deadline}</span>
                      <span className="flex items-center"><FileText className="w-3 h-3 mr-1"/> 서류 {subsidy.documents.length > 0 ? `${subsidy.documents.length}개` : '확인 필요'}</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-kakao-yellow" />
                 </div>
               </div>
             ))}
           </div>

           {/* Pagination Controls */}
           {totalPages > 1 && (
             <div className="flex justify-center items-center space-x-2 mt-8 pt-4">
               <button 
                 onClick={() => handlePageChange(currentPage - 1)}
                 disabled={currentPage === 1}
                 className={`p-2 rounded-lg border ${currentPage === 1 ? 'text-gray-300 border-gray-200 cursor-not-allowed' : 'text-gray-600 border-gray-300 hover:bg-gray-50'}`}
               >
                 <ChevronLeft className="w-5 h-5" />
               </button>
               
               <div className="flex space-x-1">
                 {/* Simple pagination for now - can be enhanced to show ranges */}
                 {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                   // Show first, last, and pages around current
                   (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) ? (
                     <button
                       key={page}
                       onClick={() => handlePageChange(page)}
                       className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${
                         currentPage === page 
                           ? 'bg-kakao-brown text-kakao-yellow shadow-md transform scale-105' 
                           : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                       }`}
                     >
                       {page}
                     </button>
                   ) : (
                     (page === 2 && currentPage > 3) || (page === totalPages - 1 && currentPage < totalPages - 2) ? (
                       <span key={page} className="w-8 h-10 flex items-center justify-center text-gray-400">...</span>
                     ) : null
                   )
                 ))}
               </div>

               <button 
                 onClick={() => handlePageChange(currentPage + 1)}
                 disabled={currentPage === totalPages}
                 className={`p-2 rounded-lg border ${currentPage === totalPages ? 'text-gray-300 border-gray-200 cursor-not-allowed' : 'text-gray-600 border-gray-300 hover:bg-gray-50'}`}
               >
                 <ChevronRight className="w-5 h-5" />
               </button>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
