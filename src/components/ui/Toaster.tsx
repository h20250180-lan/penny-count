import React from 'react';
import { X } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

export const Toaster: React.FC = () => {
  const { toasts, remove } = useToast();
  return (
    <div className="fixed right-4 bottom-4 z-50 flex flex-col-reverse space-y-2 space-y-reverse">
      {toasts.map(t => (
        <div key={t.id} className={`max-w-sm w-full px-4 py-3 rounded-lg shadow-md border ${t.type === 'success' ? 'bg-emerald-50 border-emerald-200' : t.type === 'error' ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-2">
              <p className={`text-sm font-medium ${t.type === 'success' ? 'text-emerald-700' : t.type === 'error' ? 'text-red-700' : 'text-gray-800'}`}>{t.message}</p>
            </div>
            <button onClick={() => remove(t.id)} className="text-gray-500 hover:text-gray-700 p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Toaster;
