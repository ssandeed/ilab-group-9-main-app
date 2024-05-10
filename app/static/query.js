const msgerForm = document.querySelector(".msger-inputarea");
const msgerInput = document.querySelector(".msger-input");
const sendButton = document.querySelector(".msger-send-btn");
const tabcontent = document.querySelector(".chat-wrapper");

//const BOT_IMG = "{{ url_for('static', filename='assets/med-assistant.png') }}";
const BOT_IMG = "static/assets/med-assistant.png";

const PERSON_IMG = "static/assets/user.png";

const BOT_NAME = "Patrick";
const PERSON_NAME = "You";
//window.addEventListener("load", populateChatLog);
const themeColors = document.querySelectorAll('.theme-color');

function applyTheme(theme) {
  document.body.setAttribute('data-theme', theme);
}

themeColors.forEach(themeColor => {
  themeColor.addEventListener('click', (e) => {
    themeColors.forEach(c => c.classList.remove('active'));
    const theme = themeColor.getAttribute('data-color');
    applyTheme(theme);
    themeColor.classList.add('active');
  });
});
let searchMode = "abstracts"; 
let searchYears = [2000, 2023]; 
// Default search years

document.addEventListener('DOMContentLoaded', () => {
    sessionStorage.clear();

  applyTheme('indigo');

  const searchModeInput = document.getElementById("searchModeInput");
  // Function to Update searchMode
  searchModeInput.addEventListener("change", updateSearchMode);
    // Clear sessionStorage on page refresh



  function updateSearchMode() {
    // Get user-selected search mode from the input field
    searchMode = searchModeInput.value;
    console.log (searchMode)
  }
});
window.onload = function () {
  console.log("Window has loaded!");
  var countdown = 15 * 60; // 15 minutes in seconds
  var timerDisplay = document.getElementById('timer');

  function updateTimer() {
      var minutes = Math.floor(countdown / 60);
      var seconds = countdown % 60;

      // Display the time
      timerDisplay.textContent = minutes + ":" + (seconds < 10 ? "0" : "") + seconds;

      // Decrement the countdown
      countdown--;

      // Check if timer has reached zero
      if (countdown < 0) {
          clearInterval(interval);
          timerDisplay.textContent = "Time's up!";
      }
  }

  // Update the timer every second
  var interval = setInterval(updateTimer, 1000); 
  sessionStorage.clear();
};

const messages = JSON.parse(sessionStorage.getItem("chatMessages")) || [];

sendButton.addEventListener("click", handleSendMessageClick);

msgerForm.addEventListener("submit", handleFormSubmit);

msgerInput.addEventListener("keydown", handleInputKeydown);

function handleSendMessageClick(event) {
  event.preventDefault();
  const msgText = msgerInput.value;
  if (!msgText) return;
  const timestamp_click = getCurrentTimestamp();
  appendMessage(PERSON_IMG, "right", msgText, timestamp_click);
  msgerInput.value = "";
  sendMessageToBot(msgText);
}

function handleFormSubmit(event) {
  event.preventDefault();
  handleSendMessageClick(event);
}

function handleInputKeydown(event) {
  if (event.keyCode === 13) {
    event.preventDefault();
    handleSendMessageClick(event);
  }
}

// Function to add a default bot message
function addDefaultBotMessage() {
  const defaultBotMessage = {
    role: "assistant",
    content: "You are a patient discussing chest pain and associated symptoms with your doctor. Your goal is to ask follow-up questions to gather more information and gauge the conversation with the doctor."
  };
  messages.push(defaultBotMessage);
  sessionStorage.setItem("chatMessages", JSON.stringify(messages));
}

function sendMessageToBot(msgText) {
  msgerInput.value = "";

  const apiKey = "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";
  const searchYears = [2000, 2023];
  const searchMode = "abstracts";
  const pubMedQuery = "";

  const storedChatMessages = sessionStorage.getItem("chatMessages");

  // Check if there are no stored chat messages
  if (!storedChatMessages) {
    // Add default bot message if the chat is empty
    addDefaultBotMessage();
  }


// Function to add a default bot message
function addDefaultBotMessage() {
  const defaultBotMessage = {
    
    role: "assistant", 
    content: "Hello Doctor, how are you?"
    
  
  };
  messages.push(defaultBotMessage);

  const userMessageHi = {
    content: "hey, there! I am good.",
    role: "user"
   
    
  };
  //messages.push(userMessageHi);

  sessionStorage.setItem("chatMessages", JSON.stringify(messages));
}


  // Call botResponse with the updated conversation
  botResponse(messages, msgText, apiKey, searchYears, searchMode, pubMedQuery);
  storeUserMessage(msgText);

  // Log the entire messages array for verification
  console.log("Updated messages array:", messages);
}


function getCurrentTimestamp() {
  return new Date().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
}

function appendMessage(img, side, text, timestamp) {
  const msgHTML = `
    <div class="msg ${side}-msg">
      <img class="msg-img" src="${img}">
      <div class="msg-bubble">
        <div class="msg-text">${text}</div>
        <span class="msg-info-timestamp">${timestamp}</span>
      </div>
    </div>
  `;
  tabcontent.insertAdjacentHTML("beforeend", msgHTML);
  tabcontent.scrollTop = tabcontent.scrollHeight;
}
function storeUserMessage(msgText) {
  // Create the user message object
  const userMessage = {  role: 'user' ,content: msgText};

  // Push the message to the messages array
  messages.push(userMessage);

  // Store the updated messages array in localStorage
  sessionStorage.setItem("chatMessages", JSON.stringify(messages));

  // Log to the console for verification
  console.log("User message stored successfully:", userMessage);
}

function storeBotMessage(msgText) {
  // Create the bot message object
  const botMessage = { role: 'assistant' , content: msgText};

  // Push the message to the messages array
  messages.push(botMessage);

  // Store the updated messages array in localStorage
  sessionStorage.setItem("chatMessages", JSON.stringify(messages));

  // Log to the console for verification
  console.log("Bot message stored successfully:", botMessage);
}

function updatesentimentresponse(response) {
  // Get the list items
  var respListItem1 = document.getElementById('respListItem1');
  

  // Update the content of the list items with the response
  respListItem1.textContent = response;

}
function updatesummaryresponse(response) {
  // Get the list items
  var respListItem1 = document.getElementById('summaryPlaceholder');
  

  // Update the content of the list items with the response
  respListItem1.textContent = response;

}
function botResponse(conversation, value, OpenAIAPIKey, years, mode, pubMedQuery) {
  console.log ('Conversation So Far:', conversation)
  const timestamp_bot = getCurrentTimestamp();

  // Show loader animation
  const loaderHTML = `
    <div class="message-loading">
      <div class="led led-one"></div>
      <div class="led led-two"></div>
      <div class="led led-three"></div>
    </div>
  `;
  appendMessage(BOT_IMG, "left", loaderHTML, timestamp_bot);
  
  // Bot Response
  $.ajax({
    type: 'POST',
    url: '/api/chat',
    data: JSON.stringify({
      messages: conversation,
      question: value,
      openai_api_key: OpenAIAPIKey,
      years: years,
      search_mode: mode,
      pubmed_query: pubMedQuery
    }),
    contentType: 'application/json',
    dataType: 'json'
  }).done(function (data) {

    // Extract data from the response object
    const {answer, citations, sentiment_response, summary} = data;
    updatesentimentresponse(sentiment_response);
    updatesummaryresponse(summary);
    storeBotMessage(answer);

    // Remove loader animation
    $('.message-loading').parent().remove();

    // Remove left image for the latest bot message only
    $('.msg.left-msg:last .msg-img').remove();
    $('.msg-info-timestamp:last').remove();

    // Append the bot's response to the chat interface
    const messageTextWithCitations = createMessageWithCitations(answer, citations);
    appendMessage(BOT_IMG, "left", messageTextWithCitations, timestamp_bot);

  
  }).fail(function (error) {
    console.error('Error:', error);
    // Handle errors, e.g., display an error message in the chat interface
  });
 
}

// Helper function to create a message with linkified citations in a single line
function createMessageWithCitations(messageText, citations) {
  let messageWithCitations = messageText;

  if (citations && citations.length > 0) {
    const citationLinks = citations.map(citationId => {
      const citationLink = `https://www.ncbi.nlm.nih.gov/pubmed/${citationId}`;
      return `<a href="${citationLink}" target="_blank">${citationId}</a>`;
    });
    const citationsLine = citations.join(', ');
    messageWithCitations += `<br><br>Citations: ${citationLinks.join(', ')}`;
  }

  return messageWithCitations;
}

const subscriptionKey = "4ed2afeadc184dfca3464429c3307a94"; // Replace with your subscription key
const region = "eastus"; // Replace with your region
const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(subscriptionKey, region);
speechConfig.speechRecognitionLanguage = "en-US"; // Replace with your preferred language

const recognizer = new SpeechSDK.SpeechRecognizer(speechConfig);

let isRecording = false;

const micButton = document.getElementById("microphone-btn");

function startRecording() {
  recognizer.startContinuousRecognitionAsync();

  recognizer.recognizing = function (s, e) {
    const audio_data = e.result.text;
    console.log("Audio data:", audio_data);
    msgerInput.value = audio_data;
    console.log("Input field:", msgerInput);
    //const microphoneIcon = document.getElementById("microphone-icon");
    //console.log("Icon Instantiated:", microphoneIcon);
    //microphoneIcon.setAttribute("stroke", "#FF0000");
  };

  recognizer.canceled = function (s, e) {
    console.log(`CANCELED: Reason=${e.reason}`);
  };

  recognizer.sessionStopped = function (s, e) {
    console.log("\n    Session stopped event.");
    recognizer.stopContinuousRecognitionAsync();
    isRecording = false;
    const microphoneIcon = document.getElementById("microphone-icon");
    microphoneIcon.setAttribute("stroke", "#605d75");
  };

}

function stopRecording() {
  recognizer.stopContinuousRecognitionAsync();
  isRecording = false;
  micButton.style.color = "black"; // change color back to black
}

function toggleRecording() {
  if (isRecording) {
    stopRecording();
  } else {
    isRecording = true;
    const microphoneIcon = document.getElementById("microphone-icon");
    console.log("Icon Instantiated:", microphoneIcon);
    microphoneIcon.setAttribute("stroke", "#FF0000");// change color to red
    startRecording();
  }
}

micButton.addEventListener("click", toggleRecording);


function controlFromInput(fromSlider, fromInput, toInput, controlSlider) {
  const [from, to] = getParsed(fromInput, toInput);
  fillSlider(fromInput, toInput, '#C6C6C6', '#25daa5', controlSlider);
  if (from > to) {
      fromSlider.value = to;
      fromInput.value = to;
  } else {
      fromSlider.value = from;
  }
}
  
function controlToInput(toSlider, fromInput, toInput, controlSlider) {
  const [from, to] = getParsed(fromInput, toInput);
  fillSlider(fromInput, toInput, '#C6C6C6', '#25daa5', controlSlider);
  setToggleAccessible(toInput);
  if (from <= to) {
      toSlider.value = to;
      toInput.value = to;
  } else {
      toInput.value = from;
  }
}

function controlFromSlider(fromSlider, toSlider, fromInput) {
const [from, to] = getParsed(fromSlider, toSlider);
fillSlider(fromSlider, toSlider, '#C6C6C6', '#25daa5', toSlider);
if (from > to) {
  fromSlider.value = to;
  fromInput.value = to;
} else {
  fromInput.value = from;
}
}

function controlToSlider(fromSlider, toSlider, toInput) {
const [from, to] = getParsed(fromSlider, toSlider);
fillSlider(fromSlider, toSlider, '#C6C6C6', '#25daa5', toSlider);
setToggleAccessible(toSlider);
if (from <= to) {
  toSlider.value = to;
  toInput.value = to;
} else {
  toInput.value = from;
  toSlider.value = from;
}
}

function getParsed(currentFrom, currentTo) {
const from = parseInt(currentFrom.value, 10);
const to = parseInt(currentTo.value, 10);

searchYears = [from, to];
console.log("Search years updated to:", searchYears);
return [from, to];
}

function fillSlider(from, to, sliderColor, rangeColor, controlSlider) {
  const rangeDistance = to.max-to.min;
  const fromPosition = from.value - to.min;
  const toPosition = to.value - to.min;
  controlSlider.style.background = `linear-gradient(
    to right,
    ${sliderColor} 0%,
    ${sliderColor} ${(fromPosition)/(rangeDistance)*100}%,
    ${rangeColor} ${((fromPosition)/(rangeDistance))*100}%,
    ${rangeColor} ${(toPosition)/(rangeDistance)*100}%, 
    ${sliderColor} ${(toPosition)/(rangeDistance)*100}%, 
    ${sliderColor} 100%)`;
}

function setToggleAccessible(currentTarget) {
const toSlider = document.querySelector('#toSlider');
if (Number(currentTarget.value) <= 0 ) {
  toSlider.style.zIndex = 2;
} else {
  toSlider.style.zIndex = 0;
}
}

const fromSlider = document.querySelector('#fromSlider');
const toSlider = document.querySelector('#toSlider');
const fromInput = document.querySelector('#fromInput');
const toInput = document.querySelector('#toInput');
fillSlider(fromSlider, toSlider, '#C6C6C6', '#25daa5', toSlider);
setToggleAccessible(toSlider);

fromSlider.oninput = () => controlFromSlider(fromSlider, toSlider, fromInput);
toSlider.oninput = () => controlToSlider(fromSlider, toSlider, toInput);
fromInput.oninput = () => controlFromInput(fromSlider, fromInput, toInput, toSlider);
toInput.oninput = () => controlToInput(toSlider, fromInput, toInput, toSlider);

