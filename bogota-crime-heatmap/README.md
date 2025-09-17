# Bogotá Crime Heatmap

A web application that visualizes crime incidents in Bogotá, Colombia using interactive heatmaps and detailed incident information.

## Features

- 🗺️ **Interactive Map**: Built with Leaflet.js, centered on Bogotá
- 🔥 **Heatmap Visualization**: Shows crime density across the city
- 📍 **Incident Markers**: Hover over dots to see incident details
- 🔍 **Filtering**: Filter by crime type and date range
- 📊 **Statistics**: Real-time crime statistics dashboard
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Crime Types Included

- Homicidio (Homicide)
- Hurto a Personas (Theft from Persons)
- Lesiones Personales (Personal Injuries)
- Secuestro (Kidnapping)
- Hurto a Residencias (Residential Theft)
- Hurto a Comercios (Commercial Theft)
- Hurto a Automotores (Vehicle Theft)

## Data Source

The application attempts to fetch real-time data from Bogotá's open data portal:
- **API**: `https://datosabiertos.bogota.gov.co/api/3/action/datastore_search`
- **Dataset**: "Delito de Alto Impacto Bogotá D.C."
- **Fallback**: If real data is unavailable, the app uses demonstration data

## How to Use

### Option 1: Simple File Opening
1. **Open the Application**: Open `index.html` in a web browser
2. **View the Map**: The map loads with a heatmap showing crime density
3. **Filter Data**: Use the controls to filter by:
   - Crime type (dropdown menu)
   - Date range (from/to date pickers)
4. **Explore Incidents**: Hover over colored dots to see incident details
5. **View Statistics**: Check the statistics panel for crime counts

### Option 2: Local Development Server (Recommended)
1. **Start the Server**: Run the Python server to avoid CORS issues:
   ```bash
   python3 server.py
   ```
2. **Open Browser**: The application will automatically open at `http://localhost:8000`
3. **Benefits**: 
   - Avoids CORS issues when fetching real data
   - Better performance
   - Real-time API data access

## Technical Details

### Technologies Used
- **HTML5**: Structure and semantic markup
- **CSS3**: Modern styling with gradients and animations
- **JavaScript (ES6+)**: Application logic and API integration
- **Leaflet.js**: Interactive mapping library
- **Leaflet.heat**: Heatmap visualization plugin

### Browser Compatibility
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

### File Structure
```
bogota-crime-app/
├── index.html          # Main HTML file
├── app.js             # Application JavaScript
└── README.md          # This file
```

## API Integration

The application includes robust API integration with the following features:

- **Real-time Data Fetching**: Attempts to fetch live data from Bogotá's API
- **Error Handling**: Graceful fallback to demonstration data
- **Data Processing**: Normalizes different data formats and field names
- **Coordinate Validation**: Ensures valid latitude/longitude coordinates

### API Endpoint
```
GET https://datosabiertos.bogota.gov.co/api/3/action/datastore_search?resource_id=b64ba3c4-9e41-41b8-b3fd-2da21d6271a5&limit=1000
```

## Customization

### Adding New Crime Types
1. Update the `crimeTypes` object in `app.js`
2. Add new options to the select dropdown in `index.html`
3. Add corresponding colors in the `getCrimeColor()` method

### Modifying the Heatmap
Adjust the heatmap parameters in the `updateMap()` method:
```javascript
const heat = L.heatLayer(heatData, {
    radius: 25,        // Size of heat points
    blur: 15,          // Blur intensity
    maxZoom: 17,       // Maximum zoom level
    gradient: { ... }  // Color gradient
});
```

### Changing Map Style
Replace the tile layer URL in the `initMap()` method:
```javascript
L.tileLayer('YOUR_TILE_URL', {
    attribution: 'Your attribution'
}).addTo(this.map);
```

## Troubleshooting

### Common Issues

1. **No Data Loading**: 
   - Check browser console for CORS errors
   - Verify internet connection
   - The app will fallback to demonstration data

2. **Map Not Displaying**:
   - Ensure Leaflet.js and Leaflet.heat are loading
   - Check for JavaScript errors in console

3. **Performance Issues**:
   - Reduce the number of markers by filtering data
   - Adjust heatmap radius and blur settings

## Future Enhancements

- [ ] Real-time data updates
- [ ] Export functionality (PDF, image)
- [ ] Advanced filtering options
- [ ] Crime trend analysis
- [ ] Neighborhood-specific statistics
- [ ] Mobile app version

## License

This project is open source and available under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## Contact

For questions or suggestions, please open an issue in the project repository.
