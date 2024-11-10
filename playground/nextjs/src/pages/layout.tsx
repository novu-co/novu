import Header from '@/components/Header';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main>
      <Header />
      <div className="flex h-screen justify-center p-5">
        <div className="flex flex-col gap-4 text-center">{children}</div>
      </div>
    </main>
  );
}
