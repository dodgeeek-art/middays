"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, Volume2, PenTool, Sparkles } from "@/components/Icons";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import ClayButton from "@/components/ui/ClayButton";
import { InGameSuccessState } from "@/components/ui/InGameShell";
import { vocabularyList } from "@/lib/svgDictionary";
import { playSynthesizedSound } from "@/lib/audio";

interface Point {
  x: number;
  y: number;
}

interface TracingTemplateDetail {
  type: "path" | "ellipse";
  d?: string;
  cx?: number;
  cy?: number;
  rx?: number;
  ry?: number;
  transform?: string;
}

interface TracingTemplate {
  id: string;
  name: string;
  vocabName: string;
  d: string;
  color: string;
  details: TracingTemplateDetail[];
}

const tracingTemplates: TracingTemplate[] = [
  {
    id: "heart",
    name: "Red Heart",
    vocabName: "Heart",
    d: "M6 6c4.665-2.332 8.5.5 10 2.5c1.5-2 5.335-4.832 10-2.5c6 3 4.5 10.5 0 15c-2.196 2.196-6.063 6.063-8.891 8.214a1.764 1.764 0 0 1-2.186-.041C12.33 27.08 8.165 23.165 6 21C1.5 16.5 0 9 6 6",
    color: "#ff4d6d",
    details: []
  },
  {
    id: "star",
    name: "Golden Star",
    vocabName: "Star",
    d: "m18.7 4.627l2.247 4.31a2.27 2.27 0 0 0 1.686 1.189l4.746.65c2.538.35 3.522 3.479 1.645 5.219l-3.25 2.999a2.23 2.23 0 0 0-.683 2.04l.793 4.398c.441 2.45-2.108 4.36-4.345 3.24l-4.536-2.25a2.28 2.28 0 0 0-2.006 0l-4.536 2.25c-2.238 1.11-4.786-.79-4.345-3.24l.793-4.399c.14-.75-.12-1.52-.682-2.04l-3.251-2.998c-1.877-1.73-.893-4.87 1.645-5.22l4.746-.65a2.23 2.23 0 0 0 1.686-1.189l2.248-4.309c1.144-2.17 4.264-2.17 5.398 0",
    color: "#ffd166",
    details: []
  },
  {
    id: "sun",
    name: "Bright Sun",
    vocabName: "Sun",
    d: "M13.638 3.202a2.936 2.936 0 0 1 4.724 0a2.94 2.94 0 0 0 3.25 1.055a2.936 2.936 0 0 1 3.822 2.778a2.94 2.94 0 0 0 2.008 2.763a2.936 2.936 0 0 1 1.46 4.494a2.94 2.94 0 0 0 0 3.416a2.936 2.936 0 0 1-1.46 4.494a2.94 2.94 0 0 0-2.008 2.763a2.936 2.936 0 0 1-3.823 2.778a2.94 2.94 0 0 0-3.249 1.055a2.936 2.936 0 0 1-4.724 0a2.94 2.94 0 0 0-3.25-1.055a2.936 2.936 0 0 1-3.822-2.778a2.94 2.94 0 0 0-2.008-2.763a2.936 2.936 0 0 1-1.46-4.494a2.94 2.94 0 0 0 0-3.416a2.936 2.936 0 0 1 1.46-4.494a2.94 2.94 0 0 0 2.008-2.763a2.936 2.936 0 0 1 3.823-2.778a2.94 2.94 0 0 0 3.249-1.055",
    color: "#f97316",
    details: [
      {
        type: "path",
        d: "M25.062 21.232c-2.89 5.005-9.29 6.72-14.294 3.83s-6.72-9.29-3.83-14.294s9.29-6.72 14.294-3.83s6.72 9.29 3.83 14.294"
      }
    ]
  },
  {
    id: "cat",
    name: "Cute Cat",
    vocabName: "Cat",
    d: "M4 25.942C4 28.174 5.763 30 7.918 30h16.164C26.237 30 28 28.073 28 25.84V6.43c0-1.3-1.59-1.9-2.485-1L20.975 10h-9.812L6.5 5.43c-.9-.9-2.5-.3-2.5 1z",
    color: "#ff9f1c",
    details: [
      {
        type: "path",
        d: "m9 10.927l-2.8 2.6c-.5.5-1.4.1-1.4-.6v-5.2c0-.6.9-1 1.4-.5l2.8 2.6c.3.3.3.8 0 1.1m14.05 0l2.8 2.6c.5.5 1.4.1 1.4-.6v-5.2c0-.6-.9-1-1.4-.5l-2.8 2.6c-.3.3-.3.8 0 1.1"
      },
      {
        type: "path",
        d: "M17.043 20h-2.086a.5.5 0 0 0-.353.854l1.043 1.042a.5.5 0 0 0 .707 0l1.043-1.042a.5.5 0 0 0-.354-.854"
      },
      {
        type: "path",
        d: "M2.724 20.053a.5.5 0 1 0-.448.894l4 2a.5.5 0 1 0 .448-.894zm0 6.894a.5.5 0 1 1-.448-.894l4-2a.5.5 0 1 1 .448.894zm27.223-6.671a.5.5 0 0 0-.67-.223l-4 2a.5.5 0 1 0 .447.894l4-2a.5.5 0 0 0 .223-.67m-.67 6.67a.5.5 0 1 0 .447-.894l-4-2a.5.5 0 1 0-.448.894z"
      },
      {
        type: "path",
        d: "M12 17a1 1 0 0 0-1 1v1a1 1 0 1 0 2 0v-1a1 1 0 0 0-1-1m8 0a1 1 0 0 0-1 1v1a1 1 0 1 0 2 0v-1a1 1 0 0 0-1-1"
      },
      {
        type: "path",
        d: "M16 23.106c-.537.539-1.457.894-2.5.894c-1.032 0-1.942-.347-2.482-.876c.12.724.928 4.376 4.982 4.376s4.861-3.652 4.982-4.376c-.54.529-1.45.876-2.482.876c-1.044 0-1.963-.355-2.5-.894"
      }
    ]
  },
  {
    id: "dog",
    name: "Cute Dog",
    vocabName: "Dog",
    d: "M4 9a4 4 0 0 1 4-4h16a4 4 0 0 1 4 4v14a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z",
    color: "#F3C07B",
    details: [
      {
        type: "path",
        d: "M24.063 21.844c0-4.475-4.313-5.875-8-5.875C11.938 15.969 8 17.53 8 21.844c0 3.95 4.313 7.343 8.063 7.343c4.5 0 8-4.656 8-7.343"
      },
      {
        type: "path",
        d: "M12.992 24.656L16 22.406l3.008 2.25V27c0 1.657-1.351 3-3.008 3a3.007 3.007 0 0 1-3.008-3z"
      },
      {
        type: "path",
        d: "m11.726 6.067l-7.3 10.295c-.705.994-2.27.495-2.27-.723V8.594a4.5 4.5 0 0 1 4.5-4.5h4.05a1.25 1.25 0 0 1 1.02 1.973m8.517 0l7.3 10.295c.704.994 2.27.495 2.27-.723V8.594a4.5 4.5 0 0 0-4.5-4.5h-4.05a1.25 1.25 0 0 0-1.02 1.973"
      },
      {
        type: "path",
        d: "M12 13a1 1 0 1 1 2 0v1a1 1 0 1 1-2 0zm6 0a1 1 0 1 1 2 0v1a1 1 0 1 1-2 0zm-.855 4h-2.317c-.584 0-1.127.816-.638 1.473c.332.446 1.166 1.338 1.841 1.338s1.467-.892 1.778-1.338c.539-.844-.185-1.461-.664-1.473m-.645 3.516a.5.5 0 0 0-.5-.5h-.011a.5.5 0 0 0-.5.5q0 .123.005.244c-.116 2.22-1.806 3.224-2.963 3.224a.5.5 0 1 0 0 1c1.211 0 2.7-.746 3.463-2.242c.764 1.496 2.253 2.242 3.463 2.242a.5.5 0 1 0 0-1c-1.156 0-2.846-1.004-2.962-3.224q.005-.12.005-.244"
      }
    ]
  },
  {
    id: "bear",
    name: "Cute Bear",
    vocabName: "Bear",
    d: "M30.002 20.07v-.026a9 9 0 0 0-.15-1.585c-.309-2.072-1.256-5.756-4.163-8.738c-4.172-4.28-9.688-4-9.688-4s-5.516-.28-9.689 4C3.407 12.703 2.46 16.387 2.15 18.46A9 9 0 0 0 2 20.07a8.7 8.7 0 0 0 4.876 7.82S10 29.72 16 29.72s9.125-1.83 9.125-1.83a8.7 8.7 0 0 0 4.876-7.82",
    color: "#A56953",
    details: [
      {
        type: "path",
        d: "M12 9.5a4.5 4.5 0 1 1-9 0a4.5 4.5 0 0 1 9 0m17 0a4.5 4.5 0 1 1-9 0a4.5 4.5 0 0 1 9 0"
      },
      {
        type: "path",
        d: "M6.313 9.721a12.8 12.8 0 0 1 2.772-2.155a2.5 2.5 0 0 0-3.72 3.235q.434-.551.947-1.08m19.378 0q.511.528.946 1.078a2.5 2.5 0 0 0-3.72-3.234a12.8 12.8 0 0 1 2.773 2.156"
      },
      {
        type: "path",
        d: "M11 21.053c0-.754.373-1.455.988-1.855a7.32 7.32 0 0 1 8.025 0c.614.4.987 1.1.987 1.855v.74C21 24.67 18.761 27 16 27s-5-2.331-5-5.207z"
      },
      {
        type: "path",
        d: "M11 15.969a1 1 0 0 1 2 0v1a1 1 0 0 1-2 0zm8 0a1 1 0 0 1 2 0v1a1 1 0 0 1-2 0zm-3.474 4.851l-1.014-.834a.715.715 0 0 1 .453-1.264h2.074a.713.713 0 0 1 .453 1.264l-1.013.833a.75.75 0 0 1-.953 0M16 22a.5.5 0 0 1 .488.389c.084.337.196.745.427 1.073c.212.302.526.538 1.085.538c.654 0 1-.534 1-1a.5.5 0 0 1 1 0c0 .868-.654 2-2 2c-.925 0-1.528-.43-1.903-.962A3 3 0 0 1 16 23.89q-.045.076-.097.148c-.375.532-.978.962-1.903.962c-1.346 0-2-1.132-2-2a.5.5 0 0 1 1 0c0 .466.346 1 1 1c.56 0 .873-.236 1.085-.538c.231-.328.343-.736.427-1.073a.5.5 0 0 1 .313-.357A.5.5 0 0 1 16 22"
      }
    ]
  },
  {
    id: "rabbit",
    name: "Cute Rabbit",
    vocabName: "Rabbit",
    d: "M27.45 21.89c0-.45-.04-.9-.12-1.33c-.26-1.73-1.05-4.82-3.49-7.32c-.55-.57-1.13-1.04-1.72-1.43l1.22-6.61c.3-1.66-.98-3.2-2.67-3.2c-1.5 0-2.71 1.21-2.71 2.71v5.4c-1.32-.26-2.23-.22-2.23-.22s-.7-.04-1.76.13V4.71c0-1.5-1.21-2.71-2.71-2.71c-1.7 0-2.98 1.54-2.67 3.2l1.17 6.34c-.73.44-1.46 1-2.15 1.7c-2.43 2.5-3.23 5.58-3.49 7.32c-.08.44-.12.88-.13 1.34v.02c0 2.88 1.67 5.36 4.08 6.55c0 0 2.62 1.53 7.64 1.53c5.03 0 7.64-1.53 7.64-1.53a7.29 7.29 0 0 0 4.08-6.55c.02 0 .02-.01.02-.03",
    color: "#CDC4D6",
    details: [
      {
        type: "path",
        d: "M11.13 10.78c.06.32.33.55.66.55c.38 0 .68-.31.68-.67V4.74c0-.67-.56-1.24-1.23-1.24c-.49 0-.79.27-.93.43c-.13.16-.35.51-.26 1zm8.32-6.04v5.91c0 .37.3.68.68.68c.32 0 .6-.23.66-.55l1.08-5.84c.09-.49-.12-.84-.26-1s-.44-.44-.93-.44c-.68 0-1.23.57-1.23 1.24"
      },
      {
        type: "path",
        d: "M2.5 21a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1zm7.137 2.98a.5.5 0 0 0-.274-.96l-7 2a.5.5 0 0 0 .274.96zM22 21.5a.5.5 0 0 1 .5-.5h7a.5.5 0 1 1 0 1h-7a.5.5 0 0 1-.5-.5m.638 1.52a.5.5 0 0 0-.275.96l7 2a.5.5 0 0 0 .274-.96z"
      },
      {
        type: "path",
        d: "M15.96 24.67l-1.36.74c-.08.04-.13.13-.13.22v.78c0 .24.2.44.44.44h2.12c.24 0 .44-.2.44-.44v-.78c0-.09-.05-.18-.13-.22z"
      },
      {
        type: "path",
        d: "M15.52 22.81l-.94-.77a.67.67 0 0 1-.24-.51c0-.36.3-.66.66-.66h1.92c.36 0 .66.3.66.66c0 .2-.09.38-.24.51l-.94.77c-.26.21-.63.21-.88 0"
      },
      {
        type: "path",
        d: "M11 17.969a1 1 0 0 1 2 0v1a1 1 0 0 1-2 0zm8 0a1 1 0 0 1 2 0v1a1 1 0 0 1-2 0zm-6.52 5.051a.5.5 0 0 1 .5.5a1.241 1.241 0 0 0 2.48 0a.5.5 0 0 1 .5-.5h.01a.5.5 0 0 1 .5.5a1.241 1.241 0 0 0 2.48 0a.5.5 0 1 1 1 0a2.241 2.241 0 0 1-3.985 1.404a2.241 2.241 0 0 1-3.985-1.404a.5.5 0 0 1 .5-.5"
      }
    ]
  },
  {
    id: "fox",
    name: "Clever Fox",
    vocabName: "Fox",
    d: "M17.558 5.98A12 12 0 0 0 16.86 8h-2.58c-.17-.69-.41-1.386-.715-2.057l-3.534-.92l-3.466.913a10.9 10.9 0 0 0-.985 4.484v7.77c0 .45-.36.81-.81.81H2.63c-.41 0-.71.4-.6.8q.174.616.402 1.209l13.153 4.846l13.144-4.847q.227-.592.401-1.208c.11-.4-.19-.8-.61-.8h-2.14c-.45 0-.81-.36-.81-.81v-7.77a10.9 10.9 0 0 0-.962-4.428l-3.567-.969z",
    color: "#FF822D",
    details: [
      {
        type: "path",
        d: "M24.07 10.42v2.31a10 10 0 0 0-5.77-4.35a8.6 8.6 0 0 1 2.63-4.39c.07-.06.18-.06.25 0a8.57 8.57 0 0 1 2.89 6.43"
      },
      {
        type: "path",
        d: "M28.73 20.99h-6.46c-1.75 0-3.46.55-4.88 1.57l-1.81 1.29l-1.81-1.29a8.37 8.37 0 0 0-4.88-1.57H2.42C4.43 26.26 9.53 30 15.5 30h.14c5.98-.01 11.08-3.75 13.09-9.01"
      },
      {
        type: "path",
        d: "M13.58 5.95c-.65-1.43-1.6-2.75-2.79-3.71c-.2-.16-.45-.24-.7-.24s-.5.08-.7.24c-1.21.97-2.18 2.26-2.83 3.71zm8.18-3.71c-.2-.16-.45-.24-.7-.24s-.5.08-.7.24c-1.2.97-2.16 2.31-2.81 3.76h7.07c-.66-1.47-1.63-2.78-2.86-3.76"
      },
      {
        type: "path",
        d: "M11 18a1 1 0 1 1 2 0v1a1 1 0 1 1-2 0zm7 0a1 1 0 1 1 2 0v1a1 1 0 1 1-2 0z"
      },
      {
        type: "path",
        d: "M14.58 25.63c.54.82 1.48 1.37 2.54 1.37c.27 0 .49-.22.49-.5s-.22-.5-.5-.5c-1.12 0-2.04-.91-2.04-2.04a.5.5 0 0 0-.052-.226a1 1 0 0 0 .172-.134l1.13-1.13a.865.865 0 0 0-.61-1.48h-2.26c-.78 0-1.17.93-.62 1.48l1.13 1.13q.076.075.165.13a.5.5 0 0 0-.055.23c0 1.12-.91 2.04-2.04 2.04c-.28 0-.5.22-.5.5s.22.5.5.5c1.06 0 2-.55 2.55-1.37"
      }
    ]
  },
  {
    id: "frog",
    name: "Happy Frog",
    vocabName: "Frog",
    d: "M28 8.441c.01.86-.18 1.67-.52 2.4c-.15.33-.1.71.13.99c1.49 1.82 2.39 4.14 2.39 6.67q-.002 1.055-.2 2.05c.01-.053-.416.055-.406 0l-1.824 1.256l-11.748 3.992L4.4 21.807l-1.982-1.233c.007.04-.233-.102-.226-.062A10.6 10.6 0 0 1 2 18.502c0-2.53.9-4.85 2.39-6.67c.23-.28.28-.67.13-1c-.34-.72-.53-1.54-.52-2.4c.04-2.95 2.43-5.36 5.38-5.43a5.49 5.49 0 0 1 5.56 4.73c.02.15.15.27.31.27h1.49c.16 0 .29-.12.31-.27a5.5 5.5 0 0 1 5.57-4.73c2.95.07 5.34 2.48 5.38 5.44",
    color: "#00D26A",
    details: [
      {
        type: "path",
        d: "M13 8.5a3.5 3.5 0 1 1-7 0a3.5 3.5 0 0 1 7 0m13 0a3.5 3.5 0 1 1-7 0a3.5 3.5 0 0 1 7 0"
      },
      {
        type: "path",
        d: "M12 8.5a2.5 2.5 0 1 1-5 0a2.5 2.5 0 0 1 5 0m13 .001a2.5 2.5 0 1 1-5 0a2.5 2.5 0 0 1 5 0m-7.5 5.5a.5.5 0 1 0 0-1a.5.5 0 0 0 0 1m-2.5-.5a.5.5 0 1 1-1 0a.5.5 0 0 1 1 0"
      },
      {
        type: "path",
        d: "M27.57 20.391c-1.18 0-2.27-.4-3.15-1.06a13.43 13.43 0 0 0-8.43-2.95c-3.22 0-6.17 1.12-8.49 3v-.01a5.2 5.2 0 0 1-3.1 1.02H2.17c.89 4.9 5.18 8.61 10.33 8.61h7c5.15 0 9.44-3.71 10.33-8.61"
      }
    ]
  },
  {
    id: "pig",
    name: "Pink Pig",
    vocabName: "Pig",
    d: "M3 17C3 10.373 8.373 5 15 5h1.998c6.627 0 12 5.373 12 12v1c0 6.627-5.373 12-12 12H15C8.373 30 3 24.627 3 18z",
    color: "#FF8687",
    details: [
      {
        type: "path",
        d: "M26.38 5.634l3.044 3.331c.768.841.768 2.221 0 3.062l-3.045 3.332c-1.25 1.37-3.379.399-3.379-1.531V7.175c0-1.93 2.138-2.9 3.38-1.541M5.62 5.633l-3.044 3.34c-.768.84-.768 2.218 0 3.058l3.045 3.329C6.87 16.727 9 15.758 9 13.83V7.173c0-1.928-2.128-2.897-3.38-1.54M14 19a3 3 0 1 0 0 6h4a3 3 0 1 0 0-6z"
      },
      {
        type: "path",
        d: "M15 22a1 1 0 1 1-2 0a1 1 0 0 1 2 0m4 0a1 1 0 1 1-2 0a1 1 0 0 1 2 0"
      },
      {
        type: "path",
        d: "M11 16c0 .55.45 1 1 1s1-.45 1-1v-1c0-.55-.45-1-1-1s-1 .45-1 1zm8 0c0 .55.45 1 1 1s1-.45 1-1v-1c0-.55-.45-1-1-1s-1 .45-1 1z"
      }
    ]
  }
];

