// js/turnos-admin.js
import {
    obtenerTurnos,
    guardarTurnos,
    obtenerTurnoPorId,
    generarIdTurno,
    obtenerMedicos,
    obtenerMedicoPorId,
    obtenerEspecialidadPorId,
    obtenerNombreCompletoMedico
} from "./storage.js";
import { isAuthenticated, logout } from "./autenticationUtils.js";

// Variables globales
let turnos = [];
let turnoEditando = null;
let medicos = [];

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
    turnos = obtenerTurnos();
    medicos = obtenerMedicos();
    renderizarTablaTurnos();
    cargarSelectMedicos();
}

function configurarEventListeners() {
    const formTurno = document.getElementById("formTurno");
    if (formTurno) {
        formTurno.addEventListener("submit", function (e) {
            e.preventDefault();
            guardarTurno();
        });
    }
}

function cargarSelectMedicos() {
    const select = document.getElementById("medicoTurno");
    select.innerHTML = '<option value="">Seleccione un médico</option>';
    
    medicos.forEach(medico => {
        const option = document.createElement("option");
        option.value = medico.id;
        option.textContent = obtenerNombreCompletoMedico(medico);
        select.appendChild(option);
    });
}

function renderizarTablaTurnos() {
    const tbody = document.getElementById("tabla-turnos-body");

    if (turnos.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-4">
                    <div class="text-muted">
                        <i class="bi bi-calendar-x display-4 d-block mb-2"></i>
                        No hay turnos registrados
                        <br>
                        <small>Haz clic en "Nuevo Turno" para agregar el primero</small>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = turnos
        .map((turno) => {
            const medico = obtenerMedicoPorId(turno.medicoId);
            const especialidad = medico ? obtenerEspecialidadPorId(medico.especialidad) : null;
            const fechaHora = new Date(turno.fechaHora);
            const fecha = fechaHora.toLocaleDateString('es-AR');
            const hora = fechaHora.toLocaleTimeString('es-AR', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });

            return `
                <tr>
                    <td>
                        <strong>${medico ? obtenerNombreCompletoMedico(medico) : 'Médico no encontrado'}</strong>
                    </td>
                    <td>
                        <strong>${fecha}</strong><br>
                        <small class="text-muted">${hora}</small>
                    </td>
                    <td>
                        ${especialidad ? especialidad.nombre : 'Especialidad no especificada'}
                    </td>
                    <td>
                        <span class="badge ${turno.disponible ? "bg-success" : "bg-secondary"}">
                            ${turno.disponible ? "Disponible" : "Ocupado"}
                        </span>
                    </td>
                    <td>
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-primary" onclick="editarTurno(${turno.id})" title="Editar">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn btn-outline-danger" onclick="eliminarTurno(${turno.id})" title="Eliminar">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        })
        .join("");
}

function abrirModalCrearTurno() {
    turnoEditando = null;
    document.getElementById("modalTurnoTitulo").textContent = "Nuevo Turno";
    document.getElementById("formTurno").reset();
    document.getElementById("turnoId").value = "";
    document.getElementById("disponibleTurno").checked = true;
    
    // Establecer fecha mínima como hoy
    const hoy = new Date().toISOString().split('T')[0];
    document.getElementById("fechaTurno").min = hoy;

    const modal = new bootstrap.Modal(document.getElementById("modalTurno"));
    modal.show();
}

function editarTurno(id) {
    turnoEditando = obtenerTurnoPorId(id);

    if (!turnoEditando) {
        alert("Error: Turno no encontrado");
        return;
    }

    document.getElementById("modalTurnoTitulo").textContent = "Editar Turno";
    document.getElementById("turnoId").value = turnoEditando.id;
    document.getElementById("medicoTurno").value = turnoEditando.medicoId;
    
    const fechaHora = new Date(turnoEditando.fechaHora);
    document.getElementById("fechaTurno").value = fechaHora.toISOString().split('T')[0];
    document.getElementById("horaTurno").value = fechaHora.toTimeString().slice(0, 5);
    
    document.getElementById("disponibleTurno").checked = turnoEditando.disponible !== false;

    const modal = new bootstrap.Modal(document.getElementById("modalTurno"));
    modal.show();
}

function guardarTurno() {
    const id = document.getElementById("turnoId").value;
    const medicoId = document.getElementById("medicoTurno").value;
    const fecha = document.getElementById("fechaTurno").value;
    const hora = document.getElementById("horaTurno").value;
    const disponible = document.getElementById("disponibleTurno").checked;

    if (!medicoId || !fecha || !hora) {
        alert("Todos los campos son obligatorios");
        return;
    }

    // Validar que la fecha no sea en el pasado
    const fechaHoraSeleccionada = new Date(`${fecha}T${hora}`);
    const ahora = new Date();
    if (fechaHoraSeleccionada < ahora) {
        alert("No se pueden crear turnos en fechas pasadas");
        return;
    }

    let turno;

    if (turnoEditando) {
        turno = {
            ...turnoEditando,
            medicoId: parseInt(medicoId),
            fechaHora: fechaHoraSeleccionada.toISOString(),
            disponible: disponible
        };

        const index = turnos.findIndex((t) => t.id === turnoEditando.id);
        if (index !== -1) {
            turnos[index] = turno;
        }
    } else {
        turno = {
            id: generarIdTurno(),
            medicoId: parseInt(medicoId),
            fechaHora: fechaHoraSeleccionada.toISOString(),
            disponible: disponible
        };

        turnos.push(turno);
    }

    guardarTurnos(turnos);

    const modal = bootstrap.Modal.getInstance(document.getElementById("modalTurno"));
    modal.hide();

    cargarDatos();

    mostrarMensajeExito(
        turnoEditando
            ? "Turno actualizado correctamente"
            : "Turno creado correctamente"
    );
}

function eliminarTurno(id) {
    const turno = obtenerTurnoPorId(id);

    if (!turno) {
        alert("Error: Turno no encontrado");
        return;
    }

    const medico = obtenerMedicoPorId(turno.medicoId);
    const fechaHora = new Date(turno.fechaHora);
    const fecha = fechaHora.toLocaleDateString('es-AR');
    const hora = fechaHora.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

    if (confirm(`¿Estás seguro de que quieres eliminar el turno de ${medico ? obtenerNombreCompletoMedico(medico) : 'médico desconocido'} del ${fecha} a las ${hora}?`)) {
        turnos = turnos.filter((t) => t.id !== id);
        guardarTurnos(turnos);
        cargarDatos();
        mostrarMensajeExito("Turno eliminado correctamente");
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
window.abrirModalCrearTurno = abrirModalCrearTurno;
window.editarTurno = editarTurno;
window.eliminarTurno = eliminarTurno;
window.guardarTurno = guardarTurno;
window.logout = logout;