// ============================================================
//  UTSC Salud — auth.js  (login.html + registro.html)
// ============================================================
import { auth, provider, db } from "./firebase-config.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const ALLOWED_DOMAIN = "@virtual.utsc.edu.mx";

// Si ya hay sesión verificada, redirigir
onAuthStateChanged(auth, (user) => {
  if (user && user.emailVerified) window.location.href = "index.html";
});

function showFeedback(tipo, msg) {
  const el = document.getElementById("auth-feedback");
  if (!el) return;
  el.innerHTML = msg;
  el.className = `auth-feedback auth-feedback--${tipo}`;
  el.classList.remove("hidden");
}
function setLoading(btn, on, label) {
  btn.disabled = on;
  btn.textContent = on ? "Cargando…" : label;
}

const errMsgs = {
  "auth/user-not-found":       "No existe una cuenta con ese correo.",
  "auth/wrong-password":       "Contraseña incorrecta. Inténtalo de nuevo.",
  "auth/invalid-email":        "El correo ingresado no es válido.",
  "auth/too-many-requests":    "Demasiados intentos. Espera un momento.",
  "auth/invalid-credential":   "Credenciales inválidas. Verifica tu correo y contraseña.",
  "auth/email-already-in-use": "Ya existe una cuenta con ese correo.",
  "auth/weak-password":        "La contraseña es muy débil. Usa mínimo 6 caracteres."
};

// ── LOGIN ─────────────────────────────────────────────────
const loginForm = document.getElementById("login-form");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value.trim();
    const pass  = document.getElementById("login-password").value;
    const btn   = document.getElementById("login-btn");
    if (!email || !pass) { showFeedback("error", "Completa todos los campos."); return; }

    if (!email.endsWith(ALLOWED_DOMAIN)) {
      showFeedback("error", `Solo se permiten correos institucionales ${ALLOWED_DOMAIN}.`);
      return;
    }

    setLoading(btn, true, "Ingresar");
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      if (!cred.user.emailVerified) {
        await signOut(auth);
        showFeedback("error", "Debes verificar tu correo antes de iniciar sesión. Revisa tu bandeja de entrada.");
        setLoading(btn, false, "Ingresar");
        return;
      }
      // Verificado → onAuthStateChanged redirige
    } catch (err) {
      showFeedback("error", errMsgs[err.code] || "Error al iniciar sesión.");
      setLoading(btn, false, "Ingresar");
    }
  });
}

// ── REGISTRO ──────────────────────────────────────────────
const regForm = document.getElementById("registro-form");
if (regForm) {
  regForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email   = document.getElementById("reg-email").value.trim();
    const pass    = document.getElementById("reg-password").value;
    const confirm = document.getElementById("reg-confirm").value;
    const terms   = document.getElementById("terms-check");
    const btn     = document.getElementById("registro-btn");

    if (!email || !pass || !confirm) { showFeedback("error", "Completa todos los campos."); return; }

    if (!email.endsWith(ALLOWED_DOMAIN)) {
      showFeedback("error", `Solo se permiten correos institucionales ${ALLOWED_DOMAIN}.`);
      return;
    }

    if (pass.length < 6)         { showFeedback("error", "Mínimo 6 caracteres.");          return; }
    if (pass !== confirm)        { showFeedback("error", "Las contraseñas no coinciden."); return; }
    if (terms && !terms.checked) { showFeedback("error", "Debes aceptar los Términos y Condiciones."); return; }

    setLoading(btn, true, "Registrarse");
    try {
      // 1. Crear cuenta en Firebase Auth (inicia sesión automáticamente)
      const cred = await createUserWithEmailAndPassword(auth, email, pass);

      // 2. Intentar enviar correo de verificación de Firebase y SIEMPRE cerrar sesión después
      try {
        await sendEmailVerification(cred.user);
      } finally {
        await signOut(auth);
      }

      // 3. Guardar en Firestore 
      try {
        await addDoc(collection(db, "usuarios_registrados"), {
          email,
          terminosAceptados: true,
          fechaRegistro: serverTimestamp(),
          verificado: false
        });
      } catch (fsErr) {
        console.warn("Firestore no pudo guardar el registro:", fsErr.message);
      }

      // 4. Enviar el Aviso de Privacidad con EmailJS
      try {
        // REEMPLAZA ESTOS DOS VALORES CON TUS IDs DE EMAILJS
        await emailjs.send("service_wcog39j", "template_povklna", {
          user_email: email 
        });
        console.log("Aviso de privacidad enviado correctamente con EmailJS.");
      } catch (emailErr) {
        console.error("Error enviando el aviso de privacidad con EmailJS:", emailErr);
      }

      // 5. Mensaje de éxito en pantalla
      showFeedback("success", `
        \u2705 <strong>Cuenta creada exitosamente.</strong><br><br>
        Se envi\u00f3 un correo de verificaci\u00f3n a <strong>${email}</strong>.<br>
        Tambi\u00e9n te hemos enviado nuestro Aviso de Privacidad.<br><br>
        <small style="opacity:.8">\u00bfNo ves el correo? Revisa tu carpeta de spam.</small>
      `);

      regForm.reset();
      btn.textContent = "Registrarse";
      btn.disabled = false;

    } catch (err) {
      console.error("Error en registro:", err.code, err.message);
      showFeedback("error", errMsgs[err.code] || "Error al registrarse. (" + err.code + ")");
      setLoading(btn, false, "Registrarse");
    }
  });
}