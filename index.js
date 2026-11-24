const input = document.querySelector("#input");
const chatContainer = document.querySelector("#chatContainer");
const askButton = document.querySelector("#askButton");
const id = Date.now().toString(36) + Math.random().toString().substring(2, 8);

input?.addEventListener("keyup", handleEnter);
askButton?.addEventListener("click", handleAsk);

const loadingElement = document.createElement("div");
loadingElement.className = "animation-pulse";
loadingElement.innerText = "Thinking.....";

async function generateUserText(text) {
  const userMessage = document.createElement("div");
  userMessage.className =
    "my-6 bg-neutral-800 p-3 rounded-xl ml-auto max-w-fit";
  userMessage.innerText = text;
  chatContainer?.appendChild(userMessage);
  input.value = "";

  chatContainer.appendChild(loadingElement);
  const response = await callServer(text, id);
  //   console.log(response);

  loadingElement.remove();

  const aiResponse = document.createElement("div");
  aiResponse.className = "max-w-fit";
  aiResponse.innerText = response;
  chatContainer?.appendChild(aiResponse);
}

async function handleEnter(e) {
  if (e.key === "Enter") {
    const text = input.value.trim();
    if (!text) {
      return;
    }
    await generateUserText(text);
  }
}
async function handleAsk() {
  const text = input.value.trim();
  if (!text) {
    return;
  }
  await generateUserText(text);
}

async function callServer(inputText, id) {
  try {
    const response = await fetch("https://ai-chatbot-314u.onrender.com/chat", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ message: inputText, id }),
    });
    const data = await response.json(); // ✅ extract actual data
    return data.response;
  } catch (error) {
    console.log("error: ", error);
  }
}
