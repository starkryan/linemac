// Service for checking user balance

export interface BalanceInfo {
  balance: number;
  currency: string;
  lastUpdated: string;
}

export const BalanceService = {
  /**
   * Get current user balance from API
   */
  async getUserBalance(): Promise<BalanceInfo> {
    try {
      const response = await fetch('/api/user/balance', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        balance: data.balance || 0,
        currency: data.currency || 'INR',
        lastUpdated: data.lastUpdated || new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error fetching balance:', error);
      // Return default balance on error
      return {
        balance: 0,
        currency: 'INR',
        lastUpdated: new Date().toISOString(),
      };
    }
  },

  /**
   * Check if user has sufficient balance for submission
   */
  async hasSufficientBalance(requiredAmount: number = 100): Promise<{
    hasSufficient: boolean;
    currentBalance: number;
    requiredAmount: number;
    shortfall: number;
  }> {
    try {
      const balanceInfo = await this.getUserBalance();
      const hasSufficient = balanceInfo.balance >= requiredAmount;
      const shortfall = Math.max(0, requiredAmount - balanceInfo.balance);

      return {
        hasSufficient,
        currentBalance: balanceInfo.balance,
        requiredAmount,
        shortfall,
      };
    } catch (error) {
      console.error('Error checking balance:', error);
      // Default to insufficient balance on error
      return {
        hasSufficient: false,
        currentBalance: 0,
        requiredAmount,
        shortfall: requiredAmount,
      };
    }
  },

  /**
   * Deduct balance for submission
   */
  async deductBalance(amount: number): Promise<{ success: boolean; newBalance?: number; error?: string }> {
    try {
      const response = await fetch('/api/user/balance/deduct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ amount }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Failed to deduct balance',
        };
      }

      return {
        success: true,
        newBalance: data.newBalance,
      };
    } catch (error) {
      console.error('Error deducting balance:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to deduct balance',
      };
    }
  },
};