

async function test() {
  try {
    const loginRes = await fetch("http://localhost:3001/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@novacart.dev", password: "Admin@2026!" })
    });
    const loginData = await loginRes.json();
    console.log("Login:", loginData);

    const checkRes = await fetch("http://localhost:3001/api/admin/ar-models", {
        headers: { Authorization: `Bearer ${loginData.token}` }
    });
    const checkData = await checkRes.json();
    console.log("Models:", checkData);
    
    if (checkData.length > 0) {
        const id = checkData[checkData.length - 1].id;
        console.log(`Deleting model ${id}...`);
        const delRes = await fetch(`http://localhost:3001/api/admin/ar-models/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${loginData.token}` }
        });
        console.log("Delete response:", delRes.status, await delRes.text());
    }
  } catch(e) { console.error(e); }
}

test();
