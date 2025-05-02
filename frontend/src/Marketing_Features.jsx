import React from "react";
import "./Marketing.css";
import Navbar from "./components/Marketing_Nav";

function Features() {
  return (
    <div>
      <Navbar />

      <div className="contact-container">
        <h1
          style={{
            color: "white",
            textAlign: "center",
            padding: "50px 0px 20px 0px",
          }}
        >
          GoClimb Features
        </h1>

        {/* Crag routes */}
        <div className="features-container">
        <div className="feature-image-wrapper">
            <img
              className="feature-image"
              src="https://mtkfbnzhyfyomshvzpeb.supabase.co/storage/v1/object/public/marketing-page-pics//image1.jpg"
              alt="Climbing Crags"
            />
          </div>
          <div className="feature-text">
            <h3>Crag and Route Discovery</h3>
            <p>
              Discover the best climbing spots with ease using GoClimb's Crag
              Discovery feature.
            </p>
            <p>
              Whether you're a seasoned climber or a beginner, our app helps you
              find nearby crags with detailed information on routes, difficulty
              levels, and unique features.
            </p>
            <p>
              Explore new locations, plan your next adventure, and connect with
              other climbers, all while having access to vital insights for a
              safe and exciting climbing experience.
            </p>
          </div>
        </div>

        {/* Weather */}
        <div className="features-container">
          <div className="feature-text">
            <h3>Weather Alerts and Hazard System</h3>
            <p>
              Stay safe and informed with GoClimb's Weather and Hazard System.
            </p>
            <p>
              Our app provides real-time weather updates and alerts on potential
              hazards at climbing locations, including storm warnings, wind
              speeds, and temperature changes.
            </p>
            <p>
              With this feature, climbers can make data-driven decisions,
              ensuring a safer and more enjoyable experience in the great
              outdoors. Never miss an important weather update before your next
              climb!
            </p>
          </div>
          <div className="features-container">
          <div className="feature-image-wrapper">
            <img
              className="feature-image"
              src="https://mtkfbnzhyfyomshvzpeb.supabase.co/storage/v1/object/public/marketing-page-pics//Forecast.jpg"
              alt="Weather Forecast"
            />
          </div>
          </div>
        </div>

        {/* Augmented Reality */}
        <div className="features-container">
        <div className="feature-image-wrapper">
            <img
              className="feature-image"
              src="https://mtkfbnzhyfyomshvzpeb.supabase.co/storage/v1/object/public/marketing-page-pics//AR.jpg"
              alt="Augmented Reality"
            />
            </div>
          <div className="feature-text">
            <h3>Augmented Reality (AR)</h3>
            <p>
              Elevate your climbing experience with GoClimb's Augmented Reality
              (AR) Visualization.
            </p>
            <p>
              Our AR feature allows you to view climbing routes in real-time,
              overlaying them onto your surroundings for an intuitive and
              interactive experience.
            </p>
            <p>
              Easily navigate through crags, track your progress, and plan your
              next move with a 3D visualization of the terrain, making each
              climb more engaging and exciting.
            </p>
          </div>
        </div>

        {/* Community */}
        <div className="features-container">
          <div className="feature-text">
            <h3>Community Interaction</h3>
            <p>
              Connect with fellow climbers through GoClimb's Community
              Interaction feature.
            </p>
            <p>
              Share your climbing achievements, post updates, and follow
              different users to be updated about their activities.
            </p>
            <p>
              Build your profile, track your progress, and exchange tips with
              like-minded adventurers.
            </p>
            <p>
              Whether you're seeking advice or celebrating a new personal best,
              GoClimb fosters a supportive and interactive environment for
              climbers of all levels.
            </p>
          </div>
          <div className="feature-image-wrapper">
            <img
              className="feature-image"
              src="https://mtkfbnzhyfyomshvzpeb.supabase.co/storage/v1/object/public/marketing-page-pics//ClimbCommunity.jpg"
              alt="Climbing Community"
            />
          </div>
        </div>
      </div>

      <footer>
        <p>&copy; 2025 GoClimb. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Features;
