// Estación Synthwave de alta calidad para evitar sonido robótico
const AUDIO_URL = "https://stream.syntheticfm.com/1";
let audio = new Audio(AUDIO_URL);

const statusDisplay = document.getElementById("radio-status");
const btnPlay = document.getElementById("btn-play");
const btnPause = document.getElementById("btn-pause");
const btnStop = document.getElementById("btn-stop");

window.addEventListener("DOMContentLoaded", () => {
    const savedState = localStorage.getItem("radioState");

    if (savedState === "playing") {
        audio.play().then(() => {
            updateDisplay("SINTONIZANDO RETRO-FM...");
            btnPlay.classList.add("active");
        }).catch(() => {
            updateDisplay("PULSA PLAY PARA OÍR");
        });
    }
});

btnPlay.addEventListener("click", () => {
    // Si la transmisión se pausó, volvemos a cargar para conectar en vivo sin retrasos
    audio.load();
    audio.play();
    localStorage.setItem("radioState", "playing");
    btnPlay.classList.add("active");
    btnPause.classList.remove("active");
    updateDisplay("SINTONIZANDO RETRO-FM...");
});

btnPause.addEventListener("click", () => {
    audio.pause();
    localStorage.setItem("radioState", "paused");
    btnPause.classList.add("active");
    btnPlay.classList.remove("active");
    updateDisplay("RADIO EN PAUSA");
});

btnStop.addEventListener("click", () => {
    audio.pause();
    localStorage.setItem("radioState", "stopped");
    btnPlay.classList.remove("active");
    btnPause.classList.remove("active");
    updateDisplay("RADIO APAGADA");
});

function updateDisplay(text) {
    if (statusDisplay) statusDisplay.textContent = text;
}
