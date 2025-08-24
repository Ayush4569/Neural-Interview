'use client'
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const errorMap: Record<string, { title: string; message: string }> = {
    OAuthSignin: {
        title: 'Sign-in failed',
        message: 'We could not start the sign‑in with your provider. Please try again.',
    },
    OAuthCallback: {
        title: 'Provider callback failed',
        message:
            'We were unable to complete the sign‑in. This can happen if the request expired or was tampered with.',
    },
    OAuthCreateAccount: {
        title: 'Account creation failed',
        message:
            'We could not create your account from the provider profile. Please try again or use another provider.',
    },
    EmailCreateAccount: {
        title: 'Email sign-in unavailable',
        message: 'Email-based account creation is currently not available.',
    },
    CallbackRouteError: {
        title: 'Callback error',
        message: 'Something went wrong while handling your sign‑in callback.',
    },
    AccessDenied: {
        title: 'Access denied',
        message:
            'This account is not allowed to sign in. If you believe this is a mistake, contact support.',
    },
    default: {
        title: 'Authentication error',
        message: 'Something went wrong during sign‑in. Please try again.',
    },
};

export default function AuthErrorPage() {
    const params = useSearchParams();
    const code = params.get('error') || 'default';
    const { title, message } = errorMap[code] || errorMap.default;

    return (
        <main
            className="min-h-screen relative flex flex-col justify-center overflow-hidden"
            style={{ background: 'var(--bg)', color: 'var(--text)' }}
        >
            {/* Background gradients + subtle texture */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-10"
                style={{
                    background:
                        'radial-gradient(900px 450px at 15% 15%, rgba(75,93,255,0.14), transparent 60%), radial-gradient(900px 450px at 85% 85%, rgba(255,107,107,0.12), transparent 60%)',
                }}
            />
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-10 opacity-[0.06]"
                style={{
                    backgroundImage:
                        'linear-gradient(transparent 0, rgba(255,255,255,.06) 1px), linear-gradient(90deg, transparent 0, rgba(255,255,255,.06) 1px)',
                    backgroundSize: '24px 24px',
                }}
            />

            <div className="container mx-auto px-4 sm:px-6">

                <section
                    className="mx-auto mt-4 w-full max-w-[560px] rounded-2xl border p-6 sm:p-8"
                    style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
                >
                    {/* Status pill */}
                    <div className="flex items-center gap-2">
                        <span className="inline-block rounded-full bg-[color:var(--coral)]/20 px-3 py-1.5 text-[10px] sm:text-xs font-semibold text-[color:var(--text)]">
                            Auth Error
                        </span>
                        {code !== 'default' && (
                            <span className="text-[10px] sm:text-xs text-[color:var(--text-dim)]">Code: {code}</span>
                        )}
                    </div>

                    <h1 className="mt-3 text-2xl sm:text-3xl font-bold leading-tight">{title}</h1>
                    <p className="mt-2 text-sm sm:text-base text-[color:var(--text-dim)]">{message}</p>

                    {/* Helpful hints */}
                    <ul className="mt-5 space-y-2 text-sm text-[color:var(--text-dim)]">
                        <li>• Ensure pop‑ups are not blocked and try again.</li>
                        <li>• If switching accounts, sign out from the provider first.</li>
                        <li>• If the issue persists, try another provider or contact support.</li>
                    </ul>

                    {/* Actions */}
                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                        <Link
                            href="/"
                            className="flex-1 text-center rounded-lg px-4 py-3 font-semibold text-[#0E1116]"
                            style={{ background: 'linear-gradient(135deg, var(--indigo), var(--coral))' }}
                        >
                            Home
                        </Link>
                        <Link
                            href="/login"
                            className="flex-1 text-center rounded-lg px-4 py-3 font-semibold text-[#0E1116]"
                            style={{ background: 'linear-gradient(135deg, var(--indigo), var(--coral))' }}
                        >
                            Try signing in again
                        </Link>
                    </div>
                </section>

                {/* Tips banner */}
                <div className="mx-auto mt-4 w-full max-w-[560px] rounded-xl border px-4 py-3 text-sm"
                    style={{ background: 'rgba(46,230,166,0.08)', borderColor: 'var(--border)', color: 'var(--text)' }}>
                    Tip: If you use multiple emails on Google/GitHub, choose the one previously used to sign in.
                </div>
            </div>

            {/* Decorative glow */}
            <div
                aria-hidden
                className="pointer-events-none absolute bottom-0 left-1/2 h-24 w-[1200px] -translate-x-1/2 rounded-t-full blur-2xl opacity-30"
                style={{ background: 'linear-gradient(90deg, var(--indigo), var(--coral))' }}
            />
        </main>
    );
}
