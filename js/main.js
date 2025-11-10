import { 
    obtenerMedicos, 
    obtenerObrasSocialesPorIds,
    inicializarStorage,
    obtenerEspecialidadPorId
} from './storage.js';
//PARTE DE CRISTIAN - INICIALIZACIÓN Y FUNCIONALIDAD GENERAL
// Variables globales para paginación
let medicosPaginados = [];
let paginaActual = 1;
const MEDICOS_POR_PAGINA = 8;

// Inicializar la página
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Iniciando carga de la página...');
    
    try {
        await inicializarStorage();
        console.log('Storage inicializado, cargando contenido...');
        cargarProfesionales();
        cargarObrasSociales(); 
    } catch (error) {
        console.error('❌ Error inicializando:', error);
    }
});
// FIN CRISTIAN

// PARTE DE JOSE - MÉDICOS EN INDEX
function cargarProfesionales() {
    console.log('Obteniendo médicos...');
    const todosLosMedicos = obtenerMedicos();
    const contenedor = document.getElementById('profesionales-container');
    const paginacionContainer = document.getElementById('paginacion-container');
    
    console.log('Médicos encontrados:', todosLosMedicos);
    
    if (!contenedor) {
        console.error('❌ No se encontró el contenedor con id "profesionales-container"');
        return;
    }
    
    if (todosLosMedicos.length === 0) {
        console.log('No hay médicos, mostrando mensaje vacío');
        contenedor.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="text-muted">
                    <i class="bi bi-person-x display-1 d-block mb-3"></i>
                    <h4>No hay profesionales disponibles</h4>
                    <p>Visite la sección de administración para agregar médicos.</p>
                </div>
            </div>
        `;
        paginacionContainer.innerHTML = '';
        return;
    }
    
    // Calcular paginación
    const totalPaginas = Math.ceil(todosLosMedicos.length / MEDICOS_POR_PAGINA);
    const inicio = (paginaActual - 1) * MEDICOS_POR_PAGINA;
    const fin = inicio + MEDICOS_POR_PAGINA;
    medicosPaginados = todosLosMedicos.slice(inicio, fin);
    
    console.log(`Cargando ${medicosPaginados.length} médicos (página ${paginaActual} de ${totalPaginas})...`);
    
    // Crear HTML con estructura de cuadrícula
    let html = '<div class="row g-4">';
    
    medicosPaginados.forEach(medico => {
        html += crearCardMedico(medico);
    });
    
    html += '</div>';
    
    contenedor.innerHTML = html;
    
    // Crear paginación
    crearPaginacion(totalPaginas);
    
    console.log('✅ Profesionales cargados correctamente');
}

function crearCardMedico(medico) {
    console.log(`Creando card para: ${medico.nombre}`);
    
    const obrasSociales = obtenerObrasSocialesPorIds(medico.obrasSociales || []);
    // Filtrar solo obras sociales activas
    const obrasSocialesActivas = obrasSociales.filter(os => os.activo !== false);
    const obrasSocialesNombres = obrasSocialesActivas.map(os => os.nombre).join(', ');
    const especialidad = obtenerEspecialidadPorId(medico.especialidad);
    
    return `
        <div class="col-12 col-sm-6 col-lg-3">
            <div class="card h-100 shadow border-0" style="border-radius: 15px; overflow: hidden;">
                <img src="${medico.imagen}" class="card-img-top" alt="${medico.nombre}" 
                     style="height: 250px; object-fit: cover;"
                     onerror="this.src='https://via.placeholder.com/300x250?text=Imagen+no+disponible'">
                <div class="card-body d-flex flex-column p-4">
                    <h5 class="card-title text-primary fw-bold">${medico.nombre}</h5>
                    <p class="card-text text-muted mb-2">
                        <i class="bi bi-briefcase me-2"></i>
                        <strong>Especialidad:</strong> ${especialidad ? especialidad.nombre : medico.especialidad}
                    </p>
                    <p class="card-text text-muted mb-2">
                        <i class="bi bi-id-card me-2"></i>
                        <strong>Matrícula:</strong> ${medico.matricula || 'N/A'}
                    </p>
                    <p class="card-text text-muted mb-2">
                        <i class="bi bi-clock me-2"></i>
                        <strong>Horario:</strong> ${medico.horarioAtencion}
                    </p>
                    ${medico.descripcion ? `
                    <p class="card-text text-muted mb-2 small" style="max-height: 60px; overflow: hidden; text-overflow: ellipsis;">
                        <i class="bi bi-person-badge me-2"></i>
                        ${medico.descripcion}
                    </p>
                    ` : ''}
                    <p class="card-text text-muted mb-3">
                        <i class="bi bi-heart-pulse me-2"></i>
                        <strong>Obras Sociales:</strong> 
                        <small>${obrasSocialesNombres || 'No especificadas'}</small>
                    </p>
                    <p class="card-text mb-3">
                        <strong class="text-success">Valor consulta: $${medico.precio || medico.valorConsulta || 0}</strong>
                    </p>
                    <div class="mt-auto">
                        <a href="reservas.html?medico=${medico.id}" class="btn btn-primary w-100 py-2" style="border-radius: 25px;">
                            <i class="bi bi-calendar-check me-2"></i>Reservar turno
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function crearPaginacion(totalPaginas) {
    const paginacionContainer = document.getElementById('paginacion-container');
    
    if (totalPaginas <= 1) {
        paginacionContainer.innerHTML = '';
        return;
    }
    
    let html = `
        <nav aria-label="Paginación de profesionales">
            <ul class="pagination">
    `;
    
    // Botón Anterior
    if (paginaActual > 1) {
        html += `
            <li class="page-item">
                <button class="page-link" onclick="cambiarPagina(${paginaActual - 1})">
                    <i class="bi bi-chevron-left me-1"></i>Anterior
                </button>
            </li>
        `;
    } else {
        html += `
            <li class="page-item disabled">
                <span class="page-link">
                    <i class="bi bi-chevron-left me-1"></i>Anterior
                </span>
            </li>
        `;
    }
    
    // Números de página
    for (let i = 1; i <= totalPaginas; i++) {
        if (i === paginaActual) {
            html += `
                <li class="page-item active">
                    <span class="page-link">${i}</span>
                </li>
            `;
        } else {
            html += `
                <li class="page-item">
                    <button class="page-link" onclick="cambiarPagina(${i})">${i}</button>
                </li>
            `;
        }
    }
    
    // Botón Siguiente
    if (paginaActual < totalPaginas) {
        html += `
            <li class="page-item">
                <button class="page-link" onclick="cambiarPagina(${paginaActual + 1})">
                    Siguiente<i class="bi bi-chevron-right ms-1"></i>
                </button>
            </li>
        `;
    } else {
        html += `
            <li class="page-item disabled">
                <span class="page-link">
                    Siguiente<i class="bi bi-chevron-right ms-1"></i>
                </span>
            </li>
        `;
    }
    
    html += `
            </ul>
        </nav>
    `;
    
    paginacionContainer.innerHTML = html;
}

function cambiarPagina(nuevaPagina) {
    paginaActual = nuevaPagina;
    cargarProfesionales();
    
    // Scroll suave hacia la sección de profesionales
    document.getElementById('NuestrosProfesionales').scrollIntoView({ 
        behavior: 'smooth' 
    });
}

//FIN DE JOSE

// PARTE DE NESTOR - OBRAS SOCIALES EN INDEX
function cargarObrasSociales() {
    console.log('Cargando obras sociales...');
    const obrasSociales = obtenerObrasSocialesActivas();
    const contenedor = document.getElementById('obras-sociales-container');
    
    if (!contenedor) {
        console.error('❌ No se encontró el contenedor de obras sociales');
        return;
    }
    
    console.log(`Encontradas ${obrasSociales.length} obras sociales activas`);
    
    if (obrasSociales.length === 0) {
        contenedor.innerHTML = `
            <div class="carousel-item active">
                <div class="row g-4 justify-content-center">
                    <div class="col-12 text-center py-5">
                        <div class="text-muted">
                            <i class="bi bi-building display-1 d-block mb-3"></i>
                            <h4>No hay obras sociales disponibles</h4>
                            <p>Visite la sección de administración para agregar obras sociales.</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        return;
    }
    
    // Agrupar obras sociales en grupos de 3 
    const grupos = [];
    for (let i = 0; i < obrasSociales.length; i += 3) {
        grupos.push(obrasSociales.slice(i, i + 3));
    }
    
    let html = '';
    
    grupos.forEach((grupo, index) => {
        const esActivo = index === 0 ? 'active' : '';
        html += `
            <div class="carousel-item ${esActivo}">
                <div class="row g-4 justify-content-center">
                    ${grupo.map(os => crearItemObraSocialOriginal(os)).join('')}
                </div>
            </div>
        `;
    });
    
    contenedor.innerHTML = html;
    console.log('Obras sociales cargadas correctamente');
}

// Función para obtener solo obras sociales activas
function obtenerObrasSocialesActivas() {
    const obrasSociales = JSON.parse(localStorage.getItem('obras_sociales_galeno') || '[]');
    return obrasSociales.filter(os => os.activo !== false);
}

function crearItemObraSocialOriginal(obraSocial) {
    return `
        <div class="col-12 col-md-3">
            <a href="${obtenerEnlaceObraSocial(obraSocial.nombre)}" target="_blank" class="d-block h-100 text-decoration-none">
                <div class="border rounded-3 bg-white p-3 shadow h-100 text-center">
                    ${obraSocial.logo ? 
                        `<img src="${obraSocial.logo}" class="img-fluid d-block mx-auto" alt="${obraSocial.nombre}" 
                             style="max-height: 60px; object-fit: contain;">` :
                        `<div class="bg-light rounded d-flex align-items-center justify-content-center" 
                              style="height: 60px;">
                            <i class="bi bi-building text-muted"></i>
                         </div>`
                    }
                    <small class="d-block mt-2 text-muted">${obraSocial.porcentaje || 0}% descuento</small>
                </div>
            </a>
        </div>
    `;
}

function obtenerEnlaceObraSocial(nombreObraSocial) {
    const enlaces = {
        'Construir Salud': 'https://construirsalud.com.ar/',
        'Galeno': 'https://www.galeno.com.ar/',
        'IOSFA': 'https://iosfa.gob.ar/',
        'OSDE': 'https://www.osde.com.ar/',
        'OSECAC': 'https://www.osecac.org.ar/',
        'OSEF': 'https://osef.gob.ar/#/',
        'OSIM': 'https://osim.com.ar/osim_2016/index.php',
        'OSPESA': 'http://ospesa.com.ar/#!/-inicio/',
        'OSPIA': 'https://www.ospia.org.ar/',
        'OSPIS': 'https://www.ospis.com.ar/',
        'OSPIT': 'https://www.ospit.org.ar/',
        'Swiss Medical': 'https://www.swissmedical.com.ar/prepagaclientes/'
    };
    
    return enlaces[nombreObraSocial] || '#';
}

// Hacer función global para la paginación
window.cambiarPagina = cambiarPagina;