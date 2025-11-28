import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

// Configuração da fonte Inter
const inter = Inter({ subsets: ['latin'] })

// Metadata da aplicação
export const metadata = {
  title: 'SimpleMoney',
  description: 'Aplicativo para gerenciamento financeiro pessoal',
}

/**
 * Layout raiz da aplicação
 * Envolve todas as páginas e fornece os providers necessários
 */
export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}

