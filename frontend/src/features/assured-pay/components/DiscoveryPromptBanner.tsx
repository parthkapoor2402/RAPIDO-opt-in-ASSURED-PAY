"use client";

import type { DiscoveryPrompt } from "@/features/assured-pay/types";

interface DiscoveryPromptBannerProps {
  prompt: DiscoveryPrompt | null;
  onAction?: () => void;
}

export function DiscoveryPromptBanner({ prompt, onAction }: DiscoveryPromptBannerProps) {
  if (!prompt) return null;

  return (
    <button
      type="button"
      data-testid={`discovery-prompt-${prompt.id}`}
      onClick={onAction}
      className="w-full rounded-2xl border border-rapido-navy/20 bg-rapido-tint px-4 py-3 text-left transition-colors hover:bg-brand-100"
    >
      <p className="text-sm font-bold text-rapido-black">{prompt.headline}</p>
      <p className="mt-0.5 text-xs text-rapido-grey">{prompt.subline}</p>
    </button>
  );
}
