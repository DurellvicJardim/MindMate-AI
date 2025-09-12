/*Chatbot Demo*/

// Grab elements by ID
const chatWindow = document.getElementById("chatWindow");
const chatInput = document.getElementById("chatInput");
const sendBtn = document.getElementById("sendMsg");
const clearBtn = document.getElementById("clearChat");

// Helper: append a message bubble
function addMessage(text, who) {
  const div = document.createElement("div");
  div.className = "msg " + (who || "bot"); // 'user' or 'bot'
  div.textContent = text;
  chatWindow.appendChild(div);
  chatWindow.scrollTop = chatWindow.scrollHeight; // scroll to bottom
}

// Helper: very simple scripted reply
function botReply(userText) {
  const t = userText.toLowerCase();
  if (t.includes("breath"))
    return "Try inhale 4s · hold 4s · exhale 6s. Ready?";
  if (t.includes("mood")) return "On a scale 1–5, how was today?";
  if (t.includes("goal"))
    return "Small step: 5-minute walk today. Want a reminder?";
  return "You can ask for a breathing exercise, a mood check-in, or a small goal.";
}

// Wire up buttons (guard in case this JS loads on other pages)
if (sendBtn && chatInput && chatWindow) {
  sendBtn.addEventListener("click", function () {
    const text = chatInput.value.trim();
    if (!text) return;
    addMessage(text, "user"); // show what the user typed
    chatInput.value = "";
    setTimeout(function () {
      // bot replies after a short delay
      addMessage(botReply(text), "bot");
    }, 400);
  });

  // Press Enter to send
  chatInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") sendBtn.click();
  });
}

if (clearBtn && chatWindow) {
  clearBtn.addEventListener("click", function () {
    chatWindow.innerHTML = "";
    addMessage("Hi, I’m here to help. Try “breathing exercise”.", "bot");
  });
}

/*Mood Tracker*/
const moodForm = document.getElementById("moodForm");
const moodBar = document.getElementById("moodBar");
const moodText = document.getElementById("moodResult");

let moodTotal = 0; // sum of all ratings
let moodCount = 0; // number of check-ins

if (moodForm && moodBar && moodText) {
  moodForm.addEventListener("submit", function (e) {
    e.preventDefault();

    // find the selected radio
    const selected = moodForm.querySelector('input[name="mood"]:checked');
    if (!selected) return;

    const val = parseInt(selected.value, 10); // 1..5
    moodTotal += val;
    moodCount += 1;

    const avg = moodTotal / moodCount; // average 1..5
    const pct = (avg / 5) * 100; // convert to 0..100%

    moodBar.style.width = pct + "%";
    moodText.textContent =
      "Today: " + val + "/5  •  Average: " + avg.toFixed(1) + "/5";

    moodForm.reset(); // clear selection after submit
  });
}

/* ===== Services: Meditation Timer ===== */
const timerDisplay = document.getElementById("timerDisplay");
const startPauseBtn = document.getElementById("startPauseBtn");
const resetBtn = document.getElementById("resetBtn");
const presetBtns = document.querySelectorAll(".preset");
const affirmationBox = document.getElementById("affirmationBox");

const AFFIRMATIONS = [
  "Asking for help is a sign of self-respect and self-awareness.",
  "Changing my mind is a strength, not a weakness.",
  "I alone hold the truth of who I am.",
  "I am allowed to ask for what I want and what I need.",
  "I am allowed to feel good.",
  "I am in charge of how I feel and I choose to feel happy.",
];

let lastPresetSec = 60; // default 1 minute
let remainingSec = lastPresetSec;
let running = false;
let timerId = null;

function formatMMSS(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
}
function render() {
  if (timerDisplay) timerDisplay.textContent = formatMMSS(remainingSec);
}
function setRunning(on) {
  running = on;
  presetBtns.forEach((b) => (b.disabled = on));
  if (startPauseBtn) startPauseBtn.textContent = on ? "Pause" : "Start";
}
function showAffirmation() {
  const msg = AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)];
  affirmationBox.textContent = msg;
  affirmationBox.hidden = false;
  affirmationBox.tabIndex = -1;
  affirmationBox.focus();
}
function tick() {
  if (remainingSec > 0) {
    remainingSec -= 1;
    render();
    if (remainingSec === 0) {
      clearInterval(timerId);
      timerId = null;
      setRunning(false);
      showAffirmation();
    }
  }
}

