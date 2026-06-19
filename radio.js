const dialSelect = document.getElementById("radio-dial");
const statusDisplay = document.getElementById("radio-status");
const btnPlay = document.getElementById("btn-play");
const btnPause = document.getElementById("btn-pause");
const btnStop = document.getElementById("btn-stop");

let audio = new Audio();
audio.crossOrigin = "anonymous";

if (dialSelect) audio.src = dialSelect.value;

if (btnPlay) {
    btnPlay.addEventListener("click", () => {
        audio.play().then(() => {
            btnPlay.classList.add("active");
            if (btnPause) btnPause.classList.remove("active");
            actualizarTextoEmisora();
        }).catch(err => {
            if (statusDisplay) statusDisplay.textContent = "DIAL EN ESPERA... REINTENTA";
            audio.load();
        });
    });
}

if (btnPause) {
    btnPause.addEventListener("click", () => {
        audio.pause();
        if (btnPause) btnPause.classList.add("active");
        if (btnPlay) btnPlay.classList.remove("active");
        if (statusDisplay) statusDisplay.textContent = "RADIO EN PAUSA";
    });
}

if (btnStop) {
    btnStop.addEventListener("click", () => {
        audio.pause();
        audio.currentTime = 0;
        if (btnPlay) btnPlay.classList.remove("active");
        if (btnPause) btnPause.classList.remove("active");
        if (statusDisplay) statusDisplay.textContent = "RADIO APAGADA";
    });
}

if (dialSelect) {
    dialSelect.addEventListener("change", () => {
        const sonando = !audio.paused;
        audio.pause();
        audio.src = dialSelect.value;
        if (sonando) {
            audio.play().then(() => actualizarTextoEmisora());
        } else {
            if (statusDisplay) statusDisplay.textContent = "DIAL CAMBIADO";
        }
    });
}

function actualizarTextoEmisora() {
    if (!statusDisplay || !dialSelect) return;
    const nombreEmisora = dialSelect.options[dialSelect.selectedIndex].text;
    statusDisplay.textContent = "AL AIRE: " + nombreEmisora.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDC00-\uDFFF]/g, "").trim();
}
