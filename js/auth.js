// js/auth.js
import { isAuthenticated, logout } from "./autenticationUtils.js";

// Claves para sessionStorage
const AUTH_KEYS = {
  ACCESS_TOKEN: "accessToken_galeno",
  USUARIO_ACTUAL: "usuario_actual_galeno"
};

// URL de la API DummyJSON
const API_URLS = {
  LOGIN: "https://dummyjson.com/auth/login",
  USUARIOS: "https://dummyjson.com/users"
};

// Inicializar y verificar autenticación
document.addEventListener("DOMContentLoaded", function () {
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

  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    try {
      const loginExitoso = await autenticarConDummyJSON(username, password);
      
      if (loginExitoso) {
        errorMessage.classList.add("d-none");
        mostrarMensajeExito();
      } else {
        throw new Error("Credenciales inválidas");
      }
    } catch (error) {
      console.error("Error en login:", error);
      errorMessage.textContent = "Usuario o contraseña incorrectos";
      errorMessage.classList.remove("d-none");
    }
  });
}

// Autenticar con DummyJSON API
async function autenticarConDummyJSON(username, password) {
  try {
    const response = await fetch(API_URLS.LOGIN, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: username,
        password: password
      })
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.accessToken) {
      // Guardar token y datos del usuario en sessionStorage
      sessionStorage.setItem(AUTH_KEYS.ACCESS_TOKEN, data.accessToken);
      
      const usuarioSesion = {
        id: data.id,
        username: data.username,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName
      };
      
      sessionStorage.setItem(AUTH_KEYS.USUARIO_ACTUAL, JSON.stringify(usuarioSesion));
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("Error en autenticación:", error);
    throw error;
  }
}

function mostrarMensajeExito() {
  const submitBtn = document.querySelector('#loginForm button[type="submit"]');
  const originalText = submitBtn.innerHTML;

  submitBtn.innerHTML = '<i class="bi bi-check-circle me-2"></i>Acceso concedido...';
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
  if (!isAuthenticated()) {
    window.location.href = "login.html";
    return;
  }

  // Mostrar información del usuario en el header si existe
  const usuarioActual = obtenerUsuarioActual();
  if (usuarioActual) {
    mostrarInfoUsuario(usuarioActual);
  }
}

function mostrarInfoUsuario(usuario) {
  const navbarNav = document.querySelector("header .navbar-nav");
  if (navbarNav && !navbarNav.querySelector(".nav-item.dropdown")) {
    const usuarioInfo = `
      <li class="nav-item dropdown">
        <a class="nav-link dropdown-toggle text-light" href="#" role="button" data-bs-toggle="dropdown">
          <i class="bi bi-person-circle me-1"></i>${usuario.username}
        </a>
        <ul class="dropdown-menu dropdown-menu-end">
          <li><span class="dropdown-item-text small">
            <i class="bi bi-person me-2"></i>${usuario.firstName} ${usuario.lastName}
          </span></li>
          <li><hr class="dropdown-divider"></li>
          <li><a class="dropdown-item" href="#" onclick="logout()">
            <i class="bi bi-box-arrow-right me-2"></i>Cerrar Sesión
          </a></li>
        </ul>
      </li>
    `;
    navbarNav.innerHTML += usuarioInfo;
  }
}

// Función para mostrar spinner de transición
function mostrarSpinnerTransicion(callback) {
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

  setTimeout(() => {
    overlay.style.opacity = "1";
    spinnerContainer.style.transform = "scale(1)";
  }, 10);

  setTimeout(() => {
    if (callback) callback();
  }, 500);
}

// Obtener usuario actual desde sessionStorage
function obtenerUsuarioActual() {
  const usuario = sessionStorage.getItem(AUTH_KEYS.USUARIO_ACTUAL);
  return usuario ? JSON.parse(usuario) : null;
}

// Hacer funciones globales
window.logout = logout;