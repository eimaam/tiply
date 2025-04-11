import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { InfoCircleOutlined } from '@ant-design/icons';
import { OnboardingHeading } from './OnboardingHeading';

interface CustomizeStepProps {
  defaultToken: string;
  tipAmounts: number[];
  allowCustomAmounts: boolean;
  receiveNotes: boolean;
  minimumTipAmount: number;
  themeColor: string;
  onSettingsChange: (field: string, value: any) => void;
}

export function CustomizeStep({
  defaultToken,
  tipAmounts,
  allowCustomAmounts,
  receiveNotes,
  minimumTipAmount,
  onSettingsChange,
}: CustomizeStepProps) {
  return (
    <div className="space-y-8">
      <div>
        <OnboardingHeading 
          title="Customize Your TippLink ✨" 
          subtitle="Set your default tip preferences and customize your TippLink experience." 
        />
      </div>

      <div className="space-y-6">
        {/* Default Token */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Default Token</label>
          <Input
            value={defaultToken}
            onChange={(e) => onSettingsChange('defaultToken', e.target.value)}
            placeholder="e.g., USDC"
          />
        </div>

        {/* Tip Amounts */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Tip Amounts</label>
          <Input
            value={tipAmounts.join(', ')}
            onChange={(e) =>
              onSettingsChange(
                'tipAmounts',
                e.target.value.split(',').map((val) => parseFloat(val.trim()))
              )
            }
            placeholder="e.g., 1, 5, 10"
          />
        </div>

        {/* Allow Custom Amounts */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={allowCustomAmounts}
            onChange={(e) => onSettingsChange('allowCustomAmounts', e.target.checked)}
            className="h-5 w-5 rounded border-brand-border text-brand-primary focus:ring-brand-primary"
          />
          <label className="text-sm font-medium">Allow Custom Tip Amounts</label>
        </div>

        {/* Receive Notes */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={receiveNotes}
            onChange={(e) => onSettingsChange('receiveNotes', e.target.checked)}
            className="h-5 w-5 rounded border-brand-border text-brand-primary focus:ring-brand-primary"
          />
          <label className="text-sm font-medium">Allow Supporters to Leave Notes</label>
        </div>

        {/* Minimum Tip Amount */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Minimum Tip Amount</label>
          <Input
            type="number"
            value={minimumTipAmount}
            onChange={(e) => onSettingsChange('minimumTipAmount', parseFloat(e.target.value))}
            placeholder="e.g., 1"
          />
        </div>
      </div>

      {/* Info Note */}
      <div className="flex items-start space-x-2 text-sm text-brand-muted-foreground">
        <InfoCircleOutlined className="text-brand-primary mt-0.5" />
        <span>
          These settings can be updated later in your dashboard. Customize them to suit your preferences.
        </span>
      </div>

      {/* Removed navigation buttons */}
    </div>
  )
}