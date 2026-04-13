async function searchUser() {
  const username = document.getElementById("username").value;
  const resultDiv = document.getElementById("result");

  resultDiv.innerHTML = "Loading...";

  try {
    // Get user ID
    const res = await fetch("https://users.roblox.com/v1/usernames/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        usernames: [username],
        excludeBannedUsers: false
      })
    });

    const data = await res.json();

    if (!data.data.length) {
      resultDiv.innerHTML = "User not found.";
      return;
    }

    const user = data.data[0];

    // Get avatar
    const avatarRes = await fetch(
      `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${user.id}&size=150x150&format=Png`
    );

    const avatarData = await avatarRes.json();
    const avatarUrl = avatarData.data[0].imageUrl;

    resultDiv.innerHTML = `
      <img src="${avatarUrl}" style="border-radius:50%">
      <h2>${user.name}</h2>
      <p>User ID: ${user.id}</p>
    `;

  } catch (err) {
    resultDiv.innerHTML = "Error loading user.";
  }
}
