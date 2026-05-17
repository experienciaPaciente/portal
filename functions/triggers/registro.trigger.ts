import {onDocumentCreated} from "firebase-functions/v2/firestore";
import {getFirestore, FieldValue} from "firebase-admin/firestore";
import {getApps, initializeApp} from "firebase-admin/app";
import {GoogleGenerativeAI} from "@google/generative-ai";

if (getApps().length === 0) {
  initializeApp();
}

const db = getFirestore();

interface RegistroData {
  descripcion?: string;
  aiProcesado?: boolean;
  aiEstado?: "pending" | "processing" | "completed" | "error";
  aiVersion?: string;
  [key: string]: unknown;
}

interface IA {
  processedAt?: FirebaseFirestore.Timestamp;
  model?: string;
  confidence?: number;
  summary?: string;
  sentiment?: "positivo" | "neutral" | "negativo";
  symptoms?: string[];
  conditions?: string[];
  medications?: string[];
  medicationChange?: boolean;
  vitalSignsMentioned?: string[];
  emotions?: string[];
  anxietyDetected?: boolean;
  frustrationDetected?: boolean;
  administrativeIssues?: string[];
  orientationIssues?: string[];
  followupMentions?: string[];
  preventiveCareGaps?: string[];
  tags?: string[];
  effortRelated?: boolean;
  severity?: "leve" | "media" | "alta" | "desconocida";
}

const COLLECTION = "registros";
const CURRENT_AI_VERSION = "v1";
const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_API_KEY = process.env["GEMINI_API_KEY"] ?? "";

export const onRegistroCreated = onDocumentCreated(
  {
    document: `${COLLECTION}/{registroId}`,
    region: "us-central1",
    timeoutSeconds: 60,
    memory: "256MiB",
  },
  async (event) => {
    const snapshot = event.data;

    if (!snapshot) {
      console.warn("Evento disparado sin snapshot. Ignorando.");
      return;
    }

    const registroId = event.params.registroId;
    const data = snapshot.data() as RegistroData;

    console.log(`[registro.trigger] Nuevo registro: ${registroId}`);

    if (data.aiEstado !== "pending") {
      console.log(
        `[registro.trigger] ${registroId} status="${data.aiEstado}". Saltando.`
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
      const ia = await procesarConGemini(data.descripcion ?? "");

      await db.collection(COLLECTION).doc(registroId).update({
        aiProcesado: true,
        aiEstado: "completed",
        aiCompletedAt: FieldValue.serverTimestamp(),
        ia,
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

/**
 * Procesa la descripción clínica con Gemini.
 * @param {string} descripcion - Texto clínico libre del usuario.
 * @return {Promise<IA>} Datos estructurados extraídos por la IA.
 */
async function procesarConGemini(descripcion: string): Promise<IA> {
  if (!descripcion.trim()) {
    return emptyIA();
  }

  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY no configurada");
  }

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel(
    {model: GEMINI_MODEL},
    {apiVersion: "v1beta"}
  );

  const prompt = `
Sos un asistente médico especializado en interpretar registros clínicos y
experienciales escritos en lenguaje natural en español.

Analizá el siguiente texto y respondé ÚNICAMENTE con un JSON válido,
sin explicaciones ni markdown.

Texto del paciente:
"${descripcion}"

Respondé con este esquema exacto:
{
  "summary": "",
  "sentiment": "positivo|neutral|negativo",
  "confidence": 0.0,
  "symptoms": [],
  "conditions": [],
  "medications": [],
  "medicationChange": false,
  "vitalSignsMentioned": [],
  "emotions": [],
  "anxietyDetected": false,
  "frustrationDetected": false,
  "administrativeIssues": [],
  "orientationIssues": [],
  "followupMentions": [],
  "preventiveCareGaps": [],
  "tags": [],
  "effortRelated": false,
  "severity": "leve|media|alta|desconocida"
}

Reglas:
- summary: resumen clínico-experiencial en una oración clara y empática
- sentiment: tono general del relato
- confidence: número entre 0 y 1 indicando certeza de la extracción
- symptoms: síntomas mencionados o inferibles (minúsculas)
- conditions: diagnósticos o condiciones mencionadas o inferibles
- medications: medicamentos mencionados
- medicationChange: true si menciona cambio o ajuste de medicación
- vitalSignsMentioned: signos vitales mencionados (presión, glucosa, etc)
- emotions: emociones detectadas en el relato (minúsculas)
- anxietyDetected: true si se detecta ansiedad explícita o implícita
- frustrationDetected: true si se detecta frustración explícita o implícita
- administrativeIssues: problemas con turnos, esperas, burocracia
- orientationIssues: confusión sobre a quién consultar o qué hacer
- followupMentions: seguimientos o controles futuros mencionados
- preventiveCareGaps: controles preventivos ausentes o atrasados inferibles
- tags: palabras clave útiles para búsqueda semántica
- effortRelated: true si el evento está relacionado con esfuerzo físico
- severity: estimación subjetiva de gravedad basada en el contexto
- Usá [] para arrays vacíos y false para booleanos sin evidencia
- NUNCA inventes información que no esté en el texto o no sea inferible
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const clean = text.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(clean) as IA;

  parsed.model = GEMINI_MODEL;
  parsed.processedAt = FieldValue.serverTimestamp() as
    FirebaseFirestore.Timestamp;

  return parsed;
}

/**
 * Retorna una extracción vacía cuando no hay descripción.
 * @return {IA} Extracción vacía por defecto.
 */
function emptyIA(): IA {
  return {
    summary: "Sin descripción disponible",
    sentiment: "neutral",
    confidence: 0,
    symptoms: [],
    conditions: [],
    medications: [],
    medicationChange: false,
    vitalSignsMentioned: [],
    emotions: [],
    anxietyDetected: false,
    frustrationDetected: false,
    administrativeIssues: [],
    orientationIssues: [],
    followupMentions: [],
    preventiveCareGaps: [],
    tags: [],
    effortRelated: false,
    severity: "desconocida",
    model: GEMINI_MODEL,
  };
}