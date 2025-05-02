import React, { useState } from "react";
import "./Marketing.css";
import Navbar from "./components/Marketing_Nav";

const formStyles = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  gap: "10px",
  margin: "10px 15px 50px 15px",
};

const inputStyles = {
  margin: "10px 0",
  padding: "10px",
  width: "97%",
};

function Contact() {
  const [formMessage, setFormMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormMessage("Thank you for your feedback!");
  };

  return (
    <div>
      <Navbar />

      <div className="contact-container">
        <h1
          style={{
            fontSize: "40px",
            color: "white",
            textAlign: "center",
            padding: "0px 0px 20px 0px",
          }}
        >
          Contact Us
        </h1>

        <form id="feedbackForm" onSubmit={handleSubmit} style={formStyles}>
          <input
            type="text"
            id="name"
            name="name"
            placeholder="Your Name"
            required
            style={inputStyles}
          />
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Your Email"
            required
            style={inputStyles}
          />
          <textarea
            id="message"
            name="message"
            placeholder="Your Message"
            required
            style={inputStyles}
          ></textarea>
          <button type="submit">Submit feedback</button>
        </form>

        <p id="formMessage">{formMessage}</p>
      </div>

      <footer>
        <p>&copy; 2025 GoClimb. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Contact;
