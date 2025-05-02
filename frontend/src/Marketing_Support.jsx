import React, { useEffect, useRef, useState } from "react";
import "./Marketing.css";
import Navbar from "./components/Marketing_Nav";

function Support() {
  return (
    <>
      <Navbar />

      <section className="vision-section">
        <h1>Our Vision</h1>
        <p>GoClimb is your climbing companion. We help climbers explore crags, assess hazards, and navigate with AR—all while building a vibrant community.</p>
      </section>

      <section className="team-section">
        <h2>Meet the experienced team bringing innovation, adventure, and tech to your fingertips.</h2>

        <div className="features-container">
          <div className="feature-box">
            <img src="Javier.jpg" alt="Javier Tan Liang Yu" />
            <h3>Javier Tan Liang Yu</h3>
            <p>Project Lead</p>
          </div>
          <div className="feature-box">
            <img src="Tan.jpg" alt="Tan Benedict Yi Zheng" />
            <h3>Tan Benedict Yi Zheng</h3>
            <p>Admin</p>
          </div>
          <div className="feature-box">
            <img src="Chee.jpg" alt="Chee Yu Siang Kenneth" />
            <h3>Chee Yu Siang Kenneth</h3>
            <p>Admin</p>
          </div>
        </div>

          <div className="features-container">
          <div className="feature-box">
            <img src="Chan.jpg" alt="Chan Yi Jonathan" />
            <h3>Chan Yi Jonathan</h3>
            <p>Admin</p>
          </div>
          <div className="feature-box">
            <img src="Azlan.jpg" alt="Azlan Hans" />
            <h3>Azlan Hans</h3>
            <p>Admin</p>
          </div>
        </div>
      </section>

      <footer>
        <p>&copy; 2025 GoClimb. All rights reserved.</p>
      </footer>

      <style jsx="true">{`
        .vision-section {
          background:rgb(113, 114, 114);
          color: white;
          padding: 50px 20px;
          text-align: center;
        }

        .vision-section h1 {
          font-size: 2.5rem;
          margin-bottom: 15px;
        }

        .vision-section p {
          font-size: 1.1rem;
          max-width: 700px;
          margin: 0 auto;
        }

        .team-section {
          padding: 50px 20px;
          text-align: center;
          background-color: lightgray;
        }

        .team-section h2 {
          font-size: 2rem;
          margin-bottom: 10px;
        }

        .team-section p {
          margin-bottom: 40px;
          font-size: 1rem;
          color: #666;
        }
      `}</style>
    </>
  );
}

export default Support;
