import { useState, useEffect } from "react";
import "../styles/CreateBattle.css";

function CreateBattle() {

  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [copied,setCopied]=useState(false);
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));

        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/groups/my-created`,
          {
            headers: {
              Authorization: `Bearer ${userInfo.token}`
            }
          }
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
      body: JSON.stringify({
        groupA: selectedGroup
      })
    });

    const data = await res.json();
    setInviteLink(`https://habithive-mu.vercel.app${data.inviteLink}`);
  };

  const shareWhatsapp = () => {
    const text = `🔥 Join our Grouply Battle ⚔️\n${inviteLink}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const handleCopy = () => {
  navigator.clipboard.writeText(inviteLink);

  setCopied(true);

  setTimeout(() => {
    setCopied(false);
  }, 2000); // 2 seconds
};

  return (
    <div className="battle-page">

      <div className="battle-card">

        <h1 className="battle-title">⚔️ Create Battle</h1>

        <p className="battle-subtitle">
          Challenge another group and compete daily
        </p>
        <p className="info-text">
          ⚠️ You can only create battles for groups you created
        </p>
        {/* SELECT */}
        {groups.length === 0 ? (
          <p className="no-groups">
            You haven’t created any groups yet 😅  
            Create a group first to start a battle!
          </p>
        ) : (
          <select
            className="battle-select"
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

        {/* BUTTON */}
        <button className="primary-btn-battle" onClick={createBattle} disabled={!selectedGroup}>
          Create Battle 🚀
        </button>

        {/* INVITE SECTION */}
        {inviteLink && (
          <div className="invite-box">

            <h3>Invite Link</h3>

            <input
              type="text"
              value={inviteLink}
              readOnly
              className="invite-input"
            />

            <div className="invite-actions">

              <button
                className={`copy-btn ${copied ? "copied" : ""}`}
                onClick={handleCopy}
              >
                {copied ? "Copied!" : "Copy Link"}
              </button>

              <button
                className="whatsapp-btn"
                onClick={shareWhatsapp}
              >
                WhatsApp
              </button>

            </div>
          </div>
        )}

      </div>

    </div>
  );
}

export default CreateBattle;
