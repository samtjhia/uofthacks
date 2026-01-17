import React from 'react';
import CategoryGrid from '@/components/layout/CategoryGrid';

interface Props {
  params: { category: string };
}

export default function CategoryPage({ params }: Props) {
  const { category } = params;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="max-w-5xl mx-auto p-6">
        <CategoryGrid category={category} />
      </div>
    </div>
  );
}
