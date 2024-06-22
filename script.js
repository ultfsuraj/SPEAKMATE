// step 1 : text to speech, 
// step 2 : speech to text, 
// step 3 : api integration, chatGPT (similar), LLMs that can run locally ? 


if (!('speechSynthesis' in window)) {
    alert('Your browser does not support the Web Speech API');
}

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
const pitchTxt = document.querySelector('#pitch')
const rateTxt = document.querySelector('#rate')
const modelnameTxt = document.querySelector('#modelname')
const accountidTxt = document.querySelector('#accountid')
const workerurlTxt = document.querySelector('#workerurl')
const tokenTxt = document.querySelector('#token')

let pitch = 0.95
let rate = 1
let modelName = ''
let accountID = ''
let token = ''
let workerURL = 'https://speakmate.tepax23408.workers.dev/'
let speak = true;
let voiceIndex = 0;
let voices = window.speechSynthesis.getVoices() || []
let thankmsg = "Thank you for your patience"
const stopText = "stop recognition"
const waitMsg = ['give me some time to answer', 'ok. let me think for a while', 'wait a second. i will answer that', 'please hold for a second']
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let QA = ""
let answered = false


if (!SpeechRecognition) {
    alert('Your browser does not support the Web Speech API');
}
const recognition = new SpeechRecognition();
recognition.continuous = false;
recognition.interimResults = true;
recognition.lang = 'en-US';



const BUFFER = {
    length: 0,
    text: ''
}
const voicesContext = {
    active: 0,
    prevEle: {},
}

const tellMe = (text, voiceIndex, pitch, rate, wait = false) => {
    let utterThis = new SpeechSynthesisUtterance(text);
    utterThis.voice = voices[voiceIndex];
    utterThis.pitch = pitch;
    utterThis.rate = rate;
    utterThis.onstart = () => {
        answer.value = ""
        BUFFER.text = stopText
        recognition.stop()
        answer.value = text
        cancelBtn.ariaDisabled = false
        speakBtn.ariaDisabled = true
    }
    utterThis.onend = () => {
        BUFFER.text = ''
        if (!speak) {
            answer.value = ""
        } else {
            speakBtn.ariaDisabled = false
        }
        if (!wait && !speak) {
            try {
                recognition.start()
            } catch (e) { }
        }
        cancelBtn.ariaDisabled = true

    }

    window.speechSynthesis?.speak(utterThis);
}


recognition.onstart = () => {
    startBtn.ariaDisabled = true
    stopBtn.ariaDisabled = false
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
    let text = answer.value
    stopBtn.click()
    answer.value = text
    interimTxt.innerHTML = "<span style='color:red'>Need Internet Connection</span> "
    setTimeout(() => interimTxt.innerHTML = '', 3000)

};

recognition.onend = () => {
    let index = BUFFER.text.toLocaleLowerCase().indexOf(stopText)
    if (index < 0) {
        try {
            recognition.start()
        } catch (e) { }
    }
    BUFFER.text.trim()
    if (index >= 0) {
        answer.value += BUFFER.text.substring(0, index)
    } else if (BUFFER.text.length > 0) {
        answer.value += BUFFER.text + ". "
    }
    setTimeout(() => interimTxt.textContent = "", 500)
    if (index > -1) {
        recognition.stop();
        if (answer.value.length > 0) {

            sendMessage(answer.value)
            answer.value = ''
            BUFFER.text = ''

            botImg.style.animation = "botblink 1.5s 3s ease-in-out infinite"
            tvWrapper.style.animation = "randomBorder 1.5s 3s ease-in-out infinite"

            setTimeout(() => {
                if (!window.speechSynthesis.speaking && !answered) {
                    tellMe(waitMsg[Math.floor(Math.random() * (waitMsg.length))], voiceIndex, pitch, rate, true)
                }
            }, 3000)

            setTimeout(() => {
                if (!window.speechSynthesis.speaking && !answered) {
                    tellMe(thankmsg, voiceIndex, pitch, rate, true)
                }
            }, 8000)

        } else {
            stopBtn.click()
        }
        return
    }

    BUFFER.text = ''
    try {
        recognition.start()
    } catch (e) { }
};

startBtn.addEventListener('click', () => {
    speakBtn.ariaDisabled = true
    speak = false;
    answer.value = ''
    BUFFER.text = ''
    window.speechSynthesis.cancel()
    try {
        recognition.start()
    } catch (e) { }
});

