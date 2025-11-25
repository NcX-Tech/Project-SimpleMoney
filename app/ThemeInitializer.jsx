'use client'

import { useEffect } from 'react'
import { usePreferencesStore } from '@/lib/store'

/**
 * Componente para inicializar o tema (modo noturno)
 * Garante que o tema seja aplicado antes da renderização
 */
export function ThemeInitializer({ children }) {
  const { isDarkMode } = usePreferencesStore()

  useEffect(() => {
    // Aplica o tema inicial
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  return <>{children}</>
}
