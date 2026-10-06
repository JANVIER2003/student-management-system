const STORAGE_KEY = 'studentManagementSystem';

const Storage = {
  getStudents() {
    const data = localStorage.getItem(STORAGE_KEY);

    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(window.studentSeedData));
      return [...window.studentSeedData];
    }

    try {
      return JSON.parse(data);
    } catch (error) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(window.studentSeedData));
      return [...window.studentSeedData];
    }
  },

  saveStudents(students) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
  },

  addStudent(student) {
    const students = this.getStudents();
    students.push(student);
    this.saveStudents(students);
  },

  updateStudent(updatedStudent) {
    let students = this.getStudents();

    students = students.map((student) => {
      if (student.id === updatedStudent.id) {
        return updatedStudent;
      }
      return student;
    });

    this.saveStudents(students);
  },

  deleteStudent(studentId) {
    const students = this.getStudents();
    const newList = students.filter((student) => student.id !== studentId);
    this.saveStudents(newList);
  },

  getStudentById(studentId) {
    const students = this.getStudents();
    return students.find((student) => student.id === studentId) || null;
  }
};

window.Storage = Storage;