export default function MarkMakerEngine({ childId, onBack }: { childId: string; onBack: () => void }) {
  const [phase, setPhase] = useState<"drawing" | "success">("drawing");
  const [activeTemplateIdx, setActiveTemplateIdx] = useState(0);
  const [allCheckpointsHit, setAllCheckpointsHit] = useState(false);
  const [startTime] = useState<number>(() => Date.now());

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svgPathRef = useRef<SVGPathElement>(null);
  const checkpointsRef = useRef<{ x: number; y: number; hit: boolean }[]>([]);
  const isDrawingRef = useRef(false);
  const drawnStrokes = useRef<Point[][]>([]);
  const particles = useRef<{ x: number; y: number; color: string; alpha: number; vx: number; vy: number }[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const loopRunningRef = useRef(false);

  const template = tracingTemplates[activeTemplateIdx];
  const vocabItem = vocabularyList.find(v => v.name === template.vocabName);
  const TemplateIcon = vocabItem?.icon;

  const speakText = useCallback((text: string) => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.85;
      utterance.pitch = 1.25;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  // Initialize and scale checkpoints when template changes
  useEffect(() => {
    drawnStrokes.current = [];
    particles.current = [];
    setAllCheckpointsHit(false);

    // Speak template name
    speakText(`Let's trace the ${template.name}!`);

    // Redraw canvas base state
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    const timer = setTimeout(() => {
      if (svgPathRef.current) {
        const length = svgPathRef.current.getTotalLength();
        const pts = [];
        for (let i = 0; i <= 20; i++) {
          const p = svgPathRef.current.getPointAtLength((i / 20) * length);
          // Scale & center coordinates: translate(2,2) scale(0.875) -> scale(8) translate(22,22) -> scale(5/3)
          const x_svg = 22 + 8 * (2 + 0.875 * p.x);
          const y_svg = 22 + 8 * (2 + 0.875 * p.y);
          pts.push({
            x: x_svg * 5 / 3,
            y: y_svg * 5 / 3,
            hit: false
          });
        }
        checkpointsRef.current = pts;
      }
      drawCanvas();
    }, 100);

    return () => clearTimeout(timer);
  }, [activeTemplateIdx, template, speakText]);

  useEffect(() => {
    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Redraw user's strokes (Glowing thick line)
    if (drawnStrokes.current.length > 0) {
      // Glow underlay
      ctx.save();
      ctx.lineWidth = 24;
      ctx.strokeStyle = "rgba(255, 133, 161, 0.35)";
      ctx.shadowColor = "#ff85a1";
      ctx.shadowBlur = 12;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      drawnStrokes.current.forEach(stroke => {
        if (stroke.length > 0) {
          ctx.beginPath();
          ctx.moveTo(stroke[0].x, stroke[0].y);
          for (let i = 1; i < stroke.length; i++) {
            ctx.lineTo(stroke[i].x, stroke[i].y);
          }
          ctx.stroke();
        }
      });
      ctx.restore();

      // Main white core line
      ctx.save();
      ctx.lineWidth = 10;
      ctx.strokeStyle = "#ffffff";
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      drawnStrokes.current.forEach(stroke => {
        if (stroke.length > 0) {
          ctx.beginPath();
          ctx.moveTo(stroke[0].x, stroke[0].y);
          for (let i = 1; i < stroke.length; i++) {
            ctx.lineTo(stroke[i].x, stroke[i].y);
          }
          ctx.stroke();
        }
      });
      ctx.restore();
    }

    // 2. Update and draw sparkles
    particles.current = particles.current.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.035;
      if (p.alpha <= 0) return false;

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.alpha * 12 + 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return true;
    });
  };

  const startLoop = useCallback(() => {
    if (loopRunningRef.current) return;
    loopRunningRef.current = true;

    const tick = () => {
      drawCanvas();
      if (isDrawingRef.current || particles.current.length > 0) {
        animFrameRef.current = requestAnimationFrame(tick);
      } else {
        loopRunningRef.current = false;
        animFrameRef.current = null;
      }
    };

    animFrameRef.current = requestAnimationFrame(tick);
  }, []);

  const getCanvasCoordinates = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const addParticles = (x: number, y: number, count = 3) => {
    const colors = [template.color, "#ffffff", "#ffc4c0", "#eaddfc", "#faf9f5"];
    for (let i = 0; i < count; i++) {
      particles.current.push({
        x,
        y,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1.0,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6
      });
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (phase !== "drawing") return;
    e.currentTarget.setPointerCapture(e.pointerId);

    isDrawingRef.current = true;
    const pt = getCanvasCoordinates(e);
    drawnStrokes.current.push([pt]);
    addParticles(pt.x, pt.y, 6);
    playSynthesizedSound("click");
    startLoop();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || phase !== "drawing") return;
    const pt = getCanvasCoordinates(e);

    const currentStrokeIndex = drawnStrokes.current.length - 1;
    if (currentStrokeIndex >= 0) {
      drawnStrokes.current[currentStrokeIndex].push(pt);
    }

    addParticles(pt.x, pt.y, 2);

    // Equidistant hit detection
    let hitCount = 0;
    checkpointsRef.current.forEach(cp => {
      if (!cp.hit) {
        const dist = Math.hypot(pt.x - cp.x, pt.y - cp.y);
        if (dist < 72) { // Generous hitbox for toddlers
          cp.hit = true;
        }
      }
      if (cp.hit) hitCount++;
    });

    if (hitCount === checkpointsRef.current.length) {
      setAllCheckpointsHit(true);
    }
    startLoop();
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDrawingRef.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);

    const allHit = checkpointsRef.current.every(cp => cp.hit);
    if (allHit) {
      handleTraceComplete();
    }
  };

  const handleTraceComplete = async () => {
    playSynthesizedSound("correct");
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.75 },
      colors: ["#ff85a1", "#ffd166", "#3fa394", "#ffffff"]
    });

    // Save telemetry progress on every completed drawing in endless mode
    if (childId) {
      const elapsed = Date.now() - startTime;
      try {
        await fetch(`/api/progress/${childId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            targetLetter: template.vocabName.substring(0, 4).toUpperCase(),
            tracingScore: 100,
            phonemicScore: 100,
            timeSpentMs: elapsed
          })
        });

        await fetch(`/api/badges/${childId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            badgeName: "Mark Maker Badge"
          })
        });
      } catch (err) {
        console.error("Telemetry failed:", err);
      }
    }

    setTimeout(() => {
      // Loop endlessly
      setActiveTemplateIdx(prev => (prev + 1) % tracingTemplates.length);
    }, 1500);
  };

  const handleClear = () => {
    playSynthesizedSound("click");
    drawnStrokes.current = [];
    checkpointsRef.current.forEach(cp => cp.hit = false);
    setAllCheckpointsHit(false);
    drawCanvas();
  };

  const activeParentPrompt = template ? `Ask your child: "Can you trace the outline of the ${template.name}? What shape does it make?"` : "";

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto h-full min-h-0 bg-[#fef5f6] p-4 rounded-[2.5rem] border-[3px] border-white/50 shadow-clay-card relative overflow-hidden select-none">
      
      {/* Background blobs */}
      <div className="absolute -z-10 bg-[#f7c2b3]/30 w-72 h-72 rounded-full blur-[90px] opacity-40 -top-10 -right-10"></div>
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <ClayButton
          variant="surface"
          size="icon"
          className="min-w-[64px] min-h-[64px]"
          onClick={() => {
            playSynthesizedSound("click");
            onBack();
          }}
        >
          <ArrowLeft size={28} strokeWidth={3.5} />
        </ClayButton>

        <h1 className="text-xl sm:text-2xl font-black uppercase text-[#4A5358] tracking-wider flex items-center gap-2">
          <PenTool size={24} className="text-[#e07383]" strokeWidth={3.5} />
          Trace & Color
        </h1>

        <div className="bg-white/80 border-2 border-white/40 shadow-inner px-4 py-2 rounded-full font-black text-[#e07383] text-sm tracking-wide">
          TRACE {activeTemplateIdx + 1}/{tracingTemplates.length} ✏️
        </div>
      </div>

      {/* Parental Co-Play Banner */}
      <div className="bg-[#f7c2b3]/70 border-2 border-white/50 text-[#732010] p-3 rounded-2xl mb-4 text-center font-bold text-xs sm:text-sm shadow-[inset_-2px_-2px_4px_rgba(0,0,0,0.02),_inset_2px_2px_4px_rgba(255,255,255,0.8)] leading-snug shrink-0">
        <span className="text-[10px] font-black uppercase tracking-wider text-[#e07383] block mb-0.5">🧑‍🍼 Parent & Child Co-Play Option</span>
        {activeParentPrompt}
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {phase === "success" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 bg-[#fff8e7]/88 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
            >
              <InGameSuccessState
                title="Drawing Complete!"
                message="Super tracing. You earned the Trace & Color Badge."
                icon="✎"
                action={
                  <ClayButton
                    variant="primary"
                    onClick={onBack}
                    className="w-full py-4 text-lg font-black rounded-full toddler-target"
                  >
                    Back to Library
                  </ClayButton>
                }
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Phase Display */}
      <div className="flex-grow flex flex-col justify-between min-h-0 relative z-10">

        {/* Phase: Drawing Canvas */}
        {phase === "drawing" && (
          <div className="flex-grow flex flex-col items-center justify-between min-h-0">
            {/* Reference Example Card */}
            <div className="flex flex-col items-center gap-1.5 mb-3 shrink-0">
              {TemplateIcon && (
                <div className="w-14 h-14 bg-white rounded-2xl border-[3px] border-white/50 shadow-clay-card flex items-center justify-center p-2.5 hover:scale-105 transition-transform duration-200">
                  <TemplateIcon size={38} animClass="anim-breathe" />
                </div>
              )}
              <span className="text-xs sm:text-sm font-black text-[#732010] uppercase tracking-wider">
                Trace the: {template.name}
              </span>
            </div>

            {/* Glowing Canvas board */}
            <div className="flex-grow w-full max-w-lg aspect-square bg-[#22252a] rounded-[2.5rem] border-[4px] border-white/80 shadow-clay-card relative overflow-hidden select-none">
              
              {/* Brushed texture overlay inside canvas */}
              <div className="absolute inset-0 bg-noise opacity-15 pointer-events-none" />

              {/* Hidden SVG for path length calculations */}
              <svg width="0" height="0" className="absolute pointer-events-none">
                <path ref={svgPathRef} d={template.d} />
              </svg>

              {/* Template background drawing */}
              <svg
                viewBox="0 0 300 300"
                className="absolute inset-0 w-full h-full pointer-events-none z-10"
              >
                {/* Watermark and Scaled Guide Path */}
                <g transform="translate(22, 22) scale(8)">
                  {TemplateIcon && (
                    <g className="opacity-15 pointer-events-none">
                      <TemplateIcon size="32" animClass="" />
                    </g>
                  )}
                  
                  <g transform="translate(2, 2) scale(0.875)">
                    {/* Dark Guide Track Underlay */}
                    <path
                      d={template.d}
                      fill="none"
                      stroke="#484d54"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {/* Glowing Dotted Guide Stroke */}
                    <path
                      d={template.d}
                      fill="none"
                      stroke={template.color}
                      strokeWidth="1.2"
                      strokeDasharray="1.5 2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="opacity-90"
                    />

                    {/* Facial details and features underlay */}
                    {template.details?.map((detail, idx) => {
                      if (detail.type === "path" && detail.d) {
                        return (
                          <React.Fragment key={idx}>
                            <path
                              d={detail.d}
                              fill="none"
                              stroke="#484d54"
                              strokeWidth="2.0"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="opacity-50"
                            />
                            <path
                              d={detail.d}
                              fill="none"
                              stroke={template.color}
                              strokeWidth="1.0"
                              strokeDasharray="1 1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="opacity-80"
                            />
                          </React.Fragment>
                        );
                      } else if (detail.type === "ellipse" && detail.cx !== undefined && detail.cy !== undefined && detail.rx !== undefined && detail.ry !== undefined) {
                        return (
                          <React.Fragment key={idx}>
                            <ellipse
                              cx={detail.cx}
                              cy={detail.cy}
                              rx={detail.rx}
                              ry={detail.ry}
                              transform={detail.transform}
                              fill="none"
                              stroke="#484d54"
                              strokeWidth="2.0"
                              className="opacity-50"
                            />
                            <ellipse
                              cx={detail.cx}
                              cy={detail.cy}
                              rx={detail.rx}
                              ry={detail.ry}
                              transform={detail.transform}
                              fill="none"
                              stroke={template.color}
                              strokeWidth="1.0"
                              strokeDasharray="1 1.5"
                              className="opacity-80"
                            />
                          </React.Fragment>
                        );
                      }
                      return null;
                    })}
                  </g>
                </g>
              </svg>

              {/* Interactive Canvas Overlay */}
              <canvas
                ref={canvasRef}
                width={500}
                height={500}
                className="w-full h-full absolute inset-0 cursor-crosshair touch-none z-20"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
              />

              {/* Drawing reset button */}
              <div className="absolute bottom-4 right-4 z-30">
                <ClayButton
                  variant="surface"
                  size="sm"
                  onClick={handleClear}
                  className="p-3 shadow-md bg-white/90"
                >
                  Clear 🔄
                </ClayButton>
              </div>

            </div>

            {/* Instruction play bar */}
            <div className="w-full bg-white p-2.5 rounded-2xl border-2 border-white/60 shadow-clay-card flex items-center justify-center gap-3 z-30 mt-4 shrink-0">
              <ClayButton
                variant="surface"
                size="sm"
                onClick={() => speakText(`Draw along the outline of the ${template.name}!`)}
                className="p-1.5 bg-[#fef5f6] rounded-full"
              >
                <Volume2 size={18} className="text-[#e07383]" strokeWidth={3.5} />
              </ClayButton>
              <span className="text-xs font-black text-[#4A5358] tracking-wide">
                Draw a line along the glowing template shape!
              </span>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
