document.addEventListener('DOMContentLoaded', () => {
  const API_BASE = "https://hms-project-backend.onrender.com"; // 🔥 CHANGE if needed

  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'index.html';
    return;
  }

  const welcomeEl = document.getElementById('welcomeStudentText');
  const logoutBtn = document.getElementById('studentLogoutBtn');
  const noticeStatusEl = document.getElementById('studentNoticeStatus');
  const noticesTableBody = document.getElementById('studentNoticesTableBody');
  const messStatusEl = document.getElementById('studentMessStatus');
  const messTableBody = document.getElementById('studentMessTableBody');

  if (!welcomeEl || !logoutBtn || !noticeStatusEl || !noticesTableBody || !messStatusEl || !messTableBody) {
    return;
  }

  // ✅ Decode JWT safely
  function parseToken(tokenValue) {
    try {
      return JSON.parse(atob(tokenValue.split('.')[1]));
    } catch {
      return null;
    }
  }

  const payload = parseToken(token);

  // ✅ Protect route
  if (!payload || Number(payload.role) !== 2) {
    window.location.href = 'dashboard.html';
    return;
  }

  welcomeEl.innerText = `Welcome ${payload.name || 'Student'}`;

  function logout() {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
  }

  // ✅ Common API helper
  async function apiFetch(endpoint) {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.status === 401) {
        logout();
        return null;
      }

      if (!response.ok) {
        throw new Error(data.message || "Request failed");
      }

      return data;
    } catch (err) {
      throw err;
    }
  }

  // ✅ Load Notices
  async function loadNotices() {
    try {
      noticeStatusEl.innerText = 'Loading notices...';

      const data = await apiFetch('/api/notices');
      if (!data) return;

      noticesTableBody.innerHTML = '';

      if (!Array.isArray(data) || data.length === 0) {
        noticeStatusEl.innerText = 'No notices available';
        return;
      }

      noticeStatusEl.innerText = '';

      data.forEach((notice) => {
        const row = document.createElement('tr');

        const createdAt = notice.created_at
          ? new Date(notice.created_at).toLocaleString()
          : '';

        row.innerHTML = `
          <td>${notice.title || ''}</td>
          <td>${notice.content || ''}</td>
          <td>${createdAt}</td>
        `;

        noticesTableBody.appendChild(row);
      });

    } catch (err) {
      noticeStatusEl.innerText = 'Server error while loading notices';
    }
  }

  // ✅ Load Mess Timetable
  async function loadMess() {
    try {
      messStatusEl.innerText = 'Loading timetable...';

      const data = await apiFetch('/api/mess');
      if (!data) return;

      messTableBody.innerHTML = '';

      if (!Array.isArray(data) || data.length === 0) {
        messStatusEl.innerText = 'No timetable available';
        return;
      }

      messStatusEl.innerText = '';

      data.forEach((item) => {
        const row = document.createElement('tr');

        row.innerHTML = `
          <td>${item.day || ''}</td>
          <td>${item.breakfast || ''}</td>
          <td>${item.lunch || ''}</td>
          <td>${item.dinner || ''}</td>
        `;

        messTableBody.appendChild(row);
      });

    } catch (err) {
      messStatusEl.innerText = 'Server error while loading timetable';
    }
  }

  // ✅ Events
  logoutBtn.addEventListener('click', logout);

  // ✅ Initial Load
  loadNotices();
  loadMess();
});
