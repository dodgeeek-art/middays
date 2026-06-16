export interface LetterData {
  letter: string;
  pathString: string;
}

// Basic SVG paths for uppercase letters within a 500x500 coordinate space
export const alphabetData: LetterData[] = [
  { letter: "A", pathString: "M 250 50 L 100 450 M 250 50 L 400 450 M 150 250 L 350 250" },
  { letter: "B", pathString: "M 150 50 L 150 450 M 150 50 C 350 50, 350 250, 150 250 M 150 250 C 400 250, 400 450, 150 450" },
  { letter: "C", pathString: "M 350 100 C 150 -50, 50 150, 50 250 C 50 450, 150 550, 350 400" },
  { letter: "D", pathString: "M 150 50 L 150 450 M 150 50 C 400 50, 400 450, 150 450" },
  { letter: "E", pathString: "M 350 50 L 150 50 L 150 450 L 350 450 M 150 250 L 300 250" },
  { letter: "F", pathString: "M 350 50 L 150 50 L 150 450 M 150 250 L 300 250" },
  { letter: "G", pathString: "M 350 100 C 150 -50, 50 150, 50 250 C 50 450, 150 550, 350 400 L 350 250 L 250 250" },
  { letter: "H", pathString: "M 150 50 L 150 450 M 350 50 L 350 450 M 150 250 L 350 250" },
  { letter: "I", pathString: "M 250 50 L 250 450 M 150 50 L 350 50 M 150 450 L 350 450" },
  { letter: "J", pathString: "M 350 50 L 350 350 C 350 450, 150 450, 150 350" },
  { letter: "K", pathString: "M 150 50 L 150 450 M 350 50 L 150 250 M 150 250 L 350 450" },
  { letter: "L", pathString: "M 150 50 L 150 450 L 350 450" },
  { letter: "M", pathString: "M 100 450 L 100 50 L 250 250 L 400 50 L 400 450" },
  { letter: "N", pathString: "M 100 450 L 100 50 L 400 450 L 400 50" },
  { letter: "O", pathString: "M 250 50 C 100 50, 100 450, 250 450 C 400 450, 400 50, 250 50 Z" },
  { letter: "P", pathString: "M 150 450 L 150 50 M 150 50 C 350 50, 350 250, 150 250" },
  { letter: "Q", pathString: "M 250 50 C 100 50, 100 450, 250 450 C 400 450, 400 50, 250 50 Z M 250 250 L 400 400" },
  { letter: "R", pathString: "M 150 450 L 150 50 M 150 50 C 350 50, 350 250, 150 250 M 150 250 L 350 450" },
  { letter: "S", pathString: "M 350 150 C 350 50, 150 50, 150 150 C 150 250, 350 250, 350 350 C 350 450, 150 450, 150 350" },
  { letter: "T", pathString: "M 100 50 L 400 50 M 250 50 L 250 450" },
  { letter: "U", pathString: "M 150 50 L 150 350 C 150 450, 350 450, 350 350 L 350 50" },
  { letter: "V", pathString: "M 100 50 L 250 450 L 400 50" },
  { letter: "W", pathString: "M 50 50 L 150 450 L 250 200 L 350 450 L 450 50" },
  { letter: "X", pathString: "M 150 50 L 350 450 M 350 50 L 150 450" },
  { letter: "Y", pathString: "M 100 50 L 250 250 L 400 50 M 250 250 L 250 450" },
  { letter: "Z", pathString: "M 150 50 L 350 50 L 150 450 L 350 450" }
];
