import React from "react";

export default function pnpm({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 2500 2500"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path d="m0 0h2500v2500h-2500z" fill="#fff" />
      <path
        d="m2361.25 833.33h-694.44v-694.44h694.44zm-764.03 0h-694.44v-694.44h694.44zm-763.89 0h-694.44v-694.44h694.44zm1527.92 763.89h-694.44v-694.44h694.44z"
        fill="#f9ad00"
      />
      <path
        d="m1597.22 1597.22h-694.44v-694.44h694.44zm0 763.89h-694.44v-694.44h694.44zm764.03 0h-694.44v-694.44h694.44zm-1527.92 0h-694.44v-694.44h694.44z"
        fill="#4e4e4e"
      />
    </svg>
  );
}
