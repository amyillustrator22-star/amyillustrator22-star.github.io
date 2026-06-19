// Cerebro de la Radio con Sintonización Paciente Avanzada
const dialSelect = document.getElementById("radio-dial");
const statusDisplay = document.getElementById("radio-status");
const btnPlay = document.getElementById("btn-play");
const btnPause = document.getElementById("btn-pause");
const btnStop = document.getElementById("btn-stop");

let audio = new Audio();
audio.crossOrigin = "anonymous"; // Permite conectar a streams públicos sin bloqueos

// Inicializar dial
if (dialSelect) audio.src = dialSelect.value;

window.addEventListener("DOMContentLoaded", () => {
    const savedState = localStorage.getItem("radioState");
    const savedDial = localStorage.getItem("radioDial");

    if (savedDial && dialSelect) {
        dialSelect.value = savedDial;
        audio.src = savedDial;
    }

    if (savedState === "playing") {
        if (statusDisplay) statusDisplay.textContent = "SINTONIZANDO...";
        // Esperamos a que haya cargado suficiente datos antes de reproducir
        audio.addEventListener('canplay', function alCargar() {
            audio.play().then(() => {
                actualizarTextoEmisora();
                if (btnPlay) btnPlay.classList.add("active");
            }).catch(() => {
                if (statusDisplay) statusDisplay.textContent = "PULSA PLAY PARA OÍR";
            });
            audio.removeEventListener('canplay', alCargar);
        });
    }
});

if (dialSelect) {
    dialSelect.addEventListener("change", () => {
        const estabaSonando = !audio.paused;
        audio.pause();
        audio.src = dialSelect.value;
        localStorage.setItem("radioDial", dialSelect.value);

        if (estabaSonando) {
            if (statusDisplay) statusDisplay.textContent = "SINTONIZANDO...";
            audio.load();
            audio.addEventListener('canplay', function alCambiar() {
                audio.play().then(() => actualizarTextoEmisora()).catch(err => console.log(err));
                audio.removeEventListener('canplay', alCambiar);
            });
        } else {
            if (statusDisplay) statusDisplay.textContent = "DIAL CAMBIADO";
        }
    });
}

if (btnPlay) {
    btnPlay.addEventListener("click", () => {
        if (statusDisplay) statusDisplay.textContent = "CONECTANDO DIAL...";
        audio.load();
        
        // Sintonización segura: Espera a conectar con el servidor antes de arrancar
        audio.addEventListener('canplay', function alDarPlay() {
            audio.play().then(() => {
                localStorage.setItem("radioState", "playing");
                if (btnPlay) btnPlay.classList.add("active");
                if (btnPause) btnPause.classList.remove("active");
                actualizarTextoEmisora();
            }).catch(err => {
                console.error(err);
                if (statusDisplay) statusDisplay.textContent = "DIAL CAÍDO / REINTENTA";
            });
            audio.removeEventListener('canplay', alDarPlay);
        });
    });
}

if (btnPause) {
    btnPause.addEventListener("click", () => {
        audio.pause();
        localStorage.setItem("radioState", "paused");
        if (btnPause) btnPause.classList.add("active");
        if (btnPlay) btnPlay.classList.remove("active");
        if (statusDisplay) statusDisplay.textContent = "RADIO EN PAUSA";
    });
}

if (btnStop) {
    btnStop.addEventListener("click", () => {
        audio.pause();
        localStorage.setItem("radioState", "stopped");
        if (btnPlay) btnPlay.classList.remove("active");
        if (btnPause) btnPause.classList.remove("active");
        if (statusDisplay) statusDisplay.textContent = "RADIO APAGADA";
    });
}

function actualizarTextoEmisora() {
    if (!statusDisplay || !dialSelect) return;
    const nombreEmisora = dialSelect.options[dialSelect.selectedIndex].text;
    statusDisplay.textContent = "AL AIRE: " + nombreEmisora.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDC00-\uDFFF]/g, "").trim();
}
