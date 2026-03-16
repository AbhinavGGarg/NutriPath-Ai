(function () {
  const t = (key, vars) => (window.NutriApp?.t ? window.NutriApp.t(key, vars) : key);
  const grid = document.getElementById('lesson-grid');
  if (!grid) return;

  const localizedLessons = new Map();

  function localizedValue(key, fallback) {
    if (window.NutriApp?.hasTranslation && window.NutriApp.hasTranslation(key)) {
      return t(key);
    }
    return fallback;
  }

  function levelKey(level) {
    const normalized = String(level || '').trim().toLowerCase();
    const map = {
      beginner: 'lesson_level_beginner',
      essential: 'lesson_level_essential',
      intermediate: 'lesson_level_intermediate'
    };
    return map[normalized] || '';
  }

  NutriData.lessons.forEach((lesson) => {
    const num = String(lesson.id || '').replace('lesson-', '');
    const localized = {
      title: localizedValue(`lesson_${num}_title`, lesson.title),
      content: localizedValue(`lesson_${num}_content`, lesson.content),
      quickTip: localizedValue(`lesson_${num}_tip`, lesson.quickTip),
      level: localizedValue(levelKey(lesson.level), lesson.level)
    };
    localizedLessons.set(lesson.id, localized);

    const node = document.createElement('article');
    node.className = 'lesson-card';
    node.innerHTML = `
      <span class="badge">${localized.level}</span>
      <h3>${localized.title}</h3>
      <p class="small-text">${localized.content}</p>
      <div class="alert alert-warn">${localizedValue('learn_quick_tip_prefix', 'Quick tip')}: ${localized.quickTip}</div>
      <div class="cta-row" style="margin-top: 0.7rem;">
        <button type="button" class="btn btn-secondary" data-speak="${lesson.id}">${t('learn_btn_listen')}</button>
      </div>
    `;
    grid.appendChild(node);
  });

  grid.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const id = target.dataset.speak;
    if (!id) return;

    const lesson = localizedLessons.get(id);
    if (!lesson) return;
    NutriApp.speak(
      t('learn_speak_lesson', {
        title: lesson.title,
        content: lesson.content,
        tip: lesson.quickTip
      })
    );
  });

  const feedback = document.getElementById('quiz-feedback');
  document.querySelectorAll('[data-answer]').forEach((button) => {
    button.addEventListener('click', () => {
      const answer = button.getAttribute('data-answer');
      if (answer === 'myth') {
        feedback.textContent = t('learn_quiz_correct');
        feedback.style.color = '#11825f';
      } else {
        feedback.textContent = t('learn_quiz_wrong');
        feedback.style.color = '#e63946';
      }
    });
  });

  document.getElementById('speak-warning').addEventListener('click', () => {
    NutriApp.speak(t('learn_speak_warning'));
  });

  document.getElementById('speak-meal').addEventListener('click', () => {
    NutriApp.speak(t('learn_speak_meal'));
  });
})();
