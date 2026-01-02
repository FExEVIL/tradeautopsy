import { BaseEmailTemplate } from './BaseTemplate'

export interface GoalAchievedData {
  userName: string
  goalTitle: string
  goalType: string
  targetValue: number
  currentValue: number
  progress: number
  dashboardUrl: string
}

export function renderGoalAchievedEmail(data: GoalAchievedData): string {
  return BaseEmailTemplate({
    title: `🎉 Goal Achieved: ${data.goalTitle}`,
    children: `
      <p style="margin: 0 0 20px 0;">Hi ${data.userName},</p>
      
      <div style="text-align: center; margin: 0 0 32px 0; padding: 32px; background: linear-gradient(135deg, #10b98120 0%, #05966920 100%); border-radius: 12px; border: 2px solid #10b98140;">
        <div style="font-size: 64px; margin-bottom: 16px;">🎉</div>
        <h3 style="margin: 0 0 8px 0; color: #10b981; font-size: 28px; font-weight: 700;">Congratulations!</h3>
        <p style="margin: 0; color: #d1d5db; font-size: 18px;">You've achieved your goal!</p>
      </div>
      
      <div style="margin: 0 0 24px 0; padding: 20px; background-color: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 8px;">
        <div style="color: #ffffff; font-size: 18px; font-weight: 600; margin-bottom: 16px;">Goal Details</div>
        
        <div style="margin-bottom: 12px;">
          <div style="color: #9ca3af; font-size: 14px; margin-bottom: 4px;">Goal</div>
          <div style="color: #ffffff; font-size: 16px; font-weight: 500;">${data.goalTitle}</div>
        </div>
        
        <div style="margin-bottom: 12px;">
          <div style="color: #9ca3af; font-size: 14px; margin-bottom: 4px;">Type</div>
          <div style="color: #ffffff; font-size: 16px; font-weight: 500;">${data.goalType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
        </div>
        
        <div style="margin-bottom: 12px;">
          <div style="color: #9ca3af; font-size: 14px; margin-bottom: 4px;">Target</div>
          <div style="color: #ffffff; font-size: 16px; font-weight: 500;">₹${data.targetValue.toLocaleString('en-IN')}</div>
        </div>
        
        <div style="margin-bottom: 12px;">
          <div style="color: #9ca3af; font-size: 14px; margin-bottom: 4px;">Achieved</div>
          <div style="color: #10b981; font-size: 16px; font-weight: 600;">₹${data.currentValue.toLocaleString('en-IN')}</div>
        </div>
        
        <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #2a2a2a;">
          <div style="color: #9ca3af; font-size: 14px; margin-bottom: 8px;">Progress</div>
          <div style="background-color: #0f0f0f; border-radius: 8px; height: 8px; overflow: hidden;">
            <div style="background: linear-gradient(90deg, #10b981 0%, #059669 100%); height: 100%; width: ${data.progress}%; border-radius: 8px;"></div>
          </div>
          <div style="color: #10b981; font-size: 14px; font-weight: 600; margin-top: 8px; text-align: center;">${data.progress}% Complete</div>
        </div>
      </div>
      
      <p style="margin: 0 0 20px 0;">
        This is a significant milestone! Your dedication and discipline are paying off. Keep up the excellent work!
      </p>
      
      <p style="margin: 0;">
        Ready to set your next goal? Challenge yourself to reach even higher!
      </p>
    `,
    cta: {
      label: 'Set Next Goal',
      href: `${data.dashboardUrl}/goals`,
    },
    footerText: 'Keep pushing forward!<br>The TradeAutopsy Team',
  })
}

