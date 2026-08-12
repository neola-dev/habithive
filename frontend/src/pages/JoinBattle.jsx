import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/JoinBattle.css";

function JoinBattle() {
  const { code } = useParams();
  const navigate = useNavigate();

  const [battle, setBattle] = useState(null);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");

  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "null");


  // 🚀 Fetch battle
  useEffect(() => {
    if (!userInfo) return;

    const fetchBattle = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/battles/invite/${code}`,
          {
            headers: {
              Authorization: `Bearer ${userInfo.token}`,
            },
          }
        );

        const data = await res.json();
        if (res.ok) setBattle(data.battle);
      } catch (err) {
        console.log(err);
      }
    };

    fetchBattle();
  }, [code, userInfo]);

  // 🚀 Fetch groups
  useEffect(() => {
    if (!userInfo) return;

    const fetchGroups = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/groups`,
          {
            headers: {
              Authorization: `Bearer ${userInfo.token}`,
            },
          }
        );

        const data = await res.json();
        setGroups(data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchGroups();
  }, [userInfo]);

  const joinBattle = async () => {
    if (!selectedGroup) return alert("Please select a group");

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/battles/join`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userInfo.token}`,
          },
          body: JSON.stringify({
            inviteCode: code,
            groupB: selectedGroup,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) return alert(data.message);

      alert("🔥 Joined battle successfully!");
      navigate(`/battle/${data.battle._id}`);
    } catch (err) {
      console.log(err);
    }
  };

  if (!userInfo) return null;
  if (!battle) return <h2 className="loading">⏳ Loading battle...</h2>;

  return (
    <div className="join-battle-page">
      <div className="join-battle-container">
        <button className="back-btn" onClick={() => navigate("/app")}>
          ← Back to Dashboard
        </button>

        {/* Title */}
        <div className="join-battle-page-title">
          <h1>⚔️ Battle Invite</h1>
          <p>You've been challenged. Pick your group and accept the battle!</p>
        </div>

        {/* Card */}
        <div className="join-battle-card">
          {/* Dark Header */}
          <div className="join-battle-card-header">
            <div className="join-battle-vs-row">
              <div className="join-battle-team">
                <span className="join-battle-team-label">Challenger</span>
                <span className="join-battle-team-name">{battle?.groupA?.name}</span>
              </div>
              <div className="join-battle-vs-badge">VS</div>
              <div className="join-battle-team">
                <span className="join-battle-team-label">Your Team</span>
                <span className="join-battle-team-name">?</span>
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <span className="join-battle-status-chip">
                ● {battle?.status}
              </span>
            </div>
          </div>

          {/* Body */}
          <div className="join-battle-card-body">
            <div>
              <label className="join-battle-select-label">Select Your Group</label>
              <select
                className="select-box"
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
              >
                <option value="">Choose a group…</option>
                {groups?.map((group) => (
                  <option key={group._id} value={group._id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>

            <button className="join-btn" onClick={joinBattle} disabled={!selectedGroup}>
              🚀 Join Battle
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default JoinBattle;