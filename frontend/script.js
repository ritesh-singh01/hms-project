document.addEventListener('DOMContentLoaded', () => {
  let editStudentId = null;
  const token = localStorage.getItem('token');

  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  const statusEl = document.getElementById('status');
  const studentsTableBody = document.getElementById('studentsTableBody');
  const studentForm = document.getElementById('studentForm');
  const formTitle = document.getElementById('formTitle');
  const submitBtn = document.getElementById('submitBtn');
  const passwordInput = document.getElementById('password');
  const logoutBtn = document.getElementById('logoutBtn');
  const roomStatusEl = document.getElementById('roomStatus');
  const roomForm = document.getElementById('roomForm');
  const roomsTableBody = document.getElementById('roomsTableBody');

  if (
    !statusEl || !studentsTableBody || !studentForm || !formTitle || !submitBtn || !passwordInput || !logoutBtn ||
    !roomStatusEl || !roomForm || !roomsTableBody
  ) {
    return;
  }

  function showMessage(message) {
    statusEl.innerText = message || '';
  }

  function showRoomMessage(message) {
    roomStatusEl.innerText = message || '';
  }

  function logout() {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
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
      const response = await fetch('http://localhost:5000/api/students', {
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

      if (!Array.isArray(data) || data.length === 0) {
        showMessage('No students found');
        studentsTableBody.innerHTML = '';
        return;
      }

      showMessage('');
      studentsTableBody.innerHTML = '';

      data.forEach((student) => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${student.id}</td>
          <td>${student.name || ''}</td>
          <td>${student.email || ''}</td>
          <td>${student.roll_no || ''}</td>
          <td>${student.department || ''}</td>
          <td>${student.year || ''}</td>
          <td>${student.room_number || '-'}</td>
          <td></td>
        `;

        const actionCell = row.querySelector('td:last-child');
        const editBtn = document.createElement('button');
        editBtn.className = 'edit-btn';
        editBtn.type = 'button';
        editBtn.innerText = 'Edit';
        editBtn.addEventListener('click', () => startEditStudent(student));

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.type = 'button';
        deleteBtn.innerText = 'Delete';
        deleteBtn.addEventListener('click', () => deleteStudent(student.id));

        actionCell.appendChild(editBtn);
        actionCell.appendChild(deleteBtn);
        studentsTableBody.appendChild(row);
      });
    } catch (error) {
      console.error(error);
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
      let url = 'http://localhost:5000/api/students';
      let method = 'POST';
      if (editStudentId) {
        url = `http://localhost:5000/api/students/${editStudentId}`;
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
      console.error(err);
      showMessage('Server error');
    }
  }

  async function deleteStudent(id) {
    const confirmDelete = window.confirm('Are you sure you want to delete this student?');
    if (!confirmDelete) return;

    try {
      const response = await fetch(`http://localhost:5000/api/students/${id}`, {
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
      console.error(err);
      showMessage('Server error while deleting');
    }
  }

  async function loadRooms() {
    try {
      showRoomMessage('Loading rooms...');
      const response = await fetch('http://localhost:5000/api/rooms', {
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

      if (!Array.isArray(data) || data.length === 0) {
        showRoomMessage('No rooms found');
        roomsTableBody.innerHTML = '';
        return;
      }

      showRoomMessage('');
      roomsTableBody.innerHTML = '';

      data.forEach((room) => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${room.id}</td>
          <td>${room.room_number}</td>
          <td>${room.capacity}</td>
          <td>${room.occupied}</td>
          <td></td>
        `;

        const actionCell = row.querySelector('td:last-child');

        const assignBtn = document.createElement('button');
        assignBtn.type = 'button';
        assignBtn.className = 'edit-btn';
        assignBtn.innerText = 'Assign Student';
        assignBtn.addEventListener('click', () => assignRoom(room.id));

        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerText = 'Delete';
        deleteBtn.addEventListener('click', () => deleteRoom(room.id));

        actionCell.appendChild(assignBtn);
        actionCell.appendChild(deleteBtn);
        roomsTableBody.appendChild(row);
      });
    } catch (err) {
      console.error(err);
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
      const response = await fetch('http://localhost:5000/api/rooms', {
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
      console.error(err);
      showRoomMessage('Server error while adding room');
    }
  }

  async function deleteRoom(roomId) {
    if (!window.confirm('Are you sure you want to delete this room?')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/rooms/${roomId}`, {
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
    } catch (err) {
      console.error(err);
      showRoomMessage('Server error while deleting room');
    }
  }

  async function assignRoom(roomId) {
    const studentInput = window.prompt('Enter Student ID to assign this room:');
    if (!studentInput) return;

    const studentId = Number(studentInput);
    if (!Number.isInteger(studentId) || studentId <= 0) {
      showRoomMessage('Invalid student ID');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/rooms/assign', {
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
      console.error(err);
      showRoomMessage('Server error while assigning room');
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

  logoutBtn.addEventListener('click', logout);
  loadStudents();
  loadRooms();
});