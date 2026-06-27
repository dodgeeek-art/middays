export interface SpeakOptions {
  pitch?: number;
  rate?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (event: SpeechSynthesisErrorEvent) => void;
}

export const selectPreferredVoice = (): SpeechSynthesisVoice | null => {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;

  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;

  const englishVoices = voices.filter((voice) => voice.lang.toLowerCase().startsWith("en"));
  const noveltyNames = [
    "albert",
    "bad news",
    "bahh",
    "bells",
    "boing",
    "bubbles",
    "cellos",
    "deranged",
    "good news",
    "hysterical",
    "pipe organ",
    "trinoids",
    "whisper",
    "wobble",
    "zarvox",
  ];

  const clearVoices = englishVoices.filter(
    (voice) => !noveltyNames.some((name) => voice.name.toLowerCase().includes(name)),
  );

  const priorityNames = ["samantha", "ava", "allison", "susan", "victoria", "karen", "moira", "tessa", "hazel", "zira", "david"];
  for (const name of priorityNames) {
    const preferred = clearVoices.find((voice) => voice.name.toLowerCase().includes(name));
    if (preferred) return preferred;
  }

  return clearVoices[0] ?? englishVoices[0] ?? voices[0] ?? null;
};

export const speakWithPreferredVoice = (
  text: string,
  voice: SpeechSynthesisVoice | null,
  options: SpeakOptions = {},
): SpeechSynthesisUtterance | null => {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    options.onEnd?.();
    return null;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = options.rate ?? 0.78;
  utterance.pitch = options.pitch ?? 1.15;

  const selectedVoice = voice ?? selectPreferredVoice();
  if (selectedVoice) {
    utterance.voice = selectedVoice;
  }

  utterance.onstart = () => options.onStart?.();
  utterance.onend = () => options.onEnd?.();
  utterance.onerror = (event) => {
    options.onError?.(event);
    options.onEnd?.();
  };

  window.speechSynthesis.speak(utterance);
  return utterance;
};
