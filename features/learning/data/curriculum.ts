import type {
  DialogueLine,
  LessonActivityKind,
  LessonCurriculum,
  LearningSkill,
  LocalizedText,
} from "@/features/learning/types/learning";

export type CoreLanguageCode = "ja" | "en" | "fr" | "de" | "it";

type ReplyKind =
  | "greeting"
  | "gratitude"
  | "service"
  | "question"
  | "route"
  | "price"
  | "time"
  | "introduction"
  | "repair"
  | "reaction"
  | "opinion"
  | "encouragement"
  | "farewell"
  | "general";

type Reply = {
  target: string;
  meaning: LocalizedText;
};

const grammarUnits: Record<CoreLanguageCode, readonly LocalizedText[]> = {
  ja: [
    { en: "Use は to mark the topic and です to make a polite statement.", hi: "विषय बताने के लिए は और विनम्र कथन के लिए です का प्रयोग करें।" },
    { en: "Japanese often omits words understood from context; を marks a direct object.", hi: "संदर्भ से स्पष्ट शब्द जापानी में अक्सर छोड़ दिए जाते हैं; を कर्म को चिह्नित करता है।" },
    { en: "Put time and place before the verb; に marks a destination or a specific time.", hi: "समय और स्थान क्रिया से पहले रखें; に गंतव्य या निश्चित समय बताता है।" },
    { en: "Use あります for things and います for people or animals; location comes before the verb.", hi: "वस्तुओं के लिए あります और लोगों/जानवरों के लिए います; स्थान क्रिया से पहले आता है।" },
    { en: "い-adjectives change directly; な-adjectives use な before a noun and です at sentence end.", hi: "い-विशेषण सीधे बदलते हैं; な-विशेषण संज्ञा से पहले な और वाक्य के अंत में です लेते हैं।" },
    { en: "Ask yes/no questions with か; use も to mean 'also' and の to connect nouns.", hi: "हाँ/नहीं वाले प्रश्न में か; 'भी' के लिए も और संज्ञाएँ जोड़ने के लिए の प्रयोग करें।" },
    { en: "Use たいです for wants and てください for a polite request.", hi: "इच्छा बताने के लिए たいです और विनम्र अनुरोध के लिए てください प्रयोग करें।" },
    { en: "Use ません for polite negatives; combine familiar patterns to make a short exchange.", hi: "विनम्र नकार के लिए ません प्रयोग करें और सीखे हुए ढाँचों से छोटी बातचीत बनाएँ।" },
  ],
  en: [
    { en: "Build a basic statement with subject + verb + object; use be for identity and description.", hi: "साधारण वाक्य में कर्ता + क्रिया + कर्म रखें; पहचान और वर्णन के लिए be प्रयोग करें।" },
    { en: "Use a/an with one countable item and plural -s for more than one.", hi: "एक गिनने योग्य वस्तु के साथ a/an और एक से अधिक के लिए बहुवचन -s प्रयोग करें।" },
    { en: "Use do/does to ask present-simple questions; the main verb stays in its base form.", hi: "वर्तमान सरल प्रश्नों में do/does लगाएँ; मुख्य क्रिया मूल रूप में रहती है।" },
    { en: "Add -s to a he/she/it present-simple verb; use don't/doesn't for negatives.", hi: "he/she/it के साथ वर्तमान सरल क्रिया में -s जोड़ें; नकार के लिए don't/doesn't लगाएँ।" },
    { en: "Use there is/are for existence and some/any for an unspecified amount.", hi: "किसी चीज़ के होने के लिए there is/are और अनिश्चित मात्रा के लिए some/any प्रयोग करें।" },
    { en: "Use can + base verb for ability or a simple request; put the time expression naturally.", hi: "योग्यता या सरल अनुरोध के लिए can + मूल क्रिया रखें; समय-सूचक शब्द स्वाभाविक जगह पर रखें।" },
    { en: "Use was/were for simple past states; keep regular past verbs in -ed.", hi: "भूतकाल की स्थिति के लिए was/were और नियमित भूतकाल क्रियाओं में -ed लगाएँ।" },
    { en: "Connect short ideas with and/but, then check word order and question forms.", hi: "छोटे विचारों को and/but से जोड़ें और शब्द-क्रम व प्रश्न-रूप जाँचें।" },
  ],
  fr: [
    { en: "Nouns have grammatical gender; learn each noun with un/une or le/la.", hi: "फ़्रेंच संज्ञाओं का व्याकरणिक लिंग होता है; हर संज्ञा को un/une या le/la के साथ सीखें।" },
    { en: "Use être for identity and description, and avoir for possession and age.", hi: "पहचान/वर्णन के लिए être और स्वामित्व/उम्र के लिए avoir प्रयोग करें।" },
    { en: "Make a simple negative with ne ... pas around the conjugated verb.", hi: "बदली हुई क्रिया के दोनों ओर ne ... pas रखकर सरल नकार बनाएँ।" },
    { en: "Match present-tense endings to the subject; common -er verbs use a regular pattern.", hi: "वर्तमान काल के अंत कर्ता के अनुसार बदलें; सामान्य -er क्रियाओं का नियमित ढाँचा है।" },
    { en: "Use à and de with articles carefully; au, aux, du, and des are contractions.", hi: "à और de के साथ articles ध्यान से लगाएँ; au, aux, du और des संक्षिप्त रूप हैं।" },
    { en: "Use un/une for one countable item, du/de la for an amount, and beaucoup de for 'a lot of'.", hi: "गिनने योग्य एक वस्तु के लिए un/une, मात्रा के लिए du/de la और 'बहुत' के लिए beaucoup de प्रयोग करें।" },
    { en: "Use est-ce que or rising intonation for a clear everyday question.", hi: "रोज़मर्रा का स्पष्ट प्रश्न बनाने के लिए est-ce que या उठता हुआ स्वर प्रयोग करें।" },
    { en: "Use aller + infinitive for a near-future plan and reuse polite phrases in a dialogue.", hi: "निकट भविष्य की योजना के लिए aller + infinitif और संवाद में विनम्र वाक्यांश प्रयोग करें।" },
  ],
  de: [
    { en: "The subject is usually nominative; learn sein forms with the subject pronoun.", hi: "कर्ता सामान्यतः nominative में होता है; sein के रूप कर्ता सर्वनाम के साथ सीखें।" },
    { en: "In a statement, the conjugated verb is usually in position two, even when time comes first.", hi: "कथन में बदली हुई क्रिया सामान्यतः दूसरे स्थान पर आती है, भले समय पहले हो।" },
    { en: "Articles change with case and gender; use accusative for the direct object.", hi: "कारक और लिंग के अनुसार articles बदलते हैं; सीधे कर्म के लिए accusative प्रयोग करें।" },
    { en: "Use haben or sein as the main verb; separable verbs place their prefix at the sentence end.", hi: "मुख्य क्रिया के रूप में haben या sein लें; अलग होने वाली क्रियाओं का उपसर्ग वाक्य के अंत में आता है।" },
    { en: "Use dative after common location prepositions such as mit and bei.", hi: "mit और bei जैसे सामान्य स्थान-सूचक संबंधों के बाद dative प्रयोग करें।" },
    { en: "A modal verb takes the second position; its partner verb goes to the end as an infinitive.", hi: "modal verb दूसरे स्थान पर आता है; उससे जुड़ी क्रिया infinitive रूप में अंत में जाती है।" },
    { en: "Use nicht to negate an action and kein with a noun; choose the position from what is negated.", hi: "क्रिया के नकार के लिए nicht और संज्ञा के साथ kein प्रयोग करें; नकार के अनुसार स्थान चुनें।" },
    { en: "Form a yes/no question by placing the verb first; keep the case of each noun clear.", hi: "हाँ/नहीं प्रश्न में क्रिया पहले रखें और हर संज्ञा का कारक स्पष्ट रखें।" },
  ],
  it: [
    { en: "Use essere for identity and origin; its present-tense form changes with the subject.", hi: "पहचान और मूल स्थान के लिए essere प्रयोग करें; वर्तमान रूप कर्ता के साथ बदलता है।" },
    { en: "Nouns have gender and number; articles such as il, la, i, and le agree with them.", hi: "संज्ञाओं का लिंग और वचन होता है; il, la, i और le जैसे articles उनसे मेल खाते हैं।" },
    { en: "Present-tense -are verbs use endings such as -o, -i, and -a for singular subjects.", hi: "वर्तमान काल की -are क्रियाएँ एकवचन कर्ताओं के साथ -o, -i और -a जैसे अंत लेती हैं।" },
    { en: "Use avere for possession and age; form questions mainly with intonation and word order.", hi: "स्वामित्व और उम्र के लिए avere; प्रश्नों में मुख्यतः स्वर और शब्द-क्रम प्रयोग करें।" },
    { en: "Use common prepositions in context; a + il becomes al and di + il becomes del.", hi: "सामान्य prepositions संदर्भ में सीखें; a + il = al और di + il = del होता है।" },
    { en: "Put non before the conjugated verb; use potere or volere with an infinitive.", hi: "बदली हुई क्रिया से पहले non रखें; potere या volere के साथ infinitive प्रयोग करें।" },
    { en: "Use passato prossimo for a completed event: avere/essere plus a past participle.", hi: "पूरी हुई घटना के लिए passato prossimo: avere/essere के साथ past participle प्रयोग करें।" },
    { en: "Connect short clauses with e/ma, and review subject agreement and useful question phrases.", hi: "छोटे उपवाक्यों को e/ma से जोड़ें और कर्ता-सामंजस्य व उपयोगी प्रश्न-वाक्यांश दोहराएँ।" },
  ],
};

