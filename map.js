(function () {
  if (!window.L) return;

  const communityInput = document.getElementById('map-community');
  const communityList = document.getElementById('map-community-options');
  const typeSelect = document.getElementById('resource-type');
  const distanceRange = document.getElementById('max-distance');
  const distanceLabel = document.getElementById('distance-label');
  const statusNode = document.getElementById('map-status');
  const resourceList = document.getElementById('resource-list');
  const applyButton = document.getElementById('apply-map-filter');
  const locateButton = document.getElementById('locate-btn');

  const communityNames = Object.keys(NutriData.communities);
  const communityLabels = communityNames
    .map((name) => `${name}, ${NutriData.communities[name].country}`)
    .sort((a, b) => a.localeCompare(b));

  communityLabels.forEach((label) => {
    const option = document.createElement('option');
    option.value = label;
    communityList.appendChild(option);
  });

  const map = L.map('resource-map').setView([18, 10], 2);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);
  map.attributionControl.setPrefix('');

  const markerLayer = L.layerGroup().addTo(map);
  const hotspotLayer = L.layerGroup().addTo(map);

  let mapCenter = null;
  let centerLabel = '';
  let usingCurrentLocation = false;

  const markerStyleByType = {
    Clinic: { color: '#e63946', fillColor: '#ff6b74' },
    'Food Support': { color: '#f4b942', fillColor: '#ffd27a' },
    NGO: { color: '#0b3c5d', fillColor: '#4f8ab0' }
  };

  function normalizeText(value) {
    return String(value || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }

  function resolveCommunityInput(value) {
    const raw = String(value || '').trim();
    if (!raw) return null;

    const withoutCountry = raw.split(',')[0].trim();
    const exact = communityNames.find((name) => name.toLowerCase() === raw.toLowerCase() || name.toLowerCase() === withoutCountry.toLowerCase());
    if (exact) {
      return {
        key: exact,
        label: `${exact}, ${NutriData.communities[exact].country}`,
        point: NutriData.communities[exact]
      };
    }

    const normalizedInput = normalizeText(raw);
    const scored = communityNames
      .map((name) => {
        const country = NutriData.communities[name].country;
        const searchable = normalizeText(`${name} ${country}`);
        let score = 0;
        if (searchable.startsWith(normalizedInput)) score += 6;
        if (searchable.includes(normalizedInput)) score += 3;
        return { name, score };
      })
      .sort((a, b) => b.score - a.score);

    if (scored.length && scored[0].score > 0) {
      const best = scored[0].name;
      return {
        key: best,
        label: `${best}, ${NutriData.communities[best].country}`,
        point: NutriData.communities[best]
      };
    }

    return null;
  }

  function renderHotspots() {
    hotspotLayer.clearLayers();

    const history = NutriApp.getHistory();
    const highRiskByCommunity = {};

    history.forEach((entry) => {
      const label = entry?.payload?.community;
      const key = entry?.payload?.communityKey || (label ? String(label).split(',')[0].trim() : '');
      if (!key) return;
      if (!['High', 'Urgent'].includes(entry?.riskOutput?.category)) return;
      if (!highRiskByCommunity[key]) {
        highRiskByCommunity[key] = { count: 0, label: label || key };
      }
      highRiskByCommunity[key].count += 1;
    });

    Object.entries(highRiskByCommunity).forEach(([communityKey, stats]) => {
      const point = NutriData.communities[communityKey];
      if (!point) return;
      L.circle([point.lat, point.lng], {
        color: '#e63946',
        fillColor: '#e63946',
        fillOpacity: 0.22,
        radius: 250 + stats.count * 120
      })
        .bindPopup(`${stats.label}<br/>High-risk cases: ${stats.count}`)
        .addTo(hotspotLayer);
    });
  }

  function renderStatus(text) {
    statusNode.textContent = text;
  }

  function drawCenterMarker() {
    if (!mapCenter) return;
    L.circleMarker([mapCenter.lat, mapCenter.lng], {
      radius: 8,
      color: '#0b3c5d',
      fillColor: '#17a398',
      fillOpacity: 0.9
    })
      .addTo(markerLayer)
      .bindPopup(centerLabel || 'Selected center');
  }

  function buildSummaryByType(list) {
    const counts = { Clinic: 0, 'Food Support': 0, NGO: 0 };
    list.forEach((item) => {
      if (counts[item.type] !== undefined) counts[item.type] += 1;
    });
    return `Clinics: ${counts.Clinic} · Food support: ${counts['Food Support']} · NGO: ${counts.NGO}`;
  }

  function applyFilters() {
    const type = typeSelect.value;
    const maxDistance = Number(distanceRange.value);
    const rawCommunity = String(communityInput.value || '').trim();

    markerLayer.clearLayers();
    resourceList.innerHTML = '';

    if (!(usingCurrentLocation && rawCommunity === 'Current location' && mapCenter)) {
      const inputMatch = resolveCommunityInput(communityInput.value);
      if (inputMatch) {
        usingCurrentLocation = false;
        mapCenter = { lat: inputMatch.point.lat, lng: inputMatch.point.lng };
        centerLabel = inputMatch.label;
        communityInput.value = inputMatch.label;
        map.setView([mapCenter.lat, mapCenter.lng], 11);
      } else if (rawCommunity) {
        mapCenter = null;
        centerLabel = '';
        map.setView([18, 10], 2);
        renderStatus('Community not recognized. Showing results globally by selected type.');
      } else {
        mapCenter = null;
        centerLabel = '';
      }
    }

    const filtered = NutriData.resources
      .map((resource) => {
        const distance = mapCenter
          ? NutriApp.haversineKm(mapCenter.lat, mapCenter.lng, resource.lat, resource.lng)
          : null;
        return { ...resource, distance };
      })
      .filter((resource) => (type === 'All' ? true : resource.type === type))
      .filter((resource) => (mapCenter ? resource.distance <= maxDistance : true))
      .sort((a, b) => {
        if (mapCenter) return a.distance - b.distance;
        return a.name.localeCompare(b.name);
      });

    if (filtered.length === 0) {
      const noDataMessage = mapCenter
        ? 'No services found for this filter and distance. Increase range or choose another type.'
        : 'No services found for this resource type.';
      resourceList.innerHTML = `<div class="resource-item">${noDataMessage}</div>`;
      if (!String(communityInput.value || '').trim()) {
        renderStatus('Select or type a community, then click Apply filters to use distance-based matching.');
      }
      return;
    }

    drawCenterMarker();

    filtered.forEach((resource) => {
      const style = markerStyleByType[resource.type] || { color: '#17a398', fillColor: '#17a398' };
      const marker = L.circleMarker([resource.lat, resource.lng], {
        radius: 7,
        weight: 2,
        color: style.color,
        fillColor: style.fillColor,
        fillOpacity: 0.85
      }).addTo(markerLayer);
      const distanceText = mapCenter ? `${resource.distance.toFixed(1)} km away` : 'Distance available after selecting a community';

      marker.bindPopup(`<strong>${resource.name}</strong><br/>${resource.type}<br/>${distanceText}<br/>${resource.open}`);

      const node = document.createElement('article');
      node.className = 'resource-item';
      node.innerHTML = `
        <strong>${resource.name}</strong>
        <div><span class="tag">${resource.type}</span> <span class="small-text">${distanceText}</span></div>
        <div class="small-text">${resource.services.join(' · ')}</div>
        <div class="small-text">${resource.open}</div>
      `;
      node.addEventListener('click', () => {
        map.setView([resource.lat, resource.lng], 13);
        marker.openPopup();
      });
      resourceList.appendChild(node);
    });

    if (mapCenter) {
      renderStatus(`Applied: ${filtered.length} resource(s) within ${maxDistance} km of ${centerLabel}. ${buildSummaryByType(filtered)}`);
    } else {
      renderStatus(`Applied: ${filtered.length} resource(s) globally. ${buildSummaryByType(filtered)}. Select a community to enable distance filtering.`);
    }
  }

  distanceRange.addEventListener('input', () => {
    distanceLabel.textContent = `${distanceRange.value} km`;
  });

  applyButton.addEventListener('click', applyFilters);

  communityInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      applyFilters();
    }
  });

  communityInput.addEventListener('input', () => {
    if (communityInput.value !== 'Current location') {
      usingCurrentLocation = false;
    }
  });

  locateButton.addEventListener('click', () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        mapCenter = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        usingCurrentLocation = true;
        centerLabel = 'Current location';
        communityInput.value = 'Current location';
        map.setView([mapCenter.lat, mapCenter.lng], 12);
        applyFilters();
      },
      () => {
        alert('Location permission denied. Please type a community manually instead.');
      }
    );
  });

  renderHotspots();
  applyFilters();
})();
