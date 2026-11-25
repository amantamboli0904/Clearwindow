export function Footer() {
  return (
    <footer className="border-t border-neutral-200 py-6 text-center text-xs text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
      <div className="px-5 sm:px-8">
        {/* STAGE 2 EXTENSION POINT: Append OpenAQ & WAQI station attributions when enabled */}
        <p>Data: Open-Meteo / Copernicus CAMS (modeled data, may differ from ground stations)</p>
      </div>
    </footer>
  );
}
