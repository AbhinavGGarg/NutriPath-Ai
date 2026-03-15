(function () {
  const page = document.body.dataset.page;
  const links = document.querySelectorAll('[data-nav]');
  links.forEach((link) => {
    if (link.dataset.nav === page) {
      link.classList.add('active');
    }
  });

  const yearNode = document.getElementById('year');
  if (yearNode) yearNode.textContent = String(new Date().getFullYear());

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(() => {
        // Ignore registration issues in restricted browsers.
      });
    });
  }

  window.NutriApp = {
    formatDate(value) {
      return new Date(value).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    },

    getHistory() {
      try {
        return JSON.parse(localStorage.getItem('nutriHistory') || '[]');
      } catch {
        return [];
      }
    },

    saveReport(report) {
      localStorage.setItem('nutriCurrentReport', JSON.stringify(report));
      const history = this.getHistory();
      history.unshift(report);
      localStorage.setItem('nutriHistory', JSON.stringify(history.slice(0, 250)));
    },

    getCurrentReport() {
      try {
        return JSON.parse(localStorage.getItem('nutriCurrentReport') || 'null');
      } catch {
        return null;
      }
    },

    speak(text) {
      if (!('speechSynthesis' in window)) return;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    },

    haversineKm(lat1, lon1, lat2, lon2) {
      const toRad = (n) => (n * Math.PI) / 180;
      const R = 6371;
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    }
  };
})();
