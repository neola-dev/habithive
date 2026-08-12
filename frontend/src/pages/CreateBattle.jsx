import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "../components/AppShell";
import { ArrowLeft, Swords, Trophy, Calendar, Flame, Target } from "lucide-react";
import "../styles/CreateBattle.css";

function CreateBattle() {
  const navigate = useNavigate();

  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/groups/my-created`,
          { headers: { Authorization: `Bearer ${userInfo.token}` } }
        );
        const data = await res.json();
        setGroups(data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchGroups();
  }, []);

  const createBattle = async () => {
    if (!selectedGroup) return;
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/battles/invite`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userInfo.token}`
      },
      body: JSON.stringify({ groupA: selectedGroup })
    });
    const data = await res.json();
    setInviteLink(`https://habithive-mu.vercel.app${data.inviteLink}`);
  };

  const shareWhatsapp = () => {
    const text = `🔥 Join our Habit Battle! ⚔️\n${inviteLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AppShell>
      <div className="battle-page animate-fade-in" style={{ padding: 0 }}>
        <button className="back-btn" onClick={() => navigate("/app")}>
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        {/* Hero */}
        <div className="battle-page-hero" style={{ background: "var(--color-bg-card)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: "24px", marginBottom: "24px", boxShadow: "var(--shadow-sm)" }}>
          <h1 style={{ fontSize: "24px", fontWeight: 800, display: "flex", alignItems: "center", gap: "8px" }}>
            <Swords size={26} style={{ color: "var(--color-primary)" }} /> Create a Battle
          </h1>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "14px", marginTop: "4px" }}>
            Challenge another group and compete daily to prove who's more consistent.
          </p>
        </div>

        {/* Two-column grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "24px" }} className="two-col-grid-dashboard">
          {/* Left: Form card */}
          <div style={{ background: "var(--color-bg-card)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: "24px", boxShadow: "var(--shadow-sm)" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px" }}>Battle Setup</h3>

            <p style={{ fontSize: "12px", color: "var(--color-text-secondary)", marginBottom: "16px" }}>
              ⚠️ You can only create battles for groups you own.
            </p>

            {groups.length === 0 ? (
              <div style={{ background: "var(--color-bg-base)", padding: "20px", borderRadius: "var(--radius-md)", textAlign: "center", fontSize: "13px", color: "var(--color-text-secondary)" }}>
                😅 You haven't created any groups yet.<br />
                Create a group first to start a battle!
              </div>
            ) : (
              <select
                className="battle-select"
                style={{ width: "100%", outline: "none", marginBottom: "16px" }}
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
              >
                <option value="">Select your group</option>
                {groups.map(group => (
                  <option key={group._id} value={group._id}>
                    {group.name}
                  </option>
                ))}
              </select>
            )}

            <button 
              className="primary-btn-battle" 
              onClick={createBattle} 
              disabled={!selectedGroup}
              style={{ width: "100%" }}
            >
              🚀 Create Battle Challenge
            </button>

            {inviteLink && (
              <div style={{ marginTop: "24px", background: "var(--color-bg-base)", padding: "16px", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)" }}>
                <h3 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "8px" }}>Invite Link</h3>
                <input type="text" value={inviteLink} readOnly className="invite-input" style={{ width: "100%", background: "white", marginBottom: "12px", padding: "8px 12px", border: "1px solid var(--color-border)" }} />
                <div style={{ display: "flex", gap: "8px" }}>
                  <button className="habit-action-btn" onClick={handleCopy} style={{ flex: 1 }}>
                    {copied ? "✓ Copied!" : "Copy Link"}
                  </button>
                  <button className="success-btn" onClick={shareWhatsapp} style={{ flex: 1, padding: "8px 12px", fontSize: "13px" }}>
                    WhatsApp
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right: Info card */}
          <div style={{ background: "var(--color-bg-card)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: "24px", boxShadow: "var(--shadow-sm)", display: "flex", flexDirection: "column", gap: "16px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 700 }}>⚔️ How Battles Work</h3>

            <div style={{ display: "flex", gap: "12px" }}>
              <Trophy size={18} style={{ color: "var(--color-warning)", marginTop: "2px" }} />
              <div>
                <span style={{ fontWeight: 700, fontSize: "14px", display: "block" }}>Winner</span>
                <span style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>The group with the most weekly check-ins wins.</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <Calendar size={18} style={{ color: "var(--color-info)", marginTop: "2px" }} />
              <div>
                <span style={{ fontWeight: 700, fontSize: "14px", display: "block" }}>Duration</span>
                <span style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>Battles run from Monday to Sunday each week.</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <Flame size={18} style={{ color: "var(--color-primary)", marginTop: "2px" }} />
              <div>
                <span style={{ fontWeight: 700, fontSize: "14px", display: "block" }}>Scoring</span>
                <span style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>Every daily check-in earns your team points.</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <Target size={18} style={{ color: "var(--color-success)", marginTop: "2px" }} />
              <div>
                <span style={{ fontWeight: 700, fontSize: "14px", display: "block" }}>Strategy</span>
                <span style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>Stay consistent every day to dominate the leaderboard.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default CreateBattle;
