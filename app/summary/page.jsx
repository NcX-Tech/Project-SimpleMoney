"use client";

import React, { useState, useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Header } from "@/components/layout/Header";
import { Navigation } from "@/components/layout/Navigation";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useTransactionsStore } from "@/lib/store";
import { soundManager } from "@/lib/sounds";
import {
  ArrowUp,
  ArrowDown,
  TrendingUp,
  TrendingDown,
  Calendar,
} from "lucide-react";

/**
 * Cores para o gráfico de pizza por categoria
 * Cores distintas para melhor visualização
 */
const COLORS = [
  "#3B82F6", // Azul
  "#10B981", // Verde
  "#F59E0B", // Amarelo
  "#EF4444", // Vermelho
  "#8B5CF6", // Roxo
  "#EC4899", // Rosa
  "#06B6D4", // Ciano
  "#84CC16", // Lima
  "#F97316", // Laranja
  "#6366F1", // Índigo
];

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
 * Formata data para input (DD/MM/AAAA)
 */
const formatDateInput = (value) => {
  const numbers = value.replace(/\D/g, "");
  if (numbers === "") return "";
  const limited = numbers.slice(0, 8);
  if (limited.length <= 2) {
    return limited;
  } else if (limited.length <= 4) {
    return `${limited.slice(0, 2)}/${limited.slice(2)}`;
  } else {
    return `${limited.slice(0, 2)}/${limited.slice(2, 4)}/${limited.slice(4)}`;
  }
};

/**
 * Converte data formatada (DD/MM/AAAA) para ISO string
 */
const parseDateValue = (formattedDate) => {
  const numbers = formattedDate.replace(/\D/g, "");
  if (numbers.length !== 8) return null;
  const day = numbers.slice(0, 2);
  const month = numbers.slice(2, 4);
  const year = numbers.slice(4, 8);
  const date = new Date(`${year}-${month}-${day}`);
  if (isNaN(date.getTime())) return null;
  return date.toISOString();
};

/**
 * Página de Resumo e Balanço
 * Exibe estatísticas financeiras com gráficos e lista textual
 * Prioriza experiência desktop mas mantém responsividade mobile
 */
