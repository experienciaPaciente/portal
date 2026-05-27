import {onDocumentCreated} from "firebase-functions/v2/firestore";
import {getFirestore, FieldValue} from "firebase-admin/firestore";
import {getApps, initializeApp} from "firebase-admin/app";

if (getApps().length === 0) {
  initializeApp();
}

const db = getFirestore();

// ── Tipos ───────────────────────────────────────────────────────────────────
interface RegistroData {
  aiProcesado?: boolean;
  aiEstado?: "pending" | "processing" | "completed" | "error";
  aiVersion?: string;
  [key: string]: unknown;
}

const COLLECTION = "registros";
const CURRENT_AI_VERSION = "v1";

export const onRegistroCreated = onDocumentCreated(
  {
    document: `${COLLECTION}/{registroId}`,
    region: "us-central1",
    timeoutSeconds: 60,
    memory: "256MiB",
    maxInstances: 3,
    concurrency: 5,
  },
  async (event) => {
    const snapshot = event.data;

    if (!snapshot) {
      console.warn("Evento disparado sin snapshot. Ignorando.");
      return;
    }

    const registroId = event.params.registroId;
    const data = snapshot.data() as RegistroData;

    console.log(`[registro.trigger] Nuevo registro detectado: ${registroId}`);

    if (data.aiEstado !== "pending") {
      console.log(
        `[registro.trigger] Registro ${registroId} tiene status="${data.aiEstado}". Saltando.`
      );
      return;
    }

    if (data.aiVersion !== CURRENT_AI_VERSION) {
      console.log(
        `[registro.trigger] Versión incompatible: ${data.aiVersion}. Saltando.`
      );
      return;
    }

    try {
      await db.collection(COLLECTION).doc(registroId).update({
        aiEstado: "processing",
        aiProcessedAt: FieldValue.serverTimestamp(),
      });

      console.log(`[registro.trigger] ${registroId} → processing`);
    } catch (error) {
      console.error("[registro.trigger] Error marcando como processing:", error);
      return;
    }

    try {
      await simulateProcesamiento(registroId);

      // ── Paso 3: Marcar como 'completed' ─────────────────────────────────
      await db.collection(COLLECTION).doc(registroId).update({
        aiProcesado: true,
        aiEstado: "completed",
        aiCompletedAt: FieldValue.serverTimestamp(),
      });

      console.log(`[registro.trigger] ✅ ${registroId} → completed`);
    } catch (processingError) {
      console.error(
        `[registro.trigger] ❌ Error procesando ${registroId}:`,
        processingError
      );

      await db.collection(COLLECTION).doc(registroId).update({
        aiProcesado: false,
        aiEstado: "error",
        aiErrorAt: FieldValue.serverTimestamp(),
        aiErrorMessage:
          processingError instanceof Error ?
            processingError.message :
            "Error desconocido",
      });
    }
  }
);

/** Simula un proceso asincrónico. Reemplazar con lógica real. */
/**
 * @param {string} id - ID del registro a procesar.
 */
async function simulateProcesamiento(id: string): Promise<void> {
  console.log(`[registro.trigger] Simulando procesamiento para ${id}...`);
  await new Promise((resolve) => setTimeout(resolve, 500));
  console.log("[registro.trigger] Procesamiento simulado completado.");
}
