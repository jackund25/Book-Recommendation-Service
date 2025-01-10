// Menu Options Configuration
const menuOptions = {
    drinks: {
        Coffee: ['Espresso', 'Latte', 'Cappuccino', 'Americano', 'Mocha'],
        Tea: ['Green Tea', 'Earl Grey', 'Chamomile', 'Black Tea'],
        Others: ['Hot Chocolate', 'Smoothie', 'Fresh Juice']
    },
    foods: {
        Light: ['Salad', 'Sandwich', 'Croissant'],
        Heavy: ['Pasta', 'Rice Bowl', 'Burger'],
        Dessert: ['Cake', 'Cookie', 'Ice Cream']
    }
};

// State Management
let currentUser = null;
let currentRecommendations = [];
let availableGenres = new Set();

// Initialize the page
async function initializePage() {
    checkAuthentication();
    setupMenuHandlers();
    setupSortingAndFiltering();
    await loadUserPreferences();
}

// Authentication check
function checkAuthentication() {
    const token = localStorage.getItem(APP_CONFIG.TOKEN_KEY);
    if (!token) {
        window.location.href = './login.html';
        return;
    }
}

// User preferences management
async function loadUserPreferences() {
    try {
        const token = localStorage.getItem(APP_CONFIG.TOKEN_KEY);
        const response = await fetch(APP_CONFIG.ENDPOINTS.USER_PROFILE, {
            headers: {
                'Authorization': `${APP_CONFIG.AUTH_HEADER} ${token}`
            }
        });

        if (response.ok) {
            const userData = await response.json();
            currentUser = userData;
            displayPreferences(userData.reading_preferences);
        } else {
            showMessage('Failed to load user preferences', 'error');
        }
    } catch (error) {
        console.error('Error loading preferences:', error);
        showMessage('Error loading preferences', 'error');
    }
}

// Display user preferences
function displayPreferences(preferences) {
    const tagsContainer = document.getElementById('preferencesTags');
    tagsContainer.innerHTML = preferences.map(pref => 
        `<span class="preference-tag">${pref}</span>`
    ).join('');
}

// Setup menu handlers
function setupMenuHandlers() {
    // Drink selection handler
    document.getElementById('drink').addEventListener('change', (e) => {
        const drinkType = document.getElementById('drinkType');
        drinkType.innerHTML = '<option value="">Select drink type</option>';
        
        if (e.target.value && menuOptions.drinks[e.target.value]) {
            menuOptions.drinks[e.target.value].forEach(type => {
                drinkType.add(new Option(type, type));
            });
        }
    });

    // Food category handler
    document.getElementById('foodCategory').addEventListener('change', (e) => {
        const foodSelect = document.getElementById('food');
        foodSelect.innerHTML = '<option value="">Select food item</option>';
        
        if (e.target.value && menuOptions.foods[e.target.value]) {
            menuOptions.foods[e.target.value].forEach(food => {
                foodSelect.add(new Option(food, food));
            });
        }
    });

    // Form submission handler
    document.getElementById('orderForm').addEventListener('submit', handleOrderSubmission);
}

