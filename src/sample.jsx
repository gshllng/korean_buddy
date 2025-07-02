import React, { useState, useEffect, useCallback } from 'react';

// Main App component for the Korean Flashcard Learning App
const Sample = () => {
  // URL to fetch the flashcards JSON data
  const DATA_URL = 'https://raw.githubusercontent.com/vbvss199/Language-Learning-decks/main/korean_flashcards_2.5flash_5k_true.json';

  // State to manage the current flashcard index being displayed
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  // State to manage whether the flashcard is flipped to show the answer
  const [isFlipped, setIsFlipped] = useState(false);
  // State to hold the flashcard data (fetched from API)
  const [flashcards, setFlashcards] = useState([]);
  // State to track loading and error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // State to manage selected CEFR level (default: 'All')
  const [selectedCEFR, setSelectedCEFR] = useState('All');

  // Fetch flashcards from the provided URL on mount
  useEffect(() => {
    setLoading(true);
    fetch(DATA_URL)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch flashcards');
        return res.json();
      })
      .then((data) => {
        // Filter and map data to match the flashcard structure
        const filtered = data.filter(card => card.useful_for_flashcard);
        const mapped = filtered.map((card, idx) => ({
          id: idx + 1,
          korean: card.word,
          english: card.english_translation,
          romanization: card.romanization,
          exampleSentence: card.example_sentence_native,
          sentenceTranslation: card.example_sentence_english,
          cefr: card.cefr_level,
          frequency: card.frequency_index
        }));
        setFlashcards(mapped);
        setCurrentCardIndex(0);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Get unique CEFR levels from flashcards
  const cefrLevels = React.useMemo(() => {
    const levels = new Set(flashcards.map(card => card.cefr).filter(Boolean));
    return ['All', ...Array.from(levels).sort()];
  }, [flashcards]);

  // Filter flashcards by selected CEFR level
  const filteredFlashcards = React.useMemo(() => {
    if (selectedCEFR === 'All') return flashcards;
    return flashcards.filter(card => card.cefr === selectedCEFR);
  }, [flashcards, selectedCEFR]);

  // Reset current card index if filtered list changes
  useEffect(() => {
    setCurrentCardIndex(0);
  }, [selectedCEFR, filteredFlashcards.length]);

  // Effect to reset flip state when the current card changes
  useEffect(() => {
    setIsFlipped(false); // When moving to a new card, it should start unflipped
  }, [currentCardIndex]);

  // Function to go to the next flashcard
  const goToNextCard = useCallback(() => {
    setCurrentCardIndex((prevIndex) => (prevIndex + 1) % filteredFlashcards.length);
    setIsFlipped(false); // Ensure card is unflipped when navigating
  }, [filteredFlashcards.length]);

  // Function to go to the previous flashcard
  const goToPreviousCard = useCallback(() => {
    setCurrentCardIndex((prevIndex) =>
      prevIndex === 0 ? filteredFlashcards.length - 1 : prevIndex - 1
    );
    setIsFlipped(false); // Ensure card is unflipped when navigating
  }, [filteredFlashcards.length]);

  // Function to toggle the flip state of the current flashcard
  const toggleFlip = useCallback(() => {
    setIsFlipped((prevFlipped) => !prevFlipped);
  }, []);

  // Get the current flashcard object based on the currentCardIndex
  const currentCard = filteredFlashcards[currentCardIndex];

  return (
    <div className="app-container">
      {/* Load Inter font for a clean, modern look */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap');

          body {
            margin: 0;
            font-family: 'Inter', sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }

          .app-container {
            min-height: 100vh;
            background: linear-gradient(to bottom right, #eff6ff, #e0e7ff); /* from-blue-50 to-indigo-100 */
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 1rem;
            box-sizing: border-box; /* Ensure padding doesn't add to total width/height */
          }

          .main-title {
            font-size: 2.25rem; /* text-4xl */
            font-weight: 800; /* font-extrabold */
            color: #3730a3; /* text-indigo-800 */
            margin-bottom: 2rem; /* mb-8 */
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); /* drop-shadow-sm */
            text-align: center;
          }

          @media (min-width: 768px) { /* md breakpoint */
            .main-title {
              font-size: 3rem; /* md:text-5xl */
            }
          }

          .loading-text, .error-text {
            font-size: 1.25rem; /* text-xl */
            margin-top: 2rem; /* mt-8 */
          }

          .loading-text {
            color: #374151; /* text-gray-700 */
          }

          .error-text {
            color: #dc2626; /* text-red-600 */
          }

          .flashcard-wrapper {
            position: relative;
            width: 100%;
            max-width: 24rem; /* max-w-sm */
            height: 20rem; /* h-80 */
            border-radius: 1.5rem; /* rounded-3xl */
            cursor: pointer;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); /* shadow-lg */
            perspective: 1000px; /* perspective-1000 */
          }

          @media (min-width: 768px) { /* md breakpoint */
            .flashcard-wrapper {
              max-width: 32rem; /* md:max-w-lg */
              height: 24rem; /* md:h-96 */
            }
          }

          .flashcard-inner {
            position: relative;
            width: 100%;
            height: 100%;
            transition: transform 0.6s; /* transition-transform duration-600 */
            transform-style: preserve-3d; /* transform-style-preserve-3d */
          }

          .flashcard-face {
            position: absolute;
            inset: 0; /* absolute inset-0 */
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 1.5rem; /* p-6 */
            text-align: center;
            border-radius: 1.5rem; /* rounded-3xl */
            -webkit-backface-visibility: hidden; /* backface-hidden */
            backface-visibility: hidden;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); /* shadow-lg */
          }

          .flashcard-front {
            background-color: #ffffff; /* bg-white */
            color: #1f2937; /* text-gray-800 */
          }

          .flashcard-back {
            background-color: #4f46e5; /* bg-indigo-600 */
            color: #ffffff; /* text-white */
            transform: rotateY(180deg); /* Initial rotation for back face */
          }

          .flashcard-wrapper.flipped .flashcard-inner {
            transform: rotateY(180deg);
          }

          .korean-text {
            font-size: 3rem; /* text-5xl */
            font-weight: 700; /* font-bold */
            color: #1f2937; /* text-gray-800 */
            margin-bottom: 1rem; /* mb-4 */
          }

          @media (min-width: 768px) { /* md breakpoint */
            .korean-text {
              font-size: 3.75rem; /* md:text-6xl */
            }
          }

          .flip-instruction {
            font-size: 1.125rem; /* text-lg */
            color: #4b5563; /* text-gray-600 */
            font-style: italic;
          }

          @media (min-width: 768px) { /* md breakpoint */
            .flip-instruction {
              font-size: 1.25rem; /* md:text-xl */
            }
          }

          .english-text {
            font-size: 1.875rem; /* text-3xl */
            font-weight: 600; /* font-semibold */
            margin-bottom: 1rem; /* mb-4 */
          }

          @media (min-width: 768px) { /* md breakpoint */
            .english-text {
              font-size: 2.25rem; /* md:text-4xl */
            }
          }

          .romanization-text {
            font-size: 1.25rem; /* text-xl */
            opacity: 0.8; /* opacity-80 */
            margin-bottom: 0.5rem; /* mb-2 */
          }

          @media (min-width: 768px) { /* md breakpoint */
            .romanization-text {
              font-size: 1.5rem; /* md:text-2xl */
            }
          }

          .example-sentence-container {
            margin-top: 1rem; /* mt-4 */
            font-size: 0.875rem; /* text-sm */
            text-align: center;
          }

          @media (min-width: 768px) { /* md breakpoint */
            .example-sentence-container {
              font-size: 1rem; /* md:text-base */
            }
          }

          .sentence-translation {
            font-size: 0.75rem; /* text-xs */
            opacity: 0.75; /* opacity-75 */
            margin-top: 0.25rem; /* mt-1 */
          }

          @media (min-width: 768px) { /* md breakpoint */
            .sentence-translation {
              font-size: 0.875rem; /* md:text-sm */
            }
          }

          .cefr-frequency-text {
            font-size: 0.75rem; /* text-xs */
            color: #c7d2fe; /* text-indigo-200 */
            margin-top: 1rem; /* mt-4 */
          }

          .controls-container {
            margin-top: 2rem; /* mt-8 */
            display: flex;
            flex-direction: column; /* flex-col */
            align-items: center;
            gap: 1rem; /* space-y-4 */
            width: 100%;
            max-width: 24rem; /* max-w-sm */
          }

          @media (min-width: 640px) { /* sm breakpoint */
            .controls-container {
              flex-direction: row; /* sm:flex-row */
              gap: 1.5rem; /* sm:space-x-6 */
              margin-top: 0; /* sm:space-y-0 */
              max-width: 28rem; /* sm:max-w-md */
            }
          }

          .action-button {
            padding: 0.75rem 1.5rem; /* px-6 py-3 */
            font-weight: 600; /* font-semibold */
            border-radius: 0.75rem; /* rounded-xl */
            transition: all 0.3s ease-in-out; /* transition-all duration-300 ease-in-out */
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.05); /* shadow-md */
            width: 100%; /* w-full */
            cursor: pointer;
          }

          .action-button:hover {
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); /* hover:shadow-lg */
            transform: translateY(-2px); /* hover:-translate-y-0.5 */
          }

          @media (min-width: 640px) { /* sm breakpoint */
            .action-button {
              width: auto; /* sm:w-auto */
            }
          }

          .prev-next-button {
            background-color: #6366f1; /* bg-indigo-500 */
            color: #ffffff; /* text-white */
          }

          .prev-next-button:hover {
            background-color: #4f46e5; /* hover:bg-indigo-600 */
          }

          .flip-button {
            background-color: #ffffff; /* bg-white */
            color: #4338ca; /* text-indigo-700 */
            border: 1px solid #4338ca; /* border border-indigo-700 */
          }

          .flip-button:hover {
            background-color: #eef2ff; /* hover:bg-indigo-50 */
            color: #3730a3; /* hover:text-indigo-800 */
          }

          .card-counter {
            margin-top: 1.5rem; /* mt-6 */
            color: #4b5563; /* text-gray-600 */
            font-size: 1.125rem; /* text-lg */
          }
        `}
      </style>

      {/* Main application title */}
      <h1 className="main-title">
        Learn Korean Flashcards
      </h1>

      {/* CEFR Level Selector */}
      {!loading && !error && cefrLevels.length > 1 && (
        <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
          <label htmlFor="cefr-select" style={{ fontWeight: 600, marginRight: 8 }}>Choose CEFR Level:</label>
          <select
            id="cefr-select"
            value={selectedCEFR}
            onChange={e => setSelectedCEFR(e.target.value)}
            style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', fontSize: '1rem' }}
          >
            {cefrLevels.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>
      )}

      {/* Loading and error states */}
      {loading && <p className="loading-text">Loading flashcards...</p>}
      {error && <p className="error-text">{error}</p>}

      {/* Flashcard display area */}
      {!loading && !error && filteredFlashcards.length > 0 && (
        <>
          <div
            className={`flashcard-wrapper ${isFlipped ? 'flipped' : ''}`}
            onClick={toggleFlip}
          >
            <div className="flashcard-inner">
              {/* Front face of the flashcard: Only Korean word and flip instruction */}
              <div className="flashcard-face flashcard-front">
                <p className="korean-text">
                  {currentCard.korean}
                </p>
                <p className="flip-instruction">
                  (Click to flip)
                </p>
              </div>

              {/* Back face of the flashcard: English translation and all other details */}
              <div className="flashcard-face flashcard-back">
                <p className="english-text">
                  {currentCard.english}
                </p>
                {currentCard.romanization && (
                  <p className="romanization-text">
                    [{currentCard.romanization}]
                  </p>
                )}
                {currentCard.exampleSentence && (
                  <div className="example-sentence-container">
                    <p className="italic">"{currentCard.exampleSentence}"</p>
                    {currentCard.sentenceTranslation && (
                      <p className="sentence-translation">
                        "{currentCard.sentenceTranslation}"
                      </p>
                    )}
                  </div>
                )}
                <p className="cefr-frequency-text">CEFR: {currentCard.cefr} | Freq: {currentCard.frequency}</p>
              </div>
            </div>
          </div>

          {/* Controls for navigation and flipping */}
          <div className="controls-container" style={{ marginTop: '2rem' }}>
            {/* Previous Card Button */}
            <button
              onClick={(e) => { e.stopPropagation(); goToPreviousCard(); }} // Stop propagation to prevent card flip
              className="action-button prev-next-button"
              disabled={filteredFlashcards.length === 0}
            >
              Previous
            </button>

            {/* Flip Card Button (Alternative to clicking the card) */}
            <button
              onClick={(e) => { e.stopPropagation(); toggleFlip(); }} // Stop propagation to prevent card flip
              className="action-button flip-button"
              disabled={filteredFlashcards.length === 0}
            >
              {isFlipped ? 'Show Korean' : 'Show English'}
            </button>

            {/* Next Card Button */}
            <button
              onClick={(e) => { e.stopPropagation(); goToNextCard(); }} // Stop propagation to prevent card flip
              className="action-button prev-next-button"
              disabled={filteredFlashcards.length === 0}
            >
              Next
            </button>
          </div>

          {/* Card Counter */}
          <p className="card-counter">
            Card {filteredFlashcards.length === 0 ? 0 : currentCardIndex + 1} of {filteredFlashcards.length}
          </p>
        </>
      )}
      {/* If no cards for selected level */}
      {!loading && !error && filteredFlashcards.length === 0 && (
        <p className="error-text">No flashcards found for this CEFR level.</p>
      )}
    </div>
  );
}

export default Sample;
