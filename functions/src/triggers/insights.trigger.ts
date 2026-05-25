// functions/src/triggers/insights.trigger.ts
import {onCall, HttpsError} from "firebase-functions/v2/https";
import {onDocumentUpdated} from "firebase-functions/v2/firestore";
import {getFirestore, FieldValue} from "firebase-admin/firestore";
import {GoogleGenerativeAI} from "@google/generative-ai";

const db = getFirestore();
const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_API_KEY = process.env["GEMINI_API_KEY"] ?? "";
const REGISTROS_POR_INSIGHT = 3;

// ── Tipos ────────────────────────────────────────────────────────────────────
interface RegistroResumen {
  fecha?: string;
  categoria?: string;
  descripcion?: string;
  ia?: {
    summary?: string;
    symptoms?: string[];
    conditions?: string[];
    medications?: string[];
    emotions?: string[];
    sentiment?: string;
    severity?: string;
    followupMentions?: string[];
    administrativeIssues?: string[];
    tags?: string[];
  };
}

interface Insight {
  userId: string;
  generatedAt: FirebaseFirestore.FieldValue;
  model: string;
  totalRegistrosAnalizados: number;
  // Patrones clínicos
  condicionesRecurrentes: string[];
  sintomasRecurrentes: string[];
  medicamentosActuales: string[];
  signosVitalesEnRiesgo: string[];
  // Patrones experienciales
  emocionesPrevalentes: string[];
  sentimientoGeneral: "positivo" | "neutral" | "negativo";
  nivelFrustracion: "bajo" | "medio" | "alto";
  nivelAnsiedad: "bajo" | "medio" | "alto";
  // Seguimiento
  seguimientosPendientes: string[];
  brechasPreventivas: string[];
  // Sistema de salud
  problemasAdministrativos: string[];
  problemasOrientacion: string[];
  // Resumen
  resumenGeneral: string;
  recomendaciones: string[];
  alertas: string[];
}

// ── Trigger automático cada 5 registros ──────────────────────────────────────
export const onRegistroCompletado = onDocumentUpdated(
  {
    document: "registros/{registroId}",
    region: "us-central1",
  },
  async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();

    // Solo actuar cuando cambia a 'completed'
    if (before?.["aiEstado"] === after?.["aiEstado"]) return;
    if (after?.["aiEstado"] !== "completed") return;

    const userId = after?.["userId"] as string;
    if (!userId) return;

    // Contar registros completados del usuario
    const snapshot = await db
      .collection("registros")
      .where("userId", "==", userId)
      .where("aiEstado", "==", "completed")
      .get();

    const total = snapshot.size;
    console.log(
      `[insights.trigger] Usuario ${userId} tiene` +
      ` ${total} registros completados`
    );
    if (total % REGISTROS_POR_INSIGHT !== 0) return;

    console.log(
      `[insights.trigger] Disparando análisis longitudinal para ${userId}`
    );
    await generarInsight(
      userId,
      snapshot.docs.map((d) => d.data() as RegistroResumen)
    );
  }
);

// ── Callable manual desde la UI ───────────────────────────────────────────────
export const solicitarInsight = onCall(
  {region: "us-central1"},
  async (request) => {
    const userId = request.auth?.uid;
    if (!userId) {
      throw new HttpsError("unauthenticated", "Usuario no autenticado");
    }

    const snapshot = await db
      .collection("registros")
      .where("userId", "==", userId)
      .where("aiEstado", "==", "completed")
      .get();

    if (snapshot.empty) {
      throw new HttpsError("failed-precondition", "No hay registros procesados");
    }

    const registros = snapshot.docs.map((d) => d.data() as RegistroResumen);
    await generarInsight(userId, registros);

    return {success: true, totalAnalizados: registros.length};
  }
);

// ── Lógica compartida ─────────────────────────────────────────────────────────
/**
 * Genera un insight longitudinal para un usuario dado sus registros.
 * @param {string} userId - ID del usuario.
 * @param {RegistroResumen[]} registros - Registros a analizar.
 */
async function generarInsight(
  userId: string,
  registros: RegistroResumen[]
): Promise<void> {
  const resumenRegistros = registros.map((r) => ({
    fecha: r.fecha,
    categoria: r.categoria,
    descripcion: r.descripcion,
    summary: r.ia?.summary,
    symptoms: r.ia?.symptoms,
    conditions: r.ia?.conditions,
    medications: r.ia?.medications,
    emotions: r.ia?.emotions,
    sentiment: r.ia?.sentiment,
    severity: r.ia?.severity,
    followupMentions: r.ia?.followupMentions,
    administrativeIssues: r.ia?.administrativeIssues,
    tags: r.ia?.tags,
  }));

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel(
    {model: GEMINI_MODEL},
    {apiVersion: "v1beta"}
  );

  const prompt = `
Sos un asistente médico especializado en análisis longitudinal de historiales
clínicos y experienciales de pacientes. Analizá el siguiente conjunto de
registros de un mismo paciente y respondé ÚNICAMENTE con un JSON válido,
sin explicaciones ni markdown.

Registros del paciente (${registros.length} en total):
${JSON.stringify(resumenRegistros, null, 2)}

Respondé con este esquema exacto:
{
  "condicionesRecurrentes": [],
  "sintomasRecurrentes": [],
  "medicamentosActuales": [],
  "signosVitalesEnRiesgo": [],
  "emocionesPrevalentes": [],
  "sentimientoGeneral": "positivo|neutral|negativo",
  "nivelFrustracion": "bajo|medio|alto",
  "nivelAnsiedad": "bajo|medio|alto",
  "seguimientosPendientes": [],
  "brechasPreventivas": [],
  "problemasAdministrativos": [],
  "problemasOrientacion": [],
  "resumenGeneral": "",
  "recomendaciones": [],
  "alertas": []
}

Reglas:
- condicionesRecurrentes: condiciones que aparecen en múltiples registros
- sintomasRecurrentes: síntomas que se repiten a lo largo del tiempo
- medicamentosActuales: medicamentos mencionados recientemente
- signosVitalesEnRiesgo: signos vitales con valores preocupantes mencionados
- emocionesPrevalentes: emociones más frecuentes en el historial
- sentimientoGeneral: tono predominante del historial completo
- nivelFrustracion: nivel general de frustración detectado
- nivelAnsiedad: nivel general de ansiedad detectado
- seguimientosPendientes: controles o seguimientos mencionados sin confirmar
- brechasPreventivas: controles preventivos ausentes o atrasados inferibles
- problemasAdministrativos: problemas recurrentes con el sistema de salud
- problemasOrientacion: confusiones recurrentes sobre el sistema
- resumenGeneral: párrafo empático y claro del estado general del paciente
- recomendaciones: sugerencias concretas y accionables para el paciente
- alertas: situaciones que requieren atención inmediata o seguimiento urgente
- NUNCA inventes información que no esté en los registros
- Usá lenguaje claro, empático y comprensible para el paciente
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const clean = text.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(clean);

  const insight: Insight = {
    ...parsed,
    userId,
    generatedAt: FieldValue.serverTimestamp(),
    model: GEMINI_MODEL,
    totalRegistrosAnalizados: registros.length,
  };

  await db.collection("insights").doc(userId).set(insight, {merge: true});
  console.log(`[insights.trigger] ✅ Insight generado para ${userId}`);
}
