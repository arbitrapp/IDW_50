// js/usuarios-admin.js
import { isAuthenticated, logout } from "./autenticationUtils.js";

// Variables globales
let usuarios = [];
let paginaActual = 1;
const USUARIOS_POR_PAGINA = 8;
const API_URL = "https://dummyjson.com/users";

// Inicializar la página
document.addEventListener("DOMContentLoaded", async function () {
  // Verificar autenticación
  if (!isAuthenticated()) {
    window.location.href = "login.html";
    return;
  }

  await cargarUsuarios();
  configurarEventListeners();
});

// Cargar usuarios desde DummyJSON API
async function cargarUsuarios() {
  try {
    mostrarLoading();
    
    const response = await fetch(`${API_URL}?limit=100`);
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    usuarios = data.users;
    
    // Filtrar datos sensibles
    usuarios = usuarios.map(usuario => ({
      id: usuario.id,
      username: usuario.username,
      email: usuario.email,
      firstName: usuario.firstName,
      lastName: usuario.lastName,
      age: usuario.age,
      gender: usuario.gender,
      phone: usuario.phone,
      birthDate: usuario.birthDate,
      image: usuario.image,
      domain: usuario.domain,
      ip: usuario.ip,
      university: usuario.university
      // Excluimos: password, ssn, y otros datos sensibles
    }));
    
    renderizarTablaUsuarios();
    renderizarPaginacion();
    
  } catch (error) {
    console.error("Error cargando usuarios:", error);
    mostrarError("Error al cargar los usuarios. Intente nuevamente.");
  }
}

function configurarEventListeners() {
  // Event listener para búsqueda
  const buscador = document.getElementById("buscadorUsuarios");
  if (buscador) {
    buscador.addEventListener("input", function (e) {
      filtrarUsuarios(e.target.value);
    });
  }
}

function mostrarLoading() {
  const tbody = document.getElementById("tabla-usuarios-body");
  if (tbody) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
          <p class="mt-2 text-muted">Cargando usuarios...</p>
        </td>
      </tr>
    `;
  }
}

function mostrarError(mensaje) {
  const tbody = document.getElementById("tabla-usuarios-body");
  if (tbody) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center py-5">
          <i class="bi bi-exclamation-triangle display-4 text-danger d-block mb-3"></i>
          <p class="text-danger">${mensaje}</p>
          <button class="btn btn-primary mt-2" onclick="cargarUsuarios()">
            <i class="bi bi-arrow-clockwise me-2"></i>Reintentar
          </button>
        </td>
      </tr>
    `;
  }
}

