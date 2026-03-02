'use client';

export default function AuthCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

      {/* LOGO */}
      <div className="flex justify-center mb-6">
        <div className="text-2xl font-bold text-gray-900">
          FixPoint
        </div>
      </div>

      {/* TITLE */}
      <h1 className="text-xl font-semibold text-center mb-6">
        {title}
      </h1>

      {children}
    </div>
  );
}
