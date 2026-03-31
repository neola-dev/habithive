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
  useEffect(() => {
  const storedUser = localStorage.getItem("userInfo");
  setUserInfo(storedUser ? JSON.parse(storedUser) : null);
}, []);

  // 🔐 Redirect if not logged in
  useEffect(() => {
    if (userInfo === undefined) return;
    if (!userInfo) {
      navigate("/login", {
        state: {
          redirect: `/battle/invite/${code}`,
          inviteMessage: "⚠️ Login to join the battle",
        },
      });
    }
  }, [code, navigate, userInfo]);

  // 🚀 Fetch battle
  useEffect(() => {
    if (userInfo === undefined) return null;

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
    if (!selectedGroup) return alert("Select group");

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

      alert("Joined battle!");
      navigate(`/battle/${data.battle._id}`);

    } catch (err) {
      console.log(err);
    }
  };

  if (!userInfo) return null;
  if (!battle) return <h2>Loading battle...</h2>;

  return (
    <div className="join-battle-page">
      <h1>⚔️ Battle Invite</h1>

      <p>Group A: {battle.groupA?.name}</p>

      <select onChange={(e) => setSelectedGroup(e.target.value)}>
        <option value="">Select group</option>
        {groups.map((g) => (
          <option key={g._id} value={g._id}>
            {g.name}
          </option>
        ))}
      </select>

      <button onClick={joinBattle}>Join Battle</button>
    </div>
  );
}

export default JoinBattle;
