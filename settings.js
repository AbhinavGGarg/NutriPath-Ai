(function () {
  const select = document.getElementById('ui-language');
  const status = document.getElementById('settings-status');
  if (!select || !window.NutriApp) return;

  function setStatus(text, ok) {
    status.textContent = text;
    status.className = `status-msg ${ok ? 'status-ok' : 'status-err'}`;
  }

  function renderOptions() {
    const langs = NutriApp.getAvailableUiLanguages();
    const current = NutriApp.getUiLanguage();
    select.innerHTML = '';

    langs.forEach((lang) => {
      const option = document.createElement('option');
      option.value = lang.code;
      option.textContent = lang.label;
      if (lang.code === current) option.selected = true;
      select.appendChild(option);
    });
  }

  renderOptions();

  select.addEventListener('change', () => {
    NutriApp.setUiLanguage(select.value);
    setStatus(NutriApp.t('settings_saved'), true);
  });

  window.addEventListener('nutri:lang-changed', () => {
    renderOptions();
    NutriApp.translatePage(document);
  });
})();
