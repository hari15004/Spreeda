import { japaneseCourse as japaneseDayOneCourse } from "@/data/day-one";
import type {
  Course,
  LearningItem,
  Lesson,
  LessonQuestion,
  LocalizedText,
} from "@/types/learning";

type TargetCode = "en" | "ja" | "es" | "fr" | "ko" | "de" | "zh";

type PhraseSeed = {
  title: LocalizedText;
  meaning: LocalizedText;
  target: Record<TargetCode, string>;
  reading?: Partial<Record<TargetCode, string>>;
};

const phraseSeeds: readonly PhraseSeed[] = [
  {
    title: { en: "Say hello", hi: "अभिवादन करें" },
    meaning: { en: "Hello", hi: "नमस्ते" },
    target: {
      en: "Hello",
      ja: "こんにちは",
      es: "Hola",
      fr: "Bonjour",
      ko: "안녕하세요",
      de: "Hallo",
      zh: "你好",
    },
    reading: {
      ja: "konnichiwa",
      ko: "annyeonghaseyo",
      zh: "nǐ hǎo",
    },
  },
  {
    title: { en: "Show appreciation", hi: "आभार जताएँ" },
    meaning: { en: "Thank you", hi: "धन्यवाद" },
    target: {
      en: "Thank you",
      ja: "ありがとうございます",
      es: "Gracias",
      fr: "Merci",
      ko: "감사합니다",
      de: "Danke",
      zh: "谢谢",
    },
    reading: {
      ja: "arigatou gozaimasu",
      ko: "gamsahamnida",
      zh: "xièxie",
    },
  },
  {
    title: { en: "Ask politely", hi: "विनम्रता से कहें" },
    meaning: { en: "Please", hi: "कृपया" },
    target: {
      en: "Please",
      ja: "お願いします",
      es: "Por favor",
      fr: "S'il vous plaît",
      ko: "부탁합니다",
      de: "Bitte",
      zh: "请",
    },
    reading: {
      ja: "onegaishimasu",
      ko: "butakhamnida",
      zh: "qǐng",
    },
  },
  {
    title: { en: "Get someone's attention", hi: "किसी का ध्यान खींचें" },
    meaning: { en: "Excuse me", hi: "माफ़ कीजिए" },
    target: {
      en: "Excuse me",
      ja: "すみません",
      es: "Disculpe",
      fr: "Excusez-moi",
      ko: "실례합니다",
      de: "Entschuldigung",
      zh: "不好意思",
    },
    reading: {
      ja: "sumimasen",
      ko: "sillyehamnida",
      zh: "bù hǎoyìsi",
    },
  },
  {
    title: { en: "Meet someone", hi: "किसी से मिलें" },
    meaning: { en: "Nice to meet you", hi: "आपसे मिलकर अच्छा लगा" },
    target: {
      en: "Nice to meet you",
      ja: "はじめまして",
      es: "Mucho gusto",
      fr: "Enchanté",
      ko: "만나서 반가워요",
      de: "Freut mich",
      zh: "很高兴认识你",
    },
    reading: {
      ja: "hajimemashite",
      ko: "mannaseo bangawoyo",
      zh: "hěn gāoxìng rènshi nǐ",
    },
  },
  {
    title: { en: "Introduce yourself", hi: "अपना परिचय दें" },
    meaning: { en: "My name is Anna", hi: "मेरा नाम अन्ना है" },
    target: {
      en: "My name is Anna",
      ja: "私の名前はアンナです",
      es: "Me llamo Ana",
      fr: "Je m'appelle Anna",
      ko: "제 이름은 안나예요",
      de: "Ich heiße Anna",
      zh: "我叫安娜",
    },
    reading: {
      ja: "watashi no namae wa Anna desu",
      ko: "je ireumeun Anna-yeyo",
      zh: "wǒ jiào Ānnà",
    },
  },
  {
    title: { en: "Share where you're from", hi: "बताएँ कि आप कहाँ से हैं" },
    meaning: { en: "I am from India", hi: "मैं भारत से हूँ" },
    target: {
      en: "I am from India",
      ja: "インド出身です",
      es: "Soy de la India",
      fr: "Je viens d'Inde",
      ko: "인도에서 왔어요",
      de: "Ich komme aus Indien",
      zh: "我来自印度",
    },
    reading: {
      ja: "Indo shusshin desu",
      ko: "Indo-eseo wasseoyo",
      zh: "wǒ láizì Yìndù",
    },
  },
  {
    title: { en: "Talk about learning", hi: "सीखने के बारे में बताएँ" },
    meaning: { en: "I am learning this language", hi: "मैं यह भाषा सीख रहा/रही हूँ" },
    target: {
      en: "I am learning this language",
      ja: "この言語を勉強しています",
      es: "Estoy aprendiendo este idioma",
      fr: "J'apprends cette langue",
      ko: "이 언어를 배우고 있어요",
      de: "Ich lerne diese Sprache",
      zh: "我在学习这门语言",
    },
    reading: {
      ja: "kono gengo o benkyou shiteimasu",
      ko: "i eoneoreul baeugo isseoyo",
      zh: "wǒ zài xuéxí zhè mén yǔyán",
    },
  },
  {
    title: { en: "Talk about a friend", hi: "दोस्त के बारे में बात करें" },
    meaning: { en: "Friend", hi: "दोस्त" },
    target: {
      en: "Friend",
      ja: "友達",
      es: "Amigo",
      fr: "Ami",
      ko: "친구",
      de: "Freund",
      zh: "朋友",
    },
    reading: {
      ja: "tomodachi",
      ko: "chingu",
      zh: "péngyou",
    },
  },
  {
    title: { en: "Talk about family", hi: "परिवार के बारे में बात करें" },
    meaning: { en: "Family", hi: "परिवार" },
    target: {
      en: "Family",
      ja: "家族",
      es: "Familia",
      fr: "Famille",
      ko: "가족",
      de: "Familie",
      zh: "家人",
    },
    reading: {
      ja: "kazoku",
      ko: "gajok",
      zh: "jiārén",
    },
  },
  {
    title: { en: "Ask for water", hi: "पानी माँगें" },
    meaning: { en: "Water", hi: "पानी" },
    target: {
      en: "Water",
      ja: "水",
      es: "Agua",
      fr: "Eau",
      ko: "물",
      de: "Wasser",
      zh: "水",
    },
    reading: {
      ja: "mizu",
      ko: "mul",
      zh: "shuǐ",
    },
  },
  {
    title: { en: "Order tea", hi: "चाय मँगाएँ" },
    meaning: { en: "Tea", hi: "चाय" },
    target: {
      en: "Tea",
      ja: "お茶",
      es: "Té",
      fr: "Thé",
      ko: "차",
      de: "Tee",
      zh: "茶",
    },
    reading: {
      ja: "ocha",
      ko: "cha",
      zh: "chá",
    },
  },
  {
    title: { en: "Order coffee", hi: "कॉफ़ी मँगाएँ" },
    meaning: { en: "Coffee", hi: "कॉफ़ी" },
    target: {
      en: "Coffee",
      ja: "コーヒー",
      es: "Café",
      fr: "Café",
      ko: "커피",
      de: "Kaffee",
      zh: "咖啡",
    },
    reading: {
      ja: "koohii",
      ko: "keopi",
      zh: "kāfēi",
    },
  },
  {
    title: { en: "Order a meal", hi: "खाना मँगाएँ" },
    meaning: { en: "Rice", hi: "चावल" },
    target: {
      en: "Rice",
      ja: "ご飯",
      es: "Arroz",
      fr: "Riz",
      ko: "밥",
      de: "Reis",
      zh: "米饭",
    },
    reading: {
      ja: "gohan",
      ko: "bap",
      zh: "mǐfàn",
    },
  },
  {
    title: { en: "Compliment the food", hi: "खाने की तारीफ़ करें" },
    meaning: { en: "This is delicious", hi: "यह बहुत स्वादिष्ट है" },
    target: {
      en: "This is delicious",
      ja: "とてもおいしいです",
      es: "Está delicioso",
      fr: "C'est délicieux",
      ko: "정말 맛있어요",
      de: "Das ist sehr lecker",
      zh: "这个很好吃",
    },
    reading: {
      ja: "totemo oishii desu",
      ko: "jeongmal masisseoyo",
      zh: "zhège hěn hǎochī",
    },
  },
  {
    title: { en: "Share what you like", hi: "अपनी पसंद बताएँ" },
    meaning: { en: "I like coffee", hi: "मुझे कॉफ़ी पसंद है" },
    target: {
      en: "I like coffee",
      ja: "コーヒーが好きです",
      es: "Me gusta el café",
      fr: "J'aime le café",
      ko: "커피를 좋아해요",
      de: "Ich mag Kaffee",
      zh: "我喜欢咖啡",
    },
    reading: {
      ja: "koohii ga suki desu",
      ko: "keopireul joahaeyo",
      zh: "wǒ xǐhuan kāfēi",
    },
  },
  {
    title: { en: "Find the station", hi: "स्टेशन ढूँढें" },
    meaning: { en: "Where is the station?", hi: "स्टेशन कहाँ है?" },
    target: {
      en: "Where is the station?",
      ja: "駅はどこですか",
      es: "¿Dónde está la estación?",
      fr: "Où est la gare ?",
      ko: "역은 어디에 있어요?",
      de: "Wo ist der Bahnhof?",
      zh: "车站在哪里？",
    },
    reading: {
      ja: "eki wa doko desu ka",
      ko: "yeogeun eodie isseoyo",
      zh: "chēzhàn zài nǎlǐ",
    },
  },
  {
    title: { en: "Find the bathroom", hi: "शौचालय ढूँढें" },
    meaning: { en: "Where is the bathroom?", hi: "शौचालय कहाँ है?" },
    target: {
      en: "Where is the bathroom?",
      ja: "トイレはどこですか",
      es: "¿Dónde está el baño?",
      fr: "Où sont les toilettes ?",
      ko: "화장실은 어디에 있어요?",
      de: "Wo ist die Toilette?",
      zh: "洗手间在哪里？",
    },
    reading: {
      ja: "toire wa doko desu ka",
      ko: "hwajangsireun eodie isseoyo",
      zh: "xǐshǒujiān zài nǎlǐ",
    },
  },
  {
    title: { en: "Recognize the station", hi: "स्टेशन पहचानें" },
    meaning: { en: "Station", hi: "स्टेशन" },
    target: {
      en: "Station",
      ja: "駅",
      es: "Estación",
      fr: "Gare",
      ko: "역",
      de: "Bahnhof",
      zh: "车站",
    },
    reading: {
      ja: "eki",
      ko: "yeok",
      zh: "chēzhàn",
    },
  },
  {
    title: { en: "Buy a ticket", hi: "टिकट ख़रीदें" },
    meaning: { en: "One ticket, please", hi: "एक टिकट, कृपया" },
    target: {
      en: "One ticket, please",
      ja: "切符を一枚ください",
      es: "Un billete, por favor",
      fr: "Un billet, s'il vous plaît",
      ko: "표 한 장 주세요",
      de: "Eine Fahrkarte, bitte",
      zh: "请给我一张票",
    },
    reading: {
      ja: "kippu o ichimai kudasai",
      ko: "pyo han jang juseyo",
      zh: "qǐng gěi wǒ yì zhāng piào",
    },
  },
  {
    title: { en: "Turn left", hi: "बाएँ मुड़ें" },
    meaning: { en: "Left", hi: "बायाँ" },
    target: {
      en: "Left",
      ja: "左",
      es: "Izquierda",
      fr: "Gauche",
      ko: "왼쪽",
      de: "Links",
      zh: "左边",
    },
    reading: {
      ja: "hidari",
      ko: "oenjjok",
      zh: "zuǒbiān",
    },
  },
  {
    title: { en: "Turn right", hi: "दाएँ मुड़ें" },
    meaning: { en: "Right", hi: "दायाँ" },
    target: {
      en: "Right",
      ja: "右",
      es: "Derecha",
      fr: "Droite",
      ko: "오른쪽",
      de: "Rechts",
      zh: "右边",
    },
    reading: {
      ja: "migi",
      ko: "oreunjjok",
      zh: "yòubiān",
    },
  },
  {
    title: { en: "Ask the price", hi: "कीमत पूछें" },
    meaning: { en: "How much is this?", hi: "यह कितने का है?" },
    target: {
      en: "How much is this?",
      ja: "これはいくらですか",
      es: "¿Cuánto cuesta esto?",
      fr: "Combien ça coûte ?",
      ko: "이거 얼마예요?",
      de: "Wie viel kostet das?",
      zh: "这个多少钱？",
    },
    reading: {
      ja: "kore wa ikura desu ka",
      ko: "igeo eolmayeyo",
      zh: "zhège duōshǎo qián",
    },
  },
  {
    title: { en: "React to a price", hi: "कीमत पर प्रतिक्रिया दें" },
    meaning: { en: "It is expensive", hi: "यह महँगा है" },
    target: {
      en: "It is expensive",
      ja: "高いです",
      es: "Es caro",
      fr: "C'est cher",
      ko: "비싸요",
      de: "Das ist teuer",
      zh: "太贵了",
    },
    reading: {
      ja: "takai desu",
      ko: "bissayo",
      zh: "tài guì le",
    },
  },
  {
    title: { en: "Ask for help", hi: "मदद माँगें" },
    meaning: { en: "Please help me", hi: "कृपया मेरी मदद करें" },
    target: {
      en: "Please help me",
      ja: "助けてください",
      es: "Ayúdeme, por favor",
      fr: "Aidez-moi, s'il vous plaît",
      ko: "도와주세요",
      de: "Helfen Sie mir, bitte",
      zh: "请帮帮我",
    },
    reading: {
      ja: "tasukete kudasai",
      ko: "dowajuseyo",
      zh: "qǐng bāngbang wǒ",
    },
  },
  {
    title: { en: "Say when you need clarification", hi: "समझ न आने पर बताएँ" },
    meaning: { en: "I don't understand", hi: "मुझे समझ नहीं आया" },
    target: {
      en: "I don't understand",
      ja: "わかりません",
      es: "No entiendo",
      fr: "Je ne comprends pas",
      ko: "이해하지 못해요",
      de: "Ich verstehe nicht",
      zh: "我不明白",
    },
    reading: {
      ja: "wakarimasen",
      ko: "ihaehaji motaeyo",
      zh: "wǒ bù míngbai",
    },
  },
  {
    title: { en: "Ask someone to repeat", hi: "दोहराने के लिए कहें" },
    meaning: { en: "Please repeat that", hi: "कृपया उसे दोहराएँ" },
    target: {
      en: "Please repeat that",
      ja: "もう一度お願いします",
      es: "Repita, por favor",
      fr: "Répétez, s'il vous plaît",
      ko: "다시 말해 주세요",
      de: "Wiederholen Sie das bitte",
      zh: "请再说一遍",
    },
    reading: {
      ja: "mou ichido onegaishimasu",
      ko: "dasi malhae juseyo",
      zh: "qǐng zài shuō yí biàn",
    },
  },
  {
    title: { en: "Ask someone to slow down", hi: "धीरे बोलने के लिए कहें" },
    meaning: { en: "Please speak slowly", hi: "कृपया धीरे बोलें" },
    target: {
      en: "Please speak slowly",
      ja: "ゆっくり話してください",
      es: "Hable despacio, por favor",
      fr: "Parlez lentement, s'il vous plaît",
      ko: "천천히 말해 주세요",
      de: "Sprechen Sie bitte langsam",
      zh: "请说慢一点",
    },
    reading: {
      ja: "yukkuri hanashite kudasai",
      ko: "cheoncheonhi malhae juseyo",
      zh: "qǐng shuō màn yìdiǎn",
    },
  },
  {
    title: { en: "Say goodbye for now", hi: "अभी के लिए विदा लें" },
    meaning: { en: "See you tomorrow", hi: "कल मिलते हैं" },
    target: {
      en: "See you tomorrow",
      ja: "また明日",
      es: "Hasta mañana",
      fr: "À demain",
      ko: "내일 봐요",
      de: "Bis morgen",
      zh: "明天见",
    },
    reading: {
      ja: "mata ashita",
      ko: "naeil bwayo",
      zh: "míngtiān jiàn",
    },
  },
  {
    title: { en: "Greet someone in the morning", hi: "सुबह अभिवादन करें" },
    meaning: { en: "Good morning", hi: "सुप्रभात" },
    target: {
      en: "Good morning",
      ja: "おはようございます",
      es: "Buenos días",
      fr: "Bonjour",
      ko: "좋은 아침이에요",
      de: "Guten Morgen",
      zh: "早上好",
    },
    reading: {
      ja: "ohayou gozaimasu",
      ko: "joeun achim-ieyo",
      zh: "zǎoshang hǎo",
    },
  },
  {
    title: { en: "Greet someone in the evening", hi: "शाम को अभिवादन करें" },
    meaning: { en: "Good evening", hi: "शुभ संध्या" },
    target: {
      en: "Good evening",
      ja: "こんばんは",
      es: "Buenas tardes",
      fr: "Bonsoir",
      ko: "좋은 저녁이에요",
      de: "Guten Abend",
      zh: "晚上好",
    },
    reading: {
      ja: "konbanwa",
      ko: "joeun jeonyeog-ieyo",
      zh: "wǎnshang hǎo",
    },
  },
  {
    title: { en: "Encourage yourself", hi: "खुद को प्रोत्साहित करें" },
    meaning: { en: "I can do this", hi: "मैं यह कर सकता/सकती हूँ" },
    target: {
      en: "I can do this",
      ja: "私ならできます",
      es: "Puedo hacerlo",
      fr: "Je peux le faire",
      ko: "저는 할 수 있어요",
      de: "Ich schaffe das",
      zh: "我可以做到",
    },
    reading: {
      ja: "watashi nara dekimasu",
      ko: "jeoneun hal su isseoyo",
      zh: "wǒ kěyǐ zuòdào",
    },
  },
];

