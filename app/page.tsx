"use client";

import { useEffect, useState } from "react";
import { words9, words10 } from "../data/words";

const SESSION_SIZE = 10;

export default function Home() {
  const [mode, setMode] = useState<"9" | "10">("9");

  const [sessionWords, setSessionWords] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [currentWord, setCurrentWord] = useState("");
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");

  const [errors, setErrors] = useState<string[]>([]);
  const [finished, setFinished] = useState(false);

 function speakWord(word: string) {
  let textToSpeak = word;

  if (mode === "10") {
    textToSpeak = word
      .replace(/пре/g, "прэ")
      .replace(/при/g, "прэ");
  }

  const u = new SpeechSynthesisUtterance(textToSpeak);

  u.lang = "ru-RU";

  // ничего больше НЕ трогаем
  speechSynthesis.speak(u);
}

  function shuffle(arr: string[]) {
    return [...arr].sort(() => Math.random() - 0.5);
  }

  function startSession() {
    const baseWords = mode === "9" ? words9 : words10;

    const selected = shuffle(baseWords).slice(0, SESSION_SIZE);

    setSessionWords(selected);
    setCurrentIndex(0);
    setErrors([]);
    setFinished(false);
    setResult("");
    setInput("");

    setCurrentWord(selected[0]);
    speakWord(selected[0]);
  }

  function checkWord() {
    if (finished) return;

    const user = input.trim().toLowerCase();
    const correct = currentWord.trim().toLowerCase();

    const ok = user === correct;

    let newErrors = errors;

    if (!ok) {
      newErrors = [...errors, currentWord];
      setErrors(newErrors);
      setResult(`❌ ${currentWord}`);
    } else {
      setResult("✅ Правильно");
    }

    const next = currentIndex + 1;

    if (next >= SESSION_SIZE) {
      setFinished(true);
      return;
    }

    setCurrentIndex(next);

    const nextWord = sessionWords[next];
    setCurrentWord(nextWord);

    setInput("");
    speakWord(nextWord);
  }

  useEffect(() => {
    startSession();
  }, [mode]);

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

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-6 px-4">

      {/* MODE SELECT */}
      <div className="flex gap-3 mb-4">
        <button
          onClick={() => setMode("9")}
          className={`px-4 py-2 rounded-xl ${
            mode === "9" ? "bg-white text-black" : "bg-zinc-800"
          }`}
        >
          9 задание
        </button>

        <button
          onClick={() => setMode("10")}
          className={`px-4 py-2 rounded-xl ${
            mode === "10" ? "bg-white text-black" : "bg-zinc-800"
          }`}
        >
          ПРЕ / ПРИ
        </button>
      </div>

      {/* PROGRESS */}
      <div className="text-xl">
        {currentIndex} / {SESSION_SIZE}
      </div>

      {/* SOUND */}
      <button
        onClick={() => speakWord(currentWord)}
        className="text-6xl"
      >
        🔊
      </button>

      {/* INPUT */}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && checkWord()}
        autoCorrect="off"
        autoCapitalize="none"
        spellCheck={false}
        inputMode="text"
        className="bg-zinc-900 px-4 py-3 text-2xl rounded-xl w-full max-w-xl"
        placeholder="введите слово"
      />

      {/* RESULT */}
      <div className="text-2xl h-10">
        {result}
      </div>

      {/* BUTTONS */}
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