import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

export const translations = {
  en: {
    appName: '🧠 FinSage',
    appSubtitle: 'Financial Literacy Platform',
    home: 'Home', chat: 'Chat', profile: 'Profile', logout: 'Logout', login: 'Login',
    learningPath: '📚 Learning Path', dashboard: 'Dashboard', financialBasics: 'Financial Basics',
    personalFinance: 'Personal Finance', investments: 'Investments', forStudents: 'For Students',
    forProfessionals: 'For Professionals', forHomemakers: 'For Homemakers', forSeniors: 'For Seniors',
    behavioralFinance: 'Behavioral Finance', myProfile: 'My Profile', proTip: '💡 Pro Tip',
    proTipText: "Start with Financial Basics if you're new to finance!",
    allRightsReserved: 'All rights reserved.', contactUs: 'Contact us:',
    footerTagline: 'Empowering financial literacy through innovative learning solutions',
    welcomeTitle: '🧠 Welcome to FinSage',
    welcomeSubtitle: 'Your Journey to Financial Literacy Starts Here',
    welcomeDesc: 'Master personal finance, investing, and money management with our comprehensive learning platform and AI-powered financial assistant.',
    startLearning: 'Start Learning', askAI: 'Ask AI Assistant',
    explorePaths: '🚀 Explore Learning Paths',
    exploreDesc: 'Choose your learning journey and master financial literacy at your own pace',
    explore: 'Explore', learningModules: 'Learning Modules', expertTopics: 'Expert Topics',
    activeLearners: 'Active Learners', successRate: 'Success Rate',
    quickTips: '✨ Quick Financial Tips',
    quickTipsDesc: 'Daily wisdom to boost your financial knowledge',
    saveFristTitle: '💰 Save First',
    saveFirstDesc: 'Pay yourself before paying bills. Build habit of saving at least 20% of your income first.',
    trackExpTitle: '📊 Track Expenses',
    trackExpDesc: 'Know where your money goes. Use apps or spreadsheets to monitor every expense.',
    setGoalsTitle: '🎯 Set Goals',
    setGoalsDesc: 'Clear financial goals drive success. Set SMART goals and track progress regularly.',
    beginner: 'Beginner', popular: 'Popular', advanced: 'Advanced', aiPowered: 'AI-Powered',
    financialBasicsDesc: 'Learn fundamental concepts about money, banking, and finance',
    personalFinanceDesc: 'Master budgeting, saving, and managing your money wisely',
    investmentsDesc: 'Understand stocks, mutual funds, and growing your wealth',
    aiAssistant: 'AI Assistant',
    aiAssistantDesc: 'Get personalized answers to your financial questions',
    loadingContent: 'Loading financial literacy content...', expertContent: 'Expert Content',
    interactiveLearning: 'Interactive Learning', stepByStep: 'Step-by-Step Progress',
    practicalSkills: 'Practical Skills', retryLoading: 'Retry Loading',
    yourLearningJourney: '📊 Your Learning Journey', focusArea: 'Focus Area',
    learningLevels: 'Learning Levels', totalModules: 'Total Modules', hoursOfContent: 'Hours of Content',
    chatWelcome: "👋 Welcome to your Personal Financial Advisor!\n\nI'm here to help you navigate your financial journey with confidence. Ask me about:\n\n💰 Budgeting & Saving Strategies\n📈 Investment Opportunities & Portfolio Management\n🏦 Banking & Credit Management\n🎓 Financial Planning for Different Life Stages\n🧠 Behavioral Finance & Money Psychology\n\nWhat financial topic would you like to explore today?",
    conversationHistory: 'Conversation History', newChat: 'New Chat', pleaseLogIn: 'Please Log In',
    loginToAccess: 'You need to be logged in to access your personal chat history.',
    aiFinancialAdvisor: '💰 AI Financial Advisor',
    aiAdvisorSubtitle: 'Your intelligent companion for smart financial decisions',
    online: 'Online', thinking: 'Thinking...',
    chatPlaceholder: '💬 Ask me anything about budgeting, investing, saving, or financial planning...',
    send: 'Send', loginToSend: 'Please log in to send messages',
    switchToHindi: 'हिंदी में बदलें', switchToEnglish: 'Switch to English',
  },
  hi: {
    appName: '🧠 फिनसेज',
    appSubtitle: 'वित्तीय साक्षरता प्लेटफॉर्म',
    home: 'होम', chat: 'चैट', profile: 'प्रोफाइल', logout: 'लॉगआउट', login: 'लॉगिन',
    learningPath: '📚 सीखने का रास्ता', dashboard: 'डैशबोर्ड', financialBasics: 'वित्तीय मूल बातें',
    personalFinance: 'व्यक्तिगत वित्त', investments: 'निवेश', forStudents: 'छात्रों के लिए',
    forProfessionals: 'पेशेवरों के लिए', forHomemakers: 'गृहिणियों के लिए',
    forSeniors: 'वरिष्ठ नागरिकों के लिए', behavioralFinance: 'व्यवहारिक वित्त',
    myProfile: 'मेरी प्रोफाइल', proTip: '💡 प्रो टिप',
    proTipText: 'अगर आप वित्त में नए हैं तो वित्तीय मूल बातों से शुरू करें!',
    allRightsReserved: 'सर्वाधिकार सुरक्षित।', contactUs: 'हमसे संपर्क करें:',
    footerTagline: 'नवीन शिक्षण समाधानों के माध्यम से वित्तीय साक्षरता को सशक्त बनाना',
    welcomeTitle: '🧠 फिनसेज में आपका स्वागत है',
    welcomeSubtitle: 'वित्तीय साक्षरता की आपकी यात्रा यहाँ से शुरू होती है',
    welcomeDesc: 'हमारे व्यापक शिक्षण प्लेटफॉर्म और AI-संचालित वित्तीय सहायक के साथ व्यक्तिगत वित्त, निवेश और धन प्रबंधन में महारत हासिल करें।',
    startLearning: 'सीखना शुरू करें', askAI: 'AI सहायक से पूछें',
    explorePaths: '🚀 सीखने के रास्ते खोजें',
    exploreDesc: 'अपनी सीखने की यात्रा चुनें और अपनी गति से वित्तीय साक्षरता में महारत हासिल करें',
    explore: 'देखें', learningModules: 'शिक्षण मॉड्यूल', expertTopics: 'विशेषज्ञ विषय',
    activeLearners: 'सक्रिय शिक्षार्थी', successRate: 'सफलता दर',
    quickTips: '✨ त्वरित वित्तीय सुझाव',
    quickTipsDesc: 'आपके वित्तीय ज्ञान को बढ़ाने के लिए दैनिक ज्ञान',
    saveFristTitle: '💰 पहले बचत करें',
    saveFirstDesc: 'बिल चुकाने से पहले खुद को भुगतान करें। पहले अपनी आय का कम से कम 20% बचाने की आदत बनाएं।',
    trackExpTitle: '📊 खर्च ट्रैक करें',
    trackExpDesc: 'जानें कि आपका पैसा कहाँ जाता है। हर खर्च पर नज़र रखने के लिए ऐप्स या स्प्रेडशीट का उपयोग करें।',
    setGoalsTitle: '🎯 लक्ष्य निर्धारित करें',
    setGoalsDesc: 'स्पष्ट वित्तीय लक्ष्य सफलता दिलाते हैं। SMART लक्ष्य बनाएं और नियमित रूप से प्रगति ट्रैक करें।',
    beginner: 'शुरुआती', popular: 'लोकप्रिय', advanced: 'उन्नत', aiPowered: 'AI-संचालित',
    financialBasicsDesc: 'पैसे, बैंकिंग और वित्त के बारे में मूलभूत अवधारणाएँ सीखें',
    personalFinanceDesc: 'बजट बनाना, बचत करना और अपने पैसे का बुद्धिमानी से प्रबंधन करना सीखें',
    investmentsDesc: 'शेयर, म्यूचुअल फंड और अपनी संपत्ति बढ़ाने को समझें',
    aiAssistant: 'AI सहायक',
    aiAssistantDesc: 'अपने वित्तीय प्रश्नों के व्यक्तिगत उत्तर प्राप्त करें',
    loadingContent: 'वित्तीय साक्षरता सामग्री लोड हो रही है...', expertContent: 'विशेषज्ञ सामग्री',
    interactiveLearning: 'इंटरैक्टिव लर्निंग', stepByStep: 'चरण-दर-चरण प्रगति',
    practicalSkills: 'व्यावहारिक कौशल', retryLoading: 'फिर से लोड करें',
    yourLearningJourney: '📊 आपकी सीखने की यात्रा', focusArea: 'फोकस क्षेत्र',
    learningLevels: 'सीखने के स्तर', totalModules: 'कुल मॉड्यूल', hoursOfContent: 'सामग्री के घंटे',
    chatWelcome: "👋 आपके व्यक्तिगत वित्तीय सलाहकार में आपका स्वागत है!\n\nमैं आपकी वित्तीय यात्रा में आत्मविश्वास के साथ मदद करने के लिए यहाँ हूँ। मुझसे पूछें:\n\n💰 बजट और बचत की रणनीतियाँ\n📈 निवेश के अवसर और पोर्टफोलियो प्रबंधन\n🏦 बैंकिंग और क्रेडिट प्रबंधन\n🎓 जीवन के विभिन्न चरणों के लिए वित्तीय योजना\n🧠 व्यवहारिक वित्त और पैसे का मनोविज्ञान\n\nआज आप कौन सा वित्तीय विषय जानना चाहते हैं?",
    conversationHistory: 'बातचीत का इतिहास', newChat: 'नई चैट', pleaseLogIn: 'कृपया लॉगिन करें',
    loginToAccess: 'अपने व्यक्तिगत चैट इतिहास तक पहुँचने के लिए आपको लॉगिन करना होगा।',
    aiFinancialAdvisor: '💰 AI वित्तीय सलाहकार',
    aiAdvisorSubtitle: 'स्मार्ट वित्तीय निर्णयों के लिए आपका बुद्धिमान साथी',
    online: 'ऑनलाइन', thinking: 'सोच रहा हूँ...',
    chatPlaceholder: '💬 बजट, निवेश, बचत या वित्तीय योजना के बारे में कुछ भी पूछें...',
    send: 'भेजें', loginToSend: 'संदेश भेजने के लिए कृपया लॉगिन करें',
    switchToHindi: 'हिंदी में बदलें', switchToEnglish: 'English में बदलें',
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');
  const toggleLanguage = () => setLanguage(prev => prev === 'en' ? 'hi' : 'en');
  const t = (key) => translations[language][key] || translations['en'][key] || key;
  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t, isHindi: language === 'hi' }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
