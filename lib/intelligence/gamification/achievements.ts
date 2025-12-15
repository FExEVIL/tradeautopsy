import { Achievement, Metrics, Trade } from '../core/types';

export class AchievementSystem {
  async getAll(_userId: string): Promise<Achievement[]> {
    return [];
  }

  async checkProgress(
    achievements: Achievement[],
    metrics: Metrics,
    trade: Trade,
  ): Promise<Achievement[]> {
    const unlocked: Achievement[] = [];
    // Placeholder: in future, evaluate metrics and trade to unlock achievements
    return unlocked;
  }
}
