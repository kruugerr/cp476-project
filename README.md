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

Before running the project locally, make sure you have the following installed:

* Node.js
* npm
* PostgreSQL
* Git

---

## How to Run Locally

### 1. Clone the Repository

```bash
git clone https://github.com/kruugerr/cp476-project.git
cd cp476-project
```

---

### 2. Run the Front-End

run:

```bash
npm install
npm run start
```

Then open the local host link shown in the terminal.

---

### 3. Run the Back-End

run:

```bash
npm run dev
```

The back-end server should run locally, usually at:

```bash
http://localhost:3000
```

---

### 4. Run the Database

Database setup and integration are still in progress for Milestone 02.

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
