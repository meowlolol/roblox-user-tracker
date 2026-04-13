const CLEAN = {
  "35766674": "Murayama Ikka",
  "13445787": "United Federation",
  "659233359": "Chasers"
};

const NEUTRAL = { 
  "13835630": "Ikeda Ikka",
  "2727257": "Hydra Bratva",
  "957196347": "Kozakura Ikka",
  "953286501": "Tachibana Kai",
  "673851096": "ZERO"
};

const OPPS = { 
  "35488582": "Enomoto Ikka",
  "1051291555": "Chosen Devils",
  "777386797": "Sanada Ikka",
  "12739645": "NOLA"
};

document.getElementById("searchBtn").addEventListener("click", searchUser);

async function searchUser() {
  const username = document.getElementById("username").value.trim();
  const resultDiv = document.getElementById("result");

  if (!username) {
    resultDiv.innerHTML = "Enter a username.";
    return;
  }

  resultDiv.innerHTML = "Scanning...";

  try {
    // USER
    const res = await fetch("https://corsproxy.io/?https://users.roblox.com/v1/usernames/users", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ usernames: [username] })
    });

    const data = await res.json();

    if (!data.data || data.data.length === 0) {
      resultDiv.innerHTML = "User not found.";
      return;
    }

    const user = data.data[0];

    // USER DETAILS (CREATED DATE)
    const userInfoRes = await fetch(
      `https://corsproxy.io/?https://users.roblox.com/v1/users/${user.id}`
    );
    const userInfo = await userInfoRes.json();

    const created = new Date(userInfo.created).toLocaleDateString();

    // FRIEND COUNT
    let friendCount = 0;
    try {
      const friendsRes = await fetch(
        `https://corsproxy.io/?https://friends.roblox.com/v1/users/${user.id}/friends/count`
      );
      const friendsData = await friendsRes.json();
      friendCount = friendsData.count || 0;
    } catch {}

    // GET FRIENDS LIST (LIMITED)
    let friends = [];
    try {
      const listRes = await fetch(
        `https://corsproxy.io/?https://friends.roblox.com/v1/users/${user.id}/friends`
      );
      const listData = await listRes.json();
      friends = listData.data || [];
    } catch {}

    // GROUPS
    const groupRes = await fetch(
      `https://corsproxy.io/?https://groups.roblox.com/v2/users/${user.id}/groups/roles`
    );

    const groupData = await groupRes.json();
    const userGroups = groupData.data || [];

    // CHECK FRIEND CONNECTIONS
    async function countConnections(groupIds) {
      let count = 0;

      for (let friend of friends.slice(0, 10)) { // limit for speed
        try {
          const res = await fetch(
            `https://corsproxy.io/?https://groups.roblox.com/v2/users/${friend.id}/groups/roles`
          );
          const data = await res.json();

          if (data.data.some(g => groupIds.includes(String(g.group.id)))) {
            count++;
          }
        } catch {}
      }

      return count;
    }

    const oppIds = Object.keys(OPPS);
    const connectionCount = await countConnections(oppIds);

    // AVATAR
    let avatarUrl = "";
    try {
      const avatarRes = await fetch(
        `https://corsproxy.io/?https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${user.id}&size=150x150&format=Png`
      );
      const avatarData = await avatarRes.json();
      avatarUrl = avatarData.data[0]?.imageUrl;
    } catch {}

    if (!avatarUrl) {
      avatarUrl = "https://via.placeholder.com/150";
    }

    function buildSection(title, groupSet, className) {
      let html = `<div class="section-title">${title}</div><div class="group-grid">`;

      for (let id in groupSet) {
        const found = userGroups.find(g => g.group.id == id);
        if (found) {
          html += `<div class="group-card ${className}">${groupSet[id]}</div>`;
        }
      }

      html += "</div>";
      return html;
    }

    // CLEAN UI OUTPUT
    resultDiv.innerHTML = `
      <img src="${avatarUrl}">
      <h2>${user.name}</h2>
      
      <div style="opacity:0.7; font-size:12px; margin-bottom:10px;">
        Joined: ${created} • Friends: ${friendCount}
      </div>

      <div style="margin-bottom:10px; font-size:13px;">
        Connections in flagged groups: <b>${connectionCount}</b>
      </div>

      ${buildSection("Clean", CLEAN, "clean")}
      ${buildSection("Neutral", NEUTRAL, "neutral")}
      ${buildSection("Opps", OPPS, "opp")}
    `;

  } catch (err) {
    console.error(err);
    resultDiv.innerHTML = "Error loading user.";
  }
}
