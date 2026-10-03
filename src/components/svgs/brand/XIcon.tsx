import React from "react";

/**
 * X (formerly Twitter) glyph — the official brand mark path.
 *
 * Uses `currentColor` rather than a hardcoded `#000` so the icon inherits the
 * heading's text color and stays legible in both themes, matching how the
 * lucide icons beside it behave. The source path is monochrome black; on a
 * dark background it would otherwise disappear.
 *
 * The `viewBox` is 128×128 (not the 24×24 of the intrinsic size) because the
 * brand path is authored on that grid. `width`/`height` are left unset so the
 * icon is sized entirely by the caller's classes, as with every other icon.
 */
export default function XIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 128 128"
      fill="currentColor"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path d="M75.916 54.2L122.542 0h-11.05L71.008 47.06L38.672 0H1.376l48.898 71.164L1.376 128h11.05L55.18 78.303L89.328 128h37.296L75.913 54.2ZM60.782 71.79l-4.955-7.086l-39.42-56.386h16.972L65.19 53.824l4.954 7.086l41.353 59.15h-16.97L60.782 71.793Z" />
    </svg>
  );
}
