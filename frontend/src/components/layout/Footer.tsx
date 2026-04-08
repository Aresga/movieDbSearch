import { Link } from 'react-router-dom'
import { Film } from 'lucide-react'

/**
 * Footer Component
 * The global application footer displaying branding, copyright, and static policy links.
 */
export function Footer() {
    return (
        <footer className="w-full border-t border-border bg-card/30 backdrop-blur-sm mt-auto">
            <div className="container flex flex-col items-center justify-between gap-6 py-8 md:h-24 md:flex-row md:py-0 px-6 max-w-7xl mx-auto">
                <div className="flex items-center gap-2 text-foreground font-bold tracking-tight">
                    <Film className="w-5 h-5 text-primary" />
                    <span>moviesearchdb</span>
                </div>

                <p className="text-center text-sm leading-loose text-muted-foreground md:text-left flex-1 md:ml-8">
                    © {new Date().getFullYear()} moviesearchdb. All rights reserved. Built for cinema lovers.
                </p>

                <div className="flex gap-6 items-center">
                    <Link to="/privacy-policy" className="text-sm font-medium hover:underline underline-offset-4 text-muted-foreground hover:text-foreground transition-colors">
                        Privacy Policy
                    </Link>
                    <Link to="/cookie-policy" className="text-sm font-medium hover:underline underline-offset-4 text-muted-foreground hover:text-foreground transition-colors">
                        Cookie Policy
                    </Link>
                </div>
            </div>
        </footer>
    )
}
