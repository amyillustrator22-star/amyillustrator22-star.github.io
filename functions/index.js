/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {setGlobalOptions} = require("firebase-functions");
const {onRequest} = require("firebase-functions/https");
const logger = require("firebase-functions/logger");

// IMPORTACIONES PARA EL PROCESO DE BORRADO AUTOMÁTICO
const {onSchedule} = require("firebase-functions/v2/scheduler");
const {getFirestore} = require("firebase-admin/firestore");
const admin = require("firebase-admin");

// Inicializamos el SDK de Administración para poder alterar Firestore desde el servidor
admin.initializeApp();
const db = getFirestore();

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

// =========================================================================
// 🧹 TAREA PROGRAMADA: LIMPIAR MENSAJES DEL CHAT GENERAL CADA 48 HORAS
// =========================================================================
exports.limpiarChatGlobal = onSchedule("every 48 hours", async (event) => {
    const coleccionChat = db.collection("chat_global");
    
    // Calculamos la marca de tiempo límite (Hace 48 horas exactas desde este momento)
    const hace48Horas = new Date();
    hace48Horas.setHours(hace48Horas.getHours() - 48);

    try {
        // Hacemos una consulta para obtener solo los mensajes cuyo timestamp sea menor (más antiguo)
        const q = coleccionChat.where("timestamp", "<", hace48Horas);
        const snapshot = await q.get();

        if (snapshot.empty) {
            logger.info("Limpieza automática: No hay mensajes mayores a 48 horas para borrar.");
            return null;
        }

        // Usamos un lote (batch) de Firestore para procesar el borrado masivo de golpe de forma eficiente
        const batch = db.batch();
        snapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });

        await batch.commit();
        logger.info(`Limpieza automática completada con éxito: Se borraron ${snapshot.size} mensajes antiguos del chat global.`);
    } catch (error) {
        logger.error("Error crítico durante la limpieza automática del chat global:", error);
    }
    return null;
});
// =========================================================================
// 🔍 VERIFICAR SI UN EMAIL EXISTE EN FIREBASE AUTHENTICATION (Para la Web)
// =========================================================================
const { onRequest } = require("firebase-functions/v2/https");

exports.verificarUsuarioAuth = onRequest({ cors: true }, async (req, res) => {
    const email = req.query.email || (req.body && req.body.email);

    if (!email) {
        return res.status(400).send({ error: "Falta el campo email." });
    }

    try {
        // Buscamos el usuario directamente en Firebase Authentication usando el SDK de Admin
        const userRecord = await admin.auth().getUserByEmail(email.trim().toLowerCase());
        
        // Si lo encuentra, devolvemos que sí existe
        return res.status(200).send({ existe: true, uid: userRecord.uid });
    } catch (error) {
        if (error.code === "auth/user-not-found") {
            // Si Auth responde que no existe el usuario
            return res.status(200).send({ existe: false });
        }
        logger.error("Error al consultar Firebase Auth:", error);
        return res.status(500).send({ error: "Error interno del servidor." });
    }
});
