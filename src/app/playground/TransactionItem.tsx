"use client";

import { StackedCarousel } from "@registry/new-york/components/stacked-carousel/stacked-carousel";
import {
  TransactionItemContent,
  defaultTransactionItems,
  type TransactionItemData,
} from "@/demos/stacked-carousel";

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
