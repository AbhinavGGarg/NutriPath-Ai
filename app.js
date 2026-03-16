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
      let refreshing = false;

      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
      });

      navigator.serviceWorker
        .register('./sw.js')
        .then((registration) => {
          registration.update();
          setInterval(() => registration.update(), 60 * 1000);

          if (registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          }

          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (!newWorker) return;

            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                newWorker.postMessage({ type: 'SKIP_WAITING' });
              }
            });
          });
        })
        .catch(() => {
          // Ignore registration issues in restricted browsers.
        });
    });
  }

  const STORAGE_KEYS = {
    accounts: 'nutriAccountsV1',
    sessionUserId: 'nutriSessionUserIdV1',
    guestHistory: 'nutriGuestHistoryV1',
    guestCurrent: 'nutriGuestCurrentV1'
  };

  function parseJSON(raw, fallback) {
    try {
      return JSON.parse(raw || '');
    } catch {
      return fallback;
    }
  }

  function getAccounts() {
    return parseJSON(localStorage.getItem(STORAGE_KEYS.accounts), []);
  }

  function saveAccounts(accounts) {
    localStorage.setItem(STORAGE_KEYS.accounts, JSON.stringify(accounts));
  }

  function currentUserId() {
    return sessionStorage.getItem(STORAGE_KEYS.sessionUserId);
  }

  function currentUser() {
    const userId = currentUserId();
    if (!userId) return null;
    return getAccounts().find((account) => account.id === userId) || null;
  }

  function reportsKey(base, user) {
    if (!user) return base;
    return `${base}:${user.id}`;
  }

  function getReportStorage() {
    const user = currentUser();
    const storage = user ? localStorage : sessionStorage;
    const historyKey = reportsKey(STORAGE_KEYS.guestHistory, user);
    const currentKey = reportsKey(STORAGE_KEYS.guestCurrent, user);
    return { user, storage, historyKey, currentKey };
  }

  function createAuthButtons() {
    const nav = document.querySelector('.nav');
    if (!nav) return;

    const existing = document.getElementById('auth-controls');
    if (existing) existing.remove();

    const controls = document.createElement('div');
    controls.id = 'auth-controls';
    controls.className = 'auth-controls';

    const user = currentUser();

    if (user) {
      const userTag = document.createElement('span');
      userTag.className = 'auth-user';
      userTag.textContent = `Signed in: ${user.name || user.email}`;

      const accountLink = document.createElement('a');
      accountLink.className = 'btn btn-secondary btn-small';
      accountLink.href = './auth.html';
      accountLink.textContent = 'Account';

      const logoutButton = document.createElement('button');
      logoutButton.type = 'button';
      logoutButton.className = 'btn btn-secondary btn-small';
      logoutButton.textContent = 'Log out';
      logoutButton.addEventListener('click', () => {
        NutriApp.logout();
        window.location.reload();
      });

      controls.appendChild(userTag);
      controls.appendChild(accountLink);
      controls.appendChild(logoutButton);
    } else {
      const loginLink = document.createElement('a');
      loginLink.className = 'btn btn-secondary btn-small';
      loginLink.href = './auth.html?mode=login';
      loginLink.textContent = 'Log in';

      const signUpLink = document.createElement('a');
      signUpLink.className = 'btn btn-primary btn-small';
      signUpLink.href = './auth.html?mode=signup';
      signUpLink.textContent = 'Sign up';

      controls.appendChild(loginLink);
      controls.appendChild(signUpLink);
    }

    nav.appendChild(controls);
  }

  window.NutriApp = {
    formatDate(value) {
      return new Date(value).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    },

    getCurrentUser() {
      return currentUser();
    },

    isAuthenticated() {
      return Boolean(currentUser());
    },

    getStorageMode() {
      return currentUser() ? 'account' : 'guest';
    },

    createAccount({ name, email, password }) {
      const cleanName = String(name || '').trim();
      const cleanEmail = String(email || '').trim().toLowerCase();
      const cleanPassword = String(password || '');

      if (!cleanName || !cleanEmail || !cleanPassword) {
        return { ok: false, error: 'Please complete all sign-up fields.' };
      }

      if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
        return { ok: false, error: 'Please enter a valid email address.' };
      }

      if (cleanPassword.length < 6) {
        return { ok: false, error: 'Password must be at least 6 characters.' };
      }

      const accounts = getAccounts();
      if (accounts.some((account) => account.email === cleanEmail)) {
        return { ok: false, error: 'An account with this email already exists.' };
      }

      const newAccount = {
        id: `usr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        name: cleanName,
        email: cleanEmail,
        password: cleanPassword,
        createdAt: new Date().toISOString()
      };

      accounts.push(newAccount);
      saveAccounts(accounts);

      return { ok: true, account: { id: newAccount.id, name: newAccount.name, email: newAccount.email } };
    },

    login(email, password) {
      const cleanEmail = String(email || '').trim().toLowerCase();
      const cleanPassword = String(password || '');
      const account = getAccounts().find((item) => item.email === cleanEmail && item.password === cleanPassword);

      if (!account) {
        return { ok: false, error: 'Invalid email or password.' };
      }

      sessionStorage.setItem(STORAGE_KEYS.sessionUserId, account.id);
      createAuthButtons();
      return { ok: true, user: { id: account.id, name: account.name, email: account.email } };
    },

    logout() {
      sessionStorage.removeItem(STORAGE_KEYS.sessionUserId);
      createAuthButtons();
    },

    getHistory() {
      const { storage, historyKey } = getReportStorage();
      return parseJSON(storage.getItem(historyKey), []);
    },

    setHistory(history) {
      const { storage, historyKey } = getReportStorage();
      storage.setItem(historyKey, JSON.stringify(history.slice(0, 250)));
    },

    saveReport(report) {
      const { storage, historyKey, currentKey } = getReportStorage();
      storage.setItem(currentKey, JSON.stringify(report));
      const history = parseJSON(storage.getItem(historyKey), []);
      history.unshift(report);
      storage.setItem(historyKey, JSON.stringify(history.slice(0, 250)));
    },

    getCurrentReport() {
      const { storage, currentKey } = getReportStorage();
      return parseJSON(storage.getItem(currentKey), null);
    },

    setCurrentReport(report) {
      const { storage, currentKey } = getReportStorage();
      storage.setItem(currentKey, JSON.stringify(report));
    },

    clearGuestData() {
      sessionStorage.removeItem(STORAGE_KEYS.guestHistory);
      sessionStorage.removeItem(STORAGE_KEYS.guestCurrent);
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

  createAuthButtons();
})();
