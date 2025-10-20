// Constantes para las claves de localStorage
const STORAGE_KEYS = {
    MEDICOS: 'medicos_galeno',
    OBRAS_SOCIALES: 'obras_sociales_galeno', 
    ESPECIALIDADES: 'especialidades_galeno',
    USUARIOS: 'usuarios_galeno'
};

// Datos de prueba para médicos (por si falla la carga del JSON)
const DATOS_PRUEBA_MEDICOS = [
    {
        "id": 1,
        "nombre": "Dra. Valeria Guzmán Torres",
        "especialidad": "Oncóloga Integrativa y Medicina Personalizada",
        "imagen": "assets/img_professionals/vgt.jpg",
        "obrasSociales": [1, 2, 3, 4],
        "email": "vguzman@galeno.com",
        "telefono": "+54 11 1234-5678",
        "horarioAtencion": "Lunes a Viernes 8:00-16:00"
    },
    {
        "id": 2,
        "nombre": "Dr. Marcelo Álvarez Quintana",
        "especialidad": "Especialista en Medicina del Sueño y Trastornos Circadianos",
        "imagen": "assets/img_professionals/maq.jpg",
        "obrasSociales": [5, 6, 7, 8],
        "email": "malvarez@galeno.com",
        "telefono": "+54 11 1234-5679",
        "horarioAtencion": "Lunes a Jueves 9:00-17:00"
    }
];

// Inicializar todos los datos en localStorage
export async function inicializarStorage() {
    console.log('🔄 Inicializando storage...');
    
    try {
        // Intentar cargar desde JSON
        await inicializarDatos(STORAGE_KEYS.MEDICOS, './data/medicos.json');
        await inicializarDatos(STORAGE_KEYS.OBRAS_SOCIALES, './data/obras-sociales.json');
        await inicializarDatos(STORAGE_KEYS.USUARIOS, './data/usuarios.json');
        
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
                localStorage.setItem(storageKey, JSON.stringify(datosArray));
                console.log(`✅ ${storageKey} guardado en localStorage: ${datosArray.length} registros`);
            } else {
                throw new Error(`Array vacío en ${jsonPath}`);
            }
            
        } catch (error) {
            console.error(`❌ Error cargando ${storageKey} desde ${jsonPath}:`, error);
            
            // Si es médicos y falla, cargar datos de prueba
            if (storageKey === STORAGE_KEYS.MEDICOS) {
                console.log('🔄 Cargando datos de prueba para médicos...');
                localStorage.setItem(STORAGE_KEYS.MEDICOS, JSON.stringify(DATOS_PRUEBA_MEDICOS));
            } else {
                localStorage.setItem(storageKey, JSON.stringify([]));
            }
        }
    } else {
        console.log(`📊 ${storageKey} ya existe en localStorage`);
    }
}

// Cargar datos de prueba como fallback
function cargarDatosDePrueba() {
    console.log('🚨 Cargando datos de prueba...');
    localStorage.setItem(STORAGE_KEYS.MEDICOS, JSON.stringify(DATOS_PRUEBA_MEDICOS));
    localStorage.setItem(STORAGE_KEYS.OBRAS_SOCIALES, JSON.stringify([]));
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