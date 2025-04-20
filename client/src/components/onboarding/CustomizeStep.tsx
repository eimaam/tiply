import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { InfoCircleOutlined } from '@ant-design/icons';
import { OnboardingHeading } from './OnboardingHeading';

interface CustomizeStepProps {
  tipAmounts: number[];
  allowCustomAmounts: boolean;
  receiveNotes: boolean;
  minimumTipAmount: number;
  themeColor: string;
  onSettingsChange: (field: string, value: any) => void;
}

const DEFAULT_TIP_AMOUNTS = [1, 2, 5, 10, 20];

export function CustomizeStep({
  tipAmounts,
  allowCustomAmounts,
  receiveNotes,
  minimumTipAmount,
  onSettingsChange,
}: CustomizeStepProps) {
  

  const handleAllowCustomAmountsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSettingsChange('allowCustomAmounts', e.target.checked);
  };

  const handleMinimumTipAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      onSettingsChange('minimumTipAmount', value);
    }
  };

  const handleDefaultTipAmountChange = (amount: number) => {
    if (!tipAmounts.includes(amount) && tipAmounts.length < 5) {
      onSettingsChange('tipAmounts', [...tipAmounts, amount]);
    } else if (tipAmounts.includes(amount)) {
      onSettingsChange('tipAmounts', tipAmounts.filter((tip) => tip !== amount));
    }
  };

  const canContinue = tipAmounts.length > 0 && minimumTipAmount > 0;

  return (
    <div className="space-y-8">
      <div>
        <OnboardingHeading 
          title="Customize Your tiply ✨" 
          subtitle="Set your default tip preferences and customize your tiply experience." 
        />
      </div>

      <div className="space-y-6">
        {/* Minimum Tip Amount */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Minimum Tip Amount</label>
          <Input
            type="number"
            placeholder="e.g., 1"
            value={minimumTipAmount}
            onChange={(e) => onSettingsChange('minimumTipAmount', parseFloat(e.target.value) || 1)}
            className="w-full"
          />
          <p className="text-xs text-brand-muted-foreground">Default: $1. Set a minimum amount for tips (optional).</p>
        </div>

        {/* Default Tip Amounts */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Default Tip Amounts</label>
          <div className="flex flex-wrap gap-2">
            {DEFAULT_TIP_AMOUNTS.map((amount) => (
              <button
                type="button"
                key={amount}
                className={`px-4 py-2 rounded-lg border ${tipAmounts.includes(amount) ? 'bg-brand-primary text-white' : 'bg-brand-surface text-brand-muted-foreground'}`}
                onClick={() => handleDefaultTipAmountChange(amount)}
              >
                ${amount}
              </button>
            ))}
          </div>
          <p className="text-xs text-brand-muted-foreground">You can select up to 5 default tip amounts.</p>
        </div>

        {/* Allow Custom Amounts */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={allowCustomAmounts}
            onChange={handleAllowCustomAmountsChange}
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

        {/* Info Note */}
        <div className="flex items-start space-x-2 text-sm text-brand-muted-foreground">
          <InfoCircleOutlined className="text-brand-primary mt-0.5" />
          <span>
            These settings can be updated later in your dashboard. Customize them to suit your preferences.
          </span>
        </div>
      </div>
    </div>
  );
}