'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useCountUp } from '@/hooks/useCountUp';

interface Stats {
  persons: number;
  unions: number;
  localites: number;
  hinya: number;
}

export default function StatsBar() {
  const [stats, setStats] = useState<Stats>({ persons: 0, unions: 0, localites: 0, hinya: 0 });

  useEffect(() => {
    const load = async () => {
      try {
        const [{ count: cp }, { count: cu }, locRes, clanRes] = await Promise.all([
          supabase.from('persons').select('*', { count: 'exact', head: true }),
          supabase.from('unions').select('*', { count: 'exact', head: true }),
          supabase.from('persons').select('localite'),
          supabase.from('persons').select('clan'),
        ]);
        setStats({
          persons: cp || 0,
          unions: cu || 0,
          localites: locRes.data
            ? [...new Set(locRes.data.map((x: any) => x.localite).filter(Boolean))].length
            : 0,
          hinya: clanRes.data
            ? [...new Set(clanRes.data.map((x: any) => x.clan).filter(Boolean))].length
            : 0,
        });
      } catch (e) {
        console.warn('[StatsBar]', e);
      }
    };
    load();
  }, []);

  const router = useRouter();

  const cells = [
    { value: stats.persons,   label: 'Personnes',  link: true },
    { value: stats.unions,    label: 'Mariages',   link: false },
    { value: stats.localites, label: 'Localités',  link: false },
    { value: stats.hinya,     label: 'Hinya',      link: false },
  ];

  return (
    <div className="stats-bar">
      {cells.map(({ value, label, link }) => (
        <StatCell
          key={label}
          value={value}
          label={label}
          onClick={link ? () => router.push('/registre') : undefined}
        />
      ))}
    </div>
  );
}

function StatCell({ value, label, onClick }: { value: number; label: string; onClick?: () => void }) {
  const { count, ref } = useCountUp(value);
  return (
    <div
      ref={ref}
      className="stat-cell"
      onClick={onClick}
      style={onClick ? { cursor: 'pointer' } : undefined}
    >
      <div className="stat-num">{value > 0 ? count : '…'}</div>
      <div className="stat-lbl">{label}</div>
    </div>
  );
}
