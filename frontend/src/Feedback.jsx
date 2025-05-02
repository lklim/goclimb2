import { useState } from "react";
import supabase from "./supabaseClient";
import Navbar from "./components/Navbar";
import "./Feedback.css";

function Feedback() {
  const [subject, setSubject] = useState("");
  const [comments, setComments] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!subject || !comments) {
      setMessage("Please fill in all fields.");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;

    const { error } = await supabase.from("feedback").insert([
      {
        user_id: userId,
        subject,
        comments,
      },
    ]);

    if (error) {
      console.error("Feedback error:", error.message);
      setMessage("Failed to submit feedback. Please try again.");
    } else {
      setMessage("Thank you for your feedback!");
      setSubject("");
      setComments("");
    }
  };

  return (
    <div className="feedback-wrapper">
      <Navbar />
      <div className="feedback-container">
        <h1>Send Feedback</h1>
        <form onSubmit={handleSubmit}>
          <label>Subject:</label>
          <select value={subject} onChange={(e) => setSubject(e.target.value)} required>
            <option value="">Select a subject</option>
            <option value="Bug Report">Bug Report</option>
            <option value="Feature Request">Feature Request</option>
            <option value="General Feedback">General Feedback</option>
          </select>

          <label>Comments:</label>
          <textarea
            rows={5}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Enter your comments..."
            required
          />

          <button type="submit">Submit</button>
        </form>

        {message && <p className="feedback-message">{message}</p>}
      </div>
    </div>
  );
}

export default Feedback;
