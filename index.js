const input       = document.querySelector("#input");
const chatContainer = document.querySelector("#chatContainer");
const messageList = document.querySelector("#messageList");
const askButton   = document.querySelector("#askButton");
const welcomeState = document.querySelector("#welcomeState");
const id = Date.now().toString(36) + Math.random().toString().substring(2, 8);

let isLoading = false;

// ── Suggestion chips ──────────────────────────────────────────────
document.querySelectorAll(".suggestion-chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    input.value = chip.textContent.replace(/^[^\w]+/, "").trim();
    input.dispatchEvent(new Event("input"));
    input.focus();
  });
});

// ── Auto-resize textarea ──────────────────────────────────────────
input?.addEventListener("input", () => {
  input.style.height = "auto";
  input.style.height = Math.min(input.scrollHeight, 160) + "px";
});

// ── Key bindings ──────────────────────────────────────────────────
input?.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});
askButton?.addEventListener("click", sendMessage);

// ── Helpers ───────────────────────────────────────────────────────
function scrollToBottom() {
  chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" });
}

function setLoading(state) {
  isLoading = state;
  askButton.disabled = state;
  askButton.innerHTML = state
    ? `<svg class="w-3.5 h-3.5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
       </svg> Sending`
    : `<svg class="w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
       </svg> Send`;
}

// ── Message rendering ─────────────────────────────────────────────
function appendUserMessage(text) {
  if (welcomeState) welcomeState.remove();

  const wrapper = document.createElement("div");
  wrapper.className = "flex items-end justify-end gap-2 msg-anim";

  const bubble = document.createElement("div");
  bubble.className =
    "bg-violet-600/90 text-white text-sm px-4 py-3 rounded-2xl rounded-br-sm max-w-[75%] leading-relaxed shadow-md shadow-violet-900/30 whitespace-pre-wrap";
  bubble.textContent = text;

  wrapper.appendChild(bubble);
  messageList.appendChild(wrapper);
  scrollToBottom();
}

function createTypingIndicator() {
  const wrapper = document.createElement("div");
  wrapper.className = "flex items-end gap-2.5 msg-anim";
  wrapper.id = "typingIndicator";

  // Avatar
  const avatar = document.createElement("div");
  avatar.className =
    "w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shrink-0 shadow";
  avatar.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.03 2 11c0 2.87 1.37 5.44 3.53 7.18L4 22l4.26-1.42A10.3 10.3 0 0012 21c5.52 0 10-4.03 10-9S17.52 2 12 2z"/>
  </svg>`;

  const bubble = document.createElement("div");
  bubble.className =
    "bg-zinc-800/80 border border-white/6 px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1.5 shadow";
  bubble.innerHTML = `<span class="dot"></span><span class="dot"></span><span class="dot"></span>`;

  wrapper.appendChild(avatar);
  wrapper.appendChild(bubble);
  messageList.appendChild(wrapper);
  scrollToBottom();
  return wrapper;
}

function appendAIMessage(text) {
  const wrapper = document.createElement("div");
  wrapper.className = "flex items-end gap-2.5 msg-anim";

  // Avatar
  const avatar = document.createElement("div");
  avatar.className =
    "w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shrink-0 shadow";
  avatar.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.03 2 11c0 2.87 1.37 5.44 3.53 7.18L4 22l4.26-1.42A10.3 10.3 0 0012 21c5.52 0 10-4.03 10-9S17.52 2 12 2z"/>
  </svg>`;

  const bubble = document.createElement("div");
  bubble.className =
    "bg-zinc-800/80 border border-white/6 text-zinc-100 text-sm px-4 py-3 rounded-2xl rounded-bl-sm max-w-[75%] leading-relaxed shadow whitespace-pre-wrap";
  bubble.textContent = text;

  wrapper.appendChild(avatar);
  wrapper.appendChild(bubble);
  messageList.appendChild(wrapper);
  scrollToBottom();
}

function appendErrorMessage(msg = "Something went wrong. Please try again.") {
  const wrapper = document.createElement("div");
  wrapper.className = "flex items-center gap-2 msg-anim";

  const pill = document.createElement("div");
  pill.className =
    "flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-2.5 rounded-xl mx-auto";
  pill.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
  </svg>${msg}`;

  wrapper.appendChild(pill);
  messageList.appendChild(wrapper);
  scrollToBottom();
}

// ── Core send flow ────────────────────────────────────────────────
async function sendMessage() {
  if (isLoading) return;
  const text = input.value.trim();
  if (!text) return;

  input.value = "";
  input.style.height = "auto";
  setLoading(true);

  appendUserMessage(text);
  const typingEl = createTypingIndicator();

  try {
    const response = await callServer(text, id);
    typingEl.remove();

    if (response) {
      appendAIMessage(response);
    } else {
      appendErrorMessage("No response received.");
    }
  } catch {
    typingEl.remove();
    appendErrorMessage();
  } finally {
    setLoading(false);
  }
}

// ── API call ──────────────────────────────────────────────────────
async function callServer(inputText, sessionId) {
  const response = await fetch("https://ai-chatbot-314u.onrender.com/chat", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ message: inputText, id: sessionId }),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();
  return data.response;
}
