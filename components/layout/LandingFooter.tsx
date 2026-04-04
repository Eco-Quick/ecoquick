import Link from "next/link";

export function LandingFooter() {
  return (
    <footer
      id="contact"
      className="mt-20 border-t border-zinc-200 pb-14 pt-12"
    >
      <div className="grid gap-10 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          <p className="text-sm font-extrabold uppercase tracking-[0.22em] text-zinc-950">
            ECOQUICK DELIVERY
          </p>
          <div className="space-y-1 text-sm text-zinc-600">
            <p>Kingston upon Thames, London</p>
            <a href="mailto:hello@ecoquick.delivery" className="hover:text-zinc-900 transition-colors">hello@ecoquick.delivery</a>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-zinc-400">
              Product
            </p>
            <div className="space-y-2 text-sm text-zinc-600">
              <Link
                className="block hover:text-zinc-900"
                href="/#delivery"
              >
                Services
              </Link>
              <Link
                className="block hover:text-zinc-900"
                href="/#workflow"
              >
                Workflow
              </Link>
              <Link
                className="block hover:text-zinc-900"
                href="/#coverage"
              >
                Coverage
              </Link>
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-zinc-400">
              Company
            </p>
            <div className="space-y-2 text-sm text-zinc-600">
              <Link className="block hover:text-zinc-900" href="/">
                Home
              </Link>
              <Link
                className="block hover:text-zinc-900"
                href="/login"
              >
                Log in
              </Link>
              <Link
                className="block hover:text-zinc-900"
                href="/signup"
              >
                Get started
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-zinc-200 pt-6 text-xs text-zinc-500">
        <p className="font-semibold uppercase tracking-[0.22em]">
          © {new Date().getFullYear()} EcoQuick
        </p>
        <div className="flex items-center gap-5 font-semibold uppercase tracking-[0.22em]">
          <a className="hover:text-zinc-900" href="https://instagram.com/ecoquickdelivery" target="_blank" rel="noopener noreferrer">
            Instagram
          </a>
          <a className="hover:text-zinc-900" href="https://twitter.com/ecoquickdelivery" target="_blank" rel="noopener noreferrer">
            Twitter
          </a>
          <a className="hover:text-zinc-900" href="mailto:hello@ecoquick.delivery">
            Email
          </a>
        </div>
      </div>
    </footer>
  );
}

