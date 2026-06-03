export default function Footer() {
  return (
    <footer className="mt-auto border-t border-white/10">
      <div className="max-w-5xl mx-auto px-5 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-white/40">
          © {new Date().getFullYear()} My Personal Site. Built with Next.js.
        </p>
        <div className="flex items-center gap-6">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-white/40 hover:text-white/80 transition-colors"
          >
            GitHub
          </a>
          <a
            href="mailto:hello@example.com"
            className="text-sm text-white/40 hover:text-white/80 transition-colors"
          >
            Email
          </a>
        </div>
      </div>
    </footer>
  );
}
