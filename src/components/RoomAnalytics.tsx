import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

const ENERGY_ROOM_URL = 'https://functions.poehali.dev/cfa30df9-0a04-4bb9-a1e7-3634b0c8db81';

interface HistoryItem {
  date: string;
  consumption_kwh: number;
  peak_load: number;
}

interface Stats {
  total_kwh: number;
  avg_kwh: number;
  peak_kwh: number;
  cost: number;
  days_count: number;
}

interface RoomAnalyticsProps {
  roomId: string;
  roomName: string;
  onBack: () => void;
}

const DAYS_OPTIONS = [7, 14, 30];

const RoomAnalytics = ({ roomId, roomName, onBack }: RoomAnalyticsProps) => {
  const [days, setDays] = useState(14);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`${ENERGY_ROOM_URL}?user_id=1&room_id=${roomId}&days=${days}`)
      .then(r => r.json())
      .then(raw => {
        const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
        setHistory(data.history || []);
        setStats(data.stats || null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [roomId, days]);

  const maxConsumption = Math.max(...history.map(h => h.consumption_kwh), 0.01);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getDate()} ${['янв','фев','мар','апр','май','июн','июл','авг','сен','окт','ноя','дек'][d.getMonth()]}`;
  };

  const trend = () => {
    if (history.length < 4) return null;
    const half = Math.floor(history.length / 2);
    const firstHalf = history.slice(0, half).reduce((s, h) => s + h.consumption_kwh, 0) / half;
    const secondHalf = history.slice(half).reduce((s, h) => s + h.consumption_kwh, 0) / (history.length - half);
    const diff = ((secondHalf - firstHalf) / firstHalf) * 100;
    return { diff: Math.round(diff), up: diff > 0 };
  };

  const trendData = trend();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
          <Icon name="ArrowLeft" size={18} />
        </Button>
        <div>
          <h2 className="text-xl font-semibold">Аналитика · {roomName}</h2>
          <p className="text-sm text-muted-foreground">История потребления энергии</p>
        </div>
      </div>

      {/* Period selector */}
      <div className="flex gap-2">
        {DAYS_OPTIONS.map(d => (
          <Badge
            key={d}
            variant={days === d ? 'default' : 'outline'}
            className={`cursor-pointer px-4 py-2 transition-all ${days === d ? 'gradient-purple-pink border-0' : ''}`}
            onClick={() => setDays(d)}
          >
            {d === 7 ? '7 дней' : d === 14 ? '2 недели' : '30 дней'}
          </Badge>
        ))}
      </div>

      {loading ? (
        <Card className="glassmorphism border-0 p-8 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Icon name="Loader2" size={28} className="animate-spin" />
            <p className="text-sm">Загружаю данные...</p>
          </div>
        </Card>
      ) : history.length === 0 ? (
        <Card className="glassmorphism border-0 p-8 flex flex-col items-center gap-3 text-center">
          <div className="p-4 rounded-full bg-muted/30">
            <Icon name="BarChart3" size={32} className="text-muted-foreground" />
          </div>
          <p className="font-medium">Данных пока нет</p>
          <p className="text-sm text-muted-foreground">Включи свет в этой комнате — данные начнут накапливаться автоматически</p>
        </Card>
      ) : (
        <>
          {/* Stats cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="glassmorphism border-0 p-4">
              <p className="text-xs text-muted-foreground mb-1">Всего за период</p>
              <p className="text-2xl font-bold">{stats?.total_kwh ?? 0}</p>
              <p className="text-xs text-muted-foreground">кВт·ч</p>
            </Card>
            <Card className="glassmorphism border-0 p-4">
              <p className="text-xs text-muted-foreground mb-1">В среднем за день</p>
              <p className="text-2xl font-bold">{stats?.avg_kwh ?? 0}</p>
              <p className="text-xs text-muted-foreground">кВт·ч</p>
            </Card>
            <Card className="glassmorphism border-0 p-4">
              <p className="text-xs text-muted-foreground mb-1">Пиковый день</p>
              <p className="text-2xl font-bold">{stats?.peak_kwh ?? 0}</p>
              <p className="text-xs text-muted-foreground">кВт·ч</p>
            </Card>
            <Card className="glassmorphism border-0 p-4">
              <p className="text-xs text-muted-foreground mb-1">Стоимость</p>
              <p className="text-2xl font-bold">{stats?.cost ?? 0}</p>
              <p className="text-xs text-muted-foreground">₽</p>
            </Card>
          </div>

          {/* Trend badge */}
          {trendData && (
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg w-fit text-sm font-medium ${
              trendData.up ? 'bg-red-500/15 text-red-400' : 'bg-green-500/15 text-green-400'
            }`}>
              <Icon name={trendData.up ? 'TrendingUp' : 'TrendingDown'} size={16} />
              {trendData.up ? '+' : ''}{trendData.diff}% по сравнению с первой половиной периода
            </div>
          )}

          {/* Bar chart */}
          <Card className="glassmorphism border-0 p-4">
            <p className="font-semibold mb-4">График потребления</p>
            <div className="flex items-end gap-1 h-40 overflow-x-auto pb-6 relative">
              {history.map((item, i) => (
                <div key={i} className="flex flex-col items-center gap-1 flex-shrink-0 group" style={{ minWidth: days <= 7 ? 40 : days <= 14 ? 32 : 22 }}>
                  <div className="relative w-full flex items-end justify-center" style={{ height: 120 }}>
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-popover border border-border px-2 py-1 rounded text-xs whitespace-nowrap z-10 pointer-events-none">
                      <p className="font-medium">{formatDate(item.date)}</p>
                      <p>{item.consumption_kwh} кВт·ч</p>
                      <p className="text-muted-foreground">Пик: {item.peak_load} кВт</p>
                    </div>
                    <div
                      className="w-full rounded-t-sm gradient-blue-orange transition-all duration-500 cursor-pointer hover:opacity-80"
                      style={{ height: `${(item.consumption_kwh / maxConsumption) * 100}%`, minHeight: 3 }}
                    />
                  </div>
                  <p className="text-[9px] text-muted-foreground leading-none" style={{ writingMode: days > 14 ? 'vertical-rl' : 'horizontal-tb', transform: days > 14 ? 'rotate(180deg)' : 'none' }}>
                    {days <= 14 ? formatDate(item.date) : item.date.slice(5)}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          {/* History table */}
          <Card className="glassmorphism border-0 p-4">
            <p className="font-semibold mb-3">Детальная история</p>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {[...history].reverse().map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${item.consumption_kwh > (stats?.avg_kwh ?? 0) ? 'bg-red-400' : 'bg-green-400'}`} />
                    <p className="text-sm">{formatDate(item.date)}</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-muted-foreground">{item.consumption_kwh} кВт·ч</span>
                    <Badge variant="outline" className="text-xs">
                      {Math.round(item.consumption_kwh * 4)} ₽
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default RoomAnalytics;
