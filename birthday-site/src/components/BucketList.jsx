import React, { useState } from 'react';
import './BucketList.css';

const BucketList = () => {
  const [items, setItems] = useState([
    { id: 1, text: "Meet in person for the very first time", completed: false },
    { id: 2, text: "Go on a late-night drive with no destination", completed: false },
    { id: 3, text: "Cook a complicated meal together (and probably mess it up)", completed: false },
    { id: 4, text: "Travel to Paris", completed: false },
    { id: 5, text: "Adopt a cute pet together", completed: false },
    { id: 6, text: "Celebrate every single birthday side by side", completed: false }
  ]);

  const [newItem, setNewItem] = useState('');

  const toggleComplete = (id) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (newItem.trim() === '') return;
    setItems([...items, { id: Date.now(), text: newItem, completed: false }]);
    setNewItem('');
  };

  return (
    <section className="bucket-list-section section">
      <div className="container">
        <h2 className="section-title text-center">Our Bucket List</h2>
        <p className="text-center" style={{ marginBottom: '3rem', color: 'var(--color-text-muted)' }}>
          Everything we promise to do together. Check them off as we go!
        </p>

        <div className="bucket-list-card glass-panel">
          <form className="add-item-form" onSubmit={handleAdd}>
            <input 
              type="text" 
              placeholder="Add a new dream to our list..." 
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              className="bucket-input"
            />
            <button type="submit" className="bucket-btn">Add Dream</button>
          </form>

          <ul className="bucket-items">
            {items.map(item => (
              <li 
                key={item.id} 
                className={`bucket-item ${item.completed ? 'completed' : ''}`}
                onClick={() => toggleComplete(item.id)}
              >
                <div className="checkbox">
                  {item.completed ? '❤️' : '🤍'}
                </div>
                <span className="item-text">{item.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default BucketList;
