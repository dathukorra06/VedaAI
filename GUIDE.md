# 🎓 AI Assessment Creator — Step-by-Step Guide

A React-based AI-powered exam question paper generator for teachers, built as a single-file artifact using the Claude API. This guide walks through every part of the codebase step by step.

---

## 📦 What's Inside

| Piece | What it does |
|-------|-------------|
| `createStore()` | Lightweight Zustand-style global state |
| `generatePaper()` | Calls Claude API, returns structured JSON |
| `runJob()` | Simulates BullMQ job pipeline with progress steps |
| `ListView` | Assignment list — empty & filled states |
| `CreateView` | Multi-field form with validation |
| `OutputView` | Formatted exam paper + download |
| `Sidebar` + `TopBar` | Shell layout matching the Figma designs |

---

## 🔄 App Flow (Bird's Eye View)

```
User opens app
      │
      ▼
  ListView  ──── clicks "Create Assignment" ────►  CreateView
                                                        │
                                                   fills form
                                                        │
                                                   clicks "Next"
                                                        │
                                                   runJob() starts
                                                        │
                                              ┌─── progress steps ───┐
                                              │  queued → processing  │
                                              │  → AI call → parsing  │
                                              └───────────────────────┘
                                                        │
                                               paper saved to store
                                                        │
                                                        ▼
                                                   OutputView
                                                        │
                                              Download / Regenerate
```

---

## 🧠 Step 1 — Global State Store

```js
function createStore(init) {
  let state = init;
  const listeners = new Set();

  const setState = (fn) => {
    state = typeof fn === "function" ? fn(state) : { ...state, ...fn };
    listeners.forEach((l) => l(state));   // notify all subscribers
  };

  const getState = () => state;

  const subscribe = (l) => {
    listeners.add(l);
    return () => listeners.delete(l);     // returns unsubscribe fn
  };

  return { setState, getState, subscribe };
}
```

**Why:** Replaces Zustand/Redux with a tiny pub-sub pattern. Any component that calls `store.setState(...)` triggers a re-render in every component subscribed via `useStore()`.

**Store shape:**

```js
const store = createStore({
  view: "list",             // which page is showing: list | create | output
  assignments: [],          // all saved assignments
  currentAssignment: null,  // assignment being edited
  generatedPaper: null,     // last AI-generated paper object
  jobStatus: null,          // idle | queued | processing | done | error
  jobProgress: 0,           // 0–100
  jobMessage: "",           // human-readable status string
});
```

**`useStore` hook** — subscribes a component to a slice of state:

```js
function useStore(selector) {
  const [val, setVal] = useState(() => selector(store.getState()));

  useEffect(() => {
    const unsub = store.subscribe((s) => setVal(selector(s)));
    return unsub;   // cleanup on unmount
  }, []);

  return val;
}

// Usage in any component:
const assignments = useStore((s) => s.assignments);
```

---

## 🤖 Step 2 — AI Paper Generation

```js
async function generatePaper(assignment) {
  const { title, subject, className, dueDate,
          questionTypes, additionalInfo, fileText } = assignment;

  // 1. Build the question type lines for the prompt
  const typeLines = questionTypes
    .map((qt) => `  - ${qt.type}: ${qt.count} questions, ${qt.marks} marks each`)
    .join("\n");

  // 2. Construct the structured prompt
  const prompt = `You are an expert school teacher...
  ...Return ONLY valid JSON...`;

  // 3. Call the Claude API
  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  // 4. Extract and parse the text response
  const data = await resp.json();
  const raw = data.content?.find((b) => b.type === "text")?.text || "{}";

  // 5. Strip markdown code fences if Claude wrapped the JSON
  const clean = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

  return JSON.parse(clean);   // returns a typed GeneratedPaper object
}
```

**Prompt instructs Claude to return this exact JSON shape:**

