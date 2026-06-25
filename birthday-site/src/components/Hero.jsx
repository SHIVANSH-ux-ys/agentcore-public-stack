import React, { useState, useEffect, useRef } from 'react';
import ReactPlayer from 'react-player';
import './Hero.css';

const loveNotes = [
  { icon: '🌙', text: 'Every night I fall asleep thinking of you, and every morning I wake up smiling because of you.' },
  { icon: '✨', text: 'In a world full of people, my heart always finds its way back to you, Isha.' },
  { icon: '🌸', text: 'You are the reason I believe in magic. You are the magic.' },
  { icon: '💫', text: 'Distance means nothing when someone means everything. And you mean everything.' },
  { icon: '🌺', text: 'I don\'t just like you. I like who I become when I\'m talking to you.' },
  { icon: '🕊️', text: 'You walked into my world and quietly made it the most beautiful place to be.' },
  { icon: '🌹', text: 'Loving you is the easiest thing I have ever done, and the best decision I\'ve ever made.' },
];

const Hero = () => {
  const [photos, setPhotos] = useState({ p1: null, p2: null, p3: null });
  const [noteIndex, setNoteIndex] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);
  const [customName, setCustomName] = useState(() => localStorage.getItem('custom_name') || 'Shivansh');
  const [videoUrl, setVideoUrl] = useState(() => localStorage.getItem('bg_video') || 'https://www.youtube.com/watch?v=jfKfPfyJRdk');
  const [isMuted, setIsMuted] = useState(true);
  const playerRef = useRef(null);

  const fileInputRefs = {
    p1: useRef(null),
    p2: useRef(null),
    p3: useRef(null),
  };

  // Rotate love notes every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setFadeIn(false);
      setTimeout(() => {
        setNoteIndex((prev) => (prev + 1) % loveNotes.length);
        setFadeIn(true);
      }, 400);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Load saved photos from localStorage on mount
  useEffect(() => {
    const saved = {
      p1: localStorage.getItem('polaroid_p1') || null,
      p2: localStorage.getItem('polaroid_p2') || null,
      p3: localStorage.getItem('polaroid_p3') || null,
    };
    setPhotos(saved);
  }, []);

  const handlePolaroidClick = (slot) => {
    fileInputRefs[slot].current.click();
  };

  const handleFileChange = (slot, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result;
      setPhotos((prev) => ({ ...prev, [slot]: dataUrl }));
      localStorage.setItem(`polaroid_${slot}`, dataUrl);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleNameChange = (e) => {
    const val = e.target.value;
    setCustomName(val);
    localStorage.setItem('custom_name', val);
  };

  const handleVideoUrlChange = (e) => {
    const val = e.target.value;
    setVideoUrl(val);
    localStorage.setItem('bg_video', val);
    setIsMuted(true); // Must be muted to autoplay a new link
  };

  const toggleMusic = () => {
    setIsMuted(!isMuted);
  };

  const renderPolaroid = (slot, label, extraClass) => {
    const img = photos[slot];
    return (
      <div
        className={`scattered-polaroid ${extraClass} glass-panel`}
        onClick={() => handlePolaroidClick(slot)}
        title="Click to add or change photo"
      >
        <input
          type="file"
          accept="image/*"
          ref={fileInputRefs[slot]}
          style={{ display: 'none' }}
          onChange={(e) => handleFileChange(slot, e)}
        />
        {img ? (
          <img src={img} alt={`Our memory ${label}`} className="polaroid-img" />
        ) : (
          <div className="polaroid-img-placeholder">
            <span className="polaroid-icon">📸</span>
            <span className="polaroid-hint">Add Photo</span>
          </div>
        )}
        <div className="polaroid-label">{label}</div>
        <div className="polaroid-edit-overlay">
          <span>✏️ Change</span>
        </div>
      </div>
    );
  };

  const currentNote = loveNotes[noteIndex];

  return (
    <section className="hero-section">
      <div className="video-background-wrapper">
        <ReactPlayer
          ref={playerRef}
          url={videoUrl}
          playing={true}
          loop={true}
          muted={isMuted}
          volume={1}
          width="100vw"
          height="100vh"
          className="react-player-bg"
          onError={(e) => alert("Oops! This specific YouTube video blocks embedding (usually happens with official music videos). Try a lyric video or a different upload of the song!")}
          config={{
            youtube: {
              playerVars: { showinfo: 0, controls: 0 }
            }
          }}
        />
      </div>
      <div className="hero-background-overlay"></div>

      {/* Floating sparkles */}
      <div className="sparkle-container" aria-hidden="true">
        {['✦','✧','✦','✧','✦','✧'].map((s, i) => (
          <span key={i} className={`sparkle sparkle-${i + 1}`}>{s}</span>
        ))}
      </div>

      {/* Floating Romantic Hearts on the Left Side */}
      <div className="floating-hearts-container left" aria-hidden="true">
        <span className="heart h1">💖</span>
        <span className="heart h2">✨</span>
        <span className="heart h3">💕</span>
        <span className="heart h4">💗</span>
        <span className="heart h5">💓</span>
        <span className="heart h6">🌸</span>
        <span className="heart h7">💖</span>
      </div>

      <div className="hero-content">
        <h1 className="grand-title">
          <span className="name">{customName || 'Your Name'}</span>
          <span className="ampersand">&</span>
          <span className="name">Isha</span>
        </h1>
        <p className="hero-subtitle">Our Little Universe ✨</p>

        {/* Special Love Note Rotator */}
        <div className="love-note-rotator glass-panel">
          <div className="heart-pulse-ring"></div>
          <div className="heart-pulse">❤️</div>
          <div className={`note-content ${fadeIn ? 'note-visible' : 'note-hidden'}`}>
            <span className="note-icon">{currentNote.icon}</span>
            <p className="note-text">"{currentNote.text}"</p>
          </div>
          <div className="note-dots">
            {loveNotes.map((_, i) => (
              <span
                key={i}
                className={`note-dot ${i === noteIndex ? 'active' : ''}`}
                onClick={() => { setFadeIn(false); setTimeout(() => { setNoteIndex(i); setFadeIn(true); }, 300); }}
              />
            ))}
          </div>
        </div>

        <div className="love-letter-box glass-panel">
          <h3>My Dearest Isha,</h3>
          <p>
            We've been talking for months, and somehow, every single day you manage to make me smile more than the last. I made this portal just for us—a place to keep our memories, plan our future, and dream about all the things we're going to do when we finally meet.
          </p>
          <p className="signature">- Yours, {customName || 'Shivansh'} ❤️</p>
        </div>

        {/* Custom Controls */}
        <div className="custom-controls-container">
          <div className="name-input-container glass-panel">
            <label htmlFor="customNameInput">Who is celebrating?</label>
            <input
              id="customNameInput"
              type="text"
              className="custom-name-input"
              value={customName}
              onChange={handleNameChange}
              placeholder="Enter a name..."
            />
          </div>
          
          <div className="video-input-container glass-panel">
            <label htmlFor="videoUrlInput">Background Video (YouTube URL)</label>
            <input
              id="videoUrlInput"
              type="text"
              className="custom-name-input"
              value={videoUrl}
              onChange={handleVideoUrlChange}
              placeholder="Paste YouTube Link..."
            />
            <button 
              className="music-toggle-btn"
              onClick={toggleMusic}
            >
              {isMuted ? '🎵 Play Music' : '🔇 Mute Music'}
            </button>
          </div>
        </div>
      </div>

      {/* Scattered Polaroids — click to add/change photo */}
      {renderPolaroid('p1', 'Us 🌸', 'p1')}
      {renderPolaroid('p2', 'Together 🌙', 'p2')}
      {renderPolaroid('p3', 'Always 💫', 'p3')}

    </section>
  );
};

export default Hero;
