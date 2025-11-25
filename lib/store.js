import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Store global de autenticação usando Zustand
 * Utiliza persist middleware para manter o estado no localStorage
 */
export const useAuthStore = create(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,

      /**
       * Função de login (simulada)
       * Em produção, aqui faria uma chamada à API
       */
      login: async (email, password) => {
        // Simulação de chamada à API
        await new Promise((resolve) => setTimeout(resolve, 1000))
        
        set({
          isAuthenticated: true,
          user: {
            email,
            name: 'João', // Nome padrão para o dashboard
          },
        })
      },

      /**
       * Função de registro (simulada)
       * Em produção, aqui faria uma chamada à API
       */
      register: async (userData) => {
        // Simulação de chamada à API
        await new Promise((resolve) => setTimeout(resolve, 1000))
        
        set({
          isAuthenticated: true,
          user: {
            email: userData.email,
            name: userData.name,
            age: userData.age,
            userType: userData.userType,
          },
        })
      },

      /**
       * Função de logout
       */
      logout: () => {
        set({
          isAuthenticated: false,
          user: null,
        })
      },

      /**
       * Função para atualizar dados do usuário
       */
      setUser: (user) => {
        set({ user })
      },
    }),
    {
      name: 'auth-storage', // Nome da chave no localStorage
    }
  )
)

/**
 * Store para dados do dashboard
 * Gerencia informações financeiras e do usuário
 */
export const useDashboardStore = create(
  persist(
    (set) => ({
      // Saldo atual
      balance: 245.80,
      
      // Progresso das metas
      goalsProgress: 60,
      
      // Número de transações
      transactionsCount: 3,
      
      // Desafio do dia
      dailyChallenge: {
        title: 'Poupador da Semana',
        description: 'Economize R$ 30 até o final da semana',
        progress: 45, // 45% do desafio
        target: 30,
        current: 13.50,
      },

      /**
       * Atualiza o saldo
       */
      updateBalance: (newBalance) => {
        set({ balance: newBalance })
      },

      /**
       * Atualiza o progresso das metas
       */
      updateGoalsProgress: (progress) => {
        set({ goalsProgress: progress })
      },

      /**
       * Atualiza o desafio do dia
       */
      updateDailyChallenge: (challenge) => {
        set({ dailyChallenge: challenge })
      },
    }),
    {
      name: 'dashboard-storage',
    }
  )
)

/**
 * Store para gerenciar metas financeiras
 */
export const useGoalsStore = create(
  persist(
    (set, get) => {
      // Metas iniciais de exemplo
      const initialGoals = [
        {
          id: '1',
          title: 'Headphone Gamer',
          targetValue: 300.00,
          currentValue: 180.00,
          category: 'Tecnologia',
          targetDate: new Date(Date.now() + 624 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          title: 'Apostila Concurso',
          targetValue: 150.00,
          currentValue: 75.00,
          category: 'Educação',
          targetDate: new Date(Date.now() + 640 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
        },
        {
          id: '3',
          title: 'Viagem de férias',
          targetValue: 500.00,
          currentValue: 50.00,
          category: 'Lazer',
          targetDate: new Date(Date.now() + 507 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
        },
      ]

      return {
        goals: initialGoals,

        /**
         * Adiciona uma nova meta
         */
        addGoal: (goal) => {
          const newGoal = {
            id: Date.now().toString(),
            ...goal,
            createdAt: new Date().toISOString(),
          }
          set((state) => ({
            goals: [...state.goals, newGoal],
          }))
          
          // Atualiza o progresso geral das metas no dashboard
          const { updateGoalsProgress } = useDashboardStore.getState()
          const progress = get().calculateOverallProgress()
          updateGoalsProgress(progress)
        },

        /**
         * Remove uma meta
         */
        removeGoal: (goalId) => {
          set((state) => ({
            goals: state.goals.filter((goal) => goal.id !== goalId),
          }))
          
          // Atualiza o progresso geral das metas no dashboard
          const { updateGoalsProgress } = useDashboardStore.getState()
          const progress = get().calculateOverallProgress()
          updateGoalsProgress(progress)
        },

        /**
         * Atualiza uma meta existente
         */
        updateGoal: (goalId, updates) => {
          set((state) => ({
            goals: state.goals.map((goal) =>
              goal.id === goalId ? { ...goal, ...updates } : goal
            ),
          }))
          
          // Atualiza o progresso geral das metas no dashboard
          const { updateGoalsProgress } = useDashboardStore.getState()
          const progress = get().calculateOverallProgress()
          updateGoalsProgress(progress)
        },

        /**
         * Calcula o progresso geral de todas as metas
         */
        calculateOverallProgress: () => {
          const goals = get().goals
          if (goals.length === 0) return 0
          
          const totalProgress = goals.reduce((sum, goal) => {
            const progress = (goal.currentValue / goal.targetValue) * 100
            return sum + progress
          }, 0)
          
          return Math.round(totalProgress / goals.length)
        },
      }
    },
    {
      name: 'goals-storage',
    }
  )
)

/**
 * Store para gerenciar preferências do usuário (modo noturno, sons)
 */
export const usePreferencesStore = create(
  persist(
    (set) => ({
      // Modo noturno
      isDarkMode: false,
      
      // Sons habilitados
      soundsEnabled: true,

      /**
       * Alterna o modo noturno
       */
      toggleDarkMode: () => {
        set((state) => {
          const newDarkMode = !state.isDarkMode
          // Aplica a classe no documento
          if (typeof window !== 'undefined') {
            if (newDarkMode) {
              document.documentElement.classList.add('dark')
            } else {
              document.documentElement.classList.remove('dark')
            }
          }
          return { isDarkMode: newDarkMode }
        })
      },

      /**
       * Define o modo noturno
       */
      setDarkMode: (enabled) => {
        set({ isDarkMode: enabled })
        if (typeof window !== 'undefined') {
          if (enabled) {
            document.documentElement.classList.add('dark')
          } else {
            document.documentElement.classList.remove('dark')
          }
        }
      },

      /**
       * Alterna os sons
       */
      toggleSounds: () => {
        set((state) => ({ soundsEnabled: !state.soundsEnabled }))
      },

      /**
       * Define se os sons estão habilitados
       */
      setSoundsEnabled: (enabled) => {
        set({ soundsEnabled: enabled })
      },
    }),
    {
      name: 'preferences-storage',
      // Inicializa o modo noturno no carregamento
      onRehydrateStorage: () => (state) => {
        if (state && typeof window !== 'undefined') {
          if (state.isDarkMode) {
            document.documentElement.classList.add('dark')
          } else {
            document.documentElement.classList.remove('dark')
          }
        }
      },
    }
  )
)
