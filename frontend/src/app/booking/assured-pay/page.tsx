"use client";

import { RoutedPage } from "@/components/layout/AppProviders";
import { AssuredPayPageContent } from "@/components/pages/AssuredPayPageContent";

export default function AssuredPayPage() {
  return (
    <RoutedPage withStickyFooter>
      <AssuredPayPageContent />
    </RoutedPage>
  );
}
