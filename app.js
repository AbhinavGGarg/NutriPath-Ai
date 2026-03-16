(function () {
  const page = document.body.dataset.page;
  const yearNode = document.getElementById('year');
  if (yearNode) yearNode.textContent = String(new Date().getFullYear());

  const UI_LANG_KEY = 'nutriUiLangV1';
  const STORAGE_KEYS = {
    accounts: 'nutriAccountsV1',
    sessionUserId: 'nutriSessionUserIdV1',
    guestHistory: 'nutriGuestHistoryV1',
    guestCurrent: 'nutriGuestCurrentV1'
  };

  const UI_LANGS = [
    { code: 'en', label: 'English', labelKey: 'lang_english' },
    { code: 'fr', label: 'Francais', labelKey: 'lang_french' }
  ];

  const I18N = {
    en: {
      nav_home: 'Home',
      nav_assessment: 'Assessment',
      nav_results: 'Results',
      nav_map: 'Resource Map',
      nav_dashboard: 'Program Dashboard',
      nav_learn: 'Learning Hub',
      nav_settings: 'Settings',
      lang_english: 'English',
      lang_french: 'French',
      map_title: 'Food and Health Resource Locator',
      map_desc: 'Find nearby clinics, NGO support, and food distribution points, then prioritize referrals based on risk level.',
      map_label_community: 'Community center',
      map_hint_community: 'Type manually or choose from suggestions.',
      map_label_type: 'Resource type',
      map_option_all: 'All',
      map_option_clinic: 'Clinic',
      map_option_food: 'Food Support',
      map_label_distance: 'Max distance (km)',
      btn_use_location: 'Use my location',
      btn_apply_filters: 'Apply filters',
      map_nearby_resources: 'Nearby resources',
      btn_login: 'Log in',
      btn_signup: 'Sign up',
      btn_account: 'Account',
      btn_logout: 'Log out',
      label_signed_in: 'Signed in',
      settings_title: 'Language Settings',
      settings_desc: 'Choose your app language. The interface updates immediately across pages.',
      settings_language_label: 'Display language',
      settings_saved: 'Language saved. The app now uses this language.',
      settings_note: 'Tip: assessment "Preferred language" is for report context; this setting controls app UI text.',
      map_status_select: 'Select or type a community, then click Apply filters to use distance-based matching.',
      map_status_unrecognized: 'Community not recognized. Showing results globally by selected type.',
      map_status_applied_local: 'Applied: {count} resource(s) within {distance} km of {center}. {summary}',
      map_status_applied_global: 'Applied: {count} resource(s) globally. {summary}. Select a community to enable distance filtering.',
      map_no_data_local: 'No services found for this filter and distance. Increase range or choose another type.',
      map_no_data_global: 'No services found for this resource type.',
      map_location_denied: 'Location permission denied. Please type a community manually instead.',
      map_distance_pending: 'Distance available after selecting a community',
      map_distance_away: '{distance} km away',
      placeholder_community_search: 'Select or search community',
      map_summary: 'Clinics: {clinic} · Food support: {food} · NGO: {ngo}',
      current_location: 'Current location',
      validation_food_min: 'Select at least 3 available foods so the AI meal planner can generate realistic recommendations.',
      validation_required: 'Please complete all required fields before running the AI assessment.',
      risk_urgent_alert: 'Critical risk detected. Immediate referral and close follow-up are required.',
      risk_high_alert: 'Elevated risk. Start nutrition interventions now and schedule clinic review this week.',
      risk_moderate_alert: 'Moderate risk. Strengthen diet diversity and monitor growth in 2 weeks.',
      risk_low_alert: 'Low immediate risk. Continue preventive nutrition and monthly monitoring.',
      budget_high: 'Budget pressure is high. Prioritize beans/lentils/millet and request food support from nearby NGOs.',
      budget_moderate: 'Budget is moderate. Use substitutions with fortified flour, leafy greens, and legumes.',
      budget_low: 'Budget level can support the current meal plan while improving nutrient quality.',
      dashboard_no_data: 'No data yet. Run an assessment or load demo data.',
      dashboard_no_critical: 'No critical cases in queue.',
      learn_quiz_correct: 'Correct. Affordable local foods like lentils, greens, eggs, and fortified flour can improve nutrition significantly.',
      learn_quiz_wrong: 'Not quite. Many low-cost local foods can be highly nutritious when combined well.',
      auth_invalid: 'Invalid email or password.',
      auth_login_success: 'Login successful. Redirecting...',
      auth_signup_success: 'Account created. Please log in to start saving reports.',
      auth_password_mismatch: 'Passwords do not match.',
      auth_fields_required: 'Please complete all sign-up fields.',
      auth_email_invalid: 'Please enter a valid email address.',
      auth_password_short: 'Password must be at least 6 characters.',
      auth_email_exists: 'An account with this email already exists.',
      guest_mode_banner: 'Guest mode is temporary. Sign in to save your reports across visits.'
      ,
      results_summary: 'Screened household {household} on {date} in {community}.',
      results_followup: 'Next follow-up recommended in {days} day(s).',
      results_risk_suffix: 'Risk',
      common_cancel: 'Cancel',
      risk_label_low: 'Low',
      risk_label_moderate: 'Moderate',
      risk_label_high: 'High',
      risk_label_urgent: 'Urgent',
      dashboard_hotspot_label: 'High/Urgent cases',
      learn_btn_listen: 'Listen',
      learn_speak_warning: 'Early warning signs include poor appetite, repeated diarrhea, visible wasting, and lethargy. Refer urgent signs immediately.',
      learn_speak_meal: 'Build each meal with one energy food, one protein food, and one vitamin rich food. Use local affordable ingredients.',
      action_urgent_1: 'Refer to nearest clinic within 24 hours for severe acute malnutrition screening.',
      action_urgent_2: 'Start high-energy, high-protein meals immediately and monitor hydration.',
      action_urgent_3: 'Schedule follow-up visit within 48 hours.',
      action_high_1: 'Book nutrition consult this week and repeat MUAC in 7 days.',
      action_high_2: 'Increase meal frequency to 4 times/day with protein at least twice daily.',
      action_high_3: 'Track appetite and stool consistency daily.',
      action_moderate_1: 'Improve diet diversity this week and add one iron-rich food daily.',
      action_moderate_2: 'Repeat growth check in 14 days.',
      action_moderate_3: 'Complete caregiver nutrition micro-lessons in Learning Hub.',
      action_low_1: 'Continue current feeding practices and re-screen monthly.',
      action_low_2: 'Maintain safe water and handwashing routines.',
      symptom_fatigue: 'Fatigue / low energy',
      symptom_poor_appetite: 'Poor appetite',
      symptom_diarrhea: 'Frequent diarrhea',
      symptom_fever: 'Recent fever/infection',
      symptom_pallor: 'Pale skin / pallor',
      symptom_edema: 'Edema/swelling',
      symptom_wasting: 'Visible wasting',
      symptom_hair_loss: 'Hair thinning/discoloration',
      symptom_night_vision: 'Poor vision in low light',
      symptom_lethargy: 'Lethargy/not alert',
      home_badge_triage: 'AI Triage',
      home_badge_meal: 'Local Meal Planning',
      home_badge_offline: 'Offline-Ready PWA',
      home_hero_title: 'Detect malnutrition early and deliver practical nutrition action in minutes.',
      home_hero_desc: 'NutriPath AI helps individuals, families, caregivers, health workers, and NGOs run screenings, generate low-cost local meal plans, and connect households to nearby support services from one web platform.',
      home_cta_assessment: 'Start AI Assessment',
      home_cta_dashboard: 'Open Program Dashboard',
      home_feature1_title: '1. Guided Risk Screening',
      home_feature1_desc: 'Capture MUAC, symptoms, diet diversity, and household context through a simple mobile-first form with low-literacy labels.',
      home_feature2_title: '2. AI-Powered Action Plan',
      home_feature2_desc: 'Get a risk score, urgent referral guidance, probable deficiencies, and a household nutrition plan using local affordable foods.',
      home_feature3_title: '3. Resource Routing',
      home_feature3_desc: 'Instantly find clinics, food support points, and NGO services with route-ready map cards and travel distance estimates.',
      home_built_title: 'Built for underserved communities',
      home_built_desc: 'Interface includes icon-first controls, voice readouts, and fast loading on low bandwidth. Data can be captured in field visits and synced later.',
      home_kpi_time: 'Average screening time',
      home_kpi_turnaround: 'AI recommendation turnaround',
      home_kpi_users_label: 'Designed users',
      home_kpi_users_value: 'Individuals + Families + CHWs + NGOs',
      home_flow_title: 'Core flow inside the app',
      home_flow_head_step: 'Step',
      home_flow_head_user: 'What user does',
      home_flow_head_app: 'What app returns',
      home_flow_1_user: 'Fill screening form',
      home_flow_1_app: 'Validated health + diet profile',
      home_flow_2_user: 'Run AI assessment',
      home_flow_2_app: 'Risk class + urgency + deficiency signals',
      home_flow_3_user: 'Open meal planner',
      home_flow_3_app: '7-day local meal recommendations',
      home_flow_4_user: 'Check map',
      home_flow_4_app: 'Nearby support points sorted by distance',
      home_flow_5_user: 'Track follow-up',
      home_flow_5_app: 'Case history + hotspot dashboard',
      assessment_title: 'AI Malnutrition Risk Assessment',
      assessment_desc: 'Complete this form during a household visit or self-check. The system produces a risk class, urgency actions, probable deficiencies, and a local affordable meal plan.',
      assessment_progress: 'Assessment progress',
      assessment_section_profile: '1) Profile',
      assessment_label_role: 'Role',
      assessment_option_select_role: 'Select role',
      assessment_role_individual: 'Individual / Family Member',
      assessment_role_caregiver: 'Caregiver / Parent',
      assessment_role_chw: 'Community Health Worker',
      assessment_role_ngo: 'NGO / Clinic Staff',
      assessment_role_hint: 'Everyone can use this tool. Choose the role closest to you.',
      assessment_label_language: 'Preferred language',
      assessment_placeholder_language: 'Search or type language',
      assessment_language_hint: 'Search by language name or type manually.',
      assessment_label_household: 'Household name / ID',
      assessment_placeholder_household: 'e.g., HH-102 or family surname',
      assessment_label_community: 'Community',
      assessment_community_hint: 'Works with search and manual entry.',
      assessment_label_age: 'Age (years)',
      assessment_placeholder_age: 'e.g., 18',
      assessment_label_sex: 'Sex',
      assessment_option_select_sex: 'Select sex',
      assessment_option_female: 'Female',
      assessment_option_male: 'Male',
      assessment_label_household_size: 'Household size',
      assessment_label_budget: 'Food budget (USD/week)',
      assessment_section_health: '2) Health and Growth',
      assessment_label_weight: 'Weight (kg)',
      assessment_label_height: 'Height (cm)',
      assessment_label_muac: 'MUAC (Mid-Upper Arm Circumference, cm)',
      assessment_label_meals: 'Meals per day',
      assessment_label_diversity: 'Diet diversity score (0-10)',
      assessment_label_water: 'Water source',
      assessment_option_select_source: 'Select source',
      assessment_option_safe_water: 'Safe (treated/piped)',
      assessment_option_unsafe_water: 'Unsafe (untreated/open)',
      assessment_section_symptoms: '3) Symptoms (select all that apply)',
      assessment_section_foods: '4) Available local foods',
      assessment_food_desc: 'Choose foods currently available in the household or local market.',
      assessment_label_food_search: 'Food search',
      assessment_placeholder_food_search: 'Search foods (e.g., lentils, fish, spinach)',
      assessment_section_photo: '5) Optional photo input',
      assessment_label_photo: 'Meal/Pantry photo (optional)',
      assessment_label_notes: 'Field notes',
      assessment_placeholder_notes: 'Any contextual notes from visit',
      assessment_btn_run: 'Run AI Assessment',
      results_title: 'Assessment Results',
      results_latest: 'Latest AI screening output appears below.',
      results_empty_title: 'No assessment found',
      results_empty_desc: 'Run a new assessment to generate AI results and recommendations.',
      results_empty_cta: 'Start Assessment',
      results_risk_title: 'Risk Classification',
      results_btn_read: 'Read aloud',
      results_btn_print: 'Print summary',
      results_actions_title: 'Priority Actions',
      results_def_title: 'Likely Deficiencies',
      results_def_head_nutrient: 'Nutrient concern',
      results_def_head_signal: 'Signal score',
      results_def_head_conf: 'Confidence',
      results_nearest_title: 'Nearest Services',
      results_open_map: 'Open Resource Map',
      results_meal_title: '7-Day Local Meal Plan',
      results_meal_desc: 'Budget-aware recommendations optimized for nutrients and locally available foods.',
      results_meal_head_day: 'Day',
      results_meal_head_breakfast: 'Breakfast',
      results_meal_head_lunch: 'Lunch',
      results_meal_head_dinner: 'Dinner',
      results_meal_head_cost: 'Est. cost',
      results_run_again: 'Run Another Assessment',
      results_view_dashboard: 'View Program Dashboard',
      dashboard_title: 'Program Dashboard (CHW/NGO)',
      dashboard_desc: 'Track risk trends, identify hotspots, and prioritize follow-up outreach. Individuals and families can continue using the assessment and results pages directly.',
      dashboard_metric_total: 'Total assessments',
      dashboard_metric_critical: 'High or urgent',
      dashboard_metric_follow: 'Follow-ups due this week',
      dashboard_metric_avg: 'Avg risk score',
      dashboard_risk_distribution: 'Risk Distribution',
      dashboard_hotspots: 'Community Hotspots',
      dashboard_recent_cases: 'Recent Cases',
      dashboard_head_date: 'Date',
      dashboard_head_household: 'Household',
      dashboard_head_community: 'Community',
      dashboard_head_risk: 'Risk',
      dashboard_action_queue: 'Action Queue',
      dashboard_add_screening: 'Add New Screening',
      dashboard_load_demo: 'Load Demo Data',
      dashboard_demo_action_1: 'Review case and schedule follow-up visit.',
      dashboard_demo_action_2: 'Confirm food support referral and update status.',
      learn_title: 'Nutrition Learning Hub',
      learn_desc: 'Short, practical, low-literacy lessons that individuals, families, caregivers, and CHWs can apply immediately.',
      learn_quiz_title: 'Myth vs Fact Quick Check',
      learn_myth_label: 'Myth:',
      learn_myth_text: '"Only expensive foods can prevent malnutrition."',
      learn_btn_myth: 'Myth',
      learn_btn_fact: 'Fact',
      learn_audio_title: 'Audio Assistant',
      learn_audio_desc: 'Tap to hear key guidance in plain language during field visits.',
      learn_btn_warning: 'Read warning signs',
      learn_btn_meal: 'Read meal tips',
      learn_alert_tip: 'Keep instructions short, visual, and repeated during follow-ups for better adoption.',
      auth_label_name: 'Full name',
      auth_label_email: 'Email',
      auth_label_password: 'Password',
      auth_label_confirm: 'Confirm password',
      map_option_ngo: 'NGO',
      footer_prefix: 'NutriPath AI for Fuel the Future Hackathon',
      title_home: 'NutriPath AI | Fuel the Future',
      title_assessment: 'NutriPath AI | Assessment',
      title_results: 'NutriPath AI | Results',
      title_map: 'NutriPath AI | Resource Map',
      title_dashboard: 'NutriPath AI | Program Dashboard',
      title_learn: 'NutriPath AI | Learning Hub',
      title_auth: 'NutriPath AI | Login & Sign Up',
      title_settings: 'NutriPath AI | Settings',
      common_na: 'N/A',
      map_selected_center: 'Selected center',
      map_hotspot_cases: 'High-risk cases: {count}',
      map_distance_value: '{distance} km',
      nutrient_iron: 'Iron',
      nutrient_protein: 'Protein',
      nutrient_zinc: 'Zinc',
      nutrient_calories: 'Calories',
      nutrient_vitamin_a: 'Vitamin A',
      day_mon: 'Mon',
      day_tue: 'Tue',
      day_wed: 'Wed',
      day_thu: 'Thu',
      day_fri: 'Fri',
      day_sat: 'Sat',
      day_sun: 'Sun',
      lesson_level_beginner: 'Beginner',
      lesson_level_essential: 'Essential',
      lesson_level_intermediate: 'Intermediate',
      lesson_1_title: 'Balanced Plate in 5 Minutes',
      lesson_1_content: 'Combine one energy food, one body-building food, and one protective food in each meal.',
      lesson_1_tip: 'Example: maize + beans + spinach',
      lesson_2_title: 'Spotting Early Warning Signs',
      lesson_2_content: 'Watch for reduced appetite, visible wasting, repeated diarrhea, and low activity levels.',
      lesson_2_tip: 'If severe edema or lethargy appears, refer immediately',
      lesson_3_title: 'Affordable Iron Boosters',
      lesson_3_content: 'Use lentils, moringa, spinach, and small fish with vitamin C foods for better iron absorption.',
      lesson_3_tip: 'Pair lentils with orange or mango',
      learn_quick_tip_prefix: 'Quick tip',
      learn_speak_lesson: '{title}. {content}. Quick tip: {tip}.',
      results_speak_summary: 'Risk level is {risk}. Key actions are: {actions}. Top nutrient concerns are {nutrients}.'
    },
    es: {
      nav_home: 'Inicio', nav_assessment: 'Evaluacion', nav_results: 'Resultados', nav_map: 'Mapa de Recursos', nav_dashboard: 'Panel del Programa', nav_learn: 'Centro de Aprendizaje', nav_settings: 'Configuracion',
      btn_login: 'Iniciar sesion', btn_signup: 'Registrarse', btn_account: 'Cuenta', btn_logout: 'Cerrar sesion', label_signed_in: 'Conectado',
      settings_title: 'Configuracion de Idioma', settings_desc: 'Elige el idioma de la aplicacion. La interfaz se actualiza de inmediato.', settings_language_label: 'Idioma de visualizacion', settings_saved: 'Idioma guardado. La aplicacion ahora usa este idioma.', settings_note: 'Consejo: "Preferred language" en evaluacion es para el reporte; esta opcion cambia la interfaz.',
      map_status_select: 'Selecciona o escribe una comunidad y luego haz clic en Aplicar filtros para usar distancia.', map_status_unrecognized: 'Comunidad no reconocida. Mostrando resultados globales por tipo seleccionado.', map_status_applied_local: 'Aplicado: {count} recurso(s) dentro de {distance} km de {center}. {summary}', map_status_applied_global: 'Aplicado: {count} recurso(s) globales. {summary}. Selecciona una comunidad para activar distancia.', map_distance_pending: 'La distancia aparece despues de seleccionar una comunidad', map_distance_away: '{distance} km de distancia', map_summary: 'Clinicas: {clinic} · Apoyo alimentario: {food} · ONG: {ngo}', current_location: 'Ubicacion actual',
      validation_food_min: 'Selecciona al menos 3 alimentos para que el planificador genere recomendaciones realistas.', validation_required: 'Completa todos los campos obligatorios antes de ejecutar la evaluacion.',
      risk_urgent_alert: 'Riesgo critico detectado. Se requiere derivacion inmediata y seguimiento cercano.', risk_high_alert: 'Riesgo alto. Inicia intervenciones nutricionales ahora y programa revision clinica esta semana.', risk_moderate_alert: 'Riesgo moderado. Mejora la diversidad de la dieta y monitorea en 2 semanas.', risk_low_alert: 'Riesgo inmediato bajo. Continua prevencion y monitoreo mensual.',
      budget_high: 'La presion del presupuesto es alta. Prioriza frijoles/lentejas/mijo y solicita apoyo alimentario.', budget_moderate: 'Presupuesto moderado. Usa sustituciones con harina fortificada, hojas verdes y legumbres.', budget_low: 'El presupuesto puede sostener el plan y mejorar la calidad nutricional.',
      dashboard_no_data: 'Aun no hay datos. Ejecuta una evaluacion o carga datos de demostracion.', dashboard_no_critical: 'No hay casos criticos en la cola.',
      learn_quiz_correct: 'Correcto. Alimentos locales asequibles como lentejas, verduras, huevos y harina fortificada pueden mejorar mucho la nutricion.', learn_quiz_wrong: 'No exactamente. Muchos alimentos de bajo costo pueden ser muy nutritivos si se combinan bien.',
      auth_invalid: 'Correo o contrasena invalidos.', auth_login_success: 'Inicio de sesion correcto. Redirigiendo...', auth_signup_success: 'Cuenta creada. Inicia sesion para guardar reportes.', auth_password_mismatch: 'Las contrasenas no coinciden.', auth_fields_required: 'Completa todos los campos de registro.', auth_email_invalid: 'Ingresa un correo valido.', auth_password_short: 'La contrasena debe tener al menos 6 caracteres.', auth_email_exists: 'Ya existe una cuenta con ese correo.',
      guest_mode_banner: 'El modo invitado es temporal. Inicia sesion para guardar reportes entre visitas.'
    },
    fr: {
      nav_home: 'Accueil',
      nav_assessment: 'Évaluation',
      nav_results: 'Résultats',
      nav_map: 'Carte des ressources',
      nav_dashboard: 'Tableau de bord du programme',
      nav_learn: 'Centre d\'apprentissage',
      nav_settings: 'Paramètres',
      lang_english: 'Anglais',
      lang_french: 'Français',
      map_title: 'Localisateur de ressources alimentaires et de santé',
      map_desc: 'Trouvez des cliniques à proximité, le soutien d\'ONG et des points de distribution de nourriture, puis hiérarchisez les références en fonction du niveau de risque.',
      map_label_community: 'Centre communautaire',
      map_hint_community: 'Tapez manuellement ou choisissez parmi les suggestions.',
      map_label_type: 'Type de ressource',
      map_option_all: 'Tous',
      map_option_clinic: 'Clinique',
      map_option_food: 'Soutien alimentaire',
      map_label_distance: 'Distance maximale (km)',
      btn_use_location: 'Utiliser ma position',
      btn_apply_filters: 'Appliquer des filtres',
      map_nearby_resources: 'Ressources à proximité',
      btn_login: 'Se connecter',
      btn_signup: 'S\'inscrire',
      btn_account: 'Compte',
      btn_logout: 'Se déconnecter',
      label_signed_in: 'Connecté',
      settings_title: 'Paramètres de langue',
      settings_desc: 'Choisissez la langue de votre application. L\'interface est mise à jour immédiatement sur les pages.',
      settings_language_label: 'Langue d\'affichage',
      settings_saved: 'Langue enregistrée. L\'application utilise désormais cette langue.',
      settings_note: 'Astuce : l\'évaluation « Langue préférée » est destinée au contexte du rapport ; ce paramètre contrôle le texte de l’interface utilisateur de l’application.',
      map_status_select: 'Sélectionnez ou saisissez une communauté, puis cliquez sur Appliquer des filtres pour utiliser la correspondance basée sur la distance.',
      map_status_unrecognized: 'Communauté non reconnue. Affichage des résultats globalement par type sélectionné.',
      map_status_applied_local: 'Appliqué : {count} ressource(s) dans un rayon de {distance} km de {center}. {summary}',
      map_status_applied_global: 'Appliqué : {count} ressource(s) à l\'échelle mondiale. {summary}. Sélectionnez une communauté pour activer le filtrage par distance.',
      map_no_data_local: 'Aucun service trouvé pour ce filtre et cette distance. Augmentez la portée ou choisissez un autre type.',
      map_no_data_global: 'Aucun service trouvé pour ce type de ressource.',
      map_location_denied: 'Autorisation de localisation refusée. Veuillez plutôt saisir une communauté manuellement.',
      map_distance_pending: 'Distance disponible après sélection d\'une communauté',
      map_distance_away: 'À {distance} km',
      placeholder_community_search: 'Sélectionner ou rechercher une communauté',
      map_summary: 'Cliniques : {clinic} · Soutien alimentaire : {food} · ONG : {ngo}',
      current_location: 'Emplacement actuel',
      validation_food_min: 'Sélectionnez au moins 3 aliments disponibles afin que le planificateur de repas IA puisse générer des recommandations réalistes.',
      validation_required: 'Veuillez remplir tous les champs obligatoires avant d\'exécuter l\'évaluation de l\'IA.',
      risk_urgent_alert: 'Risque critique détecté. Une référence immédiate et un suivi étroit sont nécessaires.',
      risk_high_alert: 'Risque élevé. Commencez les interventions nutritionnelles dès maintenant et planifiez un examen clinique cette semaine.',
      risk_moderate_alert: 'Risque modéré. Renforcez la diversité alimentaire et suivez la croissance en 2 semaines.',
      risk_low_alert: 'Faible risque immédiat. Poursuivre la nutrition préventive et la surveillance mensuelle.',
      budget_high: 'La pression budgétaire est forte. Donnez la priorité aux haricots/lentilles/mil et demandez un soutien alimentaire aux ONG proches.',
      budget_moderate: 'Le budget est modéré. Utilisez des substitutions avec de la farine enrichie, des légumes-feuilles et des légumineuses.',
      budget_low: 'Le niveau budgétaire peut soutenir le plan alimentaire actuel tout en améliorant la qualité des nutriments.',
      dashboard_no_data: 'Aucune donnée pour l\'instant. Exécutez une évaluation ou chargez des données de démonstration.',
      dashboard_no_critical: 'Aucun cas critique en file d’attente.',
      learn_quiz_correct: 'Correct. Des aliments locaux abordables comme les lentilles, les légumes verts, les œufs et la farine enrichie peuvent améliorer considérablement la nutrition.',
      learn_quiz_wrong: 'Pas tout à fait. De nombreux aliments locaux à faible coût peuvent être très nutritifs lorsqu’ils sont bien combinés.',
      auth_invalid: 'Email ou mot de passe invalide.',
      auth_login_success: 'Connexion réussie. Redirection...',
      auth_signup_success: 'Compte créé. Veuillez vous connecter pour commencer à enregistrer les rapports.',
      auth_password_mismatch: 'Les mots de passe ne correspondent pas.',
      auth_fields_required: 'Veuillez remplir tous les champs d\'inscription.',
      auth_email_invalid: 'S\'il vous plaît, mettez une adresse email valide.',
      auth_password_short: 'Le mot de passe doit comporter au moins 6 caractères.',
      auth_email_exists: 'Un compte avec cette adresse email existe déjà.',
      guest_mode_banner: 'Le mode Invité est temporaire. Connectez-vous pour enregistrer vos rapports au fil des visites.',
      results_summary: 'Ménage sélectionné {household} le {date} dans {community}.',
      results_followup: 'Prochain suivi recommandé dans {days} jour(s).',
      results_risk_suffix: 'Risque',
      common_cancel: 'Annuler',
      risk_label_low: 'Faible',
      risk_label_moderate: 'Modéré',
      risk_label_high: 'Haut',
      risk_label_urgent: 'Urgent',
      dashboard_hotspot_label: 'Cas élevés/urgents',
      learn_btn_listen: 'Écouter',
      learn_speak_warning: 'Les signes avant-coureurs comprennent un manque d’appétit, des diarrhées répétées, une émaciation visible et une léthargie. Référez immédiatement les signes urgents.',
      learn_speak_meal: 'Construisez chaque repas avec un aliment énergétique, un aliment protéiné et un aliment riche en vitamines. Utilisez des ingrédients locaux abordables.',
      action_urgent_1: 'Orienter vers la clinique la plus proche dans les 24 heures pour un dépistage de malnutrition aiguë sévère.',
      action_urgent_2: 'Commencez immédiatement des repas riches en énergie et en protéines et surveillez votre hydratation.',
      action_urgent_3: 'Planifiez une visite de suivi dans les 48 heures.',
      action_high_1: 'Réservez une consultation nutritionnelle cette semaine et répétez le PB dans 7 jours.',
      action_high_2: 'Augmentez la fréquence des repas à 4 fois/jour avec des protéines au moins deux fois par jour.',
      action_high_3: 'Suivez quotidiennement l’appétit et la consistance des selles.',
      action_moderate_1: 'Améliorez la diversité alimentaire cette semaine et ajoutez un aliment riche en fer par jour.',
      action_moderate_2: 'Répétez le contrôle de croissance dans 14 jours.',
      action_moderate_3: 'Suivez des micro-leçons sur la nutrition des soignants dans Learning Hub.',
      action_low_1: 'Poursuivre les pratiques d\'alimentation actuelles et effectuer un nouveau dépistage tous les mois.',
      action_low_2: 'Maintenez des routines d’eau salubre et de lavage des mains.',
      symptom_fatigue: 'Fatigue/faible énergie',
      symptom_poor_appetite: 'Manque d\'appétit',
      symptom_diarrhea: 'Diarrhée fréquente',
      symptom_fever: 'Fièvre/infection récente',
      symptom_pallor: 'Peau pâle / pâleur',
      symptom_edema: 'Œdème/gonflement',
      symptom_wasting: 'Émaciation visible',
      symptom_hair_loss: 'Amincissement/décoloration des cheveux',
      symptom_night_vision: 'Mauvaise vision en basse lumière',
      symptom_lethargy: 'Léthargie/pas d\'alerte',
      home_badge_triage: 'Triage de l\'IA',
      home_badge_meal: 'Planification des repas locaux',
      home_badge_offline: 'PWA prête pour le hors ligne',
      home_hero_title: 'Détectez la malnutrition dès le début et mettez en œuvre des actions nutritionnelles pratiques en quelques minutes.',
      home_hero_desc: 'NutriPath AI aide les individus, les familles, les soignants, les agents de santé et les ONG à organiser des dépistages, à générer des plans de repas locaux à faible coût et à connecter les ménages aux services d\'assistance à proximité à partir d\'une seule plateforme Web.',
      home_cta_assessment: 'Commencer l\'évaluation de l\'IA',
      home_cta_dashboard: 'Ouvrir le tableau de bord du programme',
      home_feature1_title: '1. Dépistage guidé des risques',
      home_feature1_desc: 'Capturez le PB, les symptômes, la diversité alimentaire et le contexte du ménage grâce à un simple formulaire mobile avec des étiquettes de faible niveau d\'alphabétisation.',
      home_feature2_title: '2. Plan d\'action basé sur l\'IA',
      home_feature2_desc: 'Obtenez un score de risque, des conseils de référence urgents, des carences probables et un plan nutritionnel familial utilisant des aliments locaux abordables.',
      home_feature3_title: '3. Routage des ressources',
      home_feature3_desc: 'Trouvez instantanément des cliniques, des points de soutien alimentaire et des services d\'ONG grâce à des cartes cartographiques prêtes à l\'emploi et des estimations de distance de déplacement.',
      home_built_title: 'Conçu pour les communautés mal desservies',
      home_built_desc: 'L\'interface comprend des commandes par icône, des lectures vocales et un chargement rapide sur une faible bande passante. Les données peuvent être capturées lors de visites sur le terrain et synchronisées ultérieurement.',
      home_kpi_time: 'Durée moyenne de dépistage',
      home_kpi_turnaround: 'Revirement des recommandations d’IA',
      home_kpi_users_label: 'Utilisateurs conçus',
      home_kpi_users_value: 'Individus + Familles + ASC + ONG',
      home_flow_title: 'Flux de base à l\'intérieur de l\'application',
      home_flow_head_step: 'Étape',
      home_flow_head_user: 'Que fait l\'utilisateur',
      home_flow_head_app: 'Quelle application renvoie',
      home_flow_1_user: 'Remplir le formulaire de sélection',
      home_flow_1_app: 'Profil santé + alimentation validé',
      home_flow_2_user: 'Exécuter une évaluation de l\'IA',
      home_flow_2_app: 'Classe de risque + urgence + signaux de carence',
      home_flow_3_user: 'Planificateur de repas ouvert',
      home_flow_3_app: 'Recommandations de repas locaux sur 7 jours',
      home_flow_4_user: 'Vérifier la carte',
      home_flow_4_app: 'Points d\'assistance à proximité triés par distance',
      home_flow_5_user: 'Suivi des pistes',
      home_flow_5_app: 'Historique des cas + tableau de bord des points chauds',
      assessment_title: 'Évaluation des risques de malnutrition par l’IA',
      assessment_desc: 'Remplissez ce formulaire lors d\'une visite à domicile ou d\'un autocontrôle. Le système produit une classe de risque, des actions d\'urgence, des carences probables et un plan de repas local abordable.',
      assessment_progress: 'Progrès de l’évaluation',
      assessment_section_profile: '1) Profil',
      assessment_label_role: 'Rôle',
      assessment_option_select_role: 'Sélectionnez un rôle',
      assessment_role_individual: 'Individu / Membre de la famille',
      assessment_role_caregiver: 'Soignant / Parent',
      assessment_role_chw: 'Agent de santé communautaire',
      assessment_role_ngo: 'Personnel des ONG/cliniques',
      assessment_role_hint: 'Tout le monde peut utiliser cet outil. Choisissez le rôle le plus proche de vous.',
      assessment_label_language: 'Langue préférée',
      assessment_placeholder_language: 'Rechercher ou saisir une langue',
      assessment_language_hint: 'Recherchez par nom de langue ou saisissez-le manuellement.',
      assessment_label_household: 'Nom du ménage / pièce d\'identité',
      assessment_placeholder_household: 'par exemple, HH-102 ou nom de famille',
      assessment_label_community: 'Communauté',
      assessment_community_hint: 'Fonctionne avec la recherche et la saisie manuelle.',
      assessment_label_age: 'Âge (années)',
      assessment_placeholder_age: 'par exemple, 18',
      assessment_label_sex: 'Sexe',
      assessment_option_select_sex: 'Sélectionnez le sexe',
      assessment_option_female: 'Femelle',
      assessment_option_male: 'Mâle',
      assessment_label_household_size: 'Taille du ménage',
      assessment_label_budget: 'Budget alimentaire (USD/semaine)',
      assessment_section_health: '2) Santé et croissance',
      assessment_label_weight: 'Poids (kg)',
      assessment_label_height: 'Hauteur (cm)',
      assessment_label_muac: 'MUAC (circonférence mi-haute du bras, cm)',
      assessment_label_meals: 'Repas par jour',
      assessment_label_diversity: 'Score de diversité alimentaire (0-10)',
      assessment_label_water: 'Source d\'eau',
      assessment_option_select_source: 'Sélectionnez la source',
      assessment_option_safe_water: 'Sûre (traitée/canalisée)',
      assessment_option_unsafe_water: 'Non sûre (non traitée/source ouverte)',
      assessment_section_symptoms: '3) Symptômes (sélectionnez toutes les réponses applicables)',
      assessment_section_foods: '4) Aliments locaux disponibles',
      assessment_food_desc: 'Choisissez des aliments actuellement disponibles dans le ménage ou sur le marché local.',
      assessment_label_food_search: 'Recherche de nourriture',
      assessment_placeholder_food_search: 'Rechercher des aliments (par exemple, lentilles, poisson, épinards)',
      assessment_section_photo: '5) Entrée photo en option',
      assessment_label_photo: 'Photo de repas/garde-manger (facultatif)',
      assessment_label_notes: 'Notes de terrain',
      assessment_placeholder_notes: 'Toutes notes contextuelles de la visite',
      assessment_btn_run: 'Exécuter une évaluation de l\'IA',
      results_title: 'Résultats de l\'évaluation',
      results_latest: 'Le dernier résultat de dépistage de l’IA apparaît ci-dessous.',
      results_empty_title: 'Aucune évaluation trouvée',
      results_empty_desc: 'Exécutez une nouvelle évaluation pour générer des résultats et des recommandations d’IA.',
      results_empty_cta: 'Commencer l\'évaluation',
      results_risk_title: 'Classification des risques',
      results_btn_read: 'Lire à haute voix',
      results_btn_print: 'Imprimer le résumé',
      results_actions_title: 'Actions prioritaires',
      results_def_title: 'Lacunes probables',
      results_def_head_nutrient: 'Préoccupation nutritionnelle',
      results_def_head_signal: 'Score de signal',
      results_def_head_conf: 'Confiance',
      results_nearest_title: 'Services les plus proches',
      results_open_map: 'Ouvrir la carte des ressources',
      results_meal_title: 'Plan de repas local sur 7 jours',
      results_meal_desc: 'Recommandations adaptées au budget et optimisées pour les nutriments et les aliments disponibles localement.',
      results_meal_head_day: 'Jour',
      results_meal_head_breakfast: 'Petit-déjeuner',
      results_meal_head_lunch: 'Déjeuner',
      results_meal_head_dinner: 'Dîner',
      results_meal_head_cost: 'Coût estimé',
      results_run_again: 'Exécuter une autre évaluation',
      results_view_dashboard: 'Afficher le tableau de bord du programme',
      dashboard_title: 'Tableau de bord du programme (ASC/ONG)',
      dashboard_desc: 'Suivez les tendances des risques, identifiez les points chauds et priorisez les activités de suivi. Les individus et les familles peuvent continuer à utiliser directement les pages d’évaluation et de résultats.',
      dashboard_metric_total: 'Total des évaluations',
      dashboard_metric_critical: 'Élevé ou urgent',
      dashboard_metric_follow: 'Suivis prévus cette semaine',
      dashboard_metric_avg: 'Score de risque moyen',
      dashboard_risk_distribution: 'Répartition des risques',
      dashboard_hotspots: 'Points d\'accès communautaires',
      dashboard_recent_cases: 'Cas récents',
      dashboard_head_date: 'Date',
      dashboard_head_household: 'Ménage',
      dashboard_head_community: 'Communauté',
      dashboard_head_risk: 'Risque',
      dashboard_action_queue: 'File d\'attente d\'actions',
      dashboard_add_screening: 'Ajouter un nouveau dépistage',
      dashboard_load_demo: 'Charger les données de démonstration',
      dashboard_demo_action_1: 'Examiner le cas et planifier une visite de suivi.',
      dashboard_demo_action_2: 'Confirmer l\'orientation vers l\'aide alimentaire et mettre à jour le statut.',
      learn_title: 'Centre d\'apprentissage sur la nutrition',
      learn_desc: 'Des cours courts, pratiques et à faible niveau d\'alphabétisation que les individus, les familles, les soignants et les ASC peuvent appliquer immédiatement.',
      learn_quiz_title: 'Vérification rapide entre mythe et réalité',
      learn_myth_label: 'Mythe:',
      learn_myth_text: '"Seuls des aliments coûteux peuvent prévenir la malnutrition."',
      learn_btn_myth: 'Mythe',
      learn_btn_fact: 'Fait',
      learn_audio_title: 'Assistant audio',
      learn_audio_desc: 'Appuyez pour entendre les conseils clés en langage simple lors des visites sur le terrain.',
      learn_btn_warning: 'Lire les panneaux d\'avertissement',
      learn_btn_meal: 'Lire les conseils de repas',
      learn_alert_tip: 'Gardez les instructions courtes, visuelles et répétées lors des suivis pour une meilleure adoption.',
      auth_label_name: 'Nom et prénom',
      auth_label_email: 'E-mail',
      auth_label_password: 'Mot de passe',
      auth_label_confirm: 'Confirmez le mot de passe',
      map_option_ngo: 'ONG',
      footer_prefix: 'NutriPath AI pour le hackathon Fuel the Future',
      title_home: 'IA NutriPath | Alimenter l’avenir',
      title_assessment: 'IA NutriPath | Évaluation',
      title_results: 'IA NutriPath | Résultats',
      title_map: 'IA NutriPath | Carte des ressources',
      title_dashboard: 'IA NutriPath | Tableau de bord du programme',
      title_learn: 'IA NutriPath | Centre d\'apprentissage',
      title_auth: 'IA NutriPath | Connexion et inscription',
      title_settings: 'IA NutriPath | Paramètres',
      common_na: 'N/A',
      map_selected_center: 'Centre sélectionné',
      map_hotspot_cases: 'Cas à haut risque : {count}',
      map_distance_value: '{distance} km',
      nutrient_iron: 'Fer',
      nutrient_protein: 'Protéine',
      nutrient_zinc: 'Zinc',
      nutrient_calories: 'Calories',
      nutrient_vitamin_a: 'Vitamine A',
      day_mon: 'Lun',
      day_tue: 'Mar',
      day_wed: 'Épouser',
      day_thu: 'Jeu',
      day_fri: 'Ven',
      day_sat: 'Assis',
      day_sun: 'Soleil',
      lesson_level_beginner: 'Débutant',
      lesson_level_essential: 'Essentiel',
      lesson_level_intermediate: 'Intermédiaire',
      lesson_1_title: 'Assiette équilibrée en 5 minutes',
      lesson_1_content: 'Combinez un aliment énergétique, un aliment musculation et un aliment protecteur à chaque repas.',
      lesson_1_tip: 'Exemple : maïs + haricots + épinards',
      lesson_2_title: 'Repérer les signes avant-coureurs',
      lesson_2_content: 'Surveillez la perte d’appétit, l’émaciation visible, les diarrhées répétées et les faibles niveaux d’activité.',
      lesson_2_tip: 'Si un œdème sévère ou une léthargie apparaît, référer immédiatement',
      lesson_3_title: 'Boosters de fer abordables',
      lesson_3_content: 'Utilisez des lentilles, du moringa, des épinards et des petits poissons avec des aliments contenant de la vitamine C pour une meilleure absorption du fer.',
      lesson_3_tip: 'Associez les lentilles à l\'orange ou à la mangue',
      learn_quick_tip_prefix: 'Astuce rapide',
      learn_speak_lesson: '{title}. {content}. Petit conseil : {tip}.',
      results_speak_summary: 'Le niveau de risque est {risk}. Les actions clés sont : {actions}. Les principales préoccupations en matière de nutriments sont {nutrients}.',
    },
    pt: {
      nav_home: 'Inicio', nav_assessment: 'Avaliacao', nav_results: 'Resultados', nav_map: 'Mapa de Recursos', nav_dashboard: 'Painel do Programa', nav_learn: 'Centro de Aprendizagem', nav_settings: 'Configuracoes',
      btn_login: 'Entrar', btn_signup: 'Cadastrar', btn_account: 'Conta', btn_logout: 'Sair', label_signed_in: 'Conectado',
      settings_title: 'Configuracoes de Idioma', settings_desc: 'Escolha o idioma do aplicativo. A interface atualiza imediatamente.', settings_language_label: 'Idioma de exibicao', settings_saved: 'Idioma salvo. O aplicativo agora usa este idioma.', settings_note: 'Dica: "Preferred language" na avaliacao e para o relatorio; esta opcao muda a interface.',
      map_status_select: 'Selecione ou digite uma comunidade e clique em Aplicar filtros para usar distancia.', map_status_unrecognized: 'Comunidade nao reconhecida. Mostrando resultados globais por tipo.', map_status_applied_local: 'Aplicado: {count} recurso(s) em {distance} km de {center}. {summary}', map_status_applied_global: 'Aplicado: {count} recurso(s) globais. {summary}. Selecione uma comunidade para ativar distancia.', map_distance_pending: 'Distancia disponivel apos selecionar comunidade', map_distance_away: '{distance} km de distancia', map_summary: 'Clinicas: {clinic} · Apoio alimentar: {food} · ONG: {ngo}', current_location: 'Localizacao atual',
      validation_food_min: 'Selecione pelo menos 3 alimentos disponiveis para gerar recomendacoes realistas.', validation_required: 'Preencha todos os campos obrigatorios antes de executar a avaliacao.',
      risk_urgent_alert: 'Risco critico detectado. Encaminhamento imediato e acompanhamento de perto sao necessarios.', risk_high_alert: 'Risco alto. Inicie intervencoes nutricionais agora e marque revisao clinica nesta semana.', risk_moderate_alert: 'Risco moderado. Melhore a diversidade da dieta e monitore em 2 semanas.', risk_low_alert: 'Baixo risco imediato. Continue prevencao e monitoramento mensal.',
      budget_high: 'Pressao alta no orcamento. Priorize feijoes/lentilhas/milho-miudo e solicite apoio alimentar.', budget_moderate: 'Orcamento moderado. Use substituicoes com farinha fortificada, folhas verdes e leguminosas.', budget_low: 'O orcamento suporta o plano atual e melhora a qualidade nutricional.',
      dashboard_no_data: 'Sem dados ainda. Execute uma avaliacao ou carregue dados de demonstracao.', dashboard_no_critical: 'Nenhum caso critico na fila.',
      learn_quiz_correct: 'Correto. Alimentos locais acessiveis como lentilhas, folhas verdes, ovos e farinha fortificada melhoram a nutricao.', learn_quiz_wrong: 'Nao exatamente. Muitos alimentos de baixo custo podem ser muito nutritivos quando combinados bem.',
      auth_invalid: 'Email ou senha invalidos.', auth_login_success: 'Login bem-sucedido. Redirecionando...', auth_signup_success: 'Conta criada. Faca login para salvar relatorios.', auth_password_mismatch: 'As senhas nao coincidem.', auth_fields_required: 'Preencha todos os campos de cadastro.', auth_email_invalid: 'Digite um email valido.', auth_password_short: 'A senha deve ter pelo menos 6 caracteres.', auth_email_exists: 'Ja existe uma conta com este email.',
      guest_mode_banner: 'Modo visitante e temporario. Entre para salvar relatorios entre visitas.'
    },
    sw: {
      nav_home: 'Nyumbani', nav_assessment: 'Tathmini', nav_results: 'Matokeo', nav_map: 'Ramani ya Rasilimali', nav_dashboard: 'Dashibodi ya Programu', nav_learn: 'Kituo cha Kujifunza', nav_settings: 'Mipangilio',
      btn_login: 'Ingia', btn_signup: 'Jisajili', btn_account: 'Akaunti', btn_logout: 'Toka', label_signed_in: 'Umeingia',
      settings_title: 'Mipangilio ya Lugha', settings_desc: 'Chagua lugha ya programu. Kiolesura hubadilika mara moja.', settings_language_label: 'Lugha ya kuonyesha', settings_saved: 'Lugha imehifadhiwa. Programu sasa inatumia lugha hii.', settings_note: 'Kidokezo: "Preferred language" kwenye tathmini ni kwa ripoti; hiki hubadilisha maandishi ya programu.',
      map_status_select: 'Chagua au andika jamii, kisha bonyeza Apply filters kutumia umbali.', map_status_unrecognized: 'Jamii haitambuliki. Inaonyesha matokeo ya kimataifa kwa aina uliyochagua.', map_status_applied_local: 'Imetumika: rasilimali {count} ndani ya km {distance} kutoka {center}. {summary}', map_status_applied_global: 'Imetumika: rasilimali {count} kimataifa. {summary}. Chagua jamii kuwezesha umbali.', map_distance_pending: 'Umbali utaonekana baada ya kuchagua jamii', map_distance_away: 'km {distance} kutoka hapa', map_summary: 'Kliniki: {clinic} · Msaada wa chakula: {food} · NGO: {ngo}', current_location: 'Eneo la sasa',
      validation_food_min: 'Chagua angalau vyakula 3 vinavyopatikana ili mpango utoe mapendekezo halisi.', validation_required: 'Tafadhali jaza sehemu zote muhimu kabla ya kuendesha tathmini.',
      risk_urgent_alert: 'Hatari kubwa imegunduliwa. Rufaa ya haraka na ufuatiliaji wa karibu vinahitajika.', risk_high_alert: 'Hatari ni juu. Anza hatua za lishe sasa na panga mapitio ya kliniki wiki hii.', risk_moderate_alert: 'Hatari ya kati. Ongeza utofauti wa lishe na fuatilia baada ya wiki 2.', risk_low_alert: 'Hatari ya haraka ni ndogo. Endelea na kinga na ufuatiliaji wa kila mwezi.',
      budget_high: 'Bajeti ni ndogo sana. Weka kipaumbele maharagwe/dengu/mtama na omba msaada wa chakula.', budget_moderate: 'Bajeti ni ya kati. Tumia mbadala kama unga ulioboreshwa, mboga za majani na kunde.', budget_low: 'Bajeti inatosha kuendeleza mpango wa lishe na kuboresha ubora.',
      dashboard_no_data: 'Bado hakuna data. Endesha tathmini au pakia data ya majaribio.', dashboard_no_critical: 'Hakuna kesi muhimu kwenye foleni.',
      learn_quiz_correct: 'Sahihi. Vyakula vya ndani vya bei nafuu kama dengu, mboga za majani, mayai na unga ulioboreshwa vinaweza kuboresha lishe sana.', learn_quiz_wrong: 'Sio sahihi kabisa. Vyakula vingi vya gharama nafuu vinaweza kuwa na lishe bora vikichanganywa vizuri.',
      auth_invalid: 'Barua pepe au nenosiri si sahihi.', auth_login_success: 'Umeingia vizuri. Inaelekeza...', auth_signup_success: 'Akaunti imeundwa. Tafadhali ingia ili kuhifadhi ripoti.', auth_password_mismatch: 'Nenosiri halifanani.', auth_fields_required: 'Tafadhali jaza sehemu zote za usajili.', auth_email_invalid: 'Tafadhali weka barua pepe sahihi.', auth_password_short: 'Nenosiri liwe na angalau herufi 6.', auth_email_exists: 'Akaunti yenye barua pepe hii tayari ipo.',
      guest_mode_banner: 'Hali ya mgeni ni ya muda. Ingia ili kuhifadhi ripoti zako kati ya ziara.'
    },
    hi: {
      nav_home: 'होम', nav_assessment: 'आकलन', nav_results: 'परिणाम', nav_map: 'संसाधन मानचित्र', nav_dashboard: 'प्रोग्राम डैशबोर्ड', nav_learn: 'लर्निंग हब', nav_settings: 'सेटिंग्स',
      btn_login: 'लॉग इन', btn_signup: 'साइन अप', btn_account: 'अकाउंट', btn_logout: 'लॉग आउट', label_signed_in: 'लॉग इन है',
      settings_title: 'भाषा सेटिंग्स', settings_desc: 'ऐप की भाषा चुनें। इंटरफेस तुरंत बदल जाएगा।', settings_language_label: 'डिस्प्ले भाषा', settings_saved: 'भाषा सेव हो गई। ऐप अब यही भाषा उपयोग करेगा।', settings_note: 'नोट: आकलन का "Preferred language" रिपोर्ट संदर्भ के लिए है; यह सेटिंग ऐप की भाषा बदलती है।',
      map_status_select: 'कम्युनिटी चुनें या टाइप करें, फिर Apply filters दबाएं ताकि दूरी आधारित परिणाम दिखें।', map_status_unrecognized: 'कम्युनिटी पहचानी नहीं गई। चुने गए प्रकार के अनुसार वैश्विक परिणाम दिखाए जा रहे हैं।', map_status_applied_local: 'लागू: {center} से {distance} किमी के भीतर {count} संसाधन। {summary}', map_status_applied_global: 'लागू: वैश्विक रूप से {count} संसाधन। {summary}. दूरी फ़िल्टर के लिए कम्युनिटी चुनें।', map_distance_pending: 'कम्युनिटी चुनने के बाद दूरी दिखेगी', map_distance_away: '{distance} किमी दूर', map_summary: 'क्लिनिक: {clinic} · फूड सपोर्ट: {food} · NGO: {ngo}', current_location: 'वर्तमान स्थान',
      validation_food_min: 'कृपया कम से कम 3 उपलब्ध खाद्य विकल्प चुनें ताकि वास्तविक सिफारिशें बन सकें।', validation_required: 'आकलन चलाने से पहले सभी आवश्यक फ़ील्ड भरें।',
      risk_urgent_alert: 'गंभीर जोखिम मिला है। तुरंत रेफरल और नज़दीकी फॉलो-अप आवश्यक है।', risk_high_alert: 'उच्च जोखिम। पोषण हस्तक्षेप तुरंत शुरू करें और इस सप्ताह क्लिनिक समीक्षा तय करें।', risk_moderate_alert: 'मध्यम जोखिम। आहार विविधता बढ़ाएं और 2 सप्ताह में निगरानी करें।', risk_low_alert: 'तत्काल जोखिम कम है। रोकथाम और मासिक मॉनिटरिंग जारी रखें।',
      budget_high: 'बजट दबाव बहुत अधिक है। बीन्स/दाल/मिलेट को प्राथमिकता दें और खाद्य सहायता लें।', budget_moderate: 'बजट मध्यम है। फोर्टिफाइड आटा, पत्तेदार सब्जियां और दलहन से विकल्प बनाएं।', budget_low: 'बजट मौजूदा भोजन योजना को अच्छी तरह सपोर्ट करता है।',
      dashboard_no_data: 'अभी डेटा नहीं है। नया आकलन करें या डेमो डेटा लोड करें।', dashboard_no_critical: 'कतार में कोई गंभीर मामला नहीं है।',
      learn_quiz_correct: 'सही। सस्ती स्थानीय चीजें जैसे दालें, हरी सब्जियां, अंडे और फोर्टिफाइड आटा पोषण में बड़ा सुधार ला सकते हैं।', learn_quiz_wrong: 'पूरी तरह सही नहीं। कम लागत वाले कई खाद्य पदार्थ सही संयोजन में बहुत पौष्टिक होते हैं।',
      auth_invalid: 'ईमेल या पासवर्ड गलत है।', auth_login_success: 'लॉगिन सफल। रीडायरेक्ट हो रहा है...', auth_signup_success: 'अकाउंट बन गया। रिपोर्ट सेव करने के लिए लॉगिन करें।', auth_password_mismatch: 'पासवर्ड मेल नहीं खा रहे।', auth_fields_required: 'साइन-अप के सभी फ़ील्ड भरें।', auth_email_invalid: 'मान्य ईमेल पता दर्ज करें।', auth_password_short: 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।', auth_email_exists: 'इस ईमेल से अकाउंट पहले से मौजूद है।',
      guest_mode_banner: 'गेस्ट मोड अस्थायी है। रिपोर्ट सेव करने के लिए लॉगिन करें।'
    },
    bn: {
      nav_home: 'হোম', nav_assessment: 'মূল্যায়ন', nav_results: 'ফলাফল', nav_map: 'রিসোর্স ম্যাপ', nav_dashboard: 'প্রোগ্রাম ড্যাশবোর্ড', nav_learn: 'লার্নিং হাব', nav_settings: 'সেটিংস',
      btn_login: 'লগ ইন', btn_signup: 'সাইন আপ', btn_account: 'অ্যাকাউন্ট', btn_logout: 'লগ আউট', label_signed_in: 'লগ ইন করা আছে',
      settings_title: 'ভাষা সেটিংস', settings_desc: 'অ্যাপের ভাষা নির্বাচন করুন। ইন্টারফেস সাথে সাথে বদলে যাবে।', settings_language_label: 'ডিসপ্লে ভাষা', settings_saved: 'ভাষা সংরক্ষণ করা হয়েছে। অ্যাপ এখন এই ভাষা ব্যবহার করবে।', settings_note: 'নোট: assessment-এর "Preferred language" রিপোর্টের জন্য; এই সেটিং UI ভাষা বদলায়।',
      map_status_select: 'কমিউনিটি নির্বাচন/টাইপ করুন, তারপর Apply filters চাপুন।', map_status_unrecognized: 'কমিউনিটি শনাক্ত হয়নি। নির্বাচিত টাইপ অনুযায়ী গ্লোবাল ফলাফল দেখানো হচ্ছে।', map_status_applied_local: 'প্রয়োগ হয়েছে: {center} থেকে {distance} কিমির মধ্যে {count} রিসোর্স। {summary}', map_status_applied_global: 'প্রয়োগ হয়েছে: বিশ্বজুড়ে {count} রিসোর্স। {summary}. দূরত্ব ফিল্টারের জন্য কমিউনিটি নির্বাচন করুন।', map_distance_pending: 'কমিউনিটি নির্বাচন করলে দূরত্ব দেখা যাবে', map_distance_away: '{distance} কিমি দূরে', map_summary: 'ক্লিনিক: {clinic} · খাদ্য সহায়তা: {food} · NGO: {ngo}', current_location: 'বর্তমান অবস্থান',
      validation_food_min: 'বাস্তবসম্মত সুপারিশের জন্য অন্তত ৩টি খাবার নির্বাচন করুন।', validation_required: 'মূল্যায়ন চালানোর আগে প্রয়োজনীয় সব ঘর পূরণ করুন।',
      risk_urgent_alert: 'গুরুতর ঝুঁকি ধরা পড়েছে। দ্রুত রেফারাল ও ঘন ফলো-আপ প্রয়োজন।', risk_high_alert: 'উচ্চ ঝুঁকি। এখনই পুষ্টি হস্তক্ষেপ শুরু করুন এবং এই সপ্তাহে ক্লিনিক রিভিউ নির্ধারণ করুন।', risk_moderate_alert: 'মাঝারি ঝুঁকি। খাদ্যের বৈচিত্র্য বাড়ান এবং ২ সপ্তাহ পর মনিটর করুন।', risk_low_alert: 'তাৎক্ষণিক ঝুঁকি কম। প্রতিরোধমূলক যত্ন ও মাসিক মনিটরিং চালিয়ে যান।',
      budget_high: 'বাজেটের চাপ বেশি। বিনস/ডাল/মিলেট অগ্রাধিকার দিন এবং খাদ্য সহায়তা নিন।', budget_moderate: 'বাজেট মাঝারি। ফোর্টিফায়েড আটা, শাকসবজি ও ডাল দিয়ে বিকল্প নিন।', budget_low: 'বর্তমান বাজেট খাদ্য পরিকল্পনা সমর্থন করতে সক্ষম।',
      dashboard_no_data: 'এখনও কোনো ডেটা নেই। একটি মূল্যায়ন চালান বা ডেমো ডেটা লোড করুন।', dashboard_no_critical: 'কিউ-তে কোনো গুরুতর কেস নেই।',
      learn_quiz_correct: 'সঠিক। ডাল, শাকসবজি, ডিম, ফোর্টিফায়েড আটা—এগুলোর মতো সাশ্রয়ী স্থানীয় খাবার পুষ্টি উন্নত করতে পারে।', learn_quiz_wrong: 'পুরোপুরি ঠিক নয়। কম খরচের অনেক খাবার সঠিকভাবে মিলিয়ে খেলে খুব পুষ্টিকর হয়।',
      auth_invalid: 'ইমেইল বা পাসওয়ার্ড ভুল।', auth_login_success: 'লগ ইন সফল। রিডাইরেক্ট হচ্ছে...', auth_signup_success: 'অ্যাকাউন্ট তৈরি হয়েছে। রিপোর্ট সেভ করতে লগ ইন করুন।', auth_password_mismatch: 'পাসওয়ার্ড মেলেনি।', auth_fields_required: 'সাইন-আপের সব ঘর পূরণ করুন।', auth_email_invalid: 'সঠিক ইমেইল দিন।', auth_password_short: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।', auth_email_exists: 'এই ইমেইল দিয়ে আগে থেকেই অ্যাকাউন্ট আছে।',
      guest_mode_banner: 'গেস্ট মোড সাময়িক। রিপোর্ট সংরক্ষণ করতে লগ ইন করুন।'
    },
    ar: {
      nav_home: 'الرئيسية', nav_assessment: 'التقييم', nav_results: 'النتائج', nav_map: 'خريطة الموارد', nav_dashboard: 'لوحة البرنامج', nav_learn: 'مركز التعلم', nav_settings: 'الإعدادات',
      btn_login: 'تسجيل الدخول', btn_signup: 'إنشاء حساب', btn_account: 'الحساب', btn_logout: 'تسجيل الخروج', label_signed_in: 'تم تسجيل الدخول',
      settings_title: 'إعدادات اللغة', settings_desc: 'اختر لغة التطبيق. سيتم تحديث الواجهة فوراً.', settings_language_label: 'لغة العرض', settings_saved: 'تم حفظ اللغة. التطبيق يستخدم هذه اللغة الآن.', settings_note: 'ملاحظة: "Preferred language" في التقييم للتقرير فقط؛ هذا الإعداد يغير واجهة التطبيق.',
      map_status_select: 'اختر المجتمع أو اكتبه ثم اضغط تطبيق الفلاتر لاستخدام المسافة.', map_status_unrecognized: 'لم يتم التعرف على المجتمع. يتم عرض النتائج العامة حسب النوع المحدد.', map_status_applied_local: 'تم التطبيق: {count} مورد ضمن {distance} كم من {center}. {summary}', map_status_applied_global: 'تم التطبيق: {count} مورد بشكل عام. {summary}. اختر مجتمعاً لتفعيل فلتر المسافة.', map_distance_pending: 'ستظهر المسافة بعد اختيار المجتمع', map_distance_away: 'يبعد {distance} كم', map_summary: 'العيادات: {clinic} · دعم الغذاء: {food} · NGO: {ngo}', current_location: 'الموقع الحالي',
      validation_food_min: 'اختر 3 أطعمة متاحة على الأقل للحصول على توصيات واقعية.', validation_required: 'يرجى إكمال جميع الحقول المطلوبة قبل تشغيل التقييم.',
      risk_urgent_alert: 'تم اكتشاف خطر حرج. يلزم إحالة فورية ومتابعة قريبة.', risk_high_alert: 'خطر مرتفع. ابدأ التدخلات الغذائية الآن وحدد مراجعة عيادية هذا الأسبوع.', risk_moderate_alert: 'خطر متوسط. حسن تنوع الغذاء وراقب خلال أسبوعين.', risk_low_alert: 'الخطر الفوري منخفض. استمر في الوقاية والمتابعة الشهرية.',
      budget_high: 'ضغط الميزانية مرتفع. أعطِ أولوية للفاصولياء/العدس/الدخن واطلب دعم غذائي.', budget_moderate: 'الميزانية متوسطة. استخدم بدائل مثل الدقيق المدعم والخضار الورقية والبقوليات.', budget_low: 'الميزانية الحالية تدعم خطة الوجبات بشكل جيد.',
      dashboard_no_data: 'لا توجد بيانات بعد. شغّل تقييماً أو حمّل بيانات تجريبية.', dashboard_no_critical: 'لا توجد حالات حرجة في قائمة المتابعة.',
      learn_quiz_correct: 'صحيح. الأطعمة المحلية منخفضة التكلفة مثل العدس والخضار والبيض والدقيق المدعم يمكن أن تحسن التغذية كثيراً.', learn_quiz_wrong: 'ليس تماماً. كثير من الأطعمة منخفضة التكلفة تكون مغذية جداً عند دمجها بشكل جيد.',
      auth_invalid: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.', auth_login_success: 'تم تسجيل الدخول بنجاح. جارٍ التحويل...', auth_signup_success: 'تم إنشاء الحساب. يرجى تسجيل الدخول لحفظ التقارير.', auth_password_mismatch: 'كلمتا المرور غير متطابقتين.', auth_fields_required: 'يرجى إكمال جميع حقول التسجيل.', auth_email_invalid: 'يرجى إدخال بريد إلكتروني صالح.', auth_password_short: 'يجب أن تكون كلمة المرور 6 أحرف على الأقل.', auth_email_exists: 'يوجد حساب بهذا البريد الإلكتروني بالفعل.',
      guest_mode_banner: 'وضع الضيف مؤقت. سجّل الدخول لحفظ التقارير بين الزيارات.'
    },
    zh: {
      nav_home: '首页', nav_assessment: '评估', nav_results: '结果', nav_map: '资源地图', nav_dashboard: '项目仪表盘', nav_learn: '学习中心', nav_settings: '设置',
      btn_login: '登录', btn_signup: '注册', btn_account: '账号', btn_logout: '退出', label_signed_in: '已登录',
      settings_title: '语言设置', settings_desc: '选择应用语言，界面会立即更新。', settings_language_label: '显示语言', settings_saved: '语言已保存，应用现在使用该语言。', settings_note: '提示：评估中的“Preferred language”用于报告；此处设置控制应用界面语言。',
      map_status_select: '请选择或输入社区，然后点击 Apply filters 使用距离筛选。', map_status_unrecognized: '未识别该社区。将按所选类型显示全局结果。', map_status_applied_local: '已应用：在 {center} {distance} 公里范围内共 {count} 个资源。{summary}', map_status_applied_global: '已应用：全局共 {count} 个资源。{summary}。选择社区可启用距离筛选。', map_distance_pending: '选择社区后可显示距离', map_distance_away: '距离 {distance} 公里', map_summary: '诊所: {clinic} · 食物支持: {food} · NGO: {ngo}', current_location: '当前位置',
      validation_food_min: '请至少选择 3 种可用食物，以生成更真实的建议。', validation_required: '运行评估前请填写所有必填项。',
      risk_urgent_alert: '检测到紧急风险。需要立即转诊并密切随访。', risk_high_alert: '风险较高。请立即开始营养干预，并在本周安排门诊复查。', risk_moderate_alert: '中等风险。请提高饮食多样性，并在 2 周内复查。', risk_low_alert: '当前风险较低。请继续预防并每月监测。',
      budget_high: '预算压力较大。优先选择豆类/扁豆/小米，并申请食物援助。', budget_moderate: '预算中等。可用强化面粉、绿叶菜和豆类进行替代。', budget_low: '当前预算可支持该饮食计划并提升营养质量。',
      dashboard_no_data: '暂无数据。请先进行评估或加载演示数据。', dashboard_no_critical: '队列中暂无高危个案。',
      learn_quiz_correct: '正确。像扁豆、绿叶菜、鸡蛋、强化面粉等本地低成本食物可明显改善营养。', learn_quiz_wrong: '不完全正确。许多低成本食物通过合理搭配也可以非常有营养。',
      auth_invalid: '邮箱或密码错误。', auth_login_success: '登录成功，正在跳转...', auth_signup_success: '账号已创建，请登录后保存报告。', auth_password_mismatch: '两次密码不一致。', auth_fields_required: '请填写所有注册字段。', auth_email_invalid: '请输入有效邮箱地址。', auth_password_short: '密码至少需要 6 个字符。', auth_email_exists: '该邮箱已存在账号。',
      guest_mode_banner: '访客模式为临时模式。登录后可跨会话保存报告。'
    }
  };

  let currentLang = localStorage.getItem(UI_LANG_KEY) || 'en';
  if (!I18N[currentLang] || !UI_LANGS.some((lang) => lang.code === currentLang)) currentLang = 'en';

  function parseJSON(raw, fallback) {
    try {
      return JSON.parse(raw || '');
    } catch {
      return fallback;
    }
  }

  function formatText(template, vars) {
    return String(template).replace(/\{(\w+)\}/g, (_, key) => String(vars?.[key] ?? ''));
  }

  function t(key, vars) {
    const dict = I18N[currentLang] || I18N.en;
    const fallback = I18N.en[key] || key;
    return formatText(dict[key] || fallback, vars);
  }

  function hasTranslationKey(key) {
    if (!key) return false;
    const activeDict = I18N[currentLang] || I18N.en;
    return Object.prototype.hasOwnProperty.call(activeDict, key) || Object.prototype.hasOwnProperty.call(I18N.en, key);
  }

  function applyTranslations(root = document) {
    root.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.dataset.i18n;
      if (!hasTranslationKey(key)) return;
      el.textContent = t(key);
    });

    root.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      const key = el.dataset.i18nPlaceholder;
      if (!hasTranslationKey(key)) return;
      if ('placeholder' in el) el.placeholder = t(key);
    });

    root.querySelectorAll('[data-i18n-title]').forEach((el) => {
      const key = el.dataset.i18nTitle;
      if (!hasTranslationKey(key)) return;
      el.title = t(key);
    });

    const titleKey = document.body?.dataset?.titleKey;
    if (titleKey && hasTranslationKey(titleKey)) {
      document.title = t(titleKey);
    }

    document.documentElement.lang = currentLang;
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

  function ensureSettingsLink() {
    const navLinks = document.querySelector('.nav-links');
    if (!navLinks) return;
    if (navLinks.querySelector('[data-nav="settings"]')) return;

    const link = document.createElement('a');
    link.className = 'nav-link';
    link.dataset.nav = 'settings';
    link.dataset.i18n = 'nav_settings';
    link.href = './settings.html';
    link.textContent = t('nav_settings');
    navLinks.appendChild(link);
  }

  function decorateNavForTranslation() {
    const links = document.querySelectorAll('.nav-links .nav-link');
    const keyMap = {
      home: 'nav_home',
      assessment: 'nav_assessment',
      results: 'nav_results',
      map: 'nav_map',
      dashboard: 'nav_dashboard',
      learn: 'nav_learn',
      settings: 'nav_settings'
    };

    links.forEach((link) => {
      const navId = link.dataset.nav;
      if (navId && keyMap[navId]) {
        link.dataset.i18n = keyMap[navId];
      }
      if (navId === page) link.classList.add('active');
    });
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
      userTag.textContent = `${t('label_signed_in')}: ${user.name || user.email}`;

      const accountLink = document.createElement('a');
      accountLink.className = 'btn btn-secondary btn-small';
      accountLink.href = './auth.html';
      accountLink.textContent = t('btn_account');

      const logoutButton = document.createElement('button');
      logoutButton.type = 'button';
      logoutButton.className = 'btn btn-secondary btn-small';
      logoutButton.textContent = t('btn_logout');
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
      loginLink.textContent = t('btn_login');

      const signUpLink = document.createElement('a');
      signUpLink.className = 'btn btn-primary btn-small';
      signUpLink.href = './auth.html?mode=signup';
      signUpLink.textContent = t('btn_signup');

      controls.appendChild(loginLink);
      controls.appendChild(signUpLink);
    }

    nav.appendChild(controls);
  }

  function applyGlobalUi() {
    ensureSettingsLink();
    decorateNavForTranslation();
    applyTranslations(document);
    createAuthButtons();
  }

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

  window.NutriApp = {
    t,

    hasTranslation(key) {
      return hasTranslationKey(key);
    },

    getUiLanguage() {
      return currentLang;
    },

    setUiLanguage(lang) {
      const next = I18N[lang] ? lang : 'en';
      currentLang = next;
      localStorage.setItem(UI_LANG_KEY, next);
      applyGlobalUi();
      window.dispatchEvent(new CustomEvent('nutri:lang-changed', { detail: { lang: next } }));
      return next;
    },

    getAvailableUiLanguages() {
      return UI_LANGS.slice();
    },

    translatePage(root = document) {
      applyTranslations(root);
      createAuthButtons();
    },

    formatDate(value) {
      return new Date(value).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    },

    getRiskLabel(category) {
      const map = {
        Low: 'risk_label_low',
        Moderate: 'risk_label_moderate',
        High: 'risk_label_high',
        Urgent: 'risk_label_urgent'
      };
      return t(map[category] || map.Low);
    },

    getResourceTypeLabel(type) {
      const map = {
        Clinic: 'map_option_clinic',
        'Food Support': 'map_option_food',
        NGO: 'map_option_ngo'
      };
      return t(map[type] || 'map_option_all');
    },

    getNutrientLabel(name) {
      const normalized = String(name || '').trim().toLowerCase();
      const map = {
        iron: 'nutrient_iron',
        protein: 'nutrient_protein',
        zinc: 'nutrient_zinc',
        calories: 'nutrient_calories',
        'vitamin a': 'nutrient_vitamin_a'
      };
      return map[normalized] ? t(map[normalized]) : name;
    },

    getDayLabel(day) {
      const map = {
        Mon: 'day_mon',
        Tue: 'day_tue',
        Wed: 'day_wed',
        Thu: 'day_thu',
        Fri: 'day_fri',
        Sat: 'day_sat',
        Sun: 'day_sun'
      };
      return map[day] ? t(map[day]) : day;
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
        return { ok: false, error: t('auth_fields_required') };
      }

      if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
        return { ok: false, error: t('auth_email_invalid') };
      }

      if (cleanPassword.length < 6) {
        return { ok: false, error: t('auth_password_short') };
      }

      const accounts = getAccounts();
      if (accounts.some((account) => account.email === cleanEmail)) {
        return { ok: false, error: t('auth_email_exists') };
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
        return { ok: false, error: t('auth_invalid') };
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

  applyGlobalUi();
})();
