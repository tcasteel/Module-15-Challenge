let myMap = L.map("map", {
    center: [0, 0],
    zoom: 2
});

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(myMap);

fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson')
    .then(responser => responser.json())
    .then(data => {
        const earthquakes = data;

        const depthRanges = [
            { min: -10, max: 10, label: '-10-10' },
            { min: 10, max: 30, label: '10-30' },
            { min: 30, max: 50, label: '30-50' },
            { min: 50, max: 70, label: '50-70' },
            { min: 70, max: 90, label: '70-90' },
            { min: 90, label: '90+' }
        ];

        const legend = L.control({ position: 'bottomright' });

        legend.onAdd = function (map) {
            const div = L.DomUtil.create('div', 'legend');
        
            div.style.backgroundColor = 'white';
            div.style.padding = '10px';
            div.style.border = '1px solid #ccc';
            div.style.borderRadius = '5px';
            div.style.display = 'flex'; 
            div.style.flexDirection = 'column'; 
        
            div.innerHTML += '<h4>Depth Legend </h4>'; 
        
            depthRanges.forEach(range => {
                const color = getColorForDepth(range.min);
        
                
                const legendEntryContainer = L.DomUtil.create('div', 'legend-entry-container');
                legendEntryContainer.style.display = 'flex';
                legendEntryContainer.style.alignItems = 'center'; 
                div.appendChild(legendEntryContainer);
        
                
                const colorBox = L.DomUtil.create('div', 'color-box');
                colorBox.style.backgroundColor = color;
                colorBox.style.height = '20px';
                colorBox.style.width = '20px';
                colorBox.style.marginRight = '5px';
                legendEntryContainer.appendChild(colorBox);
        
                
                const legendEntry = L.DomUtil.create('div', 'legend-entry');
                legendEntry.innerHTML = `<span>${range.label}</span>`;
                legendEntryContainer.appendChild(legendEntry);
            });
        
            return div;
        };

        function getColorForDepth(depth) {
            return `rgb(255, ${Math.floor(255 * (1 - (depth / 100)))}, 0)`;
        }

        earthquakes.features.forEach(feature => {
            const coordinates = feature.geometry.coordinates;
            const latitude = coordinates[1];
            const longitude = coordinates[0];
            const magnitude = feature.properties.mag;
            const place = feature.properties.place;
            const depth = coordinates[2];

            const marker = L.circleMarker([latitude, longitude], {
                radius: magnitude * 7,
                fillColor: getColorForDepth(depth),
                color: 'black',
                weight: 1,
                opacity: 1,
                fillOpacity: 1
            }).bindPopup(`<b>${place}</b><br />Magnitude: ${magnitude}<br />Depth: ${depth}<br />Latitude: ${latitude}<br />Longitude ${longitude}`);

            marker.addTo(myMap);
        });

        legend.addTo(myMap);
    })
    .catch(error => console.error('Error fetching earthquake data:', error));