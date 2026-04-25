/* ============================================================
   i18n — Multilingual Support
   Languages: English, Hindi, Tamil, Telugu, Kannada, Bengali, Marathi
   ============================================================ */

const LANGUAGES = [
  { code: 'en', label: 'English',   native: 'English',    flag: '🇬🇧' },
  { code: 'hi', label: 'Hindi',     native: 'हिन्दी',      flag: '🇮🇳' },
  { code: 'ta', label: 'Tamil',     native: 'தமிழ்',       flag: '🇮🇳' },
  { code: 'te', label: 'Telugu',    native: 'తెలుగు',      flag: '🇮🇳' },
  { code: 'kn', label: 'Kannada',   native: 'ಕನ್ನಡ',      flag: '🇮🇳' },
  { code: 'bn', label: 'Bengali',   native: 'বাংলা',       flag: '🇮🇳' },
  { code: 'mr', label: 'Marathi',   native: 'मराठी',       flag: '🇮🇳' },
];

const TRANSLATIONS = {
  en: {
    /* Navbar */
    navTitle: 'Digital Lab',
    navSubtitle: 'Science Experiments',
    /* Dashboard */
    heroBadge: '🔬 SchoolUp Lab',
    heroTitle1: 'Interactive Science',
    heroTitle2: 'Experiments',
    heroDesc: 'Interactive Science Experiments for Classes 6–12. Explore by subject, class, concept, and difficulty with simulations, procedures, and viva practice.',
    chooseSubject: 'Choose Your Subject',
    allExperiments: 'All Experiments',
    /* Subjects */
    physics: 'Physics',
    chemistry: 'Chemistry',
    biology: 'Biology',
    physicsDesc: 'Circuits, pendulums, optics, motion & more',
    chemistryDesc: 'pH, reactions, sublimation, acids & solutions',
    biologyDesc: 'Cells, stomata, respiration, reproduction',
    physicsCount: '16 Experiments',
    chemistryCount: '13 Experiments',
    biologyCount: '11 Experiments',
    /* Stats */
    statExperiments: 'Experiments',
    statSubjects: 'Subjects',
    statInteractive: 'Interactive',
    statCurriculum: 'Curriculum',
    /* Experiment View */
    backToDashboard: '← Back to Dashboard',
    back: '← Back',
    labRecord: '📋 Lab Record',
    aim: '🎯 Aim',
    apparatus: '🔧 Apparatus',
    procedure: '📝 Procedure',
    precautions: '⚠️ Precautions',
    conclusion: '✅ Conclusion',
    interactiveSimulation: 'Interactive Simulation',
    loadingSimulation: 'Loading simulation...',
    /* Subject page */
    interactivePhysicsDesc: 'Interactive physics experiments with real-time simulations',
    interactiveChemistryDesc: 'Explore chemical reactions, properties, and analysis',
    interactiveBiologyDesc: 'Study life science through virtual microscopy and dissection',
  },

  hi: {
    navTitle: 'डिजिटल लैब',
    navSubtitle: 'विज्ञान प्रयोग',
    heroBadge: '🔬 वर्चुअल विज्ञान प्रयोगशाला',
    heroTitle1: 'भौतिकी डिजिटल',
    heroTitle2: 'प्रयोगशाला',
    heroDesc: 'भौतिकी, रसायन विज्ञान और जीव विज्ञान में इंटरैक्टिव प्रयोगों का अन्वेषण करें। रियल-टाइम सिमुलेशन और विस्तृत अवलोकन — सब आपके ब्राउज़र में।',
    chooseSubject: 'अपना विषय चुनें',
    allExperiments: 'सभी प्रयोग',
    physics: 'भौतिकी',
    chemistry: 'रसायन विज्ञान',
    biology: 'जीव विज्ञान',
    physicsDesc: 'सर्किट, लोलक, प्रकाशिकी, गति और बहुत कुछ',
    chemistryDesc: 'pH, अभिक्रियाएं, ऊर्ध्वपातन, अम्ल और विलयन',
    biologyDesc: 'कोशिकाएं, रन्ध्र, श्वसन, जनन',
    physicsCount: '११ प्रयोग',
    chemistryCount: '९ प्रयोग',
    biologyCount: '५ प्रयोग',
    statExperiments: 'प्रयोग',
    statSubjects: 'विषय',
    statInteractive: 'इंटरैक्टिव',
    statCurriculum: 'पाठ्यक्रम',
    backToDashboard: '← डैशबोर्ड पर वापस',
    back: '← वापस',
    labRecord: '📋 प्रयोगशाला रिकॉर्ड',
    aim: '🎯 उद्देश्य',
    apparatus: '🔧 उपकरण',
    procedure: '📝 प्रक्रिया',
    precautions: '⚠️ सावधानियाँ',
    conclusion: '✅ निष्कर्ष',
    interactiveSimulation: 'इंटरैक्टिव सिमुलेशन',
    loadingSimulation: 'सिमुलेशन लोड हो रहा है...',
    interactivePhysicsDesc: 'रियल-टाइम सिमुलेशन के साथ इंटरैक्टिव भौतिकी प्रयोग',
    interactiveChemistryDesc: 'रासायनिक अभिक्रियाओं, गुणों और विश्लेषण का अन्वेषण करें',
    interactiveBiologyDesc: 'वर्चुअल माइक्रोस्कोपी और विच्छेदन के माध्यम से जीव विज्ञान का अध्ययन',
  },

  ta: {
    navTitle: 'டிஜிட்டல் ஆய்வகம்',
    navSubtitle: 'அறிவியல் சோதனைகள்',
    heroBadge: '🔬 மெய்நிகர் அறிவியல் ஆய்வகம்',
    heroTitle1: 'இயற்பியல் டிஜிட்டல்',
    heroTitle2: 'ஆய்வகம்',
    heroDesc: 'இயற்பியல், வேதியியல் & உயிரியலில் ஊடாடும் சோதனைகளை ஆராயுங்கள். நிகழ்நேர உருவகங்கள் மற்றும் விரிவான கவனிப்புகள் — உங்கள் உலாவியில்.',
    chooseSubject: 'உங்கள் பாடத்தை தேர்ந்தெடுங்கள்',
    allExperiments: 'அனைத்து சோதனைகள்',
    physics: 'இயற்பியல்',
    chemistry: 'வேதியியல்',
    biology: 'உயிரியல்',
    physicsDesc: 'சுற்றுகள், ஊசலாட்டங்கள், ஒளியியல், இயக்கம் & மேலும்',
    chemistryDesc: 'pH, வினைகள், உர்த்வபாதனம், அமிலங்கள் & கரைசல்கள்',
    biologyDesc: 'உயிரணுக்கள், இலைத்துளைகள், சுவாசம், இனப்பெருக்கம்',
    physicsCount: '11 சோதனைகள்',
    chemistryCount: '9 சோதனைகள்',
    biologyCount: '5 சோதனைகள்',
    statExperiments: 'சோதனைகள்',
    statSubjects: 'பாடங்கள்',
    statInteractive: 'ஊடாடும்',
    statCurriculum: 'பாடத்திட்டம்',
    backToDashboard: '← டாஷ்போர்டுக்கு திரும்பு',
    back: '← திரும்பு',
    labRecord: '📋 ஆய்வக பதிவு',
    aim: '🎯 நோக்கம்',
    apparatus: '🔧 கருவிகள்',
    procedure: '📝 முறை',
    precautions: '⚠️ முன்னெச்சரிக்கைகள்',
    conclusion: '✅ முடிவு',
    interactiveSimulation: 'ஊடாடும் உருவகம்',
    loadingSimulation: 'உருவகம் ஏற்றுகிறது...',
    interactivePhysicsDesc: 'நிகழ்நேர உருவகங்களுடன் ஊடாடும் இயற்பியல் சோதனைகள்',
    interactiveChemistryDesc: 'வேதியியல் வினைகள், பண்புகள் மற்றும் பகுப்பாய்வை ஆராயுங்கள்',
    interactiveBiologyDesc: 'மெய்நிகர் நுண்ணோக்கியல் மூலம் உயிரியல் கற்கவும்',
  },

  te: {
    navTitle: 'డిజిటల్ ల్యాబ్',
    navSubtitle: 'విజ్ఞాన ప్రయోగాలు',
    heroBadge: '🔬 వర్చువల్ సైన్స్ ల్యాబ్',
    heroTitle1: 'భౌతిక శాస్త్రం డిజిటల్',
    heroTitle2: 'ప్రయోగశాల',
    heroDesc: 'భౌతిక శాస్త్రం, రసాయన శాస్త్రం & జీవ శాస్త్రంలో ఇంటరాక్టివ్ ప్రయోగాలను అన్వేషించండి. రియల్-టైమ్ సిమ్యులేషన్లు — మీ బ్రౌజర్‌లో.',
    chooseSubject: 'మీ విషయం ఎంచుకోండి',
    allExperiments: 'అన్ని ప్రయోగాలు',
    physics: 'భౌతిక శాస్త్రం',
    chemistry: 'రసాయన శాస్త్రం',
    biology: 'జీవ శాస్త్రం',
    physicsDesc: 'సర్క్యూట్లు, లోలకాలు, కాంతిశాస్త్రం, చలనం & మరిన్ని',
    chemistryDesc: 'pH, చర్యలు, ఊర్ద్వపాతనం, ఆమ్లాలు & ద్రావణాలు',
    biologyDesc: 'కణాలు, రంధ్రాలు, శ్వాసక్రియ, జననం',
    physicsCount: '11 ప్రయోగాలు',
    chemistryCount: '9 ప్రయోగాలు',
    biologyCount: '5 ప్రయోగాలు',
    statExperiments: 'ప్రయోగాలు',
    statSubjects: 'విషయాలు',
    statInteractive: 'ఇంటరాక్టివ్',
    statCurriculum: 'పాఠ్యక్రమం',
    backToDashboard: '← డాష్‌బోర్డ్‌కు తిరిగి',
    back: '← తిరిగి',
    labRecord: '📋 ల్యాబ్ రికార్డ్',
    aim: '🎯 లక్ష్యం',
    apparatus: '🔧 పరికరాలు',
    procedure: '📝 విధానం',
    precautions: '⚠️ జాగ్రత్తలు',
    conclusion: '✅ నిర్ణయం',
    interactiveSimulation: 'ఇంటరాక్టివ్ సిమ్యులేషన్',
    loadingSimulation: 'సిమ్యులేషన్ లోడ్ అవుతోంది...',
    interactivePhysicsDesc: 'రియల్-టైమ్ సిమ్యులేషన్లతో ఇంటరాక్టివ్ భౌతిక శాస్త్ర ప్రయోగాలు',
    interactiveChemistryDesc: 'రసాయన చర్యలు, లక్షణాలు మరియు విశ్లేషణను అన్వేషించండి',
    interactiveBiologyDesc: 'వర్చువల్ మైక్రోస్కోపీ ద్వారా జీవ శాస్త్రం అధ్యయనం చేయండి',
  },

  kn: {
    navTitle: 'ಡಿಜಿಟಲ್ ಲ್ಯಾಬ್',
    navSubtitle: 'ವಿಜ್ಞಾನ ಪ್ರಯೋಗಗಳು',
    heroBadge: '🔬 ವರ್ಚುವಲ್ ಸೈನ್ಸ್ ಲ್ಯಾಬ್',
    heroTitle1: 'ಭೌತಶಾಸ್ತ್ರ ಡಿಜಿಟಲ್',
    heroTitle2: 'ಪ್ರಯೋಗಾಲಯ',
    heroDesc: 'ಭೌತಶಾಸ್ತ್ರ, ರಸಾಯನಶಾಸ್ತ್ರ & ಜೀವಶಾಸ್ತ್ರದಲ್ಲಿ ಸಂವಾದಾತ್ಮಕ ಪ್ರಯೋಗಗಳನ್ನು ಅನ್ವೇಷಿಸಿ. ರಿಯಲ್-ಟೈಮ್ ಸಿಮ್ಯುಲೇಷನ್‌ಗಳು — ನಿಮ್ಮ ಬ್ರೌಸರ್‌ನಲ್ಲಿ.',
    chooseSubject: 'ನಿಮ್ಮ ವಿಷಯ ಆರಿಸಿ',
    allExperiments: 'ಎಲ್ಲ ಪ್ರಯೋಗಗಳು',
    physics: 'ಭೌತಶಾಸ್ತ್ರ',
    chemistry: 'ರಸಾಯನಶಾಸ್ತ್ರ',
    biology: 'ಜೀವಶಾಸ್ತ್ರ',
    physicsDesc: 'ಸರ್ಕ್ಯೂಟ್‌ಗಳು, ತೂಗಾಡುಗೋಲ, ದೃಗ್ವಿಜ್ಞಾನ, ಚಲನೆ & ಮತ್ತಷ್ಟು',
    chemistryDesc: 'pH, ಪ್ರತಿಕ್ರಿಯೆಗಳು, ಉರ್ಧ್ವಪಾತನ, ಆಮ್ಲಗಳು & ದ್ರಾವಣಗಳು',
    biologyDesc: 'ಕೋಶಗಳು, ರಂಧ್ರಗಳು, ಉಸಿರಾಟ, ಸಂತಾನೋತ್ಪತ್ತಿ',
    physicsCount: '11 ಪ್ರಯೋಗಗಳು',
    chemistryCount: '9 ಪ್ರಯೋಗಗಳು',
    biologyCount: '5 ಪ್ರಯೋಗಗಳು',
    statExperiments: 'ಪ್ರಯೋಗಗಳು',
    statSubjects: 'ವಿಷಯಗಳು',
    statInteractive: 'ಸಂವಾದಾತ್ಮಕ',
    statCurriculum: 'ಪಠ್ಯಕ್ರಮ',
    backToDashboard: '← ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಹಿಂತಿರುಗಿ',
    back: '← ಹಿಂತಿರುಗಿ',
    labRecord: '📋 ಲ್ಯಾಬ್ ದಾಖಲೆ',
    aim: '🎯 ಉದ್ದೇಶ',
    apparatus: '🔧 ಉಪಕರಣಗಳು',
    procedure: '📝 ಕಾರ್ಯವಿಧಾನ',
    precautions: '⚠️ ಮುನ್ನೆಚ್ಚರಿಕೆಗಳು',
    conclusion: '✅ ತೀರ್ಮಾನ',
    interactiveSimulation: 'ಸಂವಾದಾತ್ಮಕ ಸಿಮ್ಯುಲೇಷನ್',
    loadingSimulation: 'ಸಿಮ್ಯುಲೇಷನ್ ಲೋಡ್ ಆಗುತ್ತಿದೆ...',
    interactivePhysicsDesc: 'ರಿಯಲ್-ಟೈಮ್ ಸಿಮ್ಯುಲೇಷನ್‌ಗಳೊಂದಿಗೆ ಸಂವಾದಾತ್ಮಕ ಭೌತಶಾಸ್ತ್ರ ಪ್ರಯೋಗಗಳು',
    interactiveChemistryDesc: 'ರಾಸಾಯನಿಕ ಪ್ರತಿಕ್ರಿಯೆಗಳು, ಗುಣಧರ್ಮಗಳು ಮತ್ತು ವಿಶ್ಲೇಷಣೆ ಅನ್ವೇಷಿಸಿ',
    interactiveBiologyDesc: 'ವರ್ಚುವಲ್ ಸೂಕ್ಷ್ಮದರ್ಶಕದ ಮೂಲಕ ಜೀವಶಾಸ್ತ್ರ ಅಧ್ಯಯನ ಮಾಡಿ',
  },

  bn: {
    navTitle: 'ডিজিটাল ল্যাব',
    navSubtitle: 'বিজ্ঞান পরীক্ষা',
    heroBadge: '🔬 ভার্চুয়াল বিজ্ঞান ল্যাব',
    heroTitle1: 'পদার্থবিজ্ঞান ডিজিটাল',
    heroTitle2: 'পরীক্ষাগার',
    heroDesc: 'পদার্থবিজ্ঞান, রসায়ন & জীববিজ্ঞানে ইন্টারেক্টিভ পরীক্ষা অন্বেষণ করুন। রিয়েল-টাইম সিমুলেশন এবং বিস্তারিত পর্যবেক্ষণ — সব আপনার ব্রাউজারে।',
    chooseSubject: 'আপনার বিষয় বেছে নিন',
    allExperiments: 'সব পরীক্ষা',
    physics: 'পদার্থবিজ্ঞান',
    chemistry: 'রসায়ন',
    biology: 'জীববিজ্ঞান',
    physicsDesc: 'বর্তনী, দোলক, আলোকবিজ্ঞান, গতি & আরও',
    chemistryDesc: 'pH, বিক্রিয়া, ঊর্ধ্বপাতন, অম্ল & দ্রবণ',
    biologyDesc: 'কোষ, পত্ররন্ধ্র, শ্বসন, জনন',
    physicsCount: '১১ পরীক্ষা',
    chemistryCount: '৯ পরীক্ষা',
    biologyCount: '৫ পরীক্ষা',
    statExperiments: 'পরীক্ষা',
    statSubjects: 'বিষয়',
    statInteractive: 'ইন্টারেক্টিভ',
    statCurriculum: 'পাঠ্যক্রম',
    backToDashboard: '← ড্যাশবোর্ডে ফিরুন',
    back: '← ফিরুন',
    labRecord: '📋 ল্যাব রেকর্ড',
    aim: '🎯 উদ্দেশ্য',
    apparatus: '🔧 যন্ত্রপাতি',
    procedure: '📝 পদ্ধতি',
    precautions: '⚠️ সতর্কতা',
    conclusion: '✅ সিদ্ধান্ত',
    interactiveSimulation: 'ইন্টারেক্টিভ সিমুলেশন',
    loadingSimulation: 'সিমুলেশন লোড হচ্ছে...',
    interactivePhysicsDesc: 'রিয়েল-টাইম সিমুলেশন সহ ইন্টারেক্টিভ পদার্থবিজ্ঞান পরীক্ষা',
    interactiveChemistryDesc: 'রাসায়নিক বিক্রিয়া, বৈশিষ্ট্য এবং বিশ্লেষণ অন্বেষণ করুন',
    interactiveBiologyDesc: 'ভার্চুয়াল মাইক্রোস্কোপির মাধ্যমে জীববিজ্ঞান অধ্যয়ন করুন',
  },

  mr: {
    navTitle: 'डिजिटल लॅब',
    navSubtitle: 'विज्ञान प्रयोग',
    heroBadge: '🔬 आभासी विज्ञान प्रयोगशाळा',
    heroTitle1: 'भौतिकशास्त्र डिजिटल',
    heroTitle2: 'प्रयोगशाळा',
    heroDesc: 'भौतिकशास्त्र, रसायनशास्त्र & जीवशास्त्रात परस्परसंवादी प्रयोग एक्सप्लोर करा. रिअल-टाइम सिम्युलेशन आणि सविस्तर निरीक्षणे — सर्व तुमच्या ब्राउझरमध्ये.',
    chooseSubject: 'तुमचा विषय निवडा',
    allExperiments: 'सर्व प्रयोग',
    physics: 'भौतिकशास्त्र',
    chemistry: 'रसायनशास्त्र',
    biology: 'जीवशास्त्र',
    physicsDesc: 'सर्किट, लोलक, प्रकाशिकी, गती आणि बरेच काही',
    chemistryDesc: 'pH, अभिक्रिया, उर्ध्वपातन, आम्ल आणि द्रावणे',
    biologyDesc: 'पेशी, रंध्रे, श्वसन, पुनरुत्पादन',
    physicsCount: '११ प्रयोग',
    chemistryCount: '९ प्रयोग',
    biologyCount: '५ प्रयोग',
    statExperiments: 'प्रयोग',
    statSubjects: 'विषय',
    statInteractive: 'परस्परसंवादी',
    statCurriculum: 'अभ्यासक्रम',
    backToDashboard: '← डॅशबोर्डवर परत',
    back: '← परत',
    labRecord: '📋 प्रयोगशाळा नोंद',
    aim: '🎯 उद्देश',
    apparatus: '🔧 साहित्य',
    procedure: '📝 कार्यपद्धती',
    precautions: '⚠️ खबरदारी',
    conclusion: '✅ निष्कर्ष',
    interactiveSimulation: 'परस्परसंवादी सिम्युलेशन',
    loadingSimulation: 'सिम्युलेशन लोड होत आहे...',
    interactivePhysicsDesc: 'रिअल-टाइम सिम्युलेशनसह परस्परसंवादी भौतिकशास्त्र प्रयोग',
    interactiveChemistryDesc: 'रासायनिक अभिक्रिया, गुणधर्म आणि विश्लेषण एक्सप्लोर करा',
    interactiveBiologyDesc: 'आभासी सूक्ष्मदर्शीद्वारे जीवशास्त्र अभ्यासा',
  },
};