const pronunciationNotes: Record<CoreLanguageCode, LocalizedText> = {
  ja: {
    en: "Keep morae evenly timed; avoid adding English-style stress to each syllable.",
    hi: "हर मात्रा का समय समान रखें; हर syllable पर अंग्रेज़ी जैसा ज़ोर न डालें।",
  },
  en: {
    en: "Stress the key content word; small function words are often reduced in natural speech.",
    hi: "मुख्य अर्थ वाले शब्द पर ज़ोर दें; स्वाभाविक बोलचाल में छोटे सहायक शब्द अक्सर हल्के होते हैं।",
  },
  fr: {
    en: "Notice nasal vowels and liaison; many word-final consonants are silent.",
    hi: "नासिक्य स्वरों और liaison पर ध्यान दें; कई शब्दों के अंतिम व्यंजन मौन होते हैं।",
  },
  de: {
    en: "Keep long and short vowels distinct, and pronounce written consonants clearly.",
    hi: "लंबे और छोटे स्वरों में अंतर रखें और लिखे हुए व्यंजनों का स्पष्ट उच्चारण करें।",
  },
  it: {
    en: "Hold double consonants longer; their length can change a word's meaning.",
    hi: "दोहरे व्यंजनों को थोड़ा लंबा बोलें; उनकी लंबाई शब्द का अर्थ बदल सकती है।",
  },
};