const courseTitles: Record<TargetCode, LocalizedText> = {
  en: { en: "English", hi: "अंग्रेज़ी" },
  ja: { en: "Japanese", hi: "जापानी" },
  es: { en: "Spanish", hi: "स्पैनिश" },
  fr: { en: "French", hi: "फ़्रेंच" },
  ko: { en: "Korean", hi: "कोरियाई" },
  de: { en: "German", hi: "जर्मन" },
  zh: { en: "Mandarin Chinese", hi: "चीनी (मंदारिन)" },
};

function itemFor(
  code: TargetCode,
  seed: PhraseSeed,
  sequence: number,
  isReview = false,
): LearningItem {
  const reading = seed.reading?.[code] ?? seed.target[code];
  const meaning =
    code === "en"
      ? {
          en: `Hindi: ${seed.meaning.hi ?? seed.meaning.en}`,
          hi: seed.meaning.hi ?? seed.meaning.en,
        }
      : seed.meaning;
  return {
    id: `${code}-phrase-${String(sequence).padStart(2, "0")}`,
    kind: "phrase",
    targetText: seed.target[code],
    reading,
    pronunciationCue: { en: reading, hi: reading },
    audioText: seed.target[code],
    meaning,
    isReview,
  };
}

function createQuestions(
  language: TargetCode,
  items: readonly LearningItem[],
  lessonId: string,
): readonly LessonQuestion[] {
  return items.map((item, index) => {
    const meaning = item.meaning ?? { en: item.reading, hi: item.reading };
    const prompt = {
      en: `Choose the ${courseTitles[language].en} phrase for “${meaning.en}”.`,
      hi: `“${meaning.hi}” के लिए सही ${courseTitles[language].hi} वाक्यांश चुनें।`,
    };
    return {
      id: `${lessonId}-question-${index + 1}`,
      itemId: item.id,
      reading: item.reading,
      prompt,
      correctAnswer: item.targetText,
      options: items.map((option) => option.targetText),
    };
  });
}

