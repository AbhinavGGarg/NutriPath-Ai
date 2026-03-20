(function () {
  const t = (key, vars) => (window.NutriApp?.t ? window.NutriApp.t(key, vars) : key);

  const LESSONS = [
    {
      id: 'lesson-family-food',
      title: 'Feed a Family With Limited Food',
      why: 'When grocery money is tight, meal quality often drops before hunger is obvious.',
      takeaways: [
        'Build each meal with an energy food, a protein food, and one protective food.',
        'Use low-cost staples: beans, eggs, peanut butter, oats, canned fish, yogurt, potatoes, frozen vegetables.',
        'If fresh produce is limited, canned and frozen options still improve vitamin intake.',
        'Batch-cook basics once so quick meals are possible on busy days.',
      ],
      now: 'Pick one low-cost protein to add at your next grocery trip, then re-run Meal Builder.',
    },
    {
      id: 'lesson-warning-signs',
      title: 'Warning Signs You Should Not Ignore',
      why: 'Missed early signs lead to delayed treatment and harder recovery.',
      takeaways: [
        'Watch for low appetite, fast weight loss, weakness, frequent diarrhea, swelling, and low activity.',
        'In children: monitor growth slowdown, fatigue, pale skin, and delayed development.',
        'In older adults: confusion, appetite drop, and dehydration are high-risk warning signs.',
        'Escalate quickly if swelling, severe lethargy, persistent vomiting, or confusion appears.',
      ],
      now: 'If severe signs appear, use Resource Map now and seek urgent evaluation.',
    },
    {
      id: 'lesson-child-support',
      title: 'Child Nutrition and Growth Support',
      why: 'A child can look fed and still be deficient in protein, iron, or other key nutrients.',
      takeaways: [
        'Offer frequent small meals when appetite is low.',
        'Include protein and iron often: eggs, beans, lentils, peanut butter, canned fish, fortified cereals.',
        'Pair iron foods with vitamin C foods for better absorption.',
        'Track appetite and energy weekly, not only weight alone.',
      ],
      now: 'Use Meal Builder with your current foods and prioritize protein + iron upgrades this week.',
    },
    {
      id: 'lesson-senior-support',
      title: 'Nutrition Support for Older Adults',
      why: 'In older adults, low appetite and isolation can quickly cause dangerous nutrition decline.',
      takeaways: [
        'Watch for reduced appetite, chewing problems, unplanned weight loss, and fatigue.',
        'Use soft, high-protein additions: yogurt, eggs, beans, soups, nut butter, milk alternatives.',
        'Hydration is part of nutrition risk, especially when appetite is low.',
        'Do not dismiss confusion or sudden weakness as normal aging.',
      ],
      now: 'If there is ongoing weight loss or confusion, seek evaluation and nearby support immediately.',
    },
    {
      id: 'lesson-food-desert',
      title: 'Food Desert / Low Access Survival Tips',
      why: 'Many households rely on corner stores, dollar stores, or pantry items with limited options.',
      takeaways: [
        'Choose shelf-stable upgrades: beans, oats, canned tuna, canned beans, peanut butter, powdered milk.',
        'Choose no-sugar or low-sodium options when possible, but focus first on consistent nutrition intake.',
        'Build quick meals from pantry items before adding snacks or sugary drinks.',
        'Use frozen vegetables when fresh options are costly or hard to reach.',
      ],
      now: 'Pick one shelf-stable protein and one protective food to add this week.',
    },
    {
      id: 'lesson-cultural-flex',
      title: 'Culturally Flexible Meal Guidance',
      why: 'Nutrition support works best when it adapts to household food culture and what people will actually eat.',
      takeaways: [
        'Use food categories and substitutions instead of one fixed cuisine style.',
        'Keep familiar staples, then improve them with protein and protective sides.',
        'Swap by function: lentils/beans for protein, cabbage/frozen veg for protective foods, oats/rice/potatoes for energy.',
        'Respect household preferences to improve long-term follow-through.',
      ],
      now: 'Choose one family-favorite dish and upgrade it with a low-cost protein add-on.',
    },
  ];

  const CLAIM_RULES = [
    {
      keys: ['only expensive', 'healthy food is always expensive', 'healthy food always too expensive'],
      verdict: 'myth',
      explanation: 'Low-cost foods can improve nutrition when combined well. Cost matters, but expensive food is not the only path.',
      takeaway: 'Use affordable proteins and staples first: beans, eggs, oats, peanut butter, canned fish, frozen vegetables.',
      safer: 'Affordable foods can still build strong nutrition when meals include protein and protective foods.',
    },
    {
      keys: ['overweight', 'cant be malnourished', 'cannot be malnourished'],
      verdict: 'myth',
      explanation: 'Body weight alone does not confirm nutrient quality. A person can be overweight and still deficient in iron, protein, or vitamins.',
      takeaway: 'Check diet quality and warning signs, not just body size.',
      safer: 'A person can have enough calories but still lack key nutrients.',
    },
    {
      keys: ['skipping meals is fine', 'skip meals', 'big dinner'],
      verdict: 'depends',
      explanation: 'Meal timing affects energy, appetite, and nutrient intake. Repeated meal skipping raises nutrition risk in many households.',
      takeaway: 'Aim for regular eating windows and include protein earlier in the day when possible.',
      safer: 'Try smaller regular meals instead of long gaps followed by one large meal.',
    },
    {
      keys: ['fresh food is the only healthy option', 'only fresh food', 'fresh only'],
      verdict: 'myth',
      explanation: 'Frozen and canned foods can be nutritious and practical, especially in food deserts and low-access settings.',
      takeaway: 'Use frozen vegetables, canned beans, and canned fish when fresh options are limited.',
      safer: 'Fresh, frozen, and canned foods can all support health when chosen carefully.',
    },
    {
      keys: ['older adults naturally eat less', 'weight loss is normal', 'seniors naturally eat less'],
      verdict: 'depends',
      explanation: 'Appetite can change with age, but unexplained weight loss is a warning sign and should not be ignored.',
      takeaway: 'Track appetite and weight trends. Seek help if decline continues.',
      safer: 'Some appetite change happens with age, but persistent weight loss needs follow-up.',
    },
    {
      keys: ['protein is only found in meat', 'protein only in meat'],
      verdict: 'myth',
      explanation: 'Protein also comes from beans, lentils, soy foods, dairy, eggs, nuts, and seeds.',
      takeaway: 'Use low-cost protein mix-ins even when meat is expensive.',
      safer: 'Meat is one protein source, but many affordable non-meat options also work.',
    },
  ];

  const VOICE_MODE_CONFIG = {
    standard: { rate: 0.98, pitch: 1, volume: 1 },
    slow: { rate: 0.86, pitch: 1, volume: 1 },
    field: { rate: 0.8, pitch: 0.95, volume: 1 },
  };

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function normalizeText(value) {
    return String(value || '')
      .trim()
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]+/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function initLessonCards(voiceApi) {
    const grid = document.getElementById('lesson-grid');
    if (!grid) return;

    grid.innerHTML = '';
    LESSONS.forEach((lesson) => {
      const node = document.createElement('article');
      node.className = 'lesson-card lesson-card-strong';
      node.id = lesson.id;
      node.innerHTML = `
        <span class="badge">Quick-use guide</span>
        <h3>${escapeHtml(lesson.title)}</h3>
        <p class="small-text"><strong>Why it matters:</strong> ${escapeHtml(lesson.why)}</p>
        <h4>Practical takeaways</h4>
        <ul>
          ${lesson.takeaways.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
        </ul>
        <div class="alert alert-warn"><strong>What to do now:</strong> ${escapeHtml(lesson.now)}</div>
        <div class="cta-row" style="margin-top: 0.7rem;">
          <button type="button" class="btn btn-secondary" data-lesson-listen="${lesson.id}">Listen</button>
        </div>
      `;
      grid.appendChild(node);
    });

    grid.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const lessonId = target.dataset.lessonListen;
      if (!lessonId) return;
      const lesson = LESSONS.find((item) => item.id === lessonId);
      if (!lesson) return;

      const speechText = [
        lesson.title,
        `Why it matters. ${lesson.why}`,
        `Practical takeaways. ${lesson.takeaways.join(' ')}`,
        `What to do now. ${lesson.now}`,
      ].join(' ');
      voiceApi.speakText(speechText);
    });
  }

  function initVoiceAssistant() {
    const modeNode = document.getElementById('voice-mode');
    const playBtn = document.getElementById('voice-play');
    const pauseBtn = document.getElementById('voice-pause');
    const replayBtn = document.getElementById('voice-replay');
    const stopBtn = document.getElementById('voice-stop');
    const statusNode = document.getElementById('voice-status');
    const scriptNode = document.getElementById('voice-script');

    const synth = window.speechSynthesis;
    const chunks = scriptNode ? [...scriptNode.querySelectorAll('[data-voice-chunk]')] : [];
    let currentUtterances = [];
    let isPaused = false;

    function setStatus(text) {
      if (!statusNode) return;
      statusNode.textContent = text;
    }

    function clearHighlights() {
      chunks.forEach((chunk) => chunk.classList.remove('spoken-active'));
    }

    function bestVoice() {
      if (!synth) return null;
      const voices = synth.getVoices() || [];
      if (!voices.length) return null;

      const preferred = [
        'Google US English',
        'Microsoft Aria',
        'Samantha',
        'Jenny',
        'Daniel',
      ];

      for (const name of preferred) {
        const hit = voices.find((voice) => voice.lang?.startsWith('en') && voice.name.includes(name));
        if (hit) return hit;
      }

      return voices.find((voice) => voice.lang?.toLowerCase().includes('en-us')) || voices.find((voice) => voice.lang?.startsWith('en')) || voices[0];
    }

    function splitSpeech(text) {
      const raw = String(text || '').trim();
      if (!raw) return [];
      const sentenceParts = raw.match(/[^.!?]+[.!?]?/g) || [raw];
      const list = [];
      let current = '';
      sentenceParts.forEach((part) => {
        const next = part.trim();
        if (!next) return;
        if ((current + ' ' + next).trim().length > 160 && current) {
          list.push(current.trim());
          current = next;
        } else {
          current = `${current} ${next}`.trim();
        }
      });
      if (current) list.push(current.trim());
      return list;
    }

    function stopSpeech() {
      if (!synth) return;
      synth.cancel();
      currentUtterances = [];
      isPaused = false;
      clearHighlights();
      setStatus('Audio stopped.');
    }

    function buildUtterance(text, chunkIndex, totalChunks) {
      const utter = new SpeechSynthesisUtterance(text);
      const voice = bestVoice();
      if (voice) utter.voice = voice;
      utter.lang = 'en-US';

      const mode = modeNode?.value || 'standard';
      const config = VOICE_MODE_CONFIG[mode] || VOICE_MODE_CONFIG.standard;
      utter.rate = config.rate;
      utter.pitch = config.pitch;
      utter.volume = config.volume;

      utter.onstart = () => {
        if (chunks[chunkIndex]) chunks[chunkIndex].classList.add('spoken-active');
        setStatus(`Speaking section ${chunkIndex + 1} of ${totalChunks}...`);
      };

      utter.onend = () => {
        if (chunks[chunkIndex]) chunks[chunkIndex].classList.remove('spoken-active');
        if (chunkIndex === totalChunks - 1) {
          setStatus('Audio complete.');
          currentUtterances = [];
          isPaused = false;
        }
      };

      return utter;
    }

    function speakText(text) {
      if (!synth || typeof SpeechSynthesisUtterance === 'undefined') {
        if (window.NutriApp?.speak) {
          window.NutriApp.speak(text);
          return;
        }
        setStatus('Audio is not supported in this browser.');
        return;
      }

      synth.cancel();
      clearHighlights();

      const pieces = splitSpeech(text);
      currentUtterances = pieces.map((piece, idx) => buildUtterance(piece, Math.min(idx, chunks.length - 1), pieces.length));
      currentUtterances.forEach((utter) => synth.speak(utter));
      isPaused = false;
    }

    function playScript() {
      if (!chunks.length) return;
      const text = chunks.map((node) => node.textContent?.trim() || '').filter(Boolean).join(' ');
      speakText(text);
    }

    if (playBtn) playBtn.addEventListener('click', playScript);

    if (pauseBtn) {
      pauseBtn.addEventListener('click', () => {
        if (!synth) return;
        if (!synth.speaking && !synth.paused) return;

        if (isPaused) {
          synth.resume();
          isPaused = false;
          setStatus('Audio resumed.');
        } else {
          synth.pause();
          isPaused = true;
          setStatus('Audio paused.');
        }
      });
    }

    if (replayBtn) replayBtn.addEventListener('click', playScript);
    if (stopBtn) stopBtn.addEventListener('click', stopSpeech);

    window.addEventListener('beforeunload', stopSpeech);
    if (synth) synth.onvoiceschanged = () => {};

    return { speakText, stopSpeech };
  }

  function initMythChecker(voiceApi) {
    const input = document.getElementById('myth-input');
    const checkBtn = document.getElementById('myth-check-btn');
    const clearBtn = document.getElementById('myth-clear-btn');
    const resultNode = document.getElementById('myth-result');
    if (!input || !checkBtn || !clearBtn || !resultNode) return;

    function verdictLabel(verdict) {
      if (verdict === 'myth') return 'Likely myth';
      if (verdict === 'depends') return 'Partly true / depends';
      return 'Likely fact';
    }

    function verdictClass(verdict) {
      if (verdict === 'myth') return 'claim-badge-myth';
      if (verdict === 'depends') return 'claim-badge-depends';
      return 'claim-badge-fact';
    }

    function findRule(text) {
      const normalized = normalizeText(text);
      return CLAIM_RULES.find((rule) => rule.keys.some((key) => normalized.includes(normalizeText(key))));
    }

    function renderClaimResult(rule, originalClaim) {
      const safeFallback = {
        verdict: 'depends',
        explanation: 'We cannot fully verify that exact claim yet from this quick checker.',
        takeaway: 'Use a safer rule: build meals with protein + protective foods and watch warning signs early.',
        safer: 'A full plate is not always a nourished plate. Focus on nutrient quality, not only calories.',
      };

      const output = rule || safeFallback;
      resultNode.classList.remove('hide');
      resultNode.innerHTML = `
        <div class="claim-result-head">
          <span class="tag ${verdictClass(output.verdict)}">${verdictLabel(output.verdict)}</span>
        </div>
        <p class="small-text"><strong>Claim:</strong> ${escapeHtml(originalClaim)}</p>
        <p class="small-text"><strong>Why:</strong> ${escapeHtml(output.explanation)}</p>
        <p class="small-text"><strong>What to do instead:</strong> ${escapeHtml(output.takeaway)}</p>
        <div class="alert alert-success"><strong>Safer wording:</strong> ${escapeHtml(output.safer)}</div>
        <div class="cta-row" style="margin-top: 0.65rem;">
          <button type="button" class="btn btn-secondary btn-small" id="claim-listen">Listen</button>
        </div>
      `;

      const listenBtn = document.getElementById('claim-listen');
      if (listenBtn) {
        listenBtn.addEventListener('click', () => {
          voiceApi.speakText(
            `Claim check result. ${verdictLabel(output.verdict)}. ${output.explanation}. What to do instead. ${output.takeaway}. Safer wording: ${output.safer}`
          );
        });
      }
    }

    checkBtn.addEventListener('click', () => {
      const claim = String(input.value || '').trim();
      if (!claim) {
        resultNode.classList.remove('hide');
        resultNode.innerHTML = '<p class="small-text">Type a claim first so NutriPath can check it.</p>';
        return;
      }
      const matchedRule = findRule(claim);
      renderClaimResult(matchedRule, claim);
    });

    clearBtn.addEventListener('click', () => {
      input.value = '';
      resultNode.classList.add('hide');
      resultNode.innerHTML = '';
    });

    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        checkBtn.click();
      }
    });
  }

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
    const gapList = document.getElementById('hub-gap-list');
    const addonList = document.getElementById('hub-addon-list');
    const swapList = document.getElementById('hub-swap-list');
    const nextStepsNode = document.getElementById('hub-next-steps');

    if (!input || !datalist || !addButton || !clearButton || !analyzeButton || !selectedNode || !statusNode || !resultShell || !mealList || !nutrientList || !gapList || !addonList || !swapList || !nextStepsNode) {
      return;
    }

    const selectedFoods = new Map();
    const foods = NutriData.foods.slice().sort((a, b) => a.name.localeCompare(b.name));
    let customCounter = 1;

    const nutrientTitles = {
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
      omega3: 'Omega-3 fats',
    };

    const criticalNutrients = ['protein', 'iron', 'vitaminA', 'vitaminC', 'fiber', 'zinc', 'calories'];

    const processedKeywords = ['chips', 'cookie', 'instant noodle', 'ramen', 'soda', 'fries', 'candy'];

    function foodLabel(food) {
      if (food.custom) return food.name;
      const key = `food_${food.id}`;
      const translated = t(key);
      return translated === key ? food.name : translated;
    }

    function nutrientLabel(key) {
      return nutrientTitles[key] || key;
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

    function inferCustomNutrients(name) {
      const text = normalizeText(name);
      const nutrients = new Set();

      const rules = [
        { words: ['beans', 'lentil', 'egg', 'tuna', 'fish', 'chicken', 'turkey', 'tofu', 'peanut', 'yogurt', 'milk'], nutrients: ['protein'] },
        { words: ['rice', 'bread', 'pasta', 'potato', 'oat', 'cereal', 'tortilla'], nutrients: ['carbs', 'calories'] },
        { words: ['spinach', 'kale', 'broccoli', 'carrot', 'pepper', 'tomato', 'orange', 'fruit', 'vegetable'], nutrients: ['vitaminA', 'vitaminC', 'fiber'] },
        { words: ['nut', 'seed', 'avocado', 'oil', 'butter'], nutrients: ['fat', 'calories'] },
      ];

      rules.forEach((rule) => {
        if (rule.words.some((word) => text.includes(word))) {
          rule.nutrients.forEach((item) => nutrients.add(item));
        }
      });

      if (!nutrients.size) nutrients.add('calories');
      return [...nutrients];
    }

    function makeCustomFood(raw) {
      const clean = String(raw || '').trim();
      const titled = clean
        .split(/\s+/)
        .filter(Boolean)
        .map((part) => part[0].toUpperCase() + part.slice(1).toLowerCase())
        .join(' ');

      const id = `custom_${customCounter++}`;
      return {
        id,
        key: id,
        custom: true,
        name: titled,
        nutrients: inferCustomNutrients(titled),
        cost: 1.6,
        score: 52,
      };
    }

    function resolveFood(raw) {
      const query = normalizeText(raw);
      if (!query) return null;

      const exact = foods.find((food) => normalizeText(food.name) === query || normalizeText(foodLabel(food)) === query);
      if (exact) return { ...exact, key: exact.id, custom: false };

      const near = foods.find((food) => normalizeText(food.name).includes(query) || normalizeText(foodLabel(food)).includes(query));
      if (near) return { ...near, key: near.id, custom: false };

      return makeCustomFood(raw);
    }

    function renderSelectedFoods() {
      selectedNode.innerHTML = '';
      const all = [...selectedFoods.values()];
      if (!all.length) {
        setStatus('No foods added yet. Add foods you currently have at home.');
        return;
      }

      all.forEach((food) => {
        const chip = document.createElement('span');
        chip.className = 'selected-food-chip';
        chip.innerHTML = `${escapeHtml(foodLabel(food))} <button type="button" data-remove-food="${food.key}" aria-label="Remove ${escapeHtml(foodLabel(food))}">x</button>`;
        selectedNode.appendChild(chip);
      });
      setStatus(`Selected ${all.length} food item(s). Click Build Meal Plan.`);
    }

    function addFood() {
      const value = String(input.value || '').trim();
      const resolved = resolveFood(value);
      if (!resolved) {
        setStatus('Type a food first, then click Add Food.');
        return;
      }
      selectedFoods.set(resolved.key, resolved);
      input.value = '';
      renderSelectedFoods();
      resultShell.classList.add('hide');
    }

    function clearResults() {
      [mealList, nutrientList, gapList, addonList, swapList].forEach((node) => {
        node.innerHTML = '';
      });
      nextStepsNode.innerHTML = '';
    }

    function listToNode(node, items, emptyText) {
      node.innerHTML = '';
      if (!items.length) {
        const li = document.createElement('li');
        li.textContent = emptyText;
        node.appendChild(li);
        return;
      }
      items.forEach((item) => {
        const li = document.createElement('li');
        li.innerHTML = item;
        node.appendChild(li);
      });
    }

    function categorizeFoods(foodList) {
      const hasNutrient = (food, nutrient) => food.nutrients.includes(nutrient);
      return {
        protein: foodList.filter((food) => hasNutrient(food, 'protein')),
        energy: foodList.filter((food) => hasNutrient(food, 'carbs') || hasNutrient(food, 'calories')),
        protective: foodList.filter((food) => hasNutrient(food, 'vitaminA') || hasNutrient(food, 'vitaminC') || hasNutrient(food, 'fiber') || hasNutrient(food, 'iron')),
      };
    }

    function mealIdeas(foodList) {
      const groups = categorizeFoods(foodList);
      const ideas = [];

      function first(list) {
        return list.length ? list[0] : null;
      }

      const protein = first(groups.protein) || first(foodList);
      const energy = first(groups.energy) || first(foodList);
      const protective = first(groups.protective) || first(foodList);

      if (protein && energy && protective) {
        ideas.push(`<strong>Balanced pantry bowl</strong><br/>Use ${escapeHtml(foodLabel(energy))} as base, add ${escapeHtml(foodLabel(protein))}, then top with ${escapeHtml(foodLabel(protective))}.`);
      }

      if (groups.protein.length >= 1 && groups.protective.length >= 1) {
        ideas.push(`<strong>Protein + protective plate</strong><br/>Cook ${escapeHtml(foodLabel(groups.protein[0]))} and add ${escapeHtml(foodLabel(groups.protective[0]))}. Serve with any available starch.`);
      }

      if (foodList.length >= 2) {
        ideas.push(`<strong>Fast mix meal</strong><br/>Combine ${escapeHtml(foodLabel(foodList[0]))} and ${escapeHtml(foodLabel(foodList[1]))}, then add one produce or bean item if available.`);
      }

      return ideas.slice(0, 3);
    }

    function analyzeCoverage(foodList) {
      const coverage = new Map();
      foodList.forEach((food) => {
        food.nutrients.forEach((nutrient) => {
          if (!coverage.has(nutrient)) coverage.set(nutrient, []);
          coverage.get(nutrient).push(foodLabel(food));
          if (nutrient === 'carbs' || nutrient === 'fat') {
            if (!coverage.has('calories')) coverage.set('calories', []);
            coverage.get('calories').push(foodLabel(food));
          }
        });
      });
      return coverage;
    }

    function analyzeFoods() {
      const selected = [...selectedFoods.values()];
      if (!selected.length) {
        setStatus('Add at least one food to analyze.');
        resultShell.classList.add('hide');
        return;
      }

      const ideas = mealIdeas(selected);
      const coverage = analyzeCoverage(selected);

      const strengths = [...coverage.entries()]
        .filter(([nutrient]) => criticalNutrients.includes(nutrient))
        .sort((a, b) => b[1].length - a[1].length)
        .slice(0, 5)
        .map(([nutrient, foodNames]) => `<strong>${nutrientLabel(nutrient)}:</strong> ${escapeHtml([...new Set(foodNames)].slice(0, 3).join(', '))}`);

      const gaps = criticalNutrients
        .filter((nutrient) => !coverage.has(nutrient))
        .map((nutrient) => {
          const guidance = nutrient === 'protein'
            ? 'Add a low-cost protein soon (beans, eggs, canned fish, peanut butter).'
            : nutrient === 'iron'
              ? 'Add iron support (lentils, beans, fortified cereal, leafy greens).'
              : nutrient === 'vitaminA'
                ? 'Add orange/dark-green produce or frozen vegetables.'
                : nutrient === 'vitaminC'
                  ? 'Add fruit or tomato/pepper/cabbage when available.'
                  : nutrient === 'fiber'
                    ? 'Add oats, beans, whole grains, or vegetables.'
                    : nutrient === 'calories'
                      ? 'Add enough energy foods so meals are not too small.'
                      : 'Add variety across food groups.';
          return `<strong>${nutrientLabel(nutrient)} gap:</strong> ${guidance}`;
        });

      const knownSelectedIds = new Set(selected.filter((food) => !food.custom).map((food) => food.id));
      const addNext = foods
        .filter((food) => !knownSelectedIds.has(food.id))
        .map((food) => {
          const matched = criticalNutrients.filter((n) => food.nutrients.includes(n) || ((n === 'calories') && (food.nutrients.includes('carbs') || food.nutrients.includes('fat'))));
          return { food, matched: [...new Set(matched)] };
        })
        .filter((entry) => entry.matched.length)
        .sort((a, b) => b.matched.length - a.matched.length || a.food.cost - b.food.cost)
        .slice(0, 6)
        .map((entry) => `<strong>${escapeHtml(foodLabel(entry.food))}</strong> (${entry.food.cost.toFixed(2)} est.) -> ${escapeHtml(entry.matched.map(nutrientLabel).join(', '))}`);

      const swaps = [];
      if (!coverage.has('protein')) swaps.push('No protein item detected: try eggs, beans, lentils, peanut butter, canned tuna, or yogurt.');
      if (!coverage.has('vitaminA')) swaps.push('Missing protective produce: try frozen mixed vegetables, cabbage, carrots, or canned pumpkin.');
      if (!coverage.has('iron')) swaps.push('Need iron support: try lentils, fortified cereal, beans, spinach, or chicken liver.');
      if (!coverage.has('fiber')) swaps.push('Too refined/carbohydrate-heavy: swap some white starch with oats, beans, brown rice, or vegetables.');

      const selectedText = selected.map((food) => normalizeText(food.name)).join(' ');
      const processedHits = processedKeywords.filter((word) => selectedText.includes(word));
      if (processedHits.length) {
        swaps.push('Several highly processed foods detected. Keep them if needed, but add one protein and one protective food in the same meal.');
      }

      listToNode(mealList, ideas, 'No meal idea generated yet. Add at least two foods.');
      listToNode(nutrientList, strengths, 'No clear strengths yet. Add more foods for better analysis.');
      listToNode(gapList, gaps, 'Core nutrient coverage looks good right now. Keep rotating foods for diversity.');
      listToNode(addonList, addNext, 'No add-on suggestions yet.');
      listToNode(swapList, swaps, 'No major swaps needed right now.');

      nextStepsNode.innerHTML = `
        <p><strong>Next step 1:</strong> Build one meal from "Best meal idea now" tonight.</p>
        <p><strong>Next step 2:</strong> Add one item from "Cheapest helpful foods to add" this week.</p>
        <p><strong>Next step 3:</strong> <a href="./learn.html#claim-checker">Check a nutrition claim</a> if someone in the household is unsure what is true.</p>
        <p><strong>Next step 4:</strong> <a href="./map.html">Find local support</a> if food access is unstable.</p>
      `;

      resultShell.classList.remove('hide');
      setStatus(`Meal analysis ready for ${selected.length} food item(s).`);
    }

    addButton.addEventListener('click', addFood);
    clearButton.addEventListener('click', () => {
      selectedFoods.clear();
      input.value = '';
      clearResults();
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
      renderSelectedFoods();
      resultShell.classList.add('hide');
      clearResults();
    });

    window.addEventListener('nutri:lang-changed', renderFoodOptions);

    renderFoodOptions();
    renderSelectedFoods();
  }

  const voiceApi = initVoiceAssistant() || { speakText: (text) => window.NutriApp?.speak?.(text), stopSpeech: () => {} };
  initLessonCards(voiceApi);
  initMythChecker(voiceApi);
  initFoodBuilder();
})();
