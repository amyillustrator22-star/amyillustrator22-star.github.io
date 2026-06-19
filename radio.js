// Cerebro de la Radio con Desbloqueo de seguridad CORS
const dialSelect = document.getElementById("radio-dial");
const statusDisplay = document.getElementById("radio-status");
const btnPlay = document.getElementById("btn-play");
const btnPause = document.getElementById("btn-pause");
const btnStop = document.getElementById("btn-stop");

let audio = new Audio();
audio.crossOrigin = "anonymous"; // 🔓 Desbloqueador de seguridad para streams públicos
if (dialSelect) audio.src = dialSelect.value;

window.addEventListener("DOMContentLoaded", () => {
    const savedState = localStorage.getItem("radioState");
    const savedDial = localStorage.getItem("radioDial");

    if (savedDial && dialSelect) {
        dialSelect.value = savedDial;
        audio.src = savedDial;
    }

    if (savedState === "playing") {
        audio.play().then(() => {
            actualizarTextoEmisora();
            if (btnPlay) btnPlay.classList.add("active");
        }).catch(() => {
            if (statusDisplay) statusDisplay.textContent = "PULSA PLAY PARA OÍR";
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
            audio.load();
            audio.play().then(() => actualizarTextoEmisora()).catch(err => console.log(err));
        } else {
            if (statusDisplay) statusDisplay.textContent = "DIAL CAMBIADO";
        }
    });
}

if (btnPlay) {
    btnPlay.addEventListener("click", () => {
        audio.load();
        audio.play().then(() => {
            localStorage.setItem("radioState", "playing");
            btnPlay.classList.add("active");
            if (btnPause) btnPause.classList.remove("active");
            actualizarTextoEmisora();
        }).catch(err => {
            console.error(err);
            if (statusDisplay) statusDisplay.textContent = "ERROR DE CONEXIÓN";
        });
    });
}

if (btnPause) {
    btnPause.addEventListener("click", () => {
        audio.pause();
        localStorage.setItem("radioState", "paused");
        btnPause.classList.add("active");
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
