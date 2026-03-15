(function () {
  if (!window.L) return;

  const communitySelect = document.getElementById('map-community');
  const typeSelect = document.getElementById('resource-type');
  const distanceRange = document.getElementById('max-distance');
  const distanceLabel = document.getElementById('distance-label');
  const resourceList = document.getElementById('resource-list');
  const applyButton = document.getElementById('apply-map-filter');
  const locateButton = document.getElementById('locate-btn');

  const communityNames = Object.keys(NutriData.communities);
  communityNames.forEach((name) => {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = `${name}, ${NutriData.communities[name].country}`;
    communitySelect.appendChild(option);
  });

  const latestReport = NutriApp.getCurrentReport();
  if (latestReport?.payload?.community && communityNames.includes(latestReport.payload.community)) {
    communitySelect.value = latestReport.payload.community;
  }

  let mapCenter = NutriData.communities[communitySelect.value || communityNames[0]];
  let map = L.map('resource-map').setView([mapCenter.lat, mapCenter.lng], 12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  const markerLayer = L.layerGroup().addTo(map);
  const hotspotLayer = L.layerGroup().addTo(map);

  function getCenterPoint() {
    if (mapCenter?.lat && mapCenter?.lng) return mapCenter;
    const fallback = NutriData.communities[communityNames[0]];
    return fallback;
  }

  function renderHotspots() {
    hotspotLayer.clearLayers();

    const history = NutriApp.getHistory();
    const highRiskByCommunity = {};

    history.forEach((entry) => {
      if (!entry?.payload?.community) return;
      if (!['High', 'Urgent'].includes(entry?.riskOutput?.category)) return;
      const key = entry.payload.community;
      highRiskByCommunity[key] = (highRiskByCommunity[key] || 0) + 1;
    });

    Object.entries(highRiskByCommunity).forEach(([community, count]) => {
      const point = NutriData.communities[community];
      if (!point) return;
      L.circle([point.lat, point.lng], {
        color: '#e63946',
        fillColor: '#e63946',
        fillOpacity: 0.22,
        radius: 250 + count * 120
      })
        .bindPopup(`${community}<br/>High-risk cases: ${count}`)
        .addTo(hotspotLayer);
    });
  }

  function applyFilters() {
    const center = getCenterPoint();
    const type = typeSelect.value;
    const maxDistance = Number(distanceRange.value);

    markerLayer.clearLayers();
    resourceList.innerHTML = '';

    const filtered = NutriData.resources
      .map((resource) => {
        const distance = NutriApp.haversineKm(center.lat, center.lng, resource.lat, resource.lng);
        return { ...resource, distance };
      })
      .filter((resource) => (type === 'All' ? true : resource.type === type))
      .filter((resource) => resource.distance <= maxDistance)
      .sort((a, b) => a.distance - b.distance);

    if (filtered.length === 0) {
      resourceList.innerHTML = '<div class="resource-item">No services found for this filter. Increase distance or choose all resource types.</div>';
      return;
    }

    filtered.forEach((resource) => {
      const marker = L.marker([resource.lat, resource.lng]).addTo(markerLayer);
      marker.bindPopup(
        `<strong>${resource.name}</strong><br/>${resource.type}<br/>${resource.distance.toFixed(1)} km away<br/>${resource.open}`
      );

      const node = document.createElement('article');
      node.className = 'resource-item';
      node.innerHTML = `
        <strong>${resource.name}</strong>
        <div><span class="tag">${resource.type}</span> <span class="small-text">${resource.distance.toFixed(1)} km away</span></div>
        <div class="small-text">${resource.services.join(' · ')}</div>
        <div class="small-text">${resource.open}</div>
      `;
      node.addEventListener('click', () => {
        map.setView([resource.lat, resource.lng], 13);
        marker.openPopup();
      });
      resourceList.appendChild(node);
    });
  }

  communitySelect.addEventListener('change', () => {
    mapCenter = NutriData.communities[communitySelect.value];
    map.setView([mapCenter.lat, mapCenter.lng], 12);
    applyFilters();
  });

  distanceRange.addEventListener('input', () => {
    distanceLabel.textContent = `${distanceRange.value} km`;
  });

  applyButton.addEventListener('click', applyFilters);

  locateButton.addEventListener('click', () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        mapCenter = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          country: 'Current location'
        };
        map.setView([mapCenter.lat, mapCenter.lng], 12);

        L.circleMarker([mapCenter.lat, mapCenter.lng], {
          radius: 8,
          color: '#0b3c5d',
          fillColor: '#17a398',
          fillOpacity: 0.85
        })
          .addTo(markerLayer)
          .bindPopup('Your current location')
          .openPopup();

        applyFilters();
      },
      () => {
        alert('Location permission denied. Please use community dropdown instead.');
      }
    );
  });

  renderHotspots();
  applyFilters();
})();
