import Link from "next/link";

export default function NotFound() {
  return (
    <main className="system-page">
      <p className="eyebrow">404</p>
      <h1>這個頁面不在牌陣裡。</h1>
      <p>回到 AI Tarot，重新從一個問題開始。</p>
      <Link className="button primary" href="/">
        返回首頁
      </Link>
    </main>
  );
}
