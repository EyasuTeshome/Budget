import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export default function PageHeader({ title }: { title: string }) {
  const navigate = useNavigate();
  return (
    <div className="flex items-center gap-2 px-4 pt-4">
      <button onClick={() => navigate(-1)} className="rounded-full p-1.5 text-slate-500 active:bg-slate-100">
        <ChevronLeft size={20} />
      </button>
      <h1 className="text-base font-bold text-slate-800">{title}</h1>
    </div>
  );
}
