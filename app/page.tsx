"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Confetti from "react-confetti";
import useSound from "use-sound";

const translations = {
  en: {
    title: "Hangman Game",
    attemptsLeft: "Attempts left",
    newWord: "New Word",
    restartGame: "Restart Game",
    resetHistory: "Reset History",
    history: "Game History",
    win: "Win",
    loss: "Loss",
    hint: "Hint",
    startGame: "Start Game",
    welcomeMessage:
      "Welcome to the Hangman Game! You have **60 seconds** to guess each word. Click the 'Start Game' button to begin. Use the 'Hint' button to get a clue about the word. Use the 'New Word' button to fetch a new word without resetting your score. Use the 'Restart Game' button to reset your score and start a new game.",
    chooseLanguage: "Choose Language:",
  },
  es: {
    title: "Juego del Ahorcado",
    attemptsLeft: "Intentos restantes",
    newWord: "Nueva Palabra",
    restartGame: "Reiniciar Juego",
    resetHistory: "Restablecer Historial",
    history: "Historial del Juego",
    win: "Victoria",
    loss: "Derrota",
    hint: "Pista",
    startGame: "Comenzar Juego",
    welcomeMessage:
      "¡Bienvenido al Juego del Ahorcado! Tienes **60 segundos** para adivinar cada palabra. Haz clic en el botón 'Comenzar Juego' para empezar. Usa el botón 'Pista' para obtener una pista sobre la palabra. Usa el botón 'Nueva Palabra' para obtener una nueva palabra sin reiniciar tu puntuación. Usa el botón 'Reiniciar Juego' para reiniciar tu puntuación y comenzar un nuevo juego.",
    chooseLanguage: "Elige Idioma:",
  },
  fr: {
    title: "Jeu du Pendu",
    attemptsLeft: "Essais restants",
    newWord: "Nouveau Mot",
    restartGame: "Redémarrer le Jeu",
    resetHistory: "Réinitialiser l'Historique",
    history: "Historique du Jeu",
    win: "Victoire",
    loss: "Défaite",
    hint: "Indice",
    startGame: "Commencer le Jeu",
    welcomeMessage:
      "Bienvenue au Jeu du Pendu ! Vous avez **60 secondes** pour deviner chaque mot. Cliquez sur le bouton 'Commencer le Jeu' pour commencer. Utilisez le bouton 'Indice' pour obtenir un indice sur le mot. Utilisez le bouton 'Nouveau Mot' pour obtenir un nouveau mot sans réinitialiser votre score. Utilisez le bouton 'Redémarrer le Jeu' pour réinitialiser votre score et commencer un nouveau jeu.",
    chooseLanguage: "Choisissez la Langue:",
  },
};

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
  return (
    <div className="border rounded-lg shadow p-4 dark:bg-gray-800 dark:border-gray-700">
      {children}
    </div>
  );
}

function CardContent({ children }) {
  return (
    <div className="text-center text-xl font-bold dark:text-white">
      {children}
    </div>
  );
}

function HangmanDrawing({ attempts }) {
  return (
    <svg
      width="200"
      height="250"
      viewBox="0 0 200 250"
      className="stroke-black stroke-2 dark:stroke-white"
      fill="none"
    >
      {/* Base Structure */}
      <line
        x1="10"
        y1="240"
        x2="100"
        y2="240"
        stroke="currentColor"
        strokeWidth="4"
      />{" "}
      {/* Ground */}
      <line
        x1="55"
        y1="240"
        x2="55"
        y2="20"
        stroke="currentColor"
        strokeWidth="4"
      />{" "}
      {/* Pole */}
      <line
        x1="55"
        y1="20"
        x2="150"
        y2="20"
        stroke="currentColor"
        strokeWidth="4"
      />{" "}
      {/* Top Bar */}
      <line
        x1="150"
        y1="20"
        x2="150"
        y2="50"
        stroke="currentColor"
        strokeWidth="4"
      />{" "}
      {/* Rope */}
      {/* Hangman Figure */}
      {attempts <= 5 && (
        <circle cx="150" cy="70" r="20" stroke="currentColor" strokeWidth="3" />
      )}{" "}
      {/* Head */}
      {attempts <= 4 && (
        <line
          x1="150"
          y1="90"
          x2="150"
          y2="150"
          stroke="currentColor"
          strokeWidth="3"
        />
      )}{" "}
      {/* Body */}
      {attempts <= 3 && (
        <line
          x1="150"
          y1="110"
          x2="120"
          y2="130"
          stroke="currentColor"
          strokeWidth="3"
        />
      )}{" "}
      {/* Left Arm */}
      {attempts <= 2 && (
        <line
          x1="150"
          y1="110"
          x2="180"
          y2="130"
          stroke="currentColor"
          strokeWidth="3"
        />
      )}{" "}
      {/* Right Arm */}
      {attempts <= 1 && (
        <line
          x1="150"
          y1="150"
          x2="120"
          y2="190"
          stroke="currentColor"
          strokeWidth="3"
        />
      )}{" "}
      {/* Left Leg */}
      {attempts <= 0 && (
        <line
          x1="150"
          y1="150"
          x2="180"
          y2="190"
          stroke="currentColor"
          strokeWidth="3"
        />
      )}{" "}
      {/* Right Leg */}
    </svg>
  );
}

