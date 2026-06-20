import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load variables from .env.local
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

// Fallback to process.env if VITE_ keys aren't mapped properly in dotenv
const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(url, key, { db: { schema: 'todoapp' } });

// --- MOCK DATA to SEED ---
// Copied structure from data.jsx
let _id = 100;
const uid = (p) => `${p}_${++_id}`;

const BOARDS = [
  { id: 'b_work', name: 'Work', icon: '💼', color: '#5b8def', temporary: false, columns: [{ id: 'c_todo', name: 'Todo', status: 'todo' }, { id: 'c_prog', name: 'In Progress', status: 'progress' }, { id: 'c_done', name: 'Done', status: 'done' }] },
  { id: 'b_yt', name: 'YouTube channel', icon: '🎬', color: '#f08a3c', temporary: false, columns: [{ id: 'y_idea', name: 'Ideas', status: 'todo' }, { id: 'y_script', name: 'Scripting', status: 'progress' }, { id: 'y_edit', name: 'Editing', status: 'progress' }, { id: 'y_pub', name: 'Published', status: 'done' }] },
  { id: 'b_q1', name: 'Q1 launch', icon: '🚀', color: '#a87ff0', temporary: true, columns: [{ id: 'q_todo', name: 'Todo', status: 'todo' }, { id: 'q_prog', name: 'In Progress', status: 'progress' }, { id: 'q_rev', name: 'Review', status: 'blocked' }, { id: 'q_done', name: 'Done', status: 'done' }] },
  { id: 'b_home', name: 'Home & Life', icon: '🏡', color: '#3fb98a', temporary: false, columns: [{ id: 'h_todo', name: 'Todo', status: 'todo' }, { id: 'h_prog', name: 'Doing', status: 'progress' }, { id: 'h_done', name: 'Done', status: 'done' }] }
];

const T = (o) => ({ id: uid('t'), desc: '', priority: null, ie: null, pomoEst: 1, pomoActual: 0, due: null, tags: [], subtasks: [], focusMin: 0, ...o });

