import React, { useState } from 'react';
import './Reasons.css';

const Reasons = () => {
  const cards = [
    {
      id: 1,
      frontTitle: "Reason #1",
      backText: "Your smile lights up my entire world. It's the first thing I look forward to seeing.",
      frontImage: "Add her picture here!"
    },
    {
      id: 2,
      frontTitle: "Reason #2",
      backText: "The way you talk about the things you love. Your passion is incredibly inspiring.",
      frontImage: "Add another picture here!"
    },
    {
      id: 3,
      frontTitle: "Reason #3",
      backText: "Because you understand me like nobody else does, even from miles away.",
      frontImage: "Add another picture here!"
    },
    {
      id: 4,
      frontTitle: "Reason #4",
      backText: "Your beautiful soul and the kindness you show to everyone around you.",
      frontImage: "Add another picture here!"
    }
  ];

  const [flippedCards, setFlippedCards] = useState({});

  const handleFlip = (id) => {
    setFlippedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <section className="reasons-section section">
      <div className="container">
        <h2 className="section-title text-center" style={{ marginBottom: '2rem' }}>A Million Reasons Why...</h2>
        <p className="text-center" style={{ marginBottom: '4rem', color: 'var(--color-text-muted)', fontSize: '1.2rem' }}>
          Click the cards to see why you are so special to me.
        </p>
        
        <div className="cards-grid">
          {cards.map(card => (
            <div 
              key={card.id} 
              className={`flip-card ${flippedCards[card.id] ? 'flipped' : ''}`}
              onClick={() => handleFlip(card.id)}
            >
              <div className="flip-card-inner">
                {/* Front of Card */}
                <div className="flip-card-front glass-panel">
                  <div className="card-image-placeholder">
                    <span>📷 {card.frontImage}</span>
                  </div>
                  <h3>{card.frontTitle}</h3>
                  <span className="tap-hint">Tap to flip ↺</span>
                </div>
                
                {/* Back of Card */}
                <div className="flip-card-back glass-panel">
                  <span className="heart-icon">💌</span>
                  <p>{card.backText}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Reasons;
