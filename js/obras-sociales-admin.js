import {
  obtenerObrasSociales,
  guardarObrasSociales,
  obtenerObraSocialPorId,
  generarIdObraSocial,
} from "./storage.js";

const AUTH_KEYS = {
  USUARIO_ACTUAL: "usuario_actual_galeno",
  SESION_ACTIVA: "sesion_activa_galeno",
};
import { estaAutenticado } from "./autenticationUtils.js";

// Variables globales
let obrasSociales = [];
let obraSocialEditando = null;

// Inicializar la página
document.addEventListener("DOMContentLoaded", function () {
  if (estaAutenticado()) return;

  cargarDatos();
  configurarEventListeners();
});

function cargarDatos() {
  obrasSociales = obtenerObrasSociales();
  renderizarTablaObrasSociales();
}

function configurarEventListeners() {
  // Event listener para el formulario de obra social
  const formObraSocial = document.getElementById("formObraSocial");
  if (formObraSocial) {
    formObraSocial.addEventListener("submit", function (e) {
      e.preventDefault();
      guardarObraSocial();
    });
  }
}

function renderizarTablaObrasSociales() {
  const tbody = document.getElementById("tabla-os-body");

  if (obrasSociales.length === 0) {
    tbody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center py-4">
                    <div class="text-muted">
                        <i class="bi bi-building display-4 d-block mb-2"></i>
                        No hay obras sociales registradas
                        <br>
                        <small>Haz clic en "Nueva Obra Social" para agregar la primera</small>
                    </div>
                </td>
            </tr>
        `;
    return;
  }

  tbody.innerHTML = obrasSociales
    .map((os) => {
      return `
            <tr>
                <td>
                    ${
                      os.logo
                        ? `<img src="${os.logo}" alt="${os.nombre}" class="os-logo" style="width: 60px; height: 60px; object-fit: contain;">`
                        : `<div class="bg-light rounded d-flex align-items-center justify-content-center border" style="width: 60px; height: 60px;">
                            <i class="bi bi-building text-muted"></i>
                        </div>`
                    }
                </td>
                <td>
                    <strong>${os.nombre}</strong>
                </td>
                <td>
                    <span class="badge ${
                      os.activo ? "bg-success" : "bg-secondary"
                    }">
                        ${os.activo ? "Activa" : "Inactiva"}
                    </span>
                </td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="editarObraSocial(${
                          os.id
                        })" title="Editar">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="eliminarObraSocial(${
                          os.id
                        })" title="Eliminar">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    })
    .join("");
}

function abrirModalCrearOS() {
  obraSocialEditando = null;
  document.getElementById("modalOSTitulo").textContent = "Nueva Obra Social";
  document.getElementById("formObraSocial").reset();
  document.getElementById("activoOS").checked = true;

  const modal = new bootstrap.Modal(document.getElementById("modalObraSocial"));
  modal.show();
}

function editarObraSocial(id) {
  obraSocialEditando = obtenerObraSocialPorId(id);

  if (!obraSocialEditando) {
    alert("Error: Obra social no encontrada");
    return;
  }

  document.getElementById("modalOSTitulo").textContent = "Editar Obra Social";
  document.getElementById("obraSocialId").value = obraSocialEditando.id;
  document.getElementById("nombreOS").value = obraSocialEditando.nombre || "";
  document.getElementById("logoOS").value = obraSocialEditando.logo || "";
  document.getElementById("activoOS").checked =
    obraSocialEditando.activo !== false;

  const modal = new bootstrap.Modal(document.getElementById("modalObraSocial"));
  modal.show();
}

function guardarObraSocial() {
  // Obtener valores del formulario
  const id = document.getElementById("obraSocialId").value;
  const nombre = document.getElementById("nombreOS").value.trim();
  const logo = document.getElementById("logoOS").value.trim();
  const activo = document.getElementById("activoOS").checked;

  // Validaciones básicas
  if (!nombre) {
    alert("El nombre es obligatorio");
    return;
  }

  let obraSocial;

  if (obraSocialEditando) {
    // Actualizar obra social existente
    obraSocial = {
      ...obraSocialEditando,
      nombre,
      logo: logo || null,
      activo,
    };

    // Reemplazar en el array
    const index = obrasSociales.findIndex(
      (os) => os.id === obraSocialEditando.id
    );
    if (index !== -1) {
      obrasSociales[index] = obraSocial;
    }
  } else {
    // Crear nueva obra social
    obraSocial = {
      id: generarIdObraSocial(),
      nombre,
      logo: logo || null,
      activo,
    };

    obrasSociales.push(obraSocial);
  }

  // Guardar en localStorage
  guardarObrasSociales(obrasSociales);

  // Cerrar modal y recargar tabla
  const modal = bootstrap.Modal.getInstance(
    document.getElementById("modalObraSocial")
  );
  modal.hide();

  cargarDatos(); // Recargar datos y tabla

  // Mostrar mensaje de éxito
  mostrarMensajeExito(
    obraSocialEditando
      ? "Obra social actualizada correctamente"
      : "Obra social creada correctamente"
  );
}

function eliminarObraSocial(id) {
  const obraSocial = obtenerObraSocialPorId(id);

  if (!obraSocial) {
    alert("Error: Obra social no encontrada");
    return;
  }

  if (
    confirm(
      `¿Estás seguro de que quieres eliminar la obra social "${obraSocial.nombre}"?`
    )
  ) {
    obrasSociales = obrasSociales.filter((os) => os.id !== id);
    guardarObrasSociales(obrasSociales);
    cargarDatos();
    mostrarMensajeExito("Obra social eliminada correctamente");
  }
}

function mostrarMensajeExito(mensaje) {
  // Crear toast de Bootstrap para mostrar mensaje
  const toastContainer =
    document.getElementById("toastContainer") || crearToastContainer();

  const toastEl = document.createElement("div");
  toastEl.className = "toast align-items-center text-white bg-success border-0";
  toastEl.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                <i class="bi bi-check-circle me-2"></i>${mensaje}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;

  toastContainer.appendChild(toastEl);
  const toast = new bootstrap.Toast(toastEl);
  toast.show();

  // Remover el toast después de que se oculte
  toastEl.addEventListener("hidden.bs.toast", () => {
    toastEl.remove();
  });
}

function crearToastContainer() {
  const container = document.createElement("div");
  container.id = "toastContainer";
  container.className = "toast-container position-fixed top-0 end-0 p-3";
  document.body.appendChild(container);
  return container;
}

function cerrarSesion() {
  sessionStorage.removeItem(AUTH_KEYS.USUARIO_ACTUAL);
  sessionStorage.removeItem(AUTH_KEYS.SESION_ACTIVA);
  window.location.href = "login.html";
}

// Hacer funciones globales para los onclick
window.abrirModalCrearOS = abrirModalCrearOS;
window.editarObraSocial = editarObraSocial;
window.eliminarObraSocial = eliminarObraSocial;
window.guardarObraSocial = guardarObraSocial;
window.cerrarSesion = cerrarSesion;
