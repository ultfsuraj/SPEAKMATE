// step 1 : text to speech, 
// step 2 : speech to text, 
// step 3 : api integration, chatGPT (similar), LLMs that can run locally ? 


if (!('speechSynthesis' in window)) {
    alert('Your browser does not support the Web Speech API');
}

let pitch = 0.95
let rate = 1
let speak = true;
let voiceIndex = 0;
let voices = window.speechSynthesis.getVoices() || []
const stopText = "stop recognition"
const waitMsg = ['give me some time to answer', 'ok. let me think for a while', 'wait a second. i will answer that', 'please hold for a second']
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
    alert('Your browser does not support the Web Speech API');
}
const recognition = new SpeechRecognition();
recognition.continuous = true;
recognition.interimResults = true;
recognition.lang = 'en-US';
const startBtn = document.querySelector('.start')
const stopBtn = document.querySelector('.stop')
const answer = document.querySelector('.ans')
const interimTxt = document.querySelector('.interim')
const cancelBtn = document.querySelector('.mute')
const botImg = document.querySelector('.botImg')
const tvWrapper = document.querySelector('.tvWrapper')
const homeSec = document.querySelector('#homeSection')
const helpSec = document.querySelector('#helpSection')
const howToSec = document.querySelector('#howToSection')
const configSec = document.querySelector('#configSection')
const chooseVoice = document.querySelector('.select')
const voicesContainer = document.querySelector('.voicesContainer')

const BUFFER = {
    length: 0,
    text: ''
}
const voicesContext = {
    active: 0 ,
    prevEle: {},
}

const tellMe = (text, voiceIndex, pitch, rate) => {
    let utterThis = new SpeechSynthesisUtterance(text);
    utterThis.voice = voices[voiceIndex];
    utterThis.pitch = pitch;
    utterThis.rate = rate;
    utterThis.onstart = () => {
        answer.value = ""
        BUFFER.text = stopText
        recognition.stop()
        answer.value = text
    }
    utterThis.onend = () => {
        BUFFER.text = ''
        if(!speak){
            answer.value = ""
        }
        if (!waitMsg.includes(text) && !speak) {
            recognition.start()
        }
    }

    window.speechSynthesis?.speak(utterThis);
}


recognition.onstart = () => {
    startBtn.disabled = true
    stopBtn.disabled = false
};


// here we want to add to textarea, only if event.results[i][0].isFinal
recognition.onresult = (event) => {
    for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        interimTxt.textContent = transcript
        BUFFER.text = transcript
    }
};

recognition.onerror = (event) => {
    console.log('Speech recognition error. ', event.error);
};

recognition.onend = () => {
    let index = BUFFER.text.toLocaleLowerCase().indexOf(stopText)
    if (index < 0) {
        recognition.start()
    }
    BUFFER.text.trim()
    if (index >= 0) {
        answer.value += BUFFER.text.substring(0, index)
    } else if (BUFFER.text.length > 0) {
        answer.value += BUFFER.text + ". "
    }
    setTimeout(() => interimTxt.textContent = "", 500)
    startBtn.disabled = false;
    stopBtn.disabled = true;
    if (index > -1) {
        recognition.stop();
        if (answer.value.length > 0) {
            sendMessage(answer.value)
            answer.value = ''
            BUFFER.text = ''
        }
        return
    }

    BUFFER.text = ''
    recognition.start();
};

startBtn.addEventListener('click', () => {
    // disable speak button
    speak = false;
    answer.value = ''
    BUFFER.text = ''
    window.speechSynthesis.cancel()
    recognition.start();
});

stopBtn.addEventListener('click', () => {
    // enable speak button
    speak = true;
    answer.value = ''
    BUFFER.text = stopText
    window.speechSynthesis.cancel()
    recognition.stop();
});

cancelBtn.addEventListener('click', () => {
    window.speechSynthesis.cancel()
    answer.value = ''
    BUFFER.text = ''
    recognition.start()
})

speechSynthesis.onvoiceschanged = () => {
    voices = window.speechSynthesis.getVoices();
    voices.forEach((voice,index)=>{
        let div = document.createElement('div')
        div.classList.add('voice')
        if(index == voiceIndex){
            div.classList.add('voiceActive')
            voicesContext.prevEle = div 
        }
        div.setAttribute('data-key',index)
        div.innerText = voice.name 
        voicesContainer.appendChild(div)
    })
}


const speakBtn = document.querySelector(".speak")

speakBtn.addEventListener("click", () => {
    if (speak) {
        tellMe(answer.value, voiceIndex, 0.95, 1)
    }
})

const clearBtn = document.querySelector(".clear")
clearBtn.addEventListener("click", () => {
    answer.value = ""
})



const sendMessage = async (prompt) => {
    let payload = {
        prompt: prompt + "correct above question and answer in brief without mentioning corrected question."
    }

    botImg.style.animation = "botblink 1.5s 3s ease-in-out infinite"
    tvWrapper.style.animation = "randomBorder 1.5s 3s ease-in-out infinite"

    setTimeout(() => {
        tellMe(waitMsg[Math.floor(Math.random() * (waitMsg.length))], voiceIndex, 0.95, 1)
    }, 2500)

    try {
        const response = await fetch('https://withered-frog-d5b7.purkufirte.workers.dev/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })

        if (!response.ok) {
            throw new Error('Network response was not ok')
        }

        const data = await response.json()
        answer.value = ""
        botImg.style.animation = "none"
        tvWrapper.style.animation = "none"

        tellMe(data?.result?.response, voiceIndex, 0.95, 1)

    } catch (error) {
        console.error('Error:', error)
    }

}


function closeHelp(close){
    if(close){
        helpSec.style.zIndex = -1;
    }else{
        helpSec.style.zIndex = 3;
    }
}
function closeHowTo(close){
    if(close){
        howToSec.style.zIndex = -1;
    }else{
        howToSec.style.zIndex = 3;
    }
}
function closeConfig(close){
    if(close){
        configSec.style.zIndex = -1;
    }else{
        configSec.style.zIndex = 3;
    }
}

chooseVoice.addEventListener('click',()=>{
    voicesContainer.classList.toggle('hide')
})

voicesContainer.addEventListener('click',(e)=>{
    voicesContext.prevEle.classList.remove('voiceActive')
    e.target.classList.add('voiceActive')
    voicesContext.prevEle = e.target
    voiceIndex = e.target.getAttribute('data-key')
})