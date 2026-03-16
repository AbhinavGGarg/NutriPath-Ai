(function () {
  const t = (key, vars) => (window.NutriApp?.t ? window.NutriApp.t(key, vars) : key);
  const tx = (key, fallback, vars) => {
    const value = t(key, vars);
    return value === key ? fallback : value;
  };
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

  function initFoodBuilder() {
    const input = document.getElementById('hub-food-input');
    const datalist = document.getElementById('hub-food-options');
    const addButton = document.getElementById('hub-add-food');
    const clearButton = document.getElementById('hub-clear-foods');
    const analyzeButton = document.getElementById('hub-analyze-foods');
    const selectedNode = document.getElementById('hub-selected-foods');
    const statusNode = document.getElementById('hub-food-status');
    const resultShell = document.getElementById('hub-food-results');
    const mealList = document.getElementById('hub-meal-list');
    const nutrientList = document.getElementById('hub-nutrient-list');
    const addonList = document.getElementById('hub-addon-list');

    if (!input || !datalist || !addButton || !clearButton || !analyzeButton || !selectedNode || !statusNode || !resultShell || !mealList || !nutrientList || !addonList) {
      return;
    }

    const selectedFoodIds = new Set();
    let hasAnalysis = false;

    const foods = NutriData.foods.slice().sort((a, b) => a.name.localeCompare(b.name));

    const nutrientFallback = {
      protein: 'Protein',
      iron: 'Iron',
      zinc: 'Zinc',
      calories: 'Calories',
      vitaminA: 'Vitamin A',
      vitaminC: 'Vitamin C',
      folate: 'Folate',
      calcium: 'Calcium',
      carbs: 'Carbohydrates',
      fiber: 'Fiber',
      fat: 'Healthy fats',
      omega3: 'Omega-3'
    };

    function foodLabel(food) {
      const key = `food_${food.id}`;
      const translated = t(key);
      return translated === key ? food.name : translated;
    }

    function nutrientLabel(nutrientKey) {
      if (nutrientKey === 'vitaminA') return tx('nutrient_vitamin_a', nutrientFallback.vitaminA);
      if (nutrientKey === 'protein') return tx('nutrient_protein', nutrientFallback.protein);
      if (nutrientKey === 'iron') return tx('nutrient_iron', nutrientFallback.iron);
      if (nutrientKey === 'zinc') return tx('nutrient_zinc', nutrientFallback.zinc);
      if (nutrientKey === 'calories') return tx('nutrient_calories', nutrientFallback.calories);
      return nutrientFallback[nutrientKey] || nutrientKey;
    }

    function setStatus(text) {
      statusNode.textContent = text;
    }

    function renderFoodOptions() {
      datalist.innerHTML = '';
      foods.forEach((food) => {
        const option = document.createElement('option');
        option.value = foodLabel(food);
        datalist.appendChild(option);
      });
    }

    function renderSelectedFoods() {
      selectedNode.innerHTML = '';
      if (!selectedFoodIds.size) {
        setStatus('No foods added yet. Add foods and click Analyze Foods.');
        return;
      }

      const selectedFoods = foods.filter((food) => selectedFoodIds.has(food.id));
      selectedFoods.forEach((food) => {
        const chip = document.createElement('span');
        chip.className = 'selected-food-chip';
        chip.innerHTML = `
          ${foodLabel(food)}
          <button type="button" data-remove-food="${food.id}" aria-label="Remove ${foodLabel(food)}">x</button>
        `;
        selectedNode.appendChild(chip);
      });
      setStatus(`Selected ${selectedFoodIds.size} food(s). Click Analyze Foods to see insights.`);
    }

    function clearAnalysisLists() {
      mealList.innerHTML = '';
      nutrientList.innerHTML = '';
      addonList.innerHTML = '';
    }

    function resolveFoodFromInput(raw) {
      const query = String(raw || '').trim().toLowerCase();
      if (!query) return null;

      const exact = foods.find((food) => food.name.toLowerCase() === query || foodLabel(food).toLowerCase() === query);
      if (exact) return exact;

      return foods.find(
        (food) => food.name.toLowerCase().includes(query) || foodLabel(food).toLowerCase().includes(query)
      ) || null;
    }

    function addFood() {
      const match = resolveFoodFromInput(input.value);
      if (!match) {
        setStatus('Food not recognized. Try another name from the suggestions.');
        return;
      }
      selectedFoodIds.add(match.id);
      input.value = '';
      hasAnalysis = false;
      resultShell.classList.add('hide');
      clearAnalysisLists();
      renderSelectedFoods();
    }

    function listToUi(node, items, fallback) {
      node.innerHTML = '';
      if (!items.length) {
        const li = document.createElement('li');
        li.textContent = fallback;
        node.appendChild(li);
        return;
      }
      items.forEach((item) => {
        const li = document.createElement('li');
        li.textContent = item;
        node.appendChild(li);
      });
    }

    function analyzeFoods() {
      const selectedFoods = foods.filter((food) => selectedFoodIds.has(food.id));
      if (!selectedFoods.length) {
        setStatus('Add at least one food before analysis.');
        resultShell.classList.add('hide');
        return;
      }

      const carbFoods = selectedFoods.filter((food) => food.nutrients.includes('carbs'));
      const proteinFoods = selectedFoods.filter((food) => food.nutrients.includes('protein'));
      const protectiveFoods = selectedFoods.filter((food) =>
        food.nutrients.some((nutrient) => ['vitaminA', 'vitaminC', 'iron', 'folate'].includes(nutrient))
      );

      const mealIdeas = [];
      const maxMeals = 6;
      for (let idx = 0; idx < maxMeals; idx += 1) {
        if (carbFoods.length && proteinFoods.length && protectiveFoods.length) {
          const carb = carbFoods[idx % carbFoods.length];
          const protein = proteinFoods[idx % proteinFoods.length];
          const protective = protectiveFoods[idx % protectiveFoods.length];
          const idea = `${foodLabel(carb)} + ${foodLabel(protein)} + ${foodLabel(protective)}`;
          if (!mealIdeas.includes(idea)) mealIdeas.push(idea);
        } else if (selectedFoods.length >= 2) {
          const a = selectedFoods[idx % selectedFoods.length];
          const b = selectedFoods[(idx + 1) % selectedFoods.length];
          const idea = `${foodLabel(a)} + ${foodLabel(b)}`;
          if (!mealIdeas.includes(idea)) mealIdeas.push(idea);
        } else {
          mealIdeas.push(foodLabel(selectedFoods[0]));
        }
      }

      const nutrientToFoods = new Map();
      selectedFoods.forEach((food) => {
        food.nutrients.forEach((nutrient) => {
          if (!nutrientToFoods.has(nutrient)) nutrientToFoods.set(nutrient, new Set());
          nutrientToFoods.get(nutrient).add(foodLabel(food));
          if (nutrient === 'carbs' || nutrient === 'fat') {
            if (!nutrientToFoods.has('calories')) nutrientToFoods.set('calories', new Set());
            nutrientToFoods.get('calories').add(foodLabel(food));
          }
        });
      });

      const nutrientInsights = [...nutrientToFoods.entries()]
        .map(([nutrient, foodSet]) => `${nutrientLabel(nutrient)}: ${[...foodSet].slice(0, 3).join(', ')}`)
        .sort((a, b) => a.localeCompare(b));

      const targetNutrients = ['protein', 'iron', 'vitaminA', 'zinc', 'vitaminC', 'calories'];
      const missing = targetNutrients.filter((nutrient) => !nutrientToFoods.has(nutrient));
      const addons = [];

      if (missing.length) {
        const candidates = foods
          .filter((food) => !selectedFoodIds.has(food.id))
          .map((food) => {
            const matches = [];
            food.nutrients.forEach((nutrient) => {
              if (missing.includes(nutrient)) matches.push(nutrient);
              if ((nutrient === 'carbs' || nutrient === 'fat') && missing.includes('calories')) matches.push('calories');
            });
            return { food, matches: [...new Set(matches)] };
          })
          .filter((entry) => entry.matches.length)
          .sort((a, b) => b.matches.length - a.matches.length || a.food.cost - b.food.cost)
          .slice(0, 6);

        candidates.forEach((entry) => {
          addons.push(
            `${foodLabel(entry.food)} -> adds ${entry.matches.map((nutrient) => nutrientLabel(nutrient)).join(', ')}`
          );
        });
      } else {
        addons.push('Great coverage across core nutrients. Keep rotating foods for diversity.');
      }

      listToUi(mealList, mealIdeas, 'No meal ideas yet.');
      listToUi(nutrientList, nutrientInsights, 'No nutrient data yet.');
      listToUi(addonList, addons, 'No add-on suggestions.');
      resultShell.classList.remove('hide');
      hasAnalysis = true;
      setStatus(`Analysis ready for ${selectedFoods.length} selected food(s).`);
    }

    addButton.addEventListener('click', addFood);
    clearButton.addEventListener('click', () => {
      selectedFoodIds.clear();
      hasAnalysis = false;
      input.value = '';
      clearAnalysisLists();
      resultShell.classList.add('hide');
      renderSelectedFoods();
    });
    analyzeButton.addEventListener('click', analyzeFoods);

    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        addFood();
      }
    });

    selectedNode.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const removeId = target.dataset.removeFood;
      if (!removeId) return;
      selectedFoodIds.delete(removeId);
      hasAnalysis = false;
      resultShell.classList.add('hide');
      clearAnalysisLists();
      renderSelectedFoods();
    });

    window.addEventListener('nutri:lang-changed', () => {
      renderFoodOptions();
      renderSelectedFoods();
      if (hasAnalysis) analyzeFoods();
    });

    renderFoodOptions();
    renderSelectedFoods();
  }

  initFoodBuilder();
})();
