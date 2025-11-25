"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Phone, Shield, Target, Coins, Trophy, LogOut } from "lucide-react";
import { useAuthStore, useProfileStore } from "@/lib/store";
import { Header } from "@/components/layout/Header";
import { Navigation } from "@/components/layout/Navigation";
import { Card } from "@/components/ui/Card";
import { soundManager } from "@/lib/sounds";

/**
 * Obtém as iniciais do nome do usuário
 */
const getInitials = (name) => {
  if (!name) return "U";
  const parts = name.split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

/**
 * Mapeamento de ícones de conquistas
 */
const achievementIcons = {
  target: Target,
  coin: Coins,
  trophy: Trophy,
};

/**
 * Formata data para exibição (DD/MM/AAAA)
 */
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

/**
 * Página de Perfil
 * Exibe informações do usuário, pontos, conquistas e opções de contato
 * Prioriza experiência desktop mas mantém responsividade mobile
 */
export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { points, achievements, getNotificationCount } = useProfileStore();
  const notificationCount = getNotificationCount();

  /**
   * Função para fazer logout
   */
  const handleLogout = () => {
    soundManager.playClick();
    logout();
    router.push("/login");
  };

  /**
   * Navega para a página de contato
   */
  const handleContactUs = () => {
    soundManager.playClick();
    router.push("/profile/contact");
  };

  /**
   * Navega para a página de termos
   */
  const handleTerms = () => {
    soundManager.playClick();
    router.push("/profile/terms");
  };

  // Obtém o nome completo ou padrão
  const userName = user?.name || "Usuário";
  const userEmail = user?.email || "usuario@email.com";
  const initials = getInitials(userName);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Navegação lateral (desktop) */}
      <Navigation />

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col pb-20 md:pb-0 md:ml-20 md:transition-all md:duration-300">
        {/* Cabeçalho com botão de sair */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between p-4 md:p-6">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
              Meu Perfil
            </h1>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors font-medium"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden md:inline">Sair</span>
            </button>
          </div>
        </div>

        {/* Conteúdo */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 xl:p-10 max-w-4xl mx-auto w-full space-y-6 md:space-y-8">
          {/* Card de Informações do Usuário */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Avatar com badge */}
              <div className="relative">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-primary-500 flex items-center justify-center text-white text-2xl md:text-3xl font-bold">
                  {initials}
                </div>
                {/* Badge de notificações */}
                {notificationCount > 0 && (
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 md:w-10 md:h-10 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs md:text-sm font-bold border-4 border-white dark:border-gray-800">
                    {notificationCount}
                  </div>
                )}
              </div>

              {/* Informações do usuário */}
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {userName}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{userEmail}</p>

                {/* Botão de pontos */}
                <div className="inline-flex items-center px-4 py-2 bg-primary-100 dark:bg-primary-900/30 rounded-full">
                  <span className="text-primary-700 dark:text-primary-300 font-semibold">
                    {points} pontos
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Links de Ação */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Fale Conosco */}
            <button
              onClick={handleContactUs}
              className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
            >
              <div className="p-3 rounded-lg bg-primary-100 dark:bg-primary-900/30">
                <Phone className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  FALE CONOSCO
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Entre em contato conosco
                </p>
              </div>
            </button>

            {/* Termos e Privacidade */}
            <button
              onClick={handleTerms}
              className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
            >
              <div className="p-3 rounded-lg bg-primary-100 dark:bg-primary-900/30">
                <Shield className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  TERMOS & PRIVACIDADE
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Leia nossos termos
                </p>
              </div>
            </button>
          </div>

          {/* Lista de Conquistas */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Conquistas
            </h3>

            {achievements.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">
                  Nenhuma conquista ainda
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {achievements.map((achievement) => {
                  const IconComponent =
                    achievementIcons[achievement.icon] || Trophy;
                  const iconColor =
                    achievement.icon === "target"
                      ? "text-red-500"
                      : achievement.icon === "coin"
                      ? "text-yellow-500"
                      : "text-yellow-600";

                  return (
                    <div
                      key={achievement.id}
                      className="flex items-center gap-4 p-4 bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600"
                    >
                      <div
                        className={`p-3 rounded-lg bg-gray-100 dark:bg-gray-600 ${iconColor}`}
                      >
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {achievement.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {achievement.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </main>
      </div>
    </div>
  );
}
