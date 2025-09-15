// Mobile Menu Toggle - Versión mejorada
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('nav ul');
    const body = document.body;
    
    // Crear overlay para el menú
    const overlay = document.createElement('div');
    overlay.className = 'menu-overlay';
    document.body.appendChild(overlay);
    
    // Función para abrir el menú
    function openMenu() {
        navMenu.classList.add('show');
        overlay.classList.add('active');
        body.style.overflow = 'hidden';
    }
    
    // Función para cerrar el menú
    function closeMenu() {
        navMenu.classList.remove('show');
        overlay.classList.remove('active');
        body.style.overflow = '';
    }
    
    // Toggle menu al hacer clic en el botón
    mobileMenuBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        if (navMenu.classList.contains('show')) {
            closeMenu();
        } else {
            openMenu();
        }
    });
    
    // Cerrar menú al hacer clic en overlay
    overlay.addEventListener('click', closeMenu);
    
    // Cerrar menú al hacer clic en un enlace
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', closeMenu);
    });
    
    // Cerrar menú al redimensionar la ventana (si se cambia a desktop)
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            closeMenu();
        }
    });
    
    // Resto de tu código JavaScript existente...
    // Year Filtering
    const filterButtons = document.querySelectorAll('.filter-btn');
    const blogCards = document.querySelectorAll('.blog-card');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            const year = button.getAttribute('data-year');
            
            // Filter blog cards
            blogCards.forEach(card => {
                if (year === 'all' || card.getAttribute('data-year') === year) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
    
    // Form Validation
    document.getElementById('order-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Simple validation
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const quantity = document.getElementById('quantity').value;
        const address = document.getElementById('address').value;
        
        if (name && email && phone && quantity > 0 && address) {
            // In a real application, you would send this data to a server
            alert(`¡Gracias por su pedido, ${name}! Hemos recibido su solicitud de ${quantity} cajones de frutillas. Nos pondremos en contacto pronto para confirmar su pedido.`);
            this.reset();
        } else {
            alert('Por favor, complete todos los campos obligatorios.');
        }
    });
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
                
                // Actualizar URL
                history.pushState(null, null, targetId);
            }
        });
    });
});
// En tu script.js o en el <script> de tu HTML:
const API_URL = 'https://fiesta-frutilla-backend.onrender.com';

// Función mejorada para enviar pedidos
async function enviarPedido(pedido) {
  try {
    const response = await fetch(`${API_URL}/pedidos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pedido)
    });
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error al enviar pedido:', error);
    throw error;
  }
}

// Función para verificar la conexión con el backend
async function verificarConexion() {
  try {
    const response = await fetch(`${API_URL}/health`);
    if (response.ok) {
      console.log('✅ Conexión con el backend exitosa');
      return true;
    }
  } catch (error) {
    console.error('❌ No se pudo conectar con el backend:', error);
    return false;
  }
}