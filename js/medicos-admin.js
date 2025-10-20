import {
  obtenerMedicos,
  guardarMedicos,
  obtenerMedicoPorId,
  generarIdMedico,
  obtenerObrasSociales,
  obtenerObrasSocialesPorIds,
} from "./storage.js";
const AUTH_KEYS = {
  USUARIO_ACTUAL: "usuario_actual_galeno",
  SESION_ACTIVA: "sesion_activa_galeno",
};
// Aca chequeamos si esta activa la session, si no lo redirecciona al login
import { estaAutenticado } from "./autenticationUtils.js";

// Variables globales
let medicos = [];
let obrasSociales = [];
let medicoEditando = null;

// Inicializar la página
document.addEventListener("DOMContentLoaded", function () {
  if (estaAutenticado()) return;
  cargarDatos();
  configurarEventListeners();
});

function cargarDatos() {
  medicos = obtenerMedicos();
  obrasSociales = obtenerObrasSociales();
  renderizarTablaMedicos();
  renderizarCheckboxesObrasSociales();
}

function configurarEventListeners() {
  // Event listener para el formulario de médico
  const formMedico = document.getElementById("formMedico");
  if (formMedico) {
    formMedico.addEventListener("submit", function (e) {
      e.preventDefault();
      guardarMedico();
    });
  }
}

