import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

// A list of common words for the typing test
const WORD_LIST = [
  'the','be','and','of','a','in','to','have','it','I','that','for','you','he','with','on','do','say','this','they',
  'at','but','we','his','from','that','not','by','she','or','as','what','go','their','can','who','get','if','would','her',
  'all','my','make','about','know','will','as','up','one','time','there','year','so','think','when','which','them','some',
  'me','people','take','out','into','just','see','him','your','come','could','now','than','like','other','how','then','its',
  'our','two','more','these','want','way','look','first','also','new','because','day','use','no','man','find','here','thing'
];

// Generate a string of random words separated by spaces
function generateWords(count = 50) {
  const words = [];
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(Math.random() * WORD_LIST.length);
    words.push(WORD_LIST[idx]);
  }
  return words.join(' ');
}

// Count correct characters typed so far
function countCorrectChars(input, target) {
  let correct = 0;
  for (let i = 0; i < input.length && i < target.length; i++) {
    if (input[i] === target[i]) correct++;
  }
  return correct;
}

// Count errors (mismatched characters)
function computeErrors(input, target) {
  let errors = 0;
  for (let i = 0; i < input.length && i < target.length; i++) {
    if (input[i] !== target[i]) errors++;
  }
  // extra characters beyond target are counted as errors
  if (input.length > target.length) {
    errors += input.length - target.length;
  }
  return errors;
}

