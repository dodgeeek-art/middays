export interface PhonicsSound {
  soundId: string;
  phonemeText: string;
  speakSound: string;
  targetLetter: string;
  objects: string[];
}

export const LETTER_SOUND_CUES: Record<string, string> = {
  A: "ah",
  B: "buh",
  C: "kuh",
  D: "duh",
  E: "eh",
  F: "fuh",
  G: "guh",
  H: "huh",
  I: "ih",
  J: "juh",
  K: "kuh",
  L: "luh",
  M: "muh",
  N: "nuh",
  O: "ah",
  P: "puh",
  Q: "kwuh",
  R: "ruh",
  S: "suh",
  T: "tuh",
  U: "uh",
  V: "vuh",
  W: "wuh",
  X: "ks",
  Y: "yuh",
  Z: "zuh",
};

export const PHONICS_SOUNDS: PhonicsSound[] = [
  { soundId: "m", phonemeText: "/m/", speakSound: "muh", targetLetter: "M", objects: ["Moon", "Monkey", "Mushroom"] },
  { soundId: "s", phonemeText: "/s/", speakSound: "suh", targetLetter: "S", objects: ["Sun", "Star", "Snake", "Strawberry", "Sunflower", "Shell", "Snowman"] },
  { soundId: "t", phonemeText: "/t/", speakSound: "tuh", targetLetter: "T", objects: ["Turtle", "Tree", "Tomato", "Tulip", "Truck"] },
  { soundId: "p", phonemeText: "/p/", speakSound: "puh", targetLetter: "P", objects: ["Pig", "Panda", "Penguin", "Plane", "Pizza", "Pear"] },
  { soundId: "b", phonemeText: "/b/", speakSound: "buh", targetLetter: "B", objects: ["Ball", "Bear", "Banana", "Bee", "Bell", "Butterfly", "Balloon", "Boat", "Bus"] },
  { soundId: "d", phonemeText: "/d/", speakSound: "duh", targetLetter: "D", objects: ["Dog", "Duck", "Drum", "Donut", "Dolphin"] },
  { soundId: "k", phonemeText: "/k/", speakSound: "kuh", targetLetter: "K", objects: ["Cat", "Cake", "Kite", "Koala", "Carrot", "Cloud", "Cookie", "Crown", "Cup", "Crab", "Cheese"] },
  { soundId: "f", phonemeText: "/f/", speakSound: "fuh", targetLetter: "F", objects: ["Fish", "Frog", "Fox"] },
  { soundId: "a", phonemeText: "/a/", speakSound: "ah", targetLetter: "A", objects: ["Apple", "Alligator"] },
  { soundId: "o", phonemeText: "/o/", speakSound: "ah", targetLetter: "O", objects: ["Octopus", "Owl"] },
  { soundId: "l", phonemeText: "/l/", speakSound: "luh", targetLetter: "L", objects: ["Lion", "Leaf", "Lemon"] },
  { soundId: "r", phonemeText: "/r/", speakSound: "ruh", targetLetter: "R", objects: ["Rabbit", "Rain", "Rose", "Rocket"] },
  { soundId: "h", phonemeText: "/h/", speakSound: "huh", targetLetter: "H", objects: ["Hippo", "Hat", "House", "Heart", "Helicopter", "Hamburger"] },
  { soundId: "g", phonemeText: "/g/", speakSound: "guh", targetLetter: "G", objects: ["Grapes", "Gift", "Guitar"] },
];

export const getLetterSoundCue = (letter: string): string =>
  LETTER_SOUND_CUES[letter.toUpperCase()] ?? letter.toLowerCase();

export const getPhonicsSoundByLetter = (letter: string): PhonicsSound | undefined =>
  PHONICS_SOUNDS.find((sound) => sound.targetLetter === letter.toUpperCase());

export const getPhonicsSoundCue = (letter: string): string =>
  getPhonicsSoundByLetter(letter)?.speakSound ?? getLetterSoundCue(letter);

export const buildFindSoundPrompt = (sound: Pick<PhonicsSound, "speakSound">): string =>
  `Listen for ${sound.speakSound}. Pick the matching picture.`;

export const buildReplaySoundPrompt = (sound: Pick<PhonicsSound, "speakSound">): string =>
  `Listen for ${sound.speakSound}.`;

export const buildCorrectSoundPrompt = (
  objectName: string,
  sound: Pick<PhonicsSound, "speakSound">,
): string => `${objectName} starts with ${sound.speakSound}.`;

export const buildTryAgainSoundPrompt = (sound: Pick<PhonicsSound, "speakSound">): string =>
  `Good try. The sound is ${sound.speakSound}.`;
