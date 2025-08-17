function showCalculator(type) {
  document.querySelectorAll(".calculator-section").forEach((section) => {
    section.classList.remove("active");
  });

  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.remove("active");
  });

  document.getElementById(type + "-calc").classList.add("active");

  event.target.classList.add("active");
}

function addSemester() {
  const container = document.getElementById("semesters-container");
  const semesterCount = container.children.length + 1;

  const semesterDiv = document.createElement("div");
  semesterDiv.className = "semester-group";
  semesterDiv.innerHTML = `
                <div class="semester-title">
                    Semester ${semesterCount}
                    <button class="remove-semester" onclick="removeSemester(this)">Remove</button>
                </div>
                <div class="input-row">
                    <input type="text" placeholder="Semester Name" class="semester-name">
                    <input type="number" step="0.01" min="0" max="4" placeholder="GPA (0-4)" class="semester-gpa">
                    <input type="number" step="1" min="1" placeholder="Credit Hours" class="semester-credits">
                </div>
            `;

  container.appendChild(semesterDiv);
}

function removeSemester(button) {
  button.closest(".semester-group").remove();
}

function calculateCGPA() {
  const semesters = document.querySelectorAll(".semester-group");
  let totalPoints = 0;
  let totalCredits = 0;
  let validSemesters = 0;

  semesters.forEach((semester) => {
    const gpa = parseFloat(semester.querySelector(".semester-gpa").value);
    const credits = parseFloat(
      semester.querySelector(".semester-credits").value
    );

    if (!isNaN(gpa) && !isNaN(credits) && gpa >= 0 && gpa <= 4 && credits > 0) {
      totalPoints += gpa * credits;
      totalCredits += credits;
      validSemesters++;
    }
  });

  if (validSemesters > 0 && totalCredits > 0) {
    const cgpa = totalPoints / totalCredits;
    document.getElementById("cgpa-value").textContent = cgpa.toFixed(2);
    document.getElementById("cgpa-result").classList.add("show");
  } else {
    alert(
      "Please enter valid GPA and credit values for at least one semester."
    );
  }
}

function addCourse() {
  const container = document.getElementById("courses-container");
  const courseDiv = document.createElement("div");
  courseDiv.className = "input-row";
  courseDiv.innerHTML = `
                <input type="text" placeholder="Course Name" class="course-name">
                <select class="course-grade">
                    <option value="">Select Grade</option>
                    <option value="4.0">A+ (4.0)</option>
                    <option value="4.0">A (4.0)</option>
                    <option value="3.7">A- (3.7)</option>
                    <option value="3.3">B+ (3.3)</option>
                    <option value="3.0">B (3.0)</option>
                    <option value="2.7">B- (2.7)</option>
                    <option value="2.3">C+ (2.3)</option>
                    <option value="2.0">C (2.0)</option>
                    <option value="1.0">D (1.0)</option>
                    <option value="0.0">F (0.0)</option>
                </select>
                <input type="number" step="1" min="1" placeholder="Credits" class="course-credits">
                <button class="btn remove-semester" onclick="removeCourse(this)">Remove</button>
            `;
  container.appendChild(courseDiv);
}

function removeCourse(button) {
  button.closest(".input-row").remove();
}

function calculateGPA() {
  const courses = document.querySelectorAll("#courses-container .input-row");
  let totalPoints = 0;
  let totalCredits = 0;
  let validCourses = 0;

  courses.forEach((course) => {
    const grade = parseFloat(course.querySelector(".course-grade").value);
    const credits = parseFloat(course.querySelector(".course-credits").value);

    if (!isNaN(grade) && !isNaN(credits) && credits > 0) {
      totalPoints += grade * credits;
      totalCredits += credits;
      validCourses++;
    }
  });

  if (validCourses > 0 && totalCredits > 0) {
    const gpa = totalPoints / totalCredits;
    document.getElementById("gpa-value").textContent = gpa.toFixed(2);
    document.getElementById("gpa-result").classList.add("show");
  } else {
    alert("Please enter valid grades and credits for at least one course.");
  }
}

