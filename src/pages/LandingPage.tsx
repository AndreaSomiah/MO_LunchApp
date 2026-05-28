import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SignInForm from '@/components/auth/SignInForm';
import CreateAccountForm from '@/components/auth/CreateAccountForm';
import { RraLogo } from '@/components/RraLogo';
import { avatarDefaultBg, avatarEmoji } from '@/data/avatarOptions';
import { formatCurrency } from '@/lib/formatCurrency';
import { supabase } from '@/lib/supabase';
import { fetchFunStats, type FunStats, type BattleEntry } from '@/api/funStatsApi';
import type { AppSettings } from '@/types/settings';

// ─── Skeleton ────────────────────────────────────────────────────────────────
const Skeleton = ({ h, mb }: { h: number; mb?: number }) => (
  <div
    className="animate-pulse"
    style={{
      height: h,
      borderRadius: 10,
      background: 'rgba(255,255,255,0.06)',
      marginBottom: mb ?? 0,
    }}
  />
);

// ─── Avatar circle ────────────────────────────────────────────────────────────
const AvatarCircle = ({
  avatarId,
  size = 28,
  border,
}: {
  avatarId: string | null | undefined;
  size?: number;
  border?: string;
}) => {
  const baseStyle: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: '50%',
    border: border ?? '1px solid rgba(255,255,255,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    fontSize: size * 0.52,
  };
  if (!avatarId) {
    return (
      <div style={{ ...baseStyle, background: 'rgba(255,255,255,0.12)', color: '#93B4D8', fontSize: size * 0.45 }}>
        👤
      </div>
    );
  }
  return (
    <div style={{ ...baseStyle, background: avatarDefaultBg(avatarId) }}>
      {avatarEmoji(avatarId)}
    </div>
  );
};

// ─── Battle column ────────────────────────────────────────────────────────────
const BattleCol = ({
  entry,
  isWinner,
  settings,
}: {
  entry: BattleEntry;
  isWinner: boolean;
  settings: AppSettings | null;
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 0 }}>
    {/* Lunch lady row */}
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <AvatarCircle
        avatarId={entry.lunchLadyAvatarId}
        size={28}
        border={isWinner ? '1.5px solid #F58220' : '1px solid rgba(255,255,255,0.2)'}
      />
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 500, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {entry.lunchLadyName ?? 'Unassigned'}
        </div>
        {entry.lunchLadyName && (
          <span style={{
            background: isWinner ? '#F58220' : 'rgba(255,255,255,0.10)',
            color: isWinner ? 'white' : '#93B4D8',
            fontSize: 8,
            borderRadius: 9999,
            padding: '1px 5px',
            display: 'inline-block',
            marginTop: 1,
          }}>
            {isWinner ? 'WINNING' : 'CHALLENGER'}
          </span>
        )}
      </div>
    </div>

    {/* Restaurant name */}
    <div style={{
      fontSize: 12, fontWeight: 500,
      color: isWinner ? 'white' : '#93B4D8',
      fontStyle: isWinner ? 'normal' : 'italic',
      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
    }}>
      {entry.restaurantName}
    </div>

    {/* Tagline */}
    {entry.tagline && (
      <div style={{ fontSize: 9, fontStyle: 'italic', color: isWinner ? '#F58220' : '#93B4D8' }}>
        {entry.tagline}
      </div>
    )}

    {/* Stats */}
    <div style={{ fontSize: 9, color: '#BAD0E8' }}>
      Orders: <span style={{ color: isWinner ? '#F58220' : '#BAD0E8', fontWeight: 500 }}>{entry.orderCount}</span>
      {'  '}
      Avg: <span style={{ color: isWinner ? '#F58220' : '#BAD0E8', fontWeight: 500 }}>{formatCurrency(entry.avgPrice, settings)}</span>
    </div>

    {/* Progress bar */}
    <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.12)', overflow: 'hidden' }}>
      <div style={{
        height: '100%',
        width: `${Math.min(entry.sharePct, 100)}%`,
        background: isWinner ? '#F58220' : 'rgba(255,255,255,0.25)',
        borderRadius: 2,
        transition: 'width 0.8s ease',
      }} />
    </div>

    {/* Share % */}
    <div style={{ fontSize: 8, color: isWinner ? '#F58220' : '#6B9BD2', textAlign: isWinner ? 'left' : 'right' }}>
      {entry.sharePct.toFixed(1)}%
    </div>
  </div>
);

