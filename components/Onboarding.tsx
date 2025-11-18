
import React, { useState } from 'react';
import { Region, InterestTag, UserProfile } from '../types';
import { REGIONS, INTERESTS } from '../constants';
import { Check, ChevronRight, User, MapPin, Wallet, Heart, Settings, HelpCircle } from 'lucide-react';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
  onOpenSettings: () => void;
  onOpenAbout: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete, onOpenSettings, onOpenAbout }) => {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<UserProfile>({
    age: 28,
    region: Region.SEOUL,
    incomePercent: 80,
    householdSize: 1,
    hasChildren: false,
    interests: [],
  });

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const toggleInterest = (tag: InterestTag) => {
    setProfile(prev => {
      const exists = prev.interests.includes(tag);
      if (exists) {
        return { ...prev, interests: prev.interests.filter(i => i !== tag) };
      }
      return { ...prev, interests: [...prev.interests, tag] };
    });
  };

  const renderProgressBar = () => (
    <div className="w-full bg-gray-200 h-2 rounded-full mb-8 overflow-hidden">
      <div 
        className="bg-kakao-yellow h-full transition-all duration-500 ease-out"
        style={{ width: `${(step / 3) * 100}%` }}
      />
    </div>
  );

  return (
    <div className="max-w-lg mx-auto bg-white min-h-screen md:min-h-[600px] md:rounded-3xl md:shadow-xl md:my-8 p-6 flex flex-col relative overflow-hidden">
      {/* Header Buttons */}
      <div className="absolute top-6 right-6 flex space-x-2 z-20">
        <button 
          onClick={onOpenAbout}
          className="p-2 text-gray-300 hover:text-kakao-brown transition-colors"
          title="서비스 소개"
        >
          <HelpCircle className="w-6 h-6" />
        </button>
        <button 
          onClick={onOpenSettings}
          className="p-2 text-gray-300 hover:text-kakao-brown transition-colors"
          title="API 설정"
        >
          <Settings className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 z-10">
        <h1 className="text-2xl font-bold text-kakao-brown mb-2 pr-8">
          숨어있는 지원금,<br />
          <span className="text-yellow-600">코코아페이</span>가 찾아드릴게요!
        </h1>
        <p className="text-gray-500 text-sm mb-6">딱 30초면 충분해요. 프로필을 입력해주세요.</p>
        
        {renderProgressBar()}

        <div className="transition-all duration-500">
          {step === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <label className="flex items-center text-gray-700 font-semibold mb-2">
                  <User className="w-5 h-5 mr-2" /> 나이가 어떻게 되시나요?
                </label>
                <input 
                  type="number" 
                  value={profile.age}
                  onChange={(e) => setProfile({...profile, age: parseInt(e.target.value) || 0})}
                  className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-kakao-yellow text-lg bg-white text-gray-900"
                />
              </div>
              
              <div>
                <label className="flex items-center text-gray-700 font-semibold mb-2">
                  <MapPin className="w-5 h-5 mr-2" /> 어디에 거주하시나요?
                </label>
                <select 
                  value={profile.region}
                  onChange={(e) => setProfile({...profile, region: e.target.value as Region})}
                  className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-kakao-yellow text-lg bg-white text-gray-900"
                >
                  {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <label className="flex items-center text-gray-700 font-semibold mb-2">
                  <Wallet className="w-5 h-5 mr-2" /> 소득 구간 (중위소득 기준 %)
                </label>
                <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                  <span>0%</span>
                  <span>{profile.incomePercent}%</span>
                  <span>200%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="200" 
                  value={profile.incomePercent}
                  onChange={(e) => setProfile({...profile, incomePercent: parseInt(e.target.value)})}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-kakao-yellow"
                />
                <p className="text-xs text-gray-400 mt-2">
                  * 대략적인 수치여도 괜찮아요. 나중에 수정할 수 있어요.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">가구원 수</label>
                  <input 
                    type="number" 
                    min="1"
                    value={profile.householdSize}
                    onChange={(e) => setProfile({...profile, householdSize: parseInt(e.target.value)})}
                    className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-kakao-yellow bg-white text-gray-900"
                  />
                </div>
                <div className="flex items-center pt-8">
                   <label className="flex items-center cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={profile.hasChildren}
                      onChange={(e) => setProfile({...profile, hasChildren: e.target.checked})}
                      className="w-5 h-5 text-kakao-yellow rounded focus:ring-kakao-yellow"
                    />
                    <span className="ml-2 text-gray-700">자녀 있음</span>
                   </label>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <label className="flex items-center text-gray-700 font-semibold mb-4">
                  <Heart className="w-5 h-5 mr-2" /> 관심있는 분야를 선택해주세요
                </label>
                <div className="flex flex-wrap gap-2">
                  {INTERESTS.map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleInterest(tag)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        profile.interests.includes(tag)
                          ? 'bg-kakao-brown text-white shadow-md scale-105'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 flex justify-between items-center">
        {step > 1 ? (
          <button 
            onClick={prevStep}
            className="px-6 py-3 text-gray-500 font-medium hover:text-gray-800"
          >
            이전
          </button>
        ) : (
          <div></div>
        )}
        
        <button 
          onClick={step === 3 ? () => onComplete(profile) : nextStep}
          className="flex items-center bg-kakao-yellow hover:bg-yellow-400 text-kakao-brown font-bold px-8 py-3 rounded-xl shadow-lg transition-all transform hover:scale-105 active:scale-95"
        >
          {step === 3 ? '결과 보기' : '다음'}
          <ChevronRight className="w-5 h-5 ml-1" />
        </button>
      </div>
    </div>
  );
};

export default Onboarding;
