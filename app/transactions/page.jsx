'use client'

import React from 'react'
import { Header } from '@/components/layout/Header'
import { Navigation } from '@/components/layout/Navigation'

/**
 * Página de Transações
 */
export default function TransactionsPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />
      <div className="flex-1 flex flex-col pb-20 md:pb-0 md:ml-20 md:transition-all md:duration-300">
        <Header title="Transações" />
        <main className="flex-1 p-4 md:p-6">
          <p className="text-gray-600">Página de Transações em desenvolvimento...</p>
        </main>
      </div>
    </div>
  )
}

