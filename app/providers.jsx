'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { usePreferencesStore } from '@/lib/store'

/**
 * Providers wrapper para a aplicação
 * Configura o Tanstack Query para gerenciamento de estado do servidor
 */
export function Providers({ children }) {
  // Cria uma instância do QueryClient (mantém a mesma instância durante o ciclo de vida do componente)
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Configurações padrão para queries
            staleTime: 60 * 1000, // 1 minuto
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  // Inicializa o tema
  const { isDarkMode } = usePreferencesStore()
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (isDarkMode) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }, [isDarkMode])

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

