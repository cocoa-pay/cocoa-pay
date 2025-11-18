
import React, { useState, useEffect } from 'react';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import SubsidyDetail from './components/SubsidyDetail';
import AIChat from './components/AIChat';
import ApiKeyModal from './components/ApiKeyModal';
import AboutModal from './components/AboutModal';
import { UserProfile, Subsidy, SubsidySource } from './types';
import { MOCK_SUBSIDIES } from './constants';
import { fetchSubsidies } from './api';
import { Menu, Bell, UserCircle, AlertTriangle } from 'lucide-react';

const ALL_SOURCES: SubsidySource[] = ['Central', 'Local'];

const App: React.FC = () => {
  // State management for simple SPA routing
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [selectedSubsidy, setSelectedSubsidy] = useState<Subsidy | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Data State
  const [subsidies, setSubsidies] = useState<Subsidy[]>(MOCK_SUBSIDIES);
  const [apiKey, setApiKey] = useState('');
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isUsingRealApi, setIsUsingRealApi] = useState(false);
  
  // Filter State
  const [selectedSources, setSelectedSources] = useState<SubsidySource[]>(['Central', 'Local']);

  const loadData = async (key: string, sources: SubsidySource[], profile?: UserProfile) => {
    if (!key) {
      setSubsidies(MOCK_SUBSIDIES);
      setIsUsingRealApi(false);
      return;
    }

    if (sources.length === 0) {
        setSubsidies([]);
        return;
    }

    setIsLoading(true);
    setApiError(null);
    try {
      const realData = await fetchSubsidies(key, sources, profile);
      if (realData.length === 0) {
        setApiError('데이터 조회 결과가 0건입니다. (필터 조건에 맞는 지원금이 없거나, API 응답이 비어있습니다)');
      }
      setSubsidies(realData);
      setIsUsingRealApi(true);
    } catch (error: any) {
      console.error("Load Data Error:", error);
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      // Add traffic hint
      setApiError(`⚠️ API 오류: ${errorMessage}\n\n(Tip: 검색이 계속 실패한다면 일일 트래픽 제한(100건)을 초과했을 수 있습니다. 채팅봇에게 '트래픽'을 물어보세요!)`);
      setSubsidies(MOCK_SUBSIDIES); // Fallback to show *something* even on error if desired, or clear it.
      setIsUsingRealApi(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Source Toggling
  const handleToggleSource = (source: SubsidySource) => {
    const newSources = selectedSources.includes(source)
      ? selectedSources.filter(s => s !== source)
      : [...selectedSources, source];
    
    setSelectedSources(newSources);

    // NOTE: We removed the loadData call here to prevent re-fetching.
    // Client-side filtering in Dashboard takes care of visibility 
    // since we fetch all data initially.
  };

  const handleOnboardingComplete = (profile: UserProfile) => {
    setIsLoading(true);
    setUserProfile(profile);
    
    if (apiKey) {
      // Always fetch ALL sources initially to populate the master list
      loadData(apiKey, ALL_SOURCES, profile).then(() => setHasOnboarded(true));
    } else {
      setTimeout(() => {
        setIsLoading(false);
        setHasOnboarded(true);
      }, 2000);
    }
  };

  const handleSaveKey = (key: string) => {
    setApiKey(key);
    setIsApiModalOpen(false);
    if (hasOnboarded) {
        // Always fetch ALL sources when key changes to ensure we have full data
        loadData(key, ALL_SOURCES, userProfile || undefined);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] font-sans text-kakao-brown">
      {/* Global Header (only show on dashboard or loading) */}
      {(hasOnboarded || isLoading) && (
        <header className="bg-white px-4 py-3 sticky top-0 z-30 flex justify-between items-center shadow-sm">
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setIsAboutOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <Menu className="w-6 h-6 text-gray-700" />
            </button>
            <h1 className="text-xl font-bold text-kakao-brown">Kokoapay</h1>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-gray-100 rounded-full relative">
              <Bell className="w-6 h-6 text-gray-500" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            <button 
              onClick={() => setIsApiModalOpen(true)}
              className={`p-2 rounded-full transition-colors ${isUsingRealApi ? 'bg-green-100 text-green-700' : 'hover:bg-gray-100 text-gray-400'}`}
            >
              <UserCircle className="w-7 h-7" />
            </button>
          </div>
        </header>
      )}

      <main className="relative">
        {!hasOnboarded && !isLoading && (
          <Onboarding 
            onComplete={handleOnboardingComplete} 
            onOpenSettings={() => setIsApiModalOpen(true)}
            onOpenAbout={() => setIsAboutOpen(true)}
          />
        )}

        {isLoading && (
          <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center animate-fadeIn">
            <div className="w-16 h-16 border-4 border-kakao-yellow border-t-kakao-brown rounded-full animate-spin mb-6"></div>
            <h2 className="text-2xl font-bold mb-2">맞춤 혜택을 분석하고 있어요</h2>
            <p className="text-gray-500">
              {isUsingRealApi ? (
                  <>
                    공공데이터포털 실시간 연동 중...<br/>
                    AI가 {userProfile?.region} 지역 맞춤 정보를 선별하고 있습니다.
                  </>
              ) : (
                  <>
                    정부24, 복지로, 공공데이터포털에서<br />
                    선택하신 정보를 기반으로 조회 중입니다...
                  </>
              )}
            </p>
          </div>
        )}

        {hasOnboarded && userProfile && (
          <div className="animate-slideUp">
            {apiError && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 m-4 text-sm text-red-700 flex justify-between items-center shadow-sm">
                <span className="whitespace-pre-wrap flex-1 flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
                    {apiError}
                </span>
                <button onClick={() => setApiError(null)} className="text-red-400 hover:text-red-600 font-bold ml-3 px-2 py-1 whitespace-nowrap">
                   닫기
                </button>
              </div>
            )}
            <Dashboard 
              profile={userProfile}
              subsidies={subsidies}
              onSelectSubsidy={setSelectedSubsidy}
              onOpenSettings={() => setIsApiModalOpen(true)}
              isRealData={isUsingRealApi}
              selectedSources={selectedSources}
              onToggleSource={handleToggleSource}
            />
            <AIChat />
          </div>
        )}
      </main>

      {/* API Key Modal */}
      <ApiKeyModal 
        isOpen={isApiModalOpen}
        onClose={() => setIsApiModalOpen(false)}
        onSave={handleSaveKey}
        currentKey={apiKey}
      />

      {/* About Modal */}
      <AboutModal 
        isOpen={isAboutOpen} 
        onClose={() => setIsAboutOpen(false)} 
      />

      {/* Detail Modal */}
      {selectedSubsidy && (
        <SubsidyDetail 
          subsidy={selectedSubsidy} 
          onClose={() => setSelectedSubsidy(null)}
          apiKey={apiKey} // Pass key to allow detail fetching
        />
      )}
    </div>
  );
};

export default App;
