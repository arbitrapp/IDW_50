import { inicializarStorage, obtenerUsuarios } from "./storage.js";

// Claves para sessionStorage (más seguro que localStorage para login)
const AUTH_KEYS = {
  USUARIO_ACTUAL: "usuario_actual_galeno",
  SESION_ACTIVA: "sesion_activa_galeno",
};

// Inicializar y verificar autenticación
document.addEventListener("DOMContentLoaded", async function () {
  await inicializarStorage();
  estaAutenticado();

  // Si estamos en página de login, configurar el formulario
  if (document.getElementById("loginForm")) {
    configurarLogin();
  }

  // Si estamos en páginas admin, verificar autenticación
  if (window.location.pathname.includes("admin-")) {
    verificarAutenticacion();
  }
});

function configurarLogin() {
  const loginForm = document.getElementById("loginForm");
  const errorMessage = document.getElementById("errorMessage");

  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    if (autenticarUsuario(username, password)) {
      // Login exitoso
      errorMessage.classList.add("d-none");
      mostrarMensajeExito();
    } else {
      // Mostrar error
      errorMessage.classList.remove("d-none");
    }
  });
}

function autenticarUsuario(username, password) {
  const usuarios = obtenerUsuarios();
  const usuario = usuarios.find(
    (u) =>
      u.username === username && u.password === password && u.activo === true
  );

  if (usuario) {
    // Guardar sesión (sin contraseña por seguridad)
    const usuarioSesion = {
      id: usuario.id,
      username: usuario.username,
      email: usuario.email,
      rol: usuario.rol,
    };

    sessionStorage.setItem(
      AUTH_KEYS.USUARIO_ACTUAL,
      JSON.stringify(usuarioSesion)
    );
    sessionStorage.setItem(AUTH_KEYS.SESION_ACTIVA, "true");
    return true;
  }

  return false;
}

function mostrarMensajeExito() {
  const submitBtn = document.querySelector('#loginForm button[type="submit"]');
  const originalText = submitBtn.innerHTML;

  submitBtn.innerHTML =
    '<i class="bi bi-check-circle me-2"></i>Acceso concedido...';
  submitBtn.disabled = true;
  submitBtn.classList.remove("btn-primary");
  submitBtn.classList.add("btn-success");

  setTimeout(() => {
    mostrarSpinnerTransicion(() => {
      window.location.href = "admin-medicos.html";
    });
  }, 800);
}

function verificarAutenticacion() {
  const sesionActiva = sessionStorage.getItem(AUTH_KEYS.SESION_ACTIVA);
  const usuarioActual = sessionStorage.getItem(AUTH_KEYS.USUARIO_ACTUAL);

  if (!sesionActiva || !usuarioActual) {
    // No autenticado - redirigir al login
    window.location.href = "login.html";
    return;
  }

  // Mostrar información del usuario en el header
  mostrarInfoUsuario(JSON.parse(usuarioActual));
}

function mostrarInfoUsuario(usuario) {
  const navbarNav = document.querySelector("header .navbar-nav");
  if (navbarNav) {
    const usuarioInfo = `
            <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle text-light" href="#" role="button" data-bs-toggle="dropdown">
                    <i class="bi bi-person-circle me-1"></i>${usuario.username}
                </a>
                <ul class="dropdown-menu dropdown-menu-end">
                    <li><span class="dropdown-item-text small"><i class="bi bi-person me-2"></i>${usuario.rol}</span></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item" href="#" onclick="cerrarSesion()"><i class="bi bi-box-arrow-right me-2"></i>Cerrar Sesión</a></li>
                </ul>
            </li>
        `;
    navbarNav.innerHTML += usuarioInfo;
  }
}

export function cerrarSesion() {
  sessionStorage.removeItem(AUTH_KEYS.USUARIO_ACTUAL);
  sessionStorage.removeItem(AUTH_KEYS.SESION_ACTIVA);
  mostrarSpinnerTransicion(() => {
    window.location.href = "login.html";
  });
}

// Función para mostrar spinner de transición
function mostrarSpinnerTransicion(callback) {
  // Crear overlay con spinner
  const overlay = document.createElement("div");
  overlay.id = "transitionOverlay";
  overlay.innerHTML = `
    <div class="spinner-container">
      <div class="spinner-border text-light" role="status" style="width: 3rem; height: 3rem;">
        <span class="visually-hidden">Cargando...</span>
      </div>
      <p class="text-light mt-3 mb-0">Cargando...</p>
    </div>
  `;

  // Agregar estilos inline
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(5px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    opacity: 0;
    transition: opacity 0.3s ease-in-out;
  `;

  const spinnerContainer = overlay.querySelector(".spinner-container");
  spinnerContainer.style.cssText = `
    text-align: center;
    transform: scale(0.8);
    transition: transform 0.3s ease-in-out;
  `;

  document.body.appendChild(overlay);

  // Animar entrada
  setTimeout(() => {
    overlay.style.opacity = "1";
    spinnerContainer.style.transform = "scale(1)";
  }, 10);

  // Ejecutar callback después de la animación
  setTimeout(() => {
    if (callback) callback();
  }, 500);
}

// // Hacer función global para el onclick
// no funciona ya que le btn logout esta en otras paginas
// window.cerrarSesion = cerrarSesion;

// Verificar si el usuario está autenticado
export function estaAutenticado() {
  const auth = sessionStorage.getItem(AUTH_KEYS.SESION_ACTIVA);
  if (auth) {
    mostrarSpinnerTransicion(() => {
      window.location.assign("../admin-medicos.html");
    });
  }
}

// Obtener usuario actual
export function obtenerUsuarioActual() {
  const usuario = sessionStorage.getItem(AUTH_KEYS.USUARIO_ACTUAL);
  return usuario ? JSON.parse(usuario) : null;
}
