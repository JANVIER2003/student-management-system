const SUBJECTS = [
  { id: 'mathematics', label: 'Mathematics' },
  { id: 'programming', label: 'Programming' },
  { id: 'database', label: 'Database' },
  { id: 'webDevelopment', label: 'Web Development' }
];

function calculateTotal(results) {
  if (!Array.isArray(results) || results.length === 0) {
    return 0;
  }

  let total = 0;

  results.forEach((result) => {
    total = total + Number(result.mark);
  });

  return total;
}

function calculateAverage(results) {
  if (!Array.isArray(results) || results.length === 0) {
    return 0;
  }

  const total = calculateTotal(results);
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

function getStatus(average) {
  if (average >= 50) {
    return 'PASSED';
  }

  return 'FAILED';
}

function showSummary(student) {
  const summaryBox = document.getElementById('resultSummary');

  if (!summaryBox) {
    return;
  }

  if (!student) {
    summaryBox.innerHTML = 'Select a student to see result details.';
    return;
  }

  const results = student.results || [];
  const total = calculateTotal(results);
  const average = calculateAverage(results);
  const grade = calculateGrade(average);
  const status = getStatus(average);

  summaryBox.innerHTML = `
    <p><strong>Student:</strong> ${student.firstName} ${student.lastName}</p>
    <p><strong>Programme:</strong> ${student.programme}</p>
    <p><strong>Total:</strong> ${total}</p>
    <p><strong>Average:</strong> ${average.toFixed(1)}%</p>
    <p><strong>Grade:</strong> ${grade}</p>
    <p><strong>Status:</strong> <span class="status-badge ${status === 'PASSED' ? 'status-passed' : 'status-failed'}">${status}</span></p>
  `;
}

function fillResultForm(student) {
  SUBJECTS.forEach((subject) => {
    const input = document.getElementById(subject.id);
    const result = (student.results || []).find((item) => item.subject === subject.label);
    input.value = result ? result.mark : 0;
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const studentSelect = document.getElementById('studentSelect');
  const resultsForm = document.getElementById('resultsForm');

  if (!studentSelect || !resultsForm) {
    return;
  }

  const students = Storage.getStudents();

  if (!students.length) {
    studentSelect.innerHTML = '<option value="">No students available</option>';
    return;
  }

  studentSelect.innerHTML = '<option value="">Select a student</option>' +
    students
      .map((student) => `<option value="${student.id}">${student.id} - ${student.firstName} ${student.lastName}</option>`)
      .join('');

  studentSelect.addEventListener('change', (event) => {
    const selectedStudent = Storage.getStudentById(event.target.value);
    fillResultForm(selectedStudent || { results: [] });
    showSummary(selectedStudent);
  });

  resultsForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const studentId = studentSelect.value;

    if (!studentId) {
      alert('Please choose a student first.');
      return;
    }

    const student = Storage.getStudentById(studentId);

    if (!student) {
      alert('Student was not found.');
      return;
    }

    const newResults = SUBJECTS.map((subject) => {
      const value = Number(document.getElementById(subject.id).value);

      if (isNaN(value) || value < 0 || value > 100) {
        alert(`${subject.label} mark must be between 0 and 100.`);
        throw new Error('Invalid mark');
      }

      return {
        subject: subject.label,
        mark: value
      };
    });

    student.results = newResults;
    Storage.updateStudent(student);
    showSummary(student);
    alert('Results saved successfully!');
  });
});
