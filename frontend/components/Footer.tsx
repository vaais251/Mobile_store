import Link from "next/link";
import { Smartphone, Facebook, Instagram, Twitter } from "lucide-react";

const footerSections = [
    {
        title: "Marketplace",
        links: [
            { label: "Buy a Phone", href: "/search" },
            { label: "Sell Your Phone", href: "/sell" },
            { label: "Bulk B2B Trade", href: "/search" },
            { label: "Condition Guide", href: "/search" },
        ],
    },
    {
        title: "Support",
        links: [
            { label: "Safety Tips", href: "/safety" },
            { label: "Admin/Chat Support", href: "/help" },
            { label: "Dispute Center", href: "/help" },
            { label: "Terms of Service", href: "/terms" },
        ],
    },
    {
        title: "App",
        links: [
            { label: "Download on App Store", href: "#" },
            { label: "Get on Google Play", href: "#" },
        ],
    },
];

export function Footer() {
    return (
        <footer className="border-t border-secondary-300/60 bg-white">
            <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                {/* Top: Logo + Links */}
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
                    {/* Branding */}
                    <div className="lg:col-span-2">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-500 text-white">
                                <Smartphone className="h-5 w-5" />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-secondary-900">
                                Phone
                                <span className="text-primary-500">ly</span>
                            </span>
                        </Link>
                        <p className="mt-3 max-w-xs text-sm leading-relaxed text-secondary-500">
                            The safest community-driven marketplace for buying
                            and selling mobile phones locally.
                        </p>
                        {/* Social icons */}
                        <div className="mt-4 flex items-center gap-3">
                            <a
                                href="#"
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary-100 text-secondary-500 transition-colors hover:bg-primary-50 hover:text-primary-500"
                                aria-label="Facebook"
                            >
                                <Facebook className="h-4 w-4" />
                            </a>
                            <a
                                href="#"
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary-100 text-secondary-500 transition-colors hover:bg-primary-50 hover:text-primary-500"
                                aria-label="Instagram"
                            >
                                <Instagram className="h-4 w-4" />
                            </a>
                            <a
                                href="#"
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary-100 text-secondary-500 transition-colors hover:bg-primary-50 hover:text-primary-500"
                                aria-label="Twitter"
                            >
                                <Twitter className="h-4 w-4" />
                            </a>
                        </div>
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

                {/* Bottom bar */}
                <div className="mt-10 flex flex-col items-center justify-between border-t border-secondary-200 pt-6 sm:flex-row">
                    <p className="text-xs text-secondary-400">
                        &copy; {new Date().getFullYear()} Phonely Marketplace.
                        All rights reserved.
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
                            Cookie Settings
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
