import React from 'react';
import './Goals.css';

const Goals = () => {
  const goals = [
    { id: 1, title: "Career Dreams", content: "Supporting each other as we conquer college and land our dream jobs.", icon: "🎓" },
    { id: 2, title: "Our Future Home", content: "A cozy place filled with laughter, love, and probably too many plants.", icon: "🏡" },
    { id: 3, title: "Growth", content: "Always communicating, never going to bed angry, and growing stronger every day.", icon: "🌱" }
  ];

  return (
    <section className="goals-section section">
      <div className="container">
        <h2 className="section-title text-center">Future Goals</h2>
        <p className="text-center" style={{ marginBottom: '4rem', color: 'var(--color-text-muted)' }}>
          A vision board for the life we are building together.
        </p>

        <div className="vision-board">
          {goals.map(goal => (
            <div key={goal.id} className="vision-card glass-panel float-anim" style={{ animationDelay: `${goal.id}s` }}>
              <div className="vision-icon">{goal.icon}</div>
              <h3>{goal.title}</h3>
              <p>{goal.content}</p>
            </div>
          ))}
          
          <div className="vision-card glass-panel empty-card">
            <span className="plus-icon">+</span>
            <p>More dreams to be written...</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Goals;