// ── Active language state ─────────────────────────────────────
let currentLang = localStorage.getItem('labLang') || 'en';

function t(key) {
  const lang = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  return lang[key] || TRANSLATIONS.en[key] || key;
}

function setLanguage(code) {
  currentLang = code;
  localStorage.setItem('labLang', code);
  applyTranslations();
  // Re-render any active view
  if (typeof currentView !== 'undefined') {
    if (currentView === 'dashboard') renderDashboard();
    else if (currentView === 'subject' && currentSubject) renderSubjectView(currentSubject);
    else if (currentView === 'experiment' && currentExperiment) {
      currentExperiment = findExperiment(currentExperiment.id);
      renderExperimentView(currentExperiment);
    }
  }
  // Update picker UI
  updateLangPickerUI();
}

function applyTranslations() {
  // Navbar
  const navTitleEl = document.getElementById('nav-title');
  const navSubEl = document.getElementById('nav-subtitle');
  if (navTitleEl) navTitleEl.textContent = t('navTitle');
  if (navSubEl) navSubEl.textContent = t('navSubtitle');
}

function updateLangPickerUI() {
  const current = LANGUAGES.find(l => l.code === currentLang) || LANGUAGES[0];
  const btn = document.getElementById('lang-btn');
  if (btn) btn.innerHTML = `${current.flag} <span>${current.native}</span> <span class="lang-caret">▾</span>`;

  // Highlight active in dropdown
  document.querySelectorAll('.lang-option').forEach(el => {
    el.classList.toggle('lang-active', el.dataset.code === currentLang);
  });
}

