const API_BASE = '/.netlify/functions';

class AdminConfig {
    static async login(username, password) {
        try {
            const response = await fetch(`${API_BASE}/admin-login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error en login:', error);
            return { success: false, message: 'Error de conexión' };
        }
    }

    static async getDashboardData() {
        try {
            const token = localStorage.getItem('adminToken');
            if (!token) {
                return { error: 'No hay token de autenticación' };
            }

            const response = await fetch(`${API_BASE}/admin-dashboard`, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('adminToken');
                    localStorage.removeItem('adminUser');
                    window.location.href = '/admin.html';
                    return { error: 'Sesión expirada' };
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error obteniendo dashboard:', error);
            return { error: 'Error de conexión' };
        }
    }

    static async getBlogs() {
        try {
            const token = localStorage.getItem('adminToken');
            if (!token) {
                return { error: 'No hay token de autenticación' };
            }

            const response = await fetch(`${API_BASE}/admin-blogs`, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('adminToken');
                    localStorage.removeItem('adminUser');
                    window.location.href = '/admin.html';
                    return { error: 'Sesión expirada' };
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error obteniendo blogs:', error);
            return { error: 'Error de conexión' };
        }
    }

    static async createBlog(blogData) {
        try {
            const token = localStorage.getItem('adminToken');
            if (!token) {
                return { error: 'No hay token de autenticación' };
            }

            const response = await fetch(`${API_BASE}/admin-blogs`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(blogData)
            });

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('adminToken');
                    localStorage.removeItem('adminUser');
                    window.location.href = '/admin.html';
                    return { error: 'Sesión expirada' };
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error creando blog:', error);
            return { error: 'Error de conexión' };
        }
    }

    static async updateBlog(id, blogData) {
        try {
            const token = localStorage.getItem('adminToken');
            if (!token) {
                return { error: 'No hay token de autenticación' };
            }

            const response = await fetch(`${API_BASE}/admin-blogs`, {
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id, ...blogData })
            });

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('adminToken');
                    localStorage.removeItem('adminUser');
                    window.location.href = '/admin.html';
                    return { error: 'Sesión expirada' };
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error actualizando blog:', error);
            return { error: 'Error de conexión' };
        }
    }

    static async deleteBlog(id) {
        try {
            const token = localStorage.getItem('adminToken');
            if (!token) {
                return { error: 'No hay token de autenticación' };
            }

            const response = await fetch(`${API_BASE}/admin-blogs`, {
                method: 'DELETE',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id })
            });

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('adminToken');
                    localStorage.removeItem('adminUser');
                    window.location.href = '/admin.html';
                    return { error: 'Sesión expirada' };
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error eliminando blog:', error);
            return { error: 'Error de conexión' };
        }
    }

    static async uploadImage(imageFile) {
        try {
            const token = localStorage.getItem('adminToken');
            if (!token) {
                return { error: 'No hay token de autenticación' };
            }

            const formData = new FormData();
            formData.append('image', imageFile);

            const response = await fetch(`${API_BASE}/upload-image`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('adminToken');
                    localStorage.removeItem('adminUser');
                    window.location.href = '/admin.html';
                    return { error: 'Sesión expirada' };
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error subiendo imagen:', error);
            return { error: 'Error de conexión' };
        }
    }
}

// Función para renderizar blogs (debe estar en el contexto adecuado)
function renderBlogs(blogs) {
    const blogsList = document.getElementById('blogsList');
    if (!blogsList) return;

    blogsList.innerHTML = blogs.map(blog => `
        <div class="blog-item">
            <div class="blog-info">
                <h3>${blog.titulo}</h3>
                <div class="blog-meta">
                    <strong>Autor:</strong> ${blog.autor} | 
                    <strong>Fecha:</strong> ${new Date(blog.fecha_publicacion).toLocaleDateString()} |
                    <strong>Estado:</strong> ${blog.estado || 'activo'}
                </div>
            </div>
            <div class="blog-actions">
                <a href="/blog-dynamic.html?id=${blog.id}" target="_blank" class="btn-edit">Ver</a>
                <button class="btn-delete" onclick="deleteBlog(${blog.id})">Eliminar</button>
            </div>
        </div>
    `).join('');
}

// Función para eliminar blog (debe estar en el ámbito global)
async function deleteBlog(id) {
    if (!confirm('¿Estás seguro de que quieres eliminar este blog?')) {
        return;
    }

    const result = await AdminConfig.deleteBlog(id);
    if (result.error) {
        alert('Error: ' + result.error);
    } else {
        alert('Blog eliminado correctamente');
        // Recargar la lista de blogs
        loadBlogs();
    }
}

// Función para cargar blogs
async function loadBlogs() {
    if (!checkAuth()) return;

    const result = await AdminConfig.getBlogs();
    if (result.error) {
        alert('Error: ' + result.error);
    } else {
        renderBlogs(result.blogs || result);
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
                localStorage.setItem('adminToken', result.token);
                localStorage.setItem('adminUser', JSON.stringify(result.user));
                window.location.href = '/admin-dashboard.html';
            } else {
                alert('Error: ' + (result.message || 'Credenciales incorrectas'));
            }
        });
    }

    // Verificar autenticación en páginas protegidas
    const protectedPages = ['admin-dashboard.html', 'admin-blogs.html'];
    const currentPage = window.location.pathname.split('/').pop();
    
    if (protectedPages.includes(currentPage)) {
        checkAuth();
        
        // Cargar datos específicos de cada página
        if (currentPage === 'admin-blogs.html') {
            loadBlogs();
        } else if (currentPage === 'admin-dashboard.html') {
            loadDashboardData();
        }
    }
});

// Función para cargar datos del dashboard
async function loadDashboardData() {
    if (!checkAuth()) return;

    const result = await AdminConfig.getDashboardData();
    if (result.error) {
        alert('Error: ' + result.error);
    } else {
        // Aquí procesarías los datos del dashboard
        console.log('Datos del dashboard:', result);
    }
}

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