const replies: Record<CoreLanguageCode, Record<ReplyKind, Reply>> = {
  ja: {
    greeting: { target: "こんにちは！", meaning: { en: "Hello!", hi: "नमस्ते!" } },
    gratitude: { target: "どういたしまして。", meaning: { en: "You're welcome.", hi: "आपका स्वागत है।" } },
    service: { target: "かしこまりました。", meaning: { en: "Certainly.", hi: "ज़रूर।" } },
    question: { target: "あちらです。", meaning: { en: "It's over there.", hi: "वह वहाँ है।" } },
    route: { target: "はい、ありがとうございます。", meaning: { en: "Okay, thank you.", hi: "ठीक है, धन्यवाद।" } },
    price: { target: "千円です。", meaning: { en: "It costs 1,000 yen.", hi: "इसकी कीमत 1,000 येन है।" } },
    time: { target: "3時です。", meaning: { en: "It's three o'clock.", hi: "तीन बजे हैं।" } },
    introduction: { target: "こちらこそ、よろしくお願いします。", meaning: { en: "Nice to meet you too.", hi: "आपसे मिलकर मुझे भी अच्छा लगा।" } },
    repair: { target: "はい、ゆっくり話します。", meaning: { en: "Yes, I'll speak slowly.", hi: "जी, मैं धीरे बोलूँगा/बोलूँगी।" } },
    reaction: { target: "そう言ってくれてうれしいです。", meaning: { en: "I'm glad you think so.", hi: "आपको ऐसा लगा, यह जानकर खुशी हुई।" } },
    opinion: { target: "私もです。", meaning: { en: "Me too.", hi: "मुझे भी।" } },
    encouragement: { target: "きっとできますよ。", meaning: { en: "You can do it.", hi: "आप ज़रूर कर सकते हैं।" } },
    farewell: { target: "また明日！", meaning: { en: "See you tomorrow!", hi: "कल मिलते हैं!" } },
    general: { target: "そうですか。", meaning: { en: "I see.", hi: "अच्छा, समझा।" } },
  },
  en: {
    greeting: { target: "Hello!", meaning: { en: "Hello!", hi: "नमस्ते!" } },
    gratitude: { target: "You're welcome.", meaning: { en: "You're welcome.", hi: "आपका स्वागत है।" } },
    service: { target: "Of course. Here you go.", meaning: { en: "Of course. Here you go.", hi: "ज़रूर, लीजिए।" } },
    question: { target: "It's over there.", meaning: { en: "It's over there.", hi: "वह वहाँ है।" } },
    route: { target: "Okay, thanks.", meaning: { en: "Okay, thanks.", hi: "ठीक है, धन्यवाद।" } },
    price: { target: "It costs ten euros.", meaning: { en: "It costs ten euros.", hi: "इसकी कीमत दस यूरो है।" } },
    time: { target: "It's three o'clock.", meaning: { en: "It's three o'clock.", hi: "तीन बजे हैं।" } },
    introduction: { target: "Nice to meet you too.", meaning: { en: "Nice to meet you too.", hi: "आपसे मिलकर मुझे भी अच्छा लगा।" } },
    repair: { target: "Sure, I'll say it again slowly.", meaning: { en: "Sure, I'll say it again slowly.", hi: "ज़रूर, मैं इसे फिर से धीरे कहूँगा/कहूँगी।" } },
    reaction: { target: "I'm glad you like it.", meaning: { en: "I'm glad you like it.", hi: "मुझे खुशी है कि आपको यह पसंद आया।" } },
    opinion: { target: "Me too!", meaning: { en: "Me too!", hi: "मुझे भी!" } },
    encouragement: { target: "You can do it!", meaning: { en: "You can do it!", hi: "आप यह कर सकते हैं!" } },
    farewell: { target: "See you tomorrow!", meaning: { en: "See you tomorrow!", hi: "कल मिलते हैं!" } },
    general: { target: "I see.", meaning: { en: "I see.", hi: "अच्छा, समझा।" } },
  },
  fr: {
    greeting: { target: "Bonjour !", meaning: { en: "Hello!", hi: "नमस्ते!" } },
    gratitude: { target: "Je vous en prie.", meaning: { en: "You're welcome.", hi: "आपका स्वागत है।" } },
    service: { target: "Bien sûr, voilà.", meaning: { en: "Of course, here you go.", hi: "ज़रूर, लीजिए।" } },
    question: { target: "C'est par là.", meaning: { en: "It's that way.", hi: "वह उस तरफ़ है।" } },
    route: { target: "D'accord, merci.", meaning: { en: "Okay, thanks.", hi: "ठीक है, धन्यवाद।" } },
    price: { target: "Ça coûte dix euros.", meaning: { en: "It costs ten euros.", hi: "इसकी कीमत दस यूरो है।" } },
    time: { target: "Il est trois heures.", meaning: { en: "It's three o'clock.", hi: "तीन बजे हैं।" } },
    introduction: { target: "Enchanté(e), moi aussi.", meaning: { en: "Nice to meet you too.", hi: "आपसे मिलकर मुझे भी अच्छा लगा।" } },
    repair: { target: "Bien sûr, je vais répéter lentement.", meaning: { en: "Of course, I'll repeat slowly.", hi: "ज़रूर, मैं धीरे-धीरे दोहराऊँगा/दोहराऊँगी।" } },
    reaction: { target: "Je suis content(e) que ça vous plaise.", meaning: { en: "I'm glad you like it.", hi: "मुझे खुशी है कि आपको यह पसंद आया।" } },
    opinion: { target: "Moi aussi !", meaning: { en: "Me too!", hi: "मुझे भी!" } },
    encouragement: { target: "Tu peux le faire !", meaning: { en: "You can do it!", hi: "आप यह कर सकते हैं!" } },
    farewell: { target: "À demain !", meaning: { en: "See you tomorrow!", hi: "कल मिलते हैं!" } },
    general: { target: "Je vois.", meaning: { en: "I see.", hi: "अच्छा, समझा।" } },
  },
  de: {
    greeting: { target: "Hallo!", meaning: { en: "Hello!", hi: "नमस्ते!" } },
    gratitude: { target: "Gern geschehen.", meaning: { en: "You're welcome.", hi: "आपका स्वागत है।" } },
    service: { target: "Natürlich, bitte schön.", meaning: { en: "Of course, here you go.", hi: "ज़रूर, लीजिए।" } },
    question: { target: "Dort drüben.", meaning: { en: "Over there.", hi: "वहाँ उस तरफ़।" } },
    route: { target: "Okay, danke.", meaning: { en: "Okay, thanks.", hi: "ठीक है, धन्यवाद।" } },
    price: { target: "Das kostet zehn Euro.", meaning: { en: "It costs ten euros.", hi: "इसकी कीमत दस यूरो है।" } },
    time: { target: "Es ist drei Uhr.", meaning: { en: "It's three o'clock.", hi: "तीन बजे हैं।" } },
    introduction: { target: "Freut mich auch.", meaning: { en: "Nice to meet you too.", hi: "आपसे मिलकर मुझे भी अच्छा लगा।" } },
    repair: { target: "Gern, ich wiederhole es langsam.", meaning: { en: "Sure, I'll repeat it slowly.", hi: "ज़रूर, मैं इसे धीरे से दोहराऊँगा/दोहराऊँगी।" } },
    reaction: { target: "Schön, dass es dir gefällt.", meaning: { en: "I'm glad you like it.", hi: "मुझे खुशी है कि आपको यह पसंद आया।" } },
    opinion: { target: "Ich auch!", meaning: { en: "Me too!", hi: "मुझे भी!" } },
    encouragement: { target: "Du schaffst das!", meaning: { en: "You can do it!", hi: "आप यह कर सकते हैं!" } },
    farewell: { target: "Bis morgen!", meaning: { en: "See you tomorrow!", hi: "कल मिलते हैं!" } },
    general: { target: "Verstehe.", meaning: { en: "I see.", hi: "अच्छा, समझा।" } },
  },
  it: {
    greeting: { target: "Ciao!", meaning: { en: "Hello!", hi: "नमस्ते!" } },
    gratitude: { target: "Prego.", meaning: { en: "You're welcome.", hi: "आपका स्वागत है।" } },
    service: { target: "Certo, ecco a te.", meaning: { en: "Of course, here you go.", hi: "ज़रूर, लीजिए।" } },
    question: { target: "È laggiù.", meaning: { en: "It's over there.", hi: "वह वहाँ है।" } },
    route: { target: "Va bene, grazie.", meaning: { en: "Okay, thanks.", hi: "ठीक है, धन्यवाद।" } },
    price: { target: "Costa dieci euro.", meaning: { en: "It costs ten euros.", hi: "इसकी कीमत दस यूरो है।" } },
    time: { target: "Sono le tre.", meaning: { en: "It's three o'clock.", hi: "तीन बजे हैं।" } },
    introduction: { target: "Piacere, anche per me.", meaning: { en: "Nice to meet you too.", hi: "आपसे मिलकर मुझे भी अच्छा लगा।" } },
    repair: { target: "Certo, ripeto più lentamente.", meaning: { en: "Of course, I'll repeat more slowly.", hi: "ज़रूर, मैं और धीरे दोहराऊँगा/दोहराऊँगी।" } },
    reaction: { target: "Mi fa piacere che ti piaccia.", meaning: { en: "I'm glad you like it.", hi: "मुझे खुशी है कि आपको यह पसंद आया।" } },
    opinion: { target: "Anch'io!", meaning: { en: "Me too!", hi: "मुझे भी!" } },
    encouragement: { target: "Ce la puoi fare!", meaning: { en: "You can do it!", hi: "आप यह कर सकते हैं!" } },
    farewell: { target: "A domani!", meaning: { en: "See you tomorrow!", hi: "कल मिलते हैं!" } },
    general: { target: "Capisco.", meaning: { en: "I see.", hi: "अच्छा, समझा।" } },
  },
};

