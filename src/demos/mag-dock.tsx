"use client";

import {
  HomeIcon,
  MailIcon,
  XCircleIcon,
  Trash2Icon,
  ActivityIcon,
} from "lucide-react";
import MagDock from "@registry/new-york/components/mag-dock/mag-dock";

const items = [
  { id: 1, icon: HomeIcon, name: "Home", active: true },
  { id: 2, icon: MailIcon, name: "Mail", active: true },
  { id: 3, icon: XCircleIcon, name: "Close", active: false },
  { id: 4, icon: Trash2Icon, name: "Trash", active: false },
  { id: 5, icon: ActivityIcon, name: "Activity", active: true },
];

export default function MagDockDemo() {
  return <MagDock items={items} />;
}
