<div align="center">

# 🎯 FOCUS Matrix

### Eisenhower Priority Matrix, Kanban Workflow & Deep Work Pomodoro Engine

[![Live Demo](https://img.shields.io/badge/Live_Demo-focusmatrix.vercel.app-6366F1?style=for-the-badge&logo=vercel&logoColor=white)](https://focusmatrix.vercel.app/)
[![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite_5-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

<p align="center">
  <b>A comprehensive productivity suite unifying rapid inbox capture, Eisenhower 4-quadrant decision matrix, multi-board Kanban pipelines, and an integrated Deep Work Pomodoro timer.</b><br>
  Triage what matters, eliminate distractions, and enter flow state effortlessly.
</p>

[🌐 **Explore Live Demo**](https://focusmatrix.vercel.app/) • [✨ Features](#-key-features) • [🛠️ Tech Stack](#-tech-stack) • [🚀 Quick Start](#-quick-start) • [🗄️ Database Setup](#-database--supabase-setup)

---

</div>

## 📖 Overview

**FOCUS Matrix** is an all-in-one task management and deep-work orchestration application built for developers, knowledge workers, and creators. Instead of switching between separate to-do lists, Kanban boards, and Pomodoro timers, FOCUS Matrix integrates the entire workflow into a cohesive, keyboard-driven interface.

---

## ✨ Key Features

### 📥 1. Rapid Inbox & Quick Capture
- **Zero-Friction Brain Dump**: Instantly capture thoughts, ideas, and fleeting tasks without breaking your current focus.
- **Triage & Convert**: Easily convert raw inbox entries into actionable tasks, assign them to specific Kanban boards, or turn them into structured notes.
- **Global Shortcuts**: Press `Cmd/Ctrl + K` or quick capture shortcuts anywhere in the application.

### 🗂️ 2. Eisenhower Priority Matrix
- **4-Quadrant Decision Matrix**:
  - 🔴 **Do First** (Urgent & Important)
  - 🔵 **Schedule** (Not Urgent & Important)
  - 🟡 **Delegate** (Urgent & Not Important)
  - ⚪ **Don't Do / Eliminate** (Not Urgent & Not Important)
- **Alternative Matrix Modes**: Toggle effortlessly between the classic **Eisenhower Matrix** and the **Value vs. Effort Matrix** (Quick Wins, Major Projects, Fill-Ins, Thankless Tasks).
- **Interactive Drag-and-Drop**: Reprioritize tasks by dragging them directly between quadrants.

### 📋 3. Multi-Column Kanban Boards
- **Custom Project Boards**: Create and organize multiple boards (e.g., *Engineering*, *Marketing*, *Personal*, *Client Work*).
- **Fluid Drag-and-Drop**: Move task cards across custom status columns (*Backlog*, *In Progress*, *Review*, *Done*).
- **Rich Task Metadata**: Due dates, priorities, subtask checklists, estimated pomodoros, labels, and rich descriptions.

### ⏱️ 4. Deep Work Pomodoro Timer Engine
- **Integrated Flow Engine**: Launch structured focus sessions directly from any task card.
- **Automated Work/Break Cycles**: Configurable focus intervals (25m standard), short breaks (5m), and long breaks (15m).
- **Overtime & Flow Protection**: Tracks overtime if you are in deep flow and choose not to stop when the timer ends.
- **Persistent Mini-Player**: Minimize the timer into a floating mini-player bar while navigating across different views.
- **Ambient Focus Audio**: Built-in sound cues for session transitions.

### 📝 5. Connected Notes & Scratchpad
- **Knowledge Capture**: Maintain categorized project notes, meeting memos, and snippets.
- **Task Association**: Link reference documentation directly to relevant tasks and Kanban boards.

### 📊 6. Productivity Insights & Analytics
- **Performance Dashboard**: Real-time stats showing total focus hours logged, completed Pomodoro sessions, and daily task velocity.
- **Quadrant Balance**: Visualize where your energy goes to avoid getting trapped in firefighting mode.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | [React 18](https://react.dev/) + [Vite](https://vitejs.dev/) |
| **Backend & Realtime DB** | [Supabase](https://supabase.com/) (PostgreSQL, Row-Level Security, Realtime) |
| **Styling & Theme** | Custom Vanilla CSS with dark mode aesthetics, smooth micro-interactions, and responsive layout |
| **State Management** | React Hooks (`useState`, `useEffect`, `useCallback`, `useRef`) |
| **Deployment** | [Vercel](https://vercel.com/) |

---

## 🏗️ Architecture & Project Structure

```text
todoapp/
├── index.html            # Main HTML document template
├── setup.js              # Database initialization & setup script
├── seed-database.js      # Sample tasks, boards, notes & initial data
├── vite.config.js        # Vite bundling & development configuration
├── src/
│   ├── app.jsx           # App shell, global routing, state & Pomodoro timer engine
│   ├── components.jsx    # UI primitives (Icons, Modals, Badges, Dropdowns)
│   ├── data.jsx          # Default seed templates, quadrant configurations & sample data
│   ├── supabase.js       # Supabase client connector
│   ├── styles.css        # Core stylesheet, glassmorphic UI tokens & dark theme
│   └── views/
│       ├── inbox.jsx     # Rapid idea capture & triage pipeline
│       ├── matrix.jsx    # Eisenhower 4-quadrant & Value/Effort matrix view
│       ├── boards.jsx    # Multi-board Kanban pipelines with drag-and-drop
│       ├── focus.jsx     # Fullscreen Deep Work Pomodoro timer & mini-player bar
│       ├── notes.jsx     # Connected notes and documentation editor
│       ├── stats.jsx     # Productivity analytics, focus charts & velocity metrics
│       ├── modals.jsx    # Task detail editor & quick capture dialogs
│       └── components-sheet.jsx # UI component showcase & debug viewer
```

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- A [Supabase](https://supabase.com/) account

### 1. Clone the repository
```bash
git clone https://github.com/Suawek013/todo-app.git
cd todoapp
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. Run the development server
```bash
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🗄️ Database & Supabase Setup

1. Create a new project in [Supabase](https://supabase.com/).
2. Run the database seed script:
```bash
node seed-database.js
```
*(Or create the tables `boards`, `tasks`, `inbox`, `notes` in your Supabase SQL editor using the schema definitions in `seed-database.js`)*.
3. Verify that your `.env` contains valid credentials and start the app.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">
  <sub>Engineered by Sławomir Sojka · Live at <a href="https://focusmatrix.vercel.app/">focusmatrix.vercel.app</a></sub>
</div>