// ─── Left panel content ───────────────────────────────────────────────────────
const LeftPanelContent = ({ settings }: { settings: AppSettings | null }) => {
  const [funStats, setFunStats] = useState<FunStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [empty, setEmpty] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchFunStats()
      .then((data) => {
        if (cancelled) return;
        const hasData = Boolean(data?.mostLoyal?.userName || data?.topDish?.itemName);
        if (!hasData) { setEmpty(true); }
        else { setFunStats(data); }
      })
      .catch(() => { if (!cancelled) setEmpty(true); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <Skeleton h={84} /> <Skeleton h={84} />
          <Skeleton h={84} /> <Skeleton h={84} />
        </div>
        <Skeleton h={110} mb={14} />
      </>
    );
  }

  if (empty || !funStats) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontSize: 12, color: '#6B9BD2', fontStyle: 'italic', textAlign: 'center' }}>
          Start ordering to see your team stats here.
        </p>
      </div>
    );
  }

  const battle = funStats.battle ?? [];

  return (
    <>
      {/* 2×2 Fun stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>

        {/* Card A — Lunch Royalty */}
        <div style={{ borderRadius: 10, padding: '11px 13px', background: 'rgba(255,255,255,0.10)', border: '0.5px solid rgba(255,255,255,0.12)' }}>
          <div style={{ fontSize: 9, letterSpacing: '0.07em', color: '#93B4D8', textTransform: 'uppercase', marginBottom: 3 }}>Lunch Royalty</div>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {funStats.mostLoyal.userName}
          </div>
          <div style={{ fontSize: 10, color: '#BAD0E8', marginTop: 2 }}>
            <span style={{ color: '#F58220' }}>{funStats.mostLoyal.orderCount}</span> orders placed
          </div>
          <div style={{ fontSize: 9, fontStyle: 'italic', color: '#6B9BD2', marginTop: 4 }}>Someone really loves lunch.</div>
        </div>

        {/* Card B — Creature of Habit */}
        <div style={{ borderRadius: 10, padding: '11px 13px', background: '#F58220' }}>
          <div style={{ fontSize: 9, letterSpacing: '0.07em', color: '#7A3A00', textTransform: 'uppercase', marginBottom: 3 }}>Creature of Habit</div>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {funStats.creatureOfHabit.userName}
          </div>
          <div style={{ fontSize: 10, color: '#3D1A00', marginTop: 2 }}>
            {funStats.creatureOfHabit.itemName} <span style={{ color: 'white', fontWeight: 500 }}>{funStats.creatureOfHabit.repeatCount}×</span>
          </div>
          <div style={{ fontSize: 9, fontStyle: 'italic', color: '#7A3A00', marginTop: 4 }}>If it ain't broke...</div>
        </div>

        {/* Card C — Last Minute Larry */}
        <div style={{ borderRadius: 10, padding: '11px 13px', background: 'rgba(234,179,8,0.18)', border: '0.5px solid rgba(234,179,8,0.25)' }}>
          <div style={{ fontSize: 9, letterSpacing: '0.07em', color: '#FCD34D', textTransform: 'uppercase', marginBottom: 3 }}>Last Minute Larry</div>
          <div style={{ fontSize: 13, fontWeight: 500, color: '#FDE68A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {funStats.lateOrderer.userName}
          </div>
          <div style={{ fontSize: 10, color: '#FCD34D', marginTop: 2 }}>
            <span style={{ color: '#FDE68A', fontWeight: 500 }}>{funStats.lateOrderer.count}</span> close calls
          </div>
          <div style={{ fontSize: 9, fontStyle: 'italic', color: '#F59E0B', marginTop: 4 }}>Lives on the edge.</div>
        </div>

        {/* Card D — The Usual */}
        <div style={{ borderRadius: 10, padding: '11px 13px', background: 'rgba(255,255,255,0.06)', borderLeft: '3px solid #F58220', borderTop: '0.5px solid rgba(255,255,255,0.08)', borderRight: '0.5px solid rgba(255,255,255,0.08)', borderBottom: '0.5px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: 9, letterSpacing: '0.07em', color: '#93B4D8', textTransform: 'uppercase', marginBottom: 3 }}>The Usual</div>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {funStats.topDish.itemName}
          </div>
          <div style={{ fontSize: 10, color: '#BAD0E8', marginTop: 2 }}>
            ordered <span style={{ color: '#F58220', fontWeight: 500 }}>{funStats.topDish.orderCount}×</span>
          </div>
          <div style={{ fontSize: 9, fontStyle: 'italic', color: '#6B9BD2', marginTop: 4 }}>The team has spoken.</div>
        </div>
      </div>

      {/* Lunch Lady Battle card */}
      {battle.length >= 1 && (
        <div style={{ background: 'rgba(255,255,255,0.07)', border: '0.5px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '12px 13px', marginBottom: 14 }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 9, color: '#93B4D8', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
              Lunch Lady Battle
            </span>
            <span style={{ background: '#F58220', color: 'white', fontSize: 8, borderRadius: 9999, padding: '2px 7px', fontWeight: 500 }}>
              LIVE
            </span>
          </div>

          {battle.length === 1 ? (
            <div style={{ textAlign: 'center', fontSize: 12, color: '#BAD0E8', padding: '8px 0' }}>
              👑 {battle[0]!.restaurantName} — Unopposed champion.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 8, alignItems: 'center' }}>
              <BattleCol entry={battle[0]!} isWinner={true} settings={settings} />
              {/* VS divider */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.12)' }} />
                <span style={{ fontSize: 11, color: '#F58220', fontWeight: 500 }}>VS</span>
                <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.12)' }} />
              </div>
              <BattleCol entry={battle[1]!} isWinner={false} settings={settings} />
            </div>
          )}
        </div>
      )}
    </>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────
const LandingPage = (): JSX.Element => {
  const [settings, setSettings] = useState<AppSettings | null>(null);

  useEffect(() => {
    supabase
      .from('settings')
      .select('*')
      .eq('id', 1)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return;
        setSettings({
          id: String(data.id),
          allowedEmailDomain: data.allowed_email_domain,
          currency: data.currency,
          currencySymbol: data.currency_symbol,
          cutoffTime: data.cutoff_time,
          orderingOpenToday: data.ordering_open_today,
          updatedAt: data.updated_at,
        });
      });
  }, []);

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">

      {/* ── LEFT PANEL ── */}
      <aside
        className="relative hidden lg:flex"
        style={{
          flexDirection: 'column',
          background: '#082B63',
          padding: '40px 32px',
          color: 'white',
          minHeight: '100vh',
        }}
      >
        {/* 2+3. Stats + battle (flex-grow) */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <LeftPanelContent settings={settings} />
        </div>

        {/* 4. Footer */}
        <p style={{ fontSize: 9, color: '#6B9BD2', letterSpacing: '0.05em', textTransform: 'uppercase', marginTop: 8 }}>
          Part of the MagicOrange Ecosystem
        </p>
      </aside>

      {/* ── RIGHT PANEL ── */}
      <main className="flex flex-col items-center justify-center p-6 sm:p-12 relative">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex justify-center lg:hidden">
            <RraLogo variant="compact" size="lg" />
          </div>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Create Account</TabsTrigger>
            </TabsList>
            <TabsContent value="signin">
              <SignInForm />
            </TabsContent>
            <TabsContent value="signup">
              <CreateAccountForm />
            </TabsContent>
          </Tabs>
        </div>
        {/* Logo bottom-right */}
        <div className="absolute bottom-6 right-6">
          <img
            src={`${import.meta.env.BASE_URL}brand/orra-logo-full.png`}
            alt="Orra"
            style={{ height: 36, width: 'auto' }}
            loading="eager"
          />
        </div>
      </main>
    </div>
  );
};

export default LandingPage;

