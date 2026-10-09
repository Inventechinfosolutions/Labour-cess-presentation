import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { gsap, scrollReveal, ScrollTrigger } from "@/animations/gsap"
import { LandingAppPreview } from "@/components/landing/LandingAppPreview"
import { LandingHelpCta } from "@/components/landing/LandingHelpCta"
import { LandingHeroSearch } from "@/components/landing/LandingHeroSearch"
import { LandingHeroVideoPanel } from "@/components/landing/LandingHeroVideoPanel"
import { LandingHostHeader } from "@/components/landing/LandingHostHeader"
import { LandingJoinSection } from "@/components/landing/LandingJoinSection"
import { LandingFooter } from "@/components/landing/LandingFooter"
import { LandingLocations } from "@/components/landing/LandingLocations"
import { LandingNotices } from "@/components/landing/LandingNotices"
import { LandingSecureSection } from "@/components/landing/LandingSecureSection"
import { AnimatedCounter } from "@/components/shared/AnimatedCounter"
import { useVideoSound } from "@/hooks/useVideoSound"
import { formatCurrency } from "@/utils/format"

const NIGHTLY_RATE = 1200

const stats = [
  { label: "Guest Houses", value: 4, suffix: "" },
  { label: "Total Rooms", value: 180, suffix: "+" },
  { label: "Active Bookings", value: 342, suffix: "" },
  { label: "Occupancy Rate", value: 76, suffix: "%" },
]

export function LandingPage() {
  const heroRef = useRef<HTMLElement>(null)
  const heroVideoWrapRef = useRef<HTMLDivElement>(null)
  const pageRef = useRef<HTMLDivElement>(null)
  const [nights, setNights] = useState(2)
  const [navScrolled, setNavScrolled] = useState(false)
  const { videoRef, isSoundOn, toggleSound } = useVideoSound()

  const stayTotal = nights * NIGHTLY_RATE
  const fillPercent = ((nights - 1) / 6) * 100

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    const ctx = gsap.context(() => {
      const heroEls = gsap.utils
        .toArray<HTMLElement>(".hero-el", pageRef.current)
        .filter((el) => el.offsetParent !== null)

      gsap.from(heroEls, {
        y: 32,
        opacity: 0,
        duration: 0.8,
        stagger: 0.08,
        ease: "power3.out",
      })

      scrollReveal(".join-header", pageRef.current)
      scrollReveal(".join-item", pageRef.current)
      scrollReveal(".secure-header", pageRef.current)
      scrollReveal(".secure-card", pageRef.current)
      scrollReveal(".secure-grid", pageRef.current)
      scrollReveal(".secure-features", pageRef.current)
      scrollReveal(".location-header", pageRef.current)
      scrollReveal(".location-item", pageRef.current)
      scrollReveal(".preview-header", pageRef.current)
      scrollReveal(".preview-showcase", pageRef.current)
      scrollReveal(".preview-card", pageRef.current)
      scrollReveal(".notice-header", pageRef.current)
      scrollReveal(".notice-item", pageRef.current)

      ScrollTrigger.matchMedia({
        "(min-width: 1024px)": () => {
          if (heroRef.current && heroVideoWrapRef.current) {
            gsap.to(heroVideoWrapRef.current, {
              y: -48,
              ease: "none",
              scrollTrigger: {
                trigger: heroRef.current,
                start: "top top",
                end: "bottom top",
                scrub: 1,
              },
            })
          }
        },
      })

      ScrollTrigger.refresh()
    }, pageRef)
    return () => ctx.revert()
  }, [])

  return (
    <div
      ref={pageRef}
      className="landing-airbnb-shell min-h-svh w-full max-w-[100vw] overflow-x-hidden bg-white text-[#222222]"
    >
      <LandingHostHeader scrolled={navScrolled} />

      <main>
        <section
          ref={heroRef}
          className="px-6 pb-16 pt-24 sm:px-10 sm:pb-20 sm:pt-28 lg:px-12 lg:pb-24"
          aria-label="Hero"
        >
          <div className="mx-auto grid max-w-[1280px] items-center gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-20">
            <div className="flex min-w-0 flex-col gap-5 lg:gap-6">
              <div className="hero-el">
                <h1 className="text-pretty text-[2.25rem] font-semibold leading-[1.06] tracking-[-0.03em] sm:text-[2.75rem] lg:text-[3.25rem]">
                  Your stay starts at{" "}
                  <span className="whitespace-nowrap">{formatCurrency(stayTotal)}</span>
                </h1>
                <p className="mt-3 text-base text-[#717171] sm:text-[17px]">
                  {nights} {nights === 1 ? "night" : "nights"} · {formatCurrency(NIGHTLY_RATE)}/night
                </p>
                <Link
                  to="#locations"
                  className="mt-2 inline-block text-sm font-medium text-[#222222] underline underline-offset-4"
                >
                  Learn how we estimate pricing
                </Link>
              </div>

              <div className="hero-el px-0.5">
                <input
                  type="range"
                  min={1}
                  max={7}
                  value={nights}
                  onChange={(e) => setNights(Number(e.target.value))}
                  style={{ ["--fill" as string]: fillPercent }}
                  className="landing-hero-nights-slider h-2 w-full max-w-md cursor-pointer appearance-none rounded-full"
                  aria-label="Number of nights"
                />
              </div>

              <div className="hero-el w-full max-w-lg">
                <LandingHeroSearch />
              </div>

              <div className="hero-el grid max-w-lg grid-cols-2 gap-x-6 gap-y-4 pt-2 sm:grid-cols-4 sm:gap-4 lg:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <p className="text-xl font-bold sm:text-2xl">
                      <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                    </p>
                    <p className="mt-0.5 text-xs text-[#717171] sm:text-sm">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div
              ref={heroVideoWrapRef}
              className="hero-el mx-auto w-full max-w-[34rem] will-change-transform lg:max-w-none"
            >
              <LandingHeroVideoPanel
                videoRef={videoRef}
                isSoundOn={isSoundOn}
                onToggleSound={toggleSound}
              />
            </div>
          </div>
        </section>

        <LandingJoinSection />
        <LandingSecureSection />
        <LandingLocations />
        <LandingAppPreview />
        <LandingNotices />
        <LandingHelpCta />
      </main>

      <LandingFooter />
    </div>
  )
}
