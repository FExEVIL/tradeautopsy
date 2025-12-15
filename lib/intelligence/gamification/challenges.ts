import { Challenge, Metrics, Trade } from '../core/types';

export class ChallengeManager {
  async getActive(_userId: string): Promise<Challenge[]> {
    return [];
  }

  async updateProgress(
    _challenges: Challenge[],
    _trade: Trade,
    _metrics: Metrics,
  ): Promise<void> {
    // Placeholder: update in-memory challenge progress
  }
}
