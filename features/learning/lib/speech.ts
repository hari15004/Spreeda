let voiceLoadListener: (() => void) | null = null;
let voiceLoadTimeout: number | null = null;
let speechRequest = 0;

function clearVoiceWait(synthesis: SpeechSynthesis) {
  if (voiceLoadListener) {
    synthesis.removeEventListener("voiceschanged", voiceLoadListener);
    voiceLoadListener = null;
  }
  if (voiceLoadTimeout !== null && typeof window !== "undefined") {
    window.clearTimeout(voiceLoadTimeout);
    voiceLoadTimeout = null;
  }
}

function findVoice(voices: SpeechSynthesisVoice[], speechLocale: string) {
  const locale = speechLocale.toLowerCase();
  const languageCode = locale.split("-")[0];
  return (
    voices.find((voice) => voice.lang.toLowerCase() === locale) ??
    voices.find(
      (voice) => voice.lang.toLowerCase().split("-")[0] === languageCode,
    ) ??
    voices.find((voice) => voice.default) ??
    voices[0]
  );
}

export function speak(
  text: string,
  speechLocale: string,
  onError?: (error: string) => void,
) {
  if (
    typeof window === "undefined" ||
    !("speechSynthesis" in window) ||
    typeof SpeechSynthesisUtterance === "undefined"
  ) {
    return false;
  }

  const synthesis = window.speechSynthesis;
  speechRequest += 1;
  const request = speechRequest;
  clearVoiceWait(synthesis);
  synthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = speechLocale;
  utterance.rate = 0.85;
  utterance.onerror = (event) => {
    if (event.error !== "canceled" && event.error !== "interrupted") {
      onError?.(event.error);
    }
  };

  function startSpeaking() {
    if (request !== speechRequest) return;
    clearVoiceWait(synthesis);
    const voice = findVoice(synthesis.getVoices(), speechLocale);
    if (voice) utterance.voice = voice;
    synthesis.speak(utterance);
    if (synthesis.paused) synthesis.resume();
  }

  const voices = synthesis.getVoices();
  if (voices.length > 0) {
    startSpeaking();
  } else {
    voiceLoadListener = () => {
      if (synthesis.getVoices().length > 0) startSpeaking();
    };
    synthesis.addEventListener("voiceschanged", voiceLoadListener);
    voiceLoadTimeout = window.setTimeout(startSpeaking, 1200);
  }

  return true;
}

export function stopSpeaking() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    speechRequest += 1;
    clearVoiceWait(window.speechSynthesis);
    window.speechSynthesis.cancel();
  }
}