function renderDashboard() {
  // Hero
  const badge = document.getElementById('hero-badge');
  if (badge) badge.textContent = t('heroBadge');
  const ht1 = document.getElementById('hero-title1');
  if (ht1) ht1.textContent = t('heroTitle1');
  const ht2 = document.getElementById('hero-title2');
  if (ht2) ht2.textContent = t('heroTitle2');
  const hdesc = document.getElementById('hero-desc');
  if (hdesc) hdesc.textContent = t('heroDesc');

  // Section label
  const sl = document.getElementById('section-label-subjects');
  if (sl) sl.textContent = t('chooseSubject');

  // Subject cards
  ['physics', 'chemistry', 'biology'].forEach(subj => {
    const nameEl = document.getElementById(`${subj}-name`);
    const descEl = document.getElementById(`${subj}-desc`);
    const countEl = document.getElementById(`${subj}-count`);
    if (nameEl) nameEl.textContent = t(subj);
    if (descEl) descEl.textContent = t(`${subj}Desc`);
    if (countEl) {
      const count = window.EXPERIMENTS && window.EXPERIMENTS[subj] ? window.EXPERIMENTS[subj].length : 0;
      countEl.textContent = `${count} ${t('statExperiments')}`;
    }
  });

  // Stats
  const statLabels = document.querySelectorAll('.stat-label');
  const keys = ['statExperiments', 'statSubjects', 'statInteractive', 'statCurriculum'];
  statLabels.forEach((el, i) => { if (keys[i]) el.textContent = t(keys[i]); });
}