stopBtn.addEventListener('click', () => {
    speak = true;
    answer.value = ''
    BUFFER.text = stopText
    speakBtn.ariaDisabled = false
    cancelBtn.ariaDisabled = true
    botImg.style.animation = "none"
    tvWrapper.style.animation = "none"
    window.speechSynthesis.cancel()
    recognition.stop();
    startBtn.ariaDisabled = false
    stopBtn.ariaDisabled = true

});

cancelBtn.addEventListener('click', () => {
    window.speechSynthesis.cancel()
    answer.value = ''
    BUFFER.text = ''
    try {
        recognition.start()
    } catch (e) { }
})

speechSynthesis.onvoiceschanged = () => {
    voices = window.speechSynthesis.getVoices();
    voices.forEach((voice, index) => {
        let div = document.createElement('div')
        div.classList.add('voice')
        if (index == voiceIndex) {
            div.classList.add('voiceActive')
            voicesContext.prevEle = div
        }
        div.setAttribute('data-key', index)
        div.setAttribute('role', "option")
        div.innerText = voice.name
        voicesContainer.appendChild(div)
    })
}


const speakBtn = document.querySelector(".speak")

speakBtn.addEventListener("click", () => {
    if (speak) {
        tellMe(answer.value, voiceIndex, pitch, rate)
    }
})

const clearBtn = document.querySelector(".clear")
clearBtn.addEventListener("click", () => {
    answer.value = ""
})


const compressMsg = async () => {
    let payload = {
        prompt: `${QA}. compress our above conversation without loosing context & only send the dialogs. use 'Me' for questions i asked to you, and 'YOU' for answers you've given.`,
        accountID: accountID,
        token: token,
        modelName: modelName,
    }
    try {
        workerURL = workerurlTxt.value ||  'https://speakmate.tepax23408.workers.dev/'
        const response = await fetch(workerURL, {
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
        QA = `${data?.result?.response}\n `

        console.log(QA)

    } catch (e) {
        console.log('compressMsg', e)
    }
}


const sendMessage = async (prompt) => {

    QA += `Me: ${prompt} \n`
    console.log(QA.length)
    let payload = {
        prompt: `${QA} based on our discussion above, answer as short as possible, to the point.`,
        accountID: accountID,
        token: token,
        modelName: modelName,
    }

    answered = false

    try {
        workerURL = workerurlTxt.value ||  'https://speakmate.tepax23408.workers.dev/'
        const response = await fetch(workerURL, {
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
        QA += `You: ${data?.result?.response}\n`
        answered = true
        tellMe(data?.result?.response, voiceIndex, pitch, rate)

        if(QA.length > 4500){
            compressMsg()
        }

    } catch (error) {
        answer.value = error
        stopBtn.click()
        interimTxt.innerHTML = "<span style='color:red;'> Invalid Credentials </span>"
        setTimeout(() => interimTxt.innerHTML = '', 4000)
    }

}




function closeHelp(close) {
    if (close) {
        helpSec.style.zIndex = -1;
    } else {
        helpSec.style.zIndex = 3;
    }
}
function closeHowTo(close) {
    if (close) {
        howToSec.style.zIndex = -1;
    } else {
        howToSec.style.zIndex = 3;
    }
}
function closeConfig(close) {
    if (close) {
        configSec.style.zIndex = -1;
    } else {
        configSec.style.zIndex = 3;
    }
}

chooseVoice.addEventListener('click', () => {
    voicesContainer.classList.toggle('hide')
})

voicesContainer.addEventListener('click', (e) => {
    voicesContext.prevEle.classList.remove('voiceActive')
    e.target.classList.add('voiceActive')
    voicesContext.prevEle = e.target
    voiceIndex = e.target.getAttribute('data-key')
    setTimeout(() => voicesContainer.classList.toggle('hide'), 300)
})

function changePitch() {
    pitch = pitchTxt.value
}

function changeRate() {
    rate = rateTxt.value
}

function changeModelName() {
    modelName = modelnameTxt.value
}

function changeAccountID() {
    accountID = accountidTxt.value
}

function changeWorkerURL() {
    workerURL = workerurlTxt.value
}

function changeToken() {
    token = tokenTxt.value
}

document.querySelector('#install').addEventListener('click', (event) => {
    if (bipEvent) {
        bipEvent.prompt()
    } else {
        interimTxt.innerHTML = "<span style='color:red;'>To install the app look for 'Add to Homescreen' or 'Install' option in your browser's menu</span>"
        setTimeout(() => interimTxt.innerHTML = '', 3000)
    }
})
