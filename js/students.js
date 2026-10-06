function calculateAverage(results) {
  if (!Array.isArray(results) || results.length === 0) {
    return 0;
  }

  let total = 0;

  results.forEach((item) => {
    total = total + Number(item.mark);
  });

  return total / results.length;
}

function calculateGrade(average) {
  if (average >= 80) {
    return 'A';
  }

  if (average >= 70) {
    return 'B';
  }

  if (average >= 60) {
    return 'C';
  }

  if (average >= 50) {
    return 'D';
  }

  return 'F';
}

function getStudentStatus(average) {
  return average >= 50 ? 'PASSED' : 'FAILED';
}

function getFullName(student) {
  return `${student.firstName} ${student.lastName}`;
}

function renderStudentsTable() {
  const students = Storage.getStudents();
  const tableBody = document.getElementById('studentsTableBody');
  const searchInput = document.getElementById('searchInput');
  const programmeFilter = document.getElementById('programmeFilter');

  if (!tableBody) {
    return;
  }

  const searchText = (searchInput ? searchInput.value : '').trim().toLowerCase();
  const selectedProgramme = programmeFilter ? programmeFilter.value : 'All';

  let filteredStudents = students.filter((student) => {
    const studentIdMatch = student.id.toLowerCase().includes(searchText);
    const firstNameMatch = student.firstName.toLowerCase().includes(searchText);
    const lastNameMatch = student.lastName.toLowerCase().includes(searchText);
    const searchMatch = !searchText || studentIdMatch || firstNameMatch || lastNameMatch;

    const programmeMatch = selectedProgramme === 'All' || student.programme === selectedProgramme;

    return searchMatch && programmeMatch;
  });

  if (!filteredStudents.length) {
    tableBody.innerHTML = '<tr><td colspan="9" class="empty-message">No students found.</td></tr>';
    return;
  }

  tableBody.innerHTML = filteredStudents
    .map((student) => {
      const average = calculateAverage(student.results || []);
      const grade = calculateGrade(average);
      const status = getStudentStatus(average);

      return `
        <tr>
          <td>${student.id}</td>
          <td>${getFullName(student)}</td>
          <td>${student.gender}</td>
          <td>${student.programme}</td>
          <td>${student.year}</td>
          <td>${average.toFixed(1)}%</td>
          <td>${grade}</td>
          <td><span class="status-badge ${status === 'PASSED' ? 'status-passed' : 'status-failed'}">${status}</span></td>
          <td>
            <div class="action-links">
              <a href="student-details.html?id=${student.id}">View</a>
              <a href="add-student.html?id=${student.id}">Edit</a>
              <button type="button" class="delete-button" data-id="${student.id}">Delete</button>
            </div>
          </td>
        </tr>
      `;
    })
    .join('');

  const deleteButtons = document.querySelectorAll('.delete-button');
  deleteButtons.forEach((button) => {
    button.addEventListener('click', function () {
      const studentId = this.getAttribute('data-id');
      const confirmDelete = window.confirm('Are you sure you want to delete this student?');

      if (confirmDelete) {
        Storage.deleteStudent(studentId);
        renderStudentsTable();

        if (typeof loadDashboard === 'function') {
          loadDashboard();
        }
      }
    });
  });
}

function populateProgrammeFilter() {
  const select = document.getElementById('programmeFilter');

  if (!select) {
    return;
  }

  const students = Storage.getStudents();
  const programmes = ['All'];

  students.forEach((student) => {
    if (!programmes.includes(student.programme)) {
      programmes.push(student.programme);
    }
  });

  select.innerHTML = programmes
    .map((programme) => `<option value="${programme}">${programme === 'All' ? 'All Programmes' : programme}</option>`)
    .join('');
}

