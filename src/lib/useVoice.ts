"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useVoice(lang: "zh" | "en") {
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    // Browser feature detection must happen post-mount to avoid an
    // SSR/client hydration mismatch (the SpeechRecognition API doesn't exist server-side).
    const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSupported(Boolean(Ctor));
  }, []);

  const startListening = useCallback(
    (onResult: (transcript: string) => void) => {
      const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
      if (!Ctor) return;

      const recognition = new Ctor();
      recognition.lang = lang === "zh" ? "zh-CN" : "en-US";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        onResult(transcript);
      };
      recognition.onend = () => setListening(false);
      recognition.onerror = () => setListening(false);

      recognitionRef.current = recognition;
      setListening(true);
      recognition.start();
    },
    [lang]
  );

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (typeof window === "undefined" || !window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === "zh" ? "zh-CN" : "en-US";
      window.speechSynthesis.speak(utterance);
    },
    [lang]
  );

  return { supported, listening, startListening, stopListening, speak };
}
