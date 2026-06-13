"use client";

import { RoutedPage } from "@/components/layout/AppProviders";
import { ResidualDuePageContent } from "@/components/pages/ResidualDuePageContent";

export default function ResidualDuePage() {
  return (
    <RoutedPage withStickyFooter>
      <ResidualDuePageContent />
    </RoutedPage>
  );
}
