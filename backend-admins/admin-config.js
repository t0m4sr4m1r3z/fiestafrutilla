const API_BASE = '/.netlify/functions';

class AdminConfig {
    static async login(username, password) {
        try {
            const response = await fetch(`${API_BASE}/admin-login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            return await response.json();
        } catch (error) {
            console.error('Error en login:', error);
            return { success: false, message: 'Error de conexión' };
        }
    }

    static async getDashboardData() {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`${API_BASE}/admin-dashboard`, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return await response.json();
        } catch (error) {
            console.error('Error obteniendo dashboard:', error);
            return { error: 'Error de conexión' };
        }
    }

    static async getBlogs() {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`${API_BASE}/admin-blogs`, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return await response.json();
        } catch (error) {
            console.error('Error obteniendo blogs:', error);
            return { error: 'Error de conexión' };
        }
    }

    static async createBlog(blogData) {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`${API_BASE}/admin-blogs`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(blogData)
            });
            return await response.json();
        } catch (error) {
            console.error('Error creando blog:', error);
            return { error: 'Error de conexión' };
        }
    }

    static async updateBlog(id, blogData) {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`${API_BASE}/admin-blogs`, {
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id, ...blogData })
            });
            return await response.json();
        } catch (error) {
            console.error('Error actualizando blog:', error);
            return { error: 'Error de conexión' };
        }
    }

    static async deleteBlog(id) {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`${API_BASE}/admin-blogs`, {
                method: 'DELETE',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id })
            });
            return await response.json();
        } catch (error) {
            console.error('Error eliminando blog:', error);
            return { error: 'Error de conexión' };
        }
    }

    static async uploadImage(imageFile) {
        try {
            const token = localStorage.getItem('adminToken');
            const formData = new FormData();
            formData.append('image', imageFile);

            const response = await fetch(`${API_BASE}/upload-image`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
            return await response.json();
        } catch (error) {
            console.error('Error subiendo imagen:', error);
            return { error: 'Error de conexión' };
        }
    }
}

// Event listener para el formulario de login
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            const result = await AdminConfig.login(username, password);
            if (result.success) {
                // Guardar token en localStorage
                localStorage.setItem('adminToken', result.token);
                localStorage.setItem('adminUser', JSON.stringify(result.user));
                
                // Redirigir al dashboard
                window.location.href = '/admin-dashboard.html';
            } else {
                alert('Error: ' + (result.message || 'Credenciales incorrectas'));
            }
        });
    }

    // Verificar si ya está logueado al cargar otras páginas
    const token = localStorage.getItem('adminToken');
    if (!token && !window.location.pathname.includes('admin.html')) {
        window.location.href = '/admin.html';
    }
});

// Función para cerrar sesión
function logout() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    window.location.href = '/admin.html';
}

// Función para verificar autenticación
function checkAuth() {
    const token = localStorage.getItem('adminToken');
    if (!token) {
        window.location.href = '/admin.html';
        return false;
    }
    return true;
}