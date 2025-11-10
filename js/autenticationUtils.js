// js/autenticationUtils.js
const AUTH_KEYS = {
  ACCESS_TOKEN: "accessToken_galeno",
  USUARIO_ACTUAL: "usuario_actual_galeno"
};

// Verificar si el usuario está autenticado
export function isAuthenticated() {
  const token = sessionStorage.getItem(AUTH_KEYS.ACCESS_TOKEN);
  return !!token; // Devuelve true si existe token, false si no
}

// Cerrar sesión
export function logout() {
  sessionStorage.removeItem(AUTH_KEYS.ACCESS_TOKEN);
  sessionStorage.removeItem(AUTH_KEYS.USUARIO_ACTUAL);
  window.location.href = "index.html";
}

// Obtener usuario actual
export function obtenerUsuarioActual() {
  const usuario = sessionStorage.getItem(AUTH_KEYS.USUARIO_ACTUAL);
  return usuario ? JSON.parse(usuario) : null;
}

// Hacer funciones globales para HTML
window.logout = logout;