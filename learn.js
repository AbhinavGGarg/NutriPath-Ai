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

    const selectedFoods = new Map();
    let customCounter = 1;
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
      if (food.custom) return food.name;
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
      if (!selectedFoods.size) {
        setStatus('No foods added yet. Add foods and click Analyze Foods.');
        return;
      }

      [...selectedFoods.values()].forEach((food) => {
        const chip = document.createElement('span');
        chip.className = 'selected-food-chip';
        chip.innerHTML = `
          ${foodLabel(food)}
          <button type="button" data-remove-food="${food.key}" aria-label="Remove ${foodLabel(food)}">x</button>
        `;
        selectedNode.appendChild(chip);
      });
      setStatus(`Selected ${selectedFoods.size} food(s). Click Analyze Foods to see insights.`);
    }

    function clearAnalysisLists() {
      mealList.innerHTML = '';
      nutrientList.innerHTML = '';
      addonList.innerHTML = '';
    }

    function normalizeText(value) {
      return String(value || '')
        .trim()
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s]+/gu, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    }

    function toTitleCase(value) {
      return String(value || '')
        .trim()
        .split(/\s+/)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(' ');
    }

    function inferCustomNutrients(name) {
      const text = normalizeText(name);
      const found = new Set();
      const keywordGroups = [
        { words: ['bread', 'roti', 'chapati', 'rice', 'wheat', 'maize', 'corn', 'oats', 'millet', 'sorghum', 'potato', 'cassava', 'yam', 'quinoa', 'barley', 'pasta', 'noodle'], nutrients: ['carbs', 'calories', 'fiber'] },
        { words: ['beans', 'lentil', 'chickpea', 'pea', 'soy', 'tofu', 'egg', 'fish', 'chicken', 'beef', 'goat', 'meat', 'milk', 'yogurt', 'cheese', 'groundnut', 'peanut', 'nut'], nutrients: ['protein'] },
        { words: ['spinach', 'kale', 'moringa', 'leaf', 'leafy', 'carrot', 'pumpkin', 'mango', 'papaya', 'orange', 'guava', 'broccoli', 'tomato', 'cabbage', 'okra', 'fruit', 'vegetable'], nutrients: ['vitaminA', 'vitaminC', 'folate'] },
        { words: ['seed', 'sesame', 'sunflower', 'almond', 'avocado', 'oil', 'butter'], nutrients: ['fat', 'calories'] },
        { words: ['liver', 'beef', 'spinach', 'lentil'], nutrients: ['iron'] },
        { words: ['fish', 'egg', 'meat', 'bean'], nutrients: ['zinc'] }
      ];

      keywordGroups.forEach((group) => {
        if (group.words.some((word) => text.includes(word))) {
          group.nutrients.forEach((nutrient) => found.add(nutrient));
        }
      });

      if (!found.size) {
        found.add('calories');
      }
      return [...found];
    }

    function createCustomFood(raw) {
      const clean = String(raw || '').trim();
      const name = toTitleCase(clean);
      const existing = [...selectedFoods.values()].find((food) => normalizeText(food.name) === normalizeText(name));
      if (existing) return existing;

      const id = `custom_${customCounter++}`;
      return {
        id,
        key: id,
        name,
        custom: true,
        nutrients: inferCustomNutrients(name),
        cost: 1.4,
        score: 55
      };
    }

    function resolveFoodFromInput(raw) {
      const query = normalizeText(raw);
      if (!query) return null;

      const exact = foods.find((food) => normalizeText(food.name) === query || normalizeText(foodLabel(food)) === query);
      if (exact) return { ...exact, key: exact.id, custom: false };

      const close = foods.find(
        (food) => normalizeText(food.name).includes(query) || normalizeText(foodLabel(food)).includes(query)
      );
      if (close) return { ...close, key: close.id, custom: false };

      return createCustomFood(raw);
    }

    function addFood() {
      const match = resolveFoodFromInput(input.value);
      if (!match) {
        setStatus('Type a food name first, then click Add food.');
        return;
      }
      selectedFoods.set(match.key, match);
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

    function canonicalText(food) {
      return normalizeText(`${food.id} ${food.name}`);
    }

    function hasWord(food, words) {
      const text = canonicalText(food);
      return words.some((word) => text.includes(word));
    }

    function isBread(food) {
      return hasWord(food, ['bread', 'roti', 'chapati', 'tortilla', 'pita', 'bun']);
    }

    function isEgg(food) {
      return hasWord(food, ['egg']);
    }

    function isDairy(food) {
      return hasWord(food, ['milk', 'yogurt', 'cheese', 'soy milk']);
    }

    function isLegume(food) {
      return hasWord(food, ['bean', 'lentil', 'chickpea', 'pea', 'cowpea', 'gram']);
    }

    function isGrainOrStarch(food) {
      return hasWord(food, ['rice', 'maize', 'corn', 'millet', 'sorghum', 'oat', 'quinoa', 'barley', 'wheat', 'cassava', 'yam', 'potato']);
    }

    function isMeatOrFish(food) {
      return hasWord(food, ['fish', 'sardine', 'tilapia', 'anchov', 'chicken', 'beef', 'goat', 'liver', 'meat']);
    }

    function isLeafyOrVeg(food) {
      return hasWord(food, ['spinach', 'kale', 'moringa', 'cabbage', 'broccoli', 'carrot', 'tomato', 'onion', 'okra', 'pumpkin', 'amaranth', 'beetroot']);
    }

    function isFruit(food) {
      return hasWord(food, ['banana', 'mango', 'orange', 'papaya', 'guava', 'apple', 'avocado', 'date', 'fruit']);
    }

    function isNutsOrSeeds(food) {
      return hasWord(food, ['nut', 'seed', 'peanut', 'groundnut', 'sesame', 'sunflower', 'almond', 'paste']);
    }

    function portionHint(food) {
      if (!food) return '';
      if (isBread(food)) return `2 slices ${foodLabel(food)}`;
      if (isEgg(food)) return `2 ${foodLabel(food)}`;
      if (isDairy(food)) return `1 cup ${foodLabel(food)}`;
      if (isLegume(food)) return `3/4 cup cooked ${foodLabel(food)}`;
      if (isGrainOrStarch(food)) return `1 cup cooked ${foodLabel(food)}`;
      if (isMeatOrFish(food)) return `100 g ${foodLabel(food)}`;
      if (isLeafyOrVeg(food)) return `1 cup chopped ${foodLabel(food)}`;
      if (isFruit(food)) return `1 medium ${foodLabel(food)}`;
      if (isNutsOrSeeds(food)) return `2 tbsp ${foodLabel(food)}`;
      return `1 serving ${foodLabel(food)}`;
    }

    function uniqueFoods(...groups) {
      const map = new Map();
      groups.flat().filter(Boolean).forEach((food) => {
        if (!map.has(food.id)) map.set(food.id, food);
      });
      return [...map.values()];
    }

    function renderMealIdeas(recipes) {
      mealList.innerHTML = '';
      if (!recipes.length) {
        const li = document.createElement('li');
        li.textContent = 'No meal ideas yet.';
        mealList.appendChild(li);
        return;
      }

      recipes.forEach((recipe) => {
        const li = document.createElement('li');
        li.className = 'meal-idea-item';

        const ingredientText = recipe.ingredients.map((food) => portionHint(food)).join(', ');
        const stepText = recipe.steps.join(' ');
        li.innerHTML = `
          <strong class="meal-idea-name">${recipe.name}</strong>
          <div class="small-text"><strong>Ingredients:</strong> ${ingredientText}</div>
          <div class="small-text"><strong>How to make:</strong> ${stepText}</div>
          <div class="small-text"><strong>Nutrition focus:</strong> ${recipe.benefit}</div>
        `;
        mealList.appendChild(li);
      });
    }

    function prepStep(food) {
      if (isBread(food)) return `Toast ${portionHint(food)} until warm and lightly crisp.`;
      if (isEgg(food)) return `Boil or scramble ${portionHint(food)} until fully cooked.`;
      if (isLegume(food)) return `Boil ${portionHint(food)} with water until tender.`;
      if (isGrainOrStarch(food)) return `Cook ${portionHint(food)} with water until soft.`;
      if (isMeatOrFish(food)) return `Cook ${portionHint(food)} thoroughly in a pan or pot.`;
      if (isLeafyOrVeg(food)) return `Wash and chop ${portionHint(food)}, then steam or saute for 3-5 minutes.`;
      if (isFruit(food)) return `Wash and slice ${portionHint(food)} just before serving.`;
      if (isNutsOrSeeds(food)) return `Add ${portionHint(food)} at the end as topping.`;
      return `Prepare ${portionHint(food)} in your usual safe cooking method.`;
    }

    function finalServeStep(parts, base) {
      const hasBreadFood = parts.some((food) => isBread(food));
      const hasFruitFood = parts.some((food) => isFruit(food));
      const cookableFoods = parts.filter((food) => !isBread(food) && !isFruit(food) && !isNutsOrSeeds(food));

      if (hasBreadFood) {
        return 'Use bread as a base or side. Add prepared foods on top or alongside instead of boiling or mixing bread.';
      }

      if (!isBread(base) && cookableFoods.length >= 2) {
        return 'Combine the cooked items in one pan for 2-3 minutes, then serve warm.';
      }

      if (hasFruitFood) {
        return 'Serve fruit on the side after the main meal for extra vitamins.';
      }

      return 'Plate the prepared foods together and serve immediately.';
    }

    function buildRecipes(selectedFoods) {
      const carbFoods = selectedFoods.filter((food) => food.nutrients.includes('carbs'));
      const proteinFoods = selectedFoods.filter((food) => food.nutrients.includes('protein'));
      const protectiveFoods = selectedFoods.filter((food) =>
        food.nutrients.some((nutrient) => ['vitaminA', 'vitaminC', 'iron', 'folate'].includes(nutrient))
      );
      const flavorFoods = selectedFoods.filter((food) => ['onion', 'tomato', 'okra', 'cabbage'].includes(food.id));

      const recipes = [];

      function addRecipe(name, ingredients, benefit) {
        const parts = uniqueFoods(ingredients).slice(0, 5);
        if (!parts.length) return;
        const key = parts.map((food) => food.id).sort().join('|');
        if (recipes.some((item) => item.key === key)) return;

        const base = parts.find((food) => isBread(food) || isGrainOrStarch(food) || isLegume(food)) || parts[0];
        const rest = parts.filter((food) => food.id !== base.id);
        const steps = [prepStep(base)];
        rest.slice(0, 2).forEach((food) => steps.push(prepStep(food)));
        steps.push(finalServeStep(parts, base));

        recipes.push({ key, name, ingredients: parts, benefit, steps });
      }

      if (carbFoods.length && proteinFoods.length && protectiveFoods.length) {
        addRecipe(
          `${foodLabel(proteinFoods[0])} Nourish Bowl`,
          [carbFoods[0], proteinFoods[0], protectiveFoods[0], flavorFoods[0]],
          'Balanced energy + protein + protective vitamins'
        );
      }

      if (proteinFoods.length >= 2) {
        addRecipe(
          `${foodLabel(proteinFoods[0])} Protein Stew`,
          [proteinFoods[0], proteinFoods[1], protectiveFoods[0], flavorFoods[0]],
          'High protein support for growth and recovery'
        );
      }

      if (protectiveFoods.length) {
        addRecipe(
          `Iron Boost ${foodLabel(protectiveFoods[0])} Mix`,
          [protectiveFoods[0], proteinFoods[0], carbFoods[0], flavorFoods[0]],
          'Iron + vitamin support for better blood health'
        );
      }

      if (carbFoods.length) {
        addRecipe(
          `Family Energy ${foodLabel(carbFoods[0])} Plate`,
          [carbFoods[0], proteinFoods[0], protectiveFoods[0], selectedFoods[0]],
          'Affordable calories with better nutrient density'
        );
      }

      if (recipes.length < 3 && selectedFoods.length >= 2) {
        addRecipe(
          `${foodLabel(selectedFoods[0])} and ${foodLabel(selectedFoods[1])} Home Plate`,
          [selectedFoods[0], selectedFoods[1], selectedFoods[2]],
          'Simple meal using what you already have'
        );
      }

      return recipes.slice(0, 5);
    }

    function analyzeFoods() {
      const selectedFoodList = [...selectedFoods.values()];
      if (!selectedFoodList.length) {
        setStatus('Add at least one food before analysis.');
        resultShell.classList.add('hide');
        return;
      }

      const mealIdeas = buildRecipes(selectedFoodList);

      const nutrientToFoods = new Map();
      selectedFoodList.forEach((food) => {
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
        const selectedKnownIds = new Set(selectedFoodList.filter((food) => !food.custom).map((food) => food.id));
        const candidates = foods
          .filter((food) => !selectedKnownIds.has(food.id))
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

      renderMealIdeas(mealIdeas);
      listToUi(nutrientList, nutrientInsights, 'No nutrient data yet.');
      listToUi(addonList, addons, 'No add-on suggestions.');
      resultShell.classList.remove('hide');
      hasAnalysis = true;
      setStatus(`Analysis ready for ${selectedFoodList.length} selected food(s).`);
    }

    addButton.addEventListener('click', addFood);
    clearButton.addEventListener('click', () => {
      selectedFoods.clear();
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
      selectedFoods.delete(removeId);
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
