// step 1 : text to speech, 
// step 2 : speech to text, 
// step 3 : api integration, chatGPT (similar), LLMs that can run locally ? 


if (!('speechSynthesis' in window)) {
    alert('Your browser does not support the Web Speech API');
  }
  
const textArea = document.querySelector(".enterTxt")
let inputTxt = "Hi, I'm your AI assistant.... you can talk to me in english, we can practice together"
let pitch = 0.95
let rate = 1
let voices = window.speechSynthesis.getVoices() || []

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
    tellMe(textArea.value, 7, 0.95, 1)
})