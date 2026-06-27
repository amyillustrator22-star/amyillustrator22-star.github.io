// 1. Importaciones oficiales de Firebase SDK (versión modular)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, query, orderBy, limit, getDocs, addDoc, serverTimestamp, where } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 2. Configuración de Firebase para tu proyecto VibezMatch
const firebaseConfig = {
    apiKey: "AIzaSy...", 
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
export async function switchLeaderboard(gameId) {
    const rowsContainer = document.getElementById("leaderboard-rows");
    if (!rowsContainer) return;

    // 1. Cambiar el estilo visual de los botones
    const buttons = document.querySelectorAll("#board-title + div button");
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
        // Buscamos siempre en scores_arcade filtrando por el gameId
        const q = query(
            collection(db, "scores_arcade"), 
            where("game", "==", gameId), 
            orderBy("score", "desc"), 
            limit(10)
        );
        
        const querySnapshot = await getDocs(q);
        rowsContainer.innerHTML = ""; // Limpiar contenedor

        if (querySnapshot.empty) {
            rowsContainer.innerHTML = `<div class="px-4 py-4 text-center text-gray-500 w-full italic">¡Nadie ha registrado récords aún para el juego '${gameId}'! Sé el primero.</div>`;
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
        // MODO DIAGNÓSTICO EN CONSOLA (F12)
        console.error("%c--- ERROR CRÍTICO EN FIRESTORE ---", "color: white; background: red; font-weight: bold; padding: 4px;");
        console.error("Mensaje:", error.message);
        console.error("Código de error:", error.code);
        
        rowsContainer.innerHTML = `<div class="px-4 py-4 text-center text-red-600 w-full font-bold">Error al conectar con los récords mundiales.</div>`;
    }
}

/**
 * ==========================================
 * LÓGICA DE SUGERENCIAS Y ENVIOS (CON HONEYPOT)
 * ==========================================
 */
async function enviarSugerencia() {
    const honeypot = document.getElementById("sys_security_feedback_hp");
    if (honeypot && honeypot.value !== "") {
        console.warn("Intento de spam bloqueado por el Honeypot.");
        return; 
    }

    const autorInput = document.getElementById("sug-autor");
    const mensajeInput = document.getElementById("sug-mensaje");
    const emailInput = document.getElementById("sug-email") || document.getElementById("sug-correo");
    const msgExito = document.getElementById("msg-envio-exito");

    if (!autorInput || !mensajeInput) return;

    const autor = autorInput.value.trim();
    const mensaje = mensajeInput.value.trim();
    const email = emailInput ? emailInput.value.trim() : "";

    if (autor === "" || mensaje === "") {
        alert("Por favor, rellena tu nombre y el comentario.");
        return;
    }

    try {
        await addDoc(collection(db, "sugerencias"), {
            author: autor,
            message: mensaje,
            email: email, 
            approved: false, 
            timestamp: serverTimestamp()
        });

        autorInput.value = "";
        mensajeInput.value = "";
        if (emailInput) emailInput.value = "";
        
        if (msgExito) {
            msgExito.classList.remove("hidden");
            setTimeout(() => msgExito.classList.add("hidden"), 5000);
        } else {
            alert("¡Comentario enviado con éxito! Aparecerá cuando sea moderado.");
        }

    } catch (error) {
        console.error("Error al guardar la sugerencia en Firestore: ", error);
        alert("Error al enviar el comentario. Revisa los permisos.");
    }
}

// Cargar marcadores iniciales al iniciar la página
window.addEventListener("DOMContentLoaded", () => {
    switchLeaderboard("vibez_fly");

    const btnPublicar = document.getElementById("btn-publicar-sug");
    if (btnPublicar) {
        btnPublicar.addEventListener("click", enviarSugerencia);
    }
});

// EXPOSICIÓN GLOBAL PARA EL HTML
window.switchLeaderboard = switchLeaderboard;
