// Lógica de Radio Multi-Emisora
const dialSelect = document.getElementById("radio-dial");
const statusDisplay = document.getElementById("radio-status");
const btnPlay = document.getElementById("btn-play");
const btnPause = document.getElementById("btn-pause");
const btnStop = document.getElementById("btn-stop");

// Inicializamos el objeto de Audio con la emisora seleccionada por defecto
let audio = new Audio(dialSelect.value);

window.addEventListener("DOMContentLoaded", () => {
    const savedState = localStorage.getItem("radioState");
    const savedDial = localStorage.getItem("radioDial");

    // Recuperar la última emisora elegida si existe
    if (savedDial && dialSelect) {
        dialSelect.value = savedDial;
        audio.src = savedDial;
    }

    if (savedState === "playing") {
        audio.play().then(() => {
            actualizarTextoEmisora();
            btnPlay.classList.add("active");
        }).catch(() => {
            if (statusDisplay) statusDisplay.textContent = "PULSA PLAY PARA OÍR";
        });
    }
});

// Escuchar cuando el usuario cambia de emisora en el desplegable
dialSelect.addEventListener("change", () => {
    const estabaSonando = !audio.paused;
    
    audio.pause();
    audio.src = dialSelect.value; // Cambiamos la URL del stream
    localStorage.setItem("radioDial", dialSelect.value);

    if (estabaSonando) {
        audio.load();
        audio.play();
        actualizarTextoEmisora();
    } else {
        if (statusDisplay) statusDisplay.textContent = "DIAL CAMBIADO";
    }
});

btnPlay.addEventListener("click", () => {
    audio.load();
    audio.play();
    localStorage.setItem("radioState", "playing");
    btnPlay.classList.add("active");
    btnPause.classList.remove("active");
    actualizarTextoEmisora();
});

btnPause.addEventListener("click", () => {
    audio.pause();
    localStorage.setItem("radioState", "paused");
    btnPause.classList.add("active");
    btnPlay.classList.remove("active");
    if (statusDisplay) statusDisplay.textContent = "RADIO EN PAUSA";
});

btnStop.addEventListener("click", () => {
    audio.pause();
    localStorage.setItem("radioState", "stopped");
    btnPlay.classList.remove("active");
    btnPause.classList.remove("active");
    if (statusDisplay) statusDisplay.textContent = "RADIO APAGADA";
});

function actualizarTextoEmisora() {
    if (!statusDisplay) return;
    const nombreEmisora = dialSelect.options[dialSelect.selectedIndex].text;
    // Quitamos el emoji del principio para el display de la radio
    statusDisplay.textContent = "AL AIRE: " + nombreEmisora.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDC00-\uDFFF]/g, "").trim();
}