/* Guard so this only runs on Services page */
if (
  timerDisplay &&
  startPauseBtn &&
  resetBtn &&
  affirmationBox &&
  presetBtns.length
) {
  render();

  presetBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      lastPresetSec = parseInt(this.getAttribute("data-sec"), 10);
      remainingSec = lastPresetSec;
      render();
      affirmationBox.hidden = true;
    });
  });

  startPauseBtn.addEventListener("click", function () {
    if (!running) {
      if (remainingSec <= 0) remainingSec = lastPresetSec;
      setRunning(true);
      affirmationBox.hidden = true;
      timerId = setInterval(tick, 1000);
    } else {
      setRunning(false);
      clearInterval(timerId);
      timerId = null;
    }
  });

  resetBtn.addEventListener("click", function () {
    clearInterval(timerId);
    timerId = null;
    setRunning(false);
    remainingSec = lastPresetSec;
    render();
    affirmationBox.hidden = true;
  });
}

/* ===== Services: AI Coach chat (scripted) ===== */
const coachWin = document.getElementById("coachChatWindow");
const coachIn = document.getElementById("coachInput");
const coachSend = document.getElementById("coachSend");
const coachClear = document.getElementById("coachClear");

function addCoachMsg(text, who) {
  const div = document.createElement("div");
  div.className = "msg " + (who || "bot");
  div.textContent = text;
  coachWin.appendChild(div);
  coachWin.scrollTop = coachWin.scrollHeight;
}

function addQuickActions(actions) {
  if (!actions || !actions.length) return;
  const row = document.createElement("div");
  row.className = "quick-row";
  actions.forEach((a) => {
    const link = document.createElement("a");
    link.href = a.href;
    link.textContent = a.label;
    row.appendChild(link);
  });
  coachWin.appendChild(row);
  coachWin.scrollTop = coachWin.scrollHeight;
}

function coachReply(t) {
  const s = t.toLowerCase();

  if (s.includes("chat")) {
    return {
      text: "Open the chatbot demo on the Product page.",
      actions: [{ label: "Open demo", href: "product.html#chat" }],
    };
  }

  if (s.includes("medit") || s.includes("timer")) {
    return {
      text: "Start a short meditation timer.",
      actions: [{ label: "Start 1-min", href: "#meditations" }],
    };
  }

  if (s.includes("mood") || s.includes("track")) {
    return {
      text: "Learn about mood tracking on the Product page.",
      actions: [{ label: "View mood tracking", href: "product.html#" }],
    };
  }

  if (s.includes("contact") || s.includes("book")) {
    return {
      text: "Talk to our sales team!",
      actions: [{ label: "Book onboarding", href: "contact.html#booking" }],
    };
  }

  // default help
  return {
    text: "I can help you start a meditation, see mood tracking, open the chatbot demo, or book a chat with our sales team.",
    actions: [
      { label: "Start 1-min", href: "#meditations" },
      { label: "Chatbot demo", href: "product.html#chat" },
      { label: "Book onboarding", href: "contact.html#booking" },
    ],
  };
}

/* Guard so this runs only on Services when the coach chat exists */
if (coachWin && coachIn && coachSend) {
  coachSend.addEventListener("click", function () {
    const v = coachIn.value.trim();
    if (!v) return;
    addCoachMsg(v, "user");
    coachIn.value = "";
    const res = coachReply(v);
    setTimeout(function () {
      addCoachMsg(res.text, "bot");
      addQuickActions(res.actions);
    }, 350);
  });
  coachIn.addEventListener("keydown", function (e) {
    if (e.key === "Enter") coachSend.click();
  });
}
if (coachClear && coachWin) {
  coachClear.addEventListener("click", function () {
    coachWin.innerHTML = "";
    addCoachMsg(
      "Hi. Try “meditation”, “mood tracking”, “book”, or “chatbot”.",
      "bot"
    );
  });
}

/* ===== Contact form (demo) ===== */
const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");

if (contactForm && formStatus) {
  contactForm.addEventListener("submit", function (e) {
    e.preventDefault(); // demo only

    // Simple required check
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const dept = document.getElementById("dept").value;
    const subject = document.getElementById("subject").value.trim();
    const message = document.getElementById("message").value.trim();
    const ok =
      name &&
      email &&
      dept &&
      subject &&
      message &&
      document.getElementById("consent").checked;
    if (!ok) {
      alert("Please fill in all fields and accept the notice.");
      return;
    }

    // Show confirmation
    formStatus.hidden = false;
    formStatus.textContent =
      "Thanks, " + name + ". Your message to " + dept + " was received.";

    // Reset form
    contactForm.reset();

    // Scroll to the status for visibility
    formStatus.scrollIntoView({ behavior: "smooth", block: "center" });
  });
}
