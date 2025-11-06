// js/especialidades-admin.js
import {
    obtenerEspecialidades,
    guardarEspecialidades,
    obtenerEspecialidadPorId,
    generarIdEspecialidad,
    obtenerMedicos
} from "./storage.js";
import { isAuthenticated, logout } from "./autenticationUtils.js";

// Variables globales
let especialidades = [];
let especialidadEditando = null;

// Inicializar la página
document.addEventListener("DOMContentLoaded", function () {
    if (!isAuthenticated()) {
        window.location.href = "login.html";
        return;
    }

    cargarDatos();
    configurarEventListeners();
});

function cargarDatos() {
    especialidades = obtenerEspecialidades();
    renderizarTablaEspecialidades();
}

function configurarEventListeners() {
    const formEspecialidad = document.getElementById("formEspecialidad");
    if (formEspecialidad) {
        formEspecialidad.addEventListener("submit", function (e) {
            e.preventDefault();
            guardarEspecialidad();
        });
    }
}

function renderizarTablaEspecialidades() {
    const tbody = document.getElementById("tabla-especialidades-body");

    if (especialidades.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="3" class="text-center py-4">
                    <div class="text-muted">
                        <i class="bi bi-briefcase display-4 d-block mb-2"></i>
                        No hay especialidades registradas
                        <br>
                        <small>Haz clic en "Nueva Especialidad" para agregar la primera</small>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = especialidades
        .map((especialidad) => {
            // Contar médicos por especialidad
            const medicos = obtenerMedicos();
            const cantidadMedicos = medicos.filter(medico => medico.especialidad === especialidad.id).length;

            return `
                <tr>
                    <td>
                        <strong>#${especialidad.id}</strong>
                    </td>
                    <td>
                        <strong>${especialidad.nombre}</strong>
                        <br>
                        <small class="text-muted">
                            <i class="bi bi-person me-1"></i>${cantidadMedicos} médico${cantidadMedicos !== 1 ? 's' : ''}
                        </small>
                    </td>
                    <td>
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-primary" onclick="editarEspecialidad(${especialidad.id})" title="Editar">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn btn-outline-danger" onclick="eliminarEspecialidad(${especialidad.id})" title="Eliminar">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        })
        .join("");
}

function abrirModalCrearEspecialidad() {
    especialidadEditando = null;
    document.getElementById("modalEspecialidadTitulo").textContent = "Nueva Especialidad";
    document.getElementById("formEspecialidad").reset();
    document.getElementById("especialidadId").value = "";

    const modal = new bootstrap.Modal(document.getElementById("modalEspecialidad"));
    modal.show();
}

function editarEspecialidad(id) {
    especialidadEditando = obtenerEspecialidadPorId(id);

    if (!especialidadEditando) {
        alert("Error: Especialidad no encontrada");
        return;
    }

    document.getElementById("modalEspecialidadTitulo").textContent = "Editar Especialidad";
    document.getElementById("especialidadId").value = especialidadEditando.id;
    document.getElementById("nombreEspecialidad").value = especialidadEditando.nombre || "";

    const modal = new bootstrap.Modal(document.getElementById("modalEspecialidad"));
    modal.show();
}

function guardarEspecialidad() {
    const id = document.getElementById("especialidadId").value;
    const nombre = document.getElementById("nombreEspecialidad").value.trim();

    if (!nombre) {
        alert("El nombre es obligatorio");
        return;
    }

    // Verificar si ya existe una especialidad con el mismo nombre (excluyendo la actual si está editando)
    const especialidadExistente = especialidades.find(esp => 
        esp.nombre.toLowerCase() === nombre.toLowerCase() && 
        (!especialidadEditando || esp.id !== especialidadEditando.id)
    );

    if (especialidadExistente) {
        alert("Ya existe una especialidad con ese nombre");
        return;
    }

    let especialidad;

    if (especialidadEditando) {
        especialidad = {
            ...especialidadEditando,
            nombre: nombre
        };

        const index = especialidades.findIndex((esp) => esp.id === especialidadEditando.id);
        if (index !== -1) {
            especialidades[index] = especialidad;
        }
    } else {
        especialidad = {
            id: generarIdEspecialidad(),
            nombre: nombre
        };

        especialidades.push(especialidad);
    }

    guardarEspecialidades(especialidades);

    const modal = bootstrap.Modal.getInstance(document.getElementById("modalEspecialidad"));
    modal.hide();

    cargarDatos();

    mostrarMensajeExito(
        especialidadEditando
            ? "Especialidad actualizada correctamente"
            : "Especialidad creada correctamente"
    );
}

function eliminarEspecialidad(id) {
    const especialidad = obtenerEspecialidadPorId(id);

    if (!especialidad) {
        alert("Error: Especialidad no encontrada");
        return;
    }

    // Verificar si hay médicos asociados a esta especialidad
    const medicos = obtenerMedicos();
    const medicosConEspecialidad = medicos.filter(medico => medico.especialidad === id);

    if (medicosConEspecialidad.length > 0) {
        alert(`No se puede eliminar la especialidad "${especialidad.nombre}" porque tiene ${medicosConEspecialidad.length} médico${medicosConEspecialidad.length !== 1 ? 's' : ''} asociado${medicosConEspecialidad.length !== 1 ? 's' : ''}. Primero debe reasignar los médicos a otra especialidad.`);
        return;
    }

    if (confirm(`¿Estás seguro de que quieres eliminar la especialidad "${especialidad.nombre}"?`)) {
        especialidades = especialidades.filter((esp) => esp.id !== id);
        guardarEspecialidades(especialidades);
        cargarDatos();
        mostrarMensajeExito("Especialidad eliminada correctamente");
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
window.abrirModalCrearEspecialidad = abrirModalCrearEspecialidad;
window.editarEspecialidad = editarEspecialidad;
window.eliminarEspecialidad = eliminarEspecialidad;
window.guardarEspecialidad = guardarEspecialidad;
window.logout = logout;