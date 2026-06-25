import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Travel.css';

const Travel = () => {
  const [trips, setTrips] = useState([]);
  const [showForm, setShowForm] = useState(false);
  
  // Form State
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [dates, setDates] = useState('');
  const [photos, setPhotos] = useState([]);

  // Load from LocalStorage
  useEffect(() => {
    const savedTrips = JSON.parse(localStorage.getItem('travelTrips') || '[]');
    if (savedTrips.length === 0) {
      // Add default placeholders if empty
      const placeholders = [
        { id: 1, title: "Our First Trip Together", location: "Paris", dates: "Future", type: "large", photos: [] },
        { id: 2, title: "Weekend Getaway", location: "Cabin", dates: "Future", type: "small", photos: [] },
      ];
      setTrips(placeholders);
      localStorage.setItem('travelTrips', JSON.stringify(placeholders));
    } else {
      setTrips(savedTrips);
    }
  }, []);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Convert files to Base64 to store in localStorage (Warning: size limits apply in real world)
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotos(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddTrip = (e) => {
    e.preventDefault();
    if (!title || !location) return;

    const newTrip = {
      id: Date.now(),
      title,
      location,
      dates,
      type: "medium", // random or fixed for new ones
      photos
    };

    const updatedTrips = [newTrip, ...trips];
    setTrips(updatedTrips);
    localStorage.setItem('travelTrips', JSON.stringify(updatedTrips));
    
    // Reset Form
    setTitle('');
    setLocation('');
    setDates('');
    setPhotos([]);
    setShowForm(false);
  };

  const handleDeleteTrip = (e, id) => {
    e.preventDefault(); // Prevent navigating to the link
    if(window.confirm("Are you sure you want to delete this trip?")) {
      const updatedTrips = trips.filter(t => t.id !== id);
      setTrips(updatedTrips);
      localStorage.setItem('travelTrips', JSON.stringify(updatedTrips));
    }
  };

  return (
    <section className="travel-section section">
      <div className="container">
        <h2 className="section-title text-center">Travel Adventures</h2>
        
        <div className="text-center travel-header-text">
          <p>
            A gallery reserved for all the places we are going to explore together.
          </p>
          <button className="add-trip-btn" onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "+ Add New Trip"}
          </button>
        </div>

        {showForm && (
          <div className="trip-form-container glass-panel">
            <h3>Create a New Trip</h3>
            <form onSubmit={handleAddTrip} className="trip-form">
              <input type="text" placeholder="Trip Name (e.g. Summer Vacation)" value={title} onChange={e => setTitle(e.target.value)} required />
              <input type="text" placeholder="Location (e.g. Paris)" value={location} onChange={e => setLocation(e.target.value)} required />
              <input type="text" placeholder="Dates (e.g. July 14 - July 21)" value={dates} onChange={e => setDates(e.target.value)} />
              
              <div className="file-upload-wrapper">
                <label>Upload Pictures (From Device)</label>
                <input type="file" multiple accept="image/*" onChange={handleFileChange} />
                <small>{photos.length} photos selected</small>
              </div>

              <button type="submit" className="submit-trip-btn">Save Trip</button>
            </form>
          </div>
        )}

        <div className="masonry-grid">
          {trips.map(trip => (
            <Link to={`/travel/${trip.id}`} key={trip.id} className="trip-link-wrapper">
              <div className={`masonry-item ${trip.type} glass-panel`}>
                <button className="delete-trip-btn" onClick={(e) => handleDeleteTrip(e, trip.id)}>×</button>
                <div className="placeholder-content">
                  <span className="travel-icon">✈️</span>
                  <h3>{trip.title}</h3>
                  <p>📍 {trip.location}</p>
                  {trip.photos && trip.photos.length > 0 ? (
                     <span className="reserved-tag photo-count">{trip.photos.length} Photos</span>
                  ) : (
                     <span className="reserved-tag">Reserved for our future</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Travel;
