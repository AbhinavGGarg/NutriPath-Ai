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
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
  }).addTo(map);
  map.attributionControl.setPrefix('');

  map.createPane('globalLabelPane');
  const labelPane = map.getPane('globalLabelPane');
  if (labelPane) labelPane.style.zIndex = '360';

  const markerLayer = L.layerGroup().addTo(map);
  const hotspotLayer = L.layerGroup().addTo(map);
  const continentLabelLayer = L.layerGroup().addTo(map);
  const countryLabelLayer = L.layerGroup().addTo(map);
  const cityLabelLayer = L.layerGroup().addTo(map);

  let mapCenter = null;
  let centerLabel = '';
  let usingCurrentLocation = false;
  let countryCentroids = [];
  let countryDataLoaded = false;
  let filterRunId = 0;
  const geocodeCache = new Map();
  const liveResourceCache = new Map();
  const nearestFallbackLimit = 120;

  const markerStyleByType = {
    Clinic: { color: '#e63946', fillColor: '#ff6b74' },
    'Food Support': { color: '#f4b942', fillColor: '#ffd27a' },
    NGO: { color: '#0b3c5d', fillColor: '#4f8ab0' }
  };

  const continentPoints = [
    { code: '019', fallback: 'Americas', lat: 15, lng: -85 },
    { code: '150', fallback: 'Europe', lat: 54, lng: 15 },
    { code: '002', fallback: 'Africa', lat: 2, lng: 20 },
    { code: '142', fallback: 'Asia', lat: 35, lng: 90 },
    { code: '009', fallback: 'Oceania', lat: -20, lng: 140 },
    { code: '010', fallback: 'Antarctica', lat: -78, lng: 0 }
  ];

  function t(key, vars) {
    return window.NutriApp?.t ? window.NutriApp.t(key, vars) : key;
  }

  function resourceTypeLabel(type) {
    return window.NutriApp?.getResourceTypeLabel ? window.NutriApp.getResourceTypeLabel(type) : type;
  }

  function updateDistanceLabel() {
    distanceLabel.textContent = t('map_distance_value', { distance: distanceRange.value });
  }

  function normalizeText(value) {
    return String(value || '')
      .trim()
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, ' ')
      .trim();
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function currentLanguage() {
    return window.NutriApp?.getUiLanguage ? window.NutriApp.getUiLanguage() : 'en';
  }

  function localizeRegion(code, fallback) {
    try {
      const regionNames = new Intl.DisplayNames([currentLanguage()], { type: 'region' });
      return regionNames.of(code) || fallback;
    } catch {
      return fallback;
    }
  }

  function createLabelMarker(lat, lng, text, type) {
    return L.marker([lat, lng], {
      pane: 'globalLabelPane',
      interactive: false,
      keyboard: false,
      icon: L.divIcon({
        className: `map-label map-label-${type}`,
        html: `<span>${escapeHtml(text)}</span>`
      })
    });
  }

  async function loadCountryCentroids() {
    if (countryDataLoaded) return;
    countryDataLoaded = true;
    try {
      const response = await fetch('https://raw.githubusercontent.com/gavinr/world-countries-centroids/master/dist/countries.geojson');
      if (!response.ok) return;
      const geojson = await response.json();
      if (!geojson || !Array.isArray(geojson.features)) return;
      countryCentroids = geojson.features
        .map((feature) => {
          const coords = feature?.geometry?.coordinates;
          const iso = feature?.properties?.ISO;
          if (!Array.isArray(coords) || coords.length < 2 || !iso) return null;
          return {
            iso: String(iso).toUpperCase(),
            country: feature?.properties?.COUNTRY || iso,
            lat: Number(coords[1]),
            lng: Number(coords[0])
          };
        })
        .filter(Boolean);
    } catch {
      countryCentroids = [];
    }
  }

  function renderGlobalLabels() {
    continentLabelLayer.clearLayers();
    countryLabelLayer.clearLayers();
    cityLabelLayer.clearLayers();

    continentPoints.forEach((point) => {
      const name = localizeRegion(point.code, point.fallback);
      createLabelMarker(point.lat, point.lng, name, 'continent').addTo(continentLabelLayer);
    });

    countryCentroids.forEach((country) => {
      const localizedCountry = localizeRegion(country.iso, country.country);
      createLabelMarker(country.lat, country.lng, localizedCountry, 'country').addTo(countryLabelLayer);
    });

    Object.entries(NutriData.communities).forEach(([city, point]) => {
      createLabelMarker(point.lat, point.lng, city, 'city').addTo(cityLabelLayer);
    });
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

  async function geocodeCommunityInput(value) {
    const raw = String(value || '').trim();
    const cacheKey = normalizeText(raw);
    if (!cacheKey) return null;
    if (geocodeCache.has(cacheKey)) return geocodeCache.get(cacheKey);

    try {
      const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&accept-language=${encodeURIComponent(currentLanguage())}&q=${encodeURIComponent(raw)}`;
      const response = await fetch(url);
      if (!response.ok) {
        geocodeCache.set(cacheKey, null);
        return null;
      }
      const data = await response.json();
      if (!Array.isArray(data) || !data.length) {
        geocodeCache.set(cacheKey, null);
        return null;
      }

      const top = data[0];
      const resolved = {
        lat: Number(top.lat),
        lng: Number(top.lon),
        label: raw
      };
      if (!Number.isFinite(resolved.lat) || !Number.isFinite(resolved.lng)) {
        geocodeCache.set(cacheKey, null);
        return null;
      }

      geocodeCache.set(cacheKey, resolved);
      return resolved;
    } catch {
      geocodeCache.set(cacheKey, null);
      return null;
    }
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
        .bindPopup(`${stats.label}<br/>${t('map_hotspot_cases', { count: stats.count })}`)
        .addTo(hotspotLayer);
    });
  }

  function renderStatus(text) {
    statusNode.textContent = text;
  }

  function toFixedCoord(value) {
    return Number(value).toFixed(3);
  }

  function liveTypeFromTags(tags) {
    const amenity = String(tags?.amenity || '').toLowerCase();
    const office = String(tags?.office || '').toLowerCase();
    const social = String(tags?.social_facility || '').toLowerCase();

    if (['clinic', 'hospital', 'doctors', 'pharmacy'].includes(amenity)) return 'Clinic';
    if (amenity === 'food_bank') return 'Food Support';
    if (office === 'ngo' || office === 'charity') return 'NGO';
    if (amenity === 'social_facility') {
      if (social.includes('food') || social.includes('soup')) return 'Food Support';
      return 'NGO';
    }
    return 'Clinic';
  }

  function liveServicesForType(type, tags) {
    const healthcare = String(tags?.healthcare || '').trim();
    const speciality = String(tags?.healthcare_speciality || '').trim();
    const base = [];

    if (healthcare) base.push(healthcare.replace(/_/g, ' '));
    if (speciality) base.push(speciality.replace(/_/g, ' '));

    if (type === 'Clinic') {
      if (!base.length) return ['Primary care', 'Child health', 'Nutrition referral'];
      return base.slice(0, 3);
    }
    if (type === 'Food Support') {
      if (!base.length) return ['Food support', 'Voucher guidance', 'Community assistance'];
      return base.slice(0, 3);
    }
    if (!base.length) return ['Community support', 'Referral navigation', 'Case assistance'];
    return base.slice(0, 3);
  }

  function pointFromOverpassElement(element) {
    if (Number.isFinite(element?.lat) && Number.isFinite(element?.lon)) {
      return { lat: Number(element.lat), lng: Number(element.lon) };
    }
    if (Number.isFinite(element?.center?.lat) && Number.isFinite(element?.center?.lon)) {
      return { lat: Number(element.center.lat), lng: Number(element.center.lon) };
    }
    return null;
  }

  async function timedFetch(url, options, timeoutMs) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetch(url, { ...options, signal: controller.signal });
    } finally {
      clearTimeout(timer);
    }
  }

  async function fetchLiveNearbyResources(center, maxDistanceKm, type) {
    if (!center || !Number.isFinite(center.lat) || !Number.isFinite(center.lng)) return [];

    const radiusKm = Math.max(maxDistanceKm, 15);
    const radiusM = Math.min(120000, Math.round(radiusKm * 1000));
    const cacheKey = `${toFixedCoord(center.lat)}|${toFixedCoord(center.lng)}|${radiusM}|${type}`;
    if (liveResourceCache.has(cacheKey)) return liveResourceCache.get(cacheKey);

    const clinicClause = `nwr["amenity"~"clinic|hospital|doctors|pharmacy"](around:${radiusM},${center.lat},${center.lng});`;
    const foodClause = `nwr["amenity"="food_bank"](around:${radiusM},${center.lat},${center.lng});`;
    const ngoClause = `nwr["office"~"ngo|charity"](around:${radiusM},${center.lat},${center.lng});`;
    const socialClause = `nwr["amenity"="social_facility"](around:${radiusM},${center.lat},${center.lng});`;

    const clauses = type === 'Clinic'
      ? [clinicClause]
      : type === 'Food Support'
        ? [foodClause, socialClause]
        : type === 'NGO'
          ? [ngoClause, socialClause]
          : [clinicClause, foodClause, ngoClause, socialClause];

    const query = `
[out:json][timeout:20];
(
${clauses.join('\n')}
);
out tags center 200;
`;

    try {
      const endpoints = [
        'https://overpass-api.de/api/interpreter',
        'https://overpass.kumi.systems/api/interpreter'
      ];

      let payload = null;
      for (const endpoint of endpoints) {
        try {
          const response = await timedFetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
            body: `data=${encodeURIComponent(query)}`
          }, 5000);

          if (!response.ok) continue;
          payload = await response.json();
          break;
        } catch {
          continue;
        }
      }

      if (!payload) {
        liveResourceCache.set(cacheKey, []);
        return [];
      }

      const elements = Array.isArray(payload?.elements) ? payload.elements : [];
      const seen = new Set();

      const liveResources = elements
        .map((element, idx) => {
          const point = pointFromOverpassElement(element);
          if (!point) return null;

          const tags = element.tags || {};
          const inferredType = liveTypeFromTags(tags);
          if (type !== 'All' && inferredType !== type) return null;

          const name = String(tags.name || '').trim() || `${inferredType} ${idx + 1}`;
          const dedupeKey = `${name}|${toFixedCoord(point.lat)}|${toFixedCoord(point.lng)}|${inferredType}`;
          if (seen.has(dedupeKey)) return null;
          seen.add(dedupeKey);

          return {
            id: `live-${element.type || 'node'}-${element.id || idx}`,
            name,
            type: inferredType,
            lat: point.lat,
            lng: point.lng,
            services: liveServicesForType(inferredType, tags),
            open: String(tags.opening_hours || '').trim() || 'Hours not listed',
            distance: NutriApp.haversineKm(center.lat, center.lng, point.lat, point.lng),
            source: 'live'
          };
        })
        .filter(Boolean)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 200);

      liveResourceCache.set(cacheKey, liveResources);
      return liveResources;
    } catch {
      liveResourceCache.set(cacheKey, []);
      return [];
    }
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
      .bindPopup(centerLabel || t('map_selected_center'));
  }

  function buildSummaryByType(list) {
    const counts = { Clinic: 0, 'Food Support': 0, NGO: 0 };
    list.forEach((item) => {
      if (counts[item.type] !== undefined) counts[item.type] += 1;
    });

    return t('map_summary', {
      clinic: counts.Clinic,
      food: counts['Food Support'],
      ngo: counts.NGO
    });
  }

  function buildCombinedResources(type, liveNearby) {
    const typeFiltered = NutriData.resources
      .map((resource) => {
        const distance = mapCenter
          ? NutriApp.haversineKm(mapCenter.lat, mapCenter.lng, resource.lat, resource.lng)
          : null;
        return { ...resource, distance };
      })
      .filter((resource) => (type === 'All' ? true : resource.type === type));

    const combinedById = new Map();
    [...(liveNearby || []), ...typeFiltered].forEach((resource) => {
      const key = `${resource.type}|${toFixedCoord(resource.lat)}|${toFixedCoord(resource.lng)}|${resource.name}`;
      if (!combinedById.has(key)) combinedById.set(key, resource);
    });

    return [...combinedById.values()].sort((a, b) => {
      if (mapCenter) return (a.distance ?? Infinity) - (b.distance ?? Infinity);
      return a.name.localeCompare(b.name);
    });
  }

  function pickFilteredResources(allResources, maxDistance) {
    let filtered = mapCenter
      ? allResources.filter((resource) => resource.distance <= maxDistance)
      : allResources;

    const usedNearestFallback = Boolean(mapCenter && !filtered.length && allResources.length);
    if (usedNearestFallback) {
      filtered = allResources.slice(0, nearestFallbackLimit);
    }

    return { filtered, usedNearestFallback };
  }

  function renderFilteredResources(filtered, maxDistance, usedNearestFallback) {
    markerLayer.clearLayers();
    resourceList.innerHTML = '';
    drawCenterMarker();

    if (filtered.length === 0) {
      const noDataMessage = mapCenter
        ? t('map_no_data_local')
        : t('map_no_data_global');
      resourceList.innerHTML = `<div class="resource-item">${noDataMessage}</div>`;
      if (!String(communityInput.value || '').trim()) {
        renderStatus(t('map_status_select'));
      }
      return;
    }

    filtered.forEach((resource) => {
      const style = markerStyleByType[resource.type] || { color: '#17a398', fillColor: '#17a398' };
      const marker = L.circleMarker([resource.lat, resource.lng], {
        radius: 7,
        weight: 2,
        color: style.color,
        fillColor: style.fillColor,
        fillOpacity: 0.85
      }).addTo(markerLayer);
      const typeLabel = resourceTypeLabel(resource.type);
      const distanceText = mapCenter && Number.isFinite(resource.distance)
        ? t('map_distance_away', { distance: resource.distance.toFixed(1) })
        : t('map_distance_pending');

      marker.bindPopup(`<strong>${resource.name}</strong><br/>${typeLabel}<br/>${distanceText}<br/>${resource.open}`);

      const node = document.createElement('article');
      node.className = 'resource-item';
      node.innerHTML = `
        <strong>${resource.name}</strong>
        <div><span class="tag">${typeLabel}</span> <span class="small-text">${distanceText}</span></div>
        <div class="small-text">${resource.services.join(' · ')}</div>
        <div class="small-text">${resource.open}</div>
      `;
      node.addEventListener('click', () => {
        map.setView([resource.lat, resource.lng], 13);
        marker.openPopup();
      });
      resourceList.appendChild(node);
    });

    if (mapCenter && usedNearestFallback) {
      const bounds = L.latLngBounds([[mapCenter.lat, mapCenter.lng]]);
      filtered.slice(0, 20).forEach((resource) => {
        bounds.extend([resource.lat, resource.lng]);
      });
      if (bounds.isValid()) {
        map.fitBounds(bounds.pad(0.25));
      }
    }

    if (mapCenter) {
      renderStatus(
        t('map_status_applied_local', {
          count: filtered.length,
          distance: maxDistance,
          center: centerLabel,
          summary: buildSummaryByType(filtered)
        })
      );
    } else {
      renderStatus(
        t('map_status_applied_global', {
          count: filtered.length,
          summary: buildSummaryByType(filtered)
        })
      );
    }
  }

  async function applyFilters() {
    const runId = ++filterRunId;
    const type = typeSelect.value;
    const maxDistance = Number(distanceRange.value);
    const rawCommunity = String(communityInput.value || '').trim();

    if (!(usingCurrentLocation && rawCommunity === t('current_location') && mapCenter)) {
      const inputMatch = resolveCommunityInput(communityInput.value);
      if (inputMatch) {
        usingCurrentLocation = false;
        mapCenter = { lat: inputMatch.point.lat, lng: inputMatch.point.lng };
        centerLabel = inputMatch.label;
        communityInput.value = inputMatch.label;
        map.setView([mapCenter.lat, mapCenter.lng], 11);
      } else if (rawCommunity) {
        const geocoded = await geocodeCommunityInput(rawCommunity);
        if (runId !== filterRunId) return;

        if (geocoded) {
          usingCurrentLocation = false;
          mapCenter = { lat: geocoded.lat, lng: geocoded.lng };
          centerLabel = geocoded.label;
          map.setView([mapCenter.lat, mapCenter.lng], 10);
        } else {
          mapCenter = null;
          centerLabel = '';
          map.setView([18, 10], 2);
          renderStatus(t('map_status_unrecognized'));
        }
      } else {
        mapCenter = null;
        centerLabel = '';
      }
    }

    const staticCombined = buildCombinedResources(type, []);
    const staticSelection = pickFilteredResources(staticCombined, maxDistance);
    renderFilteredResources(staticSelection.filtered, maxDistance, staticSelection.usedNearestFallback);

    if (mapCenter) {
      fetchLiveNearbyResources(mapCenter, maxDistance, type).then((liveNearby) => {
        if (runId !== filterRunId) return;
        if (!Array.isArray(liveNearby) || !liveNearby.length) return;

        const mergedCombined = buildCombinedResources(type, liveNearby);
        const mergedSelection = pickFilteredResources(mergedCombined, maxDistance);
        renderFilteredResources(mergedSelection.filtered, maxDistance, mergedSelection.usedNearestFallback);
      });
    }
  }

  distanceRange.addEventListener('input', updateDistanceLabel);

  applyButton.addEventListener('click', applyFilters);

  communityInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      applyFilters();
    }
  });

  communityInput.addEventListener('input', () => {
    if (communityInput.value !== t('current_location')) {
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
        centerLabel = t('current_location');
        communityInput.value = t('current_location');
        map.setView([mapCenter.lat, mapCenter.lng], 12);
        applyFilters();
      },
      () => {
        alert(t('map_location_denied'));
      }
    );
  });

  renderHotspots();
  loadCountryCentroids().then(renderGlobalLabels);
  renderGlobalLabels();
  applyFilters();

  window.addEventListener('nutri:lang-changed', () => {
    if (usingCurrentLocation) {
      centerLabel = t('current_location');
      communityInput.value = t('current_location');
    }
    updateDistanceLabel();
    renderHotspots();
    renderGlobalLabels();
    applyFilters();
  });

  updateDistanceLabel();
})();
