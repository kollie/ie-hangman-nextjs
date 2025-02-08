"use client";

import { useState, useEffect } from "react";

const languages = {
  en: "https://random-word-api.herokuapp.com/word",
  es: "https://random-word-api.herokuapp.com/word?lang=es",
  fr: "https://random-word-api.herokuapp.com/word?lang=fr",
};

function Button({ children, className, ...props }) {
  return (
    <button className={`px-4 py-2 rounded transition ${className}`} {...props}>
      {children}
    </button>
  );
}

function Card({ children }) {
  return <div className="border rounded-lg shadow p-4">{children}</div>;
}

function CardContent({ children }) {
  return <div className="text-center text-xl font-bold">{children}</div>;
}

export default function Hangman() {
  const [word, setWord] = useState("");
  const [guessedLetters, setGuessedLetters] = useState([]);
  const [language, setLanguage] = useState("en");
  const [attempts, setAttempts] = useState(6);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchWord();
  }, [language]);

  async function fetchWord() {
    try {
      const response = await fetch(languages[language]);
      const data = await response.json();
      setWord(data[0].toLowerCase());
      setGuessedLetters([]);
      setAttempts(6);
    } catch (error) {
      console.error("Error fetching word:", error);
    }
  }

  function handleGuess(letter) {
    if (guessedLetters.includes(letter) || attempts === 0) return;
    setGuessedLetters([...guessedLetters, letter]);
    if (!word.includes(letter)) {
      setAttempts(attempts - 1);
    }
  }

  function renderWord() {
    return word
      .split("")
      .map((letter) => (guessedLetters.includes(letter) ? letter : "_"))
      .join(" ");
  }

  function checkGameStatus() {
    if (
      word &&
      word.split("").every((letter) => guessedLetters.includes(letter))
    ) {
      setHistory([...history, { word, result: "Win" }]);
      fetchWord();
    } else if (attempts === 0) {
      setHistory([...history, { word, result: "Loss" }]);
      fetchWord();
    }
  }

  useEffect(() => {
    checkGameStatus();
  }, [guessedLetters, attempts]);

  return (
    <div className="flex p-4 gap-8">
      <div className="flex-1 flex flex-col items-center gap-4">
        <h1 className="text-2xl font-bold">Hangman Game</h1>
        <Card>
          <CardContent>{renderWord()}</CardContent>
        </Card>
        <p>Attempts left: {attempts}</p>
        <div className="grid grid-cols-9 gap-2">
          {"abcdefghijklmnopqrstuvwxyz".split("").map((letter) => (
            <Button
              key={letter}
              onClick={() => handleGuess(letter)}
              disabled={guessedLetters.includes(letter)}
              className="bg-gray-300 text-black hover:bg-gray-400"
            >
              {letter}
            </Button>
          ))}
        </div>
        <div className="flex gap-2">
          {Object.keys(languages).map((lang) => (
            <Button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`${
                language === lang
                  ? "bg-blue-700 text-white"
                  : "bg-gray-200 text-black hover:bg-gray-300"
              }`}
            >
              {lang.toUpperCase()}
            </Button>
          ))}
        </div>
        <Button
          onClick={fetchWord}
          className="mt-4 border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
        >
          New Word
        </Button>
      </div>
      <div className="w-1/5 border-l pl-4">
        <h1 className="text-2xl font-bold">Game History</h1>
        <ul>
          {history.map((game, index) => (
            <li
              key={index}
              className={
                game.result === "Win" ? "text-green-600" : "text-red-600"
              }
            >
              {game.word} - {game.result}
            </li>
          ))}
        </ul>
        <Button
          onClick={() => setHistory([])}
          className="mb-2 border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
        >
          Reset History
        </Button>
      </div>
    </div>
  );
}