const TASKS = [
  T({ board: 'b_work', col: 'c_prog', title: 'Finalize Q2 roadmap deck for leadership review', desc: 'Pull metrics from analytics, align with eng estimates', priority: 'do', ie: 'do', pomoEst: 4, pomoActual: 3, focusMin: 88, due: 'Jun 6', tags: ['work', 'deep'], subtasks: [{t:'Gather Q1 metrics', done:true},{t:'Draft narrative', done:true},{t:'Design slides', done:false},{t:'Review with manager', done:false}] }),
  T({ board: 'b_work', col: 'c_prog', title: 'Review PR #482 — auth refactor', priority: 'delegate', ie: 'delegate', pomoEst: 2, pomoActual: 1, focusMin: 25, tags: ['work', 'quick'] }),
  T({ board: 'b_work', col: 'c_todo', title: 'Write performance self-review', priority: 'schedule', ie: 'schedule', desc: 'Due end of month — collect highlights from the quarter', pomoEst: 3, due: 'Jun 28', tags: ['work', 'deep'], subtasks: [{t:'List shipped projects', done:false},{t:'Gather peer feedback', done:false}] }),
  T({ board: 'b_work', col: 'c_todo', title: 'Respond to vendor security questionnaire', priority: 'delegate', ie: null, pomoEst: 1, due: 'Jun 9', tags: ['work'] }),
  T({ board: 'b_work', col: 'c_todo', title: 'Sketch onboarding flow improvements', priority: null, ie: null, desc: 'Drop-off is highest at step 3', pomoEst: 2, tags: ['work', 'deep'] }),
  T({ board: 'b_work', col: 'c_todo', title: 'Update team wiki — deploy runbook', priority: null, ie: null, pomoEst: 1, tags: ['work', 'quick'] }),
  T({ board: 'b_work', col: 'c_done', title: 'Ship analytics dashboard v2', priority: 'do', ie: 'do', pomoEst: 5, pomoActual: 6, focusMin: 152, tags: ['work', 'deep'] }),
  T({ board: 'b_work', col: 'c_done', title: 'Triage support backlog', priority: null, ie: null, pomoEst: 2, pomoActual: 2, focusMin: 50, tags: ['work'] }),
  T({ board: 'b_work', col: 'c_done', title: 'Sync with design on component library', pomoEst: 1, pomoActual: 1, focusMin: 25, tags: ['work'] }),
  T({ board: 'b_yt', col: 'y_idea', title: '"My productivity system in 2026" walkthrough', priority: null, ie: null, pomoEst: 3, tags: ['side'] }),
  T({ board: 'b_yt', col: 'y_idea', title: 'React vs Svelte — honest take after 6 months', pomoEst: 4, tags: ['side', 'learning'] }),
  T({ board: 'b_yt', col: 'y_script', title: 'Script: "How I plan my week"', priority: 'schedule', ie: 'schedule', desc: 'Outline done, needs hook + b-roll list', pomoEst: 3, pomoActual: 2, focusMin: 55, tags: ['side', 'deep'], subtasks: [{t:'Hook', done:true},{t:'Main beats', done:true},{t:'CTA', done:false}] }),
  T({ board: 'b_yt', col: 'y_edit', title: 'Edit "Notion alternatives" video', priority: 'do', ie: 'do', desc: 'Rough cut done, needs color + captions', pomoEst: 6, pomoActual: 4, focusMin: 110, due: 'Jun 7', tags: ['side', 'deep'] }),
  T({ board: 'b_yt', col: 'y_pub', title: '"Desk setup tour 2026"', pomoEst: 5, pomoActual: 5, focusMin: 128, tags: ['side'] }),
  T({ board: 'b_q1', col: 'q_prog', title: 'Write launch announcement blog post', priority: 'do', ie: 'do', pomoEst: 3, pomoActual: 2, focusMin: 48, due: 'Jun 10', tags: ['work', 'deep'] }),
  T({ board: 'b_q1', col: 'q_prog', title: 'Set up product analytics events', priority: 'schedule', ie: null, pomoEst: 2, pomoActual: 1, focusMin: 25, tags: ['work'] }),
  T({ board: 'b_q1', col: 'q_rev', title: 'Legal review of pricing page copy', priority: 'delegate', ie: 'delegate', desc: 'Blocked on legal team response', pomoEst: 1, tags: ['work', 'urgent'] }),
  T({ board: 'b_q1', col: 'q_todo', title: 'Prepare press kit & screenshots', pomoEst: 2, tags: ['work'] }),
  T({ board: 'b_q1', col: 'q_todo', title: 'Schedule launch-day social posts', priority: null, ie: null, pomoEst: 1, tags: ['work', 'quick'] }),
  T({ board: 'b_q1', col: 'q_done', title: 'Finalize pricing tiers', pomoEst: 2, pomoActual: 3, focusMin: 70, tags: ['work', 'deep'] }),
  T({ board: 'b_home', col: 'h_todo', title: 'Book dentist appointment', priority: 'delegate', ie: null, pomoEst: 1, tags: ['personal', 'health', 'quick'] }),
  T({ board: 'b_home', col: 'h_todo', title: 'Plan weekend hike — pick trail & pack list', priority: 'schedule', ie: 'schedule', pomoEst: 1, due: 'Jun 8', tags: ['personal', 'health'] }),
  T({ board: 'b_home', col: 'h_prog', title: 'Research standing desk options', priority: null, ie: null, desc: 'Compare Jarvis vs Uplift', pomoEst: 2, pomoActual: 1, focusMin: 25, tags: ['personal'] }),
  T({ board: 'b_home', col: 'h_done', title: 'Renew passport', pomoEst: 1, pomoActual: 2, focusMin: 40, tags: ['personal'] })
];

