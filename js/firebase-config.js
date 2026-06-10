// ============================================================
//  UTSC Salud — Configuración de Firebase
//  Instrucciones:
//    1. Ve a tu consola de Firebase > Configuración del proyecto
//    2. En "Tus apps" copia el objeto firebaseConfig
//    3. Pega tus valores reales en los campos marcados con <TU_...>
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDGFZM-CtZLVefMFWXOx93QSKCMPklztHc",
  authDomain: "biblioteca-utsc.firebaseapp.com",
  projectId: "biblioteca-utsc",
  storageBucket: "biblioteca-utsc.firebasestorage.app",
  messagingSenderId: "567175600539",
  appId: "1:567175600539:web:945e36a5c079fcc066693e"
};

// Inicializar Firebase
const app      = initializeApp(firebaseConfig);
const auth     = getAuth(app);
const db       = getFirestore(app);
const provider = new GoogleAuthProvider();

export { app, auth, db, provider };
