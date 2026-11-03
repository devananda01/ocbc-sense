import { usePreferences } from '../context/PreferencesContext'
import { translations } from './translations'

export function useT() {
  const { prefs } = usePreferences()

  return (key, values = {}) => {
    // Support older saved preferences that used "zh" while the app now uses "zh-CN".
    const savedLanguage = prefs.language === 'zh' ? 'zh-CN' : prefs.language
    const language = translations[savedLanguage] ? savedLanguage : 'en'
    const value = translations[language][key] ?? translations.en[key] ?? key

    // Replace placeholders such as {n} with supplied values.
    return value.replace(/\{(\w+)\}/g, (_, name) => values[name] ?? '')
  }
}
