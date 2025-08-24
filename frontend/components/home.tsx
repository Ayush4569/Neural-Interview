'use client'
import React from 'react'
import Bar from "@/components/bar";
import topColor from "@/components/topColor";
import { cards } from "@/constants";
import Link from "next/link";
import { useSession } from 'next-auth/react';
import { CreateInterviewModal } from '@/app/(Interview)/_components/CreateInterviewModal';
const Home = () => {
    const { status } = useSession();
    return (
        <div className="min-h-screen">
            <section className="container relative mx-auto px-4 sm:px-5 md:px-6 py-10 sm:py-12 md:py-14 lg:py-16">
                <div
                    className="pointer-events-none absolute inset-0 -z-10 bg-center bg-no-repeat bg-cover opacity-20"
                    style={{
                        backgroundImage: "url('/robot.png')",
                    }}
                />
                <span className="inline-block rounded-full bg-[color:var(--mint)] px-3 py-1.5 text-[10px] sm:text-xs font-medium text-[#0E1116]">
                    AI-Powered Practice & Feedback
                </span>

                <h1 className="mt-3 text-[32px] leading-tight font-extrabold sm:text-4xl md:text-5xl lg:text-6xl">
                    Get Interview‑Ready with Realistic AI Mocks
                </h1>

                <p className="mt-3 max-w-[680px] text-[color:var(--text-dim)] text-sm sm:text-base">
                    Practice role‑specific interviews and receive instant, actionable feedback on structure,
                    correctness, and impact.
                </p>

                <CreateInterviewModal>
                    <button

                        className="rounded-lg mt-4 px-4 py-2.5 sm:px-5 sm:py-3 font-semibold text-shadow-300 cursor-pointer hover:scale-110 transition-transform duration-300 ease-in-out"
                        style={{ background: "linear-gradient(135deg, var(--indigo), var(--coral))" }}
                    >
                        Create an Interview
                    </button>
                </CreateInterviewModal>
            </section>


            <section className="container mx-auto px-4 sm:px-5 md:px-6 py-10 sm:py-12 md:py-14 lg:py-16">
                <h2 className="text-xl sm:text-2xl font-semibold">Pick Your Interview</h2>

                <div className="mt-5 grid grid-cols-1 gap-4 sm:gap-5 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {cards.map((c, i) => (
                        <article
                            key={c.title}
                            className="group rounded-xl border p-0 transition-transform hover:-translate-y-0.5"
                            style={{
                                background: "var(--surface)",
                                borderColor: "var(--border)",
                                borderTop: `3px solid ${topColor(i)}`,
                            }}
                        >
                            <div className="p-4 sm:p-5">
                                <span
                                    className={`inline-block rounded-full px-2.5 py-1 text-[10px] sm:text-xs border text-[color:var(--text)]`}
                                    style={{
                                        borderColor: c.type === "Technical" ? "var(--indigo)" : "var(--mint)",
                                    }}
                                >
                                    {c.type}
                                </span>

                                <h3 className="mt-2.5 text-lg sm:text-xl font-semibold">{c.title}</h3>
                                <div className="text-xs sm:text-sm text-[color:var(--text-dim)]">{c.meta}</div>

                                <p className="mt-2.5 text-[color:var(--text-dim)] text-sm">{c.desc}</p>

                                <div className="mt-3.5 flex items-center justify-between">
                                    <button
                                        className="rounded-lg px-3 py-2 sm:px-4 sm:py-2.5 font-medium text-[#0E1116]"
                                        style={{ background: "var(--indigo)" }}
                                    >
                                        Take interview
                                    </button>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            {/* Feedback */}
            <section className="container mx-auto px-4 sm:px-5 md:px-6 py-10 sm:py-12 md:py-14 lg:py-16">
                <h2 className="text-xl sm:text-2xl font-semibold">Instant, Actionable Feedback</h2>

                <div className="mt-5 grid grid-cols-1 gap-4 sm:gap-5 md:gap-6 lg:grid-cols-[1.5fr_1fr]">
                    <div
                        className="rounded-xl border p-4 sm:p-5"
                        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
                    >
                        <h4 className="text-base sm:text-lg font-semibold">Sample Q&A</h4>
                        <p className="mt-2 text-[color:var(--text-dim)] text-sm sm:text-base">
                            Q: Design a rate limiter for a multi‑tenant API...
                        </p>
                        <p className="mt-2 text-sm sm:text-base">
                            A: I’d start by defining burst and sustained limits, then use a token bucket per tenant
                            with a shared store and local warm cache. I’d expose headers for remaining quota and
                            backoff hints...
                        </p>
                    </div>

                    <div
                        className="rounded-xl border p-4 sm:p-5"
                        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
                    >
                        <h4 className="text-base sm:text-lg font-semibold">Feedback</h4>
                        <Bar label="Problem Solving" value="86%" color="var(--mint)" />
                        <Bar label="Communication" value="78%" color="var(--indigo)" />
                        <Bar label="Impact" value="72%" color="var(--amber)" />
                    </div>
                </div>
            </section>


            {
                status !== 'authenticated' && (
                    <section className="container mx-auto px-4 sm:px-5 md:px-6 py-10 sm:py-12 md:py-14 lg:py-16">
                        <h2 className="text-xl sm:text-2xl font-semibold">Ready to Practice Smarter?</h2>
                        <p className="mt-2 max-w-[700px] text-[color:var(--text-dim)] text-sm sm:text-base">
                            Create a free account and run the first interview in minutes. No credit card required.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2 sm:gap-3">
                            <button
                                className="rounded-lg px-4 py-2.5 sm:px-5 sm:py-3 font-semibold text-[#0E1116]"
                                style={{ background: "linear-gradient(135deg, var(--indigo), var(--coral))" }}
                            >
                                <Link href='/login'>
                                    Create Account
                                </Link>
                            </button>
                        </div>
                    </section>
                )
            }

        </div>

    )
}

export default Home
