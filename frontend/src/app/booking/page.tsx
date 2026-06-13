"use client";

import { RoutedPage } from "@/components/layout/AppProviders";
import { BookingPageContent } from "@/components/pages/BookingPageContent";

export default function BookingPage() {
  return (
    <RoutedPage fullBleed withStickyFooter>
      <BookingPageContent />
    </RoutedPage>
  );
}
