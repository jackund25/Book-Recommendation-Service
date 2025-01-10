// Check authentication status
function checkAuth() {
    const token = localStorage.getItem('token');
    const authButtons = document.getElementById('authButtons');
    const mainCTA = document.getElementById('mainCTA');
    
    if (token) {
        authButtons.innerHTML = `
            <a href="./recommendations.html" class="auth-btn">My Books</a>
        `;
        mainCTA.href = './recommendations.html';
        mainCTA.textContent = 'View Recommendations';
    }
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    window.location.href = './';
}

// Mobile navigation toggle
function initMobileNav() {
    const navLinks = document.getElementById('navLinks');
    const hamburger = document.createElement('button');
    hamburger.classList.add('hamburger');
    hamburger.innerHTML = '☰';
    
    document.querySelector('.nav-content').appendChild(hamburger);
    
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
}

// Smooth scroll for navigation
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Add scroll animations
function initScrollAnimations() {
    const featureCards = document.querySelectorAll('.feature-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1
    });

    featureCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(card);
    });
}

// Initialize all functions when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    initMobileNav();
    initSmoothScroll();
    initScrollAnimations();
});