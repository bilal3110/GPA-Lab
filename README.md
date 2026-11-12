# GPA Lab

GPA Lab is a browser-based academic calculator for university students. It helps calculate semester GPA, cumulative GPA, and attendance, with no build step or external dependencies.

## Features

- **Cumulative GPA (CGPA):** Enter a GPA and credits for each semester. The result is weighted by semester credits.
- **Semester GPA:** Enter each course's grade points and credits to calculate a weighted GPA for one semester.
- **Grades to CGPA:** Select a letter grade and enter course credits to calculate a weighted CGPA from courses.
- **Attendance tracker:** Calculate an attendance percentage from classes attended and total classes, or estimate how many consecutive classes must be attended to reach a target.
- **Saved inputs:** Inputs and the selected calculator tab are saved in the current browser using `localStorage` and restored on the next visit.
- **Convenience controls:** Load sample data, clear one calculator, reset all inputs, and copy GPA/CGPA results.
- **Responsive interface:** Layout adapts to smaller screens and supports keyboard calculator-tab navigation.

## Calculations

GPA and CGPA use credit-weighted averages:

```text
GPA or CGPA = sum(grade points × credits) / sum(credits)
```

For GPA and CGPA calculators, enter each semester or course name and a positive credit value. Semester GPA must be between 0 and 4. The grade-to-CGPA calculator uses this built-in 4.0 scale:

| Grade | Points |
|---|---:|
| A+, A | 4.0 |
| A- | 3.7 |
| B+ | 3.3 |
| B | 3.0 |
| B- | 2.7 |
| C+ | 2.3 |
| C | 2.0 |
| D | 1.0 |
| F | 0.0 |

Attendance percentage is calculated as:

```text
attended classes / total classes × 100
```

For the target calculator, provide the current attendance percentage, target percentage, and number of classes held so far. The result estimates the minimum number of consecutive classes to attend to reach the target. A target already met requires zero additional classes; a target of 100% is marked impossible unless the current attendance is already 100%.

## Getting started

1. Download or clone this repository.
2. Open `index.html` in a modern web browser.
3. Choose a calculator tab, enter your data, and select **Calculate**.

No package installation, server, or build step is required.

## Using the app

### GPA and CGPA

1. Select **CGPA**, **Semester GPA**, or **Grades → CGPA**.
2. Add semesters or courses as needed.
3. Enter the required GPA or grade, name, and credits.
4. Select the calculator's **Calculate** button. Invalid or missing values are highlighted.
5. Use **Copy result** to copy a summary where available.

### Attendance

- Under **Current percentage**, enter total classes held and classes attended. Attended classes cannot exceed the total.
- Under **Classes needed for target**, enter your current percentage, target percentage, and total classes so far.
- Percentages must be between 0 and 100. The target calculation uses your stated current percentage; it does not derive it from the other attendance inputs.

### Other controls

- **Try sample data** fills all calculators with example values.
- **Clear all** in a calculator clears that calculator's entries.
- **Reset** clears all entries after confirmation.
- Use the left and right arrow keys while focused on a calculator tab to switch tabs. **Ctrl+Enter** (or **Command+Enter** on macOS) runs the active calculator; on the Attendance tab, it calculates the current percentage.

## Project structure

```text
GPA-Lab/
├── assets/       # Logo images
├── css/
│   └── style.css # Layout, responsive styling, and visual design
├── js/
│   └── script.js # Calculator logic, validation, and browser storage
├── index.html    # App markup and calculator forms
└── README.md
```

## Technology

- HTML5
- CSS3
- Vanilla JavaScript (ES6+)

## Developer

Developed with love by [Bilal A.](https://bilaldeveloper.vercel.app/).
