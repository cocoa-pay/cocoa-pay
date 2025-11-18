
import { Subsidy, InterestTag, SubsidySource } from './types';

// API Base URLs
const CENTRAL_BASE_URL = 'https://apis.data.go.kr/B554287/NationalWelfareInformationsV001';
const LOCAL_BASE_URL = 'https://apis.data.go.kr/B554287/LocalGovernmentWelfareInformations';

// XML Helper to safely get text content
const getTagValue = (parent: Element | Document, tagName: string): string => {
  const collection = parent.getElementsByTagName(tagName);
  if (collection.length > 0) {
    return collection[0].textContent?.trim() || '';
  }
  return '';
};

// Helper to clean HTML-like content from XML response
const cleanContent = (text: string): string => {
  if (!text) return '';
  return text.replace(/<br\s*\/?>/gi, '\n').replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&amp;/g, '&').trim();
};

const mapCategoryFromXml = (title: string, digest: string, lifeArray: string): InterestTag => {
  const text = (title + ' ' + digest).toLowerCase();

  // Central API codes mapping
  if (lifeArray.includes('004')) return InterestTag.YOUTH;
  if (lifeArray.includes('001') || lifeArray.includes('002') || lifeArray.includes('영유아')) return InterestTag.CHILD_CARE;
  if (lifeArray.includes('006') || lifeArray.includes('노년')) return InterestTag.OLD_AGE;
  if (lifeArray.includes('임신') || lifeArray.includes('출산')) return InterestTag.CHILD_CARE;

  // Keyword analysis
  if (text.includes('청년') || text.includes('대학')) return InterestTag.YOUTH;
  if (text.includes('노인') || text.includes('연금') || text.includes('고령')) return InterestTag.OLD_AGE;
  if (text.includes('영유아') || text.includes('아동') || text.includes('보육') || text.includes('아이') || text.includes('임신') || text.includes('출산')) return InterestTag.CHILD_CARE;
  if (text.includes('장애') || text.includes('의료') || text.includes('건강') || text.includes('환자')) return InterestTag.MEDICAL;
  if (text.includes('주거') || text.includes('전세') || text.includes('월세') || text.includes('부동산') || text.includes('주택')) return InterestTag.HOUSING;
  if (text.includes('교육') || text.includes('장학') || text.includes('학교')) return InterestTag.EDUCATION;
  if (text.includes('대출') || text.includes('융자')) return InterestTag.LOAN;
  
  return InterestTag.TAX;
};

/**
 * Fetches the list of subsidies based on selected sources.
 */
export const fetchSubsidies = async (key: string, sources: SubsidySource[]): Promise<Subsidy[]> => {
  try {
    const serviceKey = key.includes('%') ? key : encodeURIComponent(key);
    const subsidies: Subsidy[] = [];
    const promises = [];

    // 1. Central API List Call
    if (sources.includes('Central')) {
      // Request: /NationalWelfarelistV001?callTp=L&...
      // Increased numOfRows to 100 as requested
      const centralUrl = `${CENTRAL_BASE_URL}/NationalWelfarelistV001?serviceKey=${serviceKey}&callTp=L&pageNo=1&numOfRows=100&srchKeyCode=001&onapPsbltYn=Y&orderBy=popular`;
      promises.push(
        fetch(centralUrl)
          .then(res => res.text())
          .then(text => {
             const parser = new DOMParser();
             const doc = parser.parseFromString(text, "text/xml");
             checkError(doc, 'Central List');
             
             const items = doc.getElementsByTagName('servList');
             Array.from(items).forEach((node) => {
                const id = getTagValue(node, 'servId');
                const title = getTagValue(node, 'servNm');
                const description = getTagValue(node, 'servDgst');
                const lifeArray = getTagValue(node, 'lifeArray');
                const jurOrgNm = getTagValue(node, 'jurOrgNm');
                const link = getTagValue(node, 'servDtlLink');

                if (id) {
                    subsidies.push({
                        id,
                        title: title || `정부 지원사업 (${jurOrgNm || id})`,
                        description: description || '상세 내용은 상세보기를 참조하세요.',
                        amount: '지원금액 확인 필요', // List doesn't usually have amount
                        category: mapCategoryFromXml(title, description, lifeArray),
                        matchRate: Math.floor(Math.random() * 20) + 80, // Mock score
                        provider: 'Central',
                        deadline: '상시/별도문의',
                        documents: [],
                        isApplied: false,
                        url: link,
                        steps: [
                          { order: 1, title: '상세 조회', description: '코코아페이에서 상세정보 확인', isDone: true },
                          { order: 2, title: '신청', description: '복지로/정부24 웹사이트', isDone: false }
                        ]
                    });
                }
             });
          })
          .catch(e => console.error("Central Fetch Error:", e))
      );
    }

    // 2. Local API List Call
    if (sources.includes('Local')) {
      // Request: /LcgvWelfarelist?... 
      // Increased numOfRows to 100 as requested
      const localUrl = `${LOCAL_BASE_URL}/LcgvWelfarelist?serviceKey=${serviceKey}&pageNo=1&numOfRows=100`;
      promises.push(
        fetch(localUrl)
          .then(res => res.text())
          .then(text => {
             const parser = new DOMParser();
             const doc = parser.parseFromString(text, "text/xml");
             checkError(doc, 'Local List');

             const items = doc.getElementsByTagName('servList');
             Array.from(items).forEach((node) => {
                const id = getTagValue(node, 'servId') || getTagValue(node, 'inqNum');
                const title = getTagValue(node, 'servNm');
                const description = getTagValue(node, 'servDgst');
                const lifeNmArray = getTagValue(node, 'lifeNmArray');
                const ctpvNm = getTagValue(node, 'ctpvNm');
                const aplyMtdNm = getTagValue(node, 'aplyMtdNm');
                const link = getTagValue(node, 'servDtlLink');

                if (id) {
                    subsidies.push({
                        id,
                        title: title || `지자체 지원사업 (${ctpvNm || '지역'})`,
                        description: description || '상세 내용은 상세보기를 참조하세요.',
                        amount: '지원금액 확인 필요',
                        category: mapCategoryFromXml(title, description, lifeNmArray),
                        matchRate: Math.floor(Math.random() * 20) + 80,
                        provider: 'Local',
                        deadline: '상시/별도문의',
                        documents: [],
                        isApplied: false,
                        url: link,
                        steps: [
                            { order: 1, title: '공고 확인', description: `${ctpvNm || '지자체'} 홈페이지`, isDone: true },
                            { order: 2, title: '신청', description: aplyMtdNm || '방문/온라인', isDone: false }
                        ]
                    });
                }
             });
          })
          .catch(e => console.error("Local Fetch Error:", e))
      );
    }

    await Promise.all(promises);
    return subsidies;

  } catch (error) {
    console.error("API Fetch Error:", error);
    throw error;
  }
};

