// step 1 : text to speech, 
// step 2 : speech to text, 
// step 3 : api integration, chatGPT (similar), LLMs that can run locally ? 


if (!('speechSynthesis' in window)) {
    alert('Your browser does not support the Web Speech API');
}

let pitch = 0.95
let rate = 1
let voices = window.speechSynthesis.getVoices() || []
const stopText = "stop recognition"
const waitMsg =  ['give me some time to answer', 'ok. let me think for a while', 'wait a second. i will answer that', 'please hold for a second'] 
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
        speechTxt.value = ""
        BUFFER.text = stopText
        recognition.stop()
        speechTxt.value = text
    }
    utterThis.onend = () => {
        BUFFER.text = ''
        speechTxt.value = ""
        if(!waitMsg.includes(text)){
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
    if(index<0){
        recognition.start()
    }
    BUFFER.text.trim()
    if (index >= 0) {
        speechTxt.value += BUFFER.text.substring(0, index)
    } else if (BUFFER.text.length >0) {
        speechTxt.value += BUFFER.text + ". "
    }
    setTimeout(() => interimTxt.textContent = "", 500)
    startBtn.disabled = false;
    stopBtn.disabled = true;
    if (index>-1) {
        recognition.stop();
        if (speechTxt.value.length > 0) {
            sendMessage(speechTxt.value)
            speechTxt.value = ''
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
    BUFFER.text = stopText
    recognition.stop();
});

cancelBtn.addEventListener('click', () => {
    window.speechSynthesis.cancel()
    speechTxt.value = ''
    recognition.start()
})

speechSynthesis.onvoiceschanged = () => {
    voices = window.speechSynthesis.getVoices();
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

    setTimeout(()=>{
        tellMe(waitMsg[ Math.floor(Math.random() * (waitMsg.length))], 3, 0.95, 1)
    } , 2000)

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
        tellMe(data?.result?.response, 3, 0.95, 1)

    } catch (error) {
        console.error('Error:', error)
    }

}


