"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="system-page">
      <p className="eyebrow">SOMETHING WENT WRONG</p>
      <h1>頁面暫時無法完成載入。</h1>
      <p>已抽出的牌若曾完成保存，重新整理後仍會從這個瀏覽器恢復。</p>
      <button type="button" className="button primary" onClick={reset}>
        再試一次
      </button>
    </main>
  );
}
