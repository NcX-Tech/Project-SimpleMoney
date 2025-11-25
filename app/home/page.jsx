'use client'

import React, { useEffect } from 'react'
import { useAuthStore, useDashboardStore, useGoalsStore, useTransactionsStore } from '@/lib/store'
import { Header } from '@/components/layout/Header'
import { Navigation } from '@/components/layout/Navigation'
import { Card } from '@/components/ui/Card'
import { CircularProgress } from '@/components/ui/CircularProgress'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

/**
 * Página Home/Dashboard
 * Exibe informações financeiras, metas, transações e desafios
 * Prioriza experiência desktop mas mantém responsividade mobile
 */
export default function HomePage() {
  const { user } = useAuthStore()
  const { balance, transactionsCount, dailyChallenge, updateBalance } = useDashboardStore()
  const { calculateOverallProgress } = useGoalsStore()
  const { calculateBalance, transactions } = useTransactionsStore()
  
  // Calcula o progresso geral das metas
  const goalsProgress = calculateOverallProgress()
  
  // Sincroniza o saldo do dashboard com as transações
  // Calcula o saldo baseado nas transações e atualiza o dashboard
  useEffect(() => {
    const newBalance = calculateBalance()
    // Atualiza apenas se houver diferença significativa (evita loops infinitos)
    if (Math.abs(newBalance - balance) > 0.01) {
      updateBalance(newBalance)
    }
  }, [transactions.length, calculateBalance, balance, updateBalance])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navegação lateral (desktop) - menu sanfona */}
      <Navigation />

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col pb-20 md:pb-0 md:ml-20 md:transition-all md:duration-300 md:min-h-screen">
        {/* Cabeçalho */}
        <Header title="Home" />

        {/* Conteúdo do dashboard */}
        <main className="flex-1 p-4 md:p-6 space-y-4 md:space-y-6 max-w-6xl mx-auto w-full">
          {/* Saudação */}
          <div className="mb-4">
            <h2 className="text-lg md:text-xl text-gray-700 dark:text-gray-300">
              Olá, {user?.name || 'Usuário'}! Bem-vindo de volta
            </h2>
          </div>

          {/* Card de Saldo */}
          <Card variant="balance" className="mb-6 dark:bg-primary-600">
            <div className="space-y-2">
              <p className="text-white/90 text-sm md:text-base">Seu saldo</p>
              <p className="text-white text-3xl md:text-4xl font-bold">
                R$ {balance.toFixed(2).replace('.', ',')}
              </p>
            </div>
          </Card>

          {/* Cards de informações */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {/* Card de Metas */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Minhas Metas
                  </h3>
                  <CircularProgress progress={goalsProgress} size={80} />
                </div>
                <Link
                  href="/goals"
                  className="text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 font-medium text-sm flex items-center"
                >
                  Ver <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </Card>

            {/* Card de Transações */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Últimas Transações
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {transactions.length} transações
                  </p>
                </div>
                <Link
                  href="/transactions"
                  className="text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 font-medium text-sm flex items-center"
                >
                  Ver <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </Card>
          </div>

          {/* Card de Desafio do Dia */}
          <Card variant="challenge" className="dark:bg-gray-800 dark:border-gray-700 dark:border-l-orange-500">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  Desafio do Dia
                </h3>
                <h4 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  {dailyChallenge.title}
                </h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {dailyChallenge.description}
                </p>
              </div>

              {/* Barra de progresso horizontal */}
              <div className="space-y-2">
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500 rounded-full transition-all duration-300"
                    style={{ width: `${dailyChallenge.progress}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                  <span>R$ {dailyChallenge.current.toFixed(2).replace('.', ',')}</span>
                  <span>R$ {dailyChallenge.target.toFixed(2).replace('.', ',')}</span>
                </div>
              </div>
            </div>
          </Card>
        </main>
      </div>
    </div>
  )
}

