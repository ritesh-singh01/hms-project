document.addEventListener('DOMContentLoaded', () => {
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

  function parseToken(tokenValue) {
    try {
      return JSON.parse(atob(tokenValue.split('.')[1]));
    } catch (err) {
      return null;
    }
  }

  const payload = parseToken(token);
  if (!payload || Number(payload.role) !== 2) {
    window.location.href = 'dashboard.html';
    return;
  }

  welcomeEl.innerText = `Welcome ${payload.name || 'Student'}`;

  function logout() {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
  }

  async function loadNotices() {
    try {
      noticeStatusEl.innerText = 'Loading notices...';
      const response = await fetch('http://localhost:5000/api/notices', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();

      if (response.status === 401) {
        logout();
        return;
      }
      if (!response.ok) {
        noticeStatusEl.innerText = data.message || 'Failed to load notices';
        return;
      }

      noticesTableBody.innerHTML = '';
      if (!Array.isArray(data) || data.length === 0) {
        noticeStatusEl.innerText = 'No notices available';
        return;
      }

      noticeStatusEl.innerText = '';
      data.forEach((notice) => {
        const row = document.createElement('tr');
        const createdAt = notice.created_at ? new Date(notice.created_at).toLocaleString() : '';
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

  async function loadMess() {
    try {
      messStatusEl.innerText = 'Loading timetable...';
      const response = await fetch('http://localhost:5000/api/mess', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();

      if (response.status === 401) {
        logout();
        return;
      }
      if (!response.ok) {
        messStatusEl.innerText = data.message || 'Failed to load timetable';
        return;
      }

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

  logoutBtn.addEventListener('click', logout);
  loadNotices();
  loadMess();
});
