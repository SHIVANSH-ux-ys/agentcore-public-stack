import React from 'react';
import './Future.css';

const Future = () => {
  return (
    <section className="future-section section">
      <div className="container">
        <div className="future-content glass-panel text-center">
          <span className="future-icon float-anim">✈️</span>
          <h2>The "Finally" Moment</h2>
          <p>
            We've been talking for months, and now we're officially dating. <br/>
            I can't wait for the day I finally get to see you in person, hold your hand, and celebrate your birthday together properly.
          </p>
          <div className="promise-box">
            <p className="promise-text">"Distance means nothing when someone means everything."</p>
            <p className="signature">- I promise it will be worth the wait.</p>
          </div>
          
          <button className="special-button" onClick={() => alert("I love you!")}>
            Click for a surprise 💌
          </button>
        </div>
      </div>
    </section>
  );
};

export default Future;