function renderizarTablaUsuarios() {
  const tbody = document.getElementById("tabla-usuarios-body");
  const inicio = (paginaActual - 1) * USUARIOS_POR_PAGINA;
  const fin = inicio + USUARIOS_POR_PAGINA;
  const usuariosPagina = usuarios.slice(inicio, fin);

  if (usuariosPagina.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center py-4">
          <div class="text-muted">
            <i class="bi bi-person-x display-4 d-block mb-2"></i>
            No se encontraron usuarios
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = usuariosPagina
    .map((usuario) => {
      return `
        <tr>
          <td>
            <div class="d-flex align-items-center">
              <img src="${usuario.image}" alt="${usuario.username}" 
                   class="rounded-circle me-3" style="width: 45px; height: 45px; object-fit: cover;">
              <div>
                <strong>${usuario.firstName} ${usuario.lastName}</strong>
                <br>
                <small class="text-muted">@${usuario.username}</small>
              </div>
            </div>
          </td>
          <td>${usuario.email}</td>
          <td>${usuario.phone || 'No disponible'}</td>
          <td>${usuario.age || 'N/A'} años</td>
          <td>
            <span class="badge ${usuario.gender === 'male' ? 'bg-primary' : 'bg-success'}">
              ${usuario.gender === 'male' ? 'Masculino' : 'Femenino'}
            </span>
          </td>
          <td>${usuario.university || 'No especificada'}</td>
          <td>
            <div class="btn-group btn-group-sm">
              <button class="btn btn-outline-primary" onclick="verDetalleUsuario(${usuario.id})" title="Ver detalle">
                <i class="bi bi-eye"></i>
              </button>
              <button class="btn btn-outline-info" onclick="editarUsuario(${usuario.id})" title="Editar">
                <i class="bi bi-pencil"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");
}

function renderizarPaginacion() {
  const container = document.getElementById("paginacion-container");
  const totalPaginas = Math.ceil(usuarios.length / USUARIOS_POR_PAGINA);

  if (totalPaginas <= 1) {
    container.innerHTML = '';
    return;
  }

  let paginacionHTML = `
    <nav aria-label="Paginación de usuarios">
      <ul class="pagination justify-content-center">
        <li class="page-item ${paginaActual === 1 ? 'disabled' : ''}">
          <a class="page-link" href="#" onclick="cambiarPagina(${paginaActual - 1})">
            <i class="bi bi-chevron-left"></i>
          </a>
        </li>
  `;

  // Mostrar páginas (máximo 5)
  const inicioPagina = Math.max(1, paginaActual - 2);
  const finPagina = Math.min(totalPaginas, inicioPagina + 4);

  for (let i = inicioPagina; i <= finPagina; i++) {
    paginacionHTML += `
      <li class="page-item ${i === paginaActual ? 'active' : ''}">
        <a class="page-link" href="#" onclick="cambiarPagina(${i})">${i}</a>
      </li>
    `;
  }

  paginacionHTML += `
        <li class="page-item ${paginaActual === totalPaginas ? 'disabled' : ''}">
          <a class="page-link" href="#" onclick="cambiarPagina(${paginaActual + 1})">
            <i class="bi bi-chevron-right"></i>
          </a>
        </li>
      </ul>
    </nav>
    <div class="text-center text-muted mt-2">
      Página ${paginaActual} de ${totalPaginas} - ${usuarios.length} usuarios totales
    </div>
  `;

  container.innerHTML = paginacionHTML;
}

function filtrarUsuarios(termino) {
  const terminoLower = termino.toLowerCase();
  
  if (!terminoLower) {
    paginaActual = 1;
    renderizarTablaUsuarios();
    renderizarPaginacion();
    return;
  }

  const usuariosFiltrados = usuarios.filter(usuario =>
    usuario.firstName.toLowerCase().includes(terminoLower) ||
    usuario.lastName.toLowerCase().includes(terminoLower) ||
    usuario.username.toLowerCase().includes(terminoLower) ||
    usuario.email.toLowerCase().includes(terminoLower) ||
    usuario.university?.toLowerCase().includes(terminoLower)
  );

  // Mostrar usuarios filtrados
  const tbody = document.getElementById("tabla-usuarios-body");
  if (usuariosFiltrados.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center py-4">
          <div class="text-muted">
            <i class="bi bi-search display-4 d-block mb-2"></i>
            No se encontraron usuarios que coincidan con "${termino}"
          </div>
        </td>
      </tr>
    `;
    document.getElementById("paginacion-container").innerHTML = '';
  } else {
    // Para búsqueda, mostramos todos los resultados sin paginación
    tbody.innerHTML = usuariosFiltrados
      .map((usuario) => {
        return `
          <tr>
            <td>
              <div class="d-flex align-items-center">
                <img src="${usuario.image}" alt="${usuario.username}" 
                     class="rounded-circle me-3" style="width: 45px; height: 45px; object-fit: cover;">
                <div>
                  <strong>${usuario.firstName} ${usuario.lastName}</strong>
                  <br>
                  <small class="text-muted">@${usuario.username}</small>
                </div>
              </div>
            </td>
            <td>${usuario.email}</td>
            <td>${usuario.phone || 'No disponible'}</td>
            <td>${usuario.age || 'N/A'} años</td>
            <td>
              <span class="badge ${usuario.gender === 'male' ? 'bg-primary' : 'bg-success'}">
                ${usuario.gender === 'male' ? 'Masculino' : 'Femenino'}
              </span>
            </td>
            <td>${usuario.university || 'No especificada'}</td>
            <td>
              <div class="btn-group btn-group-sm">
                <button class="btn btn-outline-primary" onclick="verDetalleUsuario(${usuario.id})" title="Ver detalle">
                  <i class="bi bi-eye"></i>
                </button>
                <button class="btn btn-outline-info" onclick="editarUsuario(${usuario.id})" title="Editar">
                  <i class="bi bi-pencil"></i>
                </button>
              </div>
            </td>
          </tr>
        `;
      })
      .join("");
    
    document.getElementById("paginacion-container").innerHTML = `
      <div class="text-center text-success mt-2">
        <i class="bi bi-check-circle me-2"></i>
        ${usuariosFiltrados.length} usuario(s) encontrado(s)
      </div>
    `;
  }
}

function cambiarPagina(pagina) {
  if (pagina < 1 || pagina > Math.ceil(usuarios.length / USUARIOS_POR_PAGINA)) {
    return;
  }
  
  paginaActual = pagina;
  renderizarTablaUsuarios();
  renderizarPaginacion();
  
  // Scroll suave hacia arriba
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function verDetalleUsuario(id) {
  const usuario = usuarios.find(u => u.id === id);
  if (usuario) {
    // Podrías implementar un modal con más detalles aquí
    alert(`Detalles de ${usuario.firstName} ${usuario.lastName}\n\nEmail: ${usuario.email}\nTeléfono: ${usuario.phone || 'No disponible'}\nUniversidad: ${usuario.university || 'No especificada'}\nDominio: ${usuario.domain}\nIP: ${usuario.ip}`);
  }
}

function editarUsuario(id) {
  const usuario = usuarios.find(u => u.id === id);
  if (usuario) {
    // En un sistema real, aquí abrirías un modal para editar
    alert(`Editar usuario: ${usuario.firstName} ${usuario.lastName}\n\nNota: En esta demo, la edición se conectaría con la API de DummyJSON.`);
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
window.cambiarPagina = cambiarPagina;
window.verDetalleUsuario = verDetalleUsuario;
window.editarUsuario = editarUsuario;
window.cargarUsuarios = cargarUsuarios;
window.logout = logout;