document.addEventListener("DOMContentLoaded", () => {
    
    let productos = JSON.parse(localStorage.getItem("productos")) || [];
    let ventas = JSON.parse(localStorage.getItem("ventas")) || [];

    const form = document.getElementById("loginForm");
    const logoutBtn = document.getElementById("logoutBtn");
    const navItems = document.querySelectorAll('.nav-item');
    
    const btnEnviar = document.getElementById("btn-enviar");
    const chatInput = document.getElementById("chat-input");
    const chatBox = document.getElementById("chat-box");

    const btnStock = document.getElementById("btnAgregarProducto");
    const inputNombre = document.getElementById("productoNombre");
    const inputCantidad = document.getElementById("productoCantidad");
    const listaStock = document.getElementById("listaStock");

    const selectProducto = document.getElementById("ventaProducto");
    const inputCantidadVenta = document.getElementById("ventaCantidad");
    const btnVender = document.getElementById("btnVender");
    const listaVentas = document.getElementById("listaVentas");

    const statTotalProductos = document.getElementById("statTotalProductos");
    const statTotalVentas = document.getElementById("statTotalVentas");
    const statProductoMasVendido = document.getElementById("statProductoMasVendido");
    const listaEstadisticas = document.getElementById("listaEstadisticas");

    const btnDarkMode = document.getElementById("btnDarkMode");
    const body = document.body;

    if (localStorage.getItem("theme") === "dark") {
        body.classList.add("dark-mode");
        if (btnDarkMode) btnDarkMode.innerText = "☀️ Modo Claro";
    }

    if (btnDarkMode) {
        btnDarkMode.addEventListener("click", () => {
            body.classList.toggle("dark-mode");
            const esOscuro = body.classList.contains("dark-mode");
            localStorage.setItem("theme", esOscuro ? "dark" : "light");
            btnDarkMode.innerText = esOscuro ? "☀️ Modo Claro" : "🌙 Modo Oscuro";
        });
    }

    function imprimirTicket(nombreProd, cantidad) {
        const ticketContenido = document.getElementById("ticketContenido");
        const ticketFecha = document.getElementById("ticketFecha");
        const fechaActual = new Date().toLocaleString();

        if (ticketContenido) {
            ticketContenido.innerHTML = `
                <div style="display:flex; justify-content:space-between; margin:5px 0;">
                    <span>Producto:</span> <span>${nombreProd}</span>
                </div>
                <div style="display:flex; justify-content:space-between; margin:5px 0;">
                    <span>Cantidad:</span> <span>${cantidad} u.</span>
                </div>
                <div style="display:flex; justify-content:space-between; font-weight:bold; margin-top:10px; border-top:1px solid #000; padding-top:5px;">
                    <span>ESTADO:</span> <span>PAGADO</span> 
                </div>
            `;
            if (ticketFecha) ticketFecha.innerText = fechaActual;
            window.print();
        }
    }

    function actualizarEstadisticas() {
        if (!statTotalProductos) return;

        statTotalProductos.innerText = productos.length;
        statTotalVentas.innerText = ventas.length;

        let conteoVentas = {};
        ventas.forEach(v => {
            conteoVentas[v.nombre] = (conteoVentas[v.nombre] || 0) + v.cantidad;
        });

        const productosOrdenados = Object.entries(conteoVentas).sort((a, b) => b[1] - a[1]);

        if (statProductoMasVendido) {
            statProductoMasVendido.innerText = productosOrdenados.length > 0 ? productosOrdenados[0][0] : "-";
        }

        if (listaEstadisticas) {
            listaEstadisticas.innerHTML = "";
            productosOrdenados.forEach(([nombre, total]) => {
                const fila = document.createElement("tr");
                fila.innerHTML = `<td>${nombre}</td><td>${total} unidades</td>`;
                listaEstadisticas.appendChild(fila);
            });
        }
    }

    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const usuario = formData.get("usuario");
            const password = formData.get("password");

            if (usuario === "admin" && password === "1234") {
                localStorage.setItem("isLoggedIn", "true");
                window.location.href = "dashboard.html";
            } else {
                alert("Usuario o contraseña incorrectos");
                form.reset();
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("isLoggedIn");
            window.location.href = "index.html";
        });
    }

    if (window.location.pathname.includes("dashboard.html")) {
        if (localStorage.getItem("isLoggedIn") !== "true") {
            window.location.href = "index.html";
        }
    }

    navItems.forEach(item => {
        item.addEventListener('click', () => mostrarSeccion(item.dataset.section));
    });

    function mostrarSeccion(id) {
    const secciones = document.querySelectorAll('.seccion');
    const items = document.querySelectorAll('.nav-item');
    const sectionTitle = document.getElementById("section-title");
    
    secciones.forEach(s => s.classList.remove('active'));
    items.forEach(i => i.classList.remove('active'));

    const seccionActiva = document.getElementById(id);
    const navActivo = document.querySelector(`[data-section="${id}"]`);

    if (seccionActiva) seccionActiva.classList.add('active');
    if (navActivo) navActivo.classList.add('active');

    const nombresSecciones = {       
        'pedidos': 'Seguimiento de Pedidos',
        'clientes': 'Base de Clientes',
        'chat': 'Chat del Equipo'
    };

    if (sectionTitle) {
        sectionTitle.innerText = nombresSecciones[id] || "PymeSync";
    }
    
    if (id === 'ventas') actualizarSelectVentas();
    if (id === 'inicio') actualizarEstadisticas(); 
}

