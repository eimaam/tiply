import * as React from 'react';

interface OnboardingHeadingProps {
  title: string;
  subtitle: string;
}

export function OnboardingHeading({ title, subtitle }: OnboardingHeadingProps) {
  return (
    <div>
      <h1 className="text-3xl font-bold">
        Welcome to tiply! {emoji}
      </h1>
      <h2 className="text-xl md:text-2xl font-semibold mb-2">{title}</h2>
      <p className="text-brand-muted-foreground">{subtitle}</p>
    </div>
  );
}