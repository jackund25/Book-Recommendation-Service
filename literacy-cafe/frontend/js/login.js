// Form validation functions
const validations = {
    email: (value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value) return 'Email is required';
        if (!emailRegex.test(value)) return 'Please enter a valid email address';
        return '';
    },
    
    password: (value) => {
        if (!value) return 'Password is required';
        if (value.length < 8) return 'Password must be at least 8 characters';
        return '';
    }
};

// Handle form validation
function setupFormValidation() {
    const form = document.getElementById('loginForm');
    
    ['email', 'password'].forEach(fieldId => {
        const input = document.getElementById(fieldId);
        const validationSpan = document.getElementById(`${fieldId}Validation`);
        
        input.addEventListener('input', () => {
            const error = validations[fieldId](input.value);
            const formGroup = input.closest('.form-group');
            
            if (error) {
                formGroup.classList.add('error');
                validationSpan.textContent = error;
            } else {
                formGroup.classList.remove('error');
                validationSpan.textContent = '';
            }
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

// Handle remember me functionality
function setupRememberMe() {
    const rememberMe = document.getElementById('rememberMe');
    const emailInput = document.getElementById('email');
    
    // Check for saved email
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
        emailInput.value = savedEmail;
        rememberMe.checked = true;
    }
    
    rememberMe.addEventListener('change', () => {
        if (rememberMe.checked) {
            localStorage.setItem('rememberedEmail', emailInput.value);
        } else {
            localStorage.removeItem('rememberedEmail');
        }
    });
}

// Handle form submission
async function handleLogin(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitButton = form.querySelector('.login-btn');
    const errorMessage = document.getElementById('errorMessage');
    
    // Get form values
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Validate all fields
    let hasErrors = false;
    ['email', 'password'].forEach(fieldId => {
        const error = validations[fieldId](document.getElementById(fieldId).value);
        const formGroup = document.getElementById(fieldId).closest('.form-group');
        const validationSpan = document.getElementById(`${fieldId}Validation`);
        
        if (error) {
            formGroup.classList.add('error');
            validationSpan.textContent = error;
            hasErrors = true;
        }
    });
    
    if (hasErrors) return;
    
    // Show loading state
    submitButton.classList.add('loading');
    submitButton.disabled = true;
    submitButton.textContent = 'Logging in...';
    
    try {
        const formData = new URLSearchParams();
        formData.append('username', email);
        formData.append('password', password);
        
        const response = await fetch(APP_CONFIG.ENDPOINTS.LOGIN, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            },
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            // Save token
            localStorage.setItem(APP_CONFIG.TOKEN_KEY, data.access_token);
            
            // Save email if remember me is checked
            if (document.getElementById('rememberMe').checked) {
                localStorage.setItem('rememberedEmail', email);
            }
            
            // Show success message and redirect
            showMessage('Login successful! Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = './recommendations.html';
            }, 1500);
        } else {
            showMessage(data.detail || 'Login failed. Please check your credentials.', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showMessage(APP_CONFIG.DEFAULT_ERROR_MESSAGE, 'error');
    } finally {
        // Remove loading state
        submitButton.classList.remove('loading');
        submitButton.disabled = false;
        submitButton.textContent = 'Login';
    }
}

// Show message function
function showMessage(text, type = 'error') {
    const messageElement = document.getElementById('errorMessage');
    messageElement.textContent = text;
    messageElement.className = `${type}-message`;
    messageElement.style.display = 'block';
    
    if (type === 'success') {
        messageElement.style.backgroundColor = 'rgba(46, 204, 113, 0.1)';
        messageElement.style.color = '#2ecc71';
    } else {
        messageElement.style.backgroundColor = 'rgba(231, 76, 60, 0.1)';
        messageElement.style.color = '#e74c3c';
    }

    // Auto hide error messages after 5 seconds
    if (type === 'error') {
        setTimeout(() => {
            messageElement.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                messageElement.style.display = 'none';
                messageElement.style.animation = '';
            }, 300);
        }, 5000);
    }
}

// Add loading animation to button
function setLoadingState(button, isLoading) {
    if (isLoading) {
        button.classList.add('loading');
        button.disabled = true;
        button.dataset.originalText = button.textContent;
        button.textContent = 'Logging in...';
    } else {
        button.classList.remove('loading');
        button.disabled = false;
        button.textContent = button.dataset.originalText || 'Login';
    }
}

// Check if user is already logged in
function checkAuthStatus() {
    const token = localStorage.getItem(APP_CONFIG.TOKEN_KEY);
    if (token) {
        window.location.href = './recommendations.html';
    }
}

// Handle keyboard navigation
function setupKeyboardNavigation() {
    const form = document.getElementById('loginForm');
    const inputs = form.querySelectorAll('input');
    
    inputs.forEach((input, index) => {
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                const nextInput = inputs[index + 1];
                if (nextInput) {
                    nextInput.focus();
                } else {
                    form.querySelector('.login-btn').click();
                }
            }
        });
    });
}

// Add input animation effects
function setupInputEffects() {
    const inputs = document.querySelectorAll('.form-group input');
    
    inputs.forEach(input => {
        // Add focused class to parent when input is focused
        input.addEventListener('focus', () => {
            input.parentElement.classList.add('focused');
        });

        // Remove focused class when input loses focus
        input.addEventListener('blur', () => {
            input.parentElement.classList.remove('focused');
            // Also validate on blur
            const fieldId = input.id;
            if (validations[fieldId]) {
                const error = validations[fieldId](input.value);
                const validationSpan = document.getElementById(`${fieldId}Validation`);
                if (error) {
                    input.parentElement.classList.add('error');
                    validationSpan.textContent = error;
                }
            }
        });

        // Add has-value class when input has content
        input.addEventListener('input', () => {
            if (input.value) {
                input.classList.add('has-value');
            } else {
                input.classList.remove('has-value');
            }
        });
    });
}

// Initialize all event listeners and setup
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
    setupFormValidation();
    setupPasswordToggle();
    setupRememberMe();
    setupKeyboardNavigation();
    setupInputEffects();
    
    // Add form submission handler
    const form = document.getElementById('loginForm');
    form.addEventListener('submit', handleLogin);
    
    // Add paste event handler for email validation
    const emailInput = document.getElementById('email');
    emailInput.addEventListener('paste', (e) => {
        setTimeout(() => {
            const error = validations.email(emailInput.value);
            const validationSpan = document.getElementById('emailValidation');
            if (error) {
                emailInput.parentElement.classList.add('error');
                validationSpan.textContent = error;
            }
        }, 0);
    });
    
    // Add context menu prevention on password field
    const passwordInput = document.getElementById('password');
    passwordInput.addEventListener('contextmenu', e => e.preventDefault());
});