function addGradeCourse() {
  const container = document.getElementById("grade-courses-container");
  const courseDiv = document.createElement("div");
  courseDiv.className = "input-row";
  courseDiv.innerHTML = `
                <input type="text" placeholder="Subject">
                <select class="grade-letter">
                    <option value="">Select Grade</option>
                    <option value="4.0">A+</option>
                    <option value="4.0">A</option>
                    <option value="3.7">A-</option>
                    <option value="3.3">B+</option>
                    <option value="3.0">B</option>
                    <option value="2.7">B-</option>
                    <option value="2.3">C+</option>
                    <option value="2.0">C</option>
                    <option value="1.0">D</option>
                    <option value="0.0">F</option>
                </select>
                <input type="number" step="1" min="1" placeholder="Credits" class="grade-credits">
                <button class="btn remove-semester" onclick="removeGradeCourse(this)">Remove</button>
            `;
  container.appendChild(courseDiv);
}

function removeGradeCourse(button) {
  button.closest(".input-row").remove();
}

function calculateGradeCGPA() {
  const courses = document.querySelectorAll(
    "#grade-courses-container .input-row"
  );
  let totalPoints = 0;
  let totalCredits = 0;
  let validCourses = 0;

  courses.forEach((course) => {
    const grade = parseFloat(course.querySelector(".grade-letter").value);
    const credits = parseFloat(course.querySelector(".grade-credits").value);

    if (!isNaN(grade) && !isNaN(credits) && credits > 0) {
      totalPoints += grade * credits;
      totalCredits += credits;
      validCourses++;
    }
  });

  if (validCourses > 0 && totalCredits > 0) {
    const cgpa = totalPoints / totalCredits;
    document.getElementById("grade-cgpa-value").textContent = cgpa.toFixed(2);
    document.getElementById("grade-result").classList.add("show");
  } else {
    alert("Please enter valid grades and credits for at least one course.");
  }
}

function calculateAttendance() {
  const totalClasses = parseFloat(
    document.getElementById("total-classes").value
  );
  const attendedClasses = parseFloat(
    document.getElementById("attended-classes").value
  );

  if (
    isNaN(totalClasses) ||
    isNaN(attendedClasses) ||
    totalClasses <= 0 ||
    attendedClasses < 0
  ) {
    alert("Please enter valid numbers for total and attended classes.");
    return;
  }

  if (attendedClasses > totalClasses) {
    alert("Attended classes cannot be more than total classes.");
    return;
  }

  const attendancePercentage = (attendedClasses / totalClasses) * 100;
  document.getElementById("attendance-percentage").textContent =
    attendancePercentage.toFixed(1) + "%";
  document.getElementById("attendance-result").classList.add("show");
}

function calculateRequiredClasses() {
  const currentAttendance = parseFloat(
    document.getElementById("current-attendance").value
  );
  const targetAttendance = parseFloat(
    document.getElementById("target-attendance").value
  );
  const currentTotal = parseFloat(
    document.getElementById("current-total").value
  );

  if (
    isNaN(currentAttendance) ||
    isNaN(targetAttendance) ||
    isNaN(currentTotal)
  ) {
    alert("Please enter valid numbers for all fields.");
    return;
  }

  if (
    currentAttendance < 0 ||
    currentAttendance > 100 ||
    targetAttendance < 0 ||
    targetAttendance > 100
  ) {
    alert("Attendance percentages must be between 0 and 100.");
    return;
  }

  if (targetAttendance <= currentAttendance) {
    document.getElementById("required-classes").textContent = "0";
    document.getElementById("required-result").classList.add("show");
    return;
  }

  const currentAttended = (currentAttendance / 100) * currentTotal;
  const requiredClasses = Math.ceil(
    (targetAttendance * currentTotal - 100 * currentAttended) /
      (100 - targetAttendance)
  );

  document.getElementById("required-classes").textContent = Math.max(
    0,
    requiredClasses
  );
  document.getElementById("required-result").classList.add("show");
}

document.getElementById("year").textContent = new Date().getFullYear();

document.addEventListener("DOMContentLoaded", function () {
  addCourse();
});