```json
{
  "schoolName": "Delhi Public School, Sector-4, Bokaro",
  "subject": "Science",
  "class": "Grade 8",
  "timeAllowed": "45 minutes",
  "maxMarks": 20,
  "sections": [
    {
      "id": "A",
      "title": "Section A",
      "instruction": "Attempt all questions. Each question carries 1 mark.",
      "questionType": "Multiple Choice Questions",
      "questions": [
        {
          "id": 1,
          "text": "What is the SI unit of electric current?",
          "difficulty": "Easy",
          "marks": 1
        }
      ]
    }
  ],
  "answerKey": [
    { "id": 1, "answer": "Ampere (A)" }
  ]
}
```

**Difficulty distribution rule baked into the prompt:**
- ~30% Easy
- ~50% Moderate
- ~20% Challenging

---

## ⚙️ Step 3 — Job Pipeline (BullMQ Simulation)

```js
async function runJob(assignment) {

  // Simulate the 5 pipeline stages with delays
  const steps = [
    { msg: "Job queued...",                  prog: 10, delay: 600 },
    { msg: "Analyzing assignment details...", prog: 25, delay: 800 },
    { msg: "Structuring question prompt...", prog: 40, delay: 600 },
    { msg: "Calling AI model...",            prog: 55, delay: 400 },
    { msg: "Parsing question paper...",      prog: 75, delay: 500 },
    { msg: "Storing to database...",         prog: 90, delay: 600 },
  ];

  // 1. Mark job as queued
  store.setState({ jobStatus: "queued", jobProgress: 0, jobMessage: "Submitting job..." });

  // 2. Walk through each step, updating the store (triggers UI re-render)
  for (const step of steps) {
    await new Promise((r) => setTimeout(r, step.delay));
    store.setState({ jobStatus: "processing", jobProgress: step.prog, jobMessage: step.msg });
  }

  // 3. Make the actual AI call
  try {
    const paper = await generatePaper(assignment);
    store.setState({
      jobStatus: "done",
      jobProgress: 100,
      jobMessage: "Question paper ready!",
      generatedPaper: paper,
    });
    return paper;
  } catch (e) {
    store.setState({ jobStatus: "error", jobMessage: "Generation failed: " + e.message });
    throw e;
  }
}
```

**This mirrors a real BullMQ flow:**

```
POST /api/assignments
        │
  Redis Queue (job added)         ← prog 10%
        │
  Worker: analyze details         ← prog 25%
        │
  Worker: build prompt            ← prog 40%
        │
  Worker: Claude API call         ← prog 55%
        │
  Worker: parse + validate JSON   ← prog 75%
        │
  MongoDB: save result            ← prog 90%
        │
  WebSocket: notify frontend      ← prog 100%
```

---

## 📋 Step 4 — Assignment List View

```
ListView
├── Header (title + badge + "Create Assignment" button)
├── Search + Filter bar  (shown only when assignments.length > 0)
├── Empty state          (shown when assignments.length === 0)
│     └── illustration + CTA button
└── Filled state grid    (2-column card grid)
      └── AssignmentCard (×N)
            ├── Title
            ├── Assigned on / Due date
            └── ⋮ menu → View Assignment | Delete
```

**Key state interactions:**

```js
// Navigate to create form
store.setState({ view: "create", currentAssignment: null });

// View a previously generated paper
store.setState({ view: "output", generatedPaper: assignment.paper });

// Delete an assignment (immutable filter)
store.setState((s) => ({
  assignments: s.assignments.filter((x) => x.id !== assignment.id)
}));
```

---

## 📝 Step 5 — Create Assignment Form

### Form state shape

```js
const [form, setForm] = useState({
  title: "",
  subject: "",
  className: "",
  dueDate: "",
  fileText: "",           // text extracted from uploaded file
  additionalInfo: "",
  questionTypes: [
    { id: uid(), type: "Multiple Choice Questions", count: 4, marks: 1 },
    { id: uid(), type: "Short Answer Questions",    count: 3, marks: 3 },
  ],
});
```

