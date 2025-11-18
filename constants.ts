import { InterestTag, Region, Subsidy } from './types';

export const MOCK_SUBSIDIES: Subsidy[] = [
  {
    id: 'sub-001',
    title: '청년월세 특별지원',
    description: '부모와 떨어져 거주하는 무주택 청년에게 월 최대 20만원을 12개월간 지원합니다.',
    amount: '최대 240만원',
    category: InterestTag.HOUSING,
    matchRate: 95,
    provider: 'Central',
    deadline: '2024-12-31',
    documents: ['임대차계약서', '가족관계증명서', '통장사본'],
    isApplied: false,
    steps: [
      { order: 1, title: '자가진단', description: '복지로 모의계산을 통해 자격 확인', isDone: true },
      { order: 2, title: '서류 발급', description: '주민센터 및 온라인 발급', isDone: false },
      { order: 3, title: '신청 접수', description: '복지로 웹사이트 또는 앱 신청', isDone: false },
      { order: 4, title: '심사 대기', description: '약 2-4주 소요', isDone: false },
    ]
  },
  {
    id: 'sub-002',
    title: 'K-패스 (교통비 환급)',
    description: '월 15회 이상 대중교통 이용 시 지출금액의 일정 비율을 환급해주는 카드입니다.',
    amount: '월 최대 30%',
    category: InterestTag.YOUTH,
    matchRate: 98,
    provider: 'Central',
    deadline: '상시',
    documents: ['신분증', '본인명의 휴대폰'],
    isApplied: false,
    steps: [
      { order: 1, title: '카드 발급', description: '주요 카드사 홈페이지 신청', isDone: false },
      { order: 2, title: '회원가입', description: 'K-패스 앱 가입 및 카드 등록', isDone: false },
    ]
  },
  {
    id: 'sub-003',
    title: '첫만남 이용권',
    description: '출생 아동에게 200만원 이상의 바우처를 지급하여 초기 육아 부담을 경감합니다.',
    amount: '200만원',
    category: InterestTag.CHILD_CARE,
    matchRate: 40,
    provider: 'Central',
    deadline: '출생 후 1년',
    documents: ['출생신고서', '신분증'],
    isApplied: false,
    steps: [
        { order: 1, title: '출생 신고', description: '주민센터 방문', isDone: false },
        { order: 2, title: '행복출산 원스톱', description: '정부24에서 통합 신청', isDone: false },
    ]
  },
  {
    id: 'sub-004',
    title: '청년도약계좌',
    description: '청년의 중장기 자산형성을 지원하기 위한 정책형 금융상품입니다.',
    amount: '최대 5,000만원+a',
    category: InterestTag.YOUTH,
    matchRate: 85,
    provider: 'Central',
    deadline: '매월 신청기간',
    documents: ['소득금액증명원'],
    isApplied: false,
    steps: [
        { order: 1, title: '가입신청', description: '취급 은행 앱에서 신청', isDone: false },
        { order: 2, title: '심사결과 확인', description: '서민금융진흥원 알림', isDone: false },
        { order: 3, title: '계좌개설', description: '승인 후 은행 앱 개설', isDone: false },
    ]
  },
  {
    id: 'sub-005',
    title: '서울시 희망두배 청년통장',
    description: '참가자가 매월 적립하는 금액과 동일한 금액을 서울시가 적립해주는 통장입니다.',
    amount: '본인적립금의 100%',
    category: InterestTag.YOUTH,
    matchRate: 10,
    provider: 'Local',
    deadline: '2024-06-30',
    documents: ['주민등록초본', '가족관계증명서', '소득증빙서류'],
    isApplied: false,
    steps: [
        { order: 1, title: '공고 확인', description: '서울시 복지재단 홈페이지', isDone: false },
        { order: 2, title: '서류 제출', description: '주소지 동주민센터 방문/우편', isDone: false },
    ]
  }
];

export const REGIONS = Object.values(Region);
export const INTERESTS = Object.values(InterestTag);
