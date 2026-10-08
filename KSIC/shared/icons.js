// Line-icon sprite shared by all designs. Use: <svg class="ic"><use href="#i-bag" /></svg>
document.body.insertAdjacentHTML(
  "afterbegin",
  `<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <defs>
    <symbol id="i-search" viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></symbol>
    <symbol id="i-user" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4.5 20.5c.6-3.8 3.7-6.5 7.5-6.5s6.9 2.7 7.5 6.5"/></symbol>
    <symbol id="i-heart" viewBox="0 0 24 24"><path d="M12 20s-7.5-4.6-7.5-10.2A4.2 4.2 0 0 1 12 7.3a4.2 4.2 0 0 1 7.5 2.5C19.5 15.4 12 20 12 20z"/></symbol>
    <symbol id="i-bag" viewBox="0 0 24 24"><path d="M5.5 8h13l-1 12.5h-11z"/><path d="M9 8V7a3 3 0 0 1 6 0v1"/></symbol>
    <symbol id="i-arrow" viewBox="0 0 24 24"><path d="M4 12h15M13.5 6.5 19 12l-5.5 5.5"/></symbol>
    <symbol id="i-chev" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5"/></symbol>
    <symbol id="i-play" viewBox="0 0 24 24"><path d="M9.5 7.5v9l7-4.5z" fill="currentColor" stroke="none"/></symbol>
    <symbol id="i-pin" viewBox="0 0 24 24"><path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/></symbol>
    <symbol id="i-lotus" viewBox="0 0 24 24"><path d="M12 19.5c-1.8-2.4-2.4-6.6 0-11 2.4 4.4 1.8 8.6 0 11z"/><path d="M12 19.5c-2.6-.3-6.6-2.4-7.6-6.6 3 .1 5.6 2.2 7.6 6.6z"/><path d="M12 19.5c2.6-.3 6.6-2.4 7.6-6.6-3 .1-5.6 2.2-7.6 6.6z"/><path d="M4 19.5h16"/></symbol>
    <symbol id="i-mandala" viewBox="0 0 24 24"><circle cx="12" cy="12" r="2.5"/><path d="M12 3.5c1.6 2 1.6 4 0 6-1.6-2-1.6-4 0-6zM12 14.5c1.6 2 1.6 4 0 6-1.6-2-1.6-4 0-6zM3.5 12c2-1.6 4-1.6 6 0-2 1.6-4 1.6-6 0zM14.5 12c2-1.6 4-1.6 6 0-2 1.6-4 1.6-6 0zM6 6c2.5.3 3.9 1.7 4.2 4.2C7.7 9.9 6.3 8.5 6 6zM13.8 13.8c2.5.3 3.9 1.7 4.2 4.2-2.5-.3-3.9-1.7-4.2-4.2zM18 6c-.3 2.5-1.7 3.9-4.2 4.2.3-2.5 1.7-3.9 4.2-4.2zM10.2 13.8C9.9 16.3 8.5 17.7 6 18c.3-2.5 1.7-3.9 4.2-4.2z"/></symbol>
    <symbol id="i-leaf" viewBox="0 0 24 24"><path d="M5 19c0-8.3 5.7-14 14-14 0 8.3-5.7 14-14 14z"/><path d="M5 19l8.5-8.5"/></symbol>
    <symbol id="i-temple" viewBox="0 0 24 24"><path d="M3.5 20.5h17M5.5 20.5v-8M18.5 20.5v-8M10 20.5v-5h4v5M3.5 12.5 12 5l8.5 7.5z"/><path d="M12 5V2.8"/></symbol>
    <symbol id="i-gem" viewBox="0 0 24 24"><path d="M7 4.5h10l3.5 5L12 20 3.5 9.5z"/><path d="M3.5 9.5h17M9.5 4.5 8 9.5l4 10.5 4-10.5-1.5-5"/></symbol>
    <symbol id="i-truck" viewBox="0 0 24 24"><path d="M2.5 6.5h11.5v10H2.5zM14 10h4l3.5 3.5v3H14"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17.5" cy="17.5" r="1.8"/></symbol>
    <symbol id="i-gift" viewBox="0 0 24 24"><path d="M4.5 11h15v9.5h-15zM3 7.5h18V11H3zM12 7.5v13"/><path d="M12 7.5C10.5 4 6.5 4 7 6.5c.3 1.2 2.5 1 5 1zM12 7.5c1.5-3.5 5.5-3.5 5-1-.3 1.2-2.5 1-5 1z"/></symbol>
    <symbol id="i-shield" viewBox="0 0 24 24"><path d="M12 3l7.5 3v6c0 4.6-3.2 7.8-7.5 9.3-4.3-1.5-7.5-4.7-7.5-9.3V6z"/><path d="M8.8 12.2l2.2 2.2 4.3-4.4"/></symbol>
    <symbol id="i-hands" viewBox="0 0 24 24"><path d="M12 10.5c-1.3-2.2-5-1.8-5 .8 0 2.2 5 5.2 5 5.2s5-3 5-5.2c0-2.6-3.7-3-5-.8z"/><path d="M2.5 18l3.5-1.8h4.5l2.5 1.8h3.5l5-3"/></symbol>
    <symbol id="i-fb" viewBox="0 0 24 24"><path d="M14 8.5h2.5V5H14c-2.2 0-3.5 1.5-3.5 3.7V11H8v3.5h2.5V21H14v-6.5h2.5L17 11h-3V9.2c0-.4.3-.7.7-.7z"/></symbol>
    <symbol id="i-ig" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="4.5"/><circle cx="12" cy="12" r="3.8"/><circle cx="16.8" cy="7.2" r=".8" fill="currentColor"/></symbol>
    <symbol id="i-yt" viewBox="0 0 24 24"><rect x="2.5" y="5.5" width="19" height="13" rx="4"/><path d="M10 9.2v5.6l4.8-2.8z" fill="currentColor"/></symbol>
    <symbol id="i-crown" viewBox="0 0 40 24"><path d="M5 19 7.5 7.5l6.5 5.5L20 3.5l6 9.5 6.5-5.5L35 19z" fill="currentColor" stroke="none"/><rect x="5" y="20" width="30" height="2.4" rx="1" fill="currentColor" stroke="none"/><circle cx="7.5" cy="6" r="1.6" fill="currentColor" stroke="none"/><circle cx="20" cy="2.2" r="1.6" fill="currentColor" stroke="none"/><circle cx="32.5" cy="6" r="1.6" fill="currentColor" stroke="none"/></symbol>
    <symbol id="d-sprig" viewBox="0 0 120 160"><path d="M60 158C58 120 52 80 30 20" fill="none"/><path d="M57 130c-18-4-30-16-34-34 18 3 30 15 34 34z"/><path d="M58 128c14-10 30-12 46-6-12 12-28 14-46 6z"/><path d="M52 95c-16-6-26-20-27-38 16 6 26 19 27 38z"/><path d="M53 92c12-12 26-16 42-12-10 13-25 17-42 12z"/><path d="M42 60c-12-8-18-22-16-38 13 9 19 22 16 38z"/><path d="M43 58c10-12 22-16 36-14-8 12-21 16-36 14z"/></symbol>
    <symbol id="d-flower" viewBox="0 0 120 120"><g fill="none"><circle cx="60" cy="60" r="7"/><path d="M60 53c-8-14-8-30 0-42 8 12 8 28 0 42zM60 67c8 14 8 30 0 42-8-12-8-28 0-42zM53 60c-14 8-30 8-42 0 12-8 28-8 42 0zM67 60c14-8 30-8 42 0-12 8-28 8-42 0z"/><path d="M55 55c-12-6-20-18-20-30 12 2 22 12 25 25M65 65c12 6 20 18 20 30-12-2-22-12-25-25M65 55c6-12 18-20 30-20-2 12-12 22-25 25M55 65c-6 12-18 20-30 20 2-12 12-22 25-25"/></g></symbol>
    <symbol id="d-petal" viewBox="0 0 24 24"><path d="M12 2c5 4 7 9 4 15-1.5 3-6.5 3-8 0C5 11 7 6 12 2z" stroke="none"/></symbol>
  </defs>
</svg>`,
);
