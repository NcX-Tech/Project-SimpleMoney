"use client";

import React, { useState, useMemo } from "react";
import { Header } from "@/components/layout/Header";
import { Navigation } from "@/components/layout/Navigation";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { SuccessModal } from "@/components/ui/SuccessModal";
import { useDashboardStore, useProfileStore } from "@/lib/store";
import { soundManager } from "@/lib/sounds";
import {
  Trophy,
  Target,
  Plus,
  Star,
  Award,
  TrendingUp,
  Wallet,
  Sparkles,
  Gift,
  Zap,
} from "lucide-react";

/**
 * Formata valor monetário para exibição
 */
const formatCurrency = (value) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

/**
 * Formata valor monetário para input (R$ 0,00)
 */
const formatCurrencyInput = (value) => {
  const numbers = value.replace(/\D/g, "");
  if (numbers === "") return "";
  const cents = parseInt(numbers, 10);
  const reais = (cents / 100).toFixed(2);
  return `R$ ${reais.replace(".", ",")}`;
};

/**
 * Converte valor formatado (R$ 0,00) para número
 */
const parseCurrencyValue = (formattedValue) => {
  const numbers = formattedValue.replace(/\D/g, "");
  if (numbers === "") return 0;
  return parseFloat((parseInt(numbers, 10) / 100).toFixed(2));
};

/**
 * Página de Desafios
 * Sistema gamificado com desafios, conquistas e funcionalidade de adicionar saldo
 * Prioriza experiência desktop mas mantém responsividade mobile
 */