// Handle order submission
async function handleOrderSubmission(e) {
    e.preventDefault();
    
    const orderDetails = {
        drink: document.getElementById('drink').value,
        drink_type: document.getElementById('drinkType').value,
        food_category: document.getElementById('foodCategory').value,
        food: document.getElementById('food').value
    };

    setLoadingState(true);
    
    try {
        const token = localStorage.getItem(APP_CONFIG.TOKEN_KEY);
        const response = await fetch(APP_CONFIG.ENDPOINTS.RECOMMENDATIONS, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${APP_CONFIG.AUTH_HEADER} ${token}`
            },
            body: JSON.stringify(orderDetails)
        });

        const data = await response.json();

        if (response.ok) {
            currentRecommendations = data;
            updateAvailableGenres(data);
            displayRecommendations(data);
            document.getElementById('resultsSection').style.display = 'block';
            document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
        } else {
            showMessage(data.detail || 'Failed to get recommendations', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('An error occurred while getting recommendations', 'error');
    } finally {
        setLoadingState(false);
    }
}

// Update available genres from recommendations
function updateAvailableGenres(books) {
    availableGenres.clear();
    books.forEach(book => {
        book.genres.forEach(genre => availableGenres.add(genre));
    });
    
    updateGenreFilter();
}

// Update genre filter options
function updateGenreFilter() {
    const filterSelect = document.getElementById('filterGenre');
    filterSelect.innerHTML = '<option value="">All Genres</option>';
    
    Array.from(availableGenres).sort().forEach(genre => {
        filterSelect.add(new Option(genre, genre));
    });
}

// Setup sorting and filtering
function setupSortingAndFiltering() {
    document.getElementById('sortBy').addEventListener('change', applyFiltersAndSort);
    document.getElementById('filterGenre').addEventListener('change', applyFiltersAndSort);
}

// Apply filters and sorting
function applyFiltersAndSort() {
    if (!currentRecommendations.length) return;

    const sortBy = document.getElementById('sortBy').value;
    const filterGenre = document.getElementById('filterGenre').value;
    
    let filteredBooks = [...currentRecommendations];
    
    // Apply genre filter
    if (filterGenre) {
        filteredBooks = filteredBooks.filter(book => 
            book.genres.includes(filterGenre)
        );
    }
    
    // Apply sorting
    filteredBooks.sort((a, b) => {
        switch(sortBy) {
            case 'rating':
                return b.rating - a.rating;
            case 'readingTime':
                return a.estimated_reading_time - b.estimated_reading_time;
            case 'popularity':
                return b.popularity - a.popularity;
            default:
                return 0;
        }
    });
    
    displayRecommendations(filteredBooks);
}

// Display recommendations
function displayRecommendations(books) {
    const grid = document.getElementById('recommendationsGrid');
    grid.innerHTML = '';

    if (books.length === 0) {
        grid.innerHTML = '<p class="no-results">No books found matching your criteria.</p>';
        return;
    }

    books.forEach(book => {
        const card = createBookCard(book);
        grid.appendChild(card);
    });
}

// Create book card element
function createBookCard(book) {
    const card = document.createElement('div');
    card.className = 'book-card';
    
    card.innerHTML = `
        <div class="book-info">
            <h3 class="book-title">${book.title}</h3>
            <p class="book-author">by ${book.author}</p>
            <p class="book-description">${book.description || 'No description available.'}</p>
            <div class="book-meta">
                <span>${book.page_count} pages</span>
                <span>~${book.estimated_reading_time} min read</span>
                <span>★ ${book.rating.toFixed(1)}</span>
            </div>
            <div class="book-genres">
                ${book.genres.map(genre => 
                    `<span class="genre-tag">${genre}</span>`
                ).join('')}
            </div>
        </div>
    `;
    
    return card;
}

// Show message function
function showMessage(text, type = 'error') {
    const messageElement = document.getElementById('errorMessage');
    messageElement.textContent = text;
    messageElement.className = `message ${type}-message`;
    messageElement.style.display = 'block';

    setTimeout(() => {
        messageElement.style.opacity = '0';
        setTimeout(() => {
            messageElement.style.display = 'none';
            messageElement.style.opacity = '1';
        }, 300);
    }, 5000);
}

// Set loading state
function setLoadingState(isLoading) {
    const loadingState = document.getElementById('loadingState');
    const resultsSection = document.getElementById('resultsSection');
    
    loadingState.style.display = isLoading ? 'block' : 'none';
    if (isLoading) {
        resultsSection.style.display = 'none';
    }
}

// Logout function
function logout() {
    localStorage.removeItem(APP_CONFIG.TOKEN_KEY);
    window.location.href = './';
}

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', initializePage);