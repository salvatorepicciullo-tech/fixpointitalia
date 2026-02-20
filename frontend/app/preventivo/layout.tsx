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
    <div className="min-h-screen flex flex-col bg-gray-50">

      {/* 👇 CONTAINER GLOBALE RESPONSIVE */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-4">
        {children}
      </div>

    </div>
  );
}
