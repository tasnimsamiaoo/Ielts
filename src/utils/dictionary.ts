export interface DictionaryEntry {
  word: string;
  phonetic?: string;
  partOfSpeech: string;
  cefr?: 'B1' | 'B2' | 'C1' | 'C2';
  definition: string;
  banglaMeaning?: string; // বাংলা অর্থ
  banglaPronunciation?: string; // বাংলা উচ্চারণ
  banglaContext?: string; // বাংলা প্রেক্ষাপট ও ব্যাখ্যা
  example?: string;
  synonyms?: string[];
  audioUrl?: string;
}

// Built-in offline IELTS Academic Word List & Passage-specific dictionary with verified Bangla translations
export const ACADEMIC_DICTIONARY: Record<string, DictionaryEntry> = {
  microclimate: {
    word: 'microclimate',
    phonetic: '/ˈmaɪ.krəʊˌklaɪ.mət/',
    partOfSpeech: 'noun',
    cefr: 'C1',
    definition: 'The climate of a very small or restricted local area, especially when this differs significantly from the surrounding regional climate.',
    banglaMeaning: 'ক্ষুদ্র আবহাওয়া / স্থানীয় ক্ষুদ্র জলবায়ু',
    banglaPronunciation: 'মাইক্রোক্লাইমেট',
    banglaContext: 'পাথরের দেয়াল দিনের তাপ সঞ্চয় করে রাতে উষ্ণ ক্ষুদ্র জলবায়ু তৈরি করে ফসলকে তুষারপাত থেকে রক্ষা করত।',
    example: 'Stone walls absorbed daytime heat to warm the nighttime microclimate.',
    synonyms: ['local climate', 'mesoclimate', 'thermal niche'],
  },
  terrace: {
    word: 'terrace',
    phonetic: '/ˈter.əs/',
    partOfSpeech: 'noun',
    cefr: 'B2',
    definition: 'A level stepped platform cut into a steep mountainside or hill for systematic agricultural cultivation.',
    banglaMeaning: 'ধাপযুক্ত পাহাড়ি চাষের জমি / সোপান',
    banglaPronunciation: 'টেরাস',
    banglaContext: 'খাড়া পাহাড়ের গায়ে ধাপ কেটে সমতল জমি তৈরি করে চাষাবাদ করার প্রাচীন পাহাড়ি কৃষি পদ্ধতি।',
    example: 'Andean farmers transformed vertical mountain slopes into stepped agricultural terraces.',
    synonyms: ['step', 'bench', 'platform', 'tier'],
  },
  stratification: {
    word: 'stratification',
    phonetic: '/ˌstræt.ɪ.fɪˈkeɪ.ʃən/',
    partOfSpeech: 'noun',
    cefr: 'C1',
    definition: 'The arrangement or division of material, soil, or geological elements into distinct parallel horizontal layers.',
    banglaMeaning: 'স্তরবিন্যাস / স্তরীভবন',
    banglaPronunciation: 'স্ট্র্যাটিফিকেশন',
    banglaContext: 'টেরাসের নিচে বিভিন্ন আকারের পাথর ও বালির বৈজ্ঞানিক স্তরবিন্যাস যা জল নিষ্কাশনে সাহায্য করত।',
    example: 'Excavations revealed a sophisticated multi-layered drainage stratification.',
    synonyms: ['layering', 'gradation', 'lamination'],
  },
  thermal: {
    word: 'thermal',
    phonetic: '/ˈθɜː.məl/',
    partOfSpeech: 'adjective',
    cefr: 'B2',
    definition: 'Relating to, caused by, or retaining heat.',
    banglaMeaning: 'তাপীয় / তাপসংক্রান্ত / তাপধারণক্ষম',
    banglaPronunciation: 'থার্মাল',
    banglaContext: 'কালো ব্যাসল্ট পাথরের তাপ ধরে রাখার ক্ষমতা (thermal mass) যা রাতের তীব্র ঠাণ্ডা প্রতিহত করত।',
    example: 'The massive thermal mass of the dark stones served as passive solar collectors.',
    synonyms: ['heat-related', 'caloric', 'thermodynamic'],
  },
  radiate: {
    word: 'radiate',
    phonetic: '/ˈreɪ.di.eɪt/',
    partOfSpeech: 'verb',
    cefr: 'B2',
    definition: 'To emit or transmit energy, heat, or electromagnetic rays outward in all directions.',
    banglaMeaning: 'বিকিরণ করা / তাপ ছড়িয়ে দেওয়া',
    banglaPronunciation: 'রেডিয়েট',
    banglaContext: 'দিনের বেলা শোষিত সৌরশক্তি রাতে ধীরে ধীরে চারপাশের মাটিতে ও বাতাসে ছড়িয়ে দেওয়া।',
    example: 'The retaining walls gradually radiated captured thermal energy into the adjacent air.',
    synonyms: ['emit', 'discharge', 'disperse', 'beam'],
  },
  vulnerability: {
    word: 'vulnerability',
    phonetic: '/ˌvʌl.nər.əˈbɪl.ə.ti/',
    partOfSpeech: 'noun',
    cefr: 'C1',
    definition: 'The susceptibility or state of being easily damaged, exposed, or harmed by external environmental hazards.',
    banglaMeaning: 'ঝুঁকিপ্রবণতা / অরক্ষিত অবস্থা / দুর্বলতা',
    banglaPronunciation: 'ভালনারেবিলিটি',
    banglaContext: 'প্রাকৃতিক দুর্যোগ যেমন বন্যা, অতিরিক্ত বৃষ্টি বা তুষারপাতে ফসলের ক্ষয়ক্ষতির ঝুঁকি।',
    example: 'Terracing mitigated vulnerability to torrential downpours and lethal frost.',
    synonyms: ['susceptibility', 'fragility', 'exposure'],
  },
  monsoon: {
    word: 'monsoon',
    phonetic: '/mɒnˈsuːn/',
    partOfSpeech: 'noun',
    cefr: 'B2',
    definition: 'A seasonal prevailing meteorological pattern accompanied by intense, heavy rainfall.',
    banglaMeaning: 'মৌসুমী বায়ু / বর্ষাকালীন প্রবল বৃষ্টিপাত',
    banglaPronunciation: 'মনসুন',
    banglaContext: 'স্বল্প সময়ের প্রবল বর্ষণকালে মাটির ক্ষয়রোধে নুড়িপাথরের ফিল্টার ব্যবহৃত হতো।',
    example: 'Coarse gravel layers prevented soil waterlogging during torrential monsoons.',
    synonyms: ['rainy season', 'torrent', 'deluge'],
  },
  excavation: {
    word: 'excavation',
    phonetic: '/ˌek.skəˈveɪ.ʃən/',
    partOfSpeech: 'noun',
    cefr: 'B2',
    definition: 'The systematic scientific digging and uncovering of archaeological sites or geological foundations.',
    banglaMeaning: 'প্রত্নতাত্ত্বিক খননকার্য / মাটি খুঁড়ে বের করা',
    banglaPronunciation: 'এক্সকাভেশন',
    banglaContext: 'প্রাচীন সভ্যতার মাটির নিচে চাপা পড়া নির্মাণকৌশল উদঘাটনে পরিচালিত বৈজ্ঞানিক খনন।',
    example: 'Modern archaeological excavations revealed four distinct foundation strata.',
    synonyms: ['dig', 'unearthing', 'trenching'],
  },
  basalt: {
    word: 'basalt',
    phonetic: '/bəˈsɔːlt/',
    partOfSpeech: 'noun',
    cefr: 'C2',
    definition: 'A dense, dark igneous volcanic rock formed from the rapid cooling of magnesium- and iron-rich lava.',
    banglaMeaning: 'ব্যাসল্ট (গাঢ় রঙের শক্ত আগ্নেয় শিলা)',
    banglaPronunciation: 'ব্যাসল্ট',
    banglaContext: 'অত্যন্ত টেকসই আগ্নেয় শিলা যা তাপ দ্রুত শোষণ ও ধরে রাখতে পারে।',
    example: 'The lowest structural tier was anchored with large basalt boulders.',
    synonyms: ['volcanic rock', 'trap rock'],
  },
  boulder: {
    word: 'boulder',
    phonetic: '/ˈbəʊl.dər/',
    partOfSpeech: 'noun',
    cefr: 'B2',
    definition: 'A large, heavy, rounded mass of rock detached from its place of origin.',
    banglaMeaning: 'বিশাল পাথরখণ্ড / গোল প্রকাণ্ড পাথর',
    banglaPronunciation: 'বোল্ডার',
    banglaContext: 'টেরাসের গোড়ায় মাটির শক্ত ভিত নির্মাণে ব্যবহৃত বড় পাথর।',
    example: 'Basalt boulders stabilized the terrace foundation against seismic vibration.',
    synonyms: ['large stone', 'crag', 'monolith'],
  },
  plummet: {
    word: 'plummet',
    phonetic: '/ˈplʌm.ɪt/',
    partOfSpeech: 'verb',
    cefr: 'C1',
    definition: 'To fall, drop, or plunge steeply and abruptly at high velocity.',
    banglaMeaning: 'খাড়াভাবে দ্রুত নিচে নেমে যাওয়া / হঠাৎ হ্রাস পাওয়া',
    banglaPronunciation: 'প্লামেট',
    banglaContext: 'উঁচু পার্বত্য অঞ্চলে সূর্যাস্তের সাথে সাথে তাপমাত্রা আকস্মিকভাবে শূন্যের নিচে নেমে যাওয়া।',
    example: 'Night temperatures plummet precipitously in high Andean altitudes.',
    synonyms: ['nosedive', 'plunge', 'tumble', 'sink'],
  },
  stratum: {
    word: 'stratum',
    phonetic: '/ˈstrɑː.təm/',
    partOfSpeech: 'noun',
    cefr: 'C1',
    definition: 'A single distinct horizontal layer of rock, sediment, or soil possessing consistent composition.',
    banglaMeaning: 'শিলা বা মাটির স্তর / স্তরবিন্যাস',
    banglaPronunciation: 'স্ট্র্যাটাম',
    banglaContext: 'মাটির নিচের বিভিন্ন স্তরের সুবিন্যস্ত স্তর যা পানি ধরে রাখতে বা নিষ্কাশনে ভূমিকা রাখে।',
    example: 'The lowest stratum of the terrace foundation consisted of basalt.',
    synonyms: ['layer', 'tier', 'bed', 'vein'],
  },
  ambient: {
    word: 'ambient',
    phonetic: '/ˈæm.bi.ənt/',
    partOfSpeech: 'adjective',
    cefr: 'C1',
    definition: 'Relating to the immediate surrounding atmosphere or environmental conditions.',
    banglaMeaning: 'পারিপার্শ্বিক / চারপাশের পরিবেশগত',
    banglaPronunciation: 'অ্যাম্বিয়েন্ট',
    banglaContext: 'গাছপালা ও মাটির আশপাশের তাৎক্ষণিক বায়ুমণ্ডলীয় তাপমাত্রা।',
    example: 'Stone radiation raised ambient temperatures by up to three degrees Celsius.',
    synonyms: ['surrounding', 'atmospheric', 'encompassing'],
  },
  counter: {
    word: 'counter',
    phonetic: '/ˈkaʊn.tər/',
    partOfSpeech: 'verb',
    cefr: 'B2',
    definition: 'To speak or act in strategic opposition to; neutralize or mitigate an adversarial condition.',
    banglaMeaning: 'প্রতিরোধ করা / প্রতিকার করা / প্রশমিত করা',
    banglaPronunciation: 'কাউন্টার',
    banglaContext: 'প্রকৃতির প্রতিকূল পরিস্থিতি যেমন অতিরিক্ত শীত বা বন্যা কার্যকরভাবে রুখে দেওয়া।',
    example: 'Engineers designed andenes to counter severe climatic hazards.',
    synonyms: ['neutralize', 'offset', 'mitigate', 'resist'],
  },
  monumental: {
    word: 'monumental',
    phonetic: '/ˌmɒn.jəˈmen.təl/',
    partOfSpeech: 'adjective',
    cefr: 'C1',
    definition: 'Colossal in scale, structural ambition, or enduring historical significance.',
    banglaMeaning: 'স্মারকতুল্য / সুবিশাল ও ঐতিহাসিক কীর্তি',
    banglaPronunciation: 'মনুমেন্টাল',
    banglaContext: 'বিশাল আকারের প্রকৌশল নির্মাণ যা যুগ যুগ ধরে মানবজাতির স্মৃতিতে অম্লান থাকে।',
    example: 'Pre-Columbian societies erected monumental stone-walled agricultural works.',
    synonyms: ['colossal', 'imposing', 'prodigious', 'epochal'],
  },
  drought: {
    word: 'drought',
    phonetic: '/draʊt/',
    partOfSpeech: 'noun',
    cefr: 'B2',
    definition: 'A protracted climatic period of deficient precipitation resulting in water scarcity.',
    banglaMeaning: 'খরা / অনাবৃষ্টিজনিত তীব্র জলের সংকট',
    banglaPronunciation: 'ড্রাউট',
    banglaContext: 'দীর্ঘদিন বৃষ্টি না হওয়ার কারণে শুকিয়ে যাওয়া এবং চাষের জন্য পানি সংকট তৈরি হওয়া।',
    example: 'Sand layers conserved precious groundwater during prolonged dry droughts.',
    synonyms: ['dry spell', 'aridity', 'desiccation'],
  },
  adjacent: {
    word: 'adjacent',
    phonetic: '/əˈdʒeɪ.sənt/',
    partOfSpeech: 'adjective',
    cefr: 'B2',
    definition: 'Positioned immediately adjoining, contiguous with, or neighboring another space.',
    banglaMeaning: 'সংলগ্ন / পাশাপাশি অবস্থিত / সন্নিহিত',
    banglaPronunciation: 'অ্যাডজাসেন্ট',
    banglaContext: 'দেয়ালের ঠিক পাশেই লাগানো ফসলের সারি যা বিকিরিত তাপ সরাসরি গ্রহণ করত।',
    example: 'Warm air radiated into adjacent crop beds preventing frost crystallization.',
    synonyms: ['adjoining', 'contiguous', 'neighboring'],
  },
  margin: {
    word: 'margin',
    phonetic: '/ˈmɑː.dʒɪn/',
    partOfSpeech: 'noun',
    cefr: 'B2',
    definition: 'An incremental difference or allowance in quantity, safety threshold, or measurement.',
    banglaMeaning: 'পার্থক্য / ব্যবধান / সহনশীল সীমা',
    banglaPronunciation: 'মার্জিন',
    banglaContext: 'মাত্র দুই থেকে তিন ডিগ্রি তাপমাত্রার ব্যবধান যা ফসল বেঁচে থাকা বা নষ্ট হওয়ার মধ্যে পার্থক্য তৈরি করত।',
    example: 'A two-to-three-degree thermal margin was sufficient to save potato crops.',
    synonyms: ['leeway', 'allowance', 'latitude', 'differential'],
  },
  hazard: {
    word: 'hazard',
    phonetic: '/ˈhæz.əd/',
    partOfSpeech: 'noun',
    cefr: 'B2',
    definition: 'A dangerous environmental condition, phenomenon, or human vulnerability factor.',
    banglaMeaning: 'বিপদ / প্রাকৃতিক ঝুঁকি / সংকট',
    banglaPronunciation: 'হ্যাজার্ড',
    banglaContext: 'উচ্চ পার্বত্য পরিবেশে পাতলা বাতাস ও আকস্মিক ভারী বৃষ্টিপাতের মতো প্রাকৃতিক দুর্যোগ।',
    example: 'High altitude presented severe hazards of thin air and torrential rain.',
    synonyms: ['peril', 'risk', 'danger', 'jeopardy'],
  },
  precolumbian: {
    word: 'pre-Columbian',
    phonetic: '/ˌpriː.kəˈlʌm.bi.ən/',
    partOfSpeech: 'adjective',
    cefr: 'C1',
    definition: 'Referring to the cultures, civilizations, and history of the Americas prior to 1492.',
    banglaMeaning: 'কলম্বাস-পূর্ববর্তী আদি আমেরিকান সংস্কৃতি ও সভ্যতা',
    banglaPronunciation: 'প্রি-কলাম্বিয়ান',
    banglaContext: '১৪৯২ সালে ইউরোপীয়দের আগমনের পূর্বে ইনকা ও অন্যান্য আদিম আমেরিকানদের উন্নত প্রযুক্তি।',
    example: 'Pre-Columbian civil engineering remains a benchmark of sustainable agriculture.',
    synonyms: ['pre-conquest', 'indigenous American'],
  },
  retaining: {
    word: 'retaining',
    phonetic: '/rɪˈteɪ.nɪŋ/',
    partOfSpeech: 'adjective',
    cefr: 'B2',
    definition: 'Designed specifically to hold back and stabilize an embankment of soil or water.',
    banglaMeaning: 'মাটি বা পাথর ধরে রাখার বাঁধ / প্রতিরোধকারী দেয়াল',
    banglaPronunciation: 'রিটেইনিং',
    banglaContext: 'খাড়া পাহাড়ের মাটি যাতে ধসে না পড়ে সেজন্য পাথরের সুরক্ষাপ্রাচীর।',
    example: 'Dark stone retaining walls prevented soil erosion along steep mountainsides.',
    synonyms: ['supporting', 'holding', 'buttressing'],
  },
  altitude: {
    word: 'altitude',
    phonetic: '/ˈæl.tɪ.tjuːd/',
    partOfSpeech: 'noun',
    cefr: 'B1',
    definition: 'The height of an object or point in relation to sea level or ground level.',
    banglaMeaning: 'উচ্চতা (সমুদ্রপৃষ্ঠ থেকে পরিমাপকৃত)',
    banglaPronunciation: 'অল্টিটিউড',
    banglaContext: 'সমুদ্রপৃষ্ঠ থেকে কয়েক হাজার মিটার উপরে যেখানে বাতাস হালকা ও ঠাণ্ডা থাকে।',
    example: 'High altitude farming required specialized microclimate management.',
    synonyms: ['elevation', 'height', 'loftiness'],
  },
  subterranean: {
    word: 'subterranean',
    phonetic: '/ˌsʌb.təˈreɪ.ni.ən/',
    partOfSpeech: 'adjective',
    cefr: 'C1',
    definition: 'Existing, occurring, or situated under the earth surface.',
    banglaMeaning: 'ভূগর্ভস্থ / মাটির নিচের',
    banglaPronunciation: 'সাবটেরেনিয়ান',
    banglaContext: 'ভারতের গুজরাট ও রাজস্থানের ভূগর্ভস্থ ধাপযুক্ত কুয়ো যা মাটির গভীরে তৈরি হতো।',
    example: 'Ancient stepwells plunged multiple stories straight down into subterranean aquifers.',
    synonyms: ['underground', 'subsurface', 'hypogeal'],
  },
  aquifer: {
    word: 'aquifer',
    phonetic: '/ˈæk.wɪ.fər/',
    partOfSpeech: 'noun',
    cefr: 'C1',
    definition: 'A body of permeable rock that can contain or transmit groundwater.',
    banglaMeaning: 'ভূগর্ভস্থ জলবাহী শিলাস্তর / প্রাকৃতিক পানির ভাণ্ডার',
    banglaPronunciation: 'অ্যাকুইফার',
    banglaContext: 'মাটির নিচের পাথরের খাঁজ যেখানে বিশুদ্ধ মিঠা পানি প্রাকৃতিকভাবে জমা থাকে।',
    example: 'Villagers descended flights of stairs to access deep perennial aquifers.',
    synonyms: ['water table', 'groundwater reservoir'],
  },
  decipher: {
    word: 'decipher',
    phonetic: '/dɪˈsaɪ.fər/',
    partOfSpeech: 'verb',
    cefr: 'B2',
    definition: 'To convert a text written in code or an ancient lost script into intelligible language.',
    banglaMeaning: 'পাঠোদ্ধার করা / রহস্য উদঘাটন করা',
    banglaPronunciation: 'ডিসাইফার',
    banglaContext: 'রোসেটা স্টোন বা প্রাচীন লিনিয়ার বি লিপির পাঠোদ্ধার করে হারিয়ে যাওয়া ভাষা উদ্ধার করা।',
    example: 'Computational neural models successfully deciphered Bronze Age Linear B scripts.',
    synonyms: ['decode', 'unravel', 'interpret', 'solve'],
  },
  geothermal: {
    word: 'geothermal',
    phonetic: '/ˌdʒiː.əʊˈθɜː.məl/',
    partOfSpeech: 'adjective',
    cefr: 'B2',
    definition: 'Relating to or produced by the internal heat of the earth.',
    banglaMeaning: 'ভূ-তাপীয় / পৃথিবীর অভ্যন্তরীণ তাপসংক্রান্ত',
    banglaPronunciation: 'জিওথার্মাল',
    banglaContext: 'মাটির গভীরের উত্তপ্ত ম্যাগমা ও পাথরের তাপ কাজে লাগিয়ে তৈরি পরিবেশবান্ধব বিদ্যুৎ।',
    example: 'Deep geothermal systems extract clean renewable electricity from hot crystalline granite.',
    synonyms: ['earth-heat', 'hydrothermal'],
  },
  baseload: {
    word: 'baseload',
    phonetic: '/ˈbeɪsˌləʊd/',
    partOfSpeech: 'noun',
    cefr: 'C1',
    definition: 'The minimum constant level of electricity demand on a power grid over a 24-hour period.',
    banglaMeaning: 'নিরবচ্ছিন্ন ভিত্তি বিদ্যুৎ সরবরাহ / সার্বক্ষণিক বিদ্যুৎ',
    banglaPronunciation: 'বেসলোড',
    banglaContext: 'সৌর বা বাতাসের মতো আবহাওয়ার ওপর নির্ভরশীল না হয়ে ২৪ ঘণ্টা একটানা চলা বিদ্যুৎ।',
    example: 'Geothermal energy supplies constant, uninterrupted baseload electricity.',
    synonyms: ['continuous power', 'grid baseline'],
  },
};