export default function Hangman() {
  const [word, setWord] = useState("");
  const [guessedLetters, setGuessedLetters] = useState([]);
  const [language, setLanguage] = useState("en");
  const [attempts, setAttempts] = useState(6);
  const [history, setHistory] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameStarted, setGameStarted] = useState(false);
  const timerRef = useRef(null);

  const [playWin, { stop: stopWin }] = useSound("/sounds/win.wav", {
    volume: 0.5,
  });
  const [playLoss, { stop: stopLoss }] = useSound("/sounds/loss.mp3", {
    volume: 0.5,
  });
  const [playCorrect, { stop: stopCorrect }] = useSound("/sounds/correct.wav", {
    volume: 0.5,
  });
  const [playIncorrect, { stop: stopIncorrect }] = useSound(
    "/sounds/incorrect.wav",
    { volume: 0.5 }
  );

  useEffect(() => {
    const savedHistory = localStorage.getItem("hangmanHistory");
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  useEffect(() => {
    if (gameStarted && timeLeft > 0 && !gameOver) {
      timerRef.current = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0) {
      setGameOver(true);
      const newHistory = [...history, { word, result: "Loss" }];
      setHistory(newHistory);
      localStorage.setItem("hangmanHistory", JSON.stringify(newHistory));
      playLoss();
    }
    return () => clearTimeout(timerRef.current);
  }, [timeLeft, gameOver, gameStarted]);

  async function fetchWord() {
    try {
      const response = await fetch(languages[language]);
      const data = await response.json();
      setWord(data[0].toLowerCase());
      setGuessedLetters([]);
      setAttempts(6);
      setGameOver(false);
      setHintUsed(false);
      setTimeLeft(60);
      setGameStarted(true);
      stopWin();
      stopLoss();
      stopCorrect();
      stopIncorrect();
    } catch (error) {
      console.error("Error fetching word:", error);
    }
  }

  function checkGameStatus() {
    if (gameOver) return;
    if (
      word &&
      word.split("").every((letter) => guessedLetters.includes(letter))
    ) {
      const newHistory = [...history, { word, result: "Win" }];
      setHistory(newHistory);
      localStorage.setItem("hangmanHistory", JSON.stringify(newHistory));
      setGameOver(true);
      playWin();
    } else if (attempts === 0) {
      const newHistory = [...history, { word, result: "Loss" }];
      setHistory(newHistory);
      localStorage.setItem("hangmanHistory", JSON.stringify(newHistory));
      setGameOver(true);
      playLoss();
    }
  }

  function handleGuess(letter) {
    if (guessedLetters.includes(letter) || attempts === 0 || gameOver) return;
    setGuessedLetters([...guessedLetters, letter]);
    if (word.includes(letter)) {
      playCorrect();
    } else {
      setAttempts(attempts - 1);
      playIncorrect();
    }
  }

  function renderWord() {
    return word
      .split("")
      .map((letter) => (guessedLetters.includes(letter) ? letter : "_"))
      .join(" ");
  }

  function handleHint() {
    if (!hintUsed) {
      setGuessedLetters([word[0], ...guessedLetters]);
      setHintUsed(true);
    }
  }

  useEffect(() => {
    checkGameStatus();
  }, [guessedLetters, attempts]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {!gameStarted ? (
        // Welcome Screen
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg text-center max-w-2xl">
            {/* Language Selection */}
            <div className="mb-6">
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
                {translations[language].chooseLanguage}
              </p>
              <div className="flex gap-2 justify-center">
                {Object.keys(languages).map((lang) => (
                  <Button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`${
                      language === lang
                        ? "bg-blue-700 text-white"
                        : "bg-gray-200 text-black hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                    }`}
                    aria-label={`Change language to ${lang.toUpperCase()}`}
                  >
                    {lang.toUpperCase()}
                  </Button>
                ))}
              </div>
            </div>

            {/* Welcome Message */}
            <h1 className="text-4xl font-bold mb-4 text-gray-800 dark:text-white">
              {translations[language].title}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              {translations[language].welcomeMessage}
            </p>

            {/* Start Game Button */}
            <Button
              onClick={fetchWord}
              className="bg-blue-600 text-white hover:bg-blue-700 text-lg px-6 py-3"
              aria-label="Start the game"
            >
              {translations[language].startGame}
            </Button>
          </div>
        </div>
      ) : (
        // Game Screen
        <div className="flex flex-col md:flex-row items-center md:items-start p-4 gap-8 bg-gray-100 dark:bg-gray-900">
          {gameOver && history[history.length - 1].result === "Win" && (
            <Confetti />
          )}
          {/* Left: Hangman Drawing */}
          <div className="w-full md:w-1/3 flex justify-center bg-white dark:bg-gray-800">
            <HangmanDrawing attempts={attempts} />
          </div>

          {/* Middle: Game Controls */}
          <div className="flex-1 flex flex-col items-center gap-4">
            <h1 className="text-2xl font-bold text-center md:text-left dark:text-white">
              {translations[language].title}
            </h1>
            <Card>
              <CardContent>{renderWord()}</CardContent>
            </Card>
            <p className="text-lg dark:text-white">
              {translations[language].attemptsLeft}: {attempts}
            </p>
            {/* Countdown Timer */}
            <p className="text-lg dark:text-white">
              Time left: {timeLeft} seconds
            </p>

            {/* Letters Grid */}
            <div className="grid grid-cols-9 md:grid-cols-6 lg:grid-cols-9 gap-2">
              {"abcdefghijklmnopqrstuvwxyz".split("").map((letter) => (
                <Button
                  key={letter}
                  onClick={() => handleGuess(letter)}
                  disabled={guessedLetters.includes(letter) || gameOver}
                  className="bg-gray-300 text-black hover:bg-gray-400 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                  aria-label={`Guess letter ${letter}`}
                >
                  {letter}
                </Button>
              ))}
            </div>

            {/* Hint Button */}
            <Button
              onClick={handleHint}
              disabled={hintUsed}
              className="mt-4 border-2 border-yellow-600 text-yellow-600 hover:bg-yellow-600 hover:text-white dark:border-yellow-500 dark:text-yellow-500 dark:hover:bg-yellow-500 dark:hover:text-white"
              aria-label="Get a hint"
            >
              {translations[language].hint}
            </Button>

            {/* Language Selection */}
            <div className="flex gap-2 mt-4">
              {Object.keys(languages).map((lang) => (
                <Button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`${
                    language === lang
                      ? "bg-blue-700 text-white"
                      : "bg-gray-200 text-black hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                  }`}
                  aria-label={`Change language to ${lang.toUpperCase()}`}
                >
                  {lang.toUpperCase()}
                </Button>
              ))}
            </div>

            {/* Restart & New Word Buttons */}
            <div className="flex gap-4 mt-4">
              <Button
                onClick={() => {
                  setGuessedLetters([]);
                  setAttempts(6);
                  setGameOver(false);
                  fetchWord();
                  setHistory([]);
                  localStorage.removeItem("hangmanHistory");
                }}
                className="border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white dark:border-green-500 dark:text-green-500 dark:hover:bg-green-500 dark:hover:text-white"
                aria-label="Restart game"
              >
                {translations[language].restartGame}
              </Button>

              <Button
                onClick={() => {
                  fetchWord();
                }}
                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white dark:border-blue-500 dark:text-blue-500 dark:hover:bg-blue-500 dark:hover:text-white"
                aria-label="Get a new word"
              >
                {translations[language].newWord}
              </Button>
            </div>
          </div>

          {/* Right: Game History */}
          <div className="w-full md:w-1/5 border-t md:border-t-0 md:border-l pl-4 pt-4 md:pt-0 dark:border-gray-700">
            <h2 className="text-xl font-bold dark:text-white">
              {translations[language].history}
            </h2>
            <ul>
              {history.map((game, index) => (
                <li
                  key={index}
                  className={
                    game.result === "Win"
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }
                >
                  {game.word} -{" "}
                  {translations[language][game.result.toLowerCase()]}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </motion.div>
  );
}
