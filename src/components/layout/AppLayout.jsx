import Header from './Header';
import ApiKeyBanner from './ApiKeyBanner';

export default function AppLayout({ left, center, right }) {
  return (
    <div className="flex flex-col h-full bg-surface">
      <Header />
      <ApiKeyBanner />
      <main className="flex flex-1 min-h-0 gap-px bg-surface-3">
        <section className="flex flex-col flex-1 min-w-0 bg-surface-1">{left}</section>
        <section className="flex flex-col flex-1 min-w-0 bg-surface-1">{center}</section>
        <section className="flex flex-col flex-1 min-w-0 bg-surface-1">{right}</section>
      </main>
    </div>
  );
}
