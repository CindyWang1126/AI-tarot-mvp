import Image from "next/image";

export function Navbar() {
  return (
    <header className="site-nav">
      <a className="brand-lockup" href="#top" aria-label="AI Tarot 首頁">
        <Image
          className="brand-logo"
          src="/timeflow-logo.png"
          alt=""
          width={256}
          height={256}
          priority
        />
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
