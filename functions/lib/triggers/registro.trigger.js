"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onRegistroCreated = void 0;
const firestore_1 = require("firebase-functions/v2/firestore");
const firestore_2 = require("firebase-admin/firestore");
const app_1 = require("firebase-admin/app");
if ((0, app_1.getApps)().length === 0) {
    (0, app_1.initializeApp)();
}
const db = (0, firestore_2.getFirestore)();
const COLLECTION = "registros";
const CURRENT_AI_VERSION = "v1";
exports.onRegistroCreated = (0, firestore_1.onDocumentCreated)({
    document: `${COLLECTION}/{registroId}`,
    region: "us-central1",
    timeoutSeconds: 60,
    memory: "256MiB",
}, async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
        console.warn("Evento disparado sin snapshot. Ignorando.");
        return;
    }
    const registroId = event.params.registroId;
    const data = snapshot.data();
    console.log(`[registro.trigger] Nuevo registro detectado: ${registroId}`);
    if (data.aiEstado !== "pending") {
        console.log(`[registro.trigger] Registro ${registroId} tiene status="${data.aiEstado}". Saltando.`);
        return;
    }
    if (data.aiVersion !== CURRENT_AI_VERSION) {
        console.log(`[registro.trigger] Versión incompatible: ${data.aiVersion}. Saltando.`);
        return;
    }
    try {
        await db.collection(COLLECTION).doc(registroId).update({
            aiEstado: "processing",
            aiProcessedAt: firestore_2.FieldValue.serverTimestamp(),
        });
        console.log(`[registro.trigger] ${registroId} → processing`);
    }
    catch (error) {
        console.error(`[registro.trigger] Error marcando como processing:`, error);
        return;
    }
    try {
        await simulateProcesamiento(registroId);
        // ── Paso 3: Marcar como 'completed' ─────────────────────────────────
        await db.collection(COLLECTION).doc(registroId).update({
            aiProcesado: true,
            aiEstado: "completed",
            aiCompletedAt: firestore_2.FieldValue.serverTimestamp(),
        });
        console.log(`[registro.trigger] ✅ ${registroId} → completed`);
    }
    catch (processingError) {
        console.error(`[registro.trigger] ❌ Error procesando ${registroId}:`, processingError);
        await db.collection(COLLECTION).doc(registroId).update({
            aiProcesado: false,
            aiEstado: "error",
            aiErrorAt: firestore_2.FieldValue.serverTimestamp(),
            aiErrorMessage: processingError instanceof Error
                ? processingError.message
                : "Error desconocido",
        });
    }
});
/** Simula un proceso asincrónico. Reemplazar con lógica real. */
async function simulateProcesamiento(id) {
    console.log(`[registro.trigger] Simulando procesamiento para ${id}...`);
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log(`[registro.trigger] Procesamiento simulado completado.`);
}
//# sourceMappingURL=registro.trigger.js.map