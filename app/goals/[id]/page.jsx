"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Navigation } from "@/components/layout/Navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SuccessModal } from "@/components/ui/SuccessModal";
import { useGoalsStore } from "@/lib/store";
import { soundManager } from "@/lib/sounds";

/**
 * Página de Detalhes da Meta
 * Exibe informações detalhadas da meta e permite adicionar receita
 * Prioriza experiência desktop mas mantém responsividade mobile
 */
export default function GoalDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const goalId = params.id;
  
  const { getGoalById, addIncomeToGoal } = useGoalsStore();
  const [goal, setGoal] = useState(null);
  const [incomeAmount, setIncomeAmount] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // Carrega a meta ao montar o componente
  useEffect(() => {
    if (!goalId) return;
    
    const foundGoal = getGoalById(goalId);
    if (!foundGoal) {
      // Se a meta não for encontrada, redireciona para a página de metas
      router.push("/goals");
      return;
    }
    setGoal(foundGoal);
  }, [goalId]);

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
   * Formata valor monetário para exibição
   */
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  /**
   * Calcula o progresso da meta
   */
  const calculateProgress = (current, target) => {
    return Math.min((current / target) * 100, 100);
  };

  /**
   * Calcula dias restantes até a data alvo
   */
  const calculateDaysRemaining = (targetDate) => {
    const today = new Date();
    const target = new Date(targetDate);
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  /**
   * Valida o valor de receita
   */
  const validateIncome = () => {
    const newErrors = {};
    const amount = parseCurrencyValue(incomeAmount);

    if (!incomeAmount || amount <= 0) {
      newErrors.amount = "Valor deve ser maior que zero";
    } else if (goal) {
      const remaining = goal.targetValue - goal.currentValue;
      if (amount > remaining) {
        newErrors.amount = `Valor máximo: ${formatCurrency(remaining)}`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Adiciona receita à meta
   */
  const handleAddIncome = async (e) => {
    e.preventDefault();
    soundManager.playClick();

    if (!validateIncome()) {
      return;
    }

    setIsLoading(true);

    try {
      // Simula delay de API
      await new Promise((resolve) => setTimeout(resolve, 500));

      const amount = parseCurrencyValue(incomeAmount);
      const newValue = addIncomeToGoal(goalId, amount);

      // Atualiza a meta localmente
      setGoal((prev) => ({
        ...prev,
        currentValue: newValue,
      }));

      // Limpa o formulário
      setIncomeAmount("");
      setErrors({});

      // Abre modal de sucesso
      setIsSuccessModalOpen(true);
    } catch (error) {
      console.error("Erro ao adicionar receita:", error);
      setErrors({ amount: "Erro ao adicionar receita. Tente novamente." });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Volta para a página anterior
   */
  const handleBack = () => {
    soundManager.playClick();
    router.back();
  };

  // Se a meta ainda não foi carregada, mostra loading
  if (!goal) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
        <Navigation />
        <div className="flex-1 flex flex-col pb-20 md:pb-0 md:ml-20 md:transition-all md:duration-300">
          <div className="flex items-center justify-center flex-1">
            <p className="text-gray-500 dark:text-gray-400">Carregando...</p>
          </div>
        </div>
      </div>
    );
  }

  const progress = calculateProgress(goal.currentValue, goal.targetValue);
  const daysRemaining = calculateDaysRemaining(goal.targetDate);
  const remaining = goal.targetValue - goal.currentValue;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Navegação lateral (desktop) */}
      <Navigation />

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col pb-20 md:pb-0 md:ml-20 md:transition-all md:duration-300">
        {/* Cabeçalho com botão de voltar */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4 p-4 md:p-6">
            <button
              onClick={handleBack}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Voltar"
            >
              <ArrowLeft className="w-5 h-5 md:w-6 md:h-6 text-gray-600 dark:text-gray-400" />
            </button>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
              Detalhes da Meta
            </h1>
          </div>
        </div>

        {/* Conteúdo */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 xl:p-10 max-w-4xl mx-auto w-full space-y-6 md:space-y-8">
          {/* Card de Informações da Meta */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <div className="space-y-6">
              {/* Título e Categoria */}
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {goal.title}
                </h2>
                <span className="inline-block px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium">
                  {goal.category}
                </span>
              </div>

              {/* Valores e Progresso */}
              <div className="space-y-4">
                <div className="flex items-baseline justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Valor Atual
                    </p>
                    <p className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(goal.currentValue)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Meta
                    </p>
                    <p className="text-2xl md:text-3xl font-bold text-primary-500">
                      {formatCurrency(goal.targetValue)}
                    </p>
                  </div>
                </div>

                {/* Barra de progresso */}
                <div className="space-y-2">
                  <div className="w-full h-3 md:h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      {Math.round(progress)}% concluído
                    </span>
                    <span
                      className={`font-medium ${
                        daysRemaining < 0
                          ? "text-red-500"
                          : daysRemaining < 30
                          ? "text-orange-500"
                          : "text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      {daysRemaining < 0 ? "-" : ""}
                      {Math.abs(daysRemaining)} dias restantes
                    </span>
                  </div>
                </div>

                {/* Informações adicionais */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Falta para completar:
                    </span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatCurrency(remaining)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Card de Adicionar Receita */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Adicionar Receita
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Adicione um valor para aumentar o progresso desta meta
                </p>
              </div>

              <form onSubmit={handleAddIncome} className="space-y-4">
                <Input
                  label="Valor"
                  type="text"
                  value={incomeAmount}
                  onChange={(e) => {
                    const formatted = formatCurrencyInput(e.target.value);
                    setIncomeAmount(formatted);
                    // Limpa erro ao editar
                    if (errors.amount) {
                      setErrors((prev) => ({ ...prev, amount: null }));
                    }
                  }}
                  placeholder="R$ 0,00"
                  error={errors.amount}
                  className="w-full"
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isLoading}
                  className="w-full md:w-auto"
                  disabled={remaining <= 0}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Adicionar Receita
                </Button>

                {remaining <= 0 && (
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                    ✓ Meta concluída!
                  </p>
                )}
              </form>
            </div>
          </Card>
        </main>
      </div>

      {/* Modal de Sucesso */}
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => {
          soundManager.playClick();
          setIsSuccessModalOpen(false);
        }}
        title="Receita adicionada com sucesso!"
        message="O progresso da meta foi atualizado"
        actionText="OK"
      />
    </div>
  );
}