function selectReviewSeeds(
  previousLessons: readonly (readonly PhraseSeed[])[],
): PhraseSeed[] {
  const selected: PhraseSeed[] = [];
  for (const offset of [1, 3, 7, 14]) {
    const source = previousLessons[previousLessons.length - offset];
    if (source) {
      for (const phrase of source) {
        if (!selected.includes(phrase)) selected.push(phrase);
      }
    }
    if (selected.length >= 4) return selected.slice(0, 4);
  }
  for (const source of [...previousLessons].reverse()) {
    for (const phrase of source) {
      if (!selected.includes(phrase)) selected.push(phrase);
      if (selected.length >= 4) return selected;
    }
  }
  return selected;
}

function createPhraseLesson(
  code: TargetCode,
  sequence: number,
  newSeeds: readonly PhraseSeed[],
  previousLessons: readonly (readonly PhraseSeed[])[],
): Lesson {
  const courseId = code === "ja" ? "japanese" : code;
  const lessonId = `${code}-day-${String(sequence).padStart(2, "0")}`;
  const newItems = newSeeds.map((seed) =>
    itemFor(code, seed, phraseSeeds.indexOf(seed) + 1),
  );
  const reviewItems = selectReviewSeeds(previousLessons)
    .slice(0, Math.max(0, 5 - newItems.length))
    .map((seed) =>
    itemFor(code, seed, phraseSeeds.indexOf(seed) + 1, true),
    );
  const items = [...newItems, ...reviewItems];
  const isGreetingLesson = newSeeds.length > 1;
  const title = isGreetingLesson
    ? { en: "Your first greetings", hi: "आपके पहले अभिवादन" }
    : newSeeds[0].title;
  const description = {
    en: isGreetingLesson
      ? "Listen to each phrase, say it aloud, then bring it back from memory."
      : `Listen, say it aloud, and learn how to ${newSeeds[0].title.en.toLowerCase()}.`,
    hi: isGreetingLesson
      ? "हर वाक्यांश सुनें, ज़ोर से बोलें और फिर याद से दोहराएँ।"
      : `सुनें, ज़ोर से बोलें और सीखें कि ${newSeeds[0].title.hi}।`,
  };
  const mission = {
    en: isGreetingLesson
      ? "Make a three-line greeting exchange out loud."
      : `Use “${newSeeds[0].target[code]}” in a short real-life exchange.`,
    hi: isGreetingLesson
      ? "तीन पंक्तियों का अभिवादन ज़ोर से बोलकर अभ्यास करें।"
      : `“${newSeeds[0].meaning.hi}” को एक छोटी बातचीत में बोलें।`,
  };

  return {
    id: lessonId,
    courseId,
    sequence,
    title,
    description,
    mission,
    estimatedMinutes: Math.max(5, items.length * 2),
    items,
    questions: createQuestions(code, items, lessonId),
  };
}

