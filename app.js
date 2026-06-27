// 1. Importaciones oficiales de Firebase SDK (versión modular)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, query, orderBy, limit, getDocs, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 2. Configuración de Firebase para tu proyecto VibezMatch
// (Asegúrate de comprobar estas credenciales con las de tu consola de Firebase)
const firebaseConfig = {
    apiKey: "AIzaSy...", // Reemplaza aquí con la Web API Key real de tu proyecto VibezMatch
    authDomain: "vibezmatch-91c6d.firebaseapp.com",
    projectId: "vibezmatch-91c6d",
    storageBucket: "vibezmatch-91c6d.appspot.com",
    messagingSenderId: "385...",
    appId: "1:385..."
};

// Inicializar Firebase y Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * ==========================================
 * LÓGICA DE LOS RÉCORDS MUNDIALES (LEADERBOARDS)
 * ==========================================
 */
async function switchLeaderboard(gameId) {
    const rowsContainer = document.getElementById("leaderboard-rows");
    if (!rowsContainer) return;

    // 1. Cambiar el estilo visual de los botones para marcar cuál está activo
    const buttons = document.querySelectorAll("#apps-section + section button[id^='btn-']");
    buttons.forEach(btn => {
        if (btn.getAttribute("data-game") === gameId) {
            btn.className = "px-4 py-2 text-sm font-bold rounded-xl transition-all duration-200 bg-pink-600 text-white shadow-md";
        } else {
            btn.className = "px-4 py-2 text-sm font-bold rounded-xl transition-all duration-200 text-gray-700 hover:bg-white/40";
        }
    });

    // 2. Pintar mensaje de carga
    rowsContainer.innerHTML = `<div id="loading-msg" class="px-4 py-4 text-center text-gray-500 w-full font-medium">Cargando puntuaciones online...</div>`;

    try {
        // 3. Consulta a la colección específica del juego en Firestore
        const q = query(collection(db, "records_" + gameId), orderBy("score", "desc"), limit(10));
        const querySnapshot = await getDocs(q);

        rowsContainer.innerHTML = ""; // Limpiar contenedor

        if (querySnapshot.empty) {
            rowsContainer.innerHTML = `<div class="px-4 py-4 text-center text-gray-500 w-full italic">¡Nadie ha registrado récords aún! Sé el primero.</div>`;
            return;
        }

        // 4. Renderizar las filas con las puntuaciones devueltas
        let index = 1;
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const player = data.player || "Anónimo";
            const score = data.score ?? 0;

            const row = document.createElement("div");
            row.className = "grid grid-cols-3 px-4 py-3 font-medium text-gray-800 border-b border-black/5";
            row.innerHTML = `
                <div>${index}°</div>
                <div class="truncate">${player}</div>
                <div class="text-right font-bold text-slate-900">${score}</div>
            `;
            rowsContainer.appendChild(row);
            index++;
        });

    } catch (error) {
        console.error("Error al obtener marcadores de Firestore: ", error);
        rowsContainer.innerHTML = `<div class="px-4 py-4 text-center text-red-600 w-full font-bold">Error al conectar con los récords mundiales.</div>`;
    }
}

/**
 * ==========================================
 * LÓGICA DE SUGERENCIAS Y ENVIOS (CON HONEYPOT)
 * ==========================================
 */
async function enviarSugerencia() {
    // VERIFICACIÓN CRÍTICA DE SEGURIDAD: CONTROL DEL HONEYPOT
    const honeypot = document.getElementById("sys_security_feedback_hp");
    if (honeypot && honeypot.value !== "") {
        console.warn("Intento de spam bloqueado por el Honeypot.");
        return; // Detiene la ejecución en silencio si un bot completó el campo oculto
    }

    const autorInput = document.getElementById("sug-autor");
    const mensajeInput = document.getElementById("sug-mensaje");
    const msgExito = document.getElementById("msg-envio-exito");

    if (!autorInput || !mensajeInput) return;

    const autor = autorInput.value.trim();
    const mensaje = mensajeInput.value.trim();

    if (autor === "" || mensaje === "") {
        alert("Por favor, rellena tu nombre y el comentario.");
        return;
    }

    try {
        // Enviar a la colección de sugerencias de Firestore
        await addDoc(collection(db, "sugerencias"), {
            author: autor,
            message: mensaje,
            approved: false, // Se guarda como falso para moderación previa por tu parte
            timestamp: serverTimestamp()
        });

        // Limpiar formulario y mostrar éxito
        autorInput.value = "";
        mensajeInput.value = "";
        if (msgExito) {
            msgExito.classList.remove("hidden");
            setTimeout(() => msgExito.classList.add("hidden"), 5000);
        }

    } catch (error) {
        console.error("Error al guardar la sugerencia en Firestore: ", error);
        alert("Error al enviar el comentario.");
    }
}

// Cargar marcadores iniciales al iniciar la página
window.addEventListener("DOMContentLoaded", () => {
    switchLeaderboard("vibez_fly");

    // Vincular el evento click del botón de enviar comentarios si existe en el DOM
    const btnPublicar = document.getElementById("btn-publicar-sug");
    if (btnPublicar) {
        btnPublicar.addEventListener("click", enviarSugerencia);
    }
});

// EXPOSICIÓN GLOBAL PARA EL HTML (Obligatorio al trabajar con type="module")
window.switchLeaderboard = switchLeaderboard;
