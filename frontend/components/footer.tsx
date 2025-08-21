
export function Footer() {
  return (
    <footer className="mt-6 bg-[#0B0E13] py-5 md:py-8 sm:py-6">
      <div className="container mx-auto grid grid-cols-1 gap-5 px-4 sm:px-5 md:px-6 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="font-extrabold text-lg sm:text-xl">Neural Interview</div>
          <p className="mt-2 text-nowrap text-[color:var(--text-dim)]">
            Practice real interviews and get instant feedback.
          </p>
        </div>
      </div>

      <div className="container mx-auto mt-5 border-t border-[color:var(--border)] px-4 sm:px-5 md:px-6 pt-4 text-[color:var(--text-dim)] text-sm">
        © 2025 Neural Interview. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