function createCourse(code: TargetCode): Course {
  const courseId = code === "ja" ? "japanese" : code;
  const lessons: Lesson[] = [];
  const japaneseStartLesson =
    code === "ja" ? japaneseDayOneCourse.lessons[0] : null;
  if (japaneseStartLesson) lessons.push(japaneseStartLesson);

  const phraseLessonSeeds: (readonly PhraseSeed[])[] = [];
  const greetingSeeds = phraseSeeds.slice(0, 3);
  const firstPhraseDay = japaneseStartLesson ? 2 : 1;
  phraseLessonSeeds.push(greetingSeeds);
  lessons.push(
    createPhraseLesson(code, firstPhraseDay, greetingSeeds, []),
  );

  let sequence = firstPhraseDay + 1;
  const remainingSeeds = phraseSeeds.slice(3);
  const finalSeeds =
    code === "ja" ? remainingSeeds.splice(-2) : [];
  for (const seed of remainingSeeds) {
    const newSeeds = [seed];
    lessons.push(
      createPhraseLesson(code, sequence, newSeeds, phraseLessonSeeds),
    );
    phraseLessonSeeds.push(newSeeds);
    sequence += 1;
  }
  if (finalSeeds.length > 0) {
    lessons.push(
      createPhraseLesson(code, sequence, finalSeeds, phraseLessonSeeds),
    );
    phraseLessonSeeds.push(finalSeeds);
  }
  if (lessons.length !== 30) {
    throw new Error(`The ${courseTitles[code].en} course must contain 30 lessons.`);
  }

  return {
    id: courseId,
    targetLanguageCode: code,
    supportedUiLanguages: ["en", "hi"],
    title: courseTitles[code],
    contentVersion: "1.0.0",
    lessons,
  };
}

function validateCourse(course: Course): Course {
  const lessonIds = new Set<string>();
  for (const lesson of course.lessons) {
    if (
      lessonIds.has(lesson.id) ||
      lesson.items.length < 3 ||
      lesson.items.length > 5 ||
      lesson.questions.length !== lesson.items.length
    ) {
      throw new Error(`The ${course.title.en} course has incomplete lesson data.`);
    }
    lessonIds.add(lesson.id);
    const itemIds = new Set(lesson.items.map((item) => item.id));
    for (const question of lesson.questions) {
      if (
        !itemIds.has(question.itemId) ||
        !question.options.includes(question.correctAnswer) ||
        question.options.length < 3
      ) {
        throw new Error(`The ${lesson.id} lesson has an invalid recall question.`);
      }
    }
  }
  return course;
}

export const courses: readonly Course[] = (
  ["ja", "en", "es", "fr", "ko", "de", "zh"] as const
).map(createCourse).map(validateCourse);

export const coursesById: Readonly<Record<string, Course>> = Object.fromEntries(
  courses.map((course) => [course.id, course]),
);