function renderizarTablaMedicos() {
  const tbody = document.getElementById("tabla-medicos-body");

  if (medicos.length === 0) {
    tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-4">
                    <div class="text-muted">
                        <i class="bi bi-person-x display-4 d-block mb-2"></i>
                        No hay médicos registrados
                        <br>
                        <small>Haz clic en "Nuevo Médico" para agregar el primero</small>
                    </div>
                </td>
            </tr>
        `;
    return;
  }

  tbody.innerHTML = medicos
    .map((medico) => {
      const obrasSocialesNombres = obtenerObrasSocialesPorIds(
        medico.obrasSociales || []
      )
        .map((os) => os.nombre)
        .join(", ");

      return `
            <tr>
                <td>
                    ${
                      medico.imagen
                        ? `<img src="${medico.imagen}" alt="${medico.nombre}" class="rounded" style="width: 60px; height: 60px; object-fit: cover;">`
                        : `<div class="bg-secondary rounded d-flex align-items-center justify-content-center" style="width: 60px; height: 60px;">
                            <i class="bi bi-person text-light"></i>
                        </div>`
                    }
                </td>
                <td>
                    <strong>${medico.nombre}</strong>
                    <br>
                    <small class="text-muted">${
                      medico.especialidad || "Sin especialidad"
                    }</small>
                </td>
                <td>${medico.especialidad || "No especificada"}</td>
                <td>
                    ${
                      medico.email
                        ? `<div><i class="bi bi-envelope me-1"></i>${medico.email}</div>`
                        : ""
                    }
                    ${
                      medico.telefono
                        ? `<div><i class="bi bi-telephone me-1"></i>${medico.telefono}</div>`
                        : ""
                    }
                    ${
                      medico.horarioAtencion
                        ? `<small class="text-muted">${medico.horarioAtencion}</small>`
                        : ""
                    }
                </td>
                <td>
                    <small>${obrasSocialesNombres || "No asignadas"}</small>
                </td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="editarMedico(${
                          medico.id
                        })" title="Editar">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="eliminarMedico(${
                          medico.id
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

function renderizarCheckboxesObrasSociales() {
  const container = document.getElementById("obras-sociales-checkboxes");

  if (obrasSociales.length === 0) {
    container.innerHTML =
      '<div class="text-muted text-center">No hay obras sociales registradas</div>';
    return;
  }

  container.innerHTML = obrasSociales
    .map(
      (os) => `
        <div class="form-check form-check-inline">
            <input class="form-check-input" type="checkbox" id="os-${os.id}" value="${os.id}">
            <label class="form-check-label" for="os-${os.id}">${os.nombre}</label>
        </div>
    `
    )
    .join("");
}

function abrirModalCrear() {
  medicoEditando = null;
  document.getElementById("modalTitulo").textContent = "Nuevo Médico";
  document.getElementById("formMedico").reset();

  // Limpiar checkboxes
  obrasSociales.forEach((os) => {
    const checkbox = document.getElementById(`os-${os.id}`);
    if (checkbox) checkbox.checked = false;
  });

  // Mostrar modal
  const modal = new bootstrap.Modal(document.getElementById("modalMedico"));
  modal.show();
}

function editarMedico(id) {
  medicoEditando = obtenerMedicoPorId(id);

  if (!medicoEditando) {
    alert("Error: Médico no encontrado");
    return;
  }

  document.getElementById("modalTitulo").textContent = "Editar Médico";
  document.getElementById("medicoId").value = medicoEditando.id;
  document.getElementById("nombre").value = medicoEditando.nombre || "";
  document.getElementById("especialidad").value =
    medicoEditando.especialidad || "";
  document.getElementById("imagen").value = medicoEditando.imagen || "";
  document.getElementById("email").value = medicoEditando.email || "";
  document.getElementById("telefono").value = medicoEditando.telefono || "";
  document.getElementById("horarioAtencion").value =
    medicoEditando.horarioAtencion || "";

  // Marcar checkboxes de obras sociales
  obrasSociales.forEach((os) => {
    const checkbox = document.getElementById(`os-${os.id}`);
    if (checkbox) {
      checkbox.checked = medicoEditando.obrasSociales
        ? medicoEditando.obrasSociales.includes(os.id)
        : false;
    }
  });

  const modal = new bootstrap.Modal(document.getElementById("modalMedico"));
  modal.show();
}

function guardarMedico() {
  console.log("Guardando médico...");

  // Obtener valores del formulario
  const id = document.getElementById("medicoId").value;
  const nombre = document.getElementById("nombre").value.trim();
  const especialidad = document.getElementById("especialidad").value.trim();
  const imagen = document.getElementById("imagen").value.trim();
  const email = document.getElementById("email").value.trim();
  const telefono = document.getElementById("telefono").value.trim();
  const horarioAtencion = document
    .getElementById("horarioAtencion")
    .value.trim();

  // Validaciones básicas
  if (!nombre) {
    alert("El nombre es obligatorio");
    return;
  }

  if (!especialidad) {
    alert("La especialidad es obligatoria");
    return;
  }

  // Obtener obras sociales seleccionadas
  const obrasSocialesSeleccionadas = obrasSociales
    .filter((os) => {
      const checkbox = document.getElementById(`os-${os.id}`);
      return checkbox ? checkbox.checked : false;
    })
    .map((os) => os.id);

  let medico;

  if (medicoEditando) {
    // Actualizar médico existente
    medico = {
      ...medicoEditando,
      nombre,
      especialidad,
      imagen: imagen || null,
      email: email || null,
      telefono: telefono || null,
      horarioAtencion: horarioAtencion || null,
      obrasSociales: obrasSocialesSeleccionadas,
    };

    // Reemplazar en el array
    const index = medicos.findIndex((m) => m.id === medicoEditando.id);
    if (index !== -1) {
      medicos[index] = medico;
    }
  } else {
    // Crear nuevo médico
    medico = {
      id: generarIdMedico(),
      nombre,
      especialidad,
      imagen: imagen || null,
      email: email || null,
      telefono: telefono || null,
      horarioAtencion: horarioAtencion || null,
      obrasSociales: obrasSocialesSeleccionadas,
    };

    medicos.push(medico);
  }

  // Guardar en localStorage
  guardarMedicos(medicos);

  // Cerrar modal y recargar tabla
  const modal = bootstrap.Modal.getInstance(
    document.getElementById("modalMedico")
  );
  modal.hide();

  cargarDatos(); // Recargar datos y tabla

  // Mostrar mensaje de éxito
  mostrarMensajeExito(
    medicoEditando
      ? "Médico actualizado correctamente"
      : "Médico creado correctamente"
  );
}

function eliminarMedico(id) {
  const medico = obtenerMedicoPorId(id);

  if (!medico) {
    alert("Error: Médico no encontrado");
    return;
  }

  if (
    confirm(
      `¿Estás seguro de que quieres eliminar al médico "${medico.nombre}"?`
    )
  ) {
    medicos = medicos.filter((m) => m.id !== id);
    guardarMedicos(medicos);
    cargarDatos();
    mostrarMensajeExito("Médico eliminado correctamente");
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
window.abrirModalCrear = abrirModalCrear;
window.editarMedico = editarMedico;
window.eliminarMedico = eliminarMedico;
window.guardarMedico = guardarMedico;
window.cerrarSesion = cerrarSesion;
