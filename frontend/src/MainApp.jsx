import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  }, [userInfo]);

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
    } catch (error) {
      console.log(error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    navigate("/");
  };

  const handleCopy = (link, id) => {
    navigator.clipboard.writeText(link);

    setCopied(id);

    setTimeout(() => {
      setCopied(null);
    }, 2000);
  };

  // ================= UI =================

  if (loading) {
    return <h2 style={{ padding: "20px" }}>Loading...</h2>;
  }

  return (
    <div className="dashboard">
      {/* NAVBAR */}
      <div className="navbar">
        <div className="navbar-left">
          <span className="app-name">HabitHive</span>
        </div>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>

      {/* Welcome */}
      <div className="top-bar">
        <h1>Welcome {userInfo?.name} 👋</h1>
      </div>

      {/* Achievements */}
      <div className="section">
        <h3>🏆 My Achievements</h3>
        <div className="badges">
          {badges.length === 0 ? (
            <p>No badges yet. Stay consistent! 🔥</p>
          ) : (
            badges.map((b) => (
              <span key={b.value} className="badge">
                {b.title}
              </span>
            ))
          )}
        </div>
      </div>

      {/* Cards */}
      <div className="card-row">
        {/* Create Group */}
        <div className="card create-group-card">
          <h3>Create New Group</h3>
          <input
            type="text"
            placeholder="Group name"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Description"
            value={newGroupDesc}
            onChange={(e) => setNewGroupDesc(e.target.value)}
          />
          <button className="primary-btn" onClick={handleCreateGroup}>
            Create Group
          </button>
        </div>

        {/* Active Battle */}
        <div className="card active-battle-card">
          <h1 className="battle-title">Active Battles</h1>
          {activeBattle ? (
            <div className="battle-content">
              
              <div className="battle-teams">
                <div className="team team-a">
                  <span>{activeBattle.groupA}</span>
                </div>

                <div className="vs">VS</div>

                <div className="team team-b">
                  <span>{activeBattle.groupB}</span>
                </div>
              </div>

              <div className="battle-status">

                <p className="lead-score">
                  Leading by {activeBattle.leadScore}
                </p>
              </div>

            </div>
          ) : (
            <p className="no-battle">No active battles 😴</p>
          )}
          <div className="actions">
            <button
              className="primary-btn"
              onClick={() => navigate("/create-battle")}
            >
              Create Battle ⚔️
            </button>
            <button
              className="secondary-btn"
              onClick={() => navigate("/battles")}
            >
              View Battles
            </button>
          </div>
        </div>
      </div>

      {/* Groups */}
      <div className="section">
        <h3>Your Groups: {groups.length}</h3>

        <div className="group-grid">
          {groups.length === 0 ? (
            <p>You have no groups yet.</p>
          ) : (
            groups.map((group) => (
              <div key={group._id} className="group-card">
                <h3>{group.name}</h3>
                <p>{group.description}</p>
                <p>👤 {group.creator?.name}</p>
                <p>👥 {group.members.length} members</p>

                <div className="card-actions">
                  <button
                    className="open-btn"
                    onClick={() => navigate(`/group/${group._id}`)}
                  >
                    Open
                  </button>

                  <button
                    className={`copy-btn ${
                      copied === group._id ? "copied" : ""
                    }`}
                    onClick={() =>
                      handleCopy(group.inviteLink, group._id)
                    }
                  >
                    {copied === group._id ? "Copied!" : "Copy Link"}
                  </button>

                  <button
                    className="whatsapp"
                    onClick={() =>
                      window.open(
                        `https://wa.me/?text=Join my habit group ${group.inviteLink}`
                      )
                    }
                  >
                    WhatsApp
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default MainApp;