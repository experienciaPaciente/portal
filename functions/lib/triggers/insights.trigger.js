"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.solicitarInsight = exports.onRegistroCompletado = void 0;
// functions/src/triggers/insights.trigger.ts
const https_1 = require("firebase-functions/v2/https");
const firestore_1 = require("firebase-functions/v2/firestore");
const firestore_2 = require("firebase-admin/firestore");
const generative_ai_1 = require("@google/generative-ai");
const db = (0, firestore_2.getFirestore)();
const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_API_KEY = (_a = process.env["GEMINI_API_KEY"]) !== null && _a !== void 0 ? _a : "";
const REGISTROS_POR_INSIGHT = 5;
// ── Trigger automático cada 5 registros ──────────────────────────────────────
exports.onRegistroCompletado = (0, firestore_1.onDocumentUpdated)({
    document: "registros/{registroId}",
    region: "us-central1",
}, async (event) => {
    var _a, _b;
    const before = (_a = event.data) === null || _a === void 0 ? void 0 : _a.before.data();
    const after = (_b = event.data) === null || _b === void 0 ? void 0 : _b.after.data();
    // Solo actuar cuando cambia a 'completed'
    if ((before === null || before === void 0 ? void 0 : before['aiEstado']) === (after === null || after === void 0 ? void 0 : after['aiEstado']))
        return;
    if ((after === null || after === void 0 ? void 0 : after['aiEstado']) !== "completed")
        return;
    const userId = after === null || after === void 0 ? void 0 : after['userId'];
    if (!userId)
        return;
    // Contar registros completados del usuario
    const snapshot = await db
        .collection("registros")
        .where("userId", "==", userId)
        .where("aiEstado", "==", "completed")
        .get();
    const total = snapshot.size;
    console.log(`[insights.trigger] Usuario ${userId} tiene ${total} registros completados`);
    if (total % REGISTROS_POR_INSIGHT !== 0)
        return;
    console.log(`[insights.trigger] Disparando análisis longitudinal para ${userId}`);
    await generarInsight(userId, snapshot.docs.map((d) => d.data()));
});
// ── Callable manual desde la UI ───────────────────────────────────────────────
exports.solicitarInsight = (0, https_1.onCall)({ region: "us-central1" }, async (request) => {
    var _a;
    const userId = (_a = request.auth) === null || _a === void 0 ? void 0 : _a.uid;
    if (!userId) {
        throw new https_1.HttpsError("unauthenticated", "Usuario no autenticado");
    }
    const snapshot = await db
        .collection("registros")
        .where("userId", "==", userId)
        .where("aiEstado", "==", "completed")
        .get();
    if (snapshot.empty) {
        throw new https_1.HttpsError("failed-precondition", "No hay registros procesados");
    }
    const registros = snapshot.docs.map((d) => d.data());
    await generarInsight(userId, registros);
    return { success: true, totalAnalizados: registros.length };
});
// ── Lógica compartida ─────────────────────────────────────────────────────────
async function generarInsight(userId, registros) {
    const resumenRegistros = registros.map((r) => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        return ({
            fecha: r.fecha,
            categoria: r.categoria,
            descripcion: r.descripcion,
            summary: (_a = r.ia) === null || _a === void 0 ? void 0 : _a.summary,
            symptoms: (_b = r.ia) === null || _b === void 0 ? void 0 : _b.symptoms,
            conditions: (_c = r.ia) === null || _c === void 0 ? void 0 : _c.conditions,
            medications: (_d = r.ia) === null || _d === void 0 ? void 0 : _d.medications,
            emotions: (_e = r.ia) === null || _e === void 0 ? void 0 : _e.emotions,
            sentiment: (_f = r.ia) === null || _f === void 0 ? void 0 : _f.sentiment,
            severity: (_g = r.ia) === null || _g === void 0 ? void 0 : _g.severity,
            followupMentions: (_h = r.ia) === null || _h === void 0 ? void 0 : _h.followupMentions,
            administrativeIssues: (_j = r.ia) === null || _j === void 0 ? void 0 : _j.administrativeIssues,
            tags: (_k = r.ia) === null || _k === void 0 ? void 0 : _k.tags,
        });
    });
    const genAI = new generative_ai_1.GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL }, { apiVersion: "v1beta" });
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
    const insight = Object.assign(Object.assign({}, parsed), { userId, generatedAt: firestore_2.FieldValue.serverTimestamp(), model: GEMINI_MODEL, totalRegistrosAnalizados: registros.length });
    await db.collection("insights").doc(userId).set(insight, { merge: true });
    console.log(`[insights.trigger] ✅ Insight generado para ${userId}`);
}
//# sourceMappingURL=insights.trigger.js.map