function renderizarStock() {
    if (!listaStock) return;
    listaStock.innerHTML = "";
    
    productos.forEach((prod, index) => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td>${prod.nombre}</td>
            <td>${prod.cantidad} unidades</td>
            <td><button class="btn-eliminar" data-index="${index}">Eliminar</button></td>
        `;
        
        fila.querySelector(".btn-eliminar").addEventListener("click", () => {
            productos.splice(index, 1);
            guardarYRenderizarTodo();
        });
        
        listaStock.appendChild(fila);
    });

    localStorage.setItem("productos", JSON.stringify(productos));
}

    function actualizarSelectVentas() {
        if (!selectProducto) return;
        selectProducto.innerHTML = '<option value="" disabled selected>Elegir producto...</option>';
        productos.forEach((prod, index) => {
            const opt = document.createElement("option");
            opt.value = index;
            opt.textContent = `${prod.nombre} (Stock: ${prod.cantidad})`;
            selectProducto.appendChild(opt);
        });
    }

    if (btnStock) {
        btnStock.addEventListener("click", () => {
            const nombre = inputNombre.value.trim();
            const cantidad = parseInt(inputCantidad.value);
            if (nombre && cantidad > 0) {
                productos.push({ nombre, cantidad });
                guardarYRenderizarTodo();
                inputNombre.value = "";
                inputCantidad.value = "";
                inputNombre.focus();
            }
        });
    }

    if (btnVender) {
        btnVender.addEventListener("click", () => {
            const index = selectProducto.value;
            const cantVenta = parseInt(inputCantidadVenta.value);
            if (index !== "" && cantVenta > 0 && productos[index].cantidad >= cantVenta) {
                productos[index].cantidad -= cantVenta;
                ventas.push({ 
                    nombre: productos[index].nombre, 
                    cantidad: cantVenta,
                    fecha: new Date().toLocaleString() 
                });
                guardarYRenderizarTodo();
                imprimirTicket(productos[index].nombre, cantVenta);
                inputCantidadVenta.value = "";
            } else {
                alert("Stock insuficiente o datos inválidos");
            }
        });
    }

    function renderizarVentas() {
        if (!listaVentas) return;
        listaVentas.innerHTML = "";
        ventas.forEach(v => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${v.fecha.split(',')[0]}</td>
                <td>${v.nombre}</td>
                <td>${v.cantidad} u.</td>
                <td><span style="color:green">Completado</span></td>
            `;
            listaVentas.appendChild(tr);
        });
        localStorage.setItem("ventas", JSON.stringify(ventas));
    }

    if (btnEnviar) {
        btnEnviar.addEventListener("click", () => {
            const texto = chatInput.value.trim();
            if (texto) {
                const msg = document.createElement("div");
                msg.className = "mensaje";
                msg.innerText = texto;
                chatBox.appendChild(msg);
                chatInput.value = "";
                chatBox.scrollTop = chatBox.scrollHeight;
            }
        });
        chatInput.addEventListener("keypress", (e) => { if (e.key === "Enter") btnEnviar.click(); });
    }

    function guardarYRenderizarTodo() {
        renderizarStock();
        renderizarVentas();
        actualizarSelectVentas();
        actualizarEstadisticas(); 
    }


    renderizarStock();
    renderizarVentas();
    actualizarEstadisticas();
    actualizarSelectVentas();
    
    mostrarSeccion('inicio');
});