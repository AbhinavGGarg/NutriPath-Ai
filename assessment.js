(function () {
  const form = document.getElementById('assessment-form');
  if (!form) return;

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
  const communityNode = document.getElementById('community');
  const progressNode = document.getElementById('progress');
  const validationNode = document.getElementById('validation-message');

  const communityNames = Object.keys(NutriData.communities);
  communityNames.forEach((name) => {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = `${name}, ${NutriData.communities[name].country}`;
    communityNode.appendChild(option);
  });

  symptoms.forEach((symptom) => {
    const label = document.createElement('label');
    label.className = 'checkbox-item';
    label.innerHTML = `<input type="checkbox" name="symptoms" value="${symptom.id}" /> <span>${symptom.label}</span>`;
    symptomNode.appendChild(label);
  });

  NutriData.foods.forEach((food) => {
    const label = document.createElement('label');
    label.className = 'checkbox-item';
    label.innerHTML = `<input type="checkbox" name="foods" value="${food.id}" /> <span>${food.name}</span>`;
    foodNode.appendChild(label);
  });

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
  updateProgress();

  function getSelected(name) {
    return Array.from(form.querySelectorAll(`input[name="${name}"]:checked`)).map((item) => item.value);
  }

  function buildMealPlan(selectedFoods, deficiencies, weeklyBudget, householdSize) {
    const foods = selectedFoods.length
      ? selectedFoods
      : NutriData.foods.filter((food) => food.cost <= 1.4).slice(0, 8);

    const carbFoods = foods.filter((f) => f.nutrients.includes('carbs'));
    const proteinFoods = foods.filter((f) => f.nutrients.includes('protein'));
    const protectFoods = foods.filter((f) =>
      f.nutrients.some((nutrient) => ['vitaminA', 'iron', 'vitaminC', 'folate'].includes(nutrient))
    );

    const mustTarget = deficiencies.map((d) => d.name.toLowerCase());
    const highPriorityFoods = foods
      .map((food) => {
        const matches = food.nutrients.reduce((acc, n) => {
          if (mustTarget.some((target) => target.includes(n.replace('vitamin', 'vitamin ')))) return acc + 1;
          if (mustTarget.includes('iron') && n === 'iron') return acc + 1;
          if (mustTarget.includes('protein') && n === 'protein') return acc + 1;
          if (mustTarget.includes('vitamin a') && n === 'vitaminA') return acc + 1;
          return acc;
        }, 0);
        return { food, matches, rank: food.score + matches * 7 };
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
        Math.min(1.2, 0.55 + householdSize * 0.12);

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

  function nearestResources(communityName, topN) {
    const point = NutriData.communities[communityName];
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
      validationNode.textContent = 'Select at least 3 available foods so the AI meal planner can generate realistic recommendations.';
      validationNode.classList.remove('hide');
      return;
    }

    const payload = {
      role: form.role.value,
      language: form.language.value,
      householdName: form.householdName.value.trim(),
      community: form.community.value,
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
        validationNode.textContent = 'Please complete all required fields before running the AI assessment.';
        validationNode.classList.remove('hide');
        return;
      }
    }

    const selectedFoods = NutriData.foods.filter((food) => selectedFoodIds.includes(food.id));
    const deficiencies = inferDeficiencies(selectedSymptoms, selectedFoods);
    const riskOutput = computeRisk(payload, selectedSymptoms, selectedFoods);
    const mealPlan = buildMealPlan(selectedFoods, deficiencies, payload.weeklyBudget, payload.householdSize);
    const resources = nearestResources(payload.community, 3);

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
