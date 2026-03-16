(function () {
  const t = (key, vars) => (window.NutriApp?.t ? window.NutriApp.t(key, vars) : key);
  const riskLabel = (category) => (window.NutriApp?.getRiskLabel ? window.NutriApp.getRiskLabel(category) : category);
  const resourceTypeLabel = (type) => (window.NutriApp?.getResourceTypeLabel ? window.NutriApp.getResourceTypeLabel(type) : type);
  const nutrientLabel = (name) => (window.NutriApp?.getNutrientLabel ? window.NutriApp.getNutrientLabel(name) : name);
  const dayLabel = (day) => (window.NutriApp?.getDayLabel ? window.NutriApp.getDayLabel(day) : day);

  function escapeRegExp(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function localizeFoodText(text) {
    if (!window.NutriData?.foods) return text;
    let output = String(text || '');
    const foodsByLength = NutriData.foods.slice().sort((a, b) => b.name.length - a.name.length);
    foodsByLength.forEach((food) => {
      const translated = t(`food_${food.id}`);
      if (!translated || translated === `food_${food.id}`) return;
      const pattern = new RegExp(`\\b${escapeRegExp(food.name)}\\b`, 'gi');
      output = output.replace(pattern, translated);
    });
    return output;
  }

  const report = NutriApp.getCurrentReport();
  const emptyState = document.getElementById('empty-state');
  const content = document.getElementById('results-content');

  if (!report) {
    emptyState.classList.remove('hide');
    return;
  }

  content.classList.remove('hide');

  const categoryColors = {
    Low: '#11825f',
    Moderate: '#f4b942',
    High: '#eb7d21',
    Urgent: '#e63946'
  };

  const riskScore = report.riskOutput.risk;
  const category = report.riskOutput.category;
  const ring = document.getElementById('risk-ring');
  ring.style.setProperty('--ring-progress', String(riskScore));
  ring.style.setProperty('--ring-color', categoryColors[category] || '#17a398');

  document.getElementById('risk-score').textContent = String(riskScore);
  document.getElementById('risk-category').textContent = `${riskLabel(category)} ${t('results_risk_suffix')}`;

  const riskAlert = document.getElementById('risk-alert');
  riskAlert.textContent =
    category === 'Urgent'
      ? t('risk_urgent_alert')
      : category === 'High'
        ? t('risk_high_alert')
        : category === 'Moderate'
          ? t('risk_moderate_alert')
          : t('risk_low_alert');

  riskAlert.className = `alert ${category === 'Urgent' ? 'alert-danger' : category === 'Low' ? 'alert-success' : 'alert-warn'}`;

  const summary = document.getElementById('result-summary');
  summary.textContent = t('results_summary', {
    household: report.payload.householdName,
    date: NutriApp.formatDate(report.createdAt),
    community: report.payload.community
  });

  const fallbackActionKeysByCategory = {
    Urgent: ['action_urgent_1', 'action_urgent_2', 'action_urgent_3'],
    High: ['action_high_1', 'action_high_2', 'action_high_3'],
    Moderate: ['action_moderate_1', 'action_moderate_2', 'action_moderate_3'],
    Low: ['action_low_1', 'action_low_2']
  };

  const actionKeys =
    Array.isArray(report?.riskOutput?.actionKeys) && report.riskOutput.actionKeys.length
      ? report.riskOutput.actionKeys
      : fallbackActionKeysByCategory[category] || [];

  const actionItems = actionKeys.length ? actionKeys.map((key) => t(key)) : report.riskOutput.actions || [];

  const actionsList = document.getElementById('actions-list');
  actionItems.forEach((action) => {
    const li = document.createElement('li');
    li.textContent = action;
    actionsList.appendChild(li);
  });

  document.getElementById('follow-up-text').textContent = t('results_followup', { days: report.followUpDue });

  const deficiencyBody = document.querySelector('#deficiency-table tbody');
  report.deficiencies.forEach((item) => {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${nutrientLabel(item.name)}</td><td>${item.score}</td><td>${item.confidence}%</td>`;
    deficiencyBody.appendChild(row);
  });

  const resourceCards = document.getElementById('resource-cards');
  report.resources.forEach((resource) => {
    const box = document.createElement('div');
    box.className = 'resource-item';
    const distanceText = t('map_distance_away', { distance: resource.distanceKm });
    box.innerHTML = `
      <strong>${resource.name}</strong>
      <div class="small-text">${resourceTypeLabel(resource.type)} · ${distanceText}</div>
      <div class="small-text">${resource.open}</div>
      <div class="small-text">${resource.services.slice(0, 2).join(' · ')}</div>
    `;
    resourceCards.appendChild(box);
  });

  const mealBody = document.querySelector('#meal-plan-table tbody');
  report.mealPlan.days.forEach((day) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${dayLabel(day.day)}</td>
      <td>${localizeFoodText(day.breakfast)}</td>
      <td>${localizeFoodText(day.lunch)}</td>
      <td>${localizeFoodText(day.dinner)}</td>
      <td>$${day.estimatedCost}</td>
    `;
    mealBody.appendChild(row);
  });

  const budgetAlert = document.getElementById('budget-alert');
  if (report.mealPlan.budgetRisk === 'high') {
    budgetAlert.className = 'alert alert-danger';
    budgetAlert.textContent = t('budget_high');
  } else if (report.mealPlan.budgetRisk === 'moderate') {
    budgetAlert.className = 'alert alert-warn';
    budgetAlert.textContent = t('budget_moderate');
  } else {
    budgetAlert.className = 'alert alert-success';
    budgetAlert.textContent = t('budget_low');
  }

  document.getElementById('speak-btn').addEventListener('click', () => {
    const text = t('results_speak_summary', {
      risk: riskLabel(category),
      actions: actionItems.join(' '),
      nutrients: report.deficiencies.map((item) => nutrientLabel(item.name)).join(', ')
    });
    NutriApp.speak(text);
  });

  document.getElementById('print-btn').addEventListener('click', () => window.print());
})();
