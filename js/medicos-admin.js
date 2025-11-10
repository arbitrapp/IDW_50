// js/medicos-admin.js
import { 
  obtenerMedicos, 
  guardarMedicos, 
  obtenerMedicoPorId, 
  generarIdMedico, 
  obtenerObrasSociales, 
  obtenerObrasSocialesPorIds,
  obtenerEspecialidades,
  obtenerEspecialidadPorId
} from "./storage.js";
import { isAuthenticated, logout } from "./autenticationUtils.js";

// Variables globales
let medicos = [];
let obrasSociales = [];
let especialidades = [];
let medicoEditando = null;

// Inicializar la página
document.addEventListener("DOMContentLoaded", function () {
  // Verificar autenticación
  if (!isAuthenticated()) {
    window.location.href = "login.html";
    return;
  }

  cargarDatos();
  configurarEventListeners();
});

function cargarDatos() {
  medicos = obtenerMedicos();
  obrasSociales = obtenerObrasSociales();
  especialidades = obtenerEspecialidades();
  renderizarTablaMedicos();
  renderizarCheckboxesObrasSociales();
  renderizarSelectEspecialidades();
}

function configurarEventListeners() {
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
        <td colspan="8" class="text-center py-4">
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

      // Obtener nombre de la especialidad
      const especialidadObj = obtenerEspecialidadPorId(medico.especialidad);
      const nombreEspecialidad = especialidadObj ? especialidadObj.nombre : "Sin especialidad";

      return `
        <tr>
          <td class="align-middle">
            ${
              medico.imagen
                ? `<img src="${medico.imagen}" alt="${medico.nombre}" class="rounded" style="width: 60px; height: 60px; object-fit: cover;">`
                : `<div class="bg-secondary rounded d-flex align-items-center justify-content-center" style="width: 60px; height: 60px;">
                    <i class="bi bi-person text-light"></i>
                  </div>`
            }
          </td>
          <td class="align-middle">
            <strong class="d-block">${medico.nombre}</strong>
            <small class="text-muted">${nombreEspecialidad}</small>
            ${medico.descripcion ? `<small class="text-muted d-block mt-1" style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${medico.descripcion}</small>` : ''}
          </td>
          <td class="align-middle">
            <span class="badge bg-primary">${medico.matricula || 'N/A'}</span>
          </td>
          <td class="align-middle">
            ${nombreEspecialidad}
          </td>
          <td class="align-middle">
            <div class="d-flex flex-column gap-1">
              ${
                medico.email
                  ? `<div class="d-flex align-items-center">
                      <i class="bi bi-envelope text-primary me-2"></i>
                      <small>${medico.email}</small>
                    </div>`
                  : ""
              }
              ${
                medico.telefono
                  ? `<div class="d-flex align-items-center">
                      <i class="bi bi-telephone text-success me-2"></i>
                      <small>${medico.telefono}</small>
                    </div>`
                  : ""
              }
              ${
                medico.horarioAtencion
                  ? `<div class="d-flex align-items-center">
                      <i class="bi bi-clock text-warning me-2"></i>
                      <small>${medico.horarioAtencion}</small>
                    </div>`
                  : ""
              }
            </div>
          </td>
          <td class="align-middle">
            <small class="text-muted">${obrasSocialesNombres || "No asignadas"}</small>
          </td>
          <td class="align-middle">
            <strong>$${medico.precio || 0}</strong>
          </td>
          <td class="align-middle">
            <div class="btn-group btn-group-sm">
              <button class="btn btn-outline-primary" onclick="editarMedico(${medico.id})" title="Editar">
                <i class="bi bi-pencil"></i>
              </button>
              <button class="btn btn-outline-danger" onclick="eliminarMedico(${medico.id})" title="Eliminar">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");
}

function renderizarSelectEspecialidades() {
  const select = document.getElementById("especialidad");

  if (especialidades.length === 0) {
    select.innerHTML = '<option value="">No hay especialidades disponibles</option>';
    return;
  }

  select.innerHTML = `
    <option value="">Seleccione una especialidad</option>
    ${especialidades
      .map(
        (esp) => `
          <option value="${esp.id}">${esp.nombre}</option>
        `
      )
      .join("")}
  `;
}

function renderizarCheckboxesObrasSociales() {
  const container = document.getElementById("obras-sociales-checkboxes");

  if (obrasSociales.length === 0) {
    container.innerHTML = '<div class="text-muted text-center">No hay obras sociales registradas</div>';
    return;
  }

  container.innerHTML = obrasSociales
    .map(
      (os) => `
        <div class="form-check">
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
  document.getElementById("medicoId").value = "";

  // Limpiar checkboxes
  obrasSociales.forEach((os) => {
    const checkbox = document.getElementById(`os-${os.id}`);
    if (checkbox) checkbox.checked = false;
  });

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
  document.getElementById("matricula").value = medicoEditando.matricula || "";
  document.getElementById("nombre").value = medicoEditando.nombre || "";
  document.getElementById("especialidad").value = medicoEditando.especialidad || "";
  document.getElementById("precio").value = medicoEditando.precio || "";
  document.getElementById("imagen").value = medicoEditando.imagen || "";
  document.getElementById("email").value = medicoEditando.email || "";
  document.getElementById("telefono").value = medicoEditando.telefono || "";
  document.getElementById("horarioAtencion").value = medicoEditando.horarioAtencion || "";
  document.getElementById("descripcion").value = medicoEditando.descripcion || "";

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
  // Obtener valores del formulario
  const id = document.getElementById("medicoId").value;
  const matricula = parseInt(document.getElementById("matricula").value);
  const nombre = document.getElementById("nombre").value.trim();
  const especialidad = document.getElementById("especialidad").value;
  const precio = parseFloat(document.getElementById("precio").value);
  const imagen = document.getElementById("imagen").value.trim();
  const email = document.getElementById("email").value.trim();
  const telefono = document.getElementById("telefono").value.trim();
  const horarioAtencion = document.getElementById("horarioAtencion").value.trim();
  const descripcion = document.getElementById("descripcion").value.trim();

  // Validaciones básicas
  if (!matricula || isNaN(matricula) || matricula <= 0) {
    alert("La matrícula profesional es obligatoria y debe ser un número válido");
    return;
  }

  if (!nombre) {
    alert("El nombre es obligatorio");
    return;
  }

  if (!especialidad) {
    alert("La especialidad es obligatoria");
    return;
  }

  if (isNaN(precio) || precio < 0) {
    alert("El precio debe ser un número válido mayor o igual a 0");
    return;
  }

  if (!descripcion) {
    alert("La descripción profesional es obligatoria");
    return;
  }

  // Verificar si la matrícula ya existe (excepto para el médico que se está editando)
  const matriculaExistente = medicos.find(m => m.matricula === matricula && m.id !== parseInt(id));
  if (matriculaExistente) {
    alert(`La matrícula ${matricula} ya está asignada al médico: ${matriculaExistente.nombre}`);
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
      matricula,
      nombre,
      especialidad: parseInt(especialidad),
      precio,
      imagen: imagen || null,
      email: email || null,
      telefono: telefono || null,
      horarioAtencion: horarioAtencion || null,
      descripcion,
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
      matricula,
      nombre,
      especialidad: parseInt(especialidad),
      precio,
      imagen: imagen || null,
      email: email || null,
      telefono: telefono || null,
      horarioAtencion: horarioAtencion || null,
      descripcion,
      obrasSociales: obrasSocialesSeleccionadas,
    };

    medicos.push(medico);
  }

  // Guardar en localStorage
  guardarMedicos(medicos);

  // Cerrar modal y recargar tabla
  const modal = bootstrap.Modal.getInstance(document.getElementById("modalMedico"));
  modal.hide();

  cargarDatos();

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

  if (confirm(`¿Estás seguro de que quieres eliminar al médico "${medico.nombre}"?`)) {
    medicos = medicos.filter((m) => m.id !== id);
    guardarMedicos(medicos);
    cargarDatos();
    mostrarMensajeExito("Médico eliminado correctamente");
  }
}

function mostrarMensajeExito(mensaje) {
  const toastContainer = document.getElementById("toastContainer") || crearToastContainer();

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

// Hacer funciones globales para los onclick
window.abrirModalCrear = abrirModalCrear;
window.editarMedico = editarMedico;
window.eliminarMedico = eliminarMedico;
window.guardarMedico = guardarMedico;
window.logout = logout;