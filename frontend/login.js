document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");

  // If form not found → stop (prevents errors)
  if (!loginForm) return;

  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const errorEl = document.getElementById("error");

    // Clear old error
    errorEl.innerText = "";

    // Basic validation
    if (!email || !password) {
      errorEl.innerText = "All fields are required";
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok) {
        // Save token
        localStorage.setItem("token", data.token);

        if (Number(data.role_id) === 1) {
          window.location.href = "dashboard.html";
        } else if (Number(data.role_id) === 2) {
          window.location.href = "student.html";
        } else {
          errorEl.innerText = "Unsupported role";
        }
      } else {
        errorEl.innerText = data.message || "Login failed";
      }

    } catch (err) {
      errorEl.innerText = "Server error";
    }
  });
});