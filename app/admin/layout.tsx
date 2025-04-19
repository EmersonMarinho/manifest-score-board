import NavbarAdmin from '@/app/components/NavbarAdmin';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <NavbarAdmin />
      <main className="min-h-screen bg-black text-white pt-16">
        {children}
      </main>
    </>
  );
} 