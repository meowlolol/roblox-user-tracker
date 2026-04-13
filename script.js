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
    // GET USER
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

    // AVATAR (PROXY + FALLBACK FIX)
    let avatarUrl = "";

    try {
      const avatarRes = await fetch(
        `https://corsproxy.io/?https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${user.id}&size=150x150&format=Png&isCircular=true`
      );

      if (!avatarRes.ok) throw new Error();

      const avatarData = await avatarRes.json();
      avatarUrl = avatarData.data[0]?.imageUrl;

    } catch {
      try {
        const avatarRes2 = await fetch(
          `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${user.id}&size=150x150&format=Png&isCircular=true`
        );

        const avatarData2 = await avatarRes2.json();
        avatarUrl = avatarData2.data[0]?.imageUrl;

      } catch {
        avatarUrl = "";
      }
    }

    if (!avatarUrl) {
      avatarUrl = "https://via.placeholder.com/150";
    }

    // GROUPS
    const groupRes = await fetch(
      `https://corsproxy.io/?https://groups.roblox.com/v2/users/${user.id}/groups/roles`
    );

    const groupData = await groupRes.json();
    const userGroups = groupData.data || [];

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

    // DISPLAY
    resultDiv.innerHTML = `
      <img src="${avatarUrl}">
      <h2>${user.name}</h2>
      <p>ID: ${user.id}</p>

      ${buildSection("Clean", CLEAN, "clean")}
      ${buildSection("Neutral", NEUTRAL, "neutral")}
      ${buildSection("Opps", OPPS, "opp")}
    `;

  } catch (err) {
    console.error(err);
    resultDiv.innerHTML = "Error loading user.";
  }
}
