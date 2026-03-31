import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/JoinBattle.css";

function JoinBattle() {
  const { code } = useParams();
  const navigate = useNavigate();

  const [battle, setBattle] = useState(null);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [userInfo, setUserInfo] = useState(undefined);

  // 🔐 Load user
  useEffect(() => {
    const storedUser = localStorage.getItem("userInfo");
    setUserInfo(storedUser ? JSON.parse(storedUser) : null);
  }, []);

  // 🔐 Redirect
  useEffect(() => {
    if (userInfo === null) {
      navigate("/login", {
        state: {
          redirect: `/battle/invite/${code}`,
          inviteMessage: "⚠️ Login to join the battle",
        },
      });
    }
  }, [userInfo, navigate, code]);

  // 🚀 Fetch battle
  useEffect(() => {
    if (userInfo === undefined || userInfo === null) return;

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
    if (userInfo === undefined || userInfo === null) return;

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

  // ✅ guards
  if (userInfo === undefined) return null;
  if (userInfo === null) return null;
  if (!battle) return <h2 className="loading">Loading battle...</h2>;

  return (
    <div className="join-battle-page">
      <div className="join-battle-container">
        <h1 className="title">⚔️ Battle Invite</h1>

        <div className="battle-card">
          <div className="battle-info">
            <p><strong>Group A:</strong> {battle?.groupA?.name}</p>
            <p>
              <strong>Status:</strong>
              <span className="status">{battle?.status}</span>
            </p>
          </div>

          <h3 className="select-title">Select Your Group</h3>

          <select
            className="select-box"
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
          >
            <option value="">Select group</option>
            {groups.map((group) => (
              <option key={group._id} value={group._id}>
                {group.name}
              </option>
            ))}
          </select>

          <button className="join-btn" onClick={joinBattle}>
            Join Battle 🚀
          </button>
        </div>
      </div>
    </div>
  );
}

export default JoinBattle;
