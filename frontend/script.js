const API_BASE = "https://hms-project-backend.onrender.com"; // change if neede
document.addEventListener('DOMContentLoaded', () => {
  let editStudentId = null;
  let studentsData = [];
  let roomsData = [];
  const token = localStorage.getItem('token');

  if (!token) {
    window.location.href = 'index.html';
    return;
  }

  const statusEl = document.getElementById('status');
  const studentsTableBody = document.getElementById('studentsTableBody');
  const studentForm = document.getElementById('studentForm');
  const formTitle = document.getElementById('formTitle');
  const submitBtn = document.getElementById('submitBtn');
  const passwordInput = document.getElementById('password');
  const logoutBtn = document.getElementById('logoutBtn');
  const welcomeText = document.getElementById('welcomeText');
  const roomStatusEl = document.getElementById('roomStatus');
  const roomForm = document.getElementById('roomForm');
  const roomsTableBody = document.getElementById('roomsTableBody');
  const totalStudentsEl = document.getElementById('totalStudents');
  const totalRoomsEl = document.getElementById('totalRooms');
  const occupiedRoomsEl = document.getElementById('occupiedRooms');
  const searchStudentEl = document.getElementById('searchStudent');
  const filterDepartmentEl = document.getElementById('filterDepartment');
  const filterYearEl = document.getElementById('filterYear');
  const noticeForm = document.getElementById('noticeForm');
  const noticeTitleEl = document.getElementById('noticeTitle');
  const noticeContentEl = document.getElementById('noticeContent');
  const noticeStatusEl = document.getElementById('noticeStatus');
  const noticesTableBody = document.getElementById('noticesTableBody');
  const messForm = document.getElementById('messForm');
  const messDayEl = document.getElementById('messDay');
  const messBreakfastEl = document.getElementById('messBreakfast');
  const messLunchEl = document.getElementById('messLunch');
  const messDinnerEl = document.getElementById('messDinner');
  const messStatusEl = document.getElementById('messStatus');
  const messTableBody = document.getElementById('messTableBody');

  if (
    !statusEl || !studentsTableBody || !studentForm || !formTitle || !submitBtn || !passwordInput || !logoutBtn || !welcomeText ||
    !roomStatusEl || !roomForm || !roomsTableBody || !totalStudentsEl || !totalRoomsEl || !occupiedRoomsEl ||
    !searchStudentEl || !filterDepartmentEl || !filterYearEl ||
    !noticeForm || !noticeTitleEl || !noticeContentEl || !noticeStatusEl || !noticesTableBody ||
    !messForm || !messDayEl || !messBreakfastEl || !messLunchEl || !messDinnerEl || !messStatusEl || !messTableBody
  ) {
    return;
  }

  function parseToken(tokenValue) {
    try {
      const payload = JSON.parse(atob(tokenValue.split('.')[1]));
      return payload;
    } catch (error) {
      return null;
    }
  }

  function updateWelcomeText() {
    const payload = parseToken(token);
    if (!payload) {
      welcomeText.innerText = 'Welcome User';
      return;
    }

    const roleMap = {
      1: 'Admin',
      2: 'Student',
      3: 'User'
    };

    const roleLabel = roleMap[Number(payload.role)] || 'User';
    const name = payload.name || roleLabel;
    welcomeText.innerText = `Welcome ${name}`;
  }

  const userPayload = parseToken(token);
  if (!userPayload) {
    window.location.href = 'index.html';
    return;
  }
  if (Number(userPayload.role) !== 1) {
    window.location.href = 'student.html';
    return;
  }

  function showMessage(message) {
    statusEl.innerText = message || ' ';
  }

  function showRoomMessage(message) {
    roomStatusEl.innerText = message || ' ';
  }

  function showNoticeMessage(message) {
    noticeStatusEl.innerText = message || ' ';
  }

  function showMessMessage(message) {
    messStatusEl.innerText = message || ' ';
  }

  function updateStats() {
    totalStudentsEl.innerText = String(studentsData.length);
    totalRoomsEl.innerText = String(roomsData.length);
    const occupiedCount = roomsData.filter((room) => Number(room.occupied) > 0).length;
    occupiedRoomsEl.innerText = String(occupiedCount);
  }

  function getAvailableRooms() {
    return roomsData.filter((room) => Number(room.occupied) < Number(room.capacity));
  }

  function renderDepartmentFilter() {
    const uniqueDepartments = [...new Set(studentsData.map((student) => (student.department || '').trim()).filter(Boolean))];
    const selected = filterDepartmentEl.value;
    filterDepartmentEl.innerHTML = '<option value="">All Departments</option>';
    uniqueDepartments.forEach((dept) => {
      const option = document.createElement('option');
      option.value = dept;
      option.innerText = dept;
      filterDepartmentEl.appendChild(option);
    });
    if (uniqueDepartments.includes(selected)) {
      filterDepartmentEl.value = selected;
    }
  }

  function getFilteredStudents() {
    const searchValue = searchStudentEl.value.trim().toLowerCase();
    const selectedDepartment = filterDepartmentEl.value;
    const selectedYear = filterYearEl.value;

    return studentsData.filter((student) => {
      const matchesSearch =
        !searchValue ||
        (student.name || '').toLowerCase().includes(searchValue) ||
        (student.email || '').toLowerCase().includes(searchValue);
      const matchesDepartment = !selectedDepartment || student.department === selectedDepartment;
      const matchesYear = !selectedYear || String(student.year) === selectedYear;
      return matchesSearch && matchesDepartment && matchesYear;
    });
  }

  function renderStudentsTable() {
  const filteredStudents = getFilteredStudents();
  studentsTableBody.innerHTML = '';

  if (filteredStudents.length === 0) {
    showMessage('No students found');
    return;
  }

  showMessage('');
  const availableRooms = getAvailableRooms();

  filteredStudents.forEach((student) => {
    const row = document.createElement('tr');

    row.innerHTML = `
      <td>${student.id}</td>
      <td>${student.name || ''}</td>
      <td>${student.email || ''}</td>
      <td>${student.roll_no || ''}</td>
      <td>${student.department || ''}</td>
      <td>${student.year || ''}</td>
      <td>${student.room_number || 'Not Assigned'}</td>
      <td>
        <div class="action-group">

          <button class="edit-btn" data-id="${student.id}">
            Edit
          </button>

          <button class="delete-btn" data-id="${student.id}">
            Delete
          </button>

          <div class="dropdown">
            <button class="more-btn">⋮</button>

            <div class="dropdown-menu">

              <button 
                class="assign-btn" 
                data-id="${student.id}"
                ${availableRooms.length === 0 ? 'disabled' : ''}>
                Assign Room
              </button>

              <button 
                class="remove-btn" 
                data-id="${student.id}"
                ${!student.room_id ? 'disabled' : ''}>
                Remove Room
              </button>

            </div>
          </div>

        </div>
      </td>
    `;

    // Attach events (important)
    row.querySelector('.edit-btn')
      .addEventListener('click', () => startEditStudent(student));

    row.querySelector('.delete-btn')
      .addEventListener('click', () => deleteStudent(student.id));

    const assignBtn = row.querySelector('.assign-btn');
    if (assignBtn && !assignBtn.disabled) {
      assignBtn.addEventListener('click', () => assignRoomForStudent(student.id));
    }

    const removeBtn = row.querySelector('.remove-btn');
    if (removeBtn && !removeBtn.disabled) {
      removeBtn.addEventListener('click', () => removeStudentRoom(student.id));
    }

    studentsTableBody.appendChild(row);
  });
}
  function renderRoomsTable() {
    roomsTableBody.innerHTML = '';
    if (roomsData.length === 0) {
      showRoomMessage('No rooms found');
      return;
    }

    showRoomMessage('');
    roomsData.forEach((room) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${room.id}</td>
        <td>${room.room_number}</td>
        <td>${room.occupied}/${room.capacity}</td>
        <td></td>
      `;

      const actionCell = row.querySelector('td:last-child');
      const deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.className = 'delete-btn';
      deleteBtn.innerText = 'Delete';
      deleteBtn.addEventListener('click', () => deleteRoom(room.id));
      actionCell.appendChild(deleteBtn);
      roomsTableBody.appendChild(row);
    });
  }

  function renderNoticesTable(notices) {
    noticesTableBody.innerHTML = '';
    if (!Array.isArray(notices) || notices.length === 0) {
      showNoticeMessage('No notices available');
      return;
    }

    showNoticeMessage('');
    notices.forEach((notice) => {
      const row = document.createElement('tr');
      const createdAt = notice.created_at ? new Date(notice.created_at).toLocaleString() : '';
      row.innerHTML = `
        <td>${notice.id}</td>
        <td>${notice.title || ''}</td>
        <td>${notice.content || ''}</td>
        <td>${createdAt}</td>
        <td></td>
      `;
      const actionCell = row.querySelector('td:last-child');
      const deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.className = 'delete-btn';
      deleteBtn.innerText = 'Delete';
      deleteBtn.addEventListener('click', () => deleteNotice(notice.id));
      actionCell.appendChild(deleteBtn);
      noticesTableBody.appendChild(row);
    });
  }

  function renderMessTable(items) {
    messTableBody.innerHTML = '';
    if (!Array.isArray(items) || items.length === 0) {
      showMessMessage('No timetable available');
      return;
    }

    showMessMessage('');
    items.forEach((item) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${item.day || ''}</td>
        <td>${item.breakfast || ''}</td>
        <td>${item.lunch || ''}</td>
        <td>${item.dinner || ''}</td>
      `;
      messTableBody.appendChild(row);
    });
  }

  function logout() {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
  }

  function resetFormMode() {
    editStudentId = null;
    studentForm.reset();
    passwordInput.disabled = false;
    passwordInput.placeholder = 'Password';
    formTitle.innerText = 'Add Student';
    submitBtn.innerText = 'Add Student';
  }

  function startEditStudent(student) {
    editStudentId = student.id;
    document.getElementById('name').value = student.name || '';
    document.getElementById('email').value = student.email || '';
    document.getElementById('roll').value = student.roll_no || '';
    document.getElementById('dept').value = student.department || '';
    document.getElementById('year').value = student.year || '';
    passwordInput.value = '';
    passwordInput.disabled = true;
    passwordInput.placeholder = 'Password not required for update';
    formTitle.innerText = 'Edit Student';
    submitBtn.innerText = 'Update Student';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function loadStudents() {
    try {
      showMessage('Loading students...');
      const response = await fetch('${API_BASE}/api/students', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.status === 401) {
        logout();
        return;
      }

      if (!response.ok) {
        showMessage(data.message || 'Failed to load students');
        return;
      }

      studentsData = Array.isArray(data) ? data : [];
      renderDepartmentFilter();
      renderStudentsTable();
      updateStats();
    } catch (error) {
      showMessage('Server error while loading students');
    }
  }

  async function saveStudent() {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const roll_no = document.getElementById('roll').value.trim();
    const department = document.getElementById('dept').value.trim();
    const year = document.getElementById('year').value.trim();

    if (!name || !email || !roll_no || !department || !year) {
      showMessage('All fields are required');
      return;
    }

    if (!editStudentId && !password) {
      showMessage('Password required for new student');
      return;
    }

    if (!email.includes('@')) {
      showMessage('Invalid email format');
      return;
    }

    const parsedYear = Number(year);
    if (parsedYear < 1 || parsedYear > 4) {
      showMessage('Year must be between 1 and 4');
      return;
    }

    try {
      let url = '${API_BASE}/api/students';
      let method = 'POST';
      if (editStudentId) {
        url = `${API_BASE}/api/students/${editStudentId}`;
        method = 'PUT';
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          email,
          password,
          roll_no,
          department,
          year: parsedYear
        })
      });

      const data = await response.json();

      if (response.status === 401) {
        logout();
        return;
      }

      if (!response.ok) {
        showMessage(data.message || 'Operation failed');
        return;
      }

      showMessage(data.message || (editStudentId ? 'Student updated successfully' : 'Student added successfully'));
      resetFormMode();
      await loadStudents();
      await loadRooms();
    } catch (err) {
      showMessage('Server error');
    }
  }

  async function deleteStudent(id) {
    const confirmDelete = window.confirm('Are you sure you want to delete this student?');
    if (!confirmDelete) return;

    try {
      const response = await fetch(`${API_BASE}/api/students/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.status === 401) {
        logout();
        return;
      }

      if (!response.ok) {
        showMessage(data.message || 'Delete failed');
        return;
      }

      showMessage(data.message || 'Student deleted successfully');
      await loadStudents();
      await loadRooms();
    } catch (err) {
      showMessage('Server error while deleting');
    }
  }

  async function loadRooms() {
    try {
      showRoomMessage('Loading rooms...');
      const response = await fetch('${API_BASE}/api/rooms', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.status === 401) {
        logout();
        return;
      }

      if (!response.ok) {
        showRoomMessage(data.message || 'Failed to load rooms');
        return;
      }

      roomsData = Array.isArray(data) ? data : [];
      renderRoomsTable();
      renderStudentsTable();
      updateStats();
    } catch (err) {
      showRoomMessage('Server error while loading rooms');
    }
  }

  async function createRoom() {
    const roomNumberInput = document.getElementById('roomNumber');
    const roomCapacityInput = document.getElementById('roomCapacity');
    const room_number = roomNumberInput.value.trim();
    const capacity = Number(roomCapacityInput.value);

    if (!room_number || !capacity) {
      showRoomMessage('Room number and capacity are required');
      return;
    }

    try {
      const response = await fetch('${API_BASE}/api/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ room_number, capacity })
      });

      const data = await response.json();

      if (response.status === 401) {
        logout();
        return;
      }

      if (!response.ok) {
        showRoomMessage(data.message || 'Failed to add room');
        return;
      }

      showRoomMessage(data.message || 'Room added successfully');
      roomForm.reset();
      await loadRooms();
    } catch (err) {
      showRoomMessage('Server error while adding room');
    }
  }

  async function deleteRoom(roomId) {
    if (!window.confirm('Are you sure you want to delete this room?')) return;

    try {
      const response = await fetch(`${API_BASE}/api/rooms/${roomId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (response.status === 401) {
        logout();
        return;
      }

      if (!response.ok) {
        showRoomMessage(data.message || 'Failed to delete room');
        return;
      }

      showRoomMessage(data.message || 'Room deleted successfully');
      await loadRooms();
      await loadStudents();
    } catch (err) {
      showRoomMessage('Server error while deleting room');
    }
  }

  async function assignRoomForStudent(studentId) {
    const availableRooms = getAvailableRooms();
    if (availableRooms.length === 0) {
      showRoomMessage('Room is full');
      return;
    }

    const roomListText = availableRooms
      .map((room) => `${room.id} - ${room.room_number} (${room.occupied}/${room.capacity})`)
      .join('\n');
    const roomInput = window.prompt(`Available rooms:\n${roomListText}\n\nEnter Room ID:`);
    if (!roomInput) return;
    const roomId = Number(roomInput);
    const selectedRoom = availableRooms.find((room) => Number(room.id) === roomId);
    if (!selectedRoom) {
      showRoomMessage('Please select a valid available room');
      return;
    }

    try {
      const response = await fetch('${API_BASE}/api/rooms/assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          student_id: studentId,
          room_id: roomId
        })
      });

      const data = await response.json();

      if (response.status === 401) {
        logout();
        return;
      }

      if (!response.ok) {
        showRoomMessage(data.message || 'Failed to assign room');
        return;
      }

      showRoomMessage(data.message || 'Room assigned successfully');
      await loadRooms();
      await loadStudents();
    } catch (err) {
      showRoomMessage('Server error while assigning room');
    }
  }

  async function removeStudentRoom(studentId) {
    try {
      const response = await fetch('${API_BASE}/api/rooms/remove-assignment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ student_id: studentId })
      });

      const data = await response.json();
      if (response.status === 401) {
        logout();
        return;
      }
      if (!response.ok) {
        showRoomMessage(data.message || 'Failed to remove room assignment');
        return;
      }

      showRoomMessage(data.message || 'Student removed from room successfully');
      await loadRooms();
      await loadStudents();
    } catch (err) {
      showRoomMessage('Server error while removing room assignment');
    }
  }

  async function loadNotices() {
    try {
      showNoticeMessage('Loading notices...');
      const response = await fetch('${API_BASE}/api/notices', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();

      if (response.status === 401) {
        logout();
        return;
      }
      if (!response.ok) {
        showNoticeMessage(data.message || 'Failed to load notices');
        return;
      }
      renderNoticesTable(data);
    } catch (err) {
      showNoticeMessage('Server error while loading notices');
    }
  }

  async function createNotice() {
    const title = noticeTitleEl.value.trim();
    const content = noticeContentEl.value.trim();
    if (!title || !content) {
      showNoticeMessage('Title and content are required');
      return;
    }

    try {
      const response = await fetch('${API_BASE}/api/notices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ title, content })
      });
      const data = await response.json();

      if (response.status === 401) {
        logout();
        return;
      }
      if (!response.ok) {
        showNoticeMessage(data.message || 'Failed to add notice');
        return;
      }

      showNoticeMessage(data.message || 'Notice added successfully');
      noticeForm.reset();
      await loadNotices();
    } catch (err) {
      showNoticeMessage('Server error while adding notice');
    }
  }

  async function deleteNotice(noticeId) {
    if (!window.confirm('Delete this notice?')) return;
    try {
      const response = await fetch(`${API_BASE}/api/notices/${noticeId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.status === 401) {
        logout();
        return;
      }
      if (!response.ok) {
        showNoticeMessage(data.message || 'Failed to delete notice');
        return;
      }
      showNoticeMessage(data.message || 'Notice deleted successfully');
      await loadNotices();
    } catch (err) {
      showNoticeMessage('Server error while deleting notice');
    }
  }

  async function loadMessTimetable() {
    try {
      showMessMessage('Loading timetable...');
      const response = await fetch('${API_BASE}/api/mess', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.status === 401) {
        logout();
        return;
      }
      if (!response.ok) {
        showMessMessage(data.message || 'Failed to load timetable');
        return;
      }
      renderMessTable(data);
    } catch (err) {
      showMessMessage('Server error while loading timetable');
    }
  }

  async function saveMessTimetable() {
    const day = messDayEl.value;
    const breakfast = messBreakfastEl.value.trim();
    const lunch = messLunchEl.value.trim();
    const dinner = messDinnerEl.value.trim();

    if (!day || !breakfast || !lunch || !dinner) {
      showMessMessage('Day, breakfast, lunch and dinner are required');
      return;
    }

    try {
      const response = await fetch('${API_BASE}/api/mess', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ day, breakfast, lunch, dinner })
      });
      const data = await response.json();
      if (response.status === 401) {
        logout();
        return;
      }
      if (!response.ok) {
        showMessMessage(data.message || 'Failed to save timetable');
        return;
      }
      showMessMessage(data.message || 'Timetable saved successfully');
      messForm.reset();
      await loadMessTimetable();
    } catch (err) {
      showMessMessage('Server error while saving timetable');
    }
  }

  studentForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    await saveStudent();
  });

  roomForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    await createRoom();
  });
  noticeForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    await createNotice();
  });
  messForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    await saveMessTimetable();
  });

  searchStudentEl.addEventListener('input', renderStudentsTable);
  filterDepartmentEl.addEventListener('change', renderStudentsTable);
  filterYearEl.addEventListener('change', renderStudentsTable);

  logoutBtn.addEventListener('click', logout);
  updateWelcomeText();
  loadStudents();
  loadRooms();
  loadNotices();
  loadMessTimetable();
});
