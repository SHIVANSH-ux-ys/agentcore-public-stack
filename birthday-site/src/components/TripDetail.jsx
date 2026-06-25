import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './TripDetail.css';

const TripDetail = () => {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);

  useEffect(() => {
    // Load trip from localStorage
    const savedTrips = JSON.parse(localStorage.getItem('travelTrips') || '[]');
    const foundTrip = savedTrips.find(t => t.id === parseInt(id));
    if (foundTrip) {
      setTrip(foundTrip);
    }
  }, [id]);

  if (!trip) {
    return (
      <div className="trip-detail-section section text-center">
        <h2>Trip not found!</h2>
        <Link to="/travel" className="back-btn">Go Back</Link>
      </div>
    );
  }

  // Generate dynamic background using loremflickr
  const backgroundUrl = `https://loremflickr.com/1600/900/${encodeURIComponent(trip.location)},landscape/all`;

  return (
    <section 
      className="trip-detail-section"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${backgroundUrl})`
      }}
    >
      <div className="container">
        <div className="trip-header glass-panel">
          <Link to="/travel" className="back-btn">← Back to Travels</Link>
          <h1>{trip.title}</h1>
          <h3>📍 {trip.location}</h3>
          <p className="trip-dates">🗓️ {trip.dates}</p>
        </div>

        <div className="trip-photos-grid">
          {trip.photos && trip.photos.length > 0 ? (
            trip.photos.map((photo, index) => (
              <div key={index} className="trip-photo-card glass-panel">
                <img src={photo} alt={`Memory ${index + 1}`} className="trip-img" />
              </div>
            ))
          ) : (
            <div className="empty-photos glass-panel">
              <p>No photos uploaded for this trip yet!</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default TripDetail;