export default function ChallengesPage() {
  const { balance, updateBalance, dailyChallenge, updateDailyChallenge } =
    useDashboardStore();
  const { points, achievements, addPoints, addAchievement } =
    useProfileStore();

  // Estados do modal de adicionar saldo
  const [isAddBalanceModalOpen, setIsAddBalanceModalOpen] = useState(false);
  const [balanceAmount, setBalanceAmount] = useState("");
  const [isAddingBalance, setIsAddingBalance] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Desafios disponíveis
  const challenges = useMemo(
    () => [
      {
        id: "1",
        title: "Economista Semanal",
        description: "Economize R$ 50 esta semana",
        target: 50,
        current: dailyChallenge.current,
        reward: 100, // pontos
        icon: Wallet,
        color: "blue",
        completed: dailyChallenge.current >= 50,
      },
      {
        id: "2",
        title: "Poupador Mensal",
        description: "Economize R$ 200 este mês",
        target: 200,
        current: Math.min(dailyChallenge.current * 4, 200),
        reward: 500,
        icon: Target,
        color: "green",
        completed: dailyChallenge.current * 4 >= 200,
      },
      {
        id: "3",
        title: "Meta Master",
        description: "Complete 3 metas",
        target: 3,
        current: achievements.filter((a) => a.title.includes("Meta")).length,
        reward: 300,
        icon: Trophy,
        color: "purple",
        completed:
          achievements.filter((a) => a.title.includes("Meta")).length >= 3,
      },
      {
        id: "4",
        title: "Transações Pro",
        description: "Registre 10 transações",
        target: 10,
        current: 5, // Seria calculado dinamicamente
        reward: 150,
        icon: TrendingUp,
        color: "orange",
        completed: false,
      },
    ],
    [dailyChallenge, achievements]
  );

  /**
   * Calcula o progresso de um desafio em porcentagem
   */
  const calculateProgress = (current, target) => {
    return Math.min((current / target) * 100, 100);
  };

  /**
   * Abre o modal de adicionar saldo
   */
  const handleOpenAddBalance = () => {
    soundManager.playClick();
    setIsAddBalanceModalOpen(true);
    setBalanceAmount("");
  };

  /**
   * Fecha o modal de adicionar saldo
   */
  const handleCloseAddBalance = () => {
    soundManager.playClick();
    setIsAddBalanceModalOpen(false);
    setBalanceAmount("");
  };

  /**
   * Adiciona saldo ao saldo atual
   */
  const handleAddBalance = async () => {
    const amount = parseCurrencyValue(balanceAmount);
    if (amount <= 0) {
      return;
    }

    soundManager.playClick();
    setIsAddingBalance(true);

    try {
      // Simula delay de API
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Adiciona ao saldo atual
      const newBalance = balance + amount;
      updateBalance(newBalance);

      // Adiciona pontos de recompensa (1 ponto para cada R$ 1,00)
      const pointsToAdd = Math.floor(amount);
      addPoints(pointsToAdd);

      // Verifica se completou algum desafio
      const newChallengeProgress = dailyChallenge.current + amount;
      if (newChallengeProgress >= dailyChallenge.target) {
        // Desafio completado!
        addAchievement({
          title: "Desafio Semanal Completo",
          description: `Economizou R$ ${dailyChallenge.target.toFixed(2)}`,
          icon: "trophy",
        });
        addPoints(dailyChallenge.target * 2); // Bônus de pontos
        updateDailyChallenge({
          ...dailyChallenge,
          current: dailyChallenge.target,
          progress: 100,
        });
        setSuccessMessage(
          `Saldo adicionado! Desafio semanal completado! +${dailyChallenge.target * 2} pontos bônus!`
        );
      } else {
        updateDailyChallenge({
          ...dailyChallenge,
          current: newChallengeProgress,
          progress: (newChallengeProgress / dailyChallenge.target) * 100,
        });
        setSuccessMessage(
          `Saldo de ${formatCurrency(amount)} adicionado com sucesso! +${pointsToAdd} pontos!`
        );
      }

      handleCloseAddBalance();
      setIsSuccessModalOpen(true);
      soundManager.playSuccess();
    } catch (error) {
      console.error("Erro ao adicionar saldo:", error);
    } finally {
      setIsAddingBalance(false);
    }
  };

  /**
   * Obtém a cor do desafio
   */
  const getChallengeColor = (color) => {
    const colors = {
      blue: "bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800",
      green: "bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800",
      purple: "bg-purple-100 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800",
      orange: "bg-orange-100 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800",
    };
    return colors[color] || colors.blue;
  };

  /**
   * Obtém a cor do ícone do desafio
   */
  const getIconColor = (color) => {
    const colors = {
      blue: "text-blue-600 dark:text-blue-400",
      green: "text-green-600 dark:text-green-400",
      purple: "text-purple-600 dark:text-purple-400",
      orange: "text-orange-600 dark:text-orange-400",
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Navegação lateral (desktop) */}
      <Navigation />

      {/* Conteúdo principal - Ajuste para navegação desktop */}
      <div className="flex-1 flex flex-col pb-20 md:pb-0 md:ml-20 lg:ml-20 md:transition-all md:duration-300">
        {/* Cabeçalho */}
        <Header title="Desafios" />

        {/* Conteúdo da página - Layout otimizado para desktop */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 xl:p-10 max-w-7xl mx-auto w-full">
          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
            {/* Saldo Atual */}
            <Card className="p-4 md:p-6 bg-gradient-to-br from-primary-500 to-primary-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/90 text-sm md:text-base mb-1">
                    Saldo Atual
                  </p>
                  <p className="text-2xl md:text-3xl font-bold">
                    {formatCurrency(balance)}
                  </p>
                </div>
                <div className="p-3 md:p-4 bg-white/20 rounded-full">
                  <Wallet className="w-6 h-6 md:w-8 md:h-8" />
                </div>
              </div>
            </Card>

            {/* Pontos */}
            <Card className="p-4 md:p-6 bg-gradient-to-br from-yellow-400 to-yellow-500 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/90 text-sm md:text-base mb-1">
                    Seus Pontos
                  </p>
                  <p className="text-2xl md:text-3xl font-bold">{points}</p>
                </div>
                <div className="p-3 md:p-4 bg-white/20 rounded-full">
                  <Star className="w-6 h-6 md:w-8 md:h-8" />
                </div>
              </div>
            </Card>

            {/* Conquistas */}
            <Card className="p-4 md:p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/90 text-sm md:text-base mb-1">
                    Conquistas
                  </p>
                  <p className="text-2xl md:text-3xl font-bold">
                    {achievements.length}
                  </p>
                </div>
                <div className="p-3 md:p-4 bg-white/20 rounded-full">
                  <Award className="w-6 h-6 md:w-8 md:h-8" />
                </div>
              </div>
            </Card>
          </div>

          {/* Botão de Adicionar Saldo */}
          <div className="mb-6 md:mb-8">
            <Card className="p-4 md:p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Adicionar Saldo
                  </h2>
                  <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
                    Adicione dinheiro ao seu saldo atual e ganhe pontos de
                    recompensa!
                  </p>
                </div>
                <Button
                  onClick={handleOpenAddBalance}
                  variant="primary"
                  size="lg"
                  className="w-full md:w-auto"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Adicionar Saldo
                </Button>
              </div>
            </Card>
          </div>

          {/* Desafios Ativos */}
          <div className="mb-6 md:mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4 md:mb-6 flex items-center gap-2">
              <Trophy className="w-6 h-6 md:w-8 md:h-8 text-yellow-500" />
              Desafios Ativos
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {challenges.map((challenge) => {
                const IconComponent = challenge.icon;
                const progress = calculateProgress(challenge.current, challenge.target);

                return (
                  <Card
                    key={challenge.id}
                    className={`p-4 md:p-6 ${getChallengeColor(challenge.color)}`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-3 rounded-full bg-white dark:bg-gray-800 ${getIconColor(
                            challenge.color
                          )}`}
                        >
                          <IconComponent className="w-6 h-6 md:w-8 md:h-8" />
                        </div>
                        <div>
                          <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-white">
                            {challenge.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {challenge.description}
                          </p>
                        </div>
                      </div>
                      {challenge.completed && (
                        <div className="p-2 bg-yellow-400 rounded-full">
                          <Sparkles className="w-5 h-5 text-yellow-900" />
                        </div>
                      )}
                    </div>

                    {/* Barra de progresso */}
                    <div className="space-y-2">
                      <div className="w-full h-3 bg-white dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            challenge.completed
                              ? "bg-green-500"
                              : getIconColor(challenge.color).replace(
                                  "text-",
                                  "bg-"
                                )
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          {formatCurrency(challenge.current)} /{" "}
                          {formatCurrency(challenge.target)}
                        </span>
                        <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                          <Gift className="w-4 h-4" />
                          <span className="font-semibold">
                            +{challenge.reward} pts
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Conquistas Recentes */}
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4 md:mb-6 flex items-center gap-2">
              <Award className="w-6 h-6 md:w-8 md:h-8 text-purple-500" />
              Conquistas Desbloqueadas
            </h2>
            {achievements.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {achievements.map((achievement) => (
                  <Card
                    key={achievement.id}
                    className="p-4 md:p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-purple-500 rounded-full">
                        <Award className="w-6 h-6 md:w-8 md:h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-white mb-1">
                          {achievement.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {achievement.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <Zap className="w-12 h-12 md:w-16 md:h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  Complete desafios para desbloquear conquistas!
                </p>
              </Card>
            )}
          </div>
        </main>
      </div>

      {/* Modal de Adicionar Saldo */}
      {isAddBalanceModalOpen && (
        <>
          {/* Overlay com blur */}
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 dark:bg-black/40"
            onClick={handleCloseAddBalance}
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-scale-in">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Adicionar Saldo
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Adicione dinheiro ao seu saldo atual. Você ganhará pontos de
                recompensa!
              </p>

              <div className="mb-6">
                <Input
                  label="Valor"
                  type="text"
                  value={balanceAmount}
                  onChange={(e) => {
                    const formatted = formatCurrencyInput(e.target.value);
                    setBalanceAmount(formatted);
                  }}
                  placeholder="R$ 0,00"
                  className="w-full"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleCloseAddBalance}
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
          soundManager.playClick();
          setIsSuccessModalOpen(false);
        }}
        onAction={() => {
          soundManager.playClick();
          setIsSuccessModalOpen(false);
        }}
        title="Sucesso!"
        message={successMessage}
        actionText="OK"
      />
    </div>
  );
}
