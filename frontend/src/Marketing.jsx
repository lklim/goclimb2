import React, { useEffect, useRef, useState } from "react";
import "./Marketing.css";
import Marketing_Map from "./Marketing_Map"; // adjust path if needed
import Navbar from "./components/Marketing_Nav";

function Marketing() {
  const [index, setIndex] = useState(0);
  const slideRef = useRef(null);
  const totalSlides = 3; 

  const moveSlide = (step) => {
    const newIndex = (index + step + totalSlides) % totalSlides;
    setIndex(newIndex);
  };

  useEffect(() => {
    if (slideRef.current) {
      slideRef.current.style.transform = `translateX(-${index * 100}%)`;
    }
  }, [index]);

  useEffect(() => {
    const interval = setInterval(() => {
      moveSlide(1);
    }, 7000);
    return () => clearInterval(interval);
  }, [index]);

  return (
    <div>
      <Navbar />

      <div className="slider-container">
        <div className="slides" ref={slideRef}>
          <div className="slide"><img className="images" src="https://mtkfbnzhyfyomshvzpeb.supabase.co/storage/v1/object/public/marketing-page-pics//image1.jpg" alt="Image 1" /></div>
          <div className="slide"><img className="images" src="https://mtkfbnzhyfyomshvzpeb.supabase.co/storage/v1/object/public/marketing-page-pics//image2.jpg" alt="Image 2" /></div>
          <div className="slide"><img className="images" src="https://mtkfbnzhyfyomshvzpeb.supabase.co/storage/v1/object/public/marketing-page-pics//image3.jpg" alt="Image 3" /></div>
        </div>

        <div className="overlay">
          <h1>Your Climbing Companion</h1>
          <p>Find the best crags, climb higher, and experience adventure</p>
          <div className="overlay-buttons">
            <button onClick={() => window.location.href = "/marketing_Features"}>Learn More</button>
            <button onClick={() => window.location.href = "/login"}>Get Started</button>
          </div>
        </div>

        <button className="prev" onClick={() => moveSlide(-1)}>&#10094;</button>
        <button className="next" onClick={() => moveSlide(1)}>&#10095;</button>
      </div>

      <div className="video-section">
  <video controls className="promo-video">
    <source src="" type="video/mp4" />
    Your browser does not support the video tag.
  </video>
  <div className="video-description">
    <h2>Explore GoClimb in Action</h2>
    <p>Discover GoClimb’s power with this video walkthrough.</p>
    <p>See how climbers find the best spots, stay safe, and connect with the community.</p>
  </div>
    </div>

      <h2 className="feature-title">GoClimb Features</h2>
      <div className="features-container">
        <div className="feature-box">
          <h3>Crag Search</h3>
          <p>Discover top-rated climbing spots with ease using GoClimb's Crag Discovery feature.</p>
        </div>
        <div className="feature-box">
          <h3>Weather Alerts and Hazard System</h3>
          <p>Stay safe and informed with GoClimb's real-time Weather updates and Hazard System.</p>
        </div>
        <div className="feature-box">
          <h3>Augmented Reality (AR)</h3>
          <p>Elevate your climbing experience with GoClimb's Augmented Reality (AR) Visualization.</p>
        </div>
        <div className="feature-box">
          <h3>Community Interaction</h3>
          <p>Connect with fellow climbers through GoClimb's Community Interaction feature.</p>
        </div>
      </div>

      <div className="contact-container">
        <h2>Ready to start your climbing journey with GoClimb?</h2>
        <button onClick={() => window.location.href = '/Marketing_Contact'}>Contact Us</button>
      </div>

      <footer>
        <p>&copy; 2025 GoClimb. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Marketing;
