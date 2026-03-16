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
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Espanol' },
    { code: 'fr', label: 'Francais' },
    { code: 'pt', label: 'Portugues' },
    { code: 'sw', label: 'Kiswahili' },
    { code: 'hi', label: 'Hindi' },
    { code: 'bn', label: 'Bangla' },
    { code: 'ar', label: 'Arabic' },
    { code: 'zh', label: 'Chinese (Simplified)' }
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
      results_risk_suffix: 'Risk'
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
      nav_home: 'Accueil', nav_assessment: 'Evaluation', nav_results: 'Resultats', nav_map: 'Carte des Ressources', nav_dashboard: 'Tableau de Bord', nav_learn: 'Centre d Apprentissage', nav_settings: 'Parametres',
      btn_login: 'Connexion', btn_signup: 'Inscription', btn_account: 'Compte', btn_logout: 'Deconnexion', label_signed_in: 'Connecte',
      settings_title: 'Parametres de Langue', settings_desc: 'Choisissez la langue de l application. L interface se met a jour immediatement.', settings_language_label: 'Langue d affichage', settings_saved: 'Langue enregistree. L application utilise maintenant cette langue.', settings_note: 'Astuce: "Preferred language" dans l evaluation concerne le rapport; ce reglage change l interface.',
      map_status_select: 'Selectionnez ou saisissez une communaute puis cliquez sur Appliquer les filtres pour utiliser la distance.', map_status_unrecognized: 'Communaute non reconnue. Affichage global selon le type choisi.', map_status_applied_local: 'Applique: {count} ressource(s) dans un rayon de {distance} km autour de {center}. {summary}', map_status_applied_global: 'Applique: {count} ressource(s) globales. {summary}. Selectionnez une communaute pour activer la distance.', map_distance_pending: 'Distance disponible apres selection d une communaute', map_distance_away: '{distance} km', map_summary: 'Cliniques: {clinic} · Aide alimentaire: {food} · ONG: {ngo}', current_location: 'Position actuelle',
      validation_food_min: 'Selectionnez au moins 3 aliments disponibles pour des recommandations realistes.', validation_required: 'Veuillez remplir tous les champs obligatoires avant de lancer l evaluation.',
      risk_urgent_alert: 'Risque critique detecte. Orientation immediate et suivi rapproche necessaires.', risk_high_alert: 'Risque eleve. Lancez les interventions nutritionnelles et planifiez une consultation cette semaine.', risk_moderate_alert: 'Risque modere. Renforcez la diversite alimentaire et controlez dans 2 semaines.', risk_low_alert: 'Risque immediate faible. Continuez la prevention et le suivi mensuel.',
      budget_high: 'Forte pression budgetaire. Priorisez haricots/lentilles/mil et demandez une aide alimentaire.', budget_moderate: 'Budget modere. Utilisez des substitutions avec farine fortifiee, legumes verts et legumineuses.', budget_low: 'Le budget permet de soutenir le plan alimentaire et d ameliorer la qualite nutritionnelle.',
      dashboard_no_data: 'Pas encore de donnees. Lancez une evaluation ou chargez les donnees de demo.', dashboard_no_critical: 'Aucun cas critique dans la file.',
      learn_quiz_correct: 'Correct. Des aliments locaux abordables comme lentilles, legumes verts, oeufs et farine fortifiee ameliorent la nutrition.', learn_quiz_wrong: 'Pas exactement. De nombreux aliments peu couteux peuvent etre tres nutritifs bien combines.',
      auth_invalid: 'Email ou mot de passe invalide.', auth_login_success: 'Connexion reussie. Redirection...', auth_signup_success: 'Compte cree. Connectez-vous pour enregistrer les rapports.', auth_password_mismatch: 'Les mots de passe ne correspondent pas.', auth_fields_required: 'Veuillez remplir tous les champs.', auth_email_invalid: 'Veuillez saisir un email valide.', auth_password_short: 'Le mot de passe doit contenir au moins 6 caracteres.', auth_email_exists: 'Un compte existe deja avec cet email.',
      guest_mode_banner: 'Le mode invite est temporaire. Connectez-vous pour enregistrer vos rapports.'
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
  if (!I18N[currentLang]) currentLang = 'en';

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

  function applyTranslations(root = document) {
    root.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.dataset.i18n;
      el.textContent = t(key);
    });

    root.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      const key = el.dataset.i18nPlaceholder;
      if ('placeholder' in el) el.placeholder = t(key);
    });

    root.querySelectorAll('[data-i18n-title]').forEach((el) => {
      const key = el.dataset.i18nTitle;
      el.title = t(key);
    });

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
