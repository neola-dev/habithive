// src/pages/LeaderboardPage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../styles/leaderboardPage.css"; // Import CSS file

const rankColors = ["gold-badge", "silver-badge", "bronze-badge"]; // CSS classes for top 3

const LeaderboardPage = () => {
  const { groupId } = useParams();
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentUserRank,setcurrentUserRank]=useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(""); // Track errors
  const [type, setType] = useState("weekly");

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const currentUserId = userInfo?.id || ""; // logged-in user id
  console.log(userInfo); 
  console.log(leaderboard);
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const token = userInfo?.token;
        const res = await fetch(
          `http://localhost:5000/api/groups/${groupId}/leaderboard?type=${type}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const text = await res.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error(
            "Server did not return valid JSON. Got HTML or error page instead."
          );
        }

        if (!res.ok) {
          throw new Error(data.message || "Failed to fetch leaderboard");
        }

        setLeaderboard(data.leaderboard || []);
        setcurrentUserRank(data.currentUserRank);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [groupId, type]);

  if (loading) return <div className="leaderboard-loading">Loading leaderboard...</div>;
  if (error) return <div className="leaderboard-loading text-red-500">{error}</div>;

  

  // Set label and field based on type
  let streakLabel = "";
  let streakField = "";
  if (type === "weekly") {
    streakLabel = "Weekly Streaks";
    streakField = "weeklyStreak";
  } else if (type === "monthly") {
    streakLabel = "Monthly Check-ins";
    streakField = "monthlyCheckins";
  } else {
    streakLabel = "Total Successful Weeks";
    streakField = "successfulWeeks";
  }
 
  const today = new Date();
  today.setHours(0,0,0,0);

  const sortedLeaderboard = leaderboard.map((u) => ({
    ...u,
    activeToday: u.lastCheckin && new Date(u.lastCheckin) >= today
  }))
  .sort((a, b) => {
    if (a.activeToday !== b.activeToday) return b.activeToday - a.activeToday;
    if (b[streakField] !== a[streakField]) return b[streakField] - a[streakField];
    if (a.lastCheckin && b.lastCheckin) return new Date(b.lastCheckin) - new Date(a.lastCheckin);
    return a.name.localeCompare(b.name);
  });

  sortedLeaderboard.forEach((u, idx) => u.rank = idx + 1);

  const topThree = sortedLeaderboard.slice(0, 3);
  const rest = sortedLeaderboard.slice(3);
  return (
    <div className="leaderboard-container bg-cont">
      <h1 className="leaderboard-title">
        {type.charAt(0).toUpperCase() + type.slice(1)} Leaderboard
      </h1>

      {/* Tabs */}
      <div className="leaderboard-tabs">
        {["weekly", "monthly", "lifetime"].map((t) => (
          <button
            key={t}
            className={type === t ? "active" : ""}
            onClick={() => setType(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Top 3 Cards */}
      <div className="top-three-grid">
        {topThree.map((user, index) => (
          <div
            key={user.userId}
            className={`top-card ${
              index === 0 ? "first-card" : index === 1 ? "second-card" : "third-card"
            } ${String(user.userId) === String(currentUserId) ? "current-user-card" : ""}`}
          >
            <div className={`rank-badge ${rankColors[index]}`}>{user.rank}</div>
            <div className="user-name">{user.name}</div>
            <div className="streaks">
              <div>
                <div className="streak-label">{streakLabel}</div>
                <div className="weekly">{user[streakField]}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Rest of leaderboard as table */}
      {rest.length > 0 && (
        <div className="table-container">
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Name</th>
                <th>{streakLabel}</th>
              </tr>
            </thead>
            <tbody>
              {rest.map((user) => (
                <tr
                  key={user.userId}
                  className={String(user.userId) === String(currentUserId) ? "current-user-row" : ""}
                >
                  <td>{user.rank}</td>
                  <td>{user.name}</td>
                  <td>{user[streakField]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <br />
      {currentUserRank && currentUserRank.rank > 10 && (
        <div className="table-container">
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>Your Rank</th>
                <th>Name</th>
                <th>{streakLabel}</th>
              </tr>
            </thead>
            <tbody>
              <tr
                key={currentUserRank.userId}
                className="current-user-row"
              >
                <td>{currentUserRank.rank}</td>
                <td>{currentUserRank.name}</td>
                <td>{currentUserRank[streakField]}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LeaderboardPage;