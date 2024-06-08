// step 1 : text to speech, 
// step 2 : speech to text, 
// step 3 : api integration, chatGPT (similar), LLMs that can run locally ? 

// https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API/Using_the_Web_Speech_API

if (!('speechSynthesis' in window)) {
    alert('Your browser does not support the Web Speech API');
}

let inputTxt = "Hi, I'm your AI assistant.... you can talk to me in english, we can practice together"
let pitch = 0.95
let rate = 1
let voices = window.speechSynthesis.getVoices() || []


const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
    alert('Your browser does not support the Web Speech API');
}
const recognition = new SpeechRecognition();
recognition.continuous = true;
recognition.interimResults = true;
recognition.lang = 'en-US';
const startBtn = document.querySelector('.startBtn')
const stopBtn = document.querySelector('.stopBtn')
const speechTxt = document.querySelector('.speechTxt')
const interimTxt = document.querySelector('.interim')


const BUFFER = {
    length: 0,
    text: ''
}

recognition.onstart = () => {
    startBtn.disabled = true
    stopBtn.disabled = false
};

recognition.onresult = (event) => {
    let finalTranscript = speechTxt.value;

    for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
            interimTxt.textContent = transcript
            setTimeout(( )=>interimTxt.textContent = "", 500)
            BUFFER.length=0
            BUFFER.text = ''
        }
        else {
            BUFFER.length++
            BUFFER.text =  (transcript.length > BUFFER.text.length)? transcript : BUFFER.text
            if(BUFFER.length==2){
                interimTxt.textContent = BUFFER.text
                BUFFER.length = 0
            }

            
        }
    }
    speechTxt.value = finalTranscript;
};

recognition.onerror = (event) => {
    console.error('Speech recognition error', event.error);
};

recognition.onend = () => {
    startBtn.disabled = false;
    stopBtn.disabled = true;
};

startBtn.addEventListener('click', () => {
    recognition.start();
});

stopBtn.addEventListener('click', () => {
    recognition.stop();
});


const tellMe = (text, voiceIndex, pitch, rate) => {
    let utterThis = new SpeechSynthesisUtterance(text);
    utterThis.voice = voices[voiceIndex];
    utterThis.pitch = pitch;
    utterThis.rate = rate;
    window.speechSynthesis?.speak(utterThis);
    console.log(text)
}

speechSynthesis.onvoiceschanged = () => {
    voices = window.speechSynthesis.getVoices();
    tellMe(inputTxt,7,0.95,1)
}


const speakBtn = document.querySelector(".speakBtn")

speakBtn.addEventListener("click",()=>{
    tellMe(speechTxt.value, 7, 0.95, 1)
})

const clearBtn = document.querySelector(".clearBtn")
clearBtn.addEventListener("click",()=>{
    speechTxt.value = ""
})