const activityPlan: readonly {
  kind: LessonActivityKind;
  instruction: LocalizedText;
  skills: readonly LearningSkill[];
}[] = [
  { kind: "listen", instruction: { en: "Listen once without reading, then choose the phrase you heard.", hi: "बिना पढ़े एक बार सुनें, फिर सुना हुआ वाक्यांश चुनें।" }, skills: ["listening", "vocabulary"] },
  { kind: "sentence-build", instruction: { en: "Put the phrase pieces in natural order and say the completed sentence.", hi: "वाक्यांश के हिस्सों को सही क्रम में रखें और पूरा वाक्य बोलें।" }, skills: ["writing", "grammar"] },
  { kind: "role-play", instruction: { en: "Take both roles in the dialogue; answer before revealing the reply.", hi: "संवाद के दोनों पात्र निभाएँ; जवाब देखने से पहले स्वयं उत्तर दें।" }, skills: ["speaking", "listening"] },
  { kind: "type", instruction: { en: "Recall the target phrase and type it from memory.", hi: "लक्ष्य भाषा का वाक्यांश याद से लिखें।" }, skills: ["writing", "vocabulary"] },
  { kind: "recall", instruction: { en: "Cover the meaning, retrieve the phrase, then check your answer.", hi: "अर्थ छिपाकर वाक्यांश याद करें, फिर अपना उत्तर जाँचें।" }, skills: ["reading", "vocabulary"] },
  { kind: "speak", instruction: { en: "Say the phrase aloud, then use it in your own short response.", hi: "वाक्यांश ज़ोर से बोलें, फिर अपने छोटे उत्तर में उसका प्रयोग करें।" }, skills: ["speaking", "listening"] },
];

