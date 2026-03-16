(function () {
  const form = document.getElementById('assessment-form');
  if (!form) return;
  const t = (key, vars) => (window.NutriApp?.t ? window.NutriApp.t(key, vars) : key);

  const symptoms = [
    { id: 'fatigue', labelKey: 'symptom_fatigue', weight: 6, nutrients: ['iron', 'protein'] },
    { id: 'poor_appetite', labelKey: 'symptom_poor_appetite', weight: 8, nutrients: ['zinc', 'protein'] },
    { id: 'diarrhea', labelKey: 'symptom_diarrhea', weight: 10, nutrients: ['zinc', 'calories'] },
    { id: 'fever', labelKey: 'symptom_fever', weight: 7, nutrients: ['protein', 'vitaminA'] },
    { id: 'pallor', labelKey: 'symptom_pallor', weight: 11, nutrients: ['iron', 'folate'] },
    { id: 'edema', labelKey: 'symptom_edema', weight: 20, nutrients: ['protein'] },
    { id: 'wasting', labelKey: 'symptom_wasting', weight: 16, nutrients: ['calories', 'protein'] },
    { id: 'hair_loss', labelKey: 'symptom_hair_loss', weight: 8, nutrients: ['zinc', 'protein'] },
    { id: 'night_vision', labelKey: 'symptom_night_vision', weight: 12, nutrients: ['vitaminA'] },
    { id: 'lethargy', labelKey: 'symptom_lethargy', weight: 16, nutrients: ['calories', 'iron'] }
  ];

  const symptomNode = document.getElementById('symptom-list');
  const communityNode = document.getElementById('community');
  const communityListNode = document.getElementById('community-options');
  const languageNode = document.getElementById('language');
  const languageListNode = document.getElementById('language-options');
  const progressNode = document.getElementById('progress');
  const validationNode = document.getElementById('validation-message');

  const communityNames = Object.keys(NutriData.communities);
  const communityLabels = communityNames
    .map((name) => `${name}, ${NutriData.communities[name].country}`)
    .sort((a, b) => a.localeCompare(b));

  communityLabels.forEach((labelText) => {
    const option = document.createElement('option');
    option.value = labelText;
    communityListNode.appendChild(option);
  });

  NutriData.languages
    .slice()
    .sort((a, b) => a.localeCompare(b))
    .forEach((language) => {
      const option = document.createElement('option');
      option.value = language;
      languageListNode.appendChild(option);
    });

  function getFoodLabel(food) {
    if (food?.custom) return food.name;
    const key = `food_${food.id}`;
    const translated = t(key);
    return translated === key ? food.name : translated;
  }

  function renderSymptoms() {
    const checked = new Set(getSelected('symptoms'));
    symptomNode.innerHTML = '';
    symptoms.forEach((symptom) => {
      const label = document.createElement('label');
      label.className = 'checkbox-item';
      const isChecked = checked.has(symptom.id) ? 'checked' : '';
      label.innerHTML = `<input type="checkbox" name="symptoms" value="${symptom.id}" ${isChecked} /> <span>${t(symptom.labelKey)}</span>`;
      symptomNode.appendChild(label);
    });
  }

  renderSymptoms();

  const requiredFields = [
    'role',
    'language',
    'householdName',
    'community',
    'ageYears',
    'sex',
    'householdSize',
    'weeklyBudget',
    'weight',
    'height',
    'mealsPerDay',
    'dietDiversity',
    'waterSource'
  ];

  function normalizeText(value) {
    return String(value || '')
      .trim()
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, ' ')
      .trim();
  }

  function resolveLanguage(value) {
    const text = String(value || '').trim();
    if (!text) return '';

    const exact = NutriData.languages.find((language) => language.toLowerCase() === text.toLowerCase());
    if (exact) return exact;

    const close = NutriData.languages.find((language) => language.toLowerCase().includes(text.toLowerCase()));
    return close || text;
  }

  function resolveCommunity(value) {
    const raw = String(value || '').trim();
    if (!raw) return { key: '', label: '' };

    const withoutCountry = raw.split(',')[0].trim();
    const exact = communityNames.find((name) => name.toLowerCase() === raw.toLowerCase() || name.toLowerCase() === withoutCountry.toLowerCase());
    if (exact) {
      return { key: exact, label: `${exact}, ${NutriData.communities[exact].country}` };
    }

    const normalizedInput = normalizeText(raw);
    const scored = communityNames
      .map((name) => {
        const country = NutriData.communities[name].country;
        const searchable = normalizeText(`${name} ${country}`);
        let score = 0;
        if (searchable.startsWith(normalizedInput)) score += 6;
        if (searchable.includes(normalizedInput)) score += 3;
        if (normalizedInput && normalizedInput.includes(normalizeText(name))) score += 2;
        return { name, score };
      })
      .sort((a, b) => b.score - a.score);

    if (scored.length && scored[0].score > 0) {
      const best = scored[0].name;
      return { key: best, label: `${best}, ${NutriData.communities[best].country}` };
    }

    return { key: raw, label: raw };
  }

  function updateProgress() {
    const total = requiredFields.length + 1;
    let filled = 0;

    requiredFields.forEach((field) => {
      const value = String(form.elements[field]?.value || '').trim();
      if (value) filled += 1;
    });

    if (form.querySelectorAll('input[name="symptoms"]:checked').length > 0) filled += 1;

    const pct = Math.round((filled / total) * 100);
    const bar = progressNode.querySelector('span');
    bar.style.width = `${pct}%`;
    progressNode.setAttribute('aria-valuenow', String(pct));
  }

  form.addEventListener('input', updateProgress);
  form.addEventListener('change', updateProgress);

  window.addEventListener('nutri:lang-changed', () => {
    renderSymptoms();
    updateProgress();
  });

  updateProgress();

  function getSelected(name) {
    return Array.from(form.querySelectorAll(`input[name="${name}"]:checked`)).map((item) => item.value);
  }

  function buildMealPlan(selectedFoods, deficiencies, weeklyBudget, householdSize) {
    const foods = selectedFoods.length ? selectedFoods : NutriData.foods.filter((food) => food.cost <= 1.5).slice(0, 10);
    const foodName = (item) => getFoodLabel(item);

    const carbFoods = foods.filter((f) => f.nutrients.includes('carbs'));
    const proteinFoods = foods.filter((f) => f.nutrients.includes('protein'));
    const protectFoods = foods.filter((f) =>
      f.nutrients.some((nutrient) => ['vitaminA', 'iron', 'vitaminC', 'folate'].includes(nutrient))
    );

    const mustTarget = deficiencies.map((d) => d.name.toLowerCase());
    const highPriorityFoods = foods
      .map((food) => {
        const matches = food.nutrients.reduce((acc, nutrient) => {
          if (mustTarget.includes('iron') && nutrient === 'iron') return acc + 1;
          if (mustTarget.includes('protein') && nutrient === 'protein') return acc + 1;
          if (mustTarget.includes('vitamin a') && nutrient === 'vitaminA') return acc + 1;
          if (mustTarget.includes('zinc') && nutrient === 'zinc') return acc + 1;
          return acc;
        }, 0);
        return { food, rank: food.score + matches * 8 };
      })
      .sort((a, b) => b.rank - a.rank)
      .map((entry) => entry.food);

    const safeCarbs = carbFoods.length ? carbFoods : highPriorityFoods;
    const safeProteins = proteinFoods.length ? proteinFoods : highPriorityFoods;
    const safeProtective = protectFoods.length ? protectFoods : highPriorityFoods;

    const week = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const plan = week.map((day, idx) => {
      const breakfast = `${foodName(safeCarbs[idx % safeCarbs.length])} + ${foodName(safeProteins[(idx + 1) % safeProteins.length])}`;
      const lunch = `${foodName(safeCarbs[(idx + 2) % safeCarbs.length])} + ${foodName(safeProteins[idx % safeProteins.length])} + ${foodName(safeProtective[idx % safeProtective.length])}`;
      const dinner = `${foodName(safeProteins[(idx + 3) % safeProteins.length])} + ${foodName(safeCarbs[(idx + 1) % safeCarbs.length])} + ${foodName(safeProtective[(idx + 2) % safeProtective.length])}`;

      const dailyCost =
        (safeCarbs[idx % safeCarbs.length].cost +
          safeProteins[(idx + 1) % safeProteins.length].cost +
          safeProtective[(idx + 2) % safeProtective.length].cost) *
        Math.min(1.22, 0.55 + householdSize * 0.12);

      return {
        day,
        breakfast,
        lunch,
        dinner,
        estimatedCost: Number(dailyCost.toFixed(2))
      };
    });

    const budgetRisk = weeklyBudget < householdSize * 2.6 ? 'high' : weeklyBudget < householdSize * 4 ? 'moderate' : 'low';

    return { days: plan, budgetRisk };
  }

  function inferDeficiencies(selectedSymptoms, selectedFoods) {
    const deficiencyScore = {
      iron: 0,
      protein: 0,
      'vitamin A': 0,
      zinc: 0,
      calories: 0
    };

    const symptomMap = Object.fromEntries(symptoms.map((s) => [s.id, s]));
    selectedSymptoms.forEach((symptomId) => {
      const symptom = symptomMap[symptomId];
      if (!symptom) return;
      symptom.nutrients.forEach((nutrient) => {
        if (nutrient === 'vitaminA') deficiencyScore['vitamin A'] += 2;
        else if (deficiencyScore[nutrient] !== undefined) deficiencyScore[nutrient] += 2;
      });
    });

    const coverage = {
      iron: 0,
      protein: 0,
      'vitamin A': 0,
      zinc: 0,
      calories: 0
    };

    selectedFoods.forEach((food) => {
      food.nutrients.forEach((nutrient) => {
        if (nutrient === 'vitaminA') coverage['vitamin A'] += 1;
        if (coverage[nutrient] !== undefined) coverage[nutrient] += 1;
        if (nutrient === 'carbs') coverage.calories += 1;
      });
    });

    Object.keys(deficiencyScore).forEach((key) => {
      if (coverage[key] <= 1) deficiencyScore[key] += 4;
      else if (coverage[key] <= 2) deficiencyScore[key] += 2;
    });

    return Object.entries(deficiencyScore)
      .map(([name, score]) => ({
        name,
        score,
        confidence: Math.min(95, 48 + score * 7)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }

  function computeRisk(payload, selectedSymptoms, selectedFoods) {
    let risk = 8;

    if (Number.isFinite(payload.muac) && payload.muac > 0) {
      if (payload.muac < 11.5) risk += 38;
      else if (payload.muac < 12.5) risk += 27;
      else if (payload.muac < 13.5) risk += 12;
    }

    const bmi = payload.weight / ((payload.height / 100) * (payload.height / 100));
    if (payload.ageYears <= 5) {
      if (bmi < 13.2) risk += 22;
      else if (bmi < 14) risk += 11;
    } else {
      if (bmi < 16.5) risk += 15;
      else if (bmi < 18.3) risk += 8;
    }

    if (payload.mealsPerDay <= 2) risk += 14;
    else if (payload.mealsPerDay <= 3) risk += 8;

    if (payload.dietDiversity <= 3) risk += 14;
    else if (payload.dietDiversity <= 5) risk += 8;

    if (payload.waterSource === 'unsafe') risk += 7;

    const symptomWeight = selectedSymptoms.reduce((sum, id) => {
      const symptom = symptoms.find((item) => item.id === id);
      return sum + (symptom ? symptom.weight : 0);
    }, 0);
    risk += Math.min(28, Math.round(symptomWeight * 0.55));

    const perCapitaBudget = payload.weeklyBudget / payload.householdSize;
    if (perCapitaBudget < 2.2) risk += 12;
    else if (perCapitaBudget < 3.5) risk += 6;

    if (selectedFoods.length > 0 && selectedFoods.length < 5) risk += 8;

    risk = Math.max(1, Math.min(99, Math.round(risk)));

    let category = 'Low';
    if (risk >= 75) category = 'Urgent';
    else if (risk >= 55) category = 'High';
    else if (risk >= 35) category = 'Moderate';

    const actionKeys = [];
    if (category === 'Urgent') {
      actionKeys.push('action_urgent_1');
      actionKeys.push('action_urgent_2');
      actionKeys.push('action_urgent_3');
    } else if (category === 'High') {
      actionKeys.push('action_high_1');
      actionKeys.push('action_high_2');
      actionKeys.push('action_high_3');
    } else if (category === 'Moderate') {
      actionKeys.push('action_moderate_1');
      actionKeys.push('action_moderate_2');
      actionKeys.push('action_moderate_3');
    } else {
      actionKeys.push('action_low_1');
      actionKeys.push('action_low_2');
    }

    return { risk, category, actionKeys, actions: actionKeys.map((key) => t(key)) };
  }

  function nearestResources(communityKey, topN) {
    const point = NutriData.communities[communityKey];
    if (!point) return NutriData.resources.slice(0, topN);

    return NutriData.resources
      .map((resource) => ({
        ...resource,
        distanceKm: Number(NutriApp.haversineKm(point.lat, point.lng, resource.lat, resource.lng).toFixed(1))
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, topN);
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    validationNode.classList.add('hide');

    const selectedSymptoms = getSelected('symptoms');
    const selectedFoodIds = [];
    const selectedFoods = [];

    const matchedCommunity = resolveCommunity(form.community.value);

    const payload = {
      role: form.role.value,
      language: resolveLanguage(form.language.value),
      householdName: form.householdName.value.trim(),
      community: matchedCommunity.label,
      communityKey: matchedCommunity.key,
      ageYears: Number(form.ageYears.value),
      sex: form.sex.value,
      householdSize: Number(form.householdSize.value),
      weeklyBudget: Number(form.weeklyBudget.value),
      weight: Number(form.weight.value),
      height: Number(form.height.value),
      muac: String(form.muac.value || '').trim() ? Number(form.muac.value) : null,
      mealsPerDay: Number(form.mealsPerDay.value),
      dietDiversity: Number(form.dietDiversity.value),
      waterSource: form.waterSource.value,
      notes: form.notes.value.trim()
    };

    for (const field of requiredFields) {
      if (!String(payload[field] ?? '').trim()) {
        validationNode.textContent = t('validation_required');
        validationNode.classList.remove('hide');
        return;
      }
    }

    const deficiencies = inferDeficiencies(selectedSymptoms, selectedFoods);
    const riskOutput = computeRisk(payload, selectedSymptoms, selectedFoods);
    const mealPlan = buildMealPlan(selectedFoods, deficiencies, payload.weeklyBudget, payload.householdSize);
    const resources = nearestResources(payload.communityKey, 3);

    const report = {
      id: `rep-${Date.now()}`,
      createdAt: new Date().toISOString(),
      payload,
      selectedSymptoms,
      selectedFoodIds,
      riskOutput,
      deficiencies,
      mealPlan,
      resources,
      followUpDue:
        riskOutput.category === 'Urgent'
          ? 2
          : riskOutput.category === 'High'
            ? 7
            : riskOutput.category === 'Moderate'
              ? 14
              : 30
    };

    NutriApp.saveReport(report);
    window.location.href = './assessment.html?view=results';
  });
})();
