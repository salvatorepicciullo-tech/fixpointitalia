'use client';

export default function StatCard({
  title,
  value,
  icon,
  color = 'text-gray-900',
}: {
  title: string;
  value: number | string;
  icon: string;
  color?: string;
}) {
  return (
    <div
      className="
        bg-white border rounded-2xl p-6
        shadow-sm hover:shadow-lg
        transition-all duration-200
        hover:-translate-y-1
      "
    >
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500">{title}</span>
        <span>{icon}</span>
      </div>

      <div className={`text-4xl font-bold ${color}`}>
        {value}
      </div>
    </div>
  );
}
