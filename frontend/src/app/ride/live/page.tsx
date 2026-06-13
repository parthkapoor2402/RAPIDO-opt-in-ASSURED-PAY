"use client";

import { RoutedPage } from "@/components/layout/AppProviders";
import { RideLivePageContent } from "@/components/pages/RideLivePageContent";

export default function RideLivePage() {
  return (
    <RoutedPage fullBleed>
      <RideLivePageContent />
    </RoutedPage>
  );
}