function replyKind(title: string): ReplyKind {
  const normalized = title.toLowerCase();
  if (/(hello|greet)/.test(normalized)) return "greeting";
  if (/(goodbye|farewell|see you)/.test(normalized)) return "farewell";
  if (/(repeat|slow down|understand|clarification)/.test(normalized)) return "repair";
  if (/(appreciation|thank)/.test(normalized)) return "gratitude";
  if (/(ask the price|how much)/.test(normalized)) return "price";
  if (/(time)/.test(normalized)) return "time";
  if (/(order|buy|ask for|ask politely|help|table|bill|reservation|allergy|doctor|emergency)/.test(normalized)) return "service";
  if (/(turn left|turn right)/.test(normalized)) return "route";
  if (/(find|where)/.test(normalized)) return "question";
  if (/(meet|introduc|share where)/.test(normalized)) return "introduction";
  if (/(encourage)/.test(normalized)) return "encouragement";
  if (/(share what you like)/.test(normalized)) return "opinion";
  if (/(compliment)/.test(normalized)) return "reaction";
  return "general";
}

export function createLessonCurriculum(
  language: CoreLanguageCode,
  sequence: number,
  title: LocalizedText,
  targetText: string,
  meaning: LocalizedText,
): LessonCurriculum {
  const grammarIndex = Math.min(7, Math.floor((sequence - 1) / 5));
  const plannedActivity = activityPlan[(sequence - 1) % activityPlan.length];
  const activity =
    language === "ja" && plannedActivity.kind === "sentence-build"
      ? activityPlan[4]
      : plannedActivity;
  const reply = replies[language][replyKind(title.en)];
  const dialogue: DialogueLine[] = [
    { speaker: "A", targetText, meaning },
    { speaker: "B", targetText: reply.target, meaning: reply.meaning },
  ];
  const greetingLesson = title.en === "Your first greetings";

  return {
    objective: {
      en: greetingLesson
        ? "Greet someone and respond naturally in a short first conversation."
        : `Use a new phrase to ${title.en.toLowerCase()} in a short real-life exchange.`,
      hi: greetingLesson
        ? "छोटी पहली बातचीत में किसी का अभिवादन करें और स्वाभाविक उत्तर दें।"
        : `वास्तविक छोटी बातचीत में ${title.hi?.toLowerCase() ?? title.en.toLowerCase()} के लिए नया वाक्यांश प्रयोग करें।`,
    },
    grammar: grammarUnits[language][grammarIndex],
    pronunciation: pronunciationNotes[language],
    segments: [
      {
        title: { en: "Bring it back", hi: "पुरानी बात याद करें" },
        minutes: 5,
        task: {
          en: "Try to recall earlier phrases before looking at their translations.",
          hi: "अर्थ देखने से पहले पुराने वाक्यांश याद करने की कोशिश करें।",
        },
      },
      {
        title: { en: "Meet the phrase", hi: "वाक्यांश से परिचित हों" },
        minutes: 8,
        task: {
          en: "Listen to the phrase in context, then notice what changes in the speaker's situation.",
          hi: "संदर्भ में वाक्यांश सुनें और देखें कि वक्ता की स्थिति में क्या बदलाव है।",
        },
      },
      {
        title: { en: "Notice the form", hi: "रूप पर ध्यान दें" },
        minutes: 7,
        task: {
          en: "Compare the example with the grammar note; identify one useful pattern.",
          hi: "उदाहरण की व्याकरण नोट से तुलना करें और एक उपयोगी पैटर्न पहचानें।",
        },
      },
      {
        title: { en: "Practice the exchange", hi: "बातचीत का अभ्यास करें" },
        minutes: 10,
        task: {
          en: "Take both roles, replay the audio, and answer before revealing the next line.",
          hi: "दोनों पात्र निभाएँ, ऑडियो फिर सुनें और अगली पंक्ति देखने से पहले उत्तर दें।",
        },
      },
      {
        title: { en: "Make it yours", hi: "अपने शब्दों में कहें" },
        minutes: 5,
        task: activity.instruction,
      },
      {
        title: { en: "Check what stayed", hi: "याददाश्त जाँचें" },
        minutes: 5,
        task: {
          en: "Retrieve the phrase without translation and mark anything that needs another review.",
          hi: "अनुवाद के बिना वाक्यांश याद करें और कठिन शब्दों को दोबारा अभ्यास के लिए चिह्नित करें।",
        },
      },
    ],
    example: { targetText, meaning },
    dialogue,
    activity: {
      kind: activity.kind,
      instruction: activity.instruction,
      skills: activity.skills,
    },
  };
}