### Form has 2 internal steps:

| Step | What shows |
|------|-----------|
| `step === 1` | The full form (file upload, fields, question types, additional info) |
| `step === 2` | The job progress screen (progress bar + pipeline steps) |

### Validation (runs on "Next →" click)

```js
const validate = () => {
  const e = {};
  if (!form.title.trim())    e.title    = "Title is required";
  if (!form.subject.trim())  e.subject  = "Subject is required";
  if (!form.className.trim()) e.className = "Class is required";
  if (!form.dueDate)         e.dueDate  = "Due date is required";

  form.questionTypes.forEach((q, i) => {
    if (!q.count || q.count < 1) e[`count_${i}`] = "Min 1";
    if (!q.marks || q.marks < 1) e[`marks_${i}`] = "Min 1";
  });

  setErrors(e);
  return Object.keys(e).length === 0;  // true = valid
};
```

### Dynamic question type rows

```js
// Add a row (picks next unused type automatically)
const addQType = () => {
  const used = form.questionTypes.map((q) => q.type);
  const next = QUESTION_TYPE_OPTIONS.find((o) => !used.includes(o));
  setForm((f) => ({
    ...f,
    questionTypes: [...f.questionTypes, { id: uid(), type: next, count: 5, marks: 5 }],
  }));
};

// Remove a row by id
const removeQType = (id) =>
  setForm((f) => ({ ...f, questionTypes: f.questionTypes.filter((q) => q.id !== id) }));

// Update a specific field on a row
const updateQType = (id, key, value) =>
  setForm((f) => ({
    ...f,
    questionTypes: f.questionTypes.map((q) => q.id === id ? { ...q, [key]: value } : q),
  }));
```

### Totals are computed live

```js
const totalQ = form.questionTypes.reduce((s, q) => s + Number(q.count || 0), 0);
const totalM = form.questionTypes.reduce((s, q) => s + Number(q.count) * Number(q.marks), 0);
```

### Submit flow

```js
const handleSubmit = async () => {
  if (!validate()) return;          // 1. validate
  setStep(2);                        // 2. show progress screen

  const assignment = { ...form, id: uid(), createdAt: today() };

  await runJob(assignment);          // 3. run pipeline + AI call

  const paper = store.getState().generatedPaper;
  const saved = { ...assignment, paper };

  store.setState((s) => ({
    assignments: [...s.assignments, saved],  // 4. persist
    view: "output",                          // 5. navigate to output
  }));
};
```

---

## 📄 Step 6 — Output View

### Layout structure

```
OutputView
├── Action Bar (dark banner)
│     ├── ← Back button
│     ├── "✨ Question paper generated!" + question/mark count
│     ├── 🔄 Regenerate button
│     └── ⬇ Download as PDF button
│
└── Paper (white card)
      ├── School Header (name, subject, class)
      ├── Meta row (Time Allowed | Maximum Marks)
      ├── General instruction (italic)
      ├── Student Info (Name / Roll Number / Section blank lines)
      ├── Section A, B, C... (color-coded)
      │     ├── Section header (colored icon + title + type label)
      │     ├── Instruction text
      │     └── Question rows
      │           ├── Numbered badge
      │           ├── Question text
      │           ├── DiffBadge (Easy / Moderate / Challenging)
      │           └── [X Marks] label
      └── Answer Key (2-column grid)
```

### Section colors cycle through

```js
const SECTION_COLORS = ["#E84855", "#3A86FF", "#8338EC", "#FB5607", "#06D6A0"];
// Section A = red, B = blue, C = purple, D = orange, E = green
```

### Difficulty badge colors

```js
const DIFF_COLORS = {
  Easy:        "#06D6A0",   // green
  Moderate:    "#FFB703",   // amber
  Challenging: "#E84855",   // red
};
```

### Download as HTML

