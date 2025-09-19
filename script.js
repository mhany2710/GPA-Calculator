// Store the courses
let courses = [];

let language = "en";
let gradingSystem = "old"; // 'old' or 'new'

// Function to change the language
function changeLanguage(lang) {
	language = lang;
	applyTranslations();
}

// Function to change the grading system
function changeGradingSystem(system) {
	gradingSystem = system;
	updateGradeOptions();
	applyTranslations();
	// Recalculate GPA if courses exist
	if (courses.length > 0) {
		calculateGPA();
	}
}

$(".close").click(function () {
	$(this).parent(".alert").fadeOut();
});

// Apply translations based on the selected language
function applyTranslations() {
	const translations = {
		en: {
			alertLabel:
				"Courses list is autosaved,\n you can close the tab and come back next term!",
			gradeLabel: "Grade:",
			creditLabel: "Credit Hours:",
			hoursLabel2: "2 Hours",
			hoursLabel3: "3 Hours",
			courseNaming: "Course Name:",
			addCourseLabel: "Add Course",
			removeCourseLabel: "Remove",
			gpaLabel: "Your GPA:",
			gradingSystemLabel: "Grading System:",
			oldSystem: "Old System",
			newSystem: "New System",
		},
		ar: {
			alertLabel:
				"درجات المقررات بتتحفظ على جهازك\n عشان مش كل ترم تكتب كل المواد",
			gradeLabel: "الدرجة:",
			courseNaming: "اسم المقرر",
			creditLabel: "عدد الساعات:",
			hoursLabel2: "٢ ساعة",
			hoursLabel3: "٣ ساعات ",
			addCourseLabel: "أضف المادة",
			removeCourseLabel: "إزالة",
			gpaLabel: "المعدل التراكمي:",
			gradingSystemLabel: "نظام التقديرات:",
			oldSystem: "النظام القديم",
			newSystem: "النظام الجديد",
		},
	};
	const translation = translations[language];

	// Apply translations to HTML elements
	document.getElementById("alert").innerText = translation.alertLabel;

	document.getElementById("gradeLabel").textContent = translation.gradeLabel;
	document.getElementById("courseNaming").textContent =
		translation.courseNaming;

	document.getElementById("creditLabel").textContent = translation.creditLabel;
	document.getElementById("hoursLabel2").textContent = translation.hoursLabel2;
	document.getElementById("hoursLabel3").textContent = translation.hoursLabel3;

	document.getElementById("addCourseLabel").textContent =
		translation.addCourseLabel;
	document.getElementById("gpaLabel").textContent = translation.gpaLabel;
	document.getElementById("gradingSystemLabel").textContent =
		translation.gradingSystemLabel;
	document.getElementById("oldSystemBtn").textContent = translation.oldSystem;
	document.getElementById("newSystemBtn").textContent = translation.newSystem;

	// Apply translations to existing course list
	const courseList = document.getElementById("courseList");
	for (let i = 0; i < courses.length; i++) {
		const listItem = courseList.children[i];
		const removeButton = listItem.querySelector(".removeButton");
		removeButton.textContent = translation.removeCourseLabel;
	}
}

function updateGradeOptions() {
	const gradeSelect = document.getElementById("grade");
	gradeSelect.innerHTML = ""; // Clear existing options

	let grades;
	if (gradingSystem === "new") {
		grades = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "F"];
	} else {
		grades = ["A+", "A", "B+", "B", "C+", "C", "D+", "D", "F"];
	}

	for (const grade of grades) {
		const option = document.createElement("option");
		option.value = grade;
		option.textContent = grade;
		gradeSelect.appendChild(option);
	}

	// Style the active button
	if (gradingSystem === "new") {
		document.getElementById("newSystemBtn").classList.add("active");
		document.getElementById("oldSystemBtn").classList.remove("active");
	} else {
		document.getElementById("oldSystemBtn").classList.add("active");
		document.getElementById("newSystemBtn").classList.remove("active");
	}
}

// Load saved courses from local storage (if any)
if (localStorage.getItem("courses")) {
	courses = JSON.parse(localStorage.getItem("courses"));
	displayCourses();
	calculateGPA();
	applyTranslations(); // Update translations after loading saved courses
	document.getElementById("alert").parentNode.style.display = "none";
}

