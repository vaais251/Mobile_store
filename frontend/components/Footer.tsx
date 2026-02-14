import Link from "next/link";
import { Smartphone } from "lucide-react";

const footerSections = [
    {
        title: "Marketplace",
        links: [
            { label: "Browse Phones", href: "/browse" },
            { label: "Sell Your Phone", href: "/sell" },
            { label: "Latest Listings", href: "/browse?sort=latest" },
            { label: "Nearby Deals", href: "/browse?sort=nearby" },
        ],
    },
    {
        title: "Support",
        links: [
            { label: "Help Center", href: "/help" },
            { label: "Safety Tips", href: "/safety" },
            { label: "Contact Us", href: "/contact" },
            { label: "Report a Problem", href: "/report" },
        ],
    },
    {
        title: "Company",
        links: [
            { label: "About Phonely", href: "/about" },
            { label: "How It Works", href: "/how-it-works" },
            { label: "Careers", href: "/careers" },
            { label: "Blog", href: "/blog" },
        ],
    },
    {
        title: "Connect",
        links: [
            { label: "Twitter / X", href: "#" },
            { label: "Instagram", href: "#" },
            { label: "Facebook", href: "#" },
            { label: "WhatsApp", href: "#" },
        ],
    },
];

export function Footer() {
    return (
        <footer className="border-t border-secondary-300/60 bg-white">
            <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                {/* ─── Top: Logo + Links Grid ────── */}
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
                    {/* Branding */}
                    <div className="lg:col-span-1">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-500 text-white">
                                <Smartphone className="h-5 w-5" />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-secondary-900">
                                Phone<span className="text-primary-500">ly</span>
                            </span>
                        </Link>
                        <p className="mt-3 max-w-xs text-sm leading-relaxed text-secondary-500">
                            Pakistan&apos;s trusted admin-mediated phone marketplace. Buy &amp;
                            sell with confidence.
                        </p>
                    </div>

                    {/* Link columns */}
                    {footerSections.map((section) => (
                        <div key={section.title}>
                            <h4 className="text-sm font-semibold text-secondary-900">
                                {section.title}
                            </h4>
                            <ul className="mt-3 space-y-2.5">
                                {section.links.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            href={link.href}
                                            className="text-sm text-secondary-500 transition-colors hover:text-primary-500"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* ─── Bottom Bar ────────────────── */}
                <div className="mt-10 flex flex-col items-center justify-between border-t border-secondary-200 pt-6 sm:flex-row">
                    <p className="text-xs text-secondary-400">
                        &copy; {new Date().getFullYear()} Phonely. All rights reserved.
                    </p>
                    <div className="mt-3 flex gap-4 sm:mt-0">
                        <Link
                            href="/privacy"
                            className="text-xs text-secondary-400 hover:text-secondary-600"
                        >
                            Privacy Policy
                        </Link>
                        <Link
                            href="/terms"
                            className="text-xs text-secondary-400 hover:text-secondary-600"
                        >
                            Terms of Service
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
