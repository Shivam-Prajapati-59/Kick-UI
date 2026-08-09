"use client";

import { StackedCarousel } from "@/components/ui/stacked-carousel";
import {
  TransactionItemContent,
  defaultTransactionItems,
  type TransactionItemData,
} from "@/components/demo/Components/StackedCarousel";

export default function TransactionItem() {
  return (
    <StackedCarousel
      items={defaultTransactionItems}
      renderItem={(item: TransactionItemData) => (
        <TransactionItemContent item={item} />
      )}
    />
  );
}
