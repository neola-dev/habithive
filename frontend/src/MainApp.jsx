import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "./components/AppShell";
import { Plus, Swords, ShieldCheck, Flame, Users, Calendar, ArrowRight, Share2, MessageCircle, X, Award, CheckCircle, Zap } from "lucide-react";
import confetti from "canvas-confetti";
import checkSound from "./assets/checkin.wav";
import "./App.css";

function MainApp() {
  const navigate = useNavigate();

  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDesc, setNewGroupDesc] = useState("");
  const [badges, setBadges] = useState([]);
  const [activeBattle, setActiveBattle] = useState(null);
  const [copied, setCopied] = useState(null);

  // New states for dynamic leaderboard preview and activity feed of the active group
  const [leaderboard, setLeaderboard] = useState([]);
  const [activities, setActivities] = useState([]);
  const [activeGroupIndex, setActiveGroupIndex] = useState(0);

  // Modal & Battle states
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isBattleModalOpen, setIsBattleModalOpen] = useState(false);
  const [myCreatedGroups, setMyCreatedGroups] = useState([]);
  const [battleSelectedGroup, setBattleSelectedGroup] = useState("");
  const [battleInviteLink, setBattleInviteLink] = useState("");
  const [battleCopied, setBattleCopied] = useState(false);

  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");

  // 🔐 Redirect if not logged in
  useEffect(() => {
    if (!userInfo?.token) {
      navigate("/");
    }
  }, [userInfo, navigate]);

  // 🚀 Initial API calls
  useEffect(() => {
    if (!userInfo?.token) return;

    fetchGroups();
    fetchActiveBattle();
    fetchBadges();
    fetchMyCreatedGroups();
  }, [userInfo]);

  // Fetch leaderboard and activities when groups are loaded or the active group selection changes
  useEffect(() => {
    if (groups.length === 0) return;
    const groupId = groups[activeGroupIndex]?._id;
    if (!groupId) return;

    fetchLeaderboard(groupId);
    fetchActivities(groupId);
  }, [groups, activeGroupIndex]);

  // ================= API CALLS =================

  const fetchGroups = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/groups`, {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });

      if (!res.ok) {
        console.log("Groups fetch failed:", res.status);
        return;
      }

      const data = await res.json();
      setGroups(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyCreatedGroups = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/groups/my-created`,
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );
      const data = await res.json();
      setMyCreatedGroups(data || []);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchBadges = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/badges`, {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });

      if (!res.ok) {
        console.log("Badges fetch failed:", res.status);
        return;
      }

      const data = await res.json();
      setBadges(data.badges || []);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchActiveBattle = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/battles/active-battle`, {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });

      if (!res.ok) {
        console.log("Active battle not found:", res.status);
        setActiveBattle(null);
        return;
      }

      const data = await res.json();
      setActiveBattle(data);
    } catch (err) {
      console.log(err);
      setActiveBattle(null);
    }
  };

  const fetchLeaderboard = async (groupId) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/groups/${groupId}/leaderboard?type=weekly`, {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setLeaderboard(data.leaderboard || []);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const fetchActivities = async (groupId) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/activity/${groupId}`, {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setActivities(data || []);
      }
    } catch (err) {
      console.log(err);
    }
  };

  // ================= ACTIONS =================

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/groups`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userInfo.token}`,
        },
        body: JSON.stringify({
          name: newGroupName,
          description: newGroupDesc,
        }),
      });

      if (!res.ok) {
        console.log("Create group failed:", res.status);
        return;
      }

      const data = await res.json();
      setGroups((prev) => [...prev, data]);

      setNewGroupName("");
      setNewGroupDesc("");
      setIsGroupModalOpen(false);
      fetchMyCreatedGroups();
    } catch (error) {
      console.log(error);
    }
  };

  const handleCreateBattle = async () => {
    if (!battleSelectedGroup) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/battles/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userInfo.token}`
        },
        body: JSON.stringify({ groupA: battleSelectedGroup })
      });
      const data = await res.json();
      setBattleInviteLink(`https://habithive-mu.vercel.app${data.inviteLink}`);
      fetchActiveBattle();
    } catch (err) {
      console.log(err);
    }
  };

  const handleCopyBattleInvite = () => {
    navigator.clipboard.writeText(battleInviteLink);
    setBattleCopied(true);
    setTimeout(() => setBattleCopied(false), 2000);
  };

  const handleCopy = (link, id) => {
    navigator.clipboard.writeText(link);
    setCopied(id);
    setTimeout(() => {
      setCopied(null);
    }, 2000);
  };

  const handleCheckin = async (groupId) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/checkins/${groupId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userInfo.token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to check-in");
        return;
      }

      try {
        const audio = new Audio(checkSound);
        audio.play();
      } catch (err) {
        console.log("Audio play failed:", err);
      }
      
      confetti({
        particleCount: 120,
        spread: 100,
        origin: { y: 0.6 }
      });

      fetchGroups();
    } catch (err) {
      console.log("Check-in error:", err);
    }
  };

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return "Good Morning 🌅";
    if (hr < 17) return "Good Afternoon ☀️";
    return "Good Evening 👋";
  };

  if (loading) {
    return (
      <div className="loading-container-wrapper">
        <div className="loading-spinner-circle"></div>
        <p className="loading-spinner-text">Loading your hive...</p>
      </div>
    );
  }

  // Calculate actual progress based on group check-ins
  const completedToday = groups.filter(g => {
    const m = g.members.find(memb => (memb.user?._id || memb.user || "").toString() === userInfo.id?.toString());
    return m && m.lastCheckin && new Date(m.lastCheckin).toDateString() === new Date().toDateString();
  }).length;

  const totalHabits = groups.length;
  const todayProgressPercent = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

  const getProgressGreeting = () => {
    if (totalHabits === 0) return "Create a group to start tracking habits!";
    if (completedToday === 0) return "Let's complete your first habit today!";
    if (completedToday === totalHabits) return "Incredible! You completed all habits today! 🏆";
    return "Keep it up! Complete the rest of your habits today.";
  };

  // Calculate Streak dynamically from group memberships
  const currentStreak = groups.length > 0 ? Math.max(...groups.map(g => {
    const m = g.members.find(memb => (memb.user?._id || memb.user || "").toString() === userInfo.id?.toString());
    return m ? (m.weeklyStreak || 0) : 0;
  }), 0) : 0;

  // Calculate habits completed dynamically from group check-in records
  const habitsCompleted = groups.reduce((acc, g) => {
    const m = g.members.find(memb => (memb.user?._id || memb.user || "").toString() === userInfo.id?.toString());
    if (m) {
      return acc + (m.successfulWeeks * 7) + (m.weeklyStreak || 0);
    }
    return acc;
  }, 0);

  const isCheckedInToday = (group) => {
    const m = group.members.find(memb => (memb.user?._id || memb.user || "").toString() === userInfo.id?.toString());
    return !!(m && m.lastCheckin && new Date(m.lastCheckin).toDateString() === new Date().toDateString());
  };

  return (
    <AppShell>
      <div className="dashboard-layout animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        
        {/* COMPACT WELCOME HEADER / HERO */}
        <div className="hero-section animate-slide-up">
          <div className="hero-header">
            <div>
              <span className="hero-welcome-subtitle">
                {getGreeting()} ☀️
              </span>
              <h1 className="hero-welcome-title">
                Welcome back, {userInfo?.name || "Neola"}!
              </h1>
              <p className="hero-tagline">
                Keep your momentum going. Make this a great day.
              </p>
            </div>
            
            {/* TODAY PROGRESS PILL */}
            <div className="hero-progress-container" style={{ minWidth: "260px" }}>
              <div className="hero-progress-label">
                <span>Today's Progress</span>
                <strong>{todayProgressPercent}%</strong>
              </div>
              <div className="hero-progress-bar-bg">
                <div className="hero-progress-bar-fill" style={{ width: `${todayProgressPercent}%` }}></div>
              </div>
              <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", display: "block", marginTop: "6px" }}>
                {totalHabits > 0 ? `${completedToday} of ${totalHabits} habits completed` : getProgressGreeting()}
              </span>
            </div>
          </div>
        </div>

        {/* QUICK STATS */}
        <div className="stats-grid-modern animate-slide-up">
          <div className="stat-card-modern stat-streak">
            <div className="stat-icon-wrapper-modern">🔥</div>
            <div className="stat-info-modern">
              <span className="stat-value-modern">{currentStreak} {currentStreak === 1 ? 'Day' : 'Days'}</span>
              <span className="stat-label-modern">Current Streak</span>
            </div>
          </div>
          <div className="stat-card-modern stat-success">
            <div className="stat-icon-wrapper-modern">✓</div>
            <div className="stat-info-modern">
              <span className="stat-value-modern">{habitsCompleted}</span>
              <span className="stat-label-modern">Total Check-ins</span>
            </div>
          </div>
          <div className="stat-card-modern stat-navy">
            <div className="stat-icon-wrapper-modern">👥</div>
            <div className="stat-info-modern">
              <span className="stat-value-modern">{groups.length}</span>
              <span className="stat-label-modern">Active Groups</span>
            </div>
          </div>
          <div className="stat-card-modern stat-streak">
            <div className="stat-icon-wrapper-modern">⚔</div>
            <div className="stat-info-modern">
              <span className="stat-value-modern">{activeBattle ? 1 : 0}</span>
              <span className="stat-label-modern">Active Battles</span>
            </div>
          </div>
        </div>

        {/* MAIN SECTION: TODAY'S HABITS */}
        <div>
          <div className="card-title-row">
            <h2 style={{ fontSize: "20px", fontWeight: 700 }}>Today's Habit Checklist</h2>
            <div style={{ display: "flex", gap: "10px" }}>
              <button className="primary-btn-battle" style={{ padding: "8px 16px", fontSize: "13px" }} onClick={() => setIsGroupModalOpen(true)}>
                <Plus size={16} /> Create Group
              </button>
              <button className="success-btn" style={{ padding: "8px 16px", fontSize: "13px" }} onClick={() => setIsBattleModalOpen(true)}>
                <Swords size={16} /> Challenge Group
              </button>
            </div>
          </div>

          {groups.length === 0 ? (
            <div className="empty-state-modern">
              <div className="empty-state-icon">🐝</div>
              <div className="empty-state-title">No habits found</div>
              <div className="empty-state-description">Join or create a group habit to start your daily consistency path.</div>
              <button className="primary-btn-battle" onClick={() => setIsGroupModalOpen(true)}>
                Create Group Habit
              </button>
            </div>
          ) : (
            <div className="habit-list-modern">
              {groups.map((group) => {
                const checkedIn = isCheckedInToday(group);
                return (
                  <div key={group._id} className="habit-row-modern">
                    <div className="habit-row-info">
                      <div 
                        className={`habit-checkmark ${checkedIn ? "completed" : ""}`}
                        onClick={() => !checkedIn && handleCheckin(group._id)}
                      >
                        {checkedIn && <ShieldCheck size={18} />}
                      </div>
                      <div className="habit-text-container">
                        <span className="habit-name-modern">{group.name}</span>
                        <span className="habit-desc-modern">{group.description || "Daily accountability group"}</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      {checkedIn ? (
                        <span className="habit-completed-tag">Checked in today</span>
                      ) : (
                        <button className="habit-action-btn" onClick={() => handleCheckin(group._id)}>
                          Check-in →
                        </button>
                      )}
                      <button className="habit-action-btn" style={{ borderStyle: "dashed" }} onClick={() => navigate(`/group/${group._id}`)}>
                        Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* GRID OF GROUPS AND ACTIVE BATTLES */}
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "24px", marginTop: "12px" }} className="two-col-grid-dashboard">
          
          {/* GROUPS LIST */}
          <div style={{ background: "var(--color-bg-card)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: "24px", display: "flex", flexDirection: "column", gap: "16px", boxShadow: "var(--shadow-sm)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 700 }}>Your Habit Groups</h3>
              <span className="badge-pill badge-orange" style={{ padding: "2px 8px", fontSize: "11px" }}>{groups.length} active</span>
            </div>

            {groups.length === 0 ? (
              <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", textAlign: "center", padding: "24px" }}>No groups yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {groups.map((group) => (
                  <div key={group._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "var(--color-bg-subtle)", borderRadius: "var(--radius-md)", border: "1.5px solid var(--color-border)", transition: "all var(--t-fast)" }}>
                    <div>
                      <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--color-text-primary)" }}>{group.name}</span>
                      <div style={{ display: "flex", gap: "12px", marginTop: "2px", fontSize: "11px", color: "var(--color-text-secondary)" }}>
                        <span>👥 {group.members.length} Members</span>
                        <span>👑 {group.creator?.name || "You"}</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button className="habit-action-btn" onClick={() => navigate(`/group/${group._id}`)}>
                        Open
                      </button>
                      <button 
                        className={`habit-action-btn ${copied === group._id ? "copied" : ""}`}
                        onClick={() => handleCopy(group.inviteLink, group._id)}
                      >
                        {copied === group._id ? "Copied" : "Invite"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* STREAK MOMENTUM PANEL & ACTIVE BATTLES */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Streak Momentum Panel (Navy) */}
            <div className="navy-card" style={{ display: "flex", flexDirection: "column", gap: "12px", position: "relative", overflow: "hidden" }}>
              <div className="section-label" style={{ color: "rgba(255, 255, 255, 0.4)" }}>Streak Momentum</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                <span className="streak-number" style={{ fontSize: "40px" }}>{currentStreak}</span>
                <span className="streak-flame" style={{ fontSize: "28px" }}>🔥</span>
                <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px", fontWeight: 700 }}>
                  {currentStreak === 1 ? 'DAY' : 'DAYS'}
                </span>
              </div>
              <p style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "12px", margin: 0 }}>
                {currentStreak >= 3 ? "Fantastic momentum! Keep keeping it lit." : "Keep going. Your next streak milestone is 3 days."}
              </p>
              <div style={{ height: "6px", background: "rgba(255, 255, 255, 0.1)", borderRadius: "99px", overflow: "hidden", marginTop: "4px" }}>
                <div style={{ height: "100%", background: "var(--hh-orange)", width: `${Math.min((currentStreak / 3) * 100, 100)}%`, transition: "width 0.4s ease" }}></div>
              </div>
            </div>

            {/* Battle Card */}
            {activeBattle ? (
              <div className="surface-card active-battle-container" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div className="card-title-row" style={{ margin: 0 }}>
                  <span className="section-label">Active Group Battle</span>
                  <span className="badge-pill badge-orange">LIVE</span>
                </div>
                
                <div style={{ background: "var(--color-bg-subtle)", padding: "12px", borderRadius: "var(--radius-md)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: 700, marginBottom: "4px" }}>
                    <span style={{ color: "var(--color-info)" }}>{activeBattle.groupA?.name || "Team A"}</span>
                    <span style={{ color: "var(--hh-orange)" }}>{activeBattle.groupB?.name || "Team B"}</span>
                  </div>
                  <div style={{ textAlign: "center", fontSize: "13px", fontWeight: 700, color: "var(--hh-mint)", marginTop: "4px" }}>
                    🏆 Leading by {activeBattle.leadScore}
                  </div>
                </div>

                <button className="primary-btn-battle" style={{ width: "100%" }} onClick={() => navigate("/battles")}>
                  Open Battles Hub
                </button>
              </div>
            ) : (
              <div className="surface-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", padding: "20px", textAlign: "center" }}>
                <span style={{ fontSize: "28px" }}>⚔️</span>
                <span className="empty-state-title" style={{ fontSize: "14px", fontWeight: 700 }}>No Active Battles</span>
                <p className="empty-state-description" style={{ fontSize: "12px", color: "var(--color-text-secondary)", margin: 0 }}>Challenge another group to a consistency test.</p>
                <button className="primary-btn-battle" style={{ padding: "8px 16px", fontSize: "12px", width: "100%", marginTop: "4px" }} onClick={() => setIsBattleModalOpen(true)}>
                  Challenge Group
                </button>
              </div>
            )}
          </div>
        </div>

        {/* LEADERBOARD PREVIEW & RECENT ACTIVITY SWITCHER OR MERGED SECTION */}
        {groups.length > 0 && (
          <div className="surface-card accent-navy" style={{ padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 900, fontFamily: "var(--font-heading)" }}>Group Activity & Leaderboards</h3>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-text-secondary)" }}>Active Preview:</span>
                <select
                  value={activeGroupIndex}
                  onChange={(e) => setActiveGroupIndex(Number(e.target.value))}
                  style={{ padding: "6px 12px", borderRadius: "var(--radius-sm)", border: "1.5px solid var(--color-border)", fontSize: "12px", outline: "none", background: "white", fontWeight: 600 }}
                >
                  {groups.map((g, idx) => (
                    <option key={g._id} value={idx}>{g.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }} className="two-col-grid-dashboard">
              
              {/* LEADERBOARD PREVIEW */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <h4 style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Top Performers</h4>
                {leaderboard.length === 0 ? (
                  <p style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>No leaderboard data available.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {leaderboard.slice(0, 3).map((item, idx) => (
                      <div key={item.user?._id || idx} style={{ display: "flex", justifyContent: "space-between", padding: "10px 12px", background: "var(--color-bg-subtle)", borderRadius: "var(--radius-md)", fontSize: "13px", border: "1px solid var(--color-border)", transition: "all var(--t-fast)" }}>
                        <span style={{ fontWeight: 600, color: "var(--color-text-primary)" }}>
                          <span style={{ marginRight: "8px" }}>
                            {idx === 0 ? "🏆" : idx === 1 ? "🥈" : "🥉"}
                          </span>
                          {item.user?.name || "Member"}
                        </span>
                        <span style={{ color: "var(--hh-orange)", fontWeight: 800 }}>🔥 {item.weeklyStreak || 0}</span>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  className="habit-action-btn"
                  onClick={() => {
                    if (groups.length > 0) {
                      navigate(`/groups/${groups[activeGroupIndex]._id}/leaderboard`);
                    }
                  }}
                  disabled={groups.length === 0}
                  style={{ alignSelf: "flex-start", marginTop: "4px" }}
                >
                  View Full Leaderboard
                </button>
              </div>

              {/* RECENT ACTIVITY */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <h4 style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Live Activity Feed</h4>
                {activities.length === 0 ? (
                  <p style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>No recent activity.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {activities.slice(0, 3).map((act) => (
                      <div key={act._id} style={{ padding: "10px 12px", background: "var(--color-bg-subtle)", borderRadius: "var(--radius-md)", fontSize: "12px", border: "1px solid var(--color-border)", color: "var(--color-text-secondary)" }}>
                        {act.message}
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* ACHIEVEMENTS */}
        <div className="surface-card accent-orange" style={{ padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 900, fontFamily: "var(--font-heading)" }}>🏆 Unlocked Badges</h3>
            <span className="badge-pill badge-orange" style={{ padding: "2px 8px", fontSize: "11px" }}>{badges.length} Unlocked</span>
          </div>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {badges.length === 0 ? (
              <p style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>Stay consistent to unlock achievements and badges.</p>
            ) : (
              badges.map((b) => (
                <div key={b.value} className="badge-pill badge-orange" style={{ padding: "8px 16px", fontSize: "13px", borderRadius: "var(--radius-md)" }}>
                  <Award size={16} />
                  <span>{b.title}</span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* CREATE GROUP MODAL */}
      {isGroupModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsGroupModalOpen(false)}>
          <div className="modal-content animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Create Habit Group</span>
              <button className="modal-close" onClick={() => setIsGroupModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "12px", fontWeight: 600 }}>Group Name</label>
                <input
                  type="text"
                  className="form-input"
                  style={{ width: "100%", margin: 0 }}
                  placeholder="e.g. Daily DSA Practice"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "12px", fontWeight: 600 }}>Description</label>
                <input
                  type="text"
                  className="form-input"
                  style={{ width: "100%", margin: 0 }}
                  placeholder="e.g. Build habits together and share streaks"
                  value={newGroupDesc}
                  onChange={(e) => setNewGroupDesc(e.target.value)}
                />
              </div>
              <button className="primary-btn-battle" style={{ width: "100%", marginTop: "8px" }} onClick={handleCreateGroup} disabled={!newGroupName.trim()}>
                Create Group
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE BATTLE MODAL */}
      {isBattleModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsBattleModalOpen(false)}>
          <div className="modal-content animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Challenge a Group</span>
              <button className="modal-close" onClick={() => setIsBattleModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <p style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>
                You can challenge other groups to compete in daily consistency. Choose a group you own to start.
              </p>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "12px", fontWeight: 600 }}>Select Your Group</label>
                {myCreatedGroups.length === 0 ? (
                  <p style={{ fontSize: "13px", color: "var(--color-error)", fontStyle: "italic" }}>
                    You don't own any groups yet. Create one first!
                  </p>
                ) : (
                  <select
                    className="battle-select"
                    style={{ width: "100%", outline: "none" }}
                    value={battleSelectedGroup}
                    onChange={(e) => setBattleSelectedGroup(e.target.value)}
                  >
                    <option value="">Choose group...</option>
                    {myCreatedGroups.map((group) => (
                      <option key={group._id} value={group._id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {battleInviteLink && (
                <div style={{ background: "var(--color-bg-base)", padding: "12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)", marginTop: "4px" }}>
                  <span style={{ fontSize: "11px", color: "var(--color-text-muted)", display: "block", marginBottom: "4px" }}>Battle Invite Link:</span>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <input 
                      type="text" 
                      readOnly 
                      value={battleInviteLink} 
                      style={{ flex: 1, padding: "6px 8px", fontSize: "12px", border: "1px solid var(--color-border)", borderRadius: "4px", background: "white" }} 
                    />
                    <button className="habit-action-btn" onClick={handleCopyBattleInvite}>
                      {battleCopied ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <button 
                    className="success-btn" 
                    style={{ width: "100%", marginTop: "10px", padding: "8px 12px", fontSize: "12px" }}
                    onClick={() => {
                      const text = `🔥 Join our Habit Battle! ⚔️\n${battleInviteLink}`;
                      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
                    }}
                  >
                    Share on WhatsApp
                  </button>
                </div>
              )}

              {!battleInviteLink && (
                <button 
                  className="primary-btn-battle" 
                  style={{ width: "100%", marginTop: "8px" }} 
                  onClick={handleCreateBattle} 
                  disabled={!battleSelectedGroup}
                >
                  Create Battle Challenge
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

export default MainApp;