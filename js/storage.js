// Constantes para las claves de localStorage
const STORAGE_KEYS = {
    MEDICOS: 'medicos_galeno',
    OBRAS_SOCIALES: 'obras_sociales_galeno', 
    ESPECIALIDADES: 'especialidades_galeno',
    USUARIOS: 'usuarios_galeno',
    TURNOS: 'turnos_galeno',
    RESERVAS: 'reservas_galeno'
};

// Datos de prueba para médicos (por si falla la carga del JSON)
const DATOS_PRUEBA_MEDICOS = [
    {
        "id": 1,
        "nombre": "Dra. Valeria Guzmán Torres",
        "especialidad": 1, // ID de especialidad
        "imagen": "assets/img_professionals/vgt.jpg",
        "obrasSociales": [1, 2, 3, 4],
        "email": "vguzman@galeno.com",
        "telefono": "+54 11 1234-5678",
        "horarioAtencion": "Lunes a Viernes 8:00-16:00",
        "precio": 8500
    },
    {
        "id": 2,
        "nombre": "Dr. Marcelo Álvarez Quintana",
        "especialidad": 2, // ID de especialidad
        "imagen": "assets/img_professionals/maq.jpg",
        "obrasSociales": [5, 6, 7, 8],
        "email": "malvarez@galeno.com",
        "telefono": "+54 11 1234-5679",
        "horarioAtencion": "Lunes a Jueves 9:00-17:00",
        "precio": 7800
    }
];

// Datos de prueba para especialidades
const DATOS_PRUEBA_ESPECIALIDADES = [
    { "id": 1, "nombre": "Oncología Integrativa" },
    { "id": 2, "nombre": "Medicina del Sueño" },
    { "id": 3, "nombre": "Pediatría del Desarrollo" },
    { "id": 4, "nombre": "Cirugía de Columna" },
    { "id": 5, "nombre": "Psiquiatría de Alta Complejidad" },
    { "id": 6, "nombre": "Infectología" },
    { "id": 7, "nombre": "Ginecología y Fertilidad" },
    { "id": 8, "nombre": "Cardiología Preventiva" }
];

// Datos de prueba para obras sociales con porcentajes
const DATOS_PRUEBA_OBRAS_SOCIALES = [
    { "id": 1, "nombre": "Construir Salud", "logo": "assets/img_os/os_conSalud.png", "activo": true, "porcentaje": 20 },
    { "id": 2, "nombre": "Galeno", "logo": "assets/img_os/os_galeno.png", "activo": true, "porcentaje": 15 },
    { "id": 3, "nombre": "IOSFA", "logo": "assets/img_os/os_iosfa.png", "activo": true, "porcentaje": 25 },
    { "id": 4, "nombre": "OSDE", "logo": "assets/img_os/os_osde.png", "activo": true, "porcentaje": 30 },
    { "id": 5, "nombre": "OSECAC", "logo": "assets/img_os/os_osecac.png", "activo": true, "porcentaje": 10 },
    { "id": 6, "nombre": "OSEF", "logo": "assets/img_os/os_osef.png", "activo": true, "porcentaje": 18 },
    { "id": 7, "nombre": "OSIM", "logo": "assets/img_os/os_osim.png", "activo": true, "porcentaje": 22 },
    { "id": 8, "nombre": "OSPESA", "logo": "assets/img_os/os_ospesa.png", "activo": true, "porcentaje": 12 },
    { "id": 9, "nombre": "OSPIA", "logo": "assets/img_os/os_ospia.png", "activo": true, "porcentaje": 28 },
    { "id": 10, "nombre": "OSPIS", "logo": "assets/img_os/os_ospis.png", "activo": true, "porcentaje": 8 },
    { "id": 11, "nombre": "OSPIT", "logo": "assets/img_os/os_ospit.png", "activo": true, "porcentaje": 35 },
    { "id": 12, "nombre": "Swiss Medical", "logo": "assets/img_os/os_sm.png", "activo": true, "porcentaje": 40 }
];

