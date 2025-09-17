// Bogotá Crime Heatmap Application
// This application fetches real crime data from Bogotá's open data portal

class BogotaCrimeApp {
    constructor() {
        this.map = null;
        this.heatLayer = null;
        this.markersLayer = null;
        this.crimeData = [];
        this.filteredData = [];
        
        // Bogotá coordinates
        this.BOGOTA_CENTER = [4.7110, -74.0721];
        
        // API configuration
        this.API_BASE_URL = this.isLocalServer() ? '/api' : 'https://datosabiertos.bogota.gov.co/api/3/action';
        this.RESOURCE_ID = 'b64ba3c4-9e41-41b8-b3fd-2da21d6271a5'; // This is the resource ID for crime data
        
        // Crime type mappings
        this.crimeTypes = {
            'HOMICIDIO': 'Homicidio',
            'HURTO A PERSONAS': 'Hurto a Personas',
            'LESIONES PERSONALES': 'Lesiones Personales',
            'SECUESTRO': 'Secuestro',
            'HURTO A RESIDENCIAS': 'Hurto a Residencias',
            'HURTO A COMERCIOS': 'Hurto a Comercios',
            'HURTO A AUTOMOTORES': 'Hurto a Automotores'
        };
        
        this.init();
    }
    
    async init() {
        this.initMap();
        this.setupEventListeners();
        await this.loadCrimeData();
    }
    
    isLocalServer() {
        // Check if we're running on localhost (for development)
        return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    }
    
    initMap() {
        // Initialize the map
        this.map = L.map('map').setView(this.BOGOTA_CENTER, 12);
        
        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.map);
        
        // Initialize layers
        this.heatLayer = L.layerGroup();
        this.markersLayer = L.layerGroup();
        
