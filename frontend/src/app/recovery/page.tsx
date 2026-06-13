"use client";

import { RoutedPage } from "@/components/layout/AppProviders";
import { RecoveryPageContent } from "@/components/pages/RecoveryPageContent";

export default function RecoveryPage() {
  return (
    <RoutedPage withStickyFooter>
      <RecoveryPageContent />
    </RoutedPage>
  );
}
