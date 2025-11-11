// js/reservas-admin.js
import {
    obtenerReservas,
    obtenerMedicoPorId,
    obtenerTurnoPorId,
    obtenerEspecialidadPorId,
    obtenerObraSocialPorId,
    obtenerNombreObraSocialPorId,
    obtenerNombreEspecialidadPorId,
    obtenerNombreCompletoMedico
} from "./storage.js";
import { isAuthenticated, logout } from "./autenticationUtils.js";

// Variables globales
let reservas = [];

// Inicializar la página
document.addEventListener("DOMContentLoaded", function () {
    if (!isAuthenticated()) {
        window.location.href = "login.html";
        return;
    }

    cargarDatos();
});

function cargarDatos() {
    reservas = obtenerReservas();
    renderizarTablaReservas();
}

function renderizarTablaReservas() {
    const tbody = document.getElementById("tabla-reservas-body");

    if (reservas.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center py-4">
                    <div class="text-muted">
                        <i class="bi bi-calendar-check display-4 d-block mb-2"></i>
                        No hay reservas registradas
                        <br>
                        <small>Las reservas aparecerán aquí cuando los pacientes reserven turnos</small>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = reservas
        .map((reserva) => {
            const medico = obtenerMedicoPorId(reserva.medicoId);
            const turno = obtenerTurnoPorId(reserva.turnoId);
            const especialidad = obtenerEspecialidadPorId(reserva.especialidadId);
            const obraSocial = reserva.obraSocialId ? obtenerObraSocialPorId(reserva.obraSocialId) : null;
            
            const fechaTurno = turno ? new Date(turno.fechaHora) : null;
            const fechaReserva = new Date(reserva.fechaReserva);

            return `
                <tr>
                    <td>
                        <strong>#${reserva.id}</strong>
                    </td>
                    <td>
                        <strong>${reserva.paciente.nombre}</strong><br>
                        <small class="text-muted">${reserva.paciente.documento}</small><br>
                        <small class="text-muted">${reserva.paciente.email}</small>
                    </td>
                    <td>
                        ${medico ? obtenerNombreCompletoMedico(medico) : 'Médico no encontrado'}
                    </td>
                    <td>
                        ${especialidad ? especialidad.nombre : 'Especialidad no especificada'}
                    </td>
                    <td>
                        ${fechaTurno ? fechaTurno.toLocaleDateString('es-AR') : 'N/A'}<br>
                        <small class="text-muted">${fechaTurno ? fechaTurno.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) : ''}</small>
                    </td>
                    <td>
                        <span class="badge ${obraSocial ? 'bg-info' : 'bg-secondary'}">
                            ${obraSocial ? obraSocial.nombre : 'Particular'}
                        </span>
                        ${reserva.porcentajeDescuento > 0 ? 
                            `<br><small class="text-success">${reserva.porcentajeDescuento}% desc.</small>` : ''
                        }
                    </td>
                    <td>
                        <span class="text-decoration-line-through text-muted">$${reserva.valorConsultaOriginal}</span><br>
                        <strong class="text-success">$${reserva.valorFinal.toFixed(2)}</strong>
                    </td>
                    <td>
                        <span class="badge bg-success">${reserva.estado}</span><br>
                        <small class="text-muted">${fechaReserva.toLocaleDateString('es-AR')}</small>
                    </td>
                    <td>
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-primary" onclick="verDetalleReserva(${reserva.id})" title="Ver detalle">
                                <i class="bi bi-eye"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        })
        .join("");
}

function verDetalleReserva(id) {
    const reserva = reservas.find(r => r.id === id);
    
    if (!reserva) {
        alert("Error: Reserva no encontrada");
        return;
    }

    const medico = obtenerMedicoPorId(reserva.medicoId);
    const turno = obtenerTurnoPorId(reserva.turnoId);
    const especialidad = obtenerEspecialidadPorId(reserva.especialidadId);
    const obraSocial = reserva.obraSocialId ? obtenerObraSocialPorId(reserva.obraSocialId) : null;
    
    const fechaTurno = turno ? new Date(turno.fechaHora) : null;
    const fechaReserva = new Date(reserva.fechaReserva);

    const detalleHTML = `
        <div class="row">
            <div class="col-md-6">
                <h6 class="text-primary">Información del Paciente</h6>
                <p><strong>Nombre:</strong> ${reserva.paciente.nombre}</p>
                <p><strong>Documento:</strong> ${reserva.paciente.documento}</p>
                <p><strong>Email:</strong> ${reserva.paciente.email}</p>
                <p><strong>Teléfono:</strong> ${reserva.paciente.telefono}</p>
                <p><strong>Fecha Nacimiento:</strong> ${reserva.paciente.fechaNacimiento || 'No especificada'}</p>
                <p><strong>Género:</strong> ${reserva.paciente.genero || 'No especificado'}</p>
                ${reserva.paciente.direccion ? `<p><strong>Dirección:</strong> ${reserva.paciente.direccion}</p>` : ''}
            </div>
            <div class="col-md-6">
                <h6 class="text-primary">Información del Turno</h6>
                <p><strong>Médico:</strong> ${medico ? obtenerNombreCompletoMedico(medico) : 'No encontrado'}</p>
                <p><strong>Especialidad:</strong> ${especialidad ? especialidad.nombre : 'No especificada'}</p>
                <p><strong>Fecha:</strong> ${fechaTurno ? fechaTurno.toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}</p>
                <p><strong>Hora:</strong> ${fechaTurno ? fechaTurno.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</p>
            </div>
        </div>
        <hr>
        <div class="row">
            <div class="col-md-6">
                <h6 class="text-primary">Datos de Salud</h6>
                <p><strong>Obra Social:</strong> ${obraSocial ? obraSocial.nombre : 'Particular'}</p>
                ${reserva.paciente.numeroAfiliado ? `<p><strong>Número de Afiliado:</strong> ${reserva.paciente.numeroAfiliado}</p>` : ''}
                ${reserva.paciente.motivoConsulta ? `<p><strong>Motivo de Consulta:</strong> ${reserva.paciente.motivoConsulta}</p>` : ''}
            </div>
            <div class="col-md-6">
                <h6 class="text-primary">Información de Pago</h6>
                <p><strong>Descuento aplicado:</strong> ${reserva.porcentajeDescuento}%</p>
                <p><strong>Valor original:</strong> $${reserva.valorConsultaOriginal}</p>
                <p><strong>Valor final:</strong> <span class="fs-5 fw-bold text-success">$${reserva.valorFinal.toFixed(2)}</span></p>
            </div>
        </div>
        <hr>
        <div class="row">
            <div class="col-12">
                <h6 class="text-primary">Información de la Reserva</h6>
                <p><strong>ID de reserva:</strong> #${reserva.id}</p>
                <p><strong>Estado:</strong> <span class="badge bg-success">${reserva.estado}</span></p>
                <p><strong>Fecha de reserva:</strong> ${fechaReserva.toLocaleDateString('es-AR')} ${fechaReserva.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
        </div>
    `;

    document.getElementById("detalle-reserva-content").innerHTML = detalleHTML;
    
    const modal = new bootstrap.Modal(document.getElementById("modalDetalleReserva"));
    modal.show();
}

function exportarReservas() {
    if (reservas.length === 0) {
        alert("No hay reservas para exportar");
        return;
    }

    let csvContent = "ID;Paciente;Documento;Email;Teléfono;Fecha Nacimiento;Género;Dirección;Médico;Especialidad;Fecha Turno;Hora Turno;Obra Social;Número Afiliado;Motivo Consulta;Descuento %;Valor Original;Valor Final;Estado;Fecha Reserva\n";
    
    reservas.forEach(reserva => {
        const medico = obtenerMedicoPorId(reserva.medicoId);
        const turno = obtenerTurnoPorId(reserva.turnoId);
        const especialidad = obtenerEspecialidadPorId(reserva.especialidadId);
        const obraSocial = reserva.obraSocialId ? obtenerObraSocialPorId(reserva.obraSocialId) : null;
        
        const fechaTurno = turno ? new Date(turno.fechaHora) : null;
        const fechaReserva = new Date(reserva.fechaReserva);

        const row = [
            reserva.id,
            `"${reserva.paciente.nombre}"`,
            `"${reserva.paciente.documento}"`,
            `"${reserva.paciente.email}"`,
            `"${reserva.paciente.telefono}"`,
            `"${reserva.paciente.fechaNacimiento || 'N/A'}"`,
            `"${reserva.paciente.genero || 'N/A'}"`,
            `"${reserva.paciente.direccion || 'N/A'}"`,
            `"${medico ? obtenerNombreCompletoMedico(medico) : 'No encontrado'}"`,
            `"${especialidad ? especialidad.nombre : 'No especificada'}"`,
            fechaTurno ? fechaTurno.toLocaleDateString('es-AR') : 'N/A',
            fechaTurno ? fechaTurno.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) : 'N/A',
            obraSocial ? `"${obraSocial.nombre}"` : 'Particular',
            `"${reserva.paciente.numeroAfiliado || 'N/A'}"`,
            `"${reserva.paciente.motivoConsulta || 'N/A'}"`,
            reserva.porcentajeDescuento,
            reserva.valorConsultaOriginal,
            reserva.valorFinal.toFixed(2),
            reserva.estado,
            fechaReserva.toLocaleDateString('es-AR')
        ].join(';');

        csvContent += row + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `reservas_galeno_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Hacer funciones globales para los onclick
window.verDetalleReserva = verDetalleReserva;
window.exportarReservas = exportarReservas;
window.logout = logout;