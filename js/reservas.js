// js/reservas.js
import {
    obtenerMedicos,
    obtenerObrasSocialesActivas,
    obtenerTurnosDisponiblesPorMedico,
    obtenerMedicoPorId,
    obtenerTurnoPorId,
    obtenerObraSocialPorId,
    calcularValorFinal,
    generarIdReserva,
    guardarReservas,
    obtenerReservas,
    obtenerEspecialidadPorId,
    obtenerObrasSocialesPorIds,
    guardarTurnos,
    obtenerTurnos,
    inicializarStorage,
    obtenerNombreCompletoMedico
} from './storage.js';

// Variables globales
let medicoSeleccionado = null;
let turnoSeleccionado = null;
let obrasSociales = [];

// Inicializar la página
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🔄 Inicializando página de reservas...');
    
    try {
        await inicializarStorage();
        console.log('✅ Storage inicializado correctamente');
        cargarMedicos();
        cargarObrasSociales();
        configurarEventListeners();
        cargarMedicoDesdeURL();
    } catch (error) {
        console.error('❌ Error inicializando:', error);
    }
});

function cargarMedicoDesdeURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const medicoId = urlParams.get('medico');
    
    if (medicoId) {
        console.log(`🔗 Cargando médico desde URL: ${medicoId}`);
        seleccionarMedico(parseInt(medicoId));
    }
}

