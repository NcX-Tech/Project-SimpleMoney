'use client'

import React, { useEffect } from 'react'
import { useAuthStore, useDashboardStore, useGoalsStore, useTransactionsStore, useProfileStore } from '@/lib/store'
import { Header } from '@/components/layout/Header'
import { Navigation } from '@/components/layout/Navigation'
import { Card } from '@/components/ui/Card'
import { CircularProgress } from '@/components/ui/CircularProgress'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { SuccessModal } from '@/components/ui/SuccessModal'
import { ArrowRight, Plus, Wallet } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { soundManager } from '@/lib/sounds'

/**
 * Página Home/Dashboard
 * Exibe informações financeiras, metas, transações e desafios
 * Prioriza experiência desktop mas mantém responsividade mobile
 */
/**
 * Formata valor monetário para input (R$ 0,00)
 */
const formatCurrencyInput = (value) => {
  const numbers = value.replace(/\D/g, '')
  if (numbers === '') return ''
  const cents = parseInt(numbers, 10)
  const reais = (cents / 100).toFixed(2)
  return `R$ ${reais.replace('.', ',')}`
}

/**
 * Converte valor formatado (R$ 0,00) para número
 */
const parseCurrencyValue = (formattedValue) => {
  const numbers = formattedValue.replace(/\D/g, '')
  if (numbers === '') return 0
  return parseFloat((parseInt(numbers, 10) / 100).toFixed(2))
}

export default function HomePage() {
  const { user } = useAuthStore()
  const { balance, transactionsCount, dailyChallenge, updateBalance } = useDashboardStore()
  const { calculateOverallProgress } = useGoalsStore()
  const { calculateBalance, transactions, addTransaction } = useTransactionsStore()
  const { addPoints } = useProfileStore()
  
  // Estados do modal de adicionar saldo
  const [isAddBalanceModalOpen, setIsAddBalanceModalOpen] = useState(false)
  const [balanceAmount, setBalanceAmount] = useState('')
  const [isAddingBalance, setIsAddingBalance] = useState(false)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  
  // Calcula o progresso geral das metas
  const goalsProgress = calculateOverallProgress()
  
  // Sincroniza o saldo do dashboard com as transações
  // Calcula o saldo baseado nas transações e atualiza o dashboard
  // Nota: O saldo é atualizado automaticamente quando:
  // - Transações são adicionadas/removidas (através de addTransaction/removeTransaction)
  // - Receita é adicionada à meta (debita do saldo através de addIncomeToGoal)
  // Este useEffect serve apenas como backup para sincronização quando transações mudam
  // O saldo do store é a fonte única da verdade e será atualizado automaticamente
  useEffect(() => {
    // Recalcula o saldo apenas quando transações mudam
    // Não sobrescreve se o saldo foi atualizado manualmente (ex: ao adicionar à meta)
    const newBalance = calculateBalance()
    // Atualiza apenas se o novo saldo calculado for diferente E maior que o atual
    // Isso evita sobrescrever quando o saldo foi debitado manualmente
    if (Math.abs(newBalance - balance) > 0.01 && newBalance > balance) {
      updateBalance(newBalance)
    }
  }, [transactions.length, calculateBalance])

  /**
   * Adiciona saldo ao saldo atual
   */
  const handleAddBalance = async () => {
    const amount = parseCurrencyValue(balanceAmount)
    if (amount <= 0) {
      return
    }

    soundManager.playClick()
    setIsAddingBalance(true)

    try {
      // Simula delay de API
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Cria uma transação de receita para o saldo adicionado
      // Isso garante que o saldo seja calculado corretamente
      addTransaction({
        name: 'Saldo Adicionado',
        value: amount,
        type: 'income',
        category: 'Outros',
        date: new Date().toISOString(),
      })

      // O saldo será atualizado automaticamente pela função addTransaction
      // que chama calculateBalance() e updateBalance()

      // Adiciona pontos de recompensa (1 ponto para cada R$ 1,00)
      const pointsToAdd = Math.floor(amount)
      addPoints(pointsToAdd)

      setSuccessMessage(
        `Saldo de R$ ${amount.toFixed(2).replace('.', ',')} adicionado com sucesso! +${pointsToAdd} pontos!`
      )

      setIsAddBalanceModalOpen(false)
      setBalanceAmount('')
      setIsSuccessModalOpen(true)
      soundManager.playSuccess()
    } catch (error) {
      console.error('Erro ao adicionar saldo:', error)
    } finally {
      setIsAddingBalance(false)
    }
  }

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
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-white/90 text-sm md:text-base">Seu saldo</p>
                <p className="text-white text-3xl md:text-4xl font-bold">
                  R$ {balance.toFixed(2).replace('.', ',')}
                </p>
              </div>
              <button
                onClick={() => {
                  soundManager.playClick()
                  setIsAddBalanceModalOpen(true)
                }}
                className="p-3 md:p-4 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                aria-label="Adicionar saldo"
                title="Adicionar saldo"
              >
                <Plus className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </button>
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

      {/* Modal de Adicionar Saldo */}
      {isAddBalanceModalOpen && (
        <>
          {/* Overlay com blur */}
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 dark:bg-black/40"
            onClick={() => {
              soundManager.playClick()
              setIsAddBalanceModalOpen(false)
              setBalanceAmount('')
            }}
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-scale-in">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Adicionar Saldo
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Adicione dinheiro ao seu saldo atual. Você ganhará pontos de recompensa!
              </p>

              <div className="mb-6">
                <Input
                  label="Valor"
                  type="text"
                  value={balanceAmount}
                  onChange={(e) => {
                    const formatted = formatCurrencyInput(e.target.value)
                    setBalanceAmount(formatted)
                  }}
                  placeholder="R$ 0,00"
                  className="w-full"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    soundManager.playClick()
                    setIsAddBalanceModalOpen(false)
                    setBalanceAmount('')
                  }}
                  variant="secondary"
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleAddBalance}
                  variant="primary"
                  isLoading={isAddingBalance}
                  disabled={parseCurrencyValue(balanceAmount) <= 0}
                  className="flex-1"
                >
                  Adicionar
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal de Sucesso */}
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => {
          soundManager.playClick()
          setIsSuccessModalOpen(false)
        }}
        onAction={() => {
          soundManager.playClick()
          setIsSuccessModalOpen(false)
        }}
        title="Sucesso!"
        message={successMessage}
        actionText="OK"
      />
    </div>
  )
}

