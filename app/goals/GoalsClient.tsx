'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Target,
  DollarSign,
  TrendingUp,
  Award,
  Zap,
  CheckCircle,
  Circle,
  Calendar,
  Plus,
  Edit2,
  Trash2,
  X,
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { format } from 'date-fns';
import { formatINR } from '@/lib/formatters';

interface Milestone {
  id: string;
  title: string;
  targetValue: number;
  completed: boolean;
  completedDate?: Date;
}

interface Goal {
  id: string;
  title: string;
  description?: string;
  type: 'profit' | 'win_rate' | 'discipline' | 'consistency' | 'custom' | 'risk' | 'behavioral';
  currentValue: number;
  targetValue: number;
  startDate: Date;
  deadline: Date | null;
  status: 'not_started' | 'in_progress' | 'completed' | 'failed';
  milestones: Milestone[];
  createdAt: Date;
}

interface GoalsClientProps {
  initialGoals: any[];
  trades: any[];
}

export function GoalsClient({ initialGoals, trades }: GoalsClientProps) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [newGoal, setNewGoal] = useState({
    goal_type: 'profit',
    title: '',
    target_value: 0,
    deadline: '',
    description: '',
  });

  const supabase = createClient();

  // Calculate current values based on trades
  const calculateCurrentValue = (goal: any): number => {
    const netPnL = trades.reduce((sum, t) => sum + parseFloat(String(t.pnl || '0')), 0);
    const wins = trades.filter(t => parseFloat(String(t.pnl || '0')) > 0).length;
    const winRate = trades.length > 0 ? (wins / trades.length) * 100 : 0;

    switch (goal.goal_type) {
      case 'profit':
        return netPnL;
      case 'win_rate':
        return winRate;
      case 'consistency':
        const tradingDays = new Set(
          trades.map(t => new Date(t.trade_date || t.created_at).toISOString().split('T')[0])
        ).size;
        const totalDays = trades.length > 0
          ? Math.ceil(
              (new Date().getTime() - new Date(trades[trades.length - 1]?.trade_date || trades[trades.length - 1]?.created_at || Date.now()).getTime()) /
                (1000 * 60 * 60 * 24)
            )
          : 0;
        return totalDays > 0 ? (tradingDays / totalDays) * 100 : 0;
      default:
        return goal.current_value || 0;
    }
  };

  // Generate milestones based on target value
  const generateMilestones = (targetValue: number, type: string): Milestone[] => {
    const milestones: Milestone[] = [];
    const percentages = [25, 50, 75, 100];
    
    percentages.forEach((percent, index) => {
      const milestoneValue = (targetValue * percent) / 100;
      milestones.push({
        id: `m${index + 1}`,
        title: `Reach ${type === 'profit' ? formatINR(milestoneValue) : `${milestoneValue.toFixed(0)}${type === 'win_rate' || type === 'consistency' ? '%' : ''}`}`,
        targetValue: milestoneValue,
        completed: false,
      });
    });
    
    return milestones;
  };

  // Convert database goals to UI format
  const transformGoals = useMemo(() => {
    return (dbGoals: any[]): Goal[] => {
      return dbGoals.map((dbGoal) => {
        const currentValue = calculateCurrentValue(dbGoal);
        const targetValue = parseFloat(String(dbGoal.target_value || 0));
        const isCompleted = dbGoal.completed || currentValue >= targetValue;
        const deadline = dbGoal.deadline ? new Date(dbGoal.deadline) : null;
        const now = new Date();
        
        // Determine status
        let status: Goal['status'] = 'in_progress';
        if (isCompleted) {
          status = 'completed';
        } else if (deadline && deadline < now && currentValue < targetValue) {
          status = 'failed';
        } else if (currentValue === 0 && targetValue > 0) {
          status = 'not_started';
        }

        // Generate milestones and check completion
        const milestones = generateMilestones(targetValue, dbGoal.goal_type);
        milestones.forEach((milestone) => {
          milestone.completed = currentValue >= milestone.targetValue;
          if (milestone.completed && currentValue >= milestone.targetValue) {
            milestone.completedDate = new Date();
          }
        });

        return {
          id: dbGoal.id,
          title: dbGoal.title,
          description: `Target: ${dbGoal.goal_type === 'profit' ? formatINR(targetValue) : `${targetValue}${dbGoal.goal_type === 'win_rate' || dbGoal.goal_type === 'consistency' ? '%' : ''}`}`,
          type: dbGoal.goal_type as Goal['type'],
          currentValue,
          targetValue,
          startDate: new Date(dbGoal.created_at),
          deadline,
          status,
          milestones,
          createdAt: new Date(dbGoal.created_at),
        };
      });
    };
  }, [trades]);

  useEffect(() => {
    if (initialGoals) {
      const transformed = transformGoals(initialGoals);
      setGoals(transformed);
      setLoading(false);
    }
  }, [initialGoals, transformGoals]);

  const getGoalIcon = (type: Goal['type']) => {
    switch (type) {
      case 'profit':
        return DollarSign;
      case 'win_rate':
        return TrendingUp;
      case 'discipline':
      case 'behavioral':
        return Award;
      case 'consistency':
        return Zap;
      default:
        return Target;
    }
  };

  const getStatusColor = (status: Goal['status']) => {
    switch (status) {
      case 'completed':
        return 'border-green-500/30 bg-green-500/10';
      case 'in_progress':
        return 'border-blue-500/30 bg-blue-500/10';
      case 'failed':
        return 'border-red-500/30 bg-red-500/10';
      default:
        return 'border-gray-700 bg-gray-800/50';
    }
  };

  const getProgressPercentage = (current: number, target: number) => {
    if (target === 0) return 0;
    return Math.min((current / target) * 100, 100);
  };

  const getDaysLeft = (deadline: Date | null) => {
    if (!deadline) return null;
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const getDeadlineColor = (daysLeft: number | null) => {
    if (daysLeft === null) return 'text-gray-400';
    if (daysLeft < 7) return 'text-red-400';
    if (daysLeft < 30) return 'text-yellow-400';
    return 'text-gray-400';
  };

  const handleAddGoal = async () => {
    if (!newGoal.title || !newGoal.target_value) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('goals')
      .insert({
        user_id: user.id,
        goal_type: newGoal.goal_type,
        title: newGoal.title,
        target_value: newGoal.target_value,
        deadline: newGoal.deadline || null,
        current_value: 0,
      })
      .select()
      .single();

    if (!error && data) {
      const transformed = transformGoals([...initialGoals, data]);
      setGoals(transformed);
      setShowAddModal(false);
      setNewGoal({ goal_type: 'profit', title: '', target_value: 0, deadline: '', description: '' });
    }
  };

  const handleDeleteGoal = async (id: string) => {
    await supabase.from('goals').delete().eq('id', id);
    const updated = goals.filter((g) => g.id !== id);
    setGoals(updated);
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setNewGoal({
      goal_type: goal.type,
      title: goal.title,
      target_value: goal.targetValue,
      deadline: goal.deadline ? format(goal.deadline, 'yyyy-MM-dd') : '',
      description: goal.description || '',
    });
    setShowAddModal(true);
  };

  const handleUpdateGoal = async () => {
    if (!editingGoal || !newGoal.title || !newGoal.target_value) return;

    const { error } = await supabase
      .from('goals')
      .update({
        title: newGoal.title,
        target_value: newGoal.target_value,
        deadline: newGoal.deadline || null,
      })
      .eq('id', editingGoal.id);

    if (!error) {
      const updated = goals.map((g) =>
        g.id === editingGoal.id
          ? {
              ...g,
              title: newGoal.title,
              targetValue: newGoal.target_value,
              deadline: newGoal.deadline ? new Date(newGoal.deadline) : null,
            }
          : g
      );
      setGoals(updated);
      setShowAddModal(false);
      setEditingGoal(null);
      setNewGoal({ goal_type: 'profit', title: '', target_value: 0, deadline: '', description: '' });
    }
  };

  const activeGoals = goals.filter((g) => g.status === 'in_progress' || g.status === 'not_started');
  const completedGoals = goals.filter((g) => g.status === 'completed');
  const totalMilestones = goals.reduce((sum, g) => sum + g.milestones.length, 0);
  const completedMilestones = goals.reduce(
    (sum, g) => sum + g.milestones.filter((m) => m.completed).length,
    0
  );
  const averageProgress =
    goals.length > 0
      ? goals.reduce((sum, g) => sum + getProgressPercentage(g.currentValue, g.targetValue), 0) /
        goals.length
      : 0;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-8 h-8 text-blue-400" />
            <h1 className="text-3xl font-bold text-white">Goals & Milestones</h1>
          </div>
          <p className="text-gray-400">
            Set and track your trading objectives with measurable milestones
          </p>
        </div>

        <button
          onClick={() => {
            setEditingGoal(null);
            setNewGoal({ goal_type: 'profit', title: '', target_value: 0, deadline: '', description: '' });
            setShowAddModal(true);
          }}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Goal
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
            <Target className="w-4 h-4" />
            <span>Active Goals</span>
          </div>
          <p className="text-3xl font-bold text-white">{activeGoals.length}</p>
        </div>

        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
            <CheckCircle className="w-4 h-4" />
            <span>Completed</span>
          </div>
          <p className="text-3xl font-bold text-green-400">{completedGoals.length}</p>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
            <Award className="w-4 h-4" />
            <span>Milestones Hit</span>
          </div>
          <p className="text-3xl font-bold text-blue-400">
            {completedMilestones}/{totalMilestones}
          </p>
        </div>

        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
            <TrendingUp className="w-4 h-4" />
            <span>Avg Progress</span>
          </div>
          <p className="text-3xl font-bold text-purple-400">{averageProgress.toFixed(0)}%</p>
        </div>
      </div>

      {/* Goals List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin mb-4" />
          <p className="text-gray-400">Loading goals...</p>
        </div>
      ) : goals.length === 0 ? (
        <div className="text-center py-16 bg-gray-900 border border-gray-800 rounded-lg">
          <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Goals Yet</h3>
          <p className="text-gray-400 mb-6">Create your first goal to start tracking progress</p>
          <button
            onClick={() => {
              setEditingGoal(null);
              setNewGoal({ goal_type: 'profit', title: '', target_value: 0, deadline: '', description: '' });
              setShowAddModal(true);
            }}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Your First Goal
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {goals.map((goal) => {
            const Icon = getGoalIcon(goal.type);
            const progress = getProgressPercentage(goal.currentValue, goal.targetValue);
            const daysLeft = getDaysLeft(goal.deadline);
            const deadlineColor = getDeadlineColor(daysLeft);

            return (
              <div
                key={goal.id}
                className={`border rounded-lg p-6 transition-all hover:scale-[1.01] ${getStatusColor(
                  goal.status
                )}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-3 bg-gray-900 rounded-lg">
                      <Icon className="w-6 h-6 text-blue-400" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-white">{goal.title}</h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            goal.status === 'completed'
                              ? 'bg-green-500/20 text-green-400'
                              : goal.status === 'in_progress'
                              ? 'bg-blue-500/20 text-blue-400'
                              : goal.status === 'failed'
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-gray-700 text-gray-400'
                          }`}
                        >
                          {goal.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mb-4">{goal.description}</p>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-400">Progress</span>
                          <span className="text-sm font-semibold text-white">
                            {progress.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-green-600 to-green-400 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Current vs Target */}
                      <div className="flex items-center gap-6 text-sm mb-4">
                        <div>
                          <span className="text-gray-500">Current: </span>
                          <span className="font-semibold text-white">
                            {goal.type === 'profit' ? '₹' : ''}
                            {goal.currentValue.toLocaleString('en-IN', {
                              maximumFractionDigits: goal.type === 'profit' ? 2 : 1,
                            })}
                            {goal.type === 'win_rate' || goal.type === 'consistency' ? '%' : ''}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Target: </span>
                          <span className="font-semibold text-white">
                            {goal.type === 'profit' ? '₹' : ''}
                            {goal.targetValue.toLocaleString('en-IN', {
                              maximumFractionDigits: goal.type === 'profit' ? 2 : 0,
                            })}
                            {goal.type === 'win_rate' || goal.type === 'consistency' ? '%' : ''}
                          </span>
                        </div>
                        {goal.deadline && (
                          <div className="flex items-center gap-2">
                            <Calendar className={`w-4 h-4 ${deadlineColor}`} />
                            <span className={`font-semibold ${deadlineColor}`}>
                              {daysLeft !== null && daysLeft > 0
                                ? `${daysLeft} days left`
                                : 'Deadline passed'}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Milestones */}
                      {goal.milestones.length > 0 && (
                        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
                          <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                            <Award className="w-4 h-4 text-blue-400" />
                            Milestones
                          </h4>
                          <div className="space-y-2">
                            {goal.milestones.map((milestone) => (
                              <div
                                key={milestone.id}
                                className="flex items-center gap-3 text-sm"
                              >
                                {milestone.completed ? (
                                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                                ) : (
                                  <Circle className="w-5 h-5 text-gray-600 flex-shrink-0" />
                                )}
                                <span
                                  className={
                                    milestone.completed ? 'text-green-400' : 'text-gray-400'
                                  }
                                >
                                  {milestone.title}
                                </span>
                                {milestone.completed && milestone.completedDate && (
                                  <span className="text-xs text-gray-600 ml-auto">
                                    {format(milestone.completedDate, 'MMM dd, yyyy')}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditGoal(goal)}
                      className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-5 h-5 text-gray-400" />
                    </button>
                    <button
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5 text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Goal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">
                {editingGoal ? 'Edit Goal' : 'Create New Goal'}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingGoal(null);
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Goal Type</label>
                <select
                  value={newGoal.goal_type}
                  onChange={(e) => setNewGoal({ ...newGoal, goal_type: e.target.value })}
                  disabled={!!editingGoal}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                >
                  <option value="profit">Profit Target (₹)</option>
                  <option value="win_rate">Win Rate (%)</option>
                  <option value="consistency">Consistency (%)</option>
                  <option value="discipline">Discipline</option>
                  <option value="behavioral">Behavioral</option>
                  <option value="risk">Risk Management</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  placeholder="e.g., Reach ₹1L profit this month"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Target Value</label>
                <input
                  type="number"
                  value={newGoal.target_value}
                  onChange={(e) =>
                    setNewGoal({ ...newGoal, target_value: parseFloat(e.target.value) || 0 })
                  }
                  placeholder="Enter target value"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Deadline (Optional)
                </label>
                <input
                  type="date"
                  value={newGoal.deadline}
                  onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={editingGoal ? handleUpdateGoal : handleAddGoal}
                  className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                >
                  {editingGoal ? 'Update Goal' : 'Create Goal'}
                </button>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingGoal(null);
                  }}
                  className="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