// Add a course to the list
function addCourse() {
	const gradeSelect = document.getElementById("grade");
	const courseNameInput = document.getElementById("courseName");
	const credit = 3;

	const grade = gradeSelect.value;
	const courseName = courseNameInput.value || "Unnamed Course";

	courses.push({ courseName, grade, credit });
	saveCourses(); // Save courses to local storage

	// Create a new list item to display the course
	const listItem = document.createElement("li");
	listItem.textContent = `${courseName}: ${grade} (${credit} credit${
		credit === 1 ? "" : "s"
	})`;

	const removeButton = document.createElement("button");
	removeButton.classList.add("removeButton");
	removeButton.textContent = "Remove";
	removeButton.addEventListener("click", () => {
		removeCourse(listItem);
	});

	listItem.appendChild(removeButton);

	const courseList = document.getElementById("courseList");
	courseList.appendChild(listItem);

	// Clear the input fields
	gradeSelect.selectedIndex = 0;
	const creditInputs = document.getElementsByName("credit");
	for (const creditInput of creditInputs) {
		creditInput.checked = false;
	}
	courseNameInput.value = "";

	// Calculate GPA
	calculateGPA();
	applyTranslations(); // Update translations after adding a course
}

// Remove a course from the list
function removeCourse(listItem) {
	const courseList = document.getElementById("courseList");
	const index = Array.from(courseList.children).indexOf(listItem);

	if (index !== -1) {
		courses.splice(index, 1);
		saveCourses(); // Save courses to local storage
		courseList.removeChild(listItem);
		calculateGPA();
		applyTranslations(); // Update translations after removing a course
	}
}

// Save the courses to local storage
function saveCourses() {
	localStorage.setItem("courses", JSON.stringify(courses));
}

// Display the saved courses on the page
function displayCourses() {
	const courseList = document.getElementById("courseList");
	courseList.innerHTML = ""; // Clear the existing list

	for (const course of courses) {
		const { courseName, grade, credit } = course;

		const listItem = document.createElement("li");
		listItem.textContent = `${courseName}: ${grade} (${credit} credit${
			credit === 1 ? "" : "s"
		})`;

		const removeButton = document.createElement("button");
		removeButton.classList.add("removeButton");
		removeButton.textContent = "Remove";
		removeButton.addEventListener("click", () => {
			removeCourse(listItem);
		});

		listItem.appendChild(removeButton);

		courseList.appendChild(listItem);
	}
}

// Calculate the GPA
function calculateGPA() {
	let totalCredits = 0;
	let totalGradePoints = 0;

	for (const course of courses) {
		const { grade, credit } = course;
		const gradePoints = getGradePoints(grade);

		totalCredits += credit;
		totalGradePoints += gradePoints * credit;
	}
	const gpa = (totalGradePoints / totalCredits).toFixed(2);
	document.querySelector("#gpa").textContent = gpa;
	if (document.querySelector("#gpa").textContent == "NaN") {
		document.querySelector("#gpa").textContent = "0.0";
	}
	document.getElementById("totalScore").textContent = totalGradePoints.toFixed(2);
	document.getElementById("totalCredit").textContent = totalCredits;
}

// convert grade to grade points
function getGradePoints(grade) {
	if (gradingSystem === "new") {
		switch (grade) {
			case "A+":
				return 4.0;
			case "A":
				return 3.7;
			case "A-":
				return 3.4;
			case "B+":
				return 3.2;
			case "B":
				return 3.0;
			case "B-":
				return 2.8;
			case "C+":
				return 2.6;
			case "C":
				return 2.4;
			case "C-":
				return 2.2;
			case "D+":
				return 2;
			case "D":
				return 1.5;
			case "F":
				return 0.0;
			default:
				return 0.0;
		}
	} else {
		// Old system
		switch (grade) {
			case "A+":
				return 4.0;
			case "A":
				return 3.75;
			case "B+":
				return 3.4;
			case "B":
				return 3.0;
			case "C+":
				return 2.75;
			case "C":
				return 2.5;
			case "D+":
				return 2.25;
			case "D":
				return 2;
			case "F":
				return 0.0;
			default:
				return 0.0;
		}
	}
}

// Apply translations when the page loads
applyTranslations();
updateGradeOptions();

// Handle Enter key press to submit the form
const form = document.querySelector(".container");
form.addEventListener("keydown", (event) => {
	if (event.key === "Enter") {
		event.preventDefault();
		addCourse();
	}
});
