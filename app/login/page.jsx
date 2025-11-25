'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/lib/store'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Checkbox } from '@/components/ui/Checkbox'

/**
 * Página de Login
 * Permite que o usuário faça login no sistema
 */
export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuthStore()
  
  // Estados do formulário
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [keepLoggedIn, setKeepLoggedIn] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  /**
   * Função para lidar com o submit do formulário
   */
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Validação básica
      if (!email || !password) {
        setError('Por favor, preencha todos os campos')
        setIsLoading(false)
        return
      }

      // Chama a função de login do store
      await login(email, password)
      
      // Redireciona para a página principal após login bem-sucedido
      router.push('/home')
    } catch (err) {
      setError('Erro ao fazer login. Verifique suas credenciais.')
      setIsLoading(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-lg">
        {/* Cabeçalho */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary-500 mb-2">SimpleMoney</h1>
          <p className="text-gray-600 text-sm">
            Bem-vindo! Faça login ou cadastre-se
          </p>
        </div>

        {/* Formulário de login */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Campo de email */}
          <Input
            label="Email"
            type="email"
            placeholder="seu@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* Campo de senha */}
          <Input
            label="Senha"
            type="password"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            showPasswordToggle
            required
          />

          {/* Opções: Manter login e Esqueci a senha */}
          <div className="flex items-center justify-between">
            <Checkbox
              label="Manter login"
              checked={keepLoggedIn}
              onChange={(e) => setKeepLoggedIn(e.target.checked)}
            />
            <Link
              href="/forgot-password"
              className="text-sm text-primary-500 hover:text-primary-600 font-medium"
            >
              Esqueci a senha
            </Link>
          </div>

          {/* Mensagem de erro */}
          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          {/* Botão de login */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            isLoading={isLoading}
          >
            Entrar
          </Button>
        </form>

        {/* Link para registro */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Não tem uma conta?{' '}
            <Link
              href="/register"
              className="text-primary-500 hover:text-primary-600 font-medium"
            >
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