function cargarMedicos() {
    const medicos = obtenerMedicos();
    const contenedor = document.getElementById('lista-medicos');
    
    console.log(`📋 Médicos encontrados: ${medicos.length}`);
    
    if (medicos.length === 0) {
        contenedor.innerHTML = `
            <div class="col-12 text-center py-4">
                <div class="text-muted">
                    <i class="bi bi-person-x display-4 d-block mb-2"></i>
                    <h4>No hay profesionales disponibles</h4>
                    <p>Por favor, contacte con el centro médico.</p>
                </div>
            </div>
        `;
        return;
    }

    contenedor.innerHTML = medicos.map(medico => {
        const obrasSocialesMedico = obtenerObrasSocialesPorIds(medico.obrasSociales || []);
        const obrasSocialesNombres = obrasSocialesMedico.map(os => os.nombre).join(', ');
        const especialidad = obtenerEspecialidadPorId(medico.especialidad);
        const nombreCompleto = obtenerNombreCompletoMedico(medico);
        
        console.log(`👨‍⚕️ Médico: ${nombreCompleto}, Precio: $${medico.precio}`);
        
        return `
            <div class="col-12">
                <div class="card mb-3 shadow-sm border-0">
                    <div class="card-body">
                        <div class="row align-items-center">
                            <div class="col-md-2 text-center">
                                <img src="${medico.imagen}" class="rounded" alt="${nombreCompleto}" 
                                     style="width: 80px; height: 80px; object-fit: cover;"
                                     onerror="this.src='https://via.placeholder.com/80x80?text=Imagen'">
                            </div>
                            <div class="col-md-6">
                                <h5 class="card-title text-primary mb-1">${nombreCompleto}</h5>
                                <p class="card-text text-muted mb-1">
                                    <i class="bi bi-briefcase me-1"></i>
                                    ${especialidad ? especialidad.nombre : 'Especialidad no especificada'}
                                </p>
                                <p class="card-text text-muted mb-1">
                                    <i class="bi bi-id-card me-1"></i>
                                    <strong>Matrícula:</strong> ${medico.matricula || 'N/A'}
                                </p>
                                ${medico.descripcion ? `
                                <p class="card-text text-muted mb-1 small" style="max-height: 40px; overflow: hidden; text-overflow: ellipsis;">
                                    <i class="bi bi-person-badge me-1"></i>
                                    ${medico.descripcion}
                                </p>
                                ` : ''}
                                <p class="card-text text-muted mb-1">
                                    <i class="bi bi-heart-pulse me-1"></i>
                                    <small>${obrasSocialesNombres || 'No especificadas'}</small>
                                </p>
                                <p class="card-text mb-0">
                                    <small class="text-muted">
                                        <i class="bi bi-clock me-1"></i>${medico.horarioAtencion || 'Horario no especificado'}
                                    </small>
                                </p>
                            </div>
                            <div class="col-md-2 text-center">
                                <strong class="text-success fs-4">$${medico.precio || 0}</strong>
                            </div>
                            <div class="col-md-2 text-center">
                                <button class="btn btn-primary w-100" onclick="seleccionarMedico(${medico.id})">
                                    <i class="bi bi-calendar-check me-1"></i>Seleccionar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function cargarObrasSociales() {
    obrasSociales = obtenerObrasSocialesActivas();
    const select = document.getElementById('obra-social');
    
    console.log(`🏥 Obras sociales activas: ${obrasSociales.length}`);
    
    select.innerHTML = '<option value="">Seleccione su obra social...</option>';
    
    obrasSociales.forEach(os => {
        const option = document.createElement('option');
        option.value = os.id;
        option.textContent = `${os.nombre} (${os.porcentaje || 0}% descuento)`;
        select.appendChild(option);
    });
}

function configurarEventListeners() {
    const formReserva = document.getElementById('form-reserva');
    if (formReserva) {
        formReserva.addEventListener('submit', function(e) {
            e.preventDefault();
            confirmarReserva();
        });
    }

    const selectObraSocial = document.getElementById('obra-social');
    if (selectObraSocial) {
        selectObraSocial.addEventListener('change', actualizarResumenCompleto);
    }
}

function seleccionarMedico(medicoId) {
    console.log(`🎯 Seleccionando médico ID: ${medicoId}`);
    
    medicoSeleccionado = obtenerMedicoPorId(medicoId);
    
    if (!medicoSeleccionado) {
        alert('Error: Médico no encontrado');
        return;
    }

    console.log(`✅ Médico seleccionado: ${obtenerNombreCompletoMedico(medicoSeleccionado)}`);
    document.getElementById('medico-seleccionado').value = medicoId;
    cargarTurnosDisponibles(medicoId);
    mostrarPaso(2);
}

function cargarTurnosDisponibles(medicoId) {
    console.log(`📅 Buscando turnos para médico ID: ${medicoId}`);
    
    const turnos = obtenerTurnosDisponiblesPorMedico(medicoId);
    const contenedor = document.getElementById('turnos-disponibles');
    
    console.log(`📊 Turnos disponibles encontrados: ${turnos.length}`);
    
    if (turnos.length === 0) {
        contenedor.innerHTML = `
            <div class="col-12 text-center py-4">
                <div class="text-muted">
                    <i class="bi bi-calendar-x display-4 d-block mb-2"></i>
                    <h4>No hay turnos disponibles</h4>
                    <p>No hay turnos disponibles para este profesional en este momento.</p>
                    <div class="mt-3">
                        <button class="btn btn-outline-primary" onclick="volverAPaso1()">
                            <i class="bi bi-arrow-left me-1"></i>Volver a profesionales
                        </button>
                    </div>
                </div>
            </div>
        `;
        return;
    }

    contenedor.innerHTML = turnos.map(turno => {
        const fechaHora = new Date(turno.fechaHora);
        const fecha = fechaHora.toLocaleDateString('es-AR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        const hora = fechaHora.toLocaleTimeString('es-AR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        console.log(`📆 Turno disponible: ${fecha} ${hora}`);
        
        return `
            <div class="col-12 col-sm-6 col-md-4 mb-3">
                <div class="card h-100 border-0 shadow-sm turno-disponible" style="cursor: pointer;"
                     onclick="seleccionarTurno(${turno.id})">
                    <div class="card-body text-center">
                        <h6 class="card-title text-primary">${fecha}</h6>
                        <p class="card-text fs-5 fw-bold text-success">${hora}</p>
                        <button class="btn btn-outline-primary btn-sm" 
                                onclick="event.stopPropagation(); seleccionarTurno(${turno.id})">
                            <i class="bi bi-check-circle me-1"></i>Seleccionar
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function seleccionarTurno(turnoId) {
    console.log(`🎯 Seleccionando turno ID: ${turnoId}`);
    
    turnoSeleccionado = obtenerTurnoPorId(turnoId);
    
    if (!turnoSeleccionado) {
        alert('Error: Turno no encontrado');
        return;
    }

    console.log(`✅ Turno seleccionado: ${turnoSeleccionado.id}`);
    document.getElementById('turno-seleccionado').value = turnoId;
    actualizarResumenTurnoSeleccionado();
    actualizarResumenCompleto();
    mostrarPaso(3);
}

function actualizarResumenTurnoSeleccionado() {
    if (!medicoSeleccionado || !turnoSeleccionado) return;

    const fechaHora = new Date(turnoSeleccionado.fechaHora);
    const fecha = fechaHora.toLocaleDateString('es-AR', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    const hora = fechaHora.toLocaleTimeString('es-AR', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });

    const especialidad = obtenerEspecialidadPorId(medicoSeleccionado.especialidad);
    const nombreCompleto = obtenerNombreCompletoMedico(medicoSeleccionado);

    const resumenHTML = `
        <div class="col-md-6">
            <strong>Profesional:</strong><br>
            ${nombreCompleto}<br>
            <small class="text-muted">${especialidad ? especialidad.nombre : 'Especialidad no especificada'}</small><br>
            <small class="text-muted">Matrícula: ${medicoSeleccionado.matricula || 'N/A'}</small>
        </div>
        <div class="col-md-6">
            <strong>Fecha y Hora:</strong><br>
            ${fecha}<br>
            <small class="text-muted">${hora}</small>
        </div>
    `;

    document.getElementById('resumen-turno-seleccionado').innerHTML = resumenHTML;
}

function actualizarResumenCompleto() {
    if (!medicoSeleccionado || !turnoSeleccionado) return;

    const obraSocialId = document.getElementById('obra-social').value;
    const obraSocial = obraSocialId ? obtenerObraSocialPorId(obraSocialId) : null;
    const porcentajeDescuento = obraSocial ? obraSocial.porcentaje : 0;
    const valorFinal = calcularValorFinal(medicoSeleccionado.precio, porcentajeDescuento);
    
    const fechaHora = new Date(turnoSeleccionado.fechaHora);
    const fecha = fechaHora.toLocaleDateString('es-AR', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    const hora = fechaHora.toLocaleTimeString('es-AR', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });

    const especialidad = obtenerEspecialidadPorId(medicoSeleccionado.especialidad);
    const nombreCompleto = obtenerNombreCompletoMedico(medicoSeleccionado);

    const resumenHTML = `
        <div class="row">
            <div class="col-md-6">
                <strong>Detalles del Turno:</strong><br>
                <strong>${nombreCompleto}</strong><br>
                <small class="text-muted">${especialidad ? especialidad.nombre : 'Especialidad no especificada'}</small><br>
                <small class="text-muted">Matrícula: ${medicoSeleccionado.matricula || 'N/A'}</small><br>
                <small class="text-muted">${fecha} - ${hora}</small>
            </div>
            <div class="col-md-6">
                <strong>Información de Pago:</strong><br>
                <table class="table table-sm table-borderless">
                    <tr>
                        <td>Valor consulta:</td>
                        <td class="text-end">$${medicoSeleccionado.precio}</td>
                    </tr>
                    ${obraSocial ? `
                    <tr>
                        <td>Descuento ${obraSocial.nombre}:</td>
                        <td class="text-end text-success">-${porcentajeDescuento}%</td>
                    </tr>
                    ` : ''}
                    <tr class="border-top">
                        <td><strong>Total a pagar:</strong></td>
                        <td class="text-end"><strong class="text-success fs-5">$${valorFinal.toFixed(2)}</strong></td>
                    </tr>
                </table>
            </div>
        </div>
        ${obraSocial ? `
        <div class="alert alert-info mt-3">
            <small>
                <i class="bi bi-info-circle me-1"></i>
                <strong>Importante:</strong> Deber&aacute; acreditar su afiliaci&oacute;n a ${obraSocial.nombre} el d&iacute;a de la consulta.
            </small>
        </div>
        ` : `
        <div class="alert alert-warning mt-3">
            <small>
                <i class="bi bi-exclamation-triangle me-1"></i>
                <strong>Recordatorio:</strong> Este es el valor de consulta particular. El pago se realiza al momento de la atención.
            </small>
        </div>
        `}
    `;

    document.getElementById('resumen-reserva').innerHTML = resumenHTML;
}

function confirmarReserva() {
    // Obtener datos del formulario
    const nombrePaciente = document.getElementById('nombre-paciente').value.trim();
    const documentoPaciente = document.getElementById('documento-paciente').value.trim();
    const fechaNacimiento = document.getElementById('fecha-nacimiento').value;
    const generoPaciente = document.getElementById('genero-paciente').value;
    const emailPaciente = document.getElementById('email-paciente').value.trim();
    const telefonoPaciente = document.getElementById('telefono-paciente').value.trim();
    const direccionPaciente = document.getElementById('direccion-paciente').value.trim();
    const obraSocialId = document.getElementById('obra-social').value;
    const numeroAfiliado = document.getElementById('numero-afiliado').value.trim();
    const motivoConsulta = document.getElementById('motivo-consulta').value.trim();
    const terminosAceptados = document.getElementById('terminos-condiciones').checked;

    // Validaciones
    if (!nombrePaciente || !documentoPaciente || !fechaNacimiento || !generoPaciente || 
        !emailPaciente || !telefonoPaciente || !obraSocialId) {
        alert('Por favor, complete todos los campos obligatorios (*)');
        return;
    }

    if (!terminosAceptados) {
        alert('Debe aceptar los términos y condiciones para continuar');
        return;
    }

    if (!medicoSeleccionado || !turnoSeleccionado) {
        alert('Error: No se ha seleccionado médico o turno');
        return;
    }

    const obraSocial = obraSocialId ? obtenerObraSocialPorId(obraSocialId) : null;
    const porcentajeDescuento = obraSocial ? obraSocial.porcentaje : 0;
    const valorFinal = calcularValorFinal(medicoSeleccionado.precio, porcentajeDescuento);

    // Crear reserva
    const reserva = {
        id: generarIdReserva(),
        paciente: {
            nombre: nombrePaciente,
            documento: documentoPaciente,
            fechaNacimiento: fechaNacimiento,
            genero: generoPaciente,
            email: emailPaciente,
            telefono: telefonoPaciente,
            direccion: direccionPaciente,
            obraSocialId: obraSocialId,
            numeroAfiliado: numeroAfiliado,
            motivoConsulta: motivoConsulta
        },
        medicoId: medicoSeleccionado.id,
        turnoId: turnoSeleccionado.id,
        especialidad: medicoSeleccionado.especialidad,
        obraSocialId: obraSocialId,
        valorConsultaOriginal: medicoSeleccionado.precio,
        porcentajeDescuento: porcentajeDescuento,
        valorFinal: valorFinal,
        fechaReserva: new Date().toISOString(),
        estado: 'confirmada'
    };

    // Guardar reserva
    const reservas = obtenerReservas();
    reservas.push(reserva);
    guardarReservas(reservas);

    // Marcar turno como no disponible
    const turnos = obtenerTurnos();
    const turnoIndex = turnos.findIndex(t => t.id === turnoSeleccionado.id);
    if (turnoIndex !== -1) {
        turnos[turnoIndex].disponible = false;
        guardarTurnos(turnos);
    }

    // Mostrar confirmación
    const fechaHora = new Date(turnoSeleccionado.fechaHora);
    const fecha = fechaHora.toLocaleDateString('es-AR', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    const hora = fechaHora.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

    const especialidad = obtenerEspecialidadPorId(medicoSeleccionado.especialidad);
    const nombreCompleto = obtenerNombreCompletoMedico(medicoSeleccionado);

    document.getElementById('mensaje-confirmacion').innerHTML = `
        <div class="text-start">
            <p>Su turno ha sido reservado exitosamente.</p>
            <div class="card bg-light">
                <div class="card-body">
                    <h6 class="card-title">Detalles de la Reserva:</h6>
                    <p class="mb-1"><strong>Paciente:</strong> ${nombrePaciente}</p>
                    <p class="mb-1"><strong>Profesional:</strong> ${nombreCompleto}</p>
                    <p class="mb-1"><strong>Especialidad:</strong> ${especialidad ? especialidad.nombre : 'No especificada'}</p>
                    <p class="mb-1"><strong>Matrícula:</strong> ${medicoSeleccionado.matricula || 'N/A'}</p>
                    <p class="mb-1"><strong>Fecha y Hora:</strong> ${fecha} a las ${hora}</p>
                    <p class="mb-1"><strong>Obra Social:</strong> ${obraSocial ? obraSocial.nombre : 'Particular'}</p>
                    <p class="mb-0"><strong>Valor a pagar:</strong> $${valorFinal.toFixed(2)}</p>
                </div>
            </div>
            <p class="mt-3">
                Se ha enviado un correo de confirmación a <strong>${emailPaciente}</strong><br>
                <small class="text-muted">Recuerde llegar 15 minutos antes de su turno.</small>
            </p>
        </div>
    `;

    mostrarPaso(4);
}

function mostrarPaso(numeroPaso) {
    // Ocultar todos los pasos
    document.querySelectorAll('.paso').forEach(paso => {
        paso.classList.add('d-none');
    });
    
    // Mostrar el paso actual
    document.getElementById(`paso${numeroPaso}`).classList.remove('d-none');
}

function volverAPaso1() {
    medicoSeleccionado = null;
    turnoSeleccionado = null;
    mostrarPaso(1);
}

function volverAPaso2() {
    mostrarPaso(2);
}

// Hacer funciones globales para los onclick
window.seleccionarMedico = seleccionarMedico;
window.seleccionarTurno = seleccionarTurno;
window.volverAPaso1 = volverAPaso1;
window.volverAPaso2 = volverAPaso2;
window.actualizarResumenCompleto = actualizarResumenCompleto;