export default function SummaryPage() {
  const { getTransactionsByPeriod } = useTransactionsStore();

  // Estados do filtro de período
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  /**
   * Obtém transações filtradas por período
   */
  const filteredTransactions = useMemo(() => {
    const start = startDate ? parseDateValue(startDate) : null;
    const end = endDate ? parseDateValue(endDate) : null;
    return getTransactionsByPeriod(start, end);
  }, [startDate, endDate, getTransactionsByPeriod]);

  /**
   * Calcula estatísticas das transações filtradas
   */
  const statistics = useMemo(() => {
    const incomes = filteredTransactions.filter((t) => t.type === "income");
    const expenses = filteredTransactions.filter((t) => t.type === "expense");

    const totalIncome = incomes.reduce((sum, t) => sum + t.value, 0);
    const totalExpense = expenses.reduce((sum, t) => sum + t.value, 0);
    const balance = totalIncome - totalExpense;

    // Agrupa despesas por categoria para o gráfico de pizza
    const expensesByCategory = {};
    expenses.forEach((expense) => {
      if (!expensesByCategory[expense.category]) {
        expensesByCategory[expense.category] = 0;
      }
      expensesByCategory[expense.category] += expense.value;
    });

    const pieData = Object.entries(expensesByCategory).map(([name, value]) => ({
      name,
      value: parseFloat(value.toFixed(2)),
    }));

    // Dados para gráfico de barras (Receitas vs Despesas)
    const barData = [
      {
        name: "Receitas",
        valor: parseFloat(totalIncome.toFixed(2)),
      },
      {
        name: "Despesas",
        valor: parseFloat(totalExpense.toFixed(2)),
      },
    ];

    return {
      totalIncome,
      totalExpense,
      balance,
      pieData,
      barData,
      incomes,
      expenses,
    };
  }, [filteredTransactions]);

  /**
   * Limpa os filtros de data
   */
  const handleClearFilters = () => {
    soundManager.playClick();
    setStartDate("");
    setEndDate("");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Navegação lateral (desktop) */}
      <Navigation />

      {/* Conteúdo principal - Ajuste para navegação desktop */}
      <div className="flex-1 flex flex-col pb-20 md:pb-0 md:ml-20 lg:ml-20 md:transition-all md:duration-300">
        {/* Cabeçalho */}
        <Header title="Resumo e Balanço" />

        {/* Conteúdo da página - Layout otimizado para desktop */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 xl:p-10 max-w-7xl mx-auto w-full">
          {/* Filtros de Período */}
          <Card className="mb-6 md:mb-8 p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-end gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Data Inicial
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="text"
                    value={startDate}
                    onChange={(e) => {
                      const formatted = formatDateInput(e.target.value);
                      setStartDate(formatted);
                    }}
                    placeholder="DD/MM/AAAA"
                    maxLength={10}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Data Final
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="text"
                    value={endDate}
                    onChange={(e) => {
                      const formatted = formatDateInput(e.target.value);
                      setEndDate(formatted);
                    }}
                    placeholder="DD/MM/AAAA"
                    maxLength={10}
                    className="pl-10"
                  />
                </div>
              </div>
              <button
                onClick={handleClearFilters}
                className="px-4 md:px-6 py-2 md:py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
              >
                Limpar Filtros
              </button>
            </div>
          </Card>

          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
            {/* Total de Receitas */}
            <Card className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-1">
                    Total de Receitas
                  </p>
                  <p className="text-2xl md:text-3xl font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(statistics.totalIncome)}
                  </p>
                </div>
                <div className="p-3 md:p-4 bg-green-100 dark:bg-green-900/30 rounded-full">
                  <ArrowUp className="w-6 h-6 md:w-8 md:h-8 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </Card>

            {/* Total de Despesas */}
            <Card className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-1">
                    Total de Despesas
                  </p>
                  <p className="text-2xl md:text-3xl font-bold text-red-600 dark:text-red-400">
                    {formatCurrency(statistics.totalExpense)}
                  </p>
                </div>
                <div className="p-3 md:p-4 bg-red-100 dark:bg-red-900/30 rounded-full">
                  <ArrowDown className="w-6 h-6 md:w-8 md:h-8 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </Card>

            {/* Saldo */}
            <Card className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-1">
                    Saldo
                  </p>
                  <p
                    className={`text-2xl md:text-3xl font-bold ${
                      statistics.balance >= 0
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {formatCurrency(statistics.balance)}
                  </p>
                </div>
                <div
                  className={`p-3 md:p-4 rounded-full ${
                    statistics.balance >= 0
                      ? "bg-green-100 dark:bg-green-900/30"
                      : "bg-red-100 dark:bg-red-900/30"
                  }`}
                >
                  {statistics.balance >= 0 ? (
                    <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-green-600 dark:text-green-400" />
                  ) : (
                    <TrendingDown className="w-6 h-6 md:w-8 md:h-8 text-red-600 dark:text-red-400" />
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-6 md:mb-8">
            {/* Gráfico de Pizza - Despesas por Categoria */}
            <Card className="p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-4 md:mb-6">
                Despesas por Categoria
              </h2>
              {statistics.pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statistics.pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statistics.pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => formatCurrency(value)}
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-gray-500 dark:text-gray-400">
                  <p>Nenhuma despesa no período selecionado</p>
                </div>
              )}
            </Card>

            {/* Gráfico de Barras - Receitas vs Despesas */}
            <Card className="p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-4 md:mb-6">
                Receitas vs Despesas
              </h2>
              {statistics.barData.some((d) => d.valor > 0) ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={statistics.barData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => formatCurrency(value)}
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="valor"
                      radius={[8, 8, 0, 0]}
                    >
                      {statistics.barData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={index === 0 ? "#10B981" : "#EF4444"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-gray-500 dark:text-gray-400">
                  <p>Nenhuma transação no período selecionado</p>
                </div>
              )}
            </Card>
          </div>

          {/* Lista Textual de Receitas e Despesas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            {/* Lista de Receitas */}
            <Card className="p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-4 md:mb-6 flex items-center gap-2">
                <ArrowUp className="w-5 h-5 md:w-6 md:h-6 text-green-600 dark:text-green-400" />
                Receitas
              </h2>
              {statistics.incomes.length > 0 ? (
                <div className="space-y-3 md:space-y-4 max-h-[400px] overflow-y-auto">
                  {statistics.incomes.map((income) => (
                    <div
                      key={income.id}
                      className="flex items-center justify-between p-3 md:p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white truncate">
                          {income.name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {income.category} • {formatDate(income.date)}
                        </p>
                      </div>
                      <p className="text-lg md:text-xl font-bold text-green-600 dark:text-green-400 ml-4">
                        +{formatCurrency(income.value)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p>Nenhuma receita no período selecionado</p>
                </div>
              )}
            </Card>

            {/* Lista de Despesas */}
            <Card className="p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-4 md:mb-6 flex items-center gap-2">
                <ArrowDown className="w-5 h-5 md:w-6 md:h-6 text-red-600 dark:text-red-400" />
                Despesas
              </h2>
              {statistics.expenses.length > 0 ? (
                <div className="space-y-3 md:space-y-4 max-h-[400px] overflow-y-auto">
                  {statistics.expenses.map((expense) => (
                    <div
                      key={expense.id}
                      className="flex items-center justify-between p-3 md:p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white truncate">
                          {expense.name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {expense.category} • {formatDate(expense.date)}
                        </p>
                      </div>
                      <p className="text-lg md:text-xl font-bold text-red-600 dark:text-red-400 ml-4">
                        -{formatCurrency(expense.value)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p>Nenhuma despesa no período selecionado</p>
                </div>
              )}
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}

