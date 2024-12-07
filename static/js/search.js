class MagicianSearch {
    constructor() {
        this.searchInput = document.getElementById('search-input');
        this.searchResults = document.getElementById('search-results');
        this.debounceTimer = null;
        this.magiciansData = null;
        
        this.init();
    }

    async init() {
        // Load magicians data
        try {
            const response = await fetch('/data/magicians.json');
            this.magiciansData = await response.json();
            this.setupEventListeners();
        } catch (error) {
            console.error('Error loading magicians data:', error);
        }
    }

    setupEventListeners() {
        this.searchInput.addEventListener('input', () => {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(() => {
                this.performSearch();
            }, 300);
        });
    }

    performSearch() {
        const query = this.searchInput.value.toLowerCase();
        if (!query) {
            this.searchResults.innerHTML = '';
            return;
        }

        const results = this.magiciansData.magicians.filter(magician => {
            return (
                magician.name.toLowerCase().includes(query) ||
                magician.location.city.toLowerCase().includes(query) ||
                magician.services.some(service => 
                    service.toLowerCase().includes(query)
                )
            );
        });

        this.displayResults(results);
    }

    displayResults(results) {
        if (!results.length) {
            this.searchResults.innerHTML = '<p>No magicians found</p>';
            return;
        }

        const html = results.map(magician => `
            <div class="search-result-card">
                <h3>${magician.name}</h3>
                <p>${magician.location.city}, ${magician.location.state}</p>
                <p>${magician.services.join(', ')}</p>
                <a href="/magicians/${magician.location.city.toLowerCase()}-${magician.location.state.toLowerCase()}.html#${magician.id}">
                    View Profile
                </a>
            </div>
        `).join('');

        this.searchResults.innerHTML = html;
    }
}