export function getDialogueOptions(
  language: CoreLanguageCode,
  correctAnswer: string,
): string[] {
  const alternatives = Object.values(replies[language])
    .map((reply) => reply.target)
    .filter((phrase) => phrase !== correctAnswer);
  return [correctAnswer, ...alternatives.slice(0, 3)];
}

export function createScriptStarterCurriculum(): LessonCurriculum {
  return {
    objective: {
      en: "Recognize and pronounce the five basic Japanese vowel sounds in hiragana.",
      hi: "हिरागाना के पाँच मूल जापानी स्वर पहचानें और उच्चारित करें।",
    },
    grammar: {
      en: "Hiragana is a sound-based script. あ・い・う・え・お represent a, i, u, e, o; each is one mora.",
      hi: "हिरागाना ध्वनि-आधारित लिपि है। あ・い・う・え・お, a, i, u, e, o दर्शाते हैं; हर एक एक मात्रा है।",
    },
    pronunciation: pronunciationNotes.ja,
    segments: [
      { title: { en: "Hear the sounds", hi: "ध्वनियाँ सुनें" }, minutes: 8, task: { en: "Listen to each vowel without reading its romanization.", hi: "रोमन लिपि देखे बिना हर स्वर सुनें।" } },
      { title: { en: "Notice the script", hi: "लिपि पहचानें" }, minutes: 7, task: { en: "Compare the five kana shapes and connect each one with its sound.", hi: "पाँचों काना आकारों की तुलना करें और हर आकार को उसकी ध्वनि से जोड़ें।" } },
      { title: { en: "Recall from sound", hi: "ध्वनि से याद करें" }, minutes: 10, task: { en: "Listen in a new order and identify each character from memory.", hi: "नए क्रम में सुनें और हर अक्षर को याद से पहचानें।" } },
      { title: { en: "Say them clearly", hi: "स्पष्ट उच्चारण करें" }, minutes: 10, task: { en: "Repeat each vowel, keeping the sound short and even.", hi: "हर स्वर दोहराएँ और ध्वनि को छोटा व समान रखें।" } },
      { title: { en: "Check retention", hi: "याददाश्त जाँचें" }, minutes: 5, task: { en: "Identify the five vowels again without looking at the sound guide.", hi: "ध्वनि मार्गदर्शिका देखे बिना पाँचों स्वरों को फिर पहचानें।" } },
    ],
    example: {
      targetText: "あ・い・う・え・お",
      meaning: { en: "a, i, u, e, o", hi: "अ, इ, उ, ए, ओ" },
    },
    dialogue: [],
    activity: {
      kind: "listen",
      instruction: {
        en: "Listen to each vowel, then identify it without looking at the romanization.",
        hi: "हर स्वर सुनें, फिर रोमन लिपि देखे बिना उसे पहचानें।",
      },
      skills: ["listening", "reading"],
    },
  };
}
