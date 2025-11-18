
import { Subsidy, InterestTag, SubsidySource, SubsidyStep, UserProfile } from './types';
import { GoogleGenAI } from "@google/genai";

// API Base URLs
const CENTRAL_BASE_URL = 'https://apis.data.go.kr/B554287/NationalWelfareInformationsV001';
const LOCAL_BASE_URL = 'https://apis.data.go.kr/B554287/LocalGovernmentWelfareInformations';

// XML Helper to safely get text content from multiple potential tag names
const getTagValue = (parent: Element | Document, tagName: string | string[]): string => {
  const tags = Array.isArray(tagName) ? tagName : [tagName];
  for (const tag of tags) {
    const collection = parent.getElementsByTagName(tag);
    if (collection.length > 0 && collection[0].textContent) {
      return collection[0].textContent.trim();
    }
  }
  return '';
};

// Helper to extract lists of similar objects from XML
const getListValues = (parent: Element, tagName: string, nameKeys: string[], valKeys: string[]) => {
    const nodes = parent.getElementsByTagName(tagName);
    const list: {name: string, url: string}[] = [];
    Array.from(nodes).forEach(node => {
        let name = '';
        for (const k of nameKeys) {
            const val = getTagValue(node, k);
            if (val) { name = val; break; }
        }

        let val = '';
        for (const k of valKeys) {
            const v = getTagValue(node, k);
            if (v) { val = v; break; }
        }
        if (name || val) list.push({ name, url: val });
    });
    return list;
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

const mapStepTitle = (rawName: string): string => {
    if (rawName.includes('신청')) return '신청 접수';
    if (rawName.includes('조사')) return '자격 조사';
    if (rawName.includes('결정')) return '대상자 선정';
    if (rawName.includes('이의')) return '이의 신청';
    if (rawName.includes('지급') || rawName.includes('제공')) return '서비스 지급';
    return rawName.replace('기관연락처목록', '').replace('목록', '') || '절차';
};

// --- Mapping Logic for API Request Codes ---

// Map User Age to lifeArray Code
const getLifeArrayCode = (age: number, hasChildren: boolean): string => {
    const codes: string[] = [];
    
    if (age >= 0 && age <= 5) codes.push('001');   // 영유아
    if (age >= 6 && age <= 12) codes.push('002');  // 아동
    if (age >= 13 && age <= 18) codes.push('003'); // 청소년
    if (age >= 19 && age <= 34) codes.push('004'); // 청년
    if (age >= 35 && age <= 64) codes.push('005'); // 중장년
    if (age >= 65) codes.push('006');              // 노년

    if (hasChildren) {
        codes.push('001'); // 영유아
        codes.push('002'); // 아동
        codes.push('007'); // 임신/출산
    }

    return [...new Set(codes)].join(',');
};

// Map User Interests to intrsThemaArray Code
const getInterestCodes = (interests: InterestTag[]): string => {
    const codeMap: Partial<Record<InterestTag, string[]>> = {
        [InterestTag.HOUSING]: ['040'],            // 주거
        [InterestTag.MEDICAL]: ['010', '020'],     // 신체건강, 정신건강
        [InterestTag.EDUCATION]: ['100'],          // 교육
        [InterestTag.CHILD_CARE]: ['090', '080', '120'], // 보육, 임신/출산, 보호/돌봄
        [InterestTag.OLD_AGE]: ['030', '120'],     // 생활지원, 보호/돌봄
        [InterestTag.YOUTH]: ['050'],              // 일자리 (청년 관련 다수 포함)
        [InterestTag.TAX]: ['130', '140'],         // 서민금융, 법률
        [InterestTag.LOAN]: ['130']                // 서민금융
    };

    const codes: string[] = [];
    interests.forEach(tag => {
        if (codeMap[tag]) {
            codes.push(...(codeMap[tag] as string[]));
        }
    });

    return [...new Set(codes)].join(',');
};

// AI Filtering Logic for Local Subsidies
const filterLocalSubsidiesByRegion = async (subsidies: Subsidy[], region: string, apiKey: string): Promise<Subsidy[]> => {
  if (subsidies.length === 0) return [];
  
  try {
    console.log(`[AI Filter] Starting analysis for region: ${region}, items: ${subsidies.length}`);
    const ai = new GoogleGenAI({ apiKey });
    
    // Prepare batch prompt
    const listText = subsidies.map(s => `ID: ${s.id} | Title: ${s.title}`).join('\n');
    
    const prompt = `
      Task: Identify which of the following Korean local government subsidies are valid for a resident of "${region}".
      
      Rules:
      1. "Local" subsidies are often specific to a Province (e.g. Gyeonggi) or a City/District (e.g. Suwon-si).
      2. If the subsidy title implies a specific region (e.g. "Incheon Youth Support"), match it against the user's region ("${region}").
      3. If the subsidy is for a specific district (e.g. "Gangnam-gu"), it is valid if the user's region is the parent city (e.g. "Seoul").
         - Example Mappings (Logic, not exhaustive):
         - Gangnam-gu, Seocho-gu, Songpa-gu -> Seoul
         - Haeundae-gu, Busanjin-gu -> Busan
         - Bundang-gu, Suwon-si, Yongin-si -> Gyeonggi
         - Eumseong-gun, Cheongju-si -> Chungbuk
      4. If the title does not specify a region or implies the user's region, include it.
      5. If the title specifies a DIFFERENT top-level region (e.g. User is Seoul, subsidy is "Busan..."), EXCLUDE it.
      
      Input List:
      ${listText}
      
      Output:
      Return a JSON array of STRINGS containing ONLY the valid IDs. 
      Example: ["123", "456"]
      Do not output markdown code blocks. Just the JSON string.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
          responseMimeType: 'application/json'
      }
    });

    const text = response.text;
    // Robust cleanup of JSON string just in case
    const jsonStr = text?.replace(/```json|```/g, '').trim();
    const validIds: string[] = JSON.parse(jsonStr || '[]');
    
    console.log(`[AI Filter] Kept ${validIds.length} out of ${subsidies.length} items.`);
    
    // Filter the original list
    return subsidies.filter(s => validIds.includes(s.id));

  } catch (error) {
    console.error("AI Region Filtering Failed:", error);
    // Fallback: If AI fails, return original list to prevent empty screen.
    return subsidies; 
  }
};

/**
 * Fetches the list of subsidies based on selected sources.
 */
export const fetchSubsidies = async (key: string, sources: SubsidySource[], profile?: UserProfile): Promise<Subsidy[]> => {
  try {
    // Avoid double encoding if key is already encoded (common in Korean APIs)
    const serviceKey = key.includes('%') ? key : encodeURIComponent(key);
    const subsidies: Subsidy[] = [];
    const promises = [];

    // Generate Filter Parameters
    let filterParams = '';
    if (profile) {
        const lifeArray = getLifeArrayCode(profile.age, profile.hasChildren);
        const intrsThemaArray = getInterestCodes(profile.interests);
        
        if (lifeArray) filterParams += `&lifeArray=${lifeArray}`;
        if (intrsThemaArray) filterParams += `&intrsThemaArray=${intrsThemaArray}`;
        
        console.log(`[API Query] Filter Params: ${filterParams}`);
    }

    // 1. Central API List Call
    if (sources.includes('Central')) {
      // Request: /NationalWelfarelistV001?callTp=L&...
      const centralUrl = `${CENTRAL_BASE_URL}/NationalWelfarelistV001?serviceKey=${serviceKey}&callTp=L&pageNo=1&numOfRows=100&srchKeyCode=001&onapPsbltYn=Y&orderBy=popular${filterParams}`;
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
      const localUrl = `${LOCAL_BASE_URL}/LcgvWelfarelist?serviceKey=${serviceKey}&pageNo=1&numOfRows=100${filterParams}`;
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

    // Post-processing: Filter Local subsidies by region using AI
    // Only if we have a user region, an API key (for Gemini), and there are local subsidies to filter
    const centralSubsidies = subsidies.filter(s => s.provider === 'Central');
    let localSubsidies = subsidies.filter(s => s.provider === 'Local');

    if (profile?.region && key && localSubsidies.length > 0) {
        localSubsidies = await filterLocalSubsidiesByRegion(localSubsidies, profile.region, key);
    }

    return [...centralSubsidies, ...localSubsidies];

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
        const supportContent = cleanContent(getTagValue(dtl, 'alwServCn')); // 급여내용
        const selectionCriteria = cleanContent(getTagValue(dtl, 'slctCritCn')); // 선정기준
        const targetDetail = cleanContent(getTagValue(dtl, 'tgtrDtlCn') || getTagValue(dtl, 'sprtTrgtCn'));
        const purpose = cleanContent(getTagValue(dtl, 'wlfareInfoOutlCn')); // 사업개요/목적
        const competentOrg = cleanContent(getTagValue(dtl, 'jurMnofNm')); // 담당부서 
        
        // Extract contact info summary
        const inqplCtadrNodes = dtl.getElementsByTagName('inqplCtadrList');
        let contactInfo = '';
        if (inqplCtadrNodes.length > 0) {
            contactInfo = getTagValue(inqplCtadrNodes[0], 'servSeDetailNm') || getTagValue(inqplCtadrNodes[0], 'wlfareInfoReldNm');
            const phone = getTagValue(inqplCtadrNodes[0], ['servSeDetailLink', 'wlfareInfoReldCn']);
            if (phone) contactInfo += ` (${phone})`;
        }

        // Specific Key Mapping for Robust Extraction
        
        // 1. Contacts (Phone/Address)
        // Usually Name is servSeDetailNm, Value is servSeDetailLink (containing phone number)
        const contacts = getListValues(dtl, 'inqplCtadrList', 
            ['servSeDetailNm', 'wlfareInfoReldNm'], 
            ['servSeDetailLink', 'wlfareInfoReldCn']
        );
        
        // 2. Websites
        const relatedWebsites = getListValues(dtl, 'inqplHmpgReldList', 
            ['servSeDetailNm', 'wlfareInfoReldNm'], 
            ['servSeDetailLink', 'wlfareInfoReldCn']
        );

        // 3. Legal Bases
        // Usually Name is servSeDetailNm or lawNm, URL might be servSeDetailLink or reldBylwLink
        const legalBases = getListValues(dtl, 'baslawList', 
            ['servSeDetailNm', 'lawNm', 'reldBylwNm'], 
            ['servSeDetailLink', 'reldBylwLink']
        );

        // 4. Reference Files
        const referenceFiles = getListValues(dtl, 'basfrmList', 
            ['servSeDetailNm', 'fileNm'], 
            ['servSeDetailLink', 'fileUrl']
        );

        // 5. Application Steps (Timeline)
        const applmetListRaw = getListValues(dtl, 'applmetList', ['servSeDetailNm'], ['servSeDetailLink']);
        const steps: SubsidyStep[] = applmetListRaw.map((item, index) => ({
            order: index + 1,
            title: mapStepTitle(item.name),
            description: cleanContent(item.url), // getListValues maps value/link to .url property
            isDone: false
        }));

        const documents: string[] = [];

        return {
            supportContent,
            selectionCriteria,
            targetDetail,
            purpose,
            competentOrg,
            contactInfo,
            documents,
            contacts,
            relatedWebsites,
            legalBases,
            referenceFiles,
            steps: steps.length > 0 ? steps : undefined,
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
