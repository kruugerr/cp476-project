# cp476-project

> AI-powered school management app for students and teachers.

---

## Overview

This app lets students upload a course syllabus and have it automatically parsed into a structured course with assignments, due dates, grading weights, office hours, and other important course information. Teachers can publish courses with a join code, and students can enroll to have course information added to their semester dashboard.

---

## Features

* AI-powered syllabus ingestion through PDF upload or pasted text
* Semester dashboard with calendar and weekly views
* Course view with grade tracking
* Assignment/activity tracker with due dates, grading weights, status, hours logged, and grades
* GPA tracker using both 4.0 and 12.0 scales
* Reminder settings through email or WhatsApp
* Teacher course publishing with join codes
* Student enrollment flow

---

## Tech Stack

| Layer     | Technology                         |
| --------- | ---------------------------------- |
| Frontend  | HTML, CSS, JavaScript              |
| Backend   | Node.js                            |
| Database  | PostgreSQL                         |
| Auth      | To be implemented                  |
| AI / LLM  | To be implemented                  |
| Reminders | Email / WhatsApp, planned feature  |
| Hosting   | Local development for Milestone 02 |

---

## Getting Started

### Prerequisites

To view the front-end, you only need **one** of:

* **Python 3** — preinstalled on macOS/Linux (recommended, nothing to install), **or**
* **Node.js + npm** — if you prefer the `npx serve` option below

Plus **Git** to clone the repo. (Node.js and PostgreSQL are only needed for the
optional back-end/database, which are still in progress.)

---

## How to Run Locally

### 1. Clone the Repository

```bash
git clone https://github.com/kruugerr/cp476-project.git
cd cp476-project
```

---

### 2. Run the Front-End

For milestone 02, the app runs entirely on the front-end with built-in mock data (no back-end or database required).

From the `frontend/` folder, start a local web server on port 5500:

**Option A — Python 3

bash
cd frontend
python3 -m http.server 5500

Option B — Node.js:

cd frontend
npx serve -l 5500

Then open http://localhost:5500 in your browser

(Open it through the local server above, do not double-click the HTML files. 
The pages load shared parts (sidebar, top bar) with fetch(), which browsers block on 
file://. Serving over http:// is what makes the app work.)

---

## Project Structure

```text
cp476-project/
├── docs/              # planning docs, meeting minutes, activity blog/wiki
├── frontend/          # front-end files
├── backend/           # back-end server files
└── README.md
```

---

## Activity Blog / Wiki

The activity blog/wiki is maintained in the project documentation and includes weekly meeting notes, task assignments, progress updates, design decisions, blockers, and resolutions.

---

## Team Member Contributions

| Name          | Contribution Summary                                                                    |
| ------------- | --------------------------------------------------------------------------------------- |
| Zach Gould    | Worked on project setup, GitHub repository organization, and development tasks.         |
| Zohra Haidary | Worked on planning documentation, front-end/design tasks, and project organization.     |
| Tyler Rizzi   | Worked on back-end setup, README updates, and project documentation. |
| Thanh Phan    | Worked on development tasks, milestone planning, and implementation support.            |
| Qichen Hao    | Worked on planning, project documentation, and implementation support.                  |

---

## Course

CP476 — Internet Computing
Wilfrid Laurier University