// ── Dropdown toggle ──────────────────────────────────────────
function toggleLangDropdown() {
  const btn = document.getElementById('lang-btn');
  const dropdown = document.getElementById('lang-dropdown');
  if (!btn || !dropdown) return;
  const isOpen = dropdown.classList.contains('open');
  btn.classList.toggle('open', !isOpen);
  dropdown.classList.toggle('open', !isOpen);
}

// Close dropdown on outside click
document.addEventListener('click', function(e) {
  const picker = document.getElementById('lang-picker');
  if (picker && !picker.contains(e.target)) {
    const btn = document.getElementById('lang-btn');
    const dd = document.getElementById('lang-dropdown');
    if (btn) btn.classList.remove('open');
    if (dd) dd.classList.remove('open');
  }
});

// ── Init picker UI ───────────────────────────────────────────
function initLangPicker() {
  const optionsEl = document.getElementById('lang-options');
  if (!optionsEl) return;

  optionsEl.innerHTML = LANGUAGES.map(lang => `
    <button class="lang-option ${lang.code === currentLang ? 'lang-active' : ''}"
            data-code="${lang.code}"
            onclick="setLanguage('${lang.code}');toggleLangDropdown();">
      <span class="lang-flag">${lang.flag}</span>
      <span class="lang-native">${lang.native}</span>
      <span class="lang-english">${lang.label}</span>
    </button>
  `).join('');

  updateLangPickerUI();
  applyTranslations();
}

