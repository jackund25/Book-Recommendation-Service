// Form validation functions
const validations = {
    fullName: (value) => {
        if (value.length < 3) return 'Name must be at least 3 characters long';
        if (value.length > 50) return 'Name must be less than 50 characters';
        if (!/^[a-zA-Z\s]*$/.test(value)) return 'Name can only contain letters and spaces';
        return '';
    },
    
    email: (value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return 'Please enter a valid email address';
        return '';
    },
    
    password: (value) => {
        if (value.length < 8) return 'Password must be at least 8 characters long';
        if (!/[A-Z]/.test(value)) return 'Password must contain at least one uppercase letter';
        if (!/[a-z]/.test(value)) return 'Password must contain at least one lowercase letter';
        if (!/[0-9]/.test(value)) return 'Password must contain at least one number';
        return '';
    }
};

// Handle form input validation
function setupFormValidation() {
    const form = document.getElementById('registerForm');
    
    // Real-time validation for each input
    ['fullName', 'email', 'password'].forEach(fieldId => {
        const input = document.getElementById(fieldId);
        const validationSpan = document.getElementById(`${fieldId}Validation`);
        
        input.addEventListener('input', () => {
            const error = validations[fieldId](input.value);
            validationSpan.textContent = error;
            input.setAttribute('aria-invalid', error ? 'true' : 'false');
        });
    });
}

// Toggle password visibility
function setupPasswordToggle() {
    const toggleBtn = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    
    toggleBtn.addEventListener('click', () => {
        const type = passwordInput.type === 'password' ? 'text' : 'password';
        passwordInput.type = type;
        toggleBtn.querySelector('.eye-icon').textContent = type === 'password' ? '👁️' : '👁️‍🗨️';
    });
}

// Handle form submission
async function handleRegistration(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitButton = form.querySelector('.register-btn');
    const errorMessage = document.getElementById('errorMessage');
    
    // Get form values
    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const preferences = [...form.querySelectorAll('input[type="checkbox"]:checked')]
        .map(cb => cb.value);
    
    // Validate all fields
    let hasErrors = false;
    ['fullName', 'email', 'password'].forEach(fieldId => {
        const error = validations[fieldId](document.getElementById(fieldId).value);
        document.getElementById(`${fieldId}Validation`).textContent = error;
        if (error) hasErrors = true;
    });
    
    // Validate preferences
    if (preferences.length === 0) {
        document.getElementById('preferencesValidation').textContent = 'Please select at least one reading preference';
        hasErrors = true;
    } else {
        document.getElementById('preferencesValidation').textContent = '';
    }
    
    if (hasErrors) return;
    
    // Show loading state
    submitButton.classList.add('loading');
    submitButton.disabled = true;
    
    try {
        const response = await fetch(APP_CONFIG.ENDPOINTS.REGISTER, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                full_name: fullName,
                email,
                password,
                reading_preferences: preferences
            })
        });

        const data = await response.json();

        if (response.ok) {
            // Show success message
            showMessage('Registration successful! Redirecting to login...', 'success');
            
            // Redirect to login page after 2 seconds
            setTimeout(() => {
                window.location.href = '/login.html';
            }, 2000);
        } else {
            showMessage(data.detail || 'Registration failed. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showMessage(APP_CONFIG.DEFAULT_ERROR_MESSAGE, 'error');
    } finally {
        // Remove loading state
        submitButton.classList.remove('loading');
        submitButton.disabled = false;
    }
}

// Show message function
function showMessage(text, type = 'error') {
    const messageElement = document.createElement('div');
    messageElement.className = `${type}-message`;
    messageElement.textContent = text;
    
    // Remove any existing messages
    const existingMessages = document.querySelectorAll('.error-message, .success-message');
    existingMessages.forEach(msg => msg.remove());
    
    // Insert new message after the logo section
    const logoSection = document.querySelector('.logo-section');
    logoSection.insertAdjacentElement('afterend', messageElement);
    
    // Add animation
    messageElement.style.animation = 'slideDown 0.3s ease';
    
    // Auto remove success messages after 5 seconds
    if (type === 'success') {
        setTimeout(() => {
            messageElement.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => messageElement.remove(), 300);
        }, 5000);
    }
}

// Add password strength indicator
function setupPasswordStrengthIndicator() {
    const passwordInput = document.getElementById('password');
    const strengthIndicator = document.createElement('div');
    strengthIndicator.className = 'password-strength';
    passwordInput.parentElement.appendChild(strengthIndicator);
    
    passwordInput.addEventListener('input', () => {
        const strength = calculatePasswordStrength(passwordInput.value);
        updateStrengthIndicator(strengthIndicator, strength);
    });
}

// Calculate password strength
function calculatePasswordStrength(password) {
    let score = 0;
    
    // Length check
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    
    // Character type checks
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    
    // Return strength level
    if (score <= 2) return 'weak';
    if (score <= 4) return 'medium';
    return 'strong';
}

// Update strength indicator
function updateStrengthIndicator(indicator, strength) {
    const colors = {
        weak: '#e74c3c',
        medium: '#f39c12',
        strong: '#2ecc71'
    };
    
    indicator.style.backgroundColor = colors[strength];
    indicator.style.width = `${(strength === 'weak' ? 33 : strength === 'medium' ? 66 : 100)}%`;
    indicator.setAttribute('data-strength', strength);
}

// Initialize the registration page
document.addEventListener('DOMContentLoaded', () => {
    setupFormValidation();
    setupPasswordToggle();
    setupPasswordStrengthIndicator();
    
    // Add form submission handler
    const form = document.getElementById('registerForm');
    form.addEventListener('submit', handleRegistration);
    
    // Add smooth transitions for form inputs
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('focus', () => input.parentElement.classList.add('focused'));
        input.addEventListener('blur', () => input.parentElement.classList.remove('focused'));
    });
    
    // Add preference selection animation
    const preferences = document.querySelectorAll('.preference-item');
    preferences.forEach(pref => {
        pref.addEventListener('change', (e) => {
            const checkbox = e.target;
            if (checkbox.checked) {
                pref.style.animation = 'selected 0.3s ease';
            }
        });
    });
});