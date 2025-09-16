// Creamos un array vacío donde se guardarán todas las películas
let películas = [];

// ==============================
// 1. CARGAR LOS DATOS Y GUARDARLOS
// ==============================
fetch("https://japceibal.github.io/japflix_api/movies-data.json")
  .then(response => {
    // Si hubo un error en la respuesta (ej: 404), lanzamos excepción
    if(!response.ok) {
        throw new Error('HTTP error ' + response.status);
    }
    // Convertimos la respuesta a JSON
    return response.json();
  })
  .then(data => {
    // Guardamos los datos en la variable global
    console.log("Datos de películas:", data);
    películas = data;
    console.log(`Se cargaron ${películas.length} películas`);
  })
  .catch(error => {
    // Capturamos cualquier error de red o de conversión
    console.error('Error al obtener los datos:', error);
  });

// ==============================
// 2. FUNCIÓN PARA BUSCAR PELÍCULAS
// ==============================
// Recibe un término (string) y filtra las películas que lo contengan
function buscarPelículas(término) {
  if (!término || término.trim() === '') {
    // Si el input está vacío, borramos la lista
    document.getElementById('lista').innerHTML = '';
    return;
  }
  
  const términoLower = término.toLowerCase(); // pasamos a minúsculas para comparar

  // Filtramos películas por coincidencias en: título, overview o géneros
  const películasFiltradas = películas.filter(película => {
    const título = película.title?.toLowerCase() || '';
    const overview = película.overview?.toLowerCase() || '';
    const géneros = película.genres?.map(g => g.name?.toLowerCase()).join(' ') || '';
    
    return título.includes(términoLower) || 
           overview.includes(términoLower) || 
           géneros.includes(términoLower);
  });
  
  // Mostramos los resultados filtrados en pantalla
  mostrarResultados(películasFiltradas);
}

// ==============================
// 3. FUNCIÓN PARA MOSTRAR RESULTADOS
// ==============================
// Recibe las películas filtradas y arma la lista en HTML
function mostrarResultados(películasFiltradas) {
  const lista = document.getElementById('lista');
  
  // Si no hay resultados, mostramos mensaje de error
  if (películasFiltradas.length === 0) {
    lista.innerHTML = '<li class="list-group-item bg-dark text-white text-center">No se encontraron resultados</li>';
    return;
  }
  
  let html = '';
  
  // Por cada película, armamos una tarjeta resumida
  películasFiltradas.forEach((película, index) => {
    const año = película.release_date ? new Date(película.release_date).getFullYear() : 'N/A';
    const géneros = película.genres ? película.genres.map(g => g.name).join(', ') : '';
    const estrellas = generarEstrellas(película.vote_average || 0);
    const duración = película.runtime ? `${película.runtime} min` : 'N/A';
    const presupuesto = película.budget ? `$${película.budget.toLocaleString()}` : 'N/A';
    const ganancias = película.revenue ? `$${película.revenue.toLocaleString()}` : 'N/A';
    
    html += `
      <li class="list-group-item bg-dark text-white border-secondary movie-item" 
          data-movie-index="${index}" 
          style="cursor: pointer;">
        <div class="row">
          <div class="col-md-8">
            <h5 class="mb-1">${película.title || 'Sin título'}</h5>
            <p class="mb-1">${película.tagline || ''}</p>
            <small class="text-muted">${géneros}</small>
          </div>
          <div class="col-md-4 text-end">
            <div class="mb-2">${estrellas}</div>
            <small class="text-muted">${año}</small>
            <!-- Dropdown con más información -->
            <div class="dropdown mt-2" onclick="event.stopPropagation();">
              <button class="btn btn-secondary btn-sm dropdown-toggle" type="button" 
                      id="dropdownMenuButton${index}" data-bs-toggle="dropdown" aria-expanded="false">
                Más info
              </button>
              <ul class="dropdown-menu dropdown-menu-dark" aria-labelledby="dropdownMenuButton${index}">
                <li><span class="dropdown-item-text"><strong>Año:</strong> ${año}</span></li>
                <li><span class="dropdown-item-text"><strong>Duración:</strong> ${duración}</span></li>
                <li><span class="dropdown-item-text"><strong>Presupuesto:</strong> ${presupuesto}</span></li>
                <li><span class="dropdown-item-text"><strong>Ganancias:</strong> ${ganancias}</span></li>
              </ul>
            </div>
          </div>
        </div>
      </li>
    `;
  });
  
  // Insertamos todo el HTML generado en la lista
  lista.innerHTML = html;
  
  // Asociamos eventos click a cada ítem para mostrar detalles extendidos
  document.querySelectorAll('.movie-item').forEach((item, index) => {
    item.addEventListener('click', function() {
      mostrarDetallesPelicula(películasFiltradas[index]);
    });
  });
}

// ==============================
// 4. FUNCIÓN PARA GENERAR ESTRELLAS
// ==============================
// Convierte el "vote_average" (0 a 10) en 5 estrellas
function generarEstrellas(voteAverage) {
  const estrellas = Math.round(voteAverage / 2); // Escalamos de 10 a 5
  let estrellasHTML = '';
  
  for (let i = 1; i <= 5; i++) {
    if (i <= estrellas) {
      estrellasHTML += '<span class="fa fa-star checked"></span>'; // estrella llena
    } else {
      estrellasHTML += '<span class="fa fa-star"></span>'; // estrella vacía
    }
  }
  
  return estrellasHTML;
}

// ==============================
// 5. FUNCIÓN PARA MOSTRAR DETALLES DE PELÍCULA
// ==============================
function mostrarDetallesPelicula(película) {
  document.getElementById('movieTitle').textContent = película.title || 'Sin título';
  document.getElementById('movieOverview').textContent = película.overview || 'Sin descripción disponible';
  
  const géneros = película.genres ? película.genres.map(g => g.name).join(', ') : 'Sin géneros';
  document.getElementById('movieGenres').innerHTML = `<strong>Géneros:</strong> ${géneros}`;
  
  // Mostramos el contenedor de detalles (puede ser un offcanvas o modal)
  document.getElementById('offcanvas-container').style.display = 'block';
}

// ==============================
// 6. FUNCIÓN PARA CERRAR DETALLES
// ==============================
function cerrarDetalles() {
  document.getElementById('offcanvas-container').style.display = 'none';
}

// ==============================
// 7. EVENT LISTENERS PRINCIPALES
// ==============================
document.addEventListener("DOMContentLoaded", function(){
  
  // Cuando hago clic en el botón Buscar
  const btnBuscar = document.getElementById("btnBuscar");
  if (btnBuscar) {
    btnBuscar.addEventListener("click", function(){
      let input = document.getElementById("inputBuscar").value;
      console.log("Buscando:", input);
      
      if (películas.length === 0) {
        alert('Los datos aún se están cargando...');
        return;
      }
      
      buscarPelículas(input);
    });
  }
  
  // También permitimos buscar apretando la tecla Enter
  const inputBuscar = document.getElementById("inputBuscar");
  if (inputBuscar) {
    inputBuscar.addEventListener("keypress", function(e){
      if (e.key === 'Enter') {
        let input = this.value;
        console.log("Buscando con Enter:", input);
        
        if (películas.length === 0) {
          alert('Los datos aún se están cargando...');
          return;
        }
        
        buscarPelículas(input);
      }
    });
  }
});
