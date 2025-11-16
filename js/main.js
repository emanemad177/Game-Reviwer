// 1. Game Class
// Represents a single game object and knows how to render its HTML card.
class Game {
    constructor(gameData) {
        this.title = gameData.title;
        this.thumbnail = gameData.thumbnail;
        this.short_description = gameData.short_description;
        this.genre = gameData.genre;
        this.platform = gameData.platform;
        this.game_url = gameData.game_url;
    }

    // Method to create the HTML string for the game card
    toHTML() {
        return `
            <div class="col-lg-3 col-md-4 col-sm-6 mb-4">
                <a href="${this.game_url}" target="_blank" class="text-decoration-none text-white">
                    <div class="card rounded-3 h-100 shadow-sm border border-secondary-subtle">
                        <img src="${this.thumbnail}" class="card-img-top p-3 rounded-5" alt="${this.title}">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <h6 class="card-title">${this.title}</h6>
                                <h6 class="p-1 px-2 rounded-2 freeLabel text-uppercase">Free</h6>
                            </div>
                            <p class="card-text text-center text-secondary">${this.short_description.slice(0, 50)}...</p>
                        </div>
                        <div class="card-footer bg-transparent border-0 pt-0 pb-3">
                            <div class="d-flex justify-content-between">
                                <h6 class="footer p-1 px-2 rounded-4 text-uppercase">${this.genre}</h6>
                                <h6 class="footer p-1 px-2 rounded-4">${this.platform}</h6>
                            </div>
                        </div>
                    </div>
                </a>
            </div>
        `;
    }
}

// ---

// 2. UI Class
// Handles all user interface logic: fetching data and displaying it.
class UI {
    constructor(containerSelector) {
        this.gamesContainer = document.querySelector(containerSelector);
        this.API_URL = 'https://free-to-play-games-database.p.rapidapi.com/api/games';
        
        // **UPDATED API OPTIONS WITH YOUR KEY**
        this.API_OPTIONS = {
            method: 'GET',
            headers: {
                'x-rapidapi-key': 'b2c8aa0dc4msh2600a36896a50cap15894djsn2f6da7ec6ac5',
                'x-rapidapi-host': 'free-to-play-games-database.p.rapidapi.com'
            }
        };

        // Initialize with the default category ('mmorpg' which is the first link)
        this.init('mmorpg');
    }

    // Main function to initialize data fetching and UI rendering
    async init(category) {
        // Clear any existing content and show a loading message
        this.clearGamesContainer();
        this.showLoading();

        try {
            const gamesData = await this.fetchGames(category);
            this.renderGames(gamesData);
        } catch (error) {
            // Check for potential API status codes, including 401
            let errorMessage = error.message;
            if (errorMessage.includes('401')) {
                errorMessage = 'Access denied. Please check your API key.';
            } else if (errorMessage.includes('404')) {
                errorMessage = 'API endpoint not found.';
            }
            this.showError(errorMessage);
        }
    }

    // Method to fetch data from the API
    async fetchGames(category) {
        // Use the 'tag' parameter which is common for filtering by genre/category
        const urlWithCategory = `${this.API_URL}?category=${category}`;
        const response = await fetch(urlWithCategory, this.API_OPTIONS);

        if (!response.ok) {
            // Throw an error with the status code
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    }

    // Method to render the fetched game data to the DOM
    renderGames(gamesData) {
        this.clearGamesContainer(); // Clear loading message

        if (!Array.isArray(gamesData) || gamesData.length === 0) {
            this.gamesContainer.innerHTML = '<div class="col-12"><p class="text-white text-center fs-4">No games found for this category.</p></div>';
            return;
        }

        let gameCardsHTML = '';
        gamesData.forEach(gameDataItem => {
            const game = new Game(gameDataItem);
            gameCardsHTML += game.toHTML();
        });

        // Insert all HTML into the container
        this.gamesContainer.innerHTML = gameCardsHTML;
    }

    // Helper methods for UI feedback
    showLoading() {
        this.gamesContainer.innerHTML = '<div class="col-12 text-center text-white"><p class="fs-3">Loading Games...</p><div class="spinner-border text-white" role="status"></div></div>';
    }

    showError(message) {
        this.gamesContainer.innerHTML = `<div class="col-12"><p class="text-danger text-center fs-4">Error loading data: ${message}</p></div>`;
    }

    clearGamesContainer() {
        if (this.gamesContainer) {
            this.gamesContainer.innerHTML = '';
        }
    }

    // Method to set up event listeners for the navigation links
    setupNavListeners() {
        const navLinks = document.querySelectorAll('.mynavebar .nav-link');
        navLinks.forEach(link => {
            // Set the first link as active initially
            if (link.textContent.toLowerCase() === 'mmorpg') {
                link.classList.add('active');
            }
            
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const category = e.target.textContent.toLowerCase();

                // Manage active state
                navLinks.forEach(l => l.classList.remove('active'));
                e.target.classList.add('active');

                // Load new games
                this.init(category);
            });
        });
    }
}

// ---

// 3. Application Initialization
document.addEventListener('DOMContentLoaded', () => {
    // Instantiate the UI class, passing the selector for the row element
    const appUI = new UI('.container.mt-5 .row');

    // Set up the event listeners for category switching
    appUI.setupNavListeners();
});