import { DemoForm } from "./demo-form";
import { InterviewFigure } from "./interview-figure";

/**
 * One line, one action, then the product doing its job. The primary action
 * is the sign-in itself, not a button that leads to one. The underline under
 * "own words" is hand-drawn and draws in once the text has settled.
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden pt-28 sm:pt-36">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] bg-[radial-gradient(60%_60%_at_50%_0%,var(--accent-soft),transparent_70%)]" />
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="site-rise text-4xl font-extrabold sm:text-5xl lg:text-[4.75rem] lg:leading-[1.04]">
            Testimonials in your customers’{" "}
            <span className="relative inline-block whitespace-nowrap">
              own words.
              <svg
                aria-hidden
                viewBox="0 0 300 24"
                preserveAspectRatio="none"
                className="absolute -bottom-2 left-0 h-[0.32em] w-full overflow-visible text-accent sm:-bottom-3"
              >
                <path
                  d="M4 16 C 60 4, 140 2, 296 12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="6"
                  strokeLinecap="round"
                  pathLength="1"
                  strokeDasharray="1"
                  strokeDashoffset="1"
                  data-draw
                  style={{ animation: "site-draw 700ms var(--ease-out-expo) 620ms forwards" }}
                />
              </svg>
            </span>
          </h1>
          <p className="site-rise mx-auto mt-6 max-w-2xl site-lede text-ink-2 [animation-delay:80ms]">
            A three-minute conversation instead of a blank box. Your customer approves every word and chooses how they’re named. You keep the quote, the consent and the proof.
          </p>
          <div className="site-rise mx-auto mt-8 max-w-xl [animation-delay:160ms]">
            <DemoForm size="lg" />
          </div>
        </div>
      </div>
      <div className="site-rise mt-14 px-5 sm:mt-20 sm:px-8 [animation-delay:240ms]">
        <InterviewFigure />
      </div>
    </section>
  );
}
