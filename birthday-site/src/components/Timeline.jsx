import React, { useState, useEffect, useRef } from 'react';
import './Timeline.css';

const defaultEras = [
  {
    id: Date.now() + 1,
    title: "Where It All Began",
    subtitle: "The School Era",
    description: "We were in the same school, walking the same halls. Even though we hadn't met properly yet, the universe was already plotting to bring us together.",
    image: null
  }
];

const Timeline = () => {
  const [stories, setStories] = useState(() => {
    const saved = localStorage.getItem('timeline_stories');
    return saved ? JSON.parse(saved) : defaultEras;
  });

  const [newLevel, setNewLevel] = useState({ title: '', subtitle: '', description: '' });
  const fileInputRefs = useRef({});

  // Save to local storage whenever stories change
  useEffect(() => {
    localStorage.setItem('timeline_stories', JSON.stringify(stories));
  }, [stories]);

  // Image compression helper (keeps it under ~200kb for localStorage)
  const handleImageUpload = (id, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        let scale = 1;
        if (img.width > MAX_WIDTH) {
          scale = MAX_WIDTH / img.width;
        }
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6); // 60% quality JPEG
        
        setStories(prev => prev.map(story => 
          story.id === id ? { ...story, image: compressedBase64 } : story
        ));
      };
    };
  };

  const handleAddNewLevel = (e) => {
    e.preventDefault();
    if (!newLevel.title.trim()) return;
    
    const newStory = {
      id: Date.now(),
      title: newLevel.title,
      subtitle: newLevel.subtitle,
      description: newLevel.description,
      image: null
    };

    setStories([...stories, newStory]);
    setNewLevel({ title: '', subtitle: '', description: '' });
  };

  const triggerFileInput = (id) => {
    if (fileInputRefs.current[id]) {
      fileInputRefs.current[id].click();
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this level?")) {
      setStories(prev => prev.filter(story => story.id !== id));
    }
  };

  return (
    <section className="timeline-section section">
      <div className="container">
        <h2 className="section-title text-center">Our Story (Level by Level)</h2>
        
        <div className="timeline-container">
          {stories.map((story, index) => (
            <div className={`timeline-item ${index % 2 === 0 ? 'left' : 'right'}`} key={story.id}>
              <div className="timeline-content glass-panel">
                <button className="delete-btn" onClick={() => handleDelete(story.id)} title="Delete Level">🗑️</button>
                <div className="level-badge">Level {index + 1}</div>
                <h3>{story.title}</h3>
                {story.subtitle && <h4 className="era-subtitle">{story.subtitle}</h4>}
                
                {/* Image Upload Zone */}
                <div 
                  className="image-upload-zone" 
                  onClick={() => triggerFileInput(story.id)}
                  title="Click to change image"
                >
                  <input 
                    type="file" 
                    accept="image/*" 
                    style={{ display: 'none' }}
                    ref={el => fileInputRefs.current[story.id] = el}
                    onChange={(e) => handleImageUpload(story.id, e.target.files[0])}
                  />
                  {story.image ? (
                    <img src={story.image} alt={`Level ${index + 1}`} className="story-uploaded-image" />
                  ) : (
                    <div className="placeholder-content">
                      <span className="upload-icon">📸</span>
                      <p>Tap to upload a memory</p>
                    </div>
                  )}
                </div>

                <p>{story.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Add New Level Form */}
        <div className="add-level-container glass-panel">
          <h3>Unlock a New Level 🔓</h3>
          <form onSubmit={handleAddNewLevel} className="add-level-form">
            <input 
              type="text" 
              placeholder="Level Title (e.g., The First Date)" 
              value={newLevel.title}
              onChange={(e) => setNewLevel({...newLevel, title: e.target.value})}
              required
            />
            <input 
              type="text" 
              placeholder="Subtitle (Optional)" 
              value={newLevel.subtitle}
              onChange={(e) => setNewLevel({...newLevel, subtitle: e.target.value})}
            />
            <textarea 
              placeholder="Describe this milestone in our story..." 
              value={newLevel.description}
              onChange={(e) => setNewLevel({...newLevel, description: e.target.value})}
              rows="3"
            />
            <button type="submit" className="add-btn">Add Level</button>
          </form>
        </div>

      </div>
    </section>
  );
};

export default Timeline;
