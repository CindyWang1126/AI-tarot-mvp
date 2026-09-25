export function Navbar() {
  return (
    <header className="site-nav">
      <a className="brand-lockup" href="#top" aria-label="AI Tarot 首頁">
        <span className="brand-mark" aria-hidden="true">
          <span />
        </span>
        <span>
          <strong>AI Tarot</strong>
          <small>A Timeflow Experience</small>
        </span>
      </a>
      <nav aria-label="主要導覽">
        <a href="#how-it-works">關於體驗</a>
        <a href="https://timeflow.tw" target="_blank" rel="noreferrer">
          Timeflow <span aria-hidden="true">↗</span>
        </a>
      </nav>
    </header>
  );
}