/**
 * Fetches detailed information for a specific subsidy.
 */
export const fetchSubsidyDetail = async (id: string, provider: 'Central' | 'Local', key: string): Promise<Partial<Subsidy>> => {
    try {
        const serviceKey = key.includes('%') ? key : encodeURIComponent(key);
        let url = '';

        // Construct URL based on provider spec
        if (provider === 'Central') {
            // Central Detail: callTp=D is required
            url = `${CENTRAL_BASE_URL}/NationalWelfaredetailedV001?serviceKey=${serviceKey}&callTp=D&servId=${id}`;
        } else {
            // Local Detail: servId parameter
            url = `${LOCAL_BASE_URL}/LcgvWelfaredetailed?serviceKey=${serviceKey}&servId=${id}`;
        }

        console.log(`[API Detail] Fetching ${provider} detail for ${id}`);
        
        const res = await fetch(url);
        const text = await res.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, "text/xml");
        
        checkError(doc, `${provider} Detail`);

        const dtl = doc.getElementsByTagName('wantedDtl')[0];
        if (!dtl) throw new Error('No detail data found');

        // Parse fields based on the specific XML examples provided
        // Central uses: tgtrDtlCn, slctCritCn, alwServCn
        // Local uses: sprtTrgtCn, slctCritCn, alwServCn (Need to handle potential differences)
        
        const supportContent = cleanContent(getTagValue(dtl, 'alwServCn')); // 급여내용
        const selectionCriteria = cleanContent(getTagValue(dtl, 'slctCritCn')); // 선정기준
        
        // Target Detail might differ by API
        const targetDetail = cleanContent(getTagValue(dtl, 'tgtrDtlCn') || getTagValue(dtl, 'sprtTrgtCn')); 
        
        // Try to extract contact info
        const inqplCtadrList = dtl.getElementsByTagName('inqplCtadrList');
        let contactInfo = '';
        if (inqplCtadrList.length > 0) {
            contactInfo = getTagValue(inqplCtadrList[0], 'servSeDetailNm') || getTagValue(inqplCtadrList[0], 'wlfareInfoReldNm');
            const phone = getTagValue(inqplCtadrList[0], 'servSeDetailLink') || getTagValue(inqplCtadrList[0], 'wlfareInfoReldCn');
            if (phone) contactInfo += ` (${phone})`;
        }

        // Extract documents (infer from content or look for basfrmList)
        const documents: string[] = [];
        if (selectionCriteria.includes('신분증')) documents.push('신분증');
        if (selectionCriteria.includes('통장')) documents.push('통장사본');
        if (selectionCriteria.includes('소득')) documents.push('소득증빙서류');
        if (documents.length === 0) documents.push('상세 모집공고 참조');

        return {
            supportContent,
            selectionCriteria,
            targetDetail,
            contactInfo,
            documents,
            isDetailFetched: true
        };

    } catch (error) {
        console.error("Detail Fetch Error:", error);
        return {}; // Return empty to avoid crashing app, will show list info
    }
}

const checkError = (doc: Document, context: string) => {
    const resultCode = getTagValue(doc, 'resultCode');
    const resultMsg = getTagValue(doc, 'resultMsg');
    
    // Code 0, 00, 200 are generally success. 
    // Code 40 or 03 often means No Data (not necessarily an error).
    if (resultCode === '00' || resultCode === '0' || resultCode === '200' || resultMsg === 'SUCCESS' || resultMsg === 'OK') {
        return;
    }
    
    if (resultCode === '03' || resultCode === '40' || resultMsg.includes('NO DATA')) {
        console.warn(`[${context}] No Data: ${resultMsg}`);
        return; 
    }

    const errMsg = getTagValue(doc, 'errMsg') || getTagValue(doc, 'returnAuthMsg');
    if (errMsg || (resultCode && resultCode !== '0')) {
        throw new Error(`[${context}] API Error ${resultCode}: ${errMsg || resultMsg}`);
    }
};