const INBOX = [
  { id: uid('i'), type: 'task', title: 'Reply to Sarah about the conference talk', desc: 'She needs an answer by Friday on whether I can present', created: Date.now() - 1000*60*42 },
  { id: uid('i'), type: 'idea', title: 'App idea: a CLI that summarizes your git week', desc: 'Could be a fun weekend project, maybe a video too', created: Date.now() - 1000*60*60*3 },
  { id: uid('i'), type: 'task', title: 'Cancel the unused Figma seat', created: Date.now() - 1000*60*60*6 },
  { id: uid('i'), type: 'note', title: 'Notes from 1:1 with manager', desc: 'Focus areas for promo: cross-team impact, mentorship', created: Date.now() - 1000*60*60*22 },
  { id: uid('i'), type: 'task', title: 'Fix the leaky kitchen faucet', desc: 'Probably just the washer', created: Date.now() - 1000*60*60*26 },
  { id: uid('i'), type: 'idea', title: 'Newsletter section: "tool I used this week"', created: Date.now() - 1000*60*60*30 },
  { id: uid('i'), type: 'task', title: 'Renew domain — expires in 11 days', created: Date.now() - 1000*60*60*49 },
];

const NOTES = [
  { id: uid('n'), type: 'plan', title: 'Weekly planning ritual', edited: Date.now() - 1000*60*60*2, body: `# Sunday planning ritual\n\nEvery Sunday evening, 30 minutes:\n\n- [ ] Review last week's stats\n- [ ] Clear the inbox to zero\n- [ ] Pick 3 big rocks for the week\n- [ ] Block deep-work mornings\n\n> "What got done vs what I planned?" — be honest, adjust estimates.\n\nThe goal isn't to do more, it's to do the **right** things.` },
  { id: uid('n'), type: 'meeting', title: 'Notes from 1:1 with manager', edited: Date.now() - 1000*60*60*22, body: `# 1:1 — June 4\n\n## Promo focus areas\n- Cross-team impact (lead a project touching 2+ teams)\n- Mentorship (onboard the new hire)\n- Visibility (write more design docs)\n\n## Action items\n- Draft the Q2 roadmap deck\n- Set up a recurring sync with the platform team` },
  { id: uid('n'), type: 'idea', title: 'Video ideas backlog', edited: Date.now() - 1000*60*60*50, body: `# Video backlog\n\n1. My productivity system in 2026\n2. React vs Svelte — honest take\n3. How I plan my week\n4. Notion alternatives that actually stick\n5. Desk setup tour\n\n## Hooks that worked\n- "I deleted 40 apps and only kept these 5"\n- "The system I wish I had 5 years ago"` },
  { id: uid('n'), type: 'reference', title: 'Pomodoro variations I want to try', edited: Date.now() - 1000*60*60*73, body: `# Focus method experiments\n\n- **52/17** — longer deep blocks\n- **90-min ultradian** — match natural energy cycles\n- Classic 25/5 for shallow/admin work\n\nKey insight: I often work *past* the timer when in flow. Don't fight it — track the overtime instead.` },
];

async function seedDatabase() {
  console.log("Seeding Boards...");
  const { error: err1 } = await supabase.from('boards').insert(BOARDS);
  if (err1) console.error("Boards error:", err1);

  console.log("Seeding Tasks...");
  const { error: err2 } = await supabase.from('tasks').insert(TASKS);
  if (err2) console.error("Tasks error:", err2);

  console.log("Seeding Inbox...");
  const { error: err3 } = await supabase.from('inbox').insert(INBOX);
  if (err3) console.error("Inbox error:", err3);

  console.log("Seeding Notes...");
  const { error: err4 } = await supabase.from('notes').insert(NOTES);
  if (err4) console.error("Notes error:", err4);

  console.log("Seed complete! You can now start the app.");
}

seedDatabase();
