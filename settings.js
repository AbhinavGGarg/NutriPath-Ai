(function () {
  const input = document.getElementById('ui-language-input');
  const optionsNode = document.getElementById('ui-language-options');
  const applyButton = document.getElementById('apply-language-btn');
  const status = document.getElementById('settings-status');
  if (!input || !optionsNode || !applyButton || !status || !window.NutriApp) return;

  function setStatus(text, ok) {
    status.textContent = text;
    status.className = `status-msg ${ok ? 'status-ok' : 'status-err'}`;
  }

  function getLangDisplay(lang) {
    if (!lang) return '';
    return `${lang.label} / ${lang.native} (${lang.code})`;
  }

  function getLanguages() {
    return NutriApp.getAvailableUiLanguages().slice().sort((a, b) => a.label.localeCompare(b.label));
  }

  function fillOptions() {
    const languages = getLanguages();
    const currentCode = NutriApp.getUiLanguage();
    optionsNode.innerHTML = '';

    languages.forEach((lang) => {
      const option = document.createElement('option');
      option.value = getLangDisplay(lang);
      optionsNode.appendChild(option);
    });

    const current = languages.find((lang) => lang.code === currentCode);
    if (current) {
      input.value = getLangDisplay(current);
      setStatus(NutriApp.t('settings_current_language', { language: getLangDisplay(current) }), true);
    }
  }

  function resolveLanguageCode(rawValue) {
    const text = String(rawValue || '').trim();
    if (!text) return null;

    const lower = text.toLowerCase();
    const languages = getLanguages();

    const bracketMatch = text.match(/\(([a-z-]{2,6})\)\s*$/i);
    if (bracketMatch) {
      const code = bracketMatch[1].toLowerCase();
      if (languages.some((lang) => lang.code.toLowerCase() === code)) return code;
    }

    const exactCode = languages.find((lang) => lang.code.toLowerCase() === lower);
    if (exactCode) return exactCode.code;

    const exactLabel = languages.find(
      (lang) => lang.label.toLowerCase() === lower || lang.native.toLowerCase() === lower || getLangDisplay(lang).toLowerCase() === lower
    );
    if (exactLabel) return exactLabel.code;

    const partial = languages.find(
      (lang) =>
        lang.label.toLowerCase().includes(lower) ||
        lang.native.toLowerCase().includes(lower) ||
        getLangDisplay(lang).toLowerCase().includes(lower)
    );
    if (partial) return partial.code;

    return null;
  }

  function applyLanguageSelection() {
    const code = resolveLanguageCode(input.value);
    if (!code) {
      setStatus(NutriApp.t('settings_language_not_found'), false);
      return;
    }

    NutriApp.setUiLanguage(code);
    fillOptions();
    setStatus(NutriApp.t('settings_saved'), true);
  }

  fillOptions();

  applyButton.addEventListener('click', applyLanguageSelection);
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      applyLanguageSelection();
    }
  });
  input.addEventListener('change', applyLanguageSelection);

  window.addEventListener('nutri:lang-changed', () => {
    NutriApp.translatePage(document);
    fillOptions();
  });
})();
