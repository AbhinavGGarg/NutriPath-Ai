(function () {
  const t = (key, vars) => (window.NutriApp?.t ? window.NutriApp.t(key, vars) : key);
  const riskLabel = (category) => (window.NutriApp?.getRiskLabel ? window.NutriApp.getRiskLabel(category) : category);
  const metricTotal = document.getElementById('m-total');
  const metricCritical = document.getElementById('m-critical');
  const metricFollow = document.getElementById('m-follow');
  const metricAvg = document.getElementById('m-avg');
  const recentBody = document.querySelector('#recent-table tbody');
  const actionQueue = document.getElementById('action-queue');
  const seedButton = document.getElementById('seed-demo');

  let riskChart;
  let hotspotChart;

  function buildCharts(history) {
    if (riskChart) riskChart.destroy();
    if (hotspotChart) hotspotChart.destroy();

    const counts = { Low: 0, Moderate: 0, High: 0, Urgent: 0 };
    history.forEach((entry) => {
      const category = entry?.riskOutput?.category || 'Low';
      counts[category] = (counts[category] || 0) + 1;
    });

    riskChart = new Chart(document.getElementById('risk-chart'), {
      type: 'doughnut',
      data: {
        labels: [t('risk_label_low'), t('risk_label_moderate'), t('risk_label_high'), t('risk_label_urgent')],
        datasets: [
          {
            data: [counts.Low, counts.Moderate, counts.High, counts.Urgent],
            backgroundColor: ['#11825f', '#f4b942', '#eb7d21', '#e63946']
          }
        ]
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'bottom' } }
      }
    });

    const hotspotCounts = {};
    history.forEach((entry) => {
      const community = entry?.payload?.community || 'Unknown';
      if (!['High', 'Urgent'].includes(entry?.riskOutput?.category)) return;
      hotspotCounts[community] = (hotspotCounts[community] || 0) + 1;
    });

    const hotspotEntries = Object.entries(hotspotCounts).sort((a, b) => b[1] - a[1]).slice(0, 6);
    hotspotChart = new Chart(document.getElementById('hotspot-chart'), {
      type: 'bar',
      data: {
        labels: hotspotEntries.map((entry) => entry[0]),
        datasets: [
          {
            label: t('dashboard_hotspot_label'),
            data: hotspotEntries.map((entry) => entry[1]),
            backgroundColor: '#17a398'
          }
        ]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        scales: { x: { ticks: { precision: 0 } } },
        plugins: { legend: { display: false } }
      }
    });
  }

  function renderDashboard() {
    const history = NutriApp.getHistory();

    metricTotal.textContent = String(history.length);
    const critical = history.filter((entry) => ['High', 'Urgent'].includes(entry?.riskOutput?.category)).length;
    metricCritical.textContent = String(critical);

    const now = Date.now();
    const followUpsDue = history.filter((entry) => {
      const created = new Date(entry.createdAt).getTime();
      const dueAt = created + (entry.followUpDue || 14) * 86400000;
      return dueAt - now <= 7 * 86400000;
    }).length;
    metricFollow.textContent = String(followUpsDue);

    const avgRisk = history.length
      ? Math.round(history.reduce((sum, entry) => sum + Number(entry?.riskOutput?.risk || 0), 0) / history.length)
      : 0;
    metricAvg.textContent = String(avgRisk);

    recentBody.innerHTML = '';
    history.slice(0, 10).forEach((entry) => {
      const row = document.createElement('tr');
      const household = entry.payload?.householdName || t('common_na');
      const community = entry.payload?.community || t('common_na');
      const category = entry.riskOutput?.category || 'Low';
      row.innerHTML = `
        <td>${NutriApp.formatDate(entry.createdAt)}</td>
        <td>${household}</td>
        <td>${community}</td>
        <td><span class="tag">${riskLabel(category)} (${entry.riskOutput?.risk || '-'})</span></td>
      `;
      recentBody.appendChild(row);
    });

    if (!history.length) {
      recentBody.innerHTML = `<tr><td colspan=\"4\">${t('dashboard_no_data')}</td></tr>`;
    }

    const queue = history
      .filter((entry) => ['High', 'Urgent'].includes(entry?.riskOutput?.category))
      .slice(0, 8);

    actionQueue.innerHTML = '';
    if (!queue.length) {
      actionQueue.innerHTML = `<div class=\"resource-item\">${t('dashboard_no_critical')}</div>`;
    } else {
      queue.forEach((entry) => {
        const node = document.createElement('div');
        node.className = 'resource-item';
        const category = entry.riskOutput?.category || 'Low';
        node.innerHTML = `
          <strong>${entry.payload?.householdName}</strong>
          <div class="small-text">${entry.payload?.community || t('common_na')} · ${riskLabel(category)} (${entry.riskOutput?.risk})</div>
          <div class="small-text">${t('results_followup', { days: entry.followUpDue })}</div>
        `;
        actionQueue.appendChild(node);
      });
    }

    buildCharts(history);
  }

  function seedDemoData() {
    const communities = Object.keys(NutriData.communities);
    const categories = ['Low', 'Moderate', 'High', 'Urgent'];
    const defA = [{ name: 'iron', score: 5, confidence: 70 }];

    const demo = Array.from({ length: 32 }).map((_, idx) => {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const scoreByCategory = {
        Low: 24 + Math.round(Math.random() * 10),
        Moderate: 40 + Math.round(Math.random() * 10),
        High: 58 + Math.round(Math.random() * 12),
        Urgent: 78 + Math.round(Math.random() * 15)
      };

      const dayOffset = Math.floor(Math.random() * 35);
      const createdAt = new Date(Date.now() - dayOffset * 86400000).toISOString();

      return {
        id: `demo-${idx}`,
        createdAt,
        payload: {
          householdName: `Demo HH-${110 + idx}`,
          community: communities[Math.floor(Math.random() * communities.length)]
        },
        riskOutput: {
          category,
          risk: scoreByCategory[category],
          actions: [t('dashboard_demo_action_1'), t('dashboard_demo_action_2')]
        },
        deficiencies: defA,
        mealPlan: { days: [], budgetRisk: 'moderate' },
        resources: [],
        followUpDue: category === 'Urgent' ? 2 : category === 'High' ? 7 : 14
      };
    });

    NutriApp.setHistory(demo);
    NutriApp.setCurrentReport(demo[0]);
    renderDashboard();
  }

  seedButton.addEventListener('click', seedDemoData);
  renderDashboard();
})();
