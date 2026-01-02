// FAQ data for Help/FAQ page

export interface FAQItem {
  id: string
  category: string
  question: string
  answer: string
  tags?: string[]
}

export const faqData: FAQItem[] = [
  // Getting Started
  {
    id: 'create-account',
    category: 'Getting Started',
    question: 'How do I create an account?',
    answer: 'Click the "Sign Up" button on the homepage. You can sign up with email/password, or use Google, GitHub, Microsoft, or Apple SSO. After signing up, you\'ll go through a quick onboarding process to get started.',
    tags: ['signup', 'account', 'registration'],
  },
  {
    id: 'import-trades',
    category: 'Getting Started',
    question: 'How do I import my trades?',
    answer: 'You can import trades in three ways: 1) Connect your Zerodha account for automatic import, 2) Upload a CSV file with your trading history, or 3) Add trades manually one by one. Go to Dashboard → Import to get started.',
    tags: ['import', 'csv', 'zerodha', 'trades'],
  },
  {
    id: 'supported-brokers',
    category: 'Getting Started',
    question: 'Which brokers are supported?',
    answer: 'Currently, we support direct API integration with Zerodha. For other brokers (Upstox, Angel One, etc.), you can import trades via CSV files. We provide CSV presets for Zerodha, Upstox, and Angel One to make import easier.',
    tags: ['brokers', 'zerodha', 'upstox', 'angel one'],
  },
  {
    id: 'manual-entry',
    category: 'Getting Started',
    question: 'Can I add trades manually?',
    answer: 'Yes! You can add trades manually by going to Dashboard → Manual Entry. Fill in the trade details (symbol, quantity, price, P&L, etc.) and save. This is useful for trades from brokers we don\'t support yet or for historical trades.',
    tags: ['manual', 'entry', 'add trade'],
  },
  {
    id: 'connect-zerodha',
    category: 'Getting Started',
    question: 'How do I connect my Zerodha account?',
    answer: 'Go to Settings → Brokers and click "Connect Zerodha". You\'ll be redirected to Zerodha\'s authorization page. After authorizing, TradeAutopsy will have read-only access to your trades. Your credentials are never stored - we use OAuth for secure authentication.',
    tags: ['zerodha', 'connect', 'oauth', 'broker'],
  },

  // Dashboard & Analytics
  {
    id: 'win-rate-calculation',
    category: 'Dashboard & Analytics',
    question: 'How is win rate calculated?',
    answer: 'Win rate is calculated as: (Number of winning trades / Total number of trades) × 100. A winning trade is any trade with positive P&L. Win rate helps you understand how often your trades are profitable.',
    tags: ['win rate', 'calculation', 'metrics'],
  },
  {
    id: 'sharpe-ratio',
    category: 'Dashboard & Analytics',
    question: 'What is Sharpe ratio?',
    answer: 'Sharpe ratio measures risk-adjusted return. It\'s calculated as: (Average return - Risk-free rate) / Standard deviation of returns. Higher Sharpe ratio indicates better risk-adjusted performance. A Sharpe ratio above 1 is considered good.',
    tags: ['sharpe ratio', 'risk', 'metrics'],
  },
  {
    id: 'maximum-drawdown',
    category: 'Dashboard & Analytics',
    question: 'How is maximum drawdown calculated?',
    answer: 'Maximum drawdown is the largest peak-to-trough decline in your equity curve. It measures the worst loss from a peak before a new peak is achieved. Lower drawdown is better - it shows you can handle losing streaks without blowing your account.',
    tags: ['drawdown', 'risk', 'metrics'],
  },
  {
    id: 'no-analytics',
    category: 'Dashboard & Analytics',
    question: 'Why don\'t I see any analytics?',
    answer: 'Analytics require at least 10 trades to generate meaningful insights. If you have fewer trades, import more trading data. Some advanced analytics require 20+ trades for accurate pattern detection.',
    tags: ['analytics', 'data', 'trades'],
  },
  {
    id: 'data-refresh',
    category: 'Dashboard & Analytics',
    question: 'How often does data refresh?',
    answer: 'Dashboard metrics refresh automatically when you navigate to the page. Trade data is updated in real-time when you import new trades. Market status updates every minute. You can manually refresh by reloading the page.',
    tags: ['refresh', 'update', 'data'],
  },

  // AI Features
  {
    id: 'ai-coach',
    category: 'AI Features',
    question: 'How does the AI coach work?',
    answer: 'The AI coach analyzes your trading patterns, win rate, and behavioral data to provide personalized insights. It uses OpenAI GPT-4 to understand your trading style and suggest improvements. The coach learns from your trading history to give relevant advice.',
    tags: ['ai', 'coach', 'insights'],
  },
  {
    id: 'behavioral-patterns',
    category: 'AI Features',
    question: 'What are behavioral patterns?',
    answer: 'Behavioral patterns are trading mistakes detected by AI, such as revenge trading, FOMO trading, overtrading, and loss aversion. TradeAutopsy detects 8 different patterns and shows you how much each pattern costs you, helping you improve your discipline.',
    tags: ['patterns', 'behavioral', 'psychology'],
  },
  {
    id: 'ai-accuracy',
    category: 'AI Features',
    question: 'How accurate are the AI insights?',
    answer: 'AI insights are based on statistical analysis of your trading data. They identify patterns and correlations that may not be obvious. However, AI insights are educational and should not be considered financial advice. Always do your own research.',
    tags: ['ai', 'accuracy', 'insights'],
  },
  {
    id: 'trust-ai',
    category: 'AI Features',
    question: 'Can I trust the AI recommendations?',
    answer: 'AI recommendations are educational tools to help you improve. They are not financial advice. Always consult a qualified financial advisor before making trading decisions. Use AI insights as one input among many in your decision-making process.',
    tags: ['ai', 'recommendations', 'advice'],
  },

  // Trading Rules
  {
    id: 'create-rule',
    category: 'Trading Rules',
    question: 'How do I create a trading rule?',
    answer: 'Go to Dashboard → Rules and click "Create Rule". Choose a rule type (time restrictions, trade limits, loss limits, etc.), set the parameters, and save. Rules are automatically checked when you log trades and will alert you if violated.',
    tags: ['rules', 'create', 'discipline'],
  },
  {
    id: 'rule-types',
    category: 'Trading Rules',
    question: 'What types of rules can I create?',
    answer: 'You can create rules for: time restrictions (e.g., no trading after 2 PM), trade count limits (e.g., max 5 trades per day), loss limits (e.g., stop trading after ₹5,000 loss), position size limits, and behavioral rules (e.g., no revenge trading).',
    tags: ['rules', 'types', 'limits'],
  },
  {
    id: 'rule-violations',
    category: 'Trading Rules',
    question: 'How do rule violations work?',
    answer: 'When you log a trade that violates a rule, TradeAutopsy will alert you and log the violation. You can see your violation history and adherence score in the Rules page. Violations help you track your discipline and identify areas for improvement.',
    tags: ['violations', 'rules', 'alerts'],
  },
  {
    id: 'disable-rule',
    category: 'Trading Rules',
    question: 'Can I disable a rule temporarily?',
    answer: 'Yes! Go to Dashboard → Rules, find the rule you want to disable, and toggle it off. Disabled rules won\'t be checked but remain in your list. You can re-enable them anytime. This is useful for special trading days or market conditions.',
    tags: ['rules', 'disable', 'toggle'],
  },

  // Goals & Progress
  {
    id: 'set-goal',
    category: 'Goals & Progress',
    question: 'How do I set a trading goal?',
    answer: 'Go to Dashboard → Goals and click "Create Goal". Choose a goal type (daily P&L, weekly win rate, monthly profit, etc.), set your target, and save. You can track progress in real-time and celebrate when you achieve goals!',
    tags: ['goals', 'create', 'target'],
  },
  {
    id: 'goal-progress',
    category: 'Goals & Progress',
    question: 'How is goal progress tracked?',
    answer: 'Progress is calculated automatically based on your trading data. For P&L goals, we sum your daily/weekly/monthly P&L. For win rate goals, we calculate your actual win rate. Progress bars and percentages update in real-time as you trade.',
    tags: ['goals', 'progress', 'tracking'],
  },
  {
    id: 'edit-goal',
    category: 'Goals & Progress',
    question: 'Can I edit a goal after creating it?',
    answer: 'Yes! Click on any goal in the Goals page to edit it. You can change the target, deadline, or description. However, changing a goal resets its progress tracking. Completed goals cannot be edited but can be archived.',
    tags: ['goals', 'edit', 'modify'],
  },

  // Journal
  {
    id: 'add-journal',
    category: 'Journal',
    question: 'How do I add journal notes?',
    answer: 'When viewing a trade, click "Add Journal Entry" or go to Dashboard → Journal. Write your notes about the trade - what you learned, emotions, setup, etc. You can also add tags, emotional state, and screenshots to enrich your journal entries.',
    tags: ['journal', 'notes', 'entry'],
  },
  {
    id: 'attach-screenshots',
    category: 'Journal',
    question: 'Can I attach screenshots?',
    answer: 'Yes! When adding or editing a journal entry, you can upload screenshots. This is useful for chart analysis, trade setups, or documenting important moments. Screenshots are stored securely and associated with specific trades.',
    tags: ['screenshots', 'attachments', 'journal'],
  },
  {
    id: 'audio-journaling',
    category: 'Journal',
    question: 'How does audio journaling work?',
    answer: 'Click the microphone icon in the journal to record audio notes. Your recording is transcribed using AI and summarized into key insights. Audio journaling is great for quick notes while trading or detailed post-trade reflections.',
    tags: ['audio', 'recording', 'journal'],
  },

  // Account & Security
  {
    id: 'change-password',
    category: 'Account & Security',
    question: 'How do I change my password?',
    answer: 'Go to Settings → Account and click "Change Password". Enter your current password and new password. If you forgot your password, use the "Forgot Password" link on the login page to reset it via email.',
    tags: ['password', 'security', 'account'],
  },
  {
    id: 'delete-account',
    category: 'Account & Security',
    question: 'How do I delete my account?',
    answer: 'Go to Settings → Danger Zone and click "Delete My Account". You\'ll need to confirm by typing DELETE and entering your password. This permanently deletes all your data and cannot be undone. Make sure to export your data first if needed.',
    tags: ['delete', 'account', 'data'],
  },
  {
    id: 'data-security',
    category: 'Account & Security',
    question: 'Is my trading data secure?',
    answer: 'Yes! Your data is encrypted at rest and in transit. We use Supabase (PostgreSQL) with row-level security, so your data is isolated from other users. We never share or sell your trading data. See our Privacy Policy for details.',
    tags: ['security', 'privacy', 'data'],
  },
  {
    id: 'who-sees-trades',
    category: 'Account & Security',
    question: 'Who can see my trades?',
    answer: 'Only you can see your trades. Your data is private and encrypted. We use row-level security (RLS) to ensure data isolation. TradeAutopsy staff cannot access your trading data unless you explicitly grant permission for support purposes.',
    tags: ['privacy', 'data', 'access'],
  },

  // Troubleshooting
  {
    id: 'import-error',
    category: 'Troubleshooting',
    question: 'My trades aren\'t importing correctly',
    answer: 'Check that your CSV file matches the expected format. Use the broker presets (Zerodha, Upstox, Angel One) for automatic column mapping. If issues persist, try manual column mapping or contact support with a sample of your CSV file.',
    tags: ['import', 'error', 'csv'],
  },
  {
    id: 'wrong-calculations',
    category: 'Troubleshooting',
    question: 'I\'m seeing wrong calculations',
    answer: 'Double-check your trade data (entry price, exit price, quantity). P&L is calculated as: (Exit Price - Entry Price) × Quantity - Charges. If calculations seem wrong, verify your trade entries and ensure charges are included correctly.',
    tags: ['calculations', 'pnl', 'error'],
  },
  {
    id: 'dashboard-loading',
    category: 'Troubleshooting',
    question: 'The dashboard isn\'t loading',
    answer: 'Try refreshing the page. If it still doesn\'t load, check your internet connection. Clear your browser cache and cookies, then try again. If the problem persists, contact support with details about what you see (error message, blank screen, etc.).',
    tags: ['loading', 'error', 'dashboard'],
  },
  {
    id: 'broker-connection',
    category: 'Troubleshooting',
    question: 'I can\'t connect my broker',
    answer: 'Ensure you\'re using the correct broker credentials. For Zerodha, make sure you authorize TradeAutopsy on Zerodha\'s website. Check that your broker account is active. If issues persist, disconnect and reconnect, or contact support.',
    tags: ['broker', 'connection', 'zerodha'],
  },
]

export const faqCategories = [
  'Getting Started',
  'Dashboard & Analytics',
  'AI Features',
  'Trading Rules',
  'Goals & Progress',
  'Journal',
  'Account & Security',
  'Troubleshooting',
]

