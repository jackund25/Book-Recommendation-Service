// Constants and Configurations
const PRODUCTION_URL = 'https://literacy-cafe-production.up.railway.app';
// const LOCAL_URL = 'http://127.0.0.1:8000';

// Use LOCAL_URL for development, PRODUCTION_URL for production
const BASE_URL = PRODUCTION_URL;

let authToken = '';

// API Endpoints
const ENDPOINTS = {
    register: `${BASE_URL}/api/v1/auth/register`,
    login: `${BASE_URL}/api/v1/auth/login`,
    recommendations: `${BASE_URL}/api/v1/recommendations/books`
};

// Genre List Configuration
const genres = [
    "Fiction", "Non-Fiction", "Mystery", "Thriller", "Romance", 
    "Science Fiction", "Fantasy", "Horror", "Biography", 
    "History", "Self-Help", "Business", "Philosophy",
    "Poetry", "Drama", "Adventure", "Children's Books",
    "Young Adult", "Classical Literature", "Contemporary Fiction"
];

// Fetch Options Configuration
const defaultFetchOptions = {
    mode: 'cors',
    credentials: 'omit',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
};

// UI Elements
const UI = {
    forms: {
        register: document.getElementById('registerForm'),
        login: document.getElementById('loginForm'),
        recommendations: document.getElementById('recommendationForm')
    },
    inputs: {
        regEmail: document.getElementById('regEmail'),
        regPassword: document.getElementById('regPassword'),
        regFullName: document.getElementById('regFullName'),
        loginEmail: document.getElementById('loginEmail'),
        loginPassword: document.getElementById('loginPassword'),
        drinkType: document.getElementById('drinkType'),
        foodCategory: document.getElementById('foodCategory')
    },
    messages: {
        messageBox: document.getElementById('messageBox'),
        errorBox: document.getElementById('errorBox')
    },
    results: {
        section: document.getElementById('resultsSection'),
        container: document.getElementById('recommendationResults')
    },
    buttons: {
        recommendations: document.getElementById('testRecommendations')
    }
};

// Utility Functions
function showMessage(message, isError = false) {
    const { messageBox, errorBox } = UI.messages;
    
    if (isError) {
        errorBox.textContent = message;
        errorBox.classList.remove('hidden');
        messageBox.classList.add('hidden');
        console.error('Error:', message);
    } else {
        messageBox.textContent = message;
        messageBox.classList.remove('hidden');
        errorBox.classList.add('hidden');
        console.log('Success:', message);
    }
    
    setTimeout(() => {
        messageBox.classList.add('hidden');
        errorBox.classList.add('hidden');
    }, 5000);
}

function getSelectedGenres() {
    const checkboxes = document.querySelectorAll('input[name="genres"]:checked');
    return Array.from(checkboxes).map(cb => cb.value);
}

// Initialize Functions
function initializeGenres() {
    const genreContainer = document.getElementById('genrePreferences');
    if (!genreContainer) return;

    genres.forEach(genre => {
        const div = document.createElement('div');
        div.className = 'genre-checkbox';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `genre-${genre.toLowerCase().replace(/\s+/g, '-')}`;
        checkbox.value = genre;
        checkbox.name = 'genres';
        
        const label = document.createElement('label');
        label.htmlFor = checkbox.id;
        label.textContent = genre;
        
        div.appendChild(checkbox);
        div.appendChild(label);
        genreContainer.appendChild(div);
    });
}

// API Functions
async function registerUser(userData) {
    try {
        const response = await fetch(ENDPOINTS.register, {
            ...defaultFetchOptions,
            method: 'POST',
            body: JSON.stringify(userData)
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.detail || 'Registration failed');
        
        return data;
    } catch (error) {
        throw new Error(`Registration error: ${error.message}`);
    }
}

async function loginUser(credentials) {
    try {
        const formData = new URLSearchParams(credentials);
        const response = await fetch(ENDPOINTS.login, {
            ...defaultFetchOptions,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            },
            body: formData
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.detail || 'Login failed');
        
        return data;
    } catch (error) {
        throw new Error(`Login error: ${error.message}`);
    }
}

async function getRecommendations(orderDetails) {
    try {
        const response = await fetch(ENDPOINTS.recommendations, {
            ...defaultFetchOptions,
            method: 'POST',
            headers: {
                ...defaultFetchOptions.headers,
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(orderDetails)
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.detail || 'Failed to get recommendations');
        
        return data;
    } catch (error) {
        throw new Error(`Recommendation error: ${error.message}`);
    }
}

// Event Handlers
UI.forms.register.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const selectedGenres = getSelectedGenres();
    if (selectedGenres.length === 0) {
        showMessage('Please select at least one genre preference', true);
        return;
    }

    try {
        await registerUser({
            email: UI.inputs.regEmail.value,
            password: UI.inputs.regPassword.value,
            full_name: UI.inputs.regFullName.value,
            reading_preferences: selectedGenres
        });
        
        showMessage('Registration successful! Please login.');
        UI.forms.register.reset();
    } catch (error) {
        showMessage(error.message, true);
    }
});

UI.forms.login.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    try {
        const data = await loginUser({
            username: UI.inputs.loginEmail.value,
            password: UI.inputs.loginPassword.value
        });
        
        authToken = data.access_token;
        showMessage('Login successful! You can now test recommendations.');
        UI.forms.login.reset();
        UI.buttons.recommendations.disabled = false;
    } catch (error) {
        showMessage(error.message, true);
    }
});

UI.forms.recommendations.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!authToken) {
        showMessage('Please login first', true);
        return;
    }

    try {
        const selectedDrink = UI.inputs.drinkType.options[UI.inputs.drinkType.selectedIndex];
        const selectedFood = UI.inputs.foodCategory.options[UI.inputs.foodCategory.selectedIndex];
        
        const recommendations = await getRecommendations({
            drink: selectedDrink.parentElement.label,
            drink_type: selectedDrink.text,
            food: selectedFood.text,
            food_category: selectedFood.parentElement.label
        });
        
        displayRecommendations(recommendations);
    } catch (error) {
        showMessage(error.message, true);
    }
});

// Display Functions
function displayRecommendations(books) {
    if (!Array.isArray(books) || books.length === 0) {
        UI.results.container.innerHTML = '<p>No recommendations found</p>';
        return;
    }

    UI.results.section.classList.remove('hidden');
    UI.results.container.innerHTML = '';

    books.forEach((book) => {
        const bookElement = document.createElement('div');
        bookElement.className = 'book-recommendation';
        bookElement.innerHTML = `
            <h3>${book.title || 'Untitled'}</h3>
            <p><strong>Author:</strong> ${book.author || 'Unknown'}</p>
            <p><strong>Genres:</strong> ${(book.genres || []).join(', ') || 'Not specified'}</p>
            ${book.description ? `<p><strong>Description:</strong> ${book.description}</p>` : ''}
            <p><strong>Rating:</strong> ${book.rating || 'N/A'}/5</p>
        `;
        UI.results.container.appendChild(bookElement);
    });

    UI.results.section.scrollIntoView({ behavior: 'smooth' });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeGenres();
    console.log('API Tester initialized with BASE_URL:', BASE_URL);
});