import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, query, orderBy, limit, getDocs, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// CONFIGURACIÓN DE TU PROYECTO
const firebaseConfig = {
    apiKey: "AIzaSy...", 
    authDomain: "vibezmatch-91c6d.firebaseapp.com",
    projectId: "vibezmatch-91c6d",
    storageBucket: "vibezmatch-91c6d.appspot.com",
    messagingSenderId: "385...",
    appId: "1:385..."
};

// INICIALIZACIÓN
try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    console.log("Firebase conectado correctamente.");
    
    // Asignar db a window para usarla en funciones globales
    window.db = db;
} catch (e) {
    console.error("Error al conectar Firebase:", e);
}

// FUNCIÓN PARA CAMBIAR RÉCORDS
async function switchLeaderboard(gameId) {
    const rowsContainer = document.getElementById("leaderboard-rows");
    if (!rowsContainer) return;

    // Cambiar visual de botones
    const buttons = document.querySelectorAll("#apps-section + section button[id^='btn-']");
    buttons.forEach(btn => {
        btn.className = (btn.getAttribute("data-game") === gameId) 
            ? "px-4 py-2 text-sm font-bold rounded-xl transition-all duration-200 bg-pink-600 text-white shadow-md"
            : "px-4 py-2 text-sm font-bold rounded-xl transition-all duration-200 text-gray-700 hover:bg-white/40";
    });

    rowsContainer.innerHTML = `<div class="px-4 py-4 text-center">Cargando...</div>`;

    try {
        // Lógica de nombres de colección
        const nombreColeccion = (gameId === "dog_eater") ? "scores_arcade" : ("records_" + gameId);
        
        const q = query(collection(window.db, nombreColeccion), orderBy("score", "desc"), limit(10));
        const querySnapshot = await getDocs(q);

        rowsContainer.innerHTML = "";
        if (querySnapshot.empty) {
            rowsContainer.innerHTML = `<div class="px-4 py-4 text-center">No hay récords aún.</div>`;
            return;
        }

        querySnapshot.forEach((doc, index) => {
            const data = doc.data();
            const row = document.createElement("div");
            row.className = "grid grid-cols-3 px-4 py-3 border-b";
            row.innerHTML = `<div>${index + 1}°</div><div>${data.player || "Anónimo"}</div><div class="text-right font-bold">${data.score}</div>`;
            rowsContainer.appendChild(row);
        });
    } catch (error) {
        console.error("Error en Firebase:", error);
        rowsContainer.innerHTML = `<div class="px-4 py-4 text-center text-red-600">Error: ${error.message}</div>`;
    }
}

// FUNCIÓN PARA ENVIAR SUGERENCIAS
async function enviarSugerencia() {
    try {
        await addDoc(collection(window.db, "sugerencias"), {
            author: document.getElementById("sug-autor").value,
            message: document.getElementById("sug-mensaje").value,
            timestamp: serverTimestamp()
        });
        alert("¡Enviado!");
    } catch (error) {
        console.error(error);
    }
}

// EXPORTAR AL NAVEGADOR
window.switchLeaderboard = switchLeaderboard;
window.enviarSugerencia = enviarSugerencia;
