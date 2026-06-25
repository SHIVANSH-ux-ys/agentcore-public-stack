import React from 'react';
import './HallOfFame.css';

const HallOfFame = () => {
  const polaroids = [
    { id: 1, caption: "Our First Meeting (Soon!)", rotation: "-3deg" },
    { id: 2, caption: "Our First Anniversary", rotation: "2deg" },
    { id: 3, caption: "First Time Cooking Together", rotation: "-1deg" },
    { id: 4, caption: "Our First Concert", rotation: "3deg" },
    { id: 5, caption: "Just Because", rotation: "-2deg" },
    { id: 6, caption: "A Perfect Random Day", rotation: "1deg" }
  ];

  return (
    <section className="hall-of-fame-section section">
      <div className="container">
        <h2 className="section-title text-center">The Hall of Fame</h2>
        <p className="text-center" style={{ marginBottom: '4rem', color: 'var(--color-text-muted)' }}>
          A space dedicated to the most important milestones of our journey.
        </p>

        <div className="polaroid-grid">
          {polaroids.map((p) => (
            <div 
              key={p.id} 
              className="polaroid float-anim" 
              style={{ 
                transform: `rotate(${p.rotation})`,
                animationDelay: `${p.id * 0.5}s` 
              }}
            >
              <div className="polaroid-image-placeholder">
                <span>🖼️ Add Picture</span>
              </div>
              <div className="polaroid-caption">
                {p.caption}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HallOfFame;
