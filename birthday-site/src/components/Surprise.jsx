import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import './Surprise.css';

const Surprise = ({ onUnlock }) => {
  const [password, setPassword] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [errorShake, setErrorShake] = useState(false);

  // Photos
  const photos = [
    '/photos/media__1782409777941.jpg',
    '/photos/media__1782409786977.jpg',
    '/photos/media__1782409795593.jpg',
    '/photos/media__1782409799066.jpg'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password.trim().length > 0) {
      // Unlock on any input!
      setIsUnlocked(true);
      triggerConfetti();
    } else {
      setErrorShake(true);
      setTimeout(() => setErrorShake(false), 500);
    }
  };

  const triggerConfetti = () => {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#ffb7b2', '#e2f0cb', '#ffdac1', '#c7ceea']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#ffb7b2', '#e2f0cb', '#ffdac1', '#c7ceea']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  if (!isUnlocked) {
    return (
      <div className="surprise-lock-screen">
        <div className="lock-box">
          <h1 className="lock-title">A Special Surprise...</h1>
          <p className="lock-subtitle">Enter the magic word to unlock your gift!</p>
          <form onSubmit={handleSubmit} className={errorShake ? 'shake' : ''}>
            <input 
              type="text" 
              placeholder="Type something cute..." 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="lock-input"
            />
            <button type="submit" className="lock-btn">Unlock 💖</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="surprise-reveal-screen">
      <div className="reveal-content">
        <h1 className="reveal-title">Happy Birthday! 🎉</h1>
        <p className="reveal-message">
          Wishing the most amazing person an incredibly happy birthday. 
          May your day be filled with as much joy, beauty, and happiness as you bring to the world!
        </p>

        <div className="photo-gallery">
          {photos.map((src, index) => (
            <div key={index} className={`photo-wrapper photo-${index + 1}`}>
              <img src={src} alt={`Memory ${index + 1}`} />
            </div>
          ))}
        </div>

        <div className="floating-messages">
          <div className="msg m1">You're the best! ✨</div>
          <div className="msg m2">So beautiful! 🌸</div>
          <div className="msg m3">Keep smiling! 😊</div>
          <div className="msg m4">Have the best day! 💖</div>
        </div>

        <button className="enter-site-btn" onClick={onUnlock}>
          Enter The Website 👉
        </button>
      </div>
    </div>
  );
};

export default Surprise;
