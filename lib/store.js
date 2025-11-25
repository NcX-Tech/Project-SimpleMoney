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
            name: email === 'joao.silva@email.com' ? 'João Silva' : 'João', // Nome padrão para o dashboard
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

        /**
         * Adiciona receita a uma meta específica
         * Debita do saldo atual e aumenta o currentValue da meta
         * @param {string} goalId - ID da meta
         * @param {number} amount - Valor a ser adicionado
         * @returns {Object} { success: boolean, newValue: number, message: string }
         */
        addIncomeToGoal: (goalId, amount) => {
          const goals = get().goals
          const goal = goals.find((g) => g.id === goalId)
          
          if (!goal) {
            return { success: false, message: 'Meta não encontrada' }
          }

          // Obtém o saldo atual do dashboard
          const { balance, updateBalance } = useDashboardStore.getState()
          
          // Verifica se há saldo suficiente
          if (balance < amount) {
            return { 
              success: false, 
              message: `Saldo insuficiente! Você tem ${balance.toFixed(2).replace('.', ',')} mas precisa de ${amount.toFixed(2).replace('.', ',')}` 
            }
          }
          
          // Calcula o novo valor (não pode ultrapassar o valor alvo)
          const remaining = goal.targetValue - goal.currentValue
          const amountToAdd = Math.min(amount, remaining)
          
          if (amountToAdd <= 0) {
            return { 
              success: false, 
              message: 'Esta meta já foi completada!' 
            }
          }
          
          // Debita do saldo atual
          const newBalance = balance - amountToAdd
          updateBalance(newBalance)
          
          // Atualiza a meta
          const newValue = goal.currentValue + amountToAdd
          get().updateGoal(goalId, { currentValue: newValue })
          
          // Atualiza o progresso geral das metas no dashboard
          const { updateGoalsProgress } = useDashboardStore.getState()
          const progress = get().calculateOverallProgress()
          updateGoalsProgress(progress)
          
          return { 
            success: true, 
            newValue, 
            amountAdded: amountToAdd,
            message: `R$ ${amountToAdd.toFixed(2).replace('.', ',')} adicionado à meta com sucesso!` 
          }
        },

        /**
         * Obtém uma meta por ID
         */
        getGoalById: (goalId) => {
          const goals = get().goals
          return goals.find((goal) => goal.id === goalId)
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

/**
 * Store para gerenciar transações financeiras
 * Gerencia entradas e saídas de dinheiro com categorias
 */
export const useTransactionsStore = create(
  persist(
    (set, get) => {
      // Transações iniciais de exemplo
      const initialTransactions = [
        {
          id: '1',
          name: 'Mesada',
          value: 100.00,
          type: 'income', // 'income' ou 'expense'
          category: 'Outros',
          date: new Date('2023-06-15').toISOString(),
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Lanchonete',
          value: 15.50,
          type: 'expense',
          category: 'Alimentação',
          date: new Date('2023-06-14').toISOString(),
          createdAt: new Date().toISOString(),
        },
        {
          id: '3',
          name: 'Cinema',
          value: 30.00,
          type: 'expense',
          category: 'Lazer',
          date: new Date('2023-06-12').toISOString(),
          createdAt: new Date().toISOString(),
        },
        {
          id: '4',
          name: 'Trabalho freelancer',
          value: 50.00,
          type: 'income',
          category: 'Trabalho',
          date: new Date('2023-06-10').toISOString(),
          createdAt: new Date().toISOString(),
        },
        {
          id: '5',
          name: 'Livro',
          value: 25.00,
          type: 'expense',
          category: 'Educação',
          date: new Date('2023-06-08').toISOString(),
          createdAt: new Date().toISOString(),
        },
      ]

      return {
        transactions: initialTransactions,

        /**
         * Adiciona uma nova transação
         */
        addTransaction: (transaction) => {
          const newTransaction = {
            id: Date.now().toString(),
            ...transaction,
            createdAt: new Date().toISOString(),
          }
          
          set((state) => ({
            transactions: [newTransaction, ...state.transactions],
          }))
          
          // Atualiza o saldo no dashboard
          const { updateBalance } = useDashboardStore.getState()
          const newBalance = get().calculateBalance()
          updateBalance(newBalance)
          
          // Atualiza a contagem de transações
          const { transactionsCount } = useDashboardStore.getState()
          useDashboardStore.setState({ 
            transactionsCount: get().transactions.length 
          })
        },

        /**
         * Remove uma transação
         */
        removeTransaction: (transactionId) => {
          set((state) => ({
            transactions: state.transactions.filter((t) => t.id !== transactionId),
          }))
          
          // Atualiza o saldo no dashboard
          const { updateBalance } = useDashboardStore.getState()
          const newBalance = get().calculateBalance()
          updateBalance(newBalance)
          
          // Atualiza a contagem de transações
          useDashboardStore.setState({ 
            transactionsCount: get().transactions.length 
          })
        },

        /**
         * Atualiza uma transação existente
         */
        updateTransaction: (transactionId, updates) => {
          set((state) => ({
            transactions: state.transactions.map((t) =>
              t.id === transactionId ? { ...t, ...updates } : t
            ),
          }))
          
          // Atualiza o saldo no dashboard
          const { updateBalance } = useDashboardStore.getState()
          const newBalance = get().calculateBalance()
          updateBalance(newBalance)
        },

        /**
         * Calcula o saldo total baseado nas transações
         * Soma todas as entradas e subtrai todas as saídas
         */
        calculateBalance: () => {
          const transactions = get().transactions
          return transactions.reduce((balance, transaction) => {
            if (transaction.type === 'income') {
              return balance + transaction.value
            } else {
              return balance - transaction.value
            }
          }, 0)
        },

        /**
         * Filtra transações por tipo e categoria
         */
        getFilteredTransactions: (typeFilter = 'all', categoryFilter = 'all') => {
          const transactions = get().transactions
          
          let filtered = transactions
          
          // Filtro por tipo
          if (typeFilter !== 'all') {
            filtered = filtered.filter((t) => t.type === typeFilter)
          }
          
          // Filtro por categoria
          if (categoryFilter !== 'all') {
            filtered = filtered.filter((t) => t.category === categoryFilter)
          }
          
          // Ordena por data (mais recente primeiro)
          return filtered.sort((a, b) => 
            new Date(b.date) - new Date(a.date)
          )
        },

        /**
         * Obtém todas as categorias únicas
         */
        getCategories: () => {
          const transactions = get().transactions
          const categories = new Set(transactions.map((t) => t.category))
          return Array.from(categories).sort()
        },

        /**
         * Filtra transações por período (data inicial e final)
         * @param {string} startDate - Data inicial no formato ISO string (opcional)
         * @param {string} endDate - Data final no formato ISO string (opcional)
         * @param {string} typeFilter - Filtro por tipo: 'all', 'income', 'expense' (opcional)
         * @param {string} categoryFilter - Filtro por categoria (opcional)
         * @returns {Array} Array de transações filtradas
         */
        getTransactionsByPeriod: (startDate = null, endDate = null, typeFilter = 'all', categoryFilter = 'all') => {
          const transactions = get().transactions
          
          let filtered = transactions
          
          // Filtro por período
          if (startDate || endDate) {
            filtered = filtered.filter((t) => {
              const transactionDate = new Date(t.date)
              const start = startDate ? new Date(startDate) : null
              const end = endDate ? new Date(endDate) : null
              
              // Ajusta para comparar apenas a data (sem hora)
              transactionDate.setHours(0, 0, 0, 0)
              if (start) start.setHours(0, 0, 0, 0)
              if (end) end.setHours(23, 59, 59, 999)
              
              const afterStart = !start || transactionDate >= start
              const beforeEnd = !end || transactionDate <= end
              
              return afterStart && beforeEnd
            })
          }
          
          // Filtro por tipo
          if (typeFilter !== 'all') {
            filtered = filtered.filter((t) => t.type === typeFilter)
          }
          
          // Filtro por categoria
          if (categoryFilter !== 'all') {
            filtered = filtered.filter((t) => t.category === categoryFilter)
          }
          
          // Ordena por data (mais recente primeiro)
          return filtered.sort((a, b) => 
            new Date(b.date) - new Date(a.date)
          )
        },
      }
    },
    {
      name: 'transactions-storage',
    }
  )
)

/**
 * Store para gerenciar pontos e conquistas do usuário
 * Sistema de gamificação para engajar o usuário
 */
export const useProfileStore = create(
  persist(
    (set, get) => {
      // Pontos iniciais do usuário
      const initialPoints = 580;
      
      // Conquistas iniciais do usuário
      const initialAchievements = [
        {
          id: '1',
          title: 'Primeira Meta',
          description: 'Conquistado em 20/03/2023',
          icon: 'target',
          date: '2023-03-20',
        },
        {
          id: '2',
          title: 'Economista Iniciante',
          description: 'Conquistado em 02/04/2023',
          icon: 'coin',
          date: '2023-04-02',
        },
        {
          id: '3',
          title: 'Desafio Completo',
          description: 'Conquistado em 15/05/2023',
          icon: 'trophy',
          date: '2023-05-15',
        },
      ];

      return {
        points: initialPoints,
        achievements: initialAchievements,

        /**
         * Adiciona pontos ao usuário
         */
        addPoints: (amount) => {
          set((state) => ({
            points: state.points + amount,
          }));
        },

        /**
         * Remove pontos do usuário
         */
        removePoints: (amount) => {
          set((state) => ({
            points: Math.max(0, state.points - amount),
          }));
        },

        /**
         * Adiciona uma nova conquista
         */
        addAchievement: (achievement) => {
          const newAchievement = {
            id: Date.now().toString(),
            ...achievement,
            date: new Date().toISOString().split('T')[0],
          };
          
          set((state) => ({
            achievements: [newAchievement, ...state.achievements],
          }));
        },

        /**
         * Obtém o número de notificações (badge)
         * Pode ser usado para mostrar notificações pendentes
         */
        getNotificationCount: () => {
          // Por enquanto retorna um valor fixo, mas pode ser calculado dinamicamente
          return 12;
        },
      };
    },
    {
      name: 'profile-storage',
    }
  )
)