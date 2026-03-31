const BASE_URL = import.meta.env.VITE_API_URL;
const getToken = () => {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  return userInfo?.token;
};

export const getUserBattles = async (token, status = "active") => {
  const res = await fetch(`${BASE_URL}/api/battles?status=${status}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return await res.json();
};

export const getBattleProgress = async (battleId) => {
    const token=getToken();
  const res = await fetch(`${BASE_URL}/api/battles/${battleId}/progress`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return await res.json();
};
