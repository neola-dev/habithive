// src/pages/LeaderboardPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AppShell from "../components/AppShell";
import { ArrowLeft, Trophy, Flame, Calendar, Award } from "lucide-react";
import "../styles/leaderboardPage.css"; 

const rankColors = ["gold-badge", "silver-badge", "bronze-badge"]; 

const LeaderboardPage = () => {
  const navigate = useNavigate();
  const { groupId } = useParams();
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentUserRank, setcurrentUserRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(""); 
  const [type, setType] = useState("weekly");

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const currentUserId = userInfo?.id || ""; 

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const token = userInfo?.token;
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/groups/${groupId}/leaderboard?type=${type}`,
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

  if (loading) {
    return (
      <div className="loading-container-wrapper">
        <div className="loading-spinner-circle"></div>
        <p className="loading-spinner-text">Loading group leaderboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="loading-container-wrapper" style={{ color: 'var(--color-error)' }}>
        <p>{error}</p>
      </div>
    );
  }

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
  today.setHours(0, 0, 0, 0);

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

  const rankIcons = ["🥇", "🥈", "🥉"];

  return (
    <AppShell>
      <div className="leaderboard-page animate-fade-in" style={{ padding: 0 }}>
        <button className="back-btn" onClick={() => navigate(`/group/${groupId}`)}>
          <ArrowLeft size={16} /> Back to Group
        </button>
        <div className="lb-hero animate-slide-up" style={{ padding: "0 0 16px" }}>
          <h1 style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
            🏆 <span>LEADERBOARD</span>
          </h1>
          <p>Compete with your hive. Stay consistent. Climb the ranks.</p>
        </div>

        {/* Tab buttons */}
        <div className="leaderboard-tabs" style={{ marginBottom: "24px" }}>
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

        {/* Dynamic content depending on single-user vs multi-user */}
        {sortedLeaderboard.length === 1 ? (
          <div className="animate-scale-in" style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "560px", margin: "0 auto" }}>
            <div className="your-rank-box" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", padding: "32px", textAlign: "center" }}>
              <div style={{ fontSize: "40px" }}>🏆</div>
              <div className="your-rank-avatar" style={{ margin: "0 auto" }}>
                {sortedLeaderboard[0].name.charAt(0).toUpperCase()}
              </div>
              <h2 style={{ color: "#FFFFFF", fontFamily: "var(--font-heading)", fontSize: "22px", fontWeight: 800 }}>
                {sortedLeaderboard[0].name}
              </h2>
              <div style={{ display: "flex", gap: "24px", margin: "8px 0" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <span style={{ fontSize: "28px", fontWeight: 900, color: "var(--hh-orange)" }}>
                    {sortedLeaderboard[0][streakField]}
                  </span>
                  <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "1px" }}>
                    {streakLabel}
                  </span>
                </div>
              </div>
              <div style={{ color: "var(--hh-mint-400)", fontWeight: 700, fontSize: "14px" }}>
                🔥 YOU'RE CURRENTLY #1
              </div>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "13px", maxWidth: "340px", margin: "8px 0 0" }}>
                You're the first one in the hive! 🐝<br />Invite friends and start competing.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Podium — Top 3 */}
            {topThree.length > 0 && (
              <div className="podium-section" style={{ maxWidth: "720px", margin: "0 auto 32px" }}>
                {/* 2nd Place */}
                {topThree[1] ? (
                  <div className={`top-card second-card ${String(topThree[1].userId) === String(currentUserId) ? "current-user-card" : ""}`}>
                    <div className="rank-badge silver-badge">2</div>
                    <div className="user-name">
                      {topThree[1].name}
                      {topThree[1].activeToday && <span className="active-dot" />}
                    </div>
                    <div className="streaks">
                      <div className="streak-chip">
                        <span className="streak-label">{streakLabel}</span>
                        <span className="lifetime" style={{ color: "var(--hh-navy-500)" }}>{topThree[1][streakField]}</span>
                      </div>
                    </div>
                  </div>
                ) : <div />}

                {/* 1st Place */}
                {topThree[0] ? (
                  <div className={`top-card first-card ${String(topThree[0].userId) === String(currentUserId) ? "current-user-card" : ""}`}>
                    <span className="top-card-crown">👑</span>
                    <div className="rank-badge gold-badge">1</div>
                    <div className="user-name">
                      {topThree[0].name}
                      {topThree[0].activeToday && <span className="active-dot" />}
                    </div>
                    <div className="streaks">
                      <div className="streak-chip">
                        <span className="streak-label">{streakLabel}</span>
                        <span className="weekly">{topThree[0][streakField]}</span>
                      </div>
                    </div>
                  </div>
                ) : <div />}

                {/* 3rd Place */}
                {topThree[2] ? (
                  <div className={`top-card third-card ${String(topThree[2].userId) === String(currentUserId) ? "current-user-card" : ""}`}>
                    <div className="rank-badge bronze-badge">3</div>
                    <div className="user-name">
                      {topThree[2].name}
                      {topThree[2].activeToday && <span className="active-dot" />}
                    </div>
                    <div className="streaks">
                      <div className="streak-chip">
                        <span className="streak-label">{streakLabel}</span>
                        <span className="lifetime" style={{ color: "var(--hh-mint)" }}>{topThree[2][streakField]}</span>
                      </div>
                    </div>
                  </div>
                ) : <div />}
              </div>
            )}

            {/* Rest as list */}
            {rest.length > 0 ? (
              <div className="table-container animate-slide-up">
                <table className="leaderboard-table">
                  <thead>
                    <tr>
                      <th style={{ width: "80px" }}>Rank</th>
                      <th>User</th>
                      <th>{streakLabel}</th>
                      <th style={{ width: "140px", textAlign: "right" }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rest.map((user) => {
                      const isCurrentUser = String(user.userId) === String(currentUserId);
                      return (
                        <tr
                          key={user.userId}
                          className={isCurrentUser ? "current-user-row" : ""}
                        >
                          <td style={{ fontWeight: 800 }}>#{user.rank}</td>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 600 }}>
                              {user.name} {isCurrentUser && <span className="badge-pill badge-orange" style={{ padding: "2px 8px", fontSize: "10px" }}>You</span>}
                            </div>
                          </td>
                          <td style={{ fontWeight: 800, color: "var(--hh-orange)" }}>{user[streakField]}</td>
                          <td style={{ textAlign: "right" }}>
                            {user.activeToday ? (
                              <span className="badge-pill badge-mint" style={{ fontSize: "11px" }}>Active Today</span>
                            ) : (
                              <span style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>Offline</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              topThree.length === 0 && (
                <div className="empty-state-modern">
                  <span className="empty-state-icon">🏆</span>
                  <span className="empty-state-title">No participants yet</span>
                  <p className="empty-state-description">Add users or start checking in to see leaderboard standings.</p>
                </div>
              )
            )}
          </>
        )}

        {/* Your rank if > 10 */}
        {currentUserRank && currentUserRank.rank > 10 && (
          <div className="your-rank-box animate-slide-up" style={{ marginTop: "24px" }}>
            <div className="your-rank-left">
              <div className="your-rank-avatar">
                {currentUserRank.name.charAt(0).toUpperCase()}
              </div>
              <div className="your-rank-info">
                <span className="your-rank-label">Your Position</span>
                <span className="your-rank-name">{currentUserRank.name} (You)</span>
              </div>
            </div>
            <div className="your-rank-stats">
              <div className="your-rank-stat">
                <span className="your-rank-stat-value">#{currentUserRank.rank}</span>
                <span className="your-rank-stat-label">Rank</span>
              </div>
              <div className="your-rank-stat">
                <span className="your-rank-stat-value mint-value">{currentUserRank[streakField]}</span>
                <span className="your-rank-stat-label">{streakLabel}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default LeaderboardPage;