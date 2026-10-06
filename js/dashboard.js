function calculateAverageForStudent(student) {
  const results = student.results || [];

  if (!results.length) {
    return 0;
  }

  let total = 0;

  results.forEach((item) => {
    total = total + Number(item.mark);
  });

  return total / results.length;
}

function getGradeFromAverage(average) {
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

function getStatusFromAverage(average) {
  if (average >= 50) {
    return 'PASSED';
  }

  return 'FAILED';
}

function loadDashboard() {
  const students = window.Storage.getStudents();
  const totalStudents = document.getElementById('totalStudents');
  const passedStudents = document.getElementById('passedStudents');
  const failedStudents = document.getElementById('failedStudents');
  const averagePerformance = document.getElementById('averagePerformance');
  const recentStudentsTable = document.getElementById('recentStudentsTable');

  if (!students || students.length === 0) {
    totalStudents.textContent = '0';
    passedStudents.textContent = '0';
    failedStudents.textContent = '0';
    averagePerformance.textContent = '0%';
    recentStudentsTable.innerHTML = '<tr><td colspan="5" class="empty-message">No students available.</td></tr>';
    return;
  }

  let passedCount = 0;
  let totalAverage = 0;

  students.forEach((student) => {
    const average = calculateAverageForStudent(student);
    totalAverage = totalAverage + average;

    if (average >= 50) {
      passedCount = passedCount + 1;
    }
  });

  const failedCount = students.length - passedCount;
  const overallAverage = totalAverage / students.length;

  totalStudents.textContent = students.length;
  passedStudents.textContent = passedCount;
  failedStudents.textContent = failedCount;
  averagePerformance.textContent = overallAverage.toFixed(1) + '%';

  recentStudentsTable.innerHTML = students
    .slice(0, 5)
    .map((student) => {
      const average = calculateAverageForStudent(student);
      const status = getStatusFromAverage(average);
      const badgeClass = status === 'PASSED' ? 'status-passed' : 'status-failed';

      return `
        <tr>
          <td>${student.id}</td>
          <td>${student.firstName} ${student.lastName}</td>
          <td>${student.programme}</td>
          <td>${average.toFixed(1)}%</td>
          <td><span class="status-badge ${badgeClass}">${status}</span></td>
        </tr>
      `;
    })
    .join('');
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('totalStudents')) {
    loadDashboard();
  }
});
