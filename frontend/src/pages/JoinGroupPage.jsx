import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/JoinGroupPage.css";

const JoinGroupPage = () => {
  const { inviteCode } = useParams();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchGroup = async () => {
      const userInfo = JSON.parse(localStorage.getItem("userInfo") || "null");

      // Not logged in
      if (!userInfo) {
        navigate("/", {
          replace: true,
          state: {
            redirect: `/invite/${inviteCode}`,
            inviteMessage: "⚠️ Login to join the group",
          },
        });
        return;
      }

      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/groups/invite/${inviteCode}`,
          {
            headers: {
              Authorization: `Bearer ${userInfo.token}`,
            },
          }
        );

        // Token expired
        if (res.status === 401) {
          localStorage.removeItem("userInfo");

          navigate("/", {
            replace: true,
            state: {
              redirect: `/invite/${inviteCode}`,
              inviteMessage: "⚠️ Login to join the group",
            },
          });
          return;
        }

        if (res.status === 404) {
          setGroup(null);
          setLoading(false);
          return;
        }

        const data = await res.json();

        if (res.ok) {
          setGroup(data);
        } else {
          setMessage(data.message || "Something went wrong.");
        }
      } catch (err) {
        console.error(err);
        setMessage("Server Error");
      } finally {
        setLoading(false);
      }
    };

    fetchGroup();
  }, [inviteCode, navigate]);

  const handleJoin = async () => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "null");

    if (!userInfo) {
      navigate("/", {
        replace: true,
        state: {
          redirect: `/invite/${inviteCode}`,
          inviteMessage: "⚠️ Login to join the group",
        },
      });
      return;
    }

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/groups/invite/${inviteCode}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userInfo.token}`,
          },
        }
      );

      if (res.status === 401) {
        localStorage.removeItem("userInfo");

        navigate("/", {
          replace: true,
          state: {
            redirect: `/invite/${inviteCode}`,
            inviteMessage: "⚠️ Login to join the group",
          },
        });
        return;
      }

      const data = await res.json();

      if (res.ok) {
        setMessage("🎉 Joined Group Successfully!");

        setTimeout(() => {
          navigate("/app");
        }, 1200);
      } else {
        setMessage(data.message);
      }
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong.");
    }
  };

  if (loading)
    return <h2 className="loading-text">⏳ Loading group...</h2>;

  if (!group)
    return <h2 className="loading-text">Group not found</h2>;

  return (
    <div className="join-group-page">
      <div className="join-group-wrapper">

        <button
          className="back-btn"
          onClick={() => navigate("/app")}
        >
          ← Back to Dashboard
        </button>

        <div className="join-group-hero">
          <h1>👥 Join Group</h1>
          <p>
            You've received an invite. Join this group and start building
            habits together!
          </p>
        </div>

        <div className="group-card-container">

          <div className="group-card-header">
            <div className="group-icon-circle">👥</div>

            <h2 className="group-title">
              {group.name}
            </h2>

            {group.description && (
              <p className="group-desc">
                {group.description}
              </p>
            )}
          </div>

          <div className="group-card-body">

            <div className="group-stats-row">

              <div className="group-stat-chip">
                <span className="group-stat-chip-label">
                  Creator
                </span>

                <span className="group-stat-chip-value">
                  {group.creator?.name}
                </span>
              </div>

              <div className="group-stat-chip">
                <span className="group-stat-chip-label">
                  Members
                </span>

                <span className="group-stat-chip-value">
                  {group.members?.length || 0}
                </span>
              </div>

            </div>

            <button
              className="primary-btn join-btn"
              onClick={handleJoin}
            >
              🚀 Join Group
            </button>

            {message && (
              <p className="info">
                {message}
              </p>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};

export default JoinGroupPage;