function renderStudentDetails() {
  const container = document.getElementById('studentDetailsContent');

  if (!container) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const studentId = params.get('id');

  if (!studentId) {
    container.innerHTML = '<p class="empty-message">No student selected.</p>';
    return;
  }

  const student = Storage.getStudentById(studentId);

  if (!student) {
    container.innerHTML = '<p class="empty-message">Student not found.</p>';
    return;
  }

  const average = calculateAverage(student.results || []);
  const grade = calculateGrade(average);
  const status = getStudentStatus(average);

  const resultRows = (student.results || []).length
    ? (student.results || [])
        .map((item) => `<tr><td>${item.subject}</td><td>${item.mark}</td></tr>`)
        .join('')
    : '<tr><td colspan="2" class="empty-message">No academic results available.</td></tr>';

  container.innerHTML = `
    <h3>Student Details</h3>
    <div class="student-card">
      <div class="info-box"><span>Student ID</span><strong>${student.id}</strong></div>
      <div class="info-box"><span>Full Name</span><strong>${getFullName(student)}</strong></div>
      <div class="info-box"><span>Gender</span><strong>${student.gender}</strong></div>
      <div class="info-box"><span>Date of Birth</span><strong>${student.dateOfBirth}</strong></div>
      <div class="info-box"><span>Email</span><strong>${student.email}</strong></div>
      <div class="info-box"><span>Phone</span><strong>${student.phone}</strong></div>
      <div class="info-box"><span>Programme</span><strong>${student.programme}</strong></div>
      <div class="info-box"><span>Year</span><strong>${student.year}</strong></div>
    </div>

    <div class="result-list">
      <h3>Academic Performance</h3>
      <p>Total: ${student.results ? student.results.reduce((sum, item) => sum + Number(item.mark), 0) : 0}</p>
      <p>Average: ${average.toFixed(1)}%</p>
      <p>Grade: ${grade}</p>
      <p>Status: <span class="status-badge ${status === 'PASSED' ? 'status-passed' : 'status-failed'}">${status}</span></p>

      <table>
        <thead>
          <tr>
            <th>Subject</th>
            <th>Mark</th>
          </tr>
        </thead>
        <tbody>
          ${resultRows}
        </tbody>
      </table>
    </div>
  `;
}

function saveStudent(form) {
  const studentId = form.studentId.value.trim();
  const firstName = form.firstName.value.trim();
  const lastName = form.lastName.value.trim();
  const gender = form.gender.value.trim();
  const dateOfBirth = form.dateOfBirth.value.trim();
  const email = form.email.value.trim();
  const phone = form.phone.value.trim();
  const programme = form.programme.value;
  const year = form.year.value;

  if (!studentId || !firstName || !lastName || !gender || !dateOfBirth || !email || !phone || !programme || !year) {
    alert('Please fill in all required fields.');
    return;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    alert('Please enter a valid email address.');
    return;
  }

  if (phone.length < 7 || phone.length > 15) {
    alert('Please enter a valid phone number.');
    return;
  }

  const existingStudent = Storage.getStudentById(studentId);
  const isEditing = !!existingStudent;

  if (!isEditing && Storage.getStudents().some((student) => student.id === studentId)) {
    alert('Student ID already exists. Please use a unique ID.');
    return;
  }

  const student = {
    id: studentId.toUpperCase(),
    firstName: firstName,
    lastName: lastName,
    gender: gender,
    dateOfBirth: dateOfBirth,
    email: email,
    phone: phone,
    programme: programme,
    year: year,
    results: isEditing ? existingStudent.results || [] : []
  };

  if (isEditing) {
    if (studentId !== existingStudent.id) {
      Storage.deleteStudent(existingStudent.id);
      Storage.addStudent(student);
    } else {
      Storage.updateStudent(student);
    }
  } else {
    Storage.addStudent(student);
  }

  alert('Student saved successfully!');
  window.location.href = 'students.html';
}

document.addEventListener('DOMContentLoaded', () => {
  const tableBody = document.getElementById('studentsTableBody');
  const searchInput = document.getElementById('searchInput');
  const programmeFilter = document.getElementById('programmeFilter');
  const studentForm = document.getElementById('studentForm');
  const studentDetailsContainer = document.getElementById('studentDetailsContent');

  if (tableBody) {
    populateProgrammeFilter();
    renderStudentsTable();

    searchInput.addEventListener('input', renderStudentsTable);
    programmeFilter.addEventListener('change', renderStudentsTable);
  }

  if (studentForm) {
    const params = new URLSearchParams(window.location.search);
    const editingId = params.get('id');

    if (editingId) {
      const studentToEdit = Storage.getStudentById(editingId);

      if (studentToEdit) {
        document.getElementById('pageTitle').textContent = '✏️ Edit Student';
        document.getElementById('submitButton').textContent = '💾 Update Student';

        document.getElementById('studentId').value = studentToEdit.id;
        document.getElementById('firstName').value = studentToEdit.firstName;
        document.getElementById('lastName').value = studentToEdit.lastName;
        document.getElementById('gender').value = studentToEdit.gender;
        document.getElementById('dateOfBirth').value = studentToEdit.dateOfBirth;
        document.getElementById('email').value = studentToEdit.email;
        document.getElementById('phone').value = studentToEdit.phone;
        document.getElementById('programme').value = studentToEdit.programme;
        document.getElementById('year').value = studentToEdit.year;
      }
    }

    studentForm.addEventListener('submit', (event) => {
      event.preventDefault();
      saveStudent(studentForm);
    });
  }

  if (studentDetailsContainer) {
    renderStudentDetails();
  }
});
