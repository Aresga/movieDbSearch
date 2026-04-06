import { Link, Navigate, Outlet, useLocation } from "react-router-dom";
import { ArrowLeft, Film } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { generateSlug } from "random-word-slugs";
import { Footer } from "./Footer";

export function AuthLayout() {
  const token = useAuthStore((s) => s.token);
  const location = useLocation();

  if (token) return <Navigate to="/home" replace />;

  const isLoginPage = location.pathname === "/login";

  const word = generateSlug(1, {
    partsOfSpeech: ["noun"],
    categories: {
      noun: ["media"],
    },
  });

  return (
    <div className="min-h-screen bg-neutral-200 dark:bg-background flex flex-col">
      <div className="flex-1 flex">
        {/* Decorative left — light: mid-gray + photo; dark: unchanged */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-neutral-500 dark:bg-black flex-col justify-end border-r border-neutral-400 dark:border-transparent">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-[0.4] dark:opacity-30 saturate-95 dark:saturate-100"
            style={{
              backgroundImage: `url(https://picsum.photos/seed/${word}/900/1200)`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-100 from-[20%] via-neutral-400/40 via-[55%] to-neutral-600/25 dark:from-black dark:via-black/55 dark:to-transparent" />
          <div className="relative z-10 p-12">
            <Link
              to="/home"
              className="flex items-center gap-3 mb-6 w-fit rounded-md outline-offset-4 transition-opacity hover:opacity-90 focus-visible:opacity-90"
            >
              <div className="bg-transparent rounded-md p-2">
                <Film className="text-foreground dark:text-white size-4" />
              </div>
              <span className="text-3xl font-black tracking-tight text-foreground dark:text-white">
                moviesearchdb
              </span>
            </Link>
            <p className="text-xl text-muted-foreground dark:text-white/80 leading-relaxed max-w-sm">
              Track, discover, and share your favourite movies with friends.
            </p>
          </div>
        </div>

        {/* Right — light: soft panel above page gray; inputs sit on white for contrast */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-neutral-50 dark:bg-transparent [&_input]:border-foreground/22 dark:[&_input]:border-input [&_input]:bg-white [&_input]:shadow-xs dark:[&_input]:bg-transparent dark:[&_input]:shadow-none [&_button[data-variant=outline]]:border-foreground/22 dark:[&_button[data-variant=outline]]:border-input">
          <div className="w-full max-w-sm">
            <Link
              to="/home"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 outline-offset-4 rounded-sm"
            >
              <ArrowLeft className="size-4 shrink-0" />
              Back to Discover
            </Link>
            {/* Mobile logo */}
            <Link
              to="/home"
              className="flex items-center gap-2 mb-8 lg:hidden w-fit rounded-md outline-offset-4 hover:opacity-80 transition-opacity"
            >
              <div className="bg-transparent rounded-md p-1.5">
                <Film className="text-foreground size-4" />
              </div>
              <span className="text-xl font-black text-foreground">
                moviesearchdb
              </span>
            </Link>
            <Outlet />
          </div>
        </div>
      </div>
      {!isLoginPage && <Footer />}
    </div>
  );
}
