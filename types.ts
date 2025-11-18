export enum Region {
  SEOUL = '서울',
  GYEONGGI = '경기',
  INCHEON = '인천',
  BUSAN = '부산',
  DAEGU = '대구',
  GWANGJU = '광주',
  DAEJEON = '대전',
  ULSAN = '울산',
  SEJONG = '세종',
  GANGWON = '강원',
  CHUNGBUK = '충북',
  CHUNGNAM = '충남',
  JEONBUK = '전북',
  JEONNAM = '전남',
  GYEONGBUK = '경북',
  GYEONGNAM = '경남',
  JEJU = '제주',
}

export enum InterestTag {
  HOUSING = '주거',
  MEDICAL = '의료',
  EDUCATION = '교육',
  CHILD_CARE = '육아',
  OLD_AGE = '노후',
  YOUTH = '청년',
  TAX = '세금',
  LOAN = '대출',
}

export interface UserProfile {
  age: number;
  region: Region;
  incomePercent: number; // % of median income
  householdSize: number;
  hasChildren: boolean;
  interests: InterestTag[];
}

export interface SubsidyStep {
  order: number;
  title: string;
  description: string;
  isDone: boolean;
  date?: string;
}

export interface Subsidy {
  id: string;
  title: string;
  description: string;
  amount: string;
  category: InterestTag;
  matchRate: number; // 0-100
  provider: 'Central' | 'Local' | 'Private';
  deadline: string;
  steps: SubsidyStep[];
  documents: string[];
  isApplied: boolean;
  
  // Detailed Info Fields (Loaded on demand)
  isDetailFetched?: boolean;
  supportContent?: string; // alwServCn (급여/지원내용)
  selectionCriteria?: string; // slctCritCn (선정기준)
  targetDetail?: string; // tgtrDtlCn (대상상세)
  contactInfo?: string; // inqplCtadrList (문의처)
  url?: string; // servDtlLink (상세링크)
}

export type SubsidySource = 'Central' | 'Local';