(function () {
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
  document.getElementById('risk-category').textContent = `${category} Risk`;

  const riskAlert = document.getElementById('risk-alert');
  riskAlert.textContent =
    category === 'Urgent'
      ? 'Critical risk detected. Immediate referral and close follow-up are required.'
      : category === 'High'
        ? 'Elevated risk. Start nutrition interventions now and schedule clinic review this week.'
        : category === 'Moderate'
          ? 'Moderate risk. Strengthen diet diversity and monitor growth in 2 weeks.'
          : 'Low immediate risk. Continue preventive nutrition and monthly monitoring.';

  riskAlert.className = `alert ${category === 'Urgent' ? 'alert-danger' : category === 'Low' ? 'alert-success' : 'alert-warn'}`;

  const summary = document.getElementById('result-summary');
  summary.textContent = `Screened household ${report.payload.householdName} on ${NutriApp.formatDate(report.createdAt)} in ${report.payload.community}.`;

  const actionsList = document.getElementById('actions-list');
  report.riskOutput.actions.forEach((action) => {
    const li = document.createElement('li');
    li.textContent = action;
    actionsList.appendChild(li);
  });

  document.getElementById('follow-up-text').textContent = `Next follow-up recommended in ${report.followUpDue} day(s).`;

  const deficiencyBody = document.querySelector('#deficiency-table tbody');
  report.deficiencies.forEach((item) => {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${item.name}</td><td>${item.score}</td><td>${item.confidence}%</td>`;
    deficiencyBody.appendChild(row);
  });

  const resourceCards = document.getElementById('resource-cards');
  report.resources.forEach((resource) => {
    const box = document.createElement('div');
    box.className = 'resource-item';
    box.innerHTML = `
      <strong>${resource.name}</strong>
      <div class="small-text">${resource.type} · ${resource.distanceKm} km away</div>
      <div class="small-text">${resource.open}</div>
      <div class="small-text">${resource.services.slice(0, 2).join(' · ')}</div>
    `;
    resourceCards.appendChild(box);
  });

  const mealBody = document.querySelector('#meal-plan-table tbody');
  report.mealPlan.days.forEach((day) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${day.day}</td>
      <td>${day.breakfast}</td>
      <td>${day.lunch}</td>
      <td>${day.dinner}</td>
      <td>$${day.estimatedCost}</td>
    `;
    mealBody.appendChild(row);
  });

  const budgetAlert = document.getElementById('budget-alert');
  if (report.mealPlan.budgetRisk === 'high') {
    budgetAlert.className = 'alert alert-danger';
    budgetAlert.textContent = 'Budget pressure is high. Prioritize beans/lentils/millet and request food support from nearby NGOs.';
  } else if (report.mealPlan.budgetRisk === 'moderate') {
    budgetAlert.className = 'alert alert-warn';
    budgetAlert.textContent = 'Budget is moderate. Use substitutions with fortified flour, leafy greens, and legumes.';
  } else {
    budgetAlert.className = 'alert alert-success';
    budgetAlert.textContent = 'Budget level can support the current meal plan while improving nutrient quality.';
  }

  document.getElementById('speak-btn').addEventListener('click', () => {
    const text = `Risk level is ${category}. Key actions are: ${report.riskOutput.actions.join(' ')} Top nutrient concerns are ${report.deficiencies
      .map((item) => item.name)
      .join(', ')}.`;
    NutriApp.speak(text);
  });

  document.getElementById('print-btn').addEventListener('click', () => window.print());
})();