```js
const handleDownload = () => {
  const html = `<!DOCTYPE html><html>...${ printRef.current.innerHTML }...</html>`;
  const blob = new Blob([html], { type: "text/html" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `${paper.subject}_QuestionPaper.html`;
  a.click();
  URL.revokeObjectURL(url);   // cleanup memory
};
```

The downloaded `.html` file includes inline `<style>` with print-safe CSS (Times New Roman, black ink, proper margins) so it renders cleanly when printed to PDF from the browser.

---

## 🎨 Step 7 — Design System

### Typography

| Font | Usage |
|------|-------|
| `Playfair Display` | Page titles, paper heading, section titles |
| `DM Sans` | Body text, labels, buttons, nav |
| `DM Mono` | Badges, progress text, marks, question numbers |

All loaded from Google Fonts via a `<style>` tag in the root component.

### Color palette

| Token | Hex | Used for |
|-------|-----|---------|
| Primary dark | `#1a1a2e` | Sidebar, headings, buttons |
| Accent red | `#E84855` | Logo, delete, "Challenging" badge, gradient |
| Accent blue | `#3A86FF` | Avatar, section B, gradient |
| Success green | `#06D6A0` | Online dot, "Easy" badge, job done |
| Warning amber | `#FFB703` | "Moderate" badge |
| Background | `#f7f7fb` | App background |

### Shared style objects (defined at bottom of file)

```js
const inputStyle  = { border: "1px solid #e5e5e5", borderRadius: 10, ... };
const counterBtn  = { width: 30, height: 30, border: "1px solid #e5e5e5", ... };
const btnPrimary  = { background: "#1a1a2e", color: "#fff", ... };
const btnSecondary = { background: "#fff", border: "1px solid #ddd", ... };
```

---

## 🧩 Step 8 — Component Tree

```
App
├── <style> (Google Fonts import + global resets)
├── Sidebar
│     ├── Logo (VedaAI)
│     ├── Create Assignment button
│     ├── Nav items (Home, My Groups, Assignments, AI Toolkit, Library)
│     └── Footer (Settings + School profile)
├── TopBar
│     ├── Breadcrumb label (changes with view)
│     ├── Bell icon
│     └── User avatar + name
└── Main content area
      ├── ListView        (view === "list")
      ├── CreateView      (view === "create")
      └── OutputView      (view === "output")
```

---

## 🔁 Step 9 — Navigation (State-Driven)

There is no router. Navigation is purely driven by `store.setState({ view: "..." })`.

| From | Action | `view` becomes |
|------|--------|----------------|
| List → | Click "Create Assignment" | `"create"` |
| Create → | Back button | `"list"` |
| Create → | Submit + job done | `"output"` |
| Output → | Back button | `"list"` |
| Output → | Regenerate | `"create"` |
| Card menu → | View Assignment | `"output"` |

---

## ✅ Step 10 — Validation Rules

| Field | Rule |
|-------|------|
| Title | Non-empty string |
| Subject | Non-empty string |
| Class | Non-empty string |
| Due Date | Must be selected (HTML date input) |
| Question count | Integer ≥ 1 for each row |
| Marks per question | Integer ≥ 1 for each row |

Errors are displayed inline below each field. The form will not submit until all pass.

---

## 🚀 Running the Artifact

This is a self-contained `.jsx` file designed to run inside the Claude.ai artifact renderer.

1. Open Claude.ai
2. Paste the `.jsx` file contents into a message or use the artifact panel
3. The app renders immediately — no build step, no installs
4. The Claude API calls are proxied automatically by the artifact environment (no API key needed client-side)

To run it as a real Next.js app:
1. Copy the component logic into `app/page.tsx`
2. Replace inline `fetch("https://api.anthropic.com/v1/messages", ...)` with a call to your own `/api/generate` route
3. Move the store to `store/useAssignmentStore.ts` using Zustand
4. Add a real WebSocket client in `hooks/useJobSocket.ts`

---

## 📜 License

MIT © 2025 VedaAI
