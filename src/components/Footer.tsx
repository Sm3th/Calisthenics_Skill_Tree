const APP_VERSION = "1.0.0";

/**
 * Footer styled to match the FitTrack app footer, since this skill tree may
 * later ship as part of FitTrack. Copy + layout mirror FitTrack's:
 * left = copyright line, right = a live status indicator and version tag.
 */
export function Footer() {
  return (
    <footer
      role="contentinfo"
      className="border-t border-edge bg-ink"
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-6 text-xs text-zinc-500 sm:flex-row">
        <span>© 2026 FitTrack · Made with sweat and lime.</span>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span
              aria-hidden
              className="h-1.5 w-1.5 rounded-full bg-lime shadow-[0_0_6px_#c6f432]"
            />
            All systems operational
          </span>
          <span className="font-mono text-zinc-600">v{APP_VERSION}</span>
        </div>
      </div>
    </footer>
  );
}
