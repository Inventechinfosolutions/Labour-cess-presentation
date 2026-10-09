import gsap from 'gsap';

export function playReconciliationMatchSound(audio: HTMLAudioElement | null) {
  if (!audio) return;
  try {
    audio.currentTime = 0;
    void audio.play();
  } catch (_) {
    /* ignore autoplay / decode errors */
  }
}

/** Row stagger, number pulse, and text scramble after auto-match — same behavior as the reconciliation workspace. */
export function runReconciliationAutoMatchGsap(root: HTMLElement | null, metaRefEl: HTMLElement | null) {
  if (!root) return;
  requestAnimationFrame(() => {
    const rows = root.querySelectorAll<HTMLElement>('[data-recon-cascade]');
    const numberTargets = root.querySelectorAll<HTMLElement>('[data-recon-number]');
    if (!rows.length) return;
    const scrambleTargets = [
      ...root.querySelectorAll<HTMLElement>('[data-recon-scramble]'),
      ...(metaRefEl ? [metaRefEl] : []),
    ];

    gsap.fromTo(
      rows,
      { opacity: 0, y: -22, filter: 'blur(3px)' },
      {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 0.75,
        stagger: 0.08,
        ease: 'power2.out',
      },
    );

    gsap.fromTo(
      numberTargets,
      {
        scale: 0.9,
        opacity: 0.7,
        filter: 'drop-shadow(0 0 0px transparent)',
      },
      {
        scale: 1,
        opacity: 1,
        filter: 'drop-shadow(0 0 10px color-mix(in oklch, var(--primary) 35%, transparent))',
        duration: 0.28,
        ease: 'back.out(2)',
        stagger: 0.035,
        yoyo: true,
        repeat: 1,
      },
    );

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*';
    scrambleTargets.forEach((node, index) => {
      const finalText = node.dataset.scrambleFinal ?? node.textContent ?? '';
      if (!finalText.trim()) return;
      node.dataset.scrambleFinal = finalText;
      gsap.killTweensOf(node);
      gsap.to(node, {
        duration: 0.9,
        delay: index * 0.035,
        ease: 'power2.out',
        scrambleProgress: 1,
        onStart: () => {
          node.dataset.scrambleFinal = finalText;
        },
        onUpdate: function updateText() {
          const progress = this.progress();
          const revealCount = Math.floor(finalText.length * progress);
          const revealed = finalText.slice(0, revealCount);
          const scrambled = finalText
            .slice(revealCount)
            .split('')
            .map((ch) => (ch.trim() ? chars[Math.floor(Math.random() * chars.length)] : ch))
            .join('');
          node.textContent = revealed + scrambled;
        },
        onComplete: () => {
          node.textContent = finalText;
        },
      });
    });
  });
}
