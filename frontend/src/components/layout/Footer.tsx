import { Link } from 'react-router-dom'

/**
 * Footer Component
 * The global application footer displaying branding, copyright, and static policy links.
 */
export function Footer() {
    return (
        <footer className="w-full border-t border-border bg-card/25 backdrop-blur-sm mt-auto">
            <div className="container flex flex-col items-center justify-between gap-6 py-8 md:h-13 md:flex-row md:py-0 px-6 max-w-7xl mx-auto">
                <p className="text-center text-sm leading-loose text-muted-foreground md:text-left flex-1 md:ml-8">
                    © {new Date().getFullYear()} moviesearchdb. All rights reserved. 
                </p>

                {/* <div className="flex gap-6 items-center"> */}
                    <Link to="/privacy-policy" className="text-sm font-medium hover:underline underline-offset-4 text-muted-foreground hover:text-foreground transition-colors">
                        Privacy Policy
                    </Link>
                    <Link to="/cookie-policy" className="text-sm font-medium hover:underline underline-offset-4 text-muted-foreground hover:text-foreground transition-colors">
                        Cookie Policy
                    </Link>
                {/* </div> */}
            </div>
        </footer>
    )
}
