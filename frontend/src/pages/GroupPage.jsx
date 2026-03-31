import { useEffect, useState } from "react";
import { useParams, useNavigate, useAsyncError } from "react-router-dom";
import ActivityFeed from "../components/ActivityFeed";
import "../styles/GroupPage.css";
import confetti from "canvas-confetti";
import checkSound from "../assets/checkin.wav";
function GroupPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [message, setMessage] = useState("");
  const [showFire,setShowFire]=useState(false);
  const [xp,setXp]=useState(0);
  const [showXp,setShowXp]=useState(false);
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  useEffect(() => {
    fetchGroup();
  }, [id]);

  const fetchGroup = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/groups/${id}`, {
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
      const res = await fetch(`http://localhost:5000/api/checkins/${id}`, {
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

      // 🎉 Fire immediately
      // 🎉 instant blast
      confetti({
        particleCount: 120,
        spread: 120,
        startVelocity: 40,
        origin: { x: 0.5, y: 0.5 }
      });

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
      const audio=new Audio(checkSound);
      audio.play();
      setTimeout(()=>{
        setShowFire(false);
        setShowXp(false);
      },1000);
      fetchGroup();

    } catch (err) {
      console.log(err);
    }
  };

  if (!group) return <p className="loading">Loading...</p>;

  return (
  
    <div className="group-page">
      {/* 🔥 FIRE */}
      {showFire && <div className="fire-effect">🔥🔥🔥</div>}

      {/* ⭐ XP POPUP */}
      {showXp && <div className="xp-popup">+{xp} XP</div>}
      <div className="group-container">
        {/* HEADER */}
        <div className="group-header">
          <h1>{group.name}</h1>
          <p>{group.description}</p>
        </div>

        {/* ACTION BUTTONS */}
        <div className="group-actions">
          <button onClick={() => navigate(`/groups/${id}/leaderboard`)} className="primary-btn">
            View Leaderboard
          </button>

          <button onClick={handleCheckin} className="success-btn">
            Check-in Today ✅
          </button>
        </div>

        {message && <p className="message">{message}</p>}
        <div className="group-content">
          {/* MEMBERS CARD */}
          <div className="card members-card">
            <h3>🏆 Members</h3>

            <div className="members-list">
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
                .map((m, index) => (
                  <div key={m.user._id} className="member-row">
                    <span className="rank">#{index + 1}</span>

                    <span className="name">{m.user.name}</span>

                    {m.status === "missed" && (
                      <span className="missed">🔴 Missed</span>
                    )}

                    {m.status === "active" && (
                      <span className="active">🔥 {m.weeklyStreak}</span>
                    )}
                  </div>
                ))}
            </div>
          </div>

          {/* ACTIVITY FEED */}
          <div className="card">
            <h3>📊 Activity Feed</h3>
            <div className="activity-feed">
                <ActivityFeed groupId={id} />
            </div>
          </div>
        </div>  
      </div>        
    </div>
  );
}

export default GroupPage;