(function () {
  const form = document.getElementById('assessment-form');
  if (!form) return;
  const t = (key, vars) => (window.NutriApp?.t ? window.NutriApp.t(key, vars) : key);

  const symptoms = [
    { id: 'fatigue', label: 'Fatigue / low energy', weight: 6, nutrients: ['iron', 'protein'] },
    { id: 'poor_appetite', label: 'Poor appetite', weight: 8, nutrients: ['zinc', 'protein'] },
    { id: 'diarrhea', label: 'Frequent diarrhea', weight: 10, nutrients: ['zinc', 'calories'] },
    { id: 'fever', label: 'Recent fever/infection', weight: 7, nutrients: ['protein', 'vitaminA'] },
    { id: 'pallor', label: 'Pale skin / pallor', weight: 11, nutrients: ['iron', 'folate'] },
    { id: 'edema', label: 'Edema/swelling', weight: 20, nutrients: ['protein'] },
    { id: 'wasting', label: 'Visible wasting', weight: 16, nutrients: ['calories', 'protein'] },
    { id: 'hair_loss', label: 'Hair thinning/discoloration', weight: 8, nutrients: ['zinc', 'protein'] },
    { id: 'night_vision', label: 'Poor vision in low light', weight: 12, nutrients: ['vitaminA'] },
    { id: 'lethargy', label: 'Lethargy/not alert', weight: 16, nutrients: ['calories', 'iron'] }
  ];

  const symptomNode = document.getElementById('symptom-list');
  const foodNode = document.getElementById('food-list');
  const foodSearchNode = document.getElementById('food-search');
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

  symptoms.forEach((symptom) => {
    const label = document.createElement('label');
    label.className = 'checkbox-item';
    label.innerHTML = `<input type="checkbox" name="symptoms" value="${symptom.id}" /> <span>${symptom.label}</span>`;
    symptomNode.appendChild(label);
  });

  const sortedFoods = NutriData.foods.slice().sort((a, b) => a.name.localeCompare(b.name));
  const foodFragment = document.createDocumentFragment();
  sortedFoods.forEach((food) => {
    const label = document.createElement('label');
    label.className = 'checkbox-item';
    label.dataset.foodName = food.name.toLowerCase();
    label.innerHTML = `<input type="checkbox" name="foods" value="${food.id}" /> <span>${food.name}</span>`;
    foodFragment.appendChild(label);
  });
  foodNode.appendChild(foodFragment);

  const requiredFields = [
    'role',
    'language',
    'householdName',
    'community',
    'ageMonths',
    'sex',
    'householdSize',
    'weeklyBudget',
    'weight',
    'height',
    'muac',
    'mealsPerDay',
    'dietDiversity',
    'waterSource'
  ];

  function normalizeText(value) {
    return String(value || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
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

  function filterFoods(term) {
    const normalized = normalizeText(term);
    const items = foodNode.querySelectorAll('.checkbox-item');
    items.forEach((item) => {
      const name = item.dataset.foodName || '';
      const visible = !normalized || name.includes(normalized);
      item.classList.toggle('hide', !visible);
    });
  }

  function updateProgress() {
    const total = requiredFields.length + 2;
    let filled = 0;

    requiredFields.forEach((field) => {
      const value = String(form.elements[field]?.value || '').trim();
      if (value) filled += 1;
    });

    if (form.querySelectorAll('input[name="symptoms"]:checked').length > 0) filled += 1;
    if (form.querySelectorAll('input[name="foods"]:checked').length > 0) filled += 1;

    const pct = Math.round((filled / total) * 100);
    const bar = progressNode.querySelector('span');
    bar.style.width = `${pct}%`;
    progressNode.setAttribute('aria-valuenow', String(pct));
  }

  form.addEventListener('input', updateProgress);
  form.addEventListener('change', updateProgress);

  if (foodSearchNode) {
    foodSearchNode.addEventListener('input', () => {
      filterFoods(foodSearchNode.value);
    });
  }

  updateProgress();

  function getSelected(name) {
    return Array.from(form.querySelectorAll(`input[name="${name}"]:checked`)).map((item) => item.value);
  }

  function buildMealPlan(selectedFoods, deficiencies, weeklyBudget, householdSize) {
    const foods = selectedFoods.length ? selectedFoods : NutriData.foods.filter((food) => food.cost <= 1.5).slice(0, 10);

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
      const breakfast = `${safeCarbs[idx % safeCarbs.length].name} porridge + ${safeProteins[(idx + 1) % safeProteins.length].name}`;
      const lunch = `${safeCarbs[(idx + 2) % safeCarbs.length].name} + ${safeProteins[idx % safeProteins.length].name} + ${safeProtective[idx % safeProtective.length].name}`;
      const dinner = `${safeProteins[(idx + 3) % safeProteins.length].name} stew + ${safeCarbs[(idx + 1) % safeCarbs.length].name} + ${safeProtective[(idx + 2) % safeProtective.length].name}`;

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

    if (payload.muac < 11.5) risk += 38;
    else if (payload.muac < 12.5) risk += 27;
    else if (payload.muac < 13.5) risk += 12;

    const bmi = payload.weight / ((payload.height / 100) * (payload.height / 100));
    if (payload.ageMonths <= 60) {
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

    if (selectedFoods.length < 5) risk += 8;

    risk = Math.max(1, Math.min(99, Math.round(risk)));

    let category = 'Low';
    if (risk >= 75) category = 'Urgent';
    else if (risk >= 55) category = 'High';
    else if (risk >= 35) category = 'Moderate';

    const actions = [];
    if (category === 'Urgent') {
      actions.push('Refer to nearest clinic within 24 hours for severe acute malnutrition screening.');
      actions.push('Start high-energy, high-protein meals immediately and monitor hydration.');
      actions.push('Schedule follow-up visit within 48 hours.');
    } else if (category === 'High') {
      actions.push('Book nutrition consult this week and repeat MUAC in 7 days.');
      actions.push('Increase meal frequency to 4 times/day with protein at least twice daily.');
      actions.push('Track appetite and stool consistency daily.');
    } else if (category === 'Moderate') {
      actions.push('Improve diet diversity this week and add one iron-rich food daily.');
      actions.push('Repeat growth check in 14 days.');
      actions.push('Complete caregiver nutrition micro-lessons in Learning Hub.');
    } else {
      actions.push('Continue current feeding practices and re-screen monthly.');
      actions.push('Maintain safe water and handwashing routines.');
    }

    return { risk, category, actions };
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
    const selectedFoodIds = getSelected('foods');

    if (selectedFoodIds.length < 3) {
      validationNode.textContent = t('validation_food_min');
      validationNode.classList.remove('hide');
      return;
    }

    const matchedCommunity = resolveCommunity(form.community.value);

    const payload = {
      role: form.role.value,
      language: resolveLanguage(form.language.value),
      householdName: form.householdName.value.trim(),
      community: matchedCommunity.label,
      communityKey: matchedCommunity.key,
      ageMonths: Number(form.ageMonths.value),
      sex: form.sex.value,
      householdSize: Number(form.householdSize.value),
      weeklyBudget: Number(form.weeklyBudget.value),
      weight: Number(form.weight.value),
      height: Number(form.height.value),
      muac: Number(form.muac.value),
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

    const selectedFoods = NutriData.foods.filter((food) => selectedFoodIds.includes(food.id));
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
    window.location.href = './results.html';
  });
})();
