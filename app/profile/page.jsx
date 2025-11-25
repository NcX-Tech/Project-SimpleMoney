'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { Header } from '@/components/layout/Header'
import { Navigation } from '@/components/layout/Navigation'
import { Button } from '@/components/ui/Button'

/**
 * Página de Perfil
 */
export default function ProfilePage() {
  const router = useRouter()
  const { user, logout } = useAuthStore()

  /**
   * Função para fazer logout
   */
  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />
      <div className="flex-1 flex flex-col pb-20 md:pb-0 md:ml-20 md:transition-all md:duration-300">
        <Header title="Perfil" />
        <main className="flex-1 p-4 md:p-6 max-w-2xl mx-auto w-full">
          <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Informações do Usuário</h2>
            {user && (
              <div className="space-y-2">
                <p className="text-gray-700">
                  <span className="font-semibold">Nome:</span> {user.name}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">Email:</span> {user.email}
                </p>
                {user.age && (
                  <p className="text-gray-700">
                    <span className="font-semibold">Idade:</span> {user.age}
                  </p>
                )}
                {user.userType && (
                  <p className="text-gray-700">
                    <span className="font-semibold">Tipo:</span> {user.userType}
                  </p>
                )}
              </div>
            )}
            <div className="pt-4">
              <Button
                variant="outline"
                onClick={handleLogout}
                className="w-full md:w-auto"
              >
                Sair
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

