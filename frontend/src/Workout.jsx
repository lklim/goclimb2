import { useEffect, useState } from "react";
import supabase from "./supabaseClient";
import "./Workout.css";

function Home() {
  const [workouts, setWorkouts] = useState([]);

  useEffect(() => {
    const fetchWorkouts = async () => {
      const { data, error } = await supabase
        .from("climber_workouts")
        .select("*");

      if (error) {
        console.error("Failed to load workouts:", error);
      } else {
        setWorkouts(data);
      }
    };

    fetchWorkouts();
  }, []);

  return (
    <section id="Home">
      <div className="container">
        <header className="header">
        
          <h1>Workouts</h1>
        </header>

        <div className="search">
          <input type="text" placeholder="Search" />
        </div>

        <h3>Popular Workouts</h3>
        <div className="popular-container" id="popularWorkouts">
          {/* Dynamic Cards from Supabase */}
        </div>

        <h3>Today Plan</h3>

        <div className="date-bar">
          <h3 id="currentMonthYear">2025</h3>
          <div className="dates" id="dateList">
            {/* Dates inserted by JS */}
          </div>
        </div>

        {/* Dynamic Cards from Supabase */}
        {workouts.map((workout) => (
          <WorkoutCard
            key={workout.id}
            name={workout.name}
            level={workout.level}
            summary={workout.summary}
            image={workout.image}
            progress={workout.progress}
            description={workout.description}
          />
        ))}
      </div>
    </section>
  );
}

function WorkoutCard({ name, level, summary, image, progress, description }) {
  const [showDesc, setShowDesc] = useState(false);

  return (
    <div className="workout-card white" onClick={() => setShowDesc(!showDesc)}>
      <img src={image || ""} alt={name} className="workout-img" />
      <div className="content">
        <div className="top-row">
          <h4>{name}</h4>
          <span className={`level ${level?.toLowerCase()}`}>{level}</span>
        </div>
        <p>{summary}</p>
        <div className="progress-bar">
          <div
            className="progress"
            style={{ width: progress ? `${progress}%` : "100%" }}
          ></div>
        </div>
        {description && showDesc && (
          <div className="description">{description}</div>
        )}
      </div>
    </div>
  );
}

export default Workout;
