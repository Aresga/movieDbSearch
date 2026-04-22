import { Link } from 'react-router-dom'

/**
 * Footer Component
 * The global application footer displaying branding, copyright, and static policy links.
 */
export function Footer() {
    return (
        <footer className="w-full border-t border-border bg-card/25 backdrop-blur-sm mt-auto">
            {/* <div className="container flex flex-col items-center justify-between gap-4 py-4 md:h-10 md:flex-row md:py-0 px-0 max-w-7xl mx-auto"> */}
                <div className="flex flex-nowrap items-center gap-4 py-3 pr-5 whitespace-nowrap">
                    <p className="text-center text-sm leading-loose text-muted-foreground md:text-left flex-1 md:ml-8">
                        © {new Date().getFullYear()} moviesearchdb
                    </p>
                    <Link to="/terms-of-service" className="whitespace-nowrap text-sm font-medium hover:underline underline-offset-4 text-muted-foreground hover:text-foreground transition-colors">
                        Terms of Service
                    </Link>
                    <Link to="/privacy-policy" className="whitespace-nowrap text-sm font-medium hover:underline underline-offset-4 text-muted-foreground hover:text-foreground transition-colors">
                        Privacy Policy
                    </Link>
                    <Link to="/cookie-policy" className="whitespace-nowrap text-sm font-medium hover:underline underline-offset-4 text-muted-foreground hover:text-foreground transition-colors">
                        Cookie Policy
                    </Link>
                </div>
            {/* </div> */}
        </footer>
    )
}
