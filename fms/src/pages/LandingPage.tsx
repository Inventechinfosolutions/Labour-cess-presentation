import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link, useRouter } from '@/router';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { useTheme } from '@/components/theme/ThemeProvider';
import { useCoinSfx } from '@/lib/useCoinSfx';
import { fmsImages, local } from '@/lib/assets';
import {
  Volume2, VolumeX, Sparkles, ShieldCheck, CheckCircle2,
  ScrollText, UserCheck, Award, Landmark, Banknote, Coins,
  FileCheck2, ClipboardCheck, ArrowRight, Lock, Check,
  BarChart3,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export function LandingPage() {
  const { navigate } = useRouter();
  const { theme } = useTheme();
  const { enabled: sfxEnabled, setEnabled: setSfxEnabled } = useCoinSfx();

  const goLogin = () => {
    setTimeout(() => navigate('/login'), 220);
  };

  const rootRef = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const cursorRingRef = useRef<HTMLDivElement>(null);
  const scrollBarRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const heroBadgeRef = useRef<HTMLDivElement>(null);
  const heroCtasRef = useRef<HTMLDivElement>(null);
  const heroStatsRef = useRef<HTMLDivElement>(null);
  const sparkLineRef = useRef<SVGPathElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const footerWordRef = useRef<HTMLHeadingElement>(null);
  // New refs for redesigned sections
  const modulesSectionRef = useRef<HTMLDivElement>(null);
  const hflowsSectionRef = useRef<HTMLDivElement>(null);
  const hflowsTrackRef = useRef<HTMLDivElement>(null);
  // Console carousel
  const consoleSectionRef = useRef<HTMLElement>(null);
  const csvScreenRefs = useRef<Array<HTMLDivElement | null>>([]);
  const csvCapRefs = useRef<Array<HTMLDivElement | null>>([]);
  const csvProgressRef = useRef<HTMLSpanElement>(null);
  const [csvActive, setCsvActive] = useState(0);

  /* ===== Custom cursor + scroll bar + header tint + clock ===== */
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const dot = cursorDotRef.current;
    const ring = cursorRingRef.current;
    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let rx = mx, ry = my;
    const onMove = (e: MouseEvent) => { mx = e.clientX; my = e.clientY; };
    window.addEventListener('mousemove', onMove);
    const tick = () => {
      if (dot) gsap.set(dot, { x: mx, y: my });
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      if (ring) gsap.set(ring, { x: rx, y: ry });
    };
    gsap.ticker.add(tick);

    const hoverEnter = () => ring?.classList.add('is-hover');
    const hoverLeave = () => ring?.classList.remove('is-hover');
    const hoverEls = root.querySelectorAll<HTMLElement>('[data-cursor="hover"]');
    hoverEls.forEach((el) => {
      el.addEventListener('mouseenter', hoverEnter);
      el.addEventListener('mouseleave', hoverLeave);
    });

    const sb = scrollBarRef.current;
    const header = headerRef.current;
    const stProgress = ScrollTrigger.create({
      start: 0, end: 'max',
      onUpdate: (self) => {
        if (sb) sb.style.width = `${self.progress * 100}%`;
      },
    });
    const stHeader = ScrollTrigger.create({
      start: 80, end: 'max',
      onUpdate: (self) => {
        if (!header) return;
        if (self.progress > 0) {
          header.classList.remove('header-transparent');
          header.classList.add('header-glass');
        } else {
          header.classList.add('header-transparent');
          header.classList.remove('header-glass');
        }
      },
    });

    return () => {
      window.removeEventListener('mousemove', onMove);
      gsap.ticker.remove(tick);
      hoverEls.forEach((el) => {
        el.removeEventListener('mouseenter', hoverEnter);
        el.removeEventListener('mouseleave', hoverLeave);
      });
      stProgress.kill();
      stHeader.kill();
    };
  }, []);

  /* ===== Hero reveals + counters + parallax ===== */
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      root.classList.remove('mask-init');

      // Hero text reveal lines
      const heroLines = root.querySelectorAll<HTMLElement>('#hero .reveal-line > span');
      gsap.to(heroLines, { y: '0%', duration: 1.1, ease: 'power4.out', stagger: 0.08, delay: 0.2 });

      gsap.to(heroBadgeRef.current, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', delay: 0.05 });
      gsap.to(heroCtasRef.current, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', delay: 1.0 });
      gsap.to(heroStatsRef.current, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', delay: 1.15 });
      gsap.from(root.querySelectorAll<HTMLElement>('#hero .float-card'), {
        opacity: 0, y: 20, scale: 0.9, duration: 0.7, ease: 'back.out(1.6)', stagger: 0.15, delay: 1.4,
      });

      // Counters
      root.querySelectorAll<HTMLElement>('[data-counter]').forEach((el) => {
        const target = parseFloat(el.dataset.counter ?? '0');
        const isFloat = !Number.isInteger(target);
        const obj = { v: 0 };
        ScrollTrigger.create({
          trigger: el, start: 'top 90%', once: true,
          onEnter: () => {
            gsap.to(obj, {
              v: target, duration: 1.6, ease: 'power2.out',
              onUpdate: () => { el.textContent = isFloat ? obj.v.toFixed(1) : Math.round(obj.v).toString(); },
            });
          },
        });
      });

      // Parallax blobs + grid
      root.querySelectorAll<HTMLElement>('[data-parallax-speed]').forEach((el) => {
        const speed = parseFloat(el.dataset.parallaxSpeed ?? '0.3');
        gsap.to(el, {
          y: () => window.innerHeight * speed, ease: 'none',
          scrollTrigger: { trigger: el.closest('section'), start: 'top top', end: 'bottom top', scrub: true },
        });
      });
      root.querySelectorAll<HTMLElement>('[data-parallax-grid]').forEach((el) => {
        gsap.to(el, {
          y: () => window.innerHeight * 0.3, ease: 'none',
          scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true },
        });
      });

      // Hero video — scroll parallax (moves slower than foreground)
      const heroVideoWrap = root.querySelector<HTMLElement>('[data-hero-video-parallax]');
      if (heroVideoWrap) {
        gsap.to(heroVideoWrap, {
          y: () => window.innerHeight * 0.28,
          ease: 'none',
          scrollTrigger: {
            trigger: '#hero',
            start: 'top top',
            end: 'bottom top',
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });
      }

      // Marquee
      if (marqueeRef.current) {
        gsap.to(marqueeRef.current, { xPercent: -50, duration: 30, ease: 'none', repeat: -1 });
      }

      // ===== MODULES — STACKED CARDS =====
      const stkCards = gsap.utils.toArray<HTMLElement>('[data-stk-card]');
      const stkCounter = root.querySelector<HTMLElement>('[data-stk-now]');
      if (stkCards.length) {
        // Each card scales down + drifts back as the NEXT card slides over it
        stkCards.forEach((card, i) => {
          if (i === stkCards.length - 1) return;
          const next = stkCards[i + 1];
          const depth = 1 - (stkCards.length - 1 - i) * 0.012;
          gsap.fromTo(card,
            { scale: 1, y: 0 },
            {
              scale: depth,
              y: -28,
              ease: 'none',
              scrollTrigger: {
                trigger: next,
                start: 'top bottom',
                end: 'top top',
                scrub: 1,
              },
            },
          );
        });

        // Content reveal as each card sticks
        stkCards.forEach((card) => {
          const inner = card.querySelector('.stk-card-inner');
          if (!inner) return;
          gsap.from(inner.querySelectorAll<HTMLElement>('[data-stk-rise]'), {
            y: 36, opacity: 0, duration: 0.65, ease: 'power3.out', stagger: 0.06,
            scrollTrigger: { trigger: card, start: 'top 75%', once: true },
          });
        });

        // Active counter (01 / 07)
        if (stkCounter) {
          stkCards.forEach((card, i) => {
            ScrollTrigger.create({
              trigger: card,
              start: 'top 55%',
              end: 'bottom 45%',
              onEnter: () => { stkCounter.textContent = String(i + 1).padStart(2, '0'); },
              onEnterBack: () => { stkCounter.textContent = String(i + 1).padStart(2, '0'); },
            });
          });
        }
      }

      // Bento reveal
      gsap.utils.toArray<HTMLElement>('.bento-cell', root).forEach((cell, i) => {
        gsap.from(cell, {
          y: 50, opacity: 0, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: cell, start: 'top 88%', once: true },
          delay: (i % 4) * 0.05,
        });
      });

      // Sparkline draw
      if (sparkLineRef.current) {
        const path = sparkLineRef.current;
        const len = path.getTotalLength();
        path.style.strokeDasharray = `${len}`;
        path.style.strokeDashoffset = `${len}`;
        gsap.to(path, {
          strokeDashoffset: 0, ease: 'none',
          scrollTrigger: { trigger: path, start: 'top 80%', end: 'top 30%', scrub: true },
        });
      }

      // ===== WORKFLOW — HORIZONTAL SCROLLING GALLERY =====
      const hSec = hflowsSectionRef.current;
      const hTrack = hflowsTrackRef.current;
      if (hSec && hTrack) {
        const getDistance = () =>
          Math.max(0, hTrack.scrollWidth - window.innerWidth + 80);

        const tween = gsap.to(hTrack, {
          x: () => -getDistance(),
          ease: 'none',
          scrollTrigger: {
            trigger: hSec,
            start: 'top top',
            end: () => `+=${getDistance()}`,
            pin: true,
            scrub: 1,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        // Reveal each panel's stages as it slides into view
        hTrack.querySelectorAll<HTMLElement>('.hflow-card').forEach((panel) => {
          gsap.from(panel.querySelectorAll('.hflow-stage'), {
            y: 36, opacity: 0, duration: 0.55, ease: 'power3.out', stagger: 0.07,
            scrollTrigger: {
              trigger: panel,
              containerAnimation: tween,
              start: 'left 75%',
              toggleActions: 'play none none reverse',
            },
          });
          gsap.from(panel.querySelector('.hflow-head'), {
            y: 24, opacity: 0, duration: 0.6, ease: 'power3.out',
            scrollTrigger: {
              trigger: panel,
              containerAnimation: tween,
              start: 'left 80%',
              toggleActions: 'play none none reverse',
            },
          });
        });
      }

      // ===== CONSOLE — section entry animations =====
      const cSec = consoleSectionRef.current;
      if (cSec) {
        gsap.from(cSec.querySelectorAll<HTMLElement>('[data-csv-rise]'), {
          y: 32, opacity: 0, duration: 0.7, ease: 'power3.out', stagger: 0.07,
          scrollTrigger: { trigger: cSec, start: 'top 80%', once: true },
        });
        const frame = cSec.querySelector('.csv-frame');
        if (frame) {
          gsap.from(frame, {
            scale: 0.94, opacity: 0, duration: 1.0, ease: 'power3.out',
            scrollTrigger: { trigger: cSec, start: 'top 75%', once: true },
          });
        }
        gsap.from(cSec.querySelectorAll<HTMLElement>('.csv-thumb'), {
          y: 26, opacity: 0, duration: 0.55, ease: 'power3.out', stagger: 0.06,
          scrollTrigger: { trigger: cSec, start: 'top 70%', once: true },
        });
      }

      // Cursor-driven tilt cards
      root.querySelectorAll<HTMLElement>('[data-tilt]').forEach((card) => {
        const max = 8;
        let raf = 0;
        const onMove = (e: MouseEvent) => {
          const r = card.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width;
          const py = (e.clientY - r.top) / r.height;
          const tx = (py - 0.5) * -max * 2;
          const ty = (px - 0.5) * max * 2;
          card.style.setProperty('--mx', `${px * 100}%`);
          card.style.setProperty('--my', `${py * 100}%`);
          if (raf) cancelAnimationFrame(raf);
          raf = requestAnimationFrame(() => {
            card.style.transform = `perspective(900px) rotateX(${tx}deg) rotateY(${ty}deg) translateZ(0)`;
          });
        };
        const onLeave = () => { card.style.transform = 'perspective(900px) rotateX(0) rotateY(0)'; };
        card.addEventListener('mousemove', onMove);
        card.addEventListener('mouseleave', onLeave);
      });

      // Footer bounce
      if (footerWordRef.current) {
        gsap.from(footerWordRef.current, {
          yPercent: 60, opacity: 0, ease: 'elastic.out(1, 0.55)', duration: 1.6,
          scrollTrigger: { trigger: '#siteFooter', start: 'top 75%', once: true },
        });
      }

      // ===== CTA — static, no animation =====

      // Refresh on resize
      const onResize = () => ScrollTrigger.refresh();
      window.addEventListener('resize', onResize);
      return () => window.removeEventListener('resize', onResize);
    }, root);

    return () => ctx.revert();
  }, []);

  /* ===== Console carousel — initial hide ===== */
  useLayoutEffect(() => {
    csvScreenRefs.current.forEach((el, i) => {
      if (el) gsap.set(el, { autoAlpha: i === 0 ? 1 : 0 });
    });
    csvCapRefs.current.forEach((el, i) => {
      if (el) gsap.set(el, { autoAlpha: i === 0 ? 1 : 0, y: 0 });
    });
  }, []);

  /* ===== Console carousel — swap on active change ===== */
  useEffect(() => {
    csvScreenRefs.current.forEach((el, i) => {
      if (!el) return;
      if (i === csvActive) {
        gsap.fromTo(el,
          { autoAlpha: 0, scale: 1.04, y: 20 },
          { autoAlpha: 1, scale: 1, y: 0, duration: 0.7, ease: 'power3.out' });
      } else {
        gsap.to(el, { autoAlpha: 0, duration: 0.3, ease: 'power2.out' });
      }
    });
    csvCapRefs.current.forEach((el, i) => {
      if (!el) return;
      if (i === csvActive) {
        gsap.fromTo(el,
          { autoAlpha: 0, y: 18 },
          { autoAlpha: 1, y: 0, duration: 0.55, ease: 'power3.out', delay: 0.08 });
      } else {
        gsap.to(el, { autoAlpha: 0, duration: 0.25, ease: 'power2.out' });
      }
    });
  }, [csvActive]);

  /* ===== Console carousel — auto-advance + progress ===== */
  useEffect(() => {
    const fill = csvProgressRef.current;
    if (!fill) return;
    const tween = gsap.fromTo(fill,
      { scaleX: 0 },
      {
        scaleX: 1,
        duration: 5.5,
        ease: 'none',
        onComplete: () => {
          setCsvActive((a) => (a + 1) % consoleTiles.length);
        },
      });
    return () => { tween.kill(); };
  }, [csvActive]);

  // Smooth-scroll for #anchors inside the landing
  const handleAnchor = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  void theme; // re-render hook on theme flip
  void scrollBarRef;

  return (
    <div ref={rootRef} className="landing mask-init relative">
      {/* Custom cursor */}
      <div ref={cursorRingRef} className="l-cursor-ring" />
      <div ref={cursorDotRef} className="l-cursor-dot" />

      {/* Scroll progress bar */}
      <div ref={scrollBarRef} className="scroll-bar" />

      {/* Header */}
      <header ref={headerRef} id="siteHeader" className="fixed inset-x-0 top-0 z-50 transition-all duration-500 header-transparent">
        <div className="container mx-auto px-6 lg:px-10 py-2.5 flex items-center justify-between">
          <a href="#" className="flex items-center gap-3 group" data-cursor="hover">
            <div className="w-9 h-9 rounded-lg bg-primary grid place-items-center text-primary-foreground font-display font-extrabold text-lg shadow-lg shadow-[0_8px_28px_-8px_color-mix(in_oklch,var(--primary)_45%,transparent)] group-hover:rotate-6 transition">R</div>
            <div className="leading-tight">
              <p className="font-display font-bold tracking-wide text-base text-white">RGUHS <span className="text-[color-mix(in_oklch,white_78%,var(--primary))]">FMS</span></p>
              <p className="text-[9px] uppercase tracking-[0.18em] text-white/75">Finance Management System</p>
            </div>
          </a>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-white">
            <a href="#modules" data-cursor="hover" onClick={(e) => handleAnchor(e, '#modules')} className="text-white hover:text-[color-mix(in_oklch,white_82%,var(--primary))] transition">Modules</a>
            <a href="#workflow" data-cursor="hover" onClick={(e) => handleAnchor(e, '#workflow')} className="text-white hover:text-[color-mix(in_oklch,white_82%,var(--primary))] transition">Workflow</a>
            <a href="#security" data-cursor="hover" onClick={(e) => handleAnchor(e, '#security')} className="text-white hover:text-[color-mix(in_oklch,white_82%,var(--primary))] transition">Security</a>
            <a href="#integrations" data-cursor="hover" onClick={(e) => handleAnchor(e, '#integrations')} className="text-white hover:text-[color-mix(in_oklch,white_82%,var(--primary))] transition">Integrations</a>
          </nav>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setSfxEnabled(!sfxEnabled); }}
              aria-label={sfxEnabled ? 'Mute sound effects' : 'Enable sound effects'}
              data-cursor="hover"
              className="h-8 w-8 rounded-lg grid place-items-center text-default border border-app glass hover:bg-soft transition"
              title={sfxEnabled ? 'Sound effects on — click to mute' : 'Sound effects muted'}
            >
              {sfxEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4 opacity-60" />}
            </button>
            <ThemeToggle />
            <button
              onClick={goLogin}
              data-cursor="hover"
              className="btn-premium text-sm py-2 px-4.5"
            >
              Secure Login
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </button>
          </div>
        </div>
      </header>

      <main>

        {/* ============== HERO ============== */}
        <section id="hero" className="relative min-h-screen flex items-end overflow-hidden pt-28 pb-16 lg:pb-20">
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <div
              className="hero-video-parallax absolute -inset-[12%] min-h-[124%] z-0 will-change-transform"
              data-hero-video-parallax
            >
              <video
                className="absolute inset-0 h-full w-full object-cover brightness-[1.02] contrast-[1.1] saturate-[1.08]"
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
              >
                <source src={local('videos/hero-finance.mp4')} type="video/mp4" />
              </video>
            </div>
          </div>
          <div className="absolute inset-0 z-[1] bg-gradient-to-br from-slate-950/34 via-slate-900/20 to-slate-950/38" />
          <div className="hero-bg opacity-65" />
          <div className="blob" data-parallax-speed="0.3" style={{ top: '-10%', left: '-8%', width: 520, height: 520, background: 'color-mix(in oklch, var(--primary) 95%, transparent)', zIndex: 2 }} />
          <div className="blob" data-parallax-speed="0.5" style={{ top: '30%', right: '-15%', width: 600, height: 600, background: 'color-mix(in oklch, var(--primary) 75%, transparent)', zIndex: 2 }} />
          <div className="absolute inset-0 l-bg-grid opacity-20 z-[2]" data-parallax-grid />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] h-[min(56vh,500px)] bg-gradient-to-t from-slate-950/58 via-slate-950/26 to-transparent" />

          <div className="container mx-auto px-6 lg:px-10 relative z-10">
            <div className="flex min-h-[72vh] items-end pb-4 lg:pb-8">
              <div className="flex w-full flex-col gap-8 md:flex-row md:items-end md:justify-between">
                <div className="w-full md:max-w-[46rem]">
                  <div ref={heroBadgeRef} className="inline-flex w-[min(92vw,980px)] items-center justify-center gap-3 rounded-xl bg-white/82 px-5 py-2.5 text-xs font-medium text-slate-700 absolute top-[-2rem] left-0 right-0 mx-auto mb-0 z-20 backdrop-blur-sm" style={{ opacity: 0 }}>
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 animate-ping" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
                  </span>
                  <span className="uppercase tracking-[0.14em]">StubLite Finance</span>
                  <span className="text-slate-400">|</span>
                  <span className="font-mono text-[11px] text-slate-500">v2.1.0 · Build 492</span>
                </div>

                  <h1 className="text-5xl md:text-6xl lg:text-[4.35rem] font-display font-extrabold tracking-[-0.03em] leading-[1.02] text-white max-w-[16ch]">
                    <span className="reveal-line"><span className="text-white">Finance, fully governed.</span></span>
                    <span className="reveal-line"><span className="text-white">Every rupee tracked.</span></span>
                  </h1>
                </div>

                <div ref={heroCtasRef} className="flex w-full md:w-auto md:justify-end" style={{ opacity: 0 }}>
                  <div className="mt-2 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
                    <button onClick={goLogin} className="btn-premium text-base rounded-full px-8" data-cursor="hover">
                      Login to Portal
                      <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                    </button>
                    <a href="#modules" onClick={(e) => handleAnchor(e, '#modules')} className="btn-ghost text-base rounded-full px-7" data-cursor="hover">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      Watch the Tour
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-subtle z-10">
            <span className="text-[10px] tracking-[0.3em] uppercase font-medium">Scroll</span>
            <span className="w-px h-10 bg-gradient-to-b from-current to-transparent" />
          </div>
        </section>

        {/* ============== MARQUEE ============== */}
        <section className="relative py-10 border-y border-app bg-page overflow-hidden">
          <div ref={marqueeRef} className="marquee-track">
            <span className="text-2xl font-display font-medium text-subtle flex items-center gap-16">
              {Array.from({ length: 2 }).flatMap((_, dup) =>
                ['RGUHS Karnataka', 'SBI ePay', 'BillDesk', 'Razorpay', 'Banking H2H', 'HRMS Sync', 'Tally Bridge'].map((t) => (
                  <span key={`${dup}-${t}`} className="flex items-center gap-16">
                    <span>{t}</span>
                    <span className="text-primary">●</span>
                  </span>
                )),
              )}
            </span>
          </div>
        </section>

        {/* ============== MODULES — STACKED CARDS ============== */}
        <section id="modules" ref={modulesSectionRef} className="stk-section relative bg-page border-t border-app">
          <div className="container mx-auto px-6 lg:px-10 pt-32">
            <div className="grid grid-cols-12 gap-x-10 gap-y-6 mb-16">
              <div className="col-span-12 md:col-span-7">
                <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-primary mb-3">01 — System Modules</p>
                <h2 className="text-4xl md:text-6xl font-display font-bold tracking-tight">Built for every <br />finance function.</h2>
              </div>
              <div className="col-span-12 md:col-span-5 md:pt-10">
                <p className="text-muted font-light leading-relaxed">Seven modular pillars — one platform. Each module operates standalone yet unifies through a single ledger and audit spine. Scroll to deal through the stack.</p>
                <div className="mt-6 flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.32em] text-subtle">
                  <span>
                    <span className="text-default font-semibold" data-stk-now>01</span>
                    <span className="opacity-60"> / 07</span>
                  </span>
                  <span className="flex-1 h-px" style={{ background: 'var(--lborder)' }} />
                  <span>One Ledger</span>
                </div>
              </div>
            </div>
          </div>

          <div className="container mx-auto px-6 lg:px-10 stk-cards">
            {moduleCards.map((m, i) => {
              const Icon = m.Icon;
              return (
                <article
                  key={m.id}
                  className="stk-card"
                  data-stk-card={i}
                  style={{
                    ['--accent' as string]: m.color,
                    ['--idx' as string]: i,
                  } as React.CSSProperties}
                >
                  <div className={`stk-card-inner${m.image ? '' : ' stk-card-inner--no-visual'}`}>
                    <div className="stk-card-text">
                      <div className="stk-card-meta" data-stk-rise>
                        <span className="stk-card-id font-mono">{m.id}</span>
                        <span className="stk-card-sep" />
                        <span className="stk-card-tag font-mono">{m.tag}</span>
                      </div>
                      <div className="stk-card-icon" data-stk-rise>
                        <Icon className="h-7 w-7" />
                      </div>
                      <h3 className="stk-card-title font-display font-bold tracking-tight" data-stk-rise>
                        {m.title}
                      </h3>
                      <p className="stk-card-desc text-muted leading-relaxed" data-stk-rise>
                        {m.desc}
                      </p>
                      <ul className="stk-card-bullets" data-stk-rise>
                        {m.bullets.map((b) => (
                          <li key={b}>
                            <span className="stk-card-check"><Check className="h-3.5 w-3.5" /></span>
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    {m.image ? (
                      <div className="stk-card-visual">
                        <img src={m.image} alt="" loading="lazy" className="stk-card-img" />
                        <span className="stk-card-shade" />
                        <span className="stk-card-bignum font-display">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span className="stk-card-corner" aria-hidden />
                      </div>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* ============== SCRUBBED BENTO ============== */}
        <section className="relative bg-page py-32 border-t border-app">
          <div className="container mx-auto px-6 lg:px-10">
            <div className="max-w-3xl mb-16">
              <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-primary mb-3">02 — Live Operations</p>
              <h2 className="text-4xl md:text-6xl font-display font-bold tracking-tight leading-[1.05]">A control room for university finance.</h2>
              <p className="mt-6 text-muted text-lg font-light leading-relaxed">Every metric, every approval, every reconciliation — synchronized to a single source of truth and visualized in real time.</p>
            </div>

            <div className="grid grid-cols-12 gap-5 auto-rows-[140px]">
              {/* Revenue */}
              <div className="bento-cell tilt-card col-span-12 md:col-span-7 row-span-3 p-8 flex flex-col justify-between" data-tilt>
                <div>
                  <p className="font-mono text-xs text-subtle uppercase tracking-wider">Total Receipts · FY 2026</p>
                  <p className="mt-3 font-display text-6xl md:text-7xl font-extrabold tracking-tight">₹84.2<span className="text-primary">Cr</span></p>
                  <p className="mt-3 text-primary text-sm font-semibold flex items-center gap-2">▲ 18.4% vs FY25 · ₹13.1Cr ahead of target</p>
                </div>
                <svg viewBox="0 0 600 120" className="w-full h-32 mt-6">
                  <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0,90 C60,60 100,80 160,55 C220,30 280,70 340,45 C400,20 460,50 520,25 L600,15 L600,120 L0,120 Z" fill="url(#g1)" />
                  <path ref={sparkLineRef} d="M0,90 C60,60 100,80 160,55 C220,30 280,70 340,45 C400,20 460,50 520,25 L600,15" stroke="var(--primary)" strokeWidth="2.5" fill="none" />
                </svg>
                <div className="tilt-glow" />
              </div>

              <div className="bento-cell tilt-card col-span-12 md:col-span-5 row-span-3 p-8 flex flex-col justify-between" data-tilt style={{ background: 'linear-gradient(135deg, color-mix(in oklch, var(--primary) 14%, transparent), color-mix(in oklch, var(--primary) 4%, transparent))' }}>
                <div>
                  <div className="flex items-center justify-between">
                    <p className="font-mono text-xs text-primary uppercase tracking-wider">Pending Approvals</p>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-primary/12 text-primary border border-primary/25">SLA</span>
                  </div>
                  <p className="mt-3 font-display text-6xl md:text-7xl font-extrabold tracking-tight">34</p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm"><span className="text-muted">Bills · TA / DA</span><span className="font-semibold">12</span></div>
                  <div className="flex items-center justify-between text-sm"><span className="text-muted">Vendor invoices</span><span className="font-semibold">15</span></div>
                  <div className="flex items-center justify-between text-sm"><span className="text-muted">Remuneration</span><span className="font-semibold">7</span></div>
                </div>
                <div className="tilt-glow" />
              </div>

              <div className="bento-cell tilt-card col-span-6 md:col-span-4 row-span-2 p-6" data-tilt>
                <p className="font-mono text-xs text-subtle uppercase tracking-wider">Bank Recon</p>
                <p className="mt-2 font-display text-3xl font-bold">99.4%</p>
                <p className="mt-1 text-xs text-muted">3 banks · auto-matched today</p>
                <div className="mt-4 flex gap-2 items-end h-12">
                  {[55, 75, 40, 85, 65, 90, 78].map((h, i) => (
                    <div key={i} className="w-2 bg-primary rounded-sm" style={{ height: `${h}%` }} />
                  ))}
                </div>
                <div className="tilt-glow" />
              </div>

              <div className="bento-cell tilt-card col-span-6 md:col-span-4 row-span-2 p-6" data-tilt>
                <p className="font-mono text-xs text-subtle uppercase tracking-wider">Active Users · Now</p>
                <p className="mt-2 font-display text-3xl font-bold">2,184</p>
                <p className="mt-1 text-xs text-primary">▲ 11% peak hour</p>
                <div className="mt-4 flex -space-x-2">
                  {['opacity-100', 'opacity-90', 'opacity-75', 'opacity-60'].map((op, gi) => (
                    <div key={gi} className={`w-7 h-7 rounded-full bg-primary border-2 ${op}`} style={{ borderColor: 'var(--lbg-elev)' }} />
                  ))}
                  <div className="w-7 h-7 rounded-full bg-soft border-2 grid place-items-center text-[10px] font-bold text-muted" style={{ borderColor: 'var(--lbg-elev)' }}>+99</div>
                </div>
                <div className="tilt-glow" />
              </div>

              <div className="bento-cell tilt-card col-span-12 md:col-span-4 row-span-2 p-6" data-tilt>
                <p className="font-mono text-xs text-subtle uppercase tracking-wider">Audit Trail · 24h</p>
                <p className="mt-2 font-display text-3xl font-bold">14,392</p>
                <p className="mt-1 text-xs text-muted">events · 0 tamper alerts</p>
                <div className="mt-4 grid grid-cols-12 gap-1">
                  {[70, 60, 80, 40, 90, 70, 55, 70, 85, 65, 80, 95].map((o, i) => (
                    <span key={i} className="h-2 rounded-sm bg-primary" style={{ opacity: o / 100 }} />
                  ))}
                </div>
                <div className="tilt-glow" />
              </div>

              <div className="bento-cell tilt-card col-span-12 md:col-span-8 row-span-3 p-8" data-tilt style={{ background: 'linear-gradient(135deg, color-mix(in oklch, var(--primary) 10%, transparent), color-mix(in oklch, var(--primary) 3%, transparent))' }}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-mono text-xs text-subtle uppercase tracking-wider">Receipts vs Payments · 12 mo</p>
                    <p className="mt-1 font-display text-2xl font-semibold">Cash flow alignment <span className="text-primary">+₹21.4Cr</span></p>
                  </div>
                  <div className="flex gap-3 text-xs font-medium">
                    <span className="flex items-center gap-1.5 text-muted"><span className="w-2 h-2 rounded-full bg-primary" />Receipts</span>
                    <span className="flex items-center gap-1.5 text-muted"><span className="w-2 h-2 rounded-full bg-muted-foreground" />Payments</span>
                  </div>
                </div>
                <svg viewBox="0 0 800 220" className="w-full h-48 mt-4">
                  <path d="M0,180 L60,160 L120,170 L180,140 L240,150 L300,110 L360,130 L420,90 L480,100 L540,70 L600,80 L660,55 L720,65 L800,40" stroke="var(--primary)" strokeWidth="2.5" fill="none" />
                  <path d="M0,200 L60,190 L120,180 L180,185 L240,165 L300,170 L360,145 L420,150 L480,135 L540,140 L600,125 L660,130 L720,115 L800,120" stroke="var(--muted-foreground)" strokeWidth="2.5" fill="none" />
                </svg>
                <div className="tilt-glow" />
              </div>

              <div className="bento-cell tilt-card col-span-12 md:col-span-4 row-span-3 p-6" data-tilt style={{ background: 'linear-gradient(135deg, color-mix(in oklch, var(--primary) 8%, transparent), color-mix(in oklch, var(--primary) 2%, transparent))' }}>
                <div className="flex items-center justify-between">
                  <p className="font-mono text-xs text-subtle uppercase tracking-wider">System Status</p>
                  <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-primary"><span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />Operational</span>
                </div>
                <div className="mt-6 space-y-4">
                  {[
                    ['API · core', '99.99%', 'ok'],
                    ['Banking H2H', '99.97%', 'ok'],
                    ['Payment gateway', '100.0%', 'ok'],
                    ['HRMS sync', '99.21%', 'warn'],
                    ['Audit log', '100.0%', 'ok'],
                  ].map(([k, v, t]) => (
                    <div key={k} className="flex justify-between items-center text-sm">
                      <span className="text-muted">{k}</span>
                      <span className={`font-mono ${t === 'warn' ? 'text-muted-foreground' : 'text-primary'}`}>{v}</span>
                    </div>
                  ))}
                </div>
                <div className="tilt-glow" />
              </div>
            </div>
          </div>
        </section>

        {/* ============== WORKFLOW — HORIZONTAL SCROLLING GALLERY ============== */}
        <section
          id="workflow"
          ref={hflowsSectionRef}
          className="hflows-section relative gov-paper gov-paper-grain border-t border-app overflow-hidden"
        >
          <div className="hflows-viewport">
            <div className="hflows-track" ref={hflowsTrackRef}>
              {/* Intro panel */}
              <article className="hflow-card hflow-intro">
                <div className="hflow-intro-inner">
                  <p className="font-mono text-[11px] uppercase tracking-[0.3em] mb-3 text-primary">
                    03 — Process Integrity
                  </p>
                  <h2 className="text-5xl md:text-7xl font-display font-bold tracking-tight leading-[1.02]">
                    Three vouchers.<br />
                    One <span className="text-primary">ironclad</span> spine.
                  </h2>
                  <p className="mt-7 text-muted text-lg font-light leading-relaxed max-w-md">
                    Bills, budgets and receipts each follow a defined, role-segregated path —
                    no bypass, no backdating. Scroll to scrub through each lane.
                  </p>
                  <div className="mt-8 flex flex-wrap gap-3 text-xs font-mono uppercase tracking-widest">
                    <span className="hflow-pill" style={{ ['--c' as string]: 'var(--primary)' }}>Money Out · Bill</span>
                    <span className="hflow-pill" style={{ ['--c' as string]: 'color-mix(in oklch, var(--primary) 85%, white)' }}>Allocation · Budget</span>
                    <span className="hflow-pill" style={{ ['--c' as string]: 'color-mix(in oklch, var(--primary) 70%, var(--foreground))' }}>Money In · Receipt</span>
                  </div>
                  <p className="hflow-hint font-mono">
                    <span>SCROLL</span>
                    <span className="hflow-arrow">→</span>
                  </p>
                </div>
              </article>

              {/* One panel per flow */}
              {flows.map((f, idx) => {
                const FlowIcon = f.Icon;
                return (
                  <article
                    key={f.key}
                    className="hflow-card"
                    style={{ ['--flow-color' as string]: f.color }}
                  >
                    <header className="hflow-head">
                      <span className="hflow-num font-mono">0{idx + 1}</span>
                      <span className="hflow-icon"><FlowIcon className="h-5 w-5" /></span>
                      <div>
                        <h3 className="hflow-title font-display font-bold">{f.label}</h3>
                        <p className="hflow-sub text-muted">{f.sub}</p>
                      </div>
                      <span className="hflow-tag font-mono">{f.tag}</span>
                    </header>

                    <ol className="hflow-stages">
                      {f.stages.map((s, i) => {
                        const StageIcon = s.Icon;
                        return (
                          <li key={s.name} className="hflow-stage">
                            <span className="hflow-stage-orb"><StageIcon className="h-[18px] w-[18px]" /></span>
                            <span className="hflow-stage-num font-mono">{String(i + 1).padStart(2, '0')}</span>
                            <span className="hflow-stage-name">{s.name}</span>
                            <span className="hflow-stage-sub">{s.sub}</span>
                          </li>
                        );
                      })}
                    </ol>

                    <footer className="hflow-foot">
                      <ShieldCheck className="h-4 w-4" />
                      <span>Audit spine · SHA-256 hash-chain · digital signature at every transition</span>
                    </footer>
                  </article>
                );
              })}

              {/* Closing panel */}
              <article className="hflow-card hflow-outro">
                <div className="hflow-outro-inner">
                  <ShieldCheck className="h-10 w-10 mb-5 text-primary" />
                  <h3 className="text-3xl md:text-4xl font-display font-bold tracking-tight">
                    Same spine.<br />Every voucher.<br />Every time.
                  </h3>
                  <p className="mt-5 text-muted leading-relaxed max-w-sm">
                    Hash-chained, tamper-evident logs across all three flows.
                    Read-only auditor view ships day one.
                  </p>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* ============== INSIDE THE CONSOLE — GSAP CAROUSEL ============== */}
        <section
          id="console"
          ref={consoleSectionRef}
          className="csv-section relative bg-page border-t border-app py-32"
        >
          <div className="container mx-auto px-6 lg:px-10">
            <header className="csv-head">
              <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-primary mb-3" data-csv-rise>
                04 — Inside The Console
              </p>
              <div className="grid lg:grid-cols-12 gap-x-10 gap-y-4 items-end">
                <h2 className="lg:col-span-7 text-4xl md:text-6xl font-display font-bold tracking-tight leading-[1.05]" data-csv-rise>
                  Designed for daily use.<br />Built for board reviews.
                </h2>
                <p className="lg:col-span-5 text-muted text-lg font-light leading-relaxed" data-csv-rise>
                  A scrubbed glimpse into the actual product — click any screen below to drill in.
                </p>
              </div>
            </header>

            <div className="csv-stage">
              {/* Browser-frame mockup */}
              <div className="csv-frame">
                <div className="csv-frame-bar">
                  <span className="csv-dot csv-dot-r" />
                  <span className="csv-dot csv-dot-y" />
                  <span className="csv-dot csv-dot-g" />
                  <span className="csv-url font-mono">rguhs-fms.gov.in / console / {consoleTiles[csvActive]?.tag.toLowerCase().replace(/\s+/g, '-')}</span>
                  <span className="csv-frame-live">
                    <span className="csv-frame-live-dot" />LIVE
                  </span>
                </div>
                <div className="csv-frame-body">
                  {consoleTiles.map((t, i) => (
                    <div
                      key={t.id}
                      ref={(el) => { csvScreenRefs.current[i] = el; }}
                      className="csv-screen"
                    >
                      <img src={t.img} alt={t.title} loading={i < 2 ? 'eager' : 'lazy'} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Caption stack */}
              <aside className="csv-cap-stack">
                <div className="csv-cap-meter">
                  <span className="font-mono text-[11px] tracking-[0.3em] uppercase text-primary">
                    {String(csvActive + 1).padStart(2, '0')}
                    <span className="text-subtle"> / 07</span>
                  </span>
                  <span className="csv-cap-bar">
                    <span ref={csvProgressRef} className="csv-cap-bar-fill" />
                  </span>
                </div>

                <div className="csv-cap-frames">
                  {consoleTiles.map((t, i) => (
                    <div
                      key={t.id}
                      ref={(el) => { csvCapRefs.current[i] = el; }}
                      className="csv-cap"
                      aria-hidden={i !== csvActive}
                    >
                      <span className="csv-cap-tag font-mono">
                        <Sparkles className="h-3 w-3" />
                        {t.tag}
                      </span>
                      <h3 className="csv-cap-title font-display font-bold tracking-tight">{t.title}</h3>
                      <p className="csv-cap-desc text-muted leading-relaxed">{consoleCopy[t.id]?.desc}</p>
                      <ul className="csv-cap-marks">
                        {(consoleCopy[t.id]?.marks ?? []).map((m) => (
                          <li key={m}>
                            <span className="csv-mark-icon"><Check className="h-3.5 w-3.5" /></span>
                            <span>{m}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                <div className="csv-cap-nav">
                  <button
                    type="button"
                    onClick={() => setCsvActive((a) => (a - 1 + consoleTiles.length) % consoleTiles.length)}
                    className="csv-nav-btn"
                    aria-label="Previous screen"
                  >
                    <ArrowRight className="h-4 w-4 csv-nav-arrow-l" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setCsvActive((a) => (a + 1) % consoleTiles.length)}
                    className="csv-nav-btn"
                    aria-label="Next screen"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </aside>
            </div>

            {/* Thumbnail rail */}
            <ul className="csv-thumbs">
              {consoleTiles.map((t, i) => (
                <li
                  key={t.id}
                  className={`csv-thumb ${i === csvActive ? 'is-active' : ''}`}
                >
                  <button
                    type="button"
                    onClick={() => setCsvActive(i)}
                    aria-label={`Show ${t.title}`}
                  >
                    <img src={t.img} alt="" loading="lazy" />
                    <span className="csv-thumb-fade" />
                    <span className="csv-thumb-meta font-mono">
                      <span className="csv-thumb-num">{String(i + 1).padStart(2, '0')}</span>
                      <span className="csv-thumb-tag">{t.tag}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ============== SECURITY ============== */}
        <section id="security" className="relative bg-soft py-32 border-t border-app overflow-hidden">
          <div className="absolute inset-0 l-bg-grid opacity-50 pointer-events-none" />
          <div className="container mx-auto px-6 lg:px-10 relative">
            <div className="grid lg:grid-cols-2 gap-12 items-end mb-16">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-primary mb-3">05 — Bank-Grade Architecture</p>
                <h2 className="text-4xl md:text-6xl font-display font-bold tracking-tight leading-[1.05]">Built like a <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/75">vault</span>. Reads like a ledger.</h2>
              </div>
              <p className="text-muted text-lg font-light leading-relaxed">Financial integrity is non-negotiable. Non-repudiation, immutable records and stringent access controls — applied to every action by every user.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: '🔒', title: 'RBAC Architecture', desc: 'Strict role-based access — users see and act only on what their role permits. Inherited from official org-charts.', tone: 'blue' },
                { icon: '📜', title: 'Immutable Audit Trail', desc: 'Every action, IP and timestamp logged permanently. Hash-chained — no edit, no delete.', tone: 'violet' },
                { icon: '🔐', title: 'End-to-end Encryption', desc: 'AES-256 at rest, TLS 1.3 in transit. Field-level encryption for PII and bank credentials.', tone: 'emerald' },
                { icon: '📅', title: 'Period & Year Locks', desc: 'Day-end and year-end closures prevent backdated entries — mathematically, not by policy.', tone: 'amber' },
              ].map((s) => (
                <article key={s.title} className="tilt-card relative rounded-3xl card-elev p-8 h-72" data-tilt>
                  <div className="tilt-inner">
                    <div className="w-12 h-12 rounded-xl grid place-items-center text-xl border bg-primary/10 border-primary/25 text-primary">{s.icon}</div>
                    <h4 className="mt-6 text-xl font-display font-bold">{s.title}</h4>
                    <p className="mt-3 text-sm text-muted leading-relaxed">{s.desc}</p>
                  </div>
                  <div className="tilt-glow" />
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ============== INTEGRATIONS ============== */}
        <section id="integrations" className="relative bg-page py-32 border-t border-app overflow-hidden">
          <div className="container mx-auto px-6 lg:px-10">
            <div className="grid lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-5">
                <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-primary mb-3">06 — Live Integrations</p>
                <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight leading-[1.1]">Plugged into the rails that move money.</h2>
                <p className="mt-6 text-muted text-lg font-light leading-relaxed">SBI ePay · BillDesk · Razorpay · Banking H2H · HRMS · Tally — synced via secure webhooks and FTPS endpoints, monitored 24×7.</p>
                <button onClick={goLogin} className="btn-premium mt-10" data-cursor="hover">
                  Open The Console
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                </button>
              </div>
              <div className="lg:col-span-7 space-y-4">
                {[
                  { title: 'Payment Gateways', sub: 'SBI ePay, BillDesk, Razorpay · webhook-secured', tone: 'emerald', tag: 'ACTIVE', anim: true },
                  { title: 'Banking APIs (H2H)', sub: 'SBI · Canara · HDFC · direct FTPS auto-recon', tone: 'emerald', tag: 'ACTIVE', anim: true },
                  { title: 'HRMS / Payroll', sub: 'Salary sync · automated journal posting', tone: 'blue', tag: 'CONNECTED', anim: false },
                  { title: 'Tally Bridge', sub: 'Two-way ledger export · audit reconciliation', tone: 'blue', tag: 'CONNECTED', anim: false },
                ].map((it) => (
                  <div key={it.title} className="card-elev rounded-2xl p-6 flex items-center justify-between tilt-card" data-tilt>
                    <div>
                      <p className="font-bold">{it.title}</p>
                      <p className="text-muted text-sm mt-1">{it.sub}</p>
                    </div>
                    <span className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full text-primary bg-primary/10 border border-primary/20`}>
                      <span className={`w-1.5 h-1.5 rounded-full bg-primary ${it.anim ? 'animate-pulse' : ''}`} />
                      {it.tag}
                    </span>
                    <div className="tilt-glow" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ============== CTA — STATIC (no animation) ============== */}
        <section id="cta" className="relative bg-page py-32 overflow-hidden border-t border-app">
          <div className="container mx-auto px-6 lg:px-10 text-center relative">
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-primary mb-4">
              Authorized Personnel Only
            </p>
            <h2 className="text-5xl md:text-7xl font-display font-extrabold tracking-[-0.02em] leading-[1.0]">
              Ready when{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary to-primary/72">
                you are.
              </span>
            </h2>
            <p className="mt-6 max-w-xl mx-auto text-lg text-muted font-light">
              Sign in with your authorized RGUHS credentials to access the live finance console.
            </p>
            <div className="mt-10">
              <button onClick={goLogin} className="btn-premium text-base">
                <Lock className="w-4 h-4 mr-2" />
                Login to Portal
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* ============== FOOTER ============== */}
      <footer id="siteFooter" className="bg-soft border-t border-app pt-20 pb-10">
        <div className="container mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-12">
            <div className="md:col-span-5">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-lg bg-primary grid place-items-center text-primary-foreground font-display font-bold shadow-[0_8px_24px_-8px_color-mix(in_oklch,var(--primary)_40%,transparent)]">R</div>
                <h2 className="text-xl font-display font-bold">RGUHS FMS</h2>
              </div>
              <p className="text-muted text-sm max-w-sm leading-relaxed font-light">Rajiv Gandhi University of Health Sciences, Karnataka. Official Finance Management System powering institutional growth.</p>
              <div className="flex gap-3 mt-6">
                <a href="#" data-cursor="hover" className="w-10 h-10 rounded-full glass grid place-items-center text-muted hover:text-primary transition">✉</a>
                <a href="#" data-cursor="hover" className="w-10 h-10 rounded-full glass grid place-items-center text-muted hover:text-primary transition">☎</a>
              </div>
            </div>
            <div className="md:col-span-3">
              <h3 className="font-display font-bold mb-5 uppercase tracking-wider text-xs">Quick Links</h3>
              <ul className="space-y-3 text-sm text-muted">
                <li><Link to="/login" className="hover:text-primary transition">Secure Login</Link></li>
                <li><a href="#modules" data-cursor="hover" onClick={(e) => handleAnchor(e, '#modules')} className="hover:text-primary transition">Modules</a></li>
                <li><a href="#workflow" data-cursor="hover" onClick={(e) => handleAnchor(e, '#workflow')} className="hover:text-primary transition">Workflow</a></li>
                <li><a href="#" data-cursor="hover" className="hover:text-primary transition">Raise Support Ticket</a></li>
              </ul>
            </div>
            <div className="md:col-span-4">
              <h3 className="font-display font-bold mb-5 uppercase tracking-wider text-xs">Legal &amp; Security</h3>
              <ul className="space-y-3 text-sm text-muted">
                <li><a href="#" data-cursor="hover" className="hover:text-primary transition">Privacy Policy</a></li>
                <li><a href="#" data-cursor="hover" className="hover:text-primary transition">Terms of Use</a></li>
                <li><a href="#" data-cursor="hover" className="hover:text-primary transition">Security Policy</a></li>
                <li><a href="#" data-cursor="hover" className="hover:text-primary transition">Audit Certificates</a></li>
              </ul>
            </div>
          </div>

          <div className="overflow-hidden border-t border-app pt-12">
            <h2 ref={footerWordRef} className="text-[20vw] leading-none font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-transparent via-primary/45 to-transparent select-none text-center tracking-[-0.04em]">RGUHS</h2>
          </div>

          <div className="mt-10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-subtle font-light">
            <p>© 2026 Rajiv Gandhi University of Health Sciences. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-primary" /> All systems operational</span>
              <span className="px-3 py-1.5 glass rounded-md text-muted font-mono">v2.1.0 · Build 492</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* === Module data — 7 stacked cards === */
type ModuleCard = {
  id: string;
  title: string;
  tag: string;
  desc: string;
  color: string;
  Icon: typeof UserCheck;
  /** Omit to hide the visual column (photo) for this module */
  image?: string;
  bullets: string[];
};
const moduleCards: ModuleCard[] = [
  {
    id: 'M.01',
    title: 'Bill Processing',
    tag: 'Money Out',
    desc: 'Workflow-driven claim submission, multi-level verification and rapid sanctioning with delegation rules.',
    color: 'var(--primary)',
    Icon: FileCheck2,
    image: fmsImages.modBills,
    bullets: ['TA / DA, vendor & remuneration claims', '3-tier approval matrix with SLA timers', 'Auto-escalation on stalled queues'],
  },
  {
    id: 'M.02',
    title: 'Receipts',
    tag: 'Money In',
    desc: 'Capture every incoming rupee — tuition, exam fees, grants and counter receipts — auto-mapped to budget heads.',
    color: 'var(--primary)',
    Icon: Banknote,
    image: fmsImages.modReceipts,
    bullets: ['Online · cash · payment-gateway capture', 'Duplicate detection by amount & reference', 'Real-time mapping to ledger heads'],
  },
  {
    id: 'M.03',
    title: 'Payments',
    tag: 'Disbursement',
    desc: 'Bulk vendor and employee disbursements via direct host-to-host banking — TDS and GST auto-deducted at source.',
    color: 'var(--primary)',
    Icon: Coins,
    image: fmsImages.vendor,
    bullets: ['SBI · Canara · HDFC H2H rails', 'Bulk file generation & signing', 'TDS / GST auto-deduction'],
  },
  {
    id: 'M.04',
    title: 'Reconciliation',
    tag: 'Auto-match',
    desc: 'Direct multi-bank H2H integration with automated ledger matching, exception handling and aging alerts.',
    color: 'var(--primary)',
    Icon: Landmark,
    image: local('landing/reconciliation-b2b.png'),
    bullets: ['Live statement pulls every minute', 'Auto-match against the cashbook', 'Variance & aging dashboards'],
  },
  {
    id: 'M.05',
    title: 'Budget Management',
    tag: 'Allocation',
    desc: 'Demand → approval → reservation → drawdown. Budget heads are reserved at sanction time so no claim can over-draw.',
    color: 'var(--primary)',
    Icon: ClipboardCheck,
    image: fmsImages.growthChart,
    bullets: ['Head-wise demand & sanction', 'Reservation at approval', 'Real-time burn-rate alerts'],
  },
  {
    id: 'M.06',
    title: 'Reports',
    tag: 'Analytics',
    desc: 'Cashbooks, ledgers, DCB reports and statutory exports — generated live, downloadable in Excel and PDF.',
    color: 'var(--primary)',
    Icon: BarChart3,
    image: fmsImages.modReports,
    bullets: ['Live KPI dashboards', 'Drill-down to voucher', 'Scheduled email digests'],
  },
  {
    id: 'M.07',
    title: 'Audit',
    tag: 'Tamper-evident',
    desc: 'Immutable, hash-chained audit trail recording every state transition. Read-only auditor view ships day one.',
    color: 'var(--primary)',
    Icon: ShieldCheck,
    image: fmsImages.audit,
    bullets: ['SHA-256 hash-chain · no edit, no delete', 'Action · IP · timestamp captured', 'SOC2-aligned auditor portal'],
  },
];

/* === 3 Process-Integrity flows (Bill / Budget / Receipt) === */
type FlowStage = { name: string; sub: string; Icon: typeof UserCheck };
type Flow = {
  key: string;
  label: string;
  tag: string;
  sub: string;
  color: string;
  Icon: typeof UserCheck;
  stages: FlowStage[];
};
const _stageIcon: Record<string, typeof UserCheck> = {
  Creator: ScrollText,
  Verifier: UserCheck,
  Approver: Award,
  Finance: Landmark,
  'Payment Officer': Coins,
  Audit: ShieldCheck,
};
const _stageSub: Record<string, string> = {
  Creator: 'Department / college',
  Verifier: 'Section reviewer',
  Approver: 'Budget approval',
  Finance: 'Finance Officer',
  'Payment Officer': 'Disbursement',
  Audit: 'Read-only oversight',
};
const buildStages = (names: string[]): FlowStage[] =>
  names.map((n) => ({ name: n, sub: _stageSub[n] ?? '', Icon: _stageIcon[n] ?? CheckCircle2 }));

const flows: Flow[] = [
  {
    key: 'bill',
    label: 'Bill Journey',
    tag: 'Money Out',
    sub: 'Vendor invoices, TA / DA, remuneration · disbursed via H2H',
    color: 'var(--primary)',
    Icon: FileCheck2,
    stages: buildStages(['Creator', 'Verifier', 'Finance', 'Payment Officer', 'Audit']),
  },
  {
    key: 'budget',
    label: 'Budget Journey',
    tag: 'Allocation',
    sub: 'Demand · approval · reservation · drawdown',
    color: 'var(--primary)',
    Icon: ClipboardCheck,
    stages: buildStages(['Creator', 'Verifier', 'Approver', 'Finance', 'Audit']),
  },
  {
    key: 'receipt',
    label: 'Receipt Journey',
    tag: 'Money In',
    sub: 'Tuition, exam fees, grants · auto-mapped to ledger',
    color: 'var(--primary)',
    Icon: Banknote,
    stages: buildStages(['Creator', 'Verifier', 'Approver', 'Finance', 'Audit']),
  },
];

/* === Console scrubbed bento — image tiles === */
const consoleTiles = [
  { id: 'a', img: fmsImages.consoleA, tag: 'DASHBOARD',   title: 'Real-time KPIs' },
  { id: 'b', img: fmsImages.consoleB, tag: 'REPORTS',     title: 'Drill-down to voucher' },
  { id: 'c', img: fmsImages.consoleC, tag: 'BILLS',       title: 'Multi-tier approvals' },
  { id: 'd', img: fmsImages.consoleD, tag: 'AUDIT',       title: 'Tamper-evident trail' },
  { id: 'e', img: fmsImages.consoleE, tag: 'RECEIPTS',    title: 'Duplicate detection' },
  { id: 'f', img: fmsImages.consoleF, tag: 'SECURITY',    title: 'Period & year locks' },
  { id: 'g', img: fmsImages.consoleG, tag: 'BANKING H2H', title: 'Auto-reconciliation' },
];

const consoleCopy: Record<string, { desc: string; marks: string[] }> = {
  a: { desc: 'A single landing surface that aggregates receipts, payments, approvals and reconciliation health into one glanceable command deck.', marks: ['Live cash position', 'SLA & approval queue', 'Drill-down on every metric'] },
  b: { desc: 'Cashbooks, ledgers and DCB reports rendered live — every figure clickable down to the originating voucher and signature.', marks: ['Excel · PDF export', 'Voucher-level audit', 'Scheduled email digests'] },
  c: { desc: 'Bills move along a 3-tier approval matrix with delegation rules, SLA timers and automatic escalation when stalled.', marks: ['TA / DA · Vendor · Remuneration', 'SLA escalation', 'Digital signatures'] },
  d: { desc: 'Every state transition is recorded as an immutable, hash-chained event. Tamper attempts surface instantly across the trail.', marks: ['Hash-chained logs', 'Tamper alerts', 'Read-only auditor view'] },
  e: { desc: 'Receipt capture across counters, gateways and reconciliations — with duplicate detection by amount, payer and reference.', marks: ['Online · Cash · Gateway', 'Duplicate flagging', 'Auto-mapped to budget heads'] },
  f: { desc: 'Period locks, year-end seals and granular RBAC keep historical books safe from edits, even by privileged operators.', marks: ['Period · year locks', 'Granular RBAC', 'SOC2-aligned controls'] },
  g: { desc: 'Direct host-to-host links to SBI, Canara and HDFC pull statements every minute — auto-matched against the ledger.', marks: ['SBI · Canara · HDFC live', 'Daily auto-recon', 'Variance dashboards'] },
};

