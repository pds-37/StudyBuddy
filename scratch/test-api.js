async function run() {
  try {
    const res = await fetch("http://localhost:5000/api/auth/me", {
      headers: {
        "Authorization": "Bearer demo_guest"
      }
    });
    console.log("Status:", res.status);
    const data = await res.json();
    console.log("Response:", data);
  } catch (error) {
    console.error("Error:", error);
  }
}

run();
