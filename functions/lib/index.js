"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onRegistroCompletado = exports.onRegistroCreated = void 0;
const firebase_functions_1 = require("firebase-functions");
const app_1 = require("firebase-admin/app");
if ((0, app_1.getApps)().length === 0) {
    (0, app_1.initializeApp)();
}
(0, firebase_functions_1.setGlobalOptions)({ maxInstances: 10 });
var registro_trigger_1 = require("./triggers/registro.trigger");
Object.defineProperty(exports, "onRegistroCreated", { enumerable: true, get: function () { return registro_trigger_1.onRegistroCreated; } });
var insights_trigger_1 = require("./triggers/insights.trigger");
Object.defineProperty(exports, "onRegistroCompletado", { enumerable: true, get: function () { return insights_trigger_1.onRegistroCompletado; } });
//# sourceMappingURL=index.js.map