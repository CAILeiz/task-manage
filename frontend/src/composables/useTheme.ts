import { ref, watch } from 'vue'

type Theme = 'light' | 'dark' | 'system'

const THEME_KEY = 'taskflow-theme'

export function useTheme() {
  const theme = ref<Theme>(getStoredTheme())

  function getStoredTheme(): Theme {
    const stored = localStorage.getItem(THEME_KEY) as Theme | null
    if (stored && ['light', 'dark', 'system'].includes(stored)) {
      return stored
    }
    return 'system'
  }

  function getSystemTheme(): 'light' | 'dark' {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  function applyTheme(newTheme: Theme) {
    const effectiveTheme = newTheme === 'system' ? getSystemTheme() : newTheme
    
    if (effectiveTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  function setTheme(newTheme: Theme) {
    theme.value = newTheme
    localStorage.setItem(THEME_KEY, newTheme)
    applyTheme(newTheme)
  }

  function toggleTheme() {
    const currentEffective = theme.value === 'system' ? getSystemTheme() : theme.value
    setTheme(currentEffective === 'dark' ? 'light' : 'dark')
  }

  function initTheme() {
    applyTheme(theme.value)
    
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (theme.value === 'system') {
        applyTheme('system')
      }
    })
  }

  watch(theme, (newTheme) => {
    applyTheme(newTheme)
  })

  return {
    theme,
    setTheme,
    toggleTheme,
    initTheme,
  }
}