# UTSC Salud — Biblioteca Digital

Plataforma digital universitaria orientada a la consulta de material especializado en **Salud Integral** y **Educación Continua**, alineada con los Objetivos de Desarrollo Sostenible **ODS 3** (Salud y Bienestar) y **ODS 4** (Educación de Calidad).

## Estructura del proyecto

```
utsc-salud/
├── index.html          → Página principal (Hero + tarjetas ODS)
├── biblioteca.html     → Catálogo de libros (lee colección `libros` de Firestore)
├── contacto.html       → Formulario de contacto (escribe en `mensajes_contacto`)
├── css/
│   └── style.css       → Estilos globales (Mobile-First, Flexbox + Grid, sin frameworks)
├── js/
│   ├── firebase-config.js  → Inicialización de Firebase (Auth + Firestore)
│   └── main.js             → Lógica de Auth, lectura de libros, envío de mensajes
├── .gitignore
└── README.md
```

## Tecnologías

| Capa        | Tecnología                          |
|-------------|-------------------------------------|
| Markup      | HTML5 semántico                     |
| Estilos     | CSS puro (Flexbox + Grid, variables)|
| Lógica      | JavaScript Vanilla (ES Modules)     |
| Backend     | Firebase v10 (Auth + Firestore)     |
| Hosting     | Firebase Hosting                    |

## Configuración de Firebase

1. Abre `js/firebase-config.js`.
2. Reemplaza cada campo `<TU_...>` con los valores de tu proyecto Firebase.
3. En la consola de Firebase habilita:
   - **Authentication** → Proveedor Google.
   - **Firestore Database** → Crea las colecciones `libros` y `mensajes_contacto`.

## Colecciones de Firestore

### `libros`
| Campo      | Tipo   | Descripción                  |
|------------|--------|------------------------------|
| `Titulo`   | string | Título del libro             |
| `Autor`    | string | Nombre del autor             |
| `Editorial`| string | Nombre de la editorial       |
| `ISBN`     | string | Código ISBN                  |
| `Seccion`  | string | Sección temática             |
| `Resumen`  | string | Descripción breve del libro  |

### `mensajes_contacto`
| Campo     | Tipo      | Descripción                |
|-----------|-----------|----------------------------|
| `nombre`  | string    | Nombre del remitente       |
| `correo`  | string    | Correo del remitente       |
| `mensaje` | string    | Contenido del mensaje      |
| `fecha`   | timestamp | Fecha y hora del envío     |

## Despliegue en Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting   # directorio público: . (raíz)
firebase deploy
```

---

Proyecto desarrollado como evidencia de control de versiones para materia universitaria.
