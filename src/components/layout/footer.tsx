import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-muted/50">
      <div className="container-site py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <h3 className="font-heading text-2xl font-bold gold-accent">NOX</h3>
            <p className="text-sm text-secondary/70 leading-relaxed">
              Premium e-commerce for the modern lifestyle. Curated products, exceptional quality.
            </p>
          </div>
          {[
            {
              title: "Shop",
              links: [
                { label: "All Products", href: "/products" },
                { label: "Featured", href: "/products?sort=price_desc" },
              ],
            },
            {
              title: "Company",
              links: [
                { label: "About", href: "/about" },
                { label: "Contact", href: "/contact" },
              ],
            },
            {
              title: "Contact",
              links: [
                { label: "hello@nox.com", href: "mailto:hello@nox.com" },
                { label: "+1 (555) 000-0000", href: "tel:+15550000000" },
                { label: "123 Commerce St, NY", href: "#" },
              ],
            },
          ].map((section) => (
            <div key={section.title}>
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-secondary/50">
                {section.title}
              </h4>
              <ul className="space-y-3 text-sm">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-secondary/70 hover:text-primary transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 border-t border-border/50 pt-8 text-center text-xs text-secondary/50">
          &copy; 2026 NOX. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
