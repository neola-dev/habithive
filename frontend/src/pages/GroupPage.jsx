import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ActivityFeed from "../components/ActivityFeed";
import AppShell from "../components/AppShell";
import { ArrowLeft, Trophy, ShieldCheck, Flame, Users, Calendar, Award, AlertCircle } from "lucide-react";
import confetti from "canvas-confetti";
import checkSound from "../assets/checkin.wav";
import "../styles/GroupPage.css";

function GroupPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [message, setMessage] = useState("");
  const [showFire, setShowFire] = useState(false);
  const [xp, setXp] = useState(0);
  const [showXp, setShowXp] = useState(false);
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  useEffect(() => {
    fetchGroup();
  }, [id]);

  const fetchGroup = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/groups/${id}`, {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });
      const data = await res.json();
      setGroup(data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleCheckin = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/checkins/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userInfo.token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message);
        return;
      }

      setMessage("Checked in Successfully ✅");

      confetti({
        particleCount: 120,
        spread: 120,
        startVelocity: 40,
        origin: { x: 0.5, y: 0.5 }
      });

      const end = Date.now() + 1000;
      const interval = setInterval(() => {
        if (Date.now() > end) return clearInterval(interval);

        confetti({
          particleCount: 60,
          spread: 80,
          origin: { x: Math.random(), y: Math.random() * 0.5 }
        });

        confetti({
          particleCount: 60,
          spread: 100,
          origin: { x: Math.random(), y: Math.random() * 0.5 }
        });

      }, 50);

      setShowFire(true);
      setXp(data.weeklyStreak);
      setShowXp(true);
      try {
        const audio = new Audio(checkSound);
        audio.play();
      } catch (err) {
        console.log("Sound play error:", err);
      }
      setTimeout(() => {
        setShowFire(false);
        setShowXp(false);
      }, 1000);
      fetchGroup();

    } catch (err) {
      console.log(err);
    }
  };

  if (!group) {
    return (
      <div className="loading-container-wrapper">
        <div className="loading-spinner-circle"></div>
        <p className="loading-spinner-text">Loading group hive...</p>
      </div>
    );
  }

  // Check if current user is checked in today
  const currentUserMember = group.members.find(
    (memb) => (memb.user?._id || memb.user || "").toString() === userInfo.id?.toString()
  );
  const isCheckedInToday = currentUserMember && currentUserMember.lastCheckin && 
    new Date(currentUserMember.lastCheckin).toDateString() === new Date().toDateString();

  return (
    <AppShell>
      <div className="group-page animate-fade-in" style={{ padding: 0 }}>
        {/* FIRE & XP OVERLAYS */}
        {showFire && (
          <div className="fire-effect" style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", fontSize: "70px", zIndex: 1100, pointerEvents: "none", animation: "bounce 0.5s infinite alternate" }}>
            🔥 Streak Active! 🔥
          </div>
        )}
        {showXp && (
          <div className="xp-popup" style={{ position: "fixed", top: "40%", left: "50%", transform: "translate(-50%, -50%)", fontSize: "32px", fontWeight: 800, color: "var(--color-primary)", zIndex: 1100, pointerEvents: "none" }}>
            +{xp} XP Unlocked
          </div>
        )}

        <button className="back-btn" onClick={() => navigate("/app")}>
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        {/* HERO SECTION */}
        <div style={{ background: "var(--color-bg-card)", border: "1px solid var(--color-border)", padding: "24px", borderRadius: "var(--radius-lg)", marginBottom: "24px", boxShadow: "var(--shadow-sm)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: 800, letterSpacing: "-0.01em" }}>{group.name}</h1>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "14px", marginTop: "4px" }}>{group.description}</p>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <button onClick={() => navigate(`/groups/${id}/leaderboard`)} className="primary-btn-battle" style={{ padding: "10px 18px" }}>
              <Trophy size={16} /> Leaderboard
            </button>
            <button 
              onClick={handleCheckin} 
              disabled={isCheckedInToday}
              className="success-btn" 
              style={{ padding: "10px 18px", opacity: isCheckedInToday ? 0.7 : 1, cursor: isCheckedInToday ? "not-allowed" : "pointer" }}
            >
              <ShieldCheck size={16} /> {isCheckedInToday ? "Checked In Today" : "Check-in Today"}
            </button>
          </div>
        </div>

        {message && (
          <div style={{ padding: "12px 16px", background: "var(--color-success-bg)", border: "1px solid var(--color-success)", borderRadius: "var(--radius-md)", color: "var(--color-success)", fontSize: "14px", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
            <CheckCircle size={16} />
            <span>{message}</span>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "24px" }} className="two-col-grid-dashboard">
          {/* MEMBERS LIST */}
          <div style={{ background: "var(--color-bg-card)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: "24px", boxShadow: "var(--shadow-sm)" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Users size={18} /> Group Members Rankings
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[...group.members]
                .sort((a, b) => {
                  const today = new Date();
                  today.setHours(0,0,0,0);

                  const aActive = a.lastCheckin && new Date(a.lastCheckin) >= today;
                  const bActive = b.lastCheckin && new Date(b.lastCheckin) >= today;

                  if (aActive !== bActive) return bActive - aActive;
                  if (b.weeklyStreak !== a.weeklyStreak) return b.weeklyStreak - a.weeklyStreak;

                  if (a.lastCheckin && b.lastCheckin) {
                    return new Date(b.lastCheckin) - new Date(a.lastCheckin);
                  }

                  return a.user.name.localeCompare(b.user.name);
                })
                .map((m, index) => {
                  const rankIcons = ["🥇", "🥈", "🥉"];
                  const isCurrentUser = (m.user?._id || m.user || "").toString() === userInfo.id?.toString();
                  return (
                    <div 
                      key={m.user._id} 
                      style={{ 
                        display: "flex", 
                        justifyContent: "space-between", 
                        alignItems: "center", 
                        padding: "12px var(--space-md)", 
                        background: isCurrentUser ? "var(--color-primary-light)" : "var(--color-bg-base)", 
                        border: isCurrentUser ? "1px solid rgba(255, 107, 0, 0.15)" : "1px solid var(--color-border)",
                        borderRadius: "var(--radius-md)"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span style={{ fontSize: "14px", fontWeight: 800, width: "24px" }}>
                          {index < 3 ? rankIcons[index] : `#${index + 1}`}
                        </span>
                        <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--color-text-primary)" }}>
                          {m.user.name} {isCurrentUser && " (You)"}
                        </span>
                      </div>
                      
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        {m.status === "missed" && (
                          <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--color-error)", background: "var(--color-error-bg)", padding: "4px 8px", borderRadius: "99px" }}>
                            🔴 Missed
                          </span>
                        )}
                        {m.status === "active" && (
                          <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-success)", background: "var(--color-success-bg)", padding: "4px 8px", borderRadius: "99px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                            <Flame size={12} fill="var(--color-success)" /> {m.weeklyStreak}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* ACTIVITY FEED */}
          <div style={{ background: "var(--color-bg-card)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: "24px", boxShadow: "var(--shadow-sm)" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Calendar size={18} /> Activity Log
            </h3>
            <div className="activity-feed-container">
              <ActivityFeed groupId={id} />
            </div>
          </div>
        </div>  
      </div>
    </AppShell>
  );
}

export default GroupPage;