// Datos de prueba para turnos
const DATOS_PRUEBA_TURNOS = [
    {
        "id": 1,
        "medicoId": 1,
        "fechaHora": "2025-01-20T10:00:00",
        "disponible": true
    },
    {
        "id": 2,
        "medicoId": 1,
        "fechaHora": "2025-01-20T11:00:00",
        "disponible": true
    },
    {
        "id": 3,
        "medicoId": 2,
        "fechaHora": "2025-01-20T09:00:00",
        "disponible": true
    },
    {
        "id": 4,
        "medicoId": 2,
        "fechaHora": "2025-01-20T14:00:00",
        "disponible": true
    }
];

// Inicializar todos los datos en localStorage
export async function inicializarStorage() {
    console.log('🔄 Inicializando storage...');
    
    try {
        // Intentar cargar desde JSON
        await inicializarDatos(STORAGE_KEYS.MEDICOS, './data/medicos.json');
        await inicializarDatos(STORAGE_KEYS.OBRAS_SOCIALES, './data/obras-sociales.json');
        await inicializarDatos(STORAGE_KEYS.TURNOS, './data/turnos.json');
        await inicializarDatos(STORAGE_KEYS.USUARIOS, './data/usuarios.json');
        
        // Inicializar especialidades y reservas
        inicializarEntidad(STORAGE_KEYS.ESPECIALIDADES, DATOS_PRUEBA_ESPECIALIDADES);
        inicializarEntidad(STORAGE_KEYS.RESERVAS, []);
        
        console.log('✅ Storage inicializado correctamente');
    } catch (error) {
        console.error('❌ Error inicializando storage:', error);
        // Si hay error, cargar datos de prueba
        cargarDatosDePrueba();
    }
}

// Función genérica para inicializar datos
async function inicializarDatos(storageKey, jsonPath) {
    console.log(`📁 Intentando cargar: ${jsonPath}`);
    
    if (!localStorage.getItem(storageKey)) {
        try {
            const response = await fetch(jsonPath);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log(`✅ ${storageKey}: Datos cargados desde JSON:`, data);
            
            // Extraer el array usando la clave del objeto JSON
            const key = Object.keys(data)[0];
            const datosArray = data[key];
            
            if (datosArray && datosArray.length > 0) {
                // Para obras sociales, agregar campo porcentaje si no existe
                if (storageKey === STORAGE_KEYS.OBRAS_SOCIALES) {
                    datosArray.forEach(os => {
                        if (os.porcentaje === undefined) {
                            os.porcentaje = DATOS_PRUEBA_OBRAS_SOCIALES.find(osPrueba => osPrueba.id === os.id)?.porcentaje || 0;
                        }
                    });
                }
                
                // Para médicos, convertir especialidad de string a ID y agregar precio
                if (storageKey === STORAGE_KEYS.MEDICOS) {
                    datosArray.forEach(medico => {
                        if (typeof medico.especialidad === 'string') {
                            const especialidadEncontrada = DATOS_PRUEBA_ESPECIALIDADES.find(esp => 
                                esp.nombre.toLowerCase().includes(medico.especialidad.toLowerCase()) ||
                                medico.especialidad.toLowerCase().includes(esp.nombre.toLowerCase())
                            );
                            medico.especialidad = especialidadEncontrada ? especialidadEncontrada.id : 1;
                        }
                        
                        // Si no tiene precio, usar valorConsulta o asignar uno por defecto
                        if (!medico.precio) {
                            if (medico.valorConsulta) {
                                medico.precio = medico.valorConsulta;
                            } else {
                                // Asignar valor de consulta basado en la especialidad
                                const valoresBase = {
                                    1: 8500, // Oncología
                                    2: 7800, // Medicina del Sueño
                                    3: 6500, // Pediatría
                                    4: 9200, // Cirugía
                                    5: 7200, // Psiquiatría
                                    6: 6800, // Infectología
                                    7: 7500, // Ginecología
                                    8: 8000  // Cardiología
                                };
                                medico.precio = valoresBase[medico.especialidad] || 7000;
                            }
                        }
                    });
                }
                
                localStorage.setItem(storageKey, JSON.stringify(datosArray));
                console.log(`✅ ${storageKey} guardado en localStorage: ${datosArray.length} registros`);
            } else {
                throw new Error(`Array vacío en ${jsonPath}`);
            }
            
        } catch (error) {
            console.error(`❌ Error cargando ${storageKey} desde ${jsonPath}:`, error);
            
            // Cargar datos de prueba según la entidad
            if (storageKey === STORAGE_KEYS.MEDICOS) {
                localStorage.setItem(STORAGE_KEYS.MEDICOS, JSON.stringify(DATOS_PRUEBA_MEDICOS));
            } else if (storageKey === STORAGE_KEYS.OBRAS_SOCIALES) {
                localStorage.setItem(STORAGE_KEYS.OBRAS_SOCIALES, JSON.stringify(DATOS_PRUEBA_OBRAS_SOCIALES));
            } else if (storageKey === STORAGE_KEYS.TURNOS) {
                localStorage.setItem(STORAGE_KEYS.TURNOS, JSON.stringify(DATOS_PRUEBA_TURNOS));
            } else {
                localStorage.setItem(storageKey, JSON.stringify([]));
            }
        }
    } else {
        console.log(`📊 ${storageKey} ya existe en localStorage`);
    }
}

// Inicializar entidad con datos de prueba si no existe
function inicializarEntidad(storageKey, datosPrueba) {
    if (!localStorage.getItem(storageKey)) {
        localStorage.setItem(storageKey, JSON.stringify(datosPrueba));
        console.log(`✅ ${storageKey} inicializado con datos de prueba`);
    }
}

// Cargar datos de prueba como fallback
function cargarDatosDePrueba() {
    console.log('🚨 Cargando datos de prueba...');
    localStorage.setItem(STORAGE_KEYS.MEDICOS, JSON.stringify(DATOS_PRUEBA_MEDICOS));
    localStorage.setItem(STORAGE_KEYS.OBRAS_SOCIALES, JSON.stringify(DATOS_PRUEBA_OBRAS_SOCIALES));
    localStorage.setItem(STORAGE_KEYS.ESPECIALIDADES, JSON.stringify(DATOS_PRUEBA_ESPECIALIDADES));
    localStorage.setItem(STORAGE_KEYS.TURNOS, JSON.stringify(DATOS_PRUEBA_TURNOS));
    localStorage.setItem(STORAGE_KEYS.RESERVAS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.USUARIOS, JSON.stringify([
        {
            "id": 1,
            "username": "admin",
            "password": "admin123", 
            "email": "admin@galeno.com",
            "rol": "administrador",
            "activo": true
        }
    ]));
}

// ==================== FUNCIONES PARA MÉDICOS ====================
export function obtenerMedicos() {
    const medicos = JSON.parse(localStorage.getItem(STORAGE_KEYS.MEDICOS) || '[]');
    console.log(`📋 Obteniendo médicos: ${medicos.length} encontrados`);
    return medicos.sort((a, b) => a.nombre.localeCompare(b.nombre));
}

export function guardarMedicos(medicos) {
    localStorage.setItem(STORAGE_KEYS.MEDICOS, JSON.stringify(medicos));
}

export function obtenerMedicoPorId(id) {
    const medicos = obtenerMedicos();
    return medicos.find(medico => medico.id === parseInt(id));
}

export function generarIdMedico() {
    const medicos = obtenerMedicos();
    return medicos.length > 0 ? Math.max(...medicos.map(m => m.id)) + 1 : 1;
}

// ==================== FUNCIONES PARA OBRAS SOCIALES ====================
export function obtenerObrasSociales() {
    const obrasSociales = JSON.parse(localStorage.getItem(STORAGE_KEYS.OBRAS_SOCIALES) || '[]');
    return obrasSociales.sort((a, b) => a.nombre.localeCompare(b.nombre));
}

export function obtenerObrasSocialesActivas() {
    const obrasSociales = obtenerObrasSociales();
    return obrasSociales.filter(os => os.activo !== false);
}

export function guardarObrasSociales(obrasSociales) {
    localStorage.setItem(STORAGE_KEYS.OBRAS_SOCIALES, JSON.stringify(obrasSociales));
}

export function obtenerObraSocialPorId(id) {
    const obrasSociales = obtenerObrasSociales();
    return obrasSociales.find(os => os.id === parseInt(id));
}

export function generarIdObraSocial() {
    const obrasSociales = obtenerObrasSociales();
    return obrasSociales.length > 0 ? Math.max(...obrasSociales.map(os => os.id)) + 1 : 1;
}

// ==================== FUNCIONES PARA ESPECIALIDADES ====================
export function obtenerEspecialidades() {
    const especialidades = JSON.parse(localStorage.getItem(STORAGE_KEYS.ESPECIALIDADES) || '[]');
    return especialidades.sort((a, b) => a.nombre.localeCompare(b.nombre));
}

export function guardarEspecialidades(especialidades) {
    localStorage.setItem(STORAGE_KEYS.ESPECIALIDADES, JSON.stringify(especialidades));
}

export function obtenerEspecialidadPorId(id) {
    const especialidades = obtenerEspecialidades();
    return especialidades.find(esp => esp.id === parseInt(id));
}

export function generarIdEspecialidad() {
    const especialidades = obtenerEspecialidades();
    return especialidades.length > 0 ? Math.max(...especialidades.map(esp => esp.id)) + 1 : 1;
}

// ==================== FUNCIONES PARA TURNOS ====================
export function obtenerTurnos() {
    const turnos = JSON.parse(localStorage.getItem(STORAGE_KEYS.TURNOS) || '[]');
    return turnos.sort((a, b) => new Date(a.fechaHora) - new Date(b.fechaHora));
}

export function guardarTurnos(turnos) {
    localStorage.setItem(STORAGE_KEYS.TURNOS, JSON.stringify(turnos));
}

export function obtenerTurnoPorId(id) {
    const turnos = obtenerTurnos();
    return turnos.find(turno => turno.id === parseInt(id));
}

export function obtenerTurnosDisponiblesPorMedico(medicoId) {
    const turnos = obtenerTurnos();
    const turnosFiltrados = turnos.filter(turno => 
        turno.medicoId === parseInt(medicoId) && 
        turno.disponible === true
    );
    console.log(`📅 Turnos disponibles para médico ${medicoId}: ${turnosFiltrados.length}`);
    return turnosFiltrados;
}

export function generarIdTurno() {
    const turnos = obtenerTurnos();
    return turnos.length > 0 ? Math.max(...turnos.map(t => t.id)) + 1 : 1;
}

// ==================== FUNCIONES PARA RESERVAS ====================
export function obtenerReservas() {
    const reservas = JSON.parse(localStorage.getItem(STORAGE_KEYS.RESERVAS) || '[]');
    return reservas.sort((a, b) => new Date(b.fechaReserva) - new Date(a.fechaReserva));
}

export function guardarReservas(reservas) {
    localStorage.setItem(STORAGE_KEYS.RESERVAS, JSON.stringify(reservas));
}

export function obtenerReservaPorId(id) {
    const reservas = obtenerReservas();
    return reservas.find(reserva => reserva.id === parseInt(id));
}

export function generarIdReserva() {
    const reservas = obtenerReservas();
    return reservas.length > 0 ? Math.max(...reservas.map(r => r.id)) + 1 : 1;
}

// ==================== FUNCIONES PARA USUARIOS ====================
export function obtenerUsuarios() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USUARIOS) || '[]');
}

export function guardarUsuarios(usuarios) {
    localStorage.setItem(STORAGE_KEYS.USUARIOS, JSON.stringify(usuarios));
}

// ==================== FUNCIONES ÚTILES ====================
export function obtenerObrasSocialesPorIds(ids) {
    const todasObrasSociales = obtenerObrasSociales();
    return todasObrasSociales.filter(os => ids.includes(os.id));
}

export function obtenerNombreObraSocialPorId(id) {
    const obraSocial = obtenerObraSocialPorId(id);
    return obraSocial ? obraSocial.nombre : 'Desconocida';
}

export function obtenerNombreEspecialidadPorId(id) {
    const especialidad = obtenerEspecialidadPorId(id);
    return especialidad ? especialidad.nombre : 'Desconocida';
}

// NUEVA FUNCIÓN: Obtener porcentaje de descuento por ID de obra social
export function obtenerPorcentajeDescuentoPorId(id) {
    const obraSocial = obtenerObraSocialPorId(id);
    return obraSocial ? (obraSocial.porcentaje || 0) : 0;
}

// NUEVA FUNCIÓN: Calcular valor final con descuento
export function calcularValorFinal(valorConsulta, porcentajeDescuento) {
    const descuento = valorConsulta * (porcentajeDescuento / 100);
    return valorConsulta - descuento;
}
