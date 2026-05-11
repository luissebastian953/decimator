import { loadPrompt } from "./load-prompt";

export interface LanguageConfig {
  key: string;
  label: string;
  emoji: string;
  promptInstruction: string;
  fallbacks: string[];
}

export const LANGUAGES: Record<string, LanguageConfig> = {
  en: {
    key: "en",
    label: "English",
    emoji: "🇬🇧",
    promptInstruction: loadPrompt("lang-en"),
    fallbacks: [
      "Dumb fuck",
      "Small dick",
      "Cringe ass motherfucker.",
    ],
  },
  id: {
    key: "id",
    label: "Indonesia",
    emoji: "🇮🇩",
    promptInstruction: loadPrompt("lang-id"),
    fallbacks: [
      "Tolol",
      "Anak ngentot",
      "Titit lu kecil",
    ],
  },
  tolaki: {
    key: "tolaki",
    label: "Tolaki",
    emoji: "🇮🇩",
    promptInstruction: loadPrompt("lang-tolaki"),
    fallbacks: [
      "Kioki inehe, mbe'embe'e laa mohewu.",
      "Inae mohewu ari inehe, meita'osi ari.",
      "Inehe laa topene mbe'embe'e i toono.",
    ],
  },
  hokkien: {
    key: "hokkien",
    label: "Hokkien",
    emoji: "🏮",
    promptInstruction: loadPrompt("lang-hokkien"),
    fallbacks: [
      "Lí khòaⁿ lí ê bīn, kiàⁿ sí lâng ê kiàⁿ-thâu.",
      "Lí nā ū náu, hit ê náu mā sī bô lō-iōng ê.",
      "Lí sī gōng kah bô iōng, liân kha-chiah-phiaⁿ to bē pí lí khah gōng.",
    ],
  },
  khek: {
    key: "khek",
    label: "Khek (Hakka)",
    emoji: "🏮",
    promptInstruction: loadPrompt("lang-khek"),
    fallbacks: [
      "Ngi he thai pun-tòng, mo yung ke ngin.",
      "Ngi ke nèu-hók pí fong-phi hân chà.",
      "Ngài m̀ voi mà ngi, yîn-vi ngi thâng m̀ tó.",
    ],
  },
  zh: {
    key: "zh",
    label: "中文",
    emoji: "🇨🇳",
    promptInstruction: loadPrompt("lang-zh"),
    fallbacks: [
      "你他妈真是废物。",
      "看看你这副德行，连条狗都不如。",
      "你存在的唯一意义就是让别人感觉自己还不错。",
    ],
  },
};

export function getLanguage(key: string): LanguageConfig {
  return LANGUAGES[key] ?? LANGUAGES["en"];
}