const App = () => {
  const [target, setTarget] = useState(() => generateWords(60));
  const [input, setInput] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [wpmData, setWpmData] = useState([]);
  const [errors, setErrors] = useState(0);
  const [soundMode, setSoundMode] = useState('off');
  const [sessions, setSessions] = useState(() => {
    const saved = localStorage.getItem('typingSessions');
    return saved ? JSON.parse(saved) : [];
  });

  const timerRef = useRef(null);
  const audioCtxRef = useRef(null);

  // Interval to update elapsed time and WPM data
  useEffect(() => {
    if (startTime !== null) {
      timerRef.current = setInterval(() => {
        const now = Date.now();
        const sec = Math.floor((now - startTime) / 1000);
        setElapsed(sec);
        const correct = countCorrectChars(input, target);
        const minutes = sec / 60 || (1 / 60);
        const wpm = (correct / 5) / minutes;
        setWpmData(prev => [...prev, { time: sec, wpm: parseFloat(wpm.toFixed(2)) }]);
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [startTime]);

  // Play beep or typewriter sound depending on mode
  function playSound(char) {
    if (soundMode === 'off') return;
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    // Different frequencies for keys and backspace
    let frequency = 440;
    if (soundMode === 'typewriter') {
      frequency = char === ' ' ? 200 : 350;
    } else if (soundMode === 'beep') {
      frequency = char === ' ' ? 800 : 600;
    }
    osc.frequency.value = frequency;

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  }

  // When user finishes a session
  function handleSessionEnd() {
    if (startTime === null) return;
    const now = Date.now();
    const minutes = (now - startTime) / 60000;
    const correct = countCorrectChars(input, target);
    const totalTyped = input.length;
    const sessionWpm = minutes > 0 ? (correct / 5) / minutes : 0;
    const sessionAcc = totalTyped > 0 ? (correct / totalTyped) * 100 : 0;
    const newSession = { timestamp: now, wpm: sessionWpm, accuracy: sessionAcc };
    const updatedSessions = [...sessions, newSession];
    setSessions(updatedSessions);
    localStorage.setItem('typingSessions', JSON.stringify(updatedSessions));
    // Reset for next session
    setTarget(generateWords(60));
    setInput('');
    setStartTime(null);
    setElapsed(0);
    setWpmData([]);
    setErrors(0);
  }

  // Aggregates calculation
  const now = Date.now();
  const hourlySessions = sessions.filter(s => now - s.timestamp <= 3600 * 1000);
  const dailySessions = sessions.filter(s => now - s.timestamp <= 24 * 3600 * 1000);
  const overallSessions = sessions;

  function avgWpm(arr) {
    if (arr.length === 0) return 0;
    return arr.reduce((sum, s) => sum + s.wpm, 0) / arr.length;
  }
  function avgAcc(arr) {
    if (arr.length === 0) return 0;
    return arr.reduce((sum, s) => sum + s.accuracy, 0) / arr.length;
  }

  // Current session metrics
  const correct = countCorrectChars(input, target);
  const currentMinutes = elapsed / 60 || (1 / 60);
  const rawWpm = (correct / 5) / currentMinutes;
  const adjustedWpm = ((correct / 5) - errors) / currentMinutes;
  const accuracy = input.length > 0 ? (correct / input.length) * 100 : 100;
  const cpm = correct / currentMinutes;

  // Input handler
  const handleInputChange = (e) => {
    const value = e.target.value;
    // Start timer when first key is pressed
    if (startTime === null && value.length > 0) {
      setStartTime(Date.now());
    }
    // Sound for key press
    const lastChar = value[value.length - 1];
    if (lastChar) {
      playSound(lastChar);
    }
    setInput(value);
    setErrors(computeErrors(value, target));
    // End session when full text typed
    if (value.length >= target.length) {
      handleSessionEnd();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <h1 className="text-2xl font-bold mb-4">Typing Trainer</h1>
      <div className="grid md:grid-cols-3 gap-4">
        {/* Practice and metrics */}
        <div className="md:col-span-2 bg-white p-4 rounded shadow">
          <div className="mb-3 p-3 border rounded bg-gray-100 overflow-auto whitespace-pre-wrap break-words" style={{ minHeight: '100px' }}>
            {target.split('').map((char, idx) => {
              let className = '';
              if (idx < input.length) {
                className = char === input[idx] ? 'text-green-600' : 'text-red-600';
              } else if (idx === input.length) {
                className = 'bg-blue-200';
              }
              // Add zero-width space after dot to allow wrap if using dot; here we separate by space
              return <span key={idx} className={className}>{char}</span>;
            })}
          </div>
          <input
            type="text"
            className="w-full border p-2 rounded mb-3"
            value={input}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSessionEnd();
              }
            }}
            autoFocus
          />
          <div className="grid sm:grid-cols-4 gap-2 mb-4 text-center text-sm">
            <div className="bg-gray-100 p-2 rounded">
              <div className="font-semibold">WPM</div>
              <div>{Math.max(0, adjustedWpm).toFixed(1)}</div>
            </div>
            <div className="bg-gray-100 p-2 rounded">
              <div className="font-semibold">Accuracy</div>
              <div>{accuracy.toFixed(1)}%</div>
            </div>
            <div className="bg-gray-100 p-2 rounded">
              <div className="font-semibold">CPM</div>
              <div>{cpm.toFixed(1)}</div>
            </div>
            <div className="bg-gray-100 p-2 rounded">
              <div className="font-semibold">Time</div>
              <div>{String(Math.floor(elapsed / 60)).padStart(2, '0')}:{String(elapsed % 60).padStart(2, '0')}</div>
            </div>
          </div>
          {/* Session WPM Chart */}
          <div className="bg-gray-100 p-3 rounded">
            <h2 className="text-sm font-semibold mb-2">Session WPM Over Time</h2>
            <LineChart width={500} height={200} data={wpmData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" label={{ value: 'sec', position: 'insideBottomRight', dy: 10 }} />
              <YAxis label={{ value: 'WPM', angle: -90, position: 'insideLeft', dx: -10 }} />
              <Tooltip />
              <Line type="monotone" dataKey="wpm" dot={false} />
            </LineChart>
          </div>
          {/* Controls */}
          <div className="flex items-center mt-3 gap-3">
            <button
              className="bg-blue-500 text-white px-3 py-1 rounded"
              onClick={() => handleSessionEnd()}
            >
              Reset
            </button>
            <div className="flex items-center gap-1">
              <label htmlFor="sound" className="text-sm">Sound:</label>
              <select
                id="sound"
                value={soundMode}
                onChange={(e) => setSoundMode(e.target.value)}
                className="border rounded p-1 text-sm"
              >
                <option value="off">Off</option>
                <option value="beep">Beeps</option>
                <option value="typewriter">Typewriter</option>
              </select>
            </div>
          </div>
        </div>
        {/* Aggregates panel */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-3">Aggregates</h2>
          <div className="mb-3">
            <h3 className="font-medium">Hourly</h3>
            <p>Avg WPM: {avgWpm(hourlySessions).toFixed(1)}</p>
            <p>Avg Acc%: {avgAcc(hourlySessions).toFixed(1)}</p>
          </div>
          <div className="mb-3">
            <h3 className="font-medium">Daily</h3>
            <p>Avg WPM: {avgWpm(dailySessions).toFixed(1)}</p>
            <p>Avg Acc%: {avgAcc(dailySessions).toFixed(1)}</p>
          </div>
          <div className="mb-3">
            <h3 className="font-medium">Overall</h3>
            <p>Avg WPM: {avgWpm(overallSessions).toFixed(1)}</p>
            <p>Avg Acc%: {avgAcc(overallSessions).toFixed(1)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
