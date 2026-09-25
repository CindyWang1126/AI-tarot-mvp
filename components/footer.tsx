import Image from "next/image";

export function Footer() {
  return (
    <footer className="site-footer">
      <a
        className="footer-brand"
        href="https://timeflow.tw"
        target="_blank"
        rel="noreferrer"
        aria-label="前往 Timeflow 時序官網"
      >
        <Image
          className="timeflow-logo"
          src="/timeflow-logo.png"
          alt=""
          width={48}
          height={48}
          aria-hidden="true"
        />
        <div>
          <strong>Timeflow 時序</strong>
          <p>預約與數位營運系統</p>
        </div>
      </a>
      <div className="footer-links" aria-label="Timeflow 連結">
        <a href="https://timeflow.tw" target="_blank" rel="noreferrer">
          timeflow.tw
        </a>
        <a href="https://timeflow.tw/terms" target="_blank" rel="noreferrer">
          服務條款
        </a>
        <a href="https://timeflow.tw/privacy" target="_blank" rel="noreferrer">
          隱私權政策
        </a>
        <a href="mailto:support@timeflow.tw">support@timeflow.tw</a>
      </div>
      <p className="copyright">© 2026 時序有限公司</p>
    </footer>
  );
}