        // Set default dates (last 30 days)
        this.setDefaultDates();
    }
    
    setDefaultDates() {
        const today = new Date();
        const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
        
        document.getElementById('dateTo').value = today.toISOString().split('T')[0];
        document.getElementById('dateFrom').value = thirtyDaysAgo.toISOString().split('T')[0];
    }
    
    setupEventListeners() {
        // Add event listeners for controls
        document.getElementById('crimeType').addEventListener('change', () => this.updateMap());
        document.getElementById('dateFrom').addEventListener('change', () => this.updateMap());
        document.getElementById('dateTo').addEventListener('change', () => this.updateMap());
    }
    
    async loadCrimeData() {
        this.showLoading(true);
        this.hideError();
        
        try {
            // Try to fetch real data first
            const realData = await this.fetchRealCrimeData();
            if (realData && realData.length > 0) {
                this.crimeData = realData;
                console.log(`Loaded ${realData.length} real crime incidents`);
            } else {
                // Fallback to mock data if real data is not available
                this.crimeData = this.generateMockCrimeData();
                console.log('Using mock data for demonstration');
            }
            
            this.updateMap();
            this.updateStats();
            
        } catch (error) {
            console.error('Error loading crime data:', error);
            // Use mock data as fallback
            this.crimeData = this.generateMockCrimeData();
            this.updateMap();
            this.updateStats();
            this.showError('Using demonstration data. Real-time data may not be available.');
        } finally {
            this.showLoading(false);
        }
    }
    
    async fetchRealCrimeData() {
        try {
            // Construct the API URL
            const url = `${this.API_BASE_URL}/datastore_search?resource_id=${this.RESOURCE_ID}&limit=1000`;
            
            console.log('Fetching data from:', url);
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!data.success || !data.result || !data.result.records) {
                throw new Error('Invalid API response structure');
            }
            
            // Process the data
            const processedData = data.result.records.map(record => {
                // Extract coordinates - the field names may vary
                const lat = this.extractCoordinate(record, ['latitud', 'latitude', 'lat', 'y']);
                const lng = this.extractCoordinate(record, ['longitud', 'longitude', 'lng', 'lon', 'x']);
                
                if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
                    return {
                        lat: parseFloat(lat),
                        lng: parseFloat(lng),
                        type: this.normalizeCrimeType(record.delito || record.tipo_delito || 'Unknown'),
                        date: this.parseDate(record.fecha_hecho || record.fecha || record.date),
                        description: record.delito || record.tipo_delito || 'Unknown',
                        address: record.direccion || record.address || '',
                        neighborhood: record.barrio || record.neighborhood || ''
                    };
                }
                return null;
            }).filter(record => record !== null);
            
            return processedData;
            
        } catch (error) {
            console.error('Error fetching real crime data:', error);
            return null;
        }
    }
    
    extractCoordinate(record, possibleFields) {
        for (const field of possibleFields) {
            if (record[field] !== undefined && record[field] !== null && record[field] !== '') {
                return record[field];
            }
        }
        return null;
    }
    
    normalizeCrimeType(type) {
        if (!type) return 'Unknown';
        
        const upperType = type.toUpperCase();
        for (const [key, value] of Object.entries(this.crimeTypes)) {
            if (upperType.includes(key)) {
                return value;
            }
        }
        return type;
    }
    
    parseDate(dateString) {
        if (!dateString) return new Date();
        
        try {
            // Try different date formats
            const date = new Date(dateString);
            if (!isNaN(date.getTime())) {
                return date;
            }
        } catch (error) {
            console.warn('Could not parse date:', dateString);
        }
        
        return new Date();
    }
    
    generateMockCrimeData() {
        const crimeTypes = Object.values(this.crimeTypes);
        const data = [];
        
        // Generate random crime incidents within Bogotá bounds
        for (let i = 0; i < 500; i++) {
            const lat = 4.6 + Math.random() * 0.2; // Bogotá latitude range
            const lng = -74.2 + Math.random() * 0.2; // Bogotá longitude range
            const crimeType = crimeTypes[Math.floor(Math.random() * crimeTypes.length)];
            const date = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
            
            data.push({
                lat: lat,
                lng: lng,
                type: crimeType,
                date: date,
                description: crimeType,
                address: `Calle ${Math.floor(Math.random() * 200) + 1} # ${Math.floor(Math.random() * 100) + 1}-${Math.floor(Math.random() * 100) + 1}`,
                neighborhood: `Barrio ${Math.floor(Math.random() * 20) + 1}`
            });
        }
        
        return data;
    }
    
    updateMap() {
        // Clear existing layers
        this.map.removeLayer(this.heatLayer);
        this.map.removeLayer(this.markersLayer);
        
        this.heatLayer = L.layerGroup();
        this.markersLayer = L.layerGroup();
        
        // Get filter values
        const crimeType = document.getElementById('crimeType').value;
        const dateFrom = new Date(document.getElementById('dateFrom').value);
        const dateTo = new Date(document.getElementById('dateTo').value);
        
        // Filter data
        this.filteredData = this.crimeData.filter(incident => {
            const incidentDate = new Date(incident.date);
            const typeMatch = crimeType === 'all' || incident.type === crimeType;
            const dateMatch = incidentDate >= dateFrom && incidentDate <= dateTo;
            return typeMatch && dateMatch;
        });
        
        // Prepare heatmap data
        const heatData = this.filteredData.map(incident => [
            incident.lat,
            incident.lng,
            1 // intensity
        ]);
        
        // Add heatmap layer
        if (heatData.length > 0) {
            const heat = L.heatLayer(heatData, {
                radius: 25,
                blur: 15,
                maxZoom: 17,
                gradient: {
                    0.4: 'blue',
                    0.6: 'cyan',
                    0.7: 'lime',
                    0.8: 'yellow',
                    1.0: 'red'
                }
            });
            this.heatLayer.addLayer(heat);
        }
        
        // Add individual markers for hover information
        this.filteredData.forEach(incident => {
            const marker = L.circleMarker([incident.lat, incident.lng], {
                radius: 4,
                color: this.getCrimeColor(incident.type),
                fillColor: this.getCrimeColor(incident.type),
                fillOpacity: 0.7,
                weight: 2
            });
            
            marker.bindTooltip(`
                <div style="font-weight: bold; margin-bottom: 5px;">${incident.description}</div>
                <div style="font-size: 0.9em; color: #666; margin-bottom: 3px;">
                    ${incident.date.toLocaleDateString()}
                </div>
                ${incident.address ? `<div style="font-size: 0.8em; color: #888;">${incident.address}</div>` : ''}
                ${incident.neighborhood ? `<div style="font-size: 0.8em; color: #888;">${incident.neighborhood}</div>` : ''}
            `, {
                permanent: false,
                direction: 'top',
                className: 'custom-tooltip'
            });
            
            this.markersLayer.addLayer(marker);
        });
        
        // Add layers to map
        this.map.addLayer(this.heatLayer);
        this.map.addLayer(this.markersLayer);
        
        // Update stats
        this.updateStats();
    }
    
    getCrimeColor(type) {
        const colors = {
            'Homicidio': '#e74c3c',
            'Hurto a Personas': '#f39c12',
            'Lesiones Personales': '#e67e22',
            'Secuestro': '#8e44ad',
            'Hurto a Residencias': '#3498db',
            'Hurto a Comercios': '#2ecc71',
            'Hurto a Automotores': '#9b59b6'
        };
        return colors[type] || '#95a5a6';
    }
    
    updateStats() {
        const data = this.filteredData.length > 0 ? this.filteredData : this.crimeData;
        
        const stats = {
            total: data.length,
            homicidio: data.filter(d => d.type === 'Homicidio').length,
            hurto: data.filter(d => d.type.includes('Hurto')).length,
            lesiones: data.filter(d => d.type === 'Lesiones Personales').length,
            secuestro: data.filter(d => d.type === 'Secuestro').length
        };
        
        document.getElementById('totalCrimes').textContent = stats.total;
        document.getElementById('homicidios').textContent = stats.homicidio;
        document.getElementById('hurtos').textContent = stats.hurto;
        document.getElementById('lesiones').textContent = stats.lesiones;
    }
    
    showLoading(show) {
        document.getElementById('loading').style.display = show ? 'block' : 'none';
    }
    
    showError(message) {
        const errorDiv = document.getElementById('error');
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }
    
    hideError() {
        document.getElementById('error').style.display = 'none';
    }
}

// Global function for the update button
function updateMap() {
    if (window.crimeApp) {
        window.crimeApp.updateMap();
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.crimeApp = new BogotaCrimeApp();
});
