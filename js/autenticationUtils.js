const AUTH_KEYS = {
  USUARIO_ACTUAL: "usuario_actual_galeno",
  SESION_ACTIVA: "sesion_activa_galeno",
};

export function estaAutenticado() {
  const auth = sessionStorage.getItem(AUTH_KEYS.SESION_ACTIVA);
  if (!auth) {
    window.location.assign("../login.html");
    return true;
  }
  false;
}
