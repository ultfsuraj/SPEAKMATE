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
const cancelBtn = document.querySelector('.cancelBtn')

const BUFFER = {
    length: 0,
    text: ''
}


const tellMe = (text, voiceIndex, pitch, rate) => {
    let utterThis = new SpeechSynthesisUtterance(text);
    utterThis.voice = voices[voiceIndex];
    utterThis.pitch = pitch;
    utterThis.rate = rate;
    utterThis.onstart = () => {
        recognition.stop()
    }
    utterThis.onend = () => {
        recognition.start()
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
    tellMe("speech recognition error. check your internet.", 1, 0.95, 1)
    recognition.start()
};

recognition.onend = () => {
    BUFFER.text.trim()
    let index = BUFFER.text.toLocaleLowerCase().indexOf("stop recognition")
    if (index >= 0) {
        speechTxt.value += BUFFER.text.substring(0, index)
    } else {
        speechTxt.value += BUFFER.text + ". "
    }
    setTimeout(() => interimTxt.textContent = "", 700)
    startBtn.disabled = false;
    stopBtn.disabled = true;
    if (BUFFER.text.toLowerCase().includes("stop recognition")) {
        recognition.stop();
        if (speechTxt.value.length > 0) {
            sendMessage(speechTxt.value)
            BUFFER.text = ''
        }
        return
    }
    
    BUFFER.text = ''
    recognition.start();
};

startBtn.addEventListener('click', () => {
    recognition.start();
});

stopBtn.addEventListener('click', () => {
    recognition.stop();
});


cancelBtn.addEventListener('click', () => {
    window.speechSynthesis.cancel()
    recognition.start()
})

speechSynthesis.onvoiceschanged = () => {
    voices = window.speechSynthesis.getVoices();
    tellMe(inputTxt, 4, 0.95, 1)
}


const speakBtn = document.querySelector(".speakBtn")

speakBtn.addEventListener("click", () => {
    tellMe(speechTxt.value, 7, 0.95, 1)
})

const clearBtn = document.querySelector(".clearBtn")
clearBtn.addEventListener("click", () => {
    speechTxt.value = ""
})



const sendMessage = async (prompt) => {
    let payload = {
        prompt: prompt + " correct above question & Answer in few sentences."
    }
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
        speechTxt.value = ""
        tellMe(data?.result?.response, 7, 0.95, 1)

    } catch (error) {
        console.error('Error:', error)
    }

}


