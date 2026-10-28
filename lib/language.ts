export const languages = [
  'English',
  'Arabic',
  'Bengali',
  'Chinese (Simplified)',
  'French',
  'German',
  'Indonesian',
  'Japanese',
  'Korean',
  'Portuguese',
  'Russian',
  'Spanish',
  'Turkish',
  'Vietnamese',
  'Assamese',
  'Bodo',
  'Dogri',
  'Gujarati',
  'Hindi',
  'Hinglish',
  'Kannada',
  'Kashmiri',
  'Konkani',
  'Maithili',
  'Malayalam',
  'Marathi',
  'Meitei (Manipuri)',
  'Nepali',
  'Odia',
  'Punjabi',
  'Sanskrit',
  'Santali',
  'Sindhi',
  'Tamil',
  'Telugu',
  'Urdu',
] as const
export type Language = (typeof languages)[number]

export const languageGroups = [
  { label: 'International', languages: ['English', 'Arabic', 'Bengali', 'Chinese (Simplified)', 'French', 'German', 'Indonesian', 'Japanese', 'Korean', 'Portuguese', 'Russian', 'Spanish', 'Turkish', 'Vietnamese'] },
  { label: 'Indian languages', languages: ['Assamese', 'Bodo', 'Dogri', 'Gujarati', 'Hindi', 'Hinglish', 'Kannada', 'Kashmiri', 'Konkani', 'Maithili', 'Malayalam', 'Marathi', 'Meitei (Manipuri)', 'Nepali', 'Odia', 'Punjabi', 'Sanskrit', 'Santali', 'Sindhi', 'Tamil', 'Telugu', 'Urdu'] },
] as const satisfies readonly { label: string; languages: readonly Language[] }[]

export function isLanguage(value: unknown): value is Language {
  return typeof value === 'string' && (languages as readonly string[]).includes(value)
}

export function languageInstruction(language: Language) {
  if (language === 'Hindi') return 'Write every patient-facing sentence in clear Hindi written in Devanagari. Keep medicine names, doses, dates, and source references exactly as documented.'
  if (language === 'Hinglish') return 'Write every patient-facing sentence in simple Hinglish (easy Hindi in Latin script). Keep medicine names, doses, dates, and source references exactly as documented.'
  if (language === 'English') return 'Write every patient-facing sentence in clear English. Keep medicine names, doses, dates, and source references exactly as documented.'
  return `Write every patient-facing sentence in clear ${language}, using its standard modern script. Keep medicine names, doses, dates, measurements, and source references exactly as documented; do not translate or invent clinical facts.`
}

export const uiCopy: Partial<Record<Language, Record<string, string>>> = {
  English: {
    overview: 'Overview', carePlan: 'My care plan', safety: 'Safety audit', ask: 'Ask your report', care: 'YOUR CARE', tools: 'TOOLS', export: 'EXPORT',
    calendar: 'Calendar reminders', checklist: 'Medication checklist', history: 'Medication history', upload: 'Upload a discharge report', choose: 'Choose report', demo: 'Use demo report',
    uploadHint: 'PDF text is extracted on our server. Only the extracted text is sent to the AI.', noReport: 'No report submitted', processing: 'Processing with AI…',
    ready: 'Your care plan is ready to review.', today: "Today's checklist", medicines: 'Medicines', upcoming: 'Upcoming', nextFollowUp: 'Next follow-up',
    carePlanTitle: 'Your care plan', summary: 'What happened & what matters now', medicationSchedule: 'Medication schedule', progress: "Today's progress", source: 'From your report',
    askTitle: 'Ask your report', chatHint: 'Ask a question in your own words. The assistant uses only your report text.', send: 'Send question',
  },
  Hindi: {
    overview: 'अवलोकन', carePlan: 'मेरी देखभाल योजना', safety: 'सुरक्षा जाँच', ask: 'अपनी रिपोर्ट पूछें', care: 'आपकी देखभाल', tools: 'उपकरण', export: 'डाउनलोड',
    calendar: 'कैलेंडर रिमाइंडर', checklist: 'दवा चेकलिस्ट', history: 'दवा इतिहास', upload: 'डिस्चार्ज रिपोर्ट अपलोड करें', choose: 'रिपोर्ट चुनें', demo: 'डेमो रिपोर्ट इस्तेमाल करें',
    uploadHint: 'PDF का टेक्स्ट हमारे सर्वर पर निकाला जाता है। AI को केवल निकाला गया टेक्स्ट भेजा जाता है।', noReport: 'कोई रिपोर्ट जमा नहीं की गई', processing: 'AI से प्रोसेस हो रहा है…',
    ready: 'आपकी देखभाल योजना समीक्षा के लिए तैयार है।', today: 'आज की चेकलिस्ट', medicines: 'दवाइयाँ', upcoming: 'आगामी', nextFollowUp: 'अगला फॉलो-अप',
    carePlanTitle: 'आपकी देखभाल योजना', summary: 'क्या हुआ और अब क्या महत्वपूर्ण है', medicationSchedule: 'दवा समय-सारणी', progress: 'आज की प्रगति', source: 'आपकी रिपोर्ट से',
    askTitle: 'अपनी रिपोर्ट पूछें', chatHint: 'अपना सवाल लिखें। सहायक केवल आपकी रिपोर्ट के टेक्स्ट का उपयोग करता है।', send: 'सवाल भेजें',
  },
  Hinglish: {
    overview: 'Overview', carePlan: 'Mera care plan', safety: 'Safety check', ask: 'Apni report poochhein', care: 'Aapki care', tools: 'Tools', export: 'Download',
    calendar: 'Calendar reminders', checklist: 'Dawai checklist', history: 'Dawai history', upload: 'Discharge report upload karein', choose: 'Report choose karein', demo: 'Demo report use karein',
    uploadHint: 'PDF ka text hamare server par nikala jata hai. AI ko sirf nikala gaya text bheja jata hai.', noReport: 'Koi report submit nahi hui', processing: 'AI se process ho raha hai…',
    ready: 'Aapka care plan review ke liye ready hai.', today: 'Aaj ki checklist', medicines: 'Dawaiyan', upcoming: 'Upcoming', nextFollowUp: 'Agla follow-up',
    carePlanTitle: 'Aapka care plan', summary: 'Kya hua aur ab kya zaroori hai', medicationSchedule: 'Dawai schedule', progress: 'Aaj ki progress', source: 'Aapki report se',
    askTitle: 'Apni report poochhein', chatHint: 'Apna sawal likhein. Assistant sirf report text use karta hai.', send: 'Sawal bhejein',
  },
}

export function getUiCopy(language: Language) {
  return uiCopy[language] ?? uiCopy.English!
}
