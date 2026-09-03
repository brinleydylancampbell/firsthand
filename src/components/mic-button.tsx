"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui";

type Recognition = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((e: { resultIndex: number; results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
};

function getRecognition(): (new () => Recognition) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/**
 * Voice input where the browser supports it. Final phrases are handed to the
 * parent; the textarea stays the source of truth so typing always works.
 */
export function MicButton({ onText, disabled }: { onText: (text: string) => void; disabled?: boolean }) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const rec = useRef<Recognition | null>(null);

  useEffect(() => {
    const R = getRecognition();
    if (!R) return;
    const r = new R();
    r.lang = navigator.language || "en-GB";
    r.interimResults = true;
    r.continuous = true;
    r.onresult = (e) => {
      let finalText = "";
      let interimText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        if (res.isFinal) finalText += res[0].transcript;
        else interimText += res[0].transcript;
      }
      if (finalText) onText(finalText.trim());
      setInterim(interimText);
    };
    r.onend = () => {
      setListening(false);
      setInterim("");
    };
    r.onerror = () => {
      setListening(false);
      setInterim("");
    };
    rec.current = r;
    queueMicrotask(() => setSupported(true));
    return () => {
      r.onresult = null;
      r.onend = null;
      r.stop();
    };
  }, [onText]);

  if (!supported) return null;

  return (
    <span className="flex items-center gap-2">
      {interim ? <span className="max-w-40 truncate text-xs text-ink-3">{interim}</span> : null}
      <Button
        type="button"
        variant={listening ? "primary" : "secondary"}
        disabled={disabled}
        aria-pressed={listening}
        onClick={() => {
          if (!rec.current) return;
          if (listening) rec.current.stop();
          else {
            rec.current.start();
            setListening(true);
          }
        }}
      >
        {listening ? "Stop" : "Speak"}
      </Button>
    </span>
  );
}
