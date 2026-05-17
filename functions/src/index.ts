import {setGlobalOptions} from "firebase-functions";
import { getApps, initializeApp } from "firebase-admin/app";

if (getApps().length === 0) {
  initializeApp();
}

setGlobalOptions({ maxInstances: 10 });
export { onRegistroCreated } from "./triggers/registro.trigger";
export { onRegistroCompletado } from "./triggers/insights.trigger";