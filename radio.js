// Usamos una música Synthwave/Retro libre de derechos alojada en Internet para probar
const AUDIO_URL = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
let audio = new Audio(AUDIO_URL);
audio.loop = true;

const statusDisplay = document.getElementById("radio-status");
const btnPlay = document.getElementById("btn-play");
const btnPause = document.getElementById("btn-pause");
const btnStop = document.getElementById("btn-stop");

// Comprobar la memoria al cargar la página
window.addEventListener("DOMContentLoaded", () => {
    const savedTime = localStorage.getItem("radioTime");
    const savedState = localStorage.getItem("radioState");

    if (savedTime) {
        audio.currentTime = parseFloat(savedTime);
    }

    if (savedState === "playing") {
        // Los navegadores bloquean el autoplay si el usuario no interactúa primero.
        // Intentamos reproducir; si falla, esperamos a que haga clic en cualquier sitio.
        audio.play().then(() => {
            updateDisplay("SINTONIZANDO RE-80S...");
            btnPlay.classList.add("active");
        }).catch(() => {
            updateDisplay("PULSA PLAY PARA OÍR");
        });
    }
});

// Guardar el segundo exacto continuamente mientras suena
audio.addEventListener("timeupdate", () => {
    localStorage.setItem("radioTime", audio.currentTime);
});

// Botón PLAY
btnPlay.addEventListener("click", () => {
    audio.play();
    localStorage.setItem("radioState", "playing");
    btnPlay.classList.add("active");
    btnPause.classList.remove("active");
    updateDisplay("SINTONIZANDO RE-80S...");
});

// Botón PAUSE
btnPause.addEventListener("click", () => {
    audio.pause();
    localStorage.setItem("radioState", "paused");
    btnPause.classList.add("active");
    btnPlay.classList.remove("active");
    updateDisplay("RADIO EN PAUSA");
});

// Botón STOP
btnStop.addEventListener("click", () => {
    audio.pause();
    audio.currentTime = 0;
    localStorage.setItem("radioState", "stopped");
    localStorage.setItem("radioTime", "0");
    btnPlay.classList.remove("active");
    btnPause.classList.remove("active");
    updateDisplay("RADIO APAGADA");
});

function updateDisplay(text) {
    if (statusDisplay) statusDisplay.textContent = text;
}
