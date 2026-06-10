// ============================================================
//  UTSC Salud — main.js
//  Auth (navbar), lectura de 'libros' + búsqueda, escritura 'mensajes_contacto'
// ============================================================

import { auth, db, provider } from "./firebase-config.js";

import {
  onAuthStateChanged,
  signInWithPopup,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ═══════════════════════════════════════════════════════════
//  NAVBAR — AUTH STATE
// ═══════════════════════════════════════════════════════════
const btnLogin   = document.getElementById("btn-login");
const btnLogout  = document.getElementById("btn-logout");
const btnRegister = document.getElementById("btn-register");
const userEmail  = document.getElementById("user-email");

onAuthStateChanged(auth, (user) => {
  const enBiblioteca = window.location.pathname.endsWith("biblioteca.html");

  // CAMBIO CLAVE: Exigir que el usuario esté verificado
  if (user && user.emailVerified) {
    // Con sesión y verificado
    btnLogin?.classList.add("hidden");
    btnRegister?.classList.add("hidden");
    btnLogout?.classList.remove("hidden");
    if (userEmail) {
      userEmail.textContent = user.displayName || user.email || "Usuario";
      userEmail.classList.remove("hidden");
    }
  } else {
    // Si hay un usuario pero no está verificado, destruimos la sesión por seguridad
    if (user && !user.emailVerified) {
      signOut(auth).catch(err => console.error("Error al forzar cierre de sesión:", err));
    }

    // Sin sesión o sin verificar
    if (enBiblioteca) {
      window.location.href = "login.html";
      return;
    }
    
    btnLogin?.classList.remove("hidden");
    btnRegister?.classList.remove("hidden");
    btnLogout?.classList.add("hidden");
    if (userEmail) {
      userEmail.textContent = "Sesión de invitado";
      userEmail.classList.remove("hidden");
    }
  }
});


// Botón iniciar sesión → ir a login.html
btnLogin?.addEventListener("click", () => {
  window.location.href = "login.html";
});

// Cerrar sesión
btnLogout?.addEventListener("click", async () => {
  try { await signOut(auth); } catch (e) { console.error(e); }
});

// ═══════════════════════════════════════════════════════════
//  HAMBURGER
// ═══════════════════════════════════════════════════════════
const hamburger = document.getElementById("hamburger");
const navMenu   = document.getElementById("nav-menu");
hamburger?.addEventListener("click", () => {
  navMenu.classList.toggle("open");
  hamburger.setAttribute("aria-expanded", navMenu.classList.contains("open"));
});

// ═══════════════════════════════════════════════════════════
//  BIBLIOTECA — datos fallback + lectura Firestore
// ═══════════════════════════════════════════════════════════
const librosFallback = [
  {
    Titulo: "Fundamentos de Salud Pública",
    Imagen: "img/libro1.jpg",
    Autor: "Carlos Menéndez",
    Editorial: "McGraw-Hill",
    ISBN: "978-607-15-1234-5",
    Seccion: "Salud Comunitaria",
    Resumen: "Texto introductorio sobre principios y estrategias de salud pública moderna, con enfoque en prevención y promoción de la salud en comunidades vulnerables."
  },
  {
    Titulo: "Educación para la Vida",
    Imagen: "img/libro2.jpg",
    Autor: "Ana Sofía Ramos",
    Editorial: "Santillana",
    ISBN: "978-607-02-9876-1",
    Seccion: "Pedagogía",
    Resumen: "Guía práctica para docentes y estudiantes sobre metodologías de aprendizaje activo orientadas al desarrollo de competencias socioemocionales y académicas."
  },
  {
    Titulo: "Nutrición y Bienestar Integral",
    Imagen: "img/libro3.jpg",
    Autor: "Dr. Roberto Leal",
    Editorial: "Trillas",
    ISBN: "978-968-24-8321-0",
    Seccion: "Nutrición",
    Resumen: "Análisis científico del impacto de la alimentación en la salud física y mental, con recomendaciones basadas en evidencia para distintos grupos de edad."
  },
  {
    Titulo: "Salud Mental en el Aula",
    Imagen: "img/libro4.jpg",
    Autor: "Dra. Mariana Ortega",
    Editorial: "UNAM",
    ISBN: "978-607-30-1120-4",
    Seccion: "Salud Mental",
    Resumen: "Estrategias y herramientas para identificar y atender necesidades emocionales de estudiantes en ambientes educativos."
  },
  {
    Titulo: "Medicina Preventiva Comunitaria",
    Imagen: "img/libro5.jpg",
    Autor: "Dr. Ernesto Vásquez",
    Editorial: "El Manual Moderno",
    ISBN: "978-607-448-742-3",
    Seccion: "Medicina Preventiva",
    Resumen: "Compendio sobre intervenciones preventivas en salud comunitaria."
  }
];

// Cache de todos los libros cargados
let todosLosLibros = [];

function crearTarjeta(libro) {
  const card = document.createElement("article");
  card.className = "book-card";
  card.innerHTML = `
    <div class="book-card__header">
      <span class="book-card__seccion">${libro.Seccion || "General"}</span>
      <h3 class="book-card__titulo">${libro.Titulo || "Sin título"}</h3>
      <p class="book-card__autor">por <strong>${libro.Autor || "Desconocido"}</strong></p>
    </div>
    <div class="book-card__body">
      <p class="book-card__resumen">${libro.Resumen || ""}</p>
    </div>
    <div class="book-card__footer">
      <span class="book-card__meta"><span class="label">Editorial:</span> ${libro.Editorial || "—"}</span>
      <span class="book-card__meta"><span class="label">ISBN:</span> ${libro.ISBN || "—"}</span>
    </div>
  `;
  return card;
}

function renderLibros(lista) {
  const grid      = document.getElementById("libros-grid");
  const countEl   = document.getElementById("libros-count");
  const noResults = document.getElementById("no-results");
  if (!grid) return;

  grid.innerHTML = "";

  if (lista.length === 0) {
    noResults?.classList.remove("hidden");
    if (countEl) countEl.classList.add("hidden");
    return;
  }

  noResults?.classList.add("hidden");
  lista.forEach(l => grid.appendChild(crearTarjeta(l)));

  if (countEl) {
    countEl.innerHTML = `Mostrando <strong>${lista.length}</strong> ${lista.length === 1 ? "libro" : "libros"}`;
    countEl.classList.remove("hidden");
  }
}

function filtrarLibros() {
  const texto   = (document.getElementById("buscador")?.value || "").toLowerCase().trim();
  const seccion = (document.getElementById("filtro-seccion")?.value || "").toLowerCase();

  const filtrados = todosLosLibros.filter(libro => {
    const coincideTexto = !texto ||
      (libro.Titulo   || "").toLowerCase().includes(texto) ||
      (libro.Autor    || "").toLowerCase().includes(texto) ||
      (libro.Resumen  || "").toLowerCase().includes(texto) ||
      (libro.ISBN     || "").toLowerCase().includes(texto);

    const coincideSeccion = !seccion ||
      (libro.Seccion || "").toLowerCase() === seccion;

    return coincideTexto && coincideSeccion;
  });

  renderLibros(filtrados);
}

async function cargarLibros() {
  const spinner  = document.getElementById("libros-spinner");
  const errorMsg = document.getElementById("libros-error");
  if (!document.getElementById("libros-grid")) return; // No estamos en biblioteca

  try {
    spinner?.classList.remove("hidden");
    const snap = await getDocs(collection(db, "libros"));
    spinner?.classList.add("hidden");

    if (snap.empty) {
      todosLosLibros = librosFallback;
    } else {
      todosLosLibros = snap.docs.map(d => d.data());
    }
  } catch (err) {
    console.warn("Firestore no disponible, usando datos de prueba.", err);
    spinner?.classList.add("hidden");
    if (errorMsg) {
      errorMsg.textContent = "Mostrando datos de demostración (sin conexión a la base de datos).";
      errorMsg.classList.remove("hidden");
    }
    todosLosLibros = librosFallback;
  }

  renderLibros(todosLosLibros);

  // Escuchar buscador + filtro
  document.getElementById("buscador")?.addEventListener("input", filtrarLibros);
  document.getElementById("filtro-seccion")?.addEventListener("change", filtrarLibros);
}

// ═══════════════════════════════════════════════════════════
//  CONTACTO — escritura en `mensajes_contacto`
// ═══════════════════════════════════════════════════════════
async function enviarMensaje(e) {
  e.preventDefault();
  const feedback  = document.getElementById("form-feedback");
  const submitBtn = document.getElementById("submit-btn");
  const nombre    = document.getElementById("nombre")?.value.trim();
  const correo    = document.getElementById("correo")?.value.trim();
  const asunto    = document.getElementById("asunto")?.value.trim() || "Sin asunto";
  const mensaje   = document.getElementById("mensaje")?.value.trim();

  if (!nombre || !correo || !mensaje) {
    mostrarFeedback(feedback, "Por favor completa todos los campos.", "error");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Enviando…";
  try {
    await addDoc(collection(db, "mensajes_contacto"), {
      nombre, correo, asunto, mensaje, fecha: serverTimestamp()
    });
    mostrarFeedback(feedback, "Mensaje enviado correctamente. ¡Gracias!", "success");
    e.target.reset();
  } catch (err) {
    console.error(err);
    mostrarFeedback(feedback, "Error al enviar. Intenta de nuevo.", "error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Enviar Mensaje";
  }
}

function mostrarFeedback(el, texto, tipo) {
  if (!el) return;
  el.textContent = texto;
  el.className = `form-feedback form-feedback--${tipo}`;
  el.classList.remove("hidden");
  setTimeout(() => el.classList.add("hidden"), 6000);
}

// ═══════════════════════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════════════════════
document.addEventListener("DOMContentLoaded", () => {
  cargarLibros();
  document.getElementById("contact-form")?.addEventListener("submit", enviarMensaje);
});
