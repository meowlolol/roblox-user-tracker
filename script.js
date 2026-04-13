async function searchUser() {
  const username = document.getElementById("username").value.trim();
  const resultDiv = document.getElementById("result");

  if (!username) {
    resultDiv.innerHTML = "Enter a username.";
    return;
  }

  resultDiv.innerHTML = "Loading...";

  try {
    // Step 1: Get user ID (with proxy to fix CORS)
    const res = await fetch("https://corsproxy.io/?https://users.roblox.com/v1/usernames/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        usernames: [username],
        excludeBannedUsers: false
      })
    });

    if (!res.ok) throw new Error("Failed to fetch user");

    const data = await res.json();

    if (!data.data || data.data.length === 0) {
      resultDiv.innerHTML = "User not found.";
      return;
    }

    const user = data.data[0];

    // Step 2: Get avatar
    const avatarRes = await fetch(
      `https://corsproxy.io/?https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${user.id}&size=150x150&format=Png`
    );

    if (!avatarRes.ok) throw new Error("Failed to fetch avatar");

    const avatarData = await avatarRes.json();
    const avatarUrl = avatarData.data[0].imageUrl;

    // Step 3: Display result
    resultDiv.innerHTML = `
      <img src="${avatarUrl}" style="border-radius:50%; box-shadow:0 0 20px red;">
      <h2>${user.name}</h2>
      <p>User ID: ${user.id}</p>
      <a href="https://www.roblox.com/users/${user.id}/profile" target="_blank">
        <button>View Profile</button>
      </a>
    `;

  } catch (err) {
    console.error(err);
    resultDiv.innerHTML = "Error loading user. Try again.";
  }
}
