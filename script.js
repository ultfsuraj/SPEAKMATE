// step 1 : text to speech, 
// step 2 : speech to text, 
// step 3 : api integration, chatGPT (similar), LLMs that can run locally ? 


if (!('speechSynthesis' in window)) {
    alert('Your browser does not support the Web Speech API');
  }
  

setInterval(()=>{


    let synth = window.speechSynthesis;

    let inputTxt = "o. Hi, I'm your AI assistant.... you can talk to me in english, we can practice together"
    let pitch = 0.95
    let rate = 1
    
    let voices = window.speechSynthesis.getVoices() ;
    if(voices.length == 0){
        alert("No voices found on your browser")
    }
    
    console.log('voices', voices)
    
    let tellMe = (text,voiceIndex, pitch, rate) => {
        let utterThis = new SpeechSynthesisUtterance(text);
        utterThis.voice = voices[voiceIndex];
        utterThis.pitch = pitch;
        utterThis.rate = rate;
        synth.speak(utterThis);
    }
    
    tellMe(inputTxt,7, 1, 1)
    


},5000)

