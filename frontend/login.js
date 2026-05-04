document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  if (!loginForm) return;

  // 🔴 IMPORTANT: change this to your Render backend URL
  const API_BASE = "https://hms-project-backend.onrender.com";

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email")?.value.trim();
    const password = document.getElementById("password")?.value.trim();
    const errorEl = document.getElementById("error");

    // Reset error
    if (errorEl) errorEl.textContent = "";

    // Validation
    if (!email || !password) {
      if (errorEl) errorEl.textContent = "All fields are required";
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Save token
      localStorage.setItem("token", data.token);

      // Redirect based on role
      const role = Number(data.role_id);

      if (role === 1) {
        window.location.href = "dashboard.html";   // Admin
      } else if (role === 2) {
        window.location.href = "student.html";     // Student
      } else {
        throw new Error("Invalid user role");
      }

    } catch (error) {
      if (errorEl) {
        errorEl.textContent =
          error.message === "Failed to fetch"
            ? "Cannot connect to server"
            : error.message;
      }
    }
  });
});
