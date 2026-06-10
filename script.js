function renderArticles(items, page = 1) {
    if (!container) return;
    
    // Fade out before changing content
    container.style.opacity = '0';
    container.style.transition = 'opacity 0.3s ease';
    
    setTimeout(() => {
        container.innerHTML = "";
        
        const start = (page - 1) * articlesPerPage;
        const end = start + articlesPerPage;
        const paginatedItems = items.slice(start, end);

        if (paginatedItems.length === 0) {
            container.innerHTML = '<p style="text-align:center; padding: 2rem; font-family: Inter;">No se encontraron artículos que coincidan con su búsqueda.</p>';
            setTimeout(() => {
                container.style.opacity = '1';
            }, 100);
            return;
        }

        // Renderizar artículos con animación escalonada
        paginatedItems.forEach(([id, article], index) => {
            const post = document.createElement('article');
            post.className = 'legal-post';
            post.style.opacity = '0';
            post.style.transform = 'translateY(20px)';
            post.style.animationDelay = `${index * 0.1}s`; // Variable CSS animation delay
            
            // Animación escalonada
            post.style.transition = `opacity 0.5s ease ${index * 0.1}s, transform 0.5s ease ${index * 0.1}s`;
            
            // Limpiar HTML y extraer texto para excerpt
            const cleanContent = article.content.replace(/<[^>]*>/g, '');
            const excerpt = cleanContent.length > 200 ? cleanContent.substring(0, 200) + '...' : cleanContent;
            
            post.innerHTML = `
                <div class="post-header">
                    <span class="category">${article.category}</span>
                    <span class="post-date">${article.date}</span>
                </div>
                <h2 class="post-title">
                   <a href="articles.html?id=${id}">${article.title}</a>
                </h2>
                <p class="post-excerpt">
                    ${excerpt}
                </p>
                <a href="articles.html?id=${id}" class="read-more">Leer Análisis Completo &rarr;</a>
            `;
            
            container.appendChild(post);
            
            // Disparar animación
            setTimeout(() => {
                post.style.opacity = '1';
                post.style.transform = 'translateY(0)';
            }, 50 + (index * 100)); // 100ms entre cada artículo
        });
        
        // Fade in final
        setTimeout(() => {
            container.style.opacity = '1';
            updatePagination(items);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 500);
        
    }, 300); // Tiempo del fade out
}

// === PAGINACIÓN MEJORADA ===

function updatePagination(itemsToPaginate) {
    if (!paginationContainer) return;
    
    // Fade out de controles existentes
    paginationContainer.style.opacity = '0';
    paginationContainer.style.transition = 'opacity 0.3s ease';
    
    setTimeout(() => {
        paginationContainer.innerHTML = "";
        
        const totalPages = Math.ceil(itemsToPaginate.length / articlesPerPage);
        
        if (totalPages <= 1) {
            paginationContainer.style.opacity = '1';
            return;
        }
        
        // Crear contenedor de paginación
        paginationContainer.innerHTML = `
            <div style="display: flex; justify-content: center; gap: 0.5rem; flex-wrap: wrap;">
                <!-- Botón Previous -->
                ${currentPage > 1 ? `
                    <button class="page-link" onclick="changePage(${currentPage - 1})">Previous</button>
                ` : ''}
                
                <!-- Números de página -->
                ${Array.from({ length: totalPages }, (_, i) => {
                    const pageNum = i + 1;
                    const showPage = pageNum === 1 || 
                                   pageNum === totalPages || 
                                   (pageNum >= currentPage - 2 && pageNum <= currentPage + 2);
                    
                    if (!showPage) {
                        return pageNum === currentPage - 3 || pageNum === currentPage + 3 ? 
                               '<span>...</span>' : '';
                    }
                    
                    return `
                        <button class="page-link ${pageNum === currentPage ? 'active' : ''}" 
                                onclick="changePage(${pageNum})">${pageNum}</button>
                    `;
                }).join('')}
                
                <!-- Botón Next -->
                ${currentPage < totalPages ? `
                    <button class="page-link" onclick="changePage(${currentPage + 1})">Next</button>
                ` : ''}
            </div>
        `;
        
        // Fade in de nuevos controles
        setTimeout(() => {
            paginationContainer.style.opacity = '1';
        }, 100);
        
    }, 200);
}

// Variable global para página actual
let currentPage = 1;

function changePage(page) {
    if (page < 1 || page > Math.ceil(allArticles.length / articlesPerPage)) return;
    
    currentPage = page;
    renderArticles(Object.entries(allArticles), page);
}

// === MANEJO DE FORMULARIO DE CONTACTO ===

function handleContactForm(e) {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('.submit-btn') || e.target.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="loading-spinner"></span> Enviando...';
    }
    
    const formData = new FormData(e.target);
    
    // Simular envío
    setTimeout(() => {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Enviar Mensaje';
        }
        
        // Mostrar éxito
        const container = e.target.closest('.contact-form-container') || e.target.parentElement;
        if (container) {
            container.innerHTML = `
                <div class="form-success">
                    <div class="success-icon" style="font-size: 2rem; margin-bottom: 1rem;">✓</div>
                    <h2 style="margin-bottom: 1rem; font-family: 'Playfair Display', serif;">Mensaje Enviado</h2>
                    <p style="margin-bottom: 2rem;">Gracias por contactarnos. Un miembro de nuestro equipo responderá lo más pronto posible.</p>
                    <a href="#" class="read-more" onclick="window.location.reload()">Enviar Otro Mensaje</a>
                </div>
            `;
        }
    }, 2000);
}

// === UTILIDADES ===

// Función para filtrar artículos por categoría
function filterByCategory(category) {
    if (!category) {
        renderArticles(Object.entries(allArticles), 1);
        return;
    }
    
    const filtered = Object.entries(allArticles).filter(([id, article]) => 
        article.category === category
    );
    
    renderArticles(filtered, 1);
}

// Función de búsqueda mejorada
function searchArticles(query) {
    if (!query) {
        renderArticles(Object.entries(allArticles), 1);
        return;
    }
    
    const filtered = Object.entries(allArticles).filter(([id, article]) => {
        const searchableText = `${article.title} ${article.category} ${article.content}`.toLowerCase();
        return searchableText.includes(query.toLowerCase());
    });
    
    renderArticles(filtered, 1);
}
// Exportar funciones para uso global
window.renderArticles = renderArticles;
window.filterByCategory = filterByCategory;
window.searchArticles = searchArticles;

// Comprueba si la URL actual termina en .html
if (window.location.pathname.endsWith('.html')) {
    // Quita el '.html' de la ruta
    const cleanUrl = window.location.pathname.replace(/\.html$/, '');
    // Reemplaza la URL en la barra de direcciones sin recargar la página
    window.history.replaceState({}, '', cleanUrl);
}