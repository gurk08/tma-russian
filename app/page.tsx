"use client";

import { useEffect, useState } from "react";
import { words } from "../data/words";

useEffect(() => {
  const tg = (window as any).Telegram?.WebApp;

  if (tg) {
    tg.ready();
    tg.expand();
  }

  console.log("WEBAPP INIT:", tg);
}, []);

const SESSION_SIZE = 10;

export default function Home() {
  const [sessionWords, setSessionWords] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [currentWord, setCurrentWord] = useState("");
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");

  const [errors, setErrors] = useState<string[]>([]);
  const [finished, setFinished] = useState(false);

  // --------------------
  // TTS
  // --------------------
  function speakWord(word: string) {
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = "ru-RU";
    utterance.rate = 0.9;
    speechSynthesis.speak(utterance);
  }

  // --------------------
  // shuffle
  // --------------------
  function shuffle(array: string[]) {
    return [...array].sort(() => Math.random() - 0.5);
  }

  // --------------------
  // start session
  // --------------------
  function startSession() {
    const selected = shuffle(words).slice(0, SESSION_SIZE);

    setSessionWords(selected);
    setCurrentIndex(0);
    setErrors([]);
    setFinished(false);
    setResult("");
    setInput("");

    setCurrentWord(selected[0]);
    speakWord(selected[0]);
  }

  // --------------------
  // Telegram send
  // --------------------
  function sendToTelegram(finalErrors: string[]) {
    
    const tg = (window as any).Telegram?.WebApp;

    console.log("TG OBJECT:", tg);

    if (!tg) {
      alert("НЕ ОТКРЫТО ЧЕРЕЗ TELEGRAM");
      return;
    }

    const accuracy = Math.round(
      ((SESSION_SIZE - finalErrors.length) / SESSION_SIZE) * 100
    );

    tg?.sendData(
      JSON.stringify({
        accuracy,
        errors: finalErrors,
        total: SESSION_SIZE,
      })
    );
  }

  // --------------------
  // check word
  // --------------------
  function checkWord() {
    if (finished) return;

    const ok =
      input.trim().toLowerCase() ===
      currentWord.trim().toLowerCase();

    if (!ok) {
      setErrors((prev) => [...prev, currentWord]);
      setResult(`❌ ${currentWord}`);
    } else {
      setResult("✅ Правильно");
    }

    const next = currentIndex + 1;

    if (next >= SESSION_SIZE) {
      setFinished(true);
      sendToTelegram([...errors, ...(ok ? [] : [currentWord])]);
      return;
    }

    const nextWord = sessionWords[next];

    setCurrentIndex(next);
    setCurrentWord(nextWord);
    setInput("");
    setResult("");

    speakWord(nextWord);
  }

  // --------------------
  // init
  // --------------------
  useEffect(() => {
    startSession();
  }, []);

  // --------------------
  // FINISH SCREEN
  // --------------------
  if (finished) {
    return (
      <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-6 px-4">
        <h1 className="text-3xl font-bold">Сессия завершена 🎉</h1>

        <div className="text-xl">Ошибки:</div>

        <ul className="text-red-400 text-lg">
          {errors.length === 0 ? (
            <li>нет ошибок 🔥</li>
          ) : (
            errors.map((e, i) => <li key={i}>{e}</li>)
          )}
        </ul>

        <button
          onClick={startSession}
          className="bg-white text-black px-6 py-3 rounded-xl font-bold"
        >
          начать заново
        </button>
      </main>
    );
  }

  // --------------------
  // UI
  // --------------------
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-8 px-4">
            <div className="text-white text-sm">
        {typeof window !== "undefined"
          ? JSON.stringify((window as any).Telegram?.WebApp || {})
          : "no window"}
      </div>

      {/* progress */}
      <div className="text-xl">
        {currentIndex} / {SESSION_SIZE}
      </div>

      {/* sound */}
      <button
        onClick={() => speakWord(currentWord)}
        className="text-7xl"
      >
        🔊
      </button>

      {/* input */}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") checkWord();
        }}
        className="bg-zinc-900 border border-zinc-700 px-5 py-4 text-3xl rounded-xl w-full max-w-xl"
        placeholder="Введите слово"
      />

      {/* result */}
      <div className="text-3xl h-10">{result}</div>

      {/* buttons */}
      <div className="flex gap-4">
        <button
          onClick={checkWord}
          className="bg-white text-black px-6 py-3 rounded-xl font-bold"
        >
          проверить
        </button>

        <button
          onClick={startSession}
          className="bg-zinc-800 px-6 py-3 rounded-xl"
        >
          заново
        </button>
      </div>

    </main>
  );
}