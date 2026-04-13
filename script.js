const groupsToCheck = [
  { name: "NOLA", id: 12739645 },
  { name: "ENOMOTTO-IKKA", id: 35488582 },
  { name: "LA-EME", id: 35560914 },
  { name: "KADDIN", id: 16140130 }
];

document.getElementById("searchBtn").addEventListener("click", searchUser);

async function searchUser() {
  const username = document.getElementById("username").value.trim();
  const resultDiv = document.getElementById("result");

  if (!username) {
    resultDiv.innerHTML = "Enter a username.";
    return;
  }

  resultDiv.innerHTML = "Loading...";

  try {
    // Get user ID
    const res = await fetch(
      "https://corsproxy.io/?https://users.roblox.com/v1/usernames/users",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          usernames: [username],
          excludeBannedUsers: false
        })
      }
    );

    const data = await res.json();

    if (!data.data || data.data.length === 0) {
      resultDiv.innerHTML = "User not found.";
      return;
    }

    const user = data.data[0];

    // Avatar
    const avatarRes = await fetch(
      `https://corsproxy.io/?https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${user.id}&size=150x150&format=Png`
    );

    const avatarData = await avatarRes.json();
    const avatarUrl = avatarData.data[0].imageUrl;

    // Groups
    const groupRes = await fetch(
      `https://corsproxy.io/?https://groups.roblox.com/v2/users/${user.id}/groups/roles`
    );

    const groupData = await groupRes.json();
    const userGroups = groupData.data || [];

    let groupHTML = "<h3>Group Check</h3>";

    groupsToCheck.forEach(group => {
      const found = userGroups.find(g => g.group.id === group.id);

      if (!found) {
        groupHTML += `<div class="group green">${group.name}: Clean</div>`;
      } else {
        const rank = found.role.rank;

        if (rank >= 200) {
          groupHTML += `<div class="group red">${group.name}: High Rank (${found.role.name})</div>`;
        } else {
          groupHTML += `<div class="group yellow">${group.name}: Member (${found.role.name})</div>`;
        }
      }
    });

    resultDiv.innerHTML = `
      <img src="${avatarUrl}">
      <h2>${user.name}</h2>
      <p>User ID: ${user.id}</p>
      <a href="https://www.roblox.com/users/${user.id}/profile" target="_blank">
        <button>View Profile</button>
      </a>
      ${groupHTML}
    `;

  } catch (err) {
    console.error(err);
    resultDiv.innerHTML = "Error loading user.";
  }
}
