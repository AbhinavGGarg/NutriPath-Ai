(function () {
  const t = (key, vars) => (window.NutriApp?.t ? window.NutriApp.t(key, vars) : key);
  const riskLabel = (category) => (window.NutriApp?.getRiskLabel ? window.NutriApp.getRiskLabel(category) : category);
  const metricTotal = document.getElementById('m-total');
  const metricCritical = document.getElementById('m-critical');
  const metricFollow = document.getElementById('m-follow');
  const metricAvg = document.getElementById('m-avg');
  const recentBody = document.querySelector('#recent-table tbody');
  const actionQueue = document.getElementById('action-queue');

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
    const rawHistory = NutriApp.getHistory();
    const history = rawHistory.filter((entry) => !String(entry?.id || '').startsWith('demo-'));

    if (history.length !== rawHistory.length) {
      NutriApp.setHistory(history);
      const current = NutriApp.getCurrentReport();
      if (String(current?.id || '').startsWith('demo-')) {
        NutriApp.setCurrentReport(history[0] || null);
      }
    }

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
      const noDataText = String(t('dashboard_no_data') || '')
        .replace(/\s*or load demo data\.?/i, '')
        .trim();
      recentBody.innerHTML = `<tr><td colspan="4">${noDataText || t('dashboard_no_data')}</td></tr>`;
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
  renderDashboard();
})();