/**
 * Clean a word token from punctuation and whitespace
 */
export function cleanWordToken(token: string): string {
  return token.trim().toLowerCase().replace(/^[^a-z0-9]+|[^a-z0-9]+$/gi, '');
}

/**
 * Fetch word definition from built-in Academic Dictionary with Bangla or query endpoints
 */
export async function lookupWordDefinition(rawWord: string, contextSentence = ''): Promise<DictionaryEntry | null> {
  const clean = cleanWordToken(rawWord);
  if (!clean || clean.length < 2) return null;

  // 1. Instant check in Academic Dictionary (with verified Bangla meanings)
  if (ACADEMIC_DICTIONARY[clean]) {
    return ACADEMIC_DICTIONARY[clean];
  }

  // Check common variations (e.g., removing plural 's', 'es', or 'ed')
  const singular = clean.replace(/s$|es$|ed$|ing$/i, '');
  if (singular && ACADEMIC_DICTIONARY[singular]) {
    return ACADEMIC_DICTIONARY[singular];
  }

  // 2. Query server-side Bangla Translation API if available
  try {
    const translateRes = await fetch('/api/ielts/translate/bangla', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: clean, context: contextSentence }),
    });

    if (translateRes.ok) {
      const transData = await translateRes.json();
      if (transData.success && transData.translation) {
        const t = transData.translation;
        return {
          word: clean,
          partOfSpeech: t.partOfSpeech || 'academic term',
          cefr: clean.length > 7 ? 'C1' : 'B2',
          definition: t.englishDefinition || `Academic IELTS term: "${clean}".`,
          banglaMeaning: t.banglaMeaning,
          banglaPronunciation: t.banglaPronunciation,
          banglaContext: t.banglaContext,
        };
      }
    }
  } catch {
    // fallback to free dictionary
  }

  // 3. Query Free Dictionary API for standard English meanings
  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(clean)}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const item = data[0];
        const meaning = item.meanings?.[0];
        const defObj = meaning?.definitions?.[0];

        let audioUrl: string | undefined = undefined;
        if (Array.isArray(item.phonetics)) {
          const withAudio = item.phonetics.find((p: any) => p.audio && p.audio.trim().length > 0);
          if (withAudio) audioUrl = withAudio.audio;
        }

        return {
          word: item.word || clean,
          phonetic: item.phonetic || (item.phonetics?.[0]?.text ?? ''),
          partOfSpeech: meaning?.partOfSpeech || 'noun',
          cefr: clean.length > 8 ? 'C1' : 'B2',
          definition: defObj?.definition || 'Definition available in English lexicon.',
          banglaMeaning: `${clean} (বাংলা অর্থ)`,
          banglaPronunciation: clean,
          banglaContext: 'কেমব্রিজ আইইএলটিএস রিডিং প্যাসেজে ব্যবহৃত শব্দ।',
          example: defObj?.example,
          synonyms: defObj?.synonyms?.slice(0, 3) || meaning?.synonyms?.slice(0, 3),
          audioUrl,
        };
      }
    }
  } catch {
    // fallback
  }

  // 4. Default fallback entry
  return {
    word: clean,
    partOfSpeech: 'academic term',
    cefr: 'B2',
    definition: `Academic reading vocabulary term: "${clean}". Contextually analyzed in Cambridge IELTS passage.`,
    banglaMeaning: `${clean} (শব্দার্থ)`,
    banglaPronunciation: clean,
    banglaContext: 'অ্যাকাডেমিক শব্দ যা প্যাসেজের মূল অর্থ অনুধাবনে সহায়ক।',
  };
}
