(function () {
  const t = (key, vars) => (window.NutriApp?.t ? window.NutriApp.t(key, vars) : key);
  const grid = document.getElementById('lesson-grid');
  if (!grid) return;

  NutriData.lessons.forEach((lesson) => {
    const node = document.createElement('article');
    node.className = 'lesson-card';
    node.innerHTML = `
      <span class="badge">${lesson.level}</span>
      <h3>${lesson.title}</h3>
      <p class="small-text">${lesson.content}</p>
      <div class="alert alert-warn">${lesson.quickTip}</div>
      <div class="cta-row" style="margin-top: 0.7rem;">
        <button type="button" class="btn btn-secondary" data-speak="${lesson.id}">Listen</button>
      </div>
    `;
    grid.appendChild(node);
  });

  grid.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const id = target.dataset.speak;
    if (!id) return;

    const lesson = NutriData.lessons.find((item) => item.id === id);
    if (!lesson) return;
    NutriApp.speak(`${lesson.title}. ${lesson.content}. Quick tip: ${lesson.quickTip}.`);
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
    NutriApp.speak('Early warning signs include poor appetite, repeated diarrhea, visible wasting, and lethargy. Refer urgent signs immediately.');
  });

  document.getElementById('speak-meal').addEventListener('click', () => {
    NutriApp.speak('Build each meal with one energy food, one protein food, and one vitamin rich food. Use local affordable ingredients.');
  });
})();
