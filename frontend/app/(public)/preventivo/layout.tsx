export const metadata = {
  title: 'Preventivo – FixPoint',
  description: 'Richiedi un preventivo di riparazione',
};

export default function PreventivoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-gray-50">
      {children}
    </main>
  );
}
