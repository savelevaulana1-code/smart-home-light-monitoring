import { Light } from './types';

interface RoomItem {
  id: string;
  type: 'light' | 'switch';
  label: string;
  x: number; // percent
  y: number; // percent
  lightId?: string;
}

interface RoomLayout {
  name: string;
  furniture: { label: string; x: number; y: number; w: number; h: number; color: string }[];
  items: RoomItem[];
  doors: { x: number; y: number; side: 'top' | 'bottom' | 'left' | 'right' }[];
}

const ROOM_LAYOUTS: Record<string, RoomLayout> = {
  'Гостиная': {
    name: 'Гостиная',
    doors: [{ x: 15, y: 0, side: 'top' }],
    furniture: [
      { label: 'Диван', x: 10, y: 55, w: 50, h: 18, color: '#4c3d5a' },
      { label: 'Стол', x: 25, y: 35, w: 25, h: 15, color: '#3b3344' },
      { label: 'ТВ', x: 10, y: 10, w: 30, h: 8, color: '#1e1b2e' },
      { label: 'Полка', x: 72, y: 10, w: 18, h: 40, color: '#3b3344' },
    ],
    items: [
      { id: 'l1', type: 'light', label: 'Люстра', x: 50, y: 45, lightId: '1' },
      { id: 'l2', type: 'light', label: 'Торшер', x: 72, y: 60, lightId: '2' },
      { id: 's1', type: 'switch', label: 'Выключатель', x: 88, y: 5 },
    ],
  },
  'Спальня': {
    name: 'Спальня',
    doors: [{ x: 80, y: 0, side: 'top' }],
    furniture: [
      { label: 'Кровать', x: 20, y: 30, w: 45, h: 35, color: '#3d4b5a' },
      { label: 'Тумба', x: 10, y: 35, w: 10, h: 12, color: '#3b3344' },
      { label: 'Тумба', x: 65, y: 35, w: 10, h: 12, color: '#3b3344' },
      { label: 'Шкаф', x: 10, y: 10, w: 20, h: 18, color: '#4c3d5a' },
    ],
    items: [
      { id: 'l1', type: 'light', label: 'Люстра', x: 50, y: 70, lightId: '3' },
      { id: 'l2', type: 'light', label: 'Ночник', x: 15, y: 42, lightId: '4' },
      { id: 's1', type: 'switch', label: 'Выключатель', x: 88, y: 5 },
    ],
  },
  'Кухня': {
    name: 'Кухня',
    doors: [{ x: 75, y: 100, side: 'bottom' }],
    furniture: [
      { label: 'Плита', x: 10, y: 10, w: 18, h: 14, color: '#3b3344' },
      { label: 'Холодильник', x: 30, y: 10, w: 12, h: 14, color: '#4c3d5a' },
      { label: 'Мойка', x: 45, y: 10, w: 15, h: 14, color: '#3d4b5a' },
      { label: 'Стол', x: 55, y: 50, w: 30, h: 22, color: '#3b3344' },
      { label: 'Шкаф', x: 10, y: 55, w: 35, h: 16, color: '#4c3d5a' },
    ],
    items: [
      { id: 'l1', type: 'light', label: 'Основной', x: 35, y: 45, lightId: '5' },
      { id: 'l2', type: 'light', label: 'Рабочая зона', x: 35, y: 18, lightId: '6' },
      { id: 's1', type: 'switch', label: 'Выключатель', x: 88, y: 90 },
    ],
  },
};

interface RoomFloorPlanProps {
  room: string;
  lights: Light[];
  onToggleLight: (id: string) => void;
}

const RoomFloorPlan = ({ room, lights, onToggleLight }: RoomFloorPlanProps) => {
  const layout = ROOM_LAYOUTS[room];
  if (!layout) return null;

  const getLightState = (lightId: string) => {
    return lights.find(l => l.id === lightId);
  };

  return (
    <div className="w-full">
      <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
        <span>📐</span> План комнаты
      </p>
      <div
        className="relative w-full rounded-xl border border-white/10 overflow-hidden"
        style={{ paddingBottom: '70%', background: 'rgba(255,255,255,0.03)' }}
      >
        <div className="absolute inset-0">
          {/* Walls outline */}
          <div className="absolute inset-2 border-2 border-white/20 rounded-lg" />

          {/* Doors */}
          {layout.doors.map((door, i) => (
            <div
              key={i}
              className="absolute bg-background"
              style={
                door.side === 'top'
                  ? { top: 8, left: `calc(${door.x}% + 8px)`, width: '12%', height: 4, borderBottom: '2px dashed rgba(255,255,255,0.3)' }
                  : door.side === 'bottom'
                  ? { bottom: 8, left: `calc(${door.x}% + 8px)`, width: '12%', height: 4, borderTop: '2px dashed rgba(255,255,255,0.3)' }
                  : { top: `calc(${door.y}% + 8px)`, left: 8, width: 4, height: '12%', borderRight: '2px dashed rgba(255,255,255,0.3)' }
              }
            />
          ))}

          {/* Furniture */}
          {layout.furniture.map((f, i) => (
            <div
              key={i}
              className="absolute rounded flex items-center justify-center"
              style={{
                left: `calc(${f.x}% + 8px)`,
                top: `calc(${f.y}% + 8px)`,
                width: `calc(${f.w}% - 4px)`,
                height: `calc(${f.h}% - 4px)`,
                background: f.color,
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <span className="text-[9px] text-white/40 text-center leading-tight px-1">{f.label}</span>
            </div>
          ))}

          {/* Light sources and switches */}
          {layout.items.map((item) => {
            const lightState = item.lightId ? getLightState(item.lightId) : null;
            const isOn = lightState?.isOn ?? false;

            if (item.type === 'light') {
              return (
                <button
                  key={item.id}
                  onClick={() => item.lightId && onToggleLight(item.lightId)}
                  className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-0.5 group"
                  style={{ left: `calc(${item.x}% + 8px)`, top: `calc(${item.y}% + 8px)` }}
                  title={item.label}
                >
                  {/* Glow */}
                  {isOn && (
                    <div
                      className="absolute rounded-full pointer-events-none"
                      style={{
                        width: 44,
                        height: 44,
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        background: `radial-gradient(circle, rgba(251,191,36,0.35) 0%, transparent 70%)`,
                      }}
                    />
                  )}
                  <div
                    className="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 relative z-10"
                    style={{
                      background: isOn ? '#fbbf24' : 'rgba(255,255,255,0.1)',
                      borderColor: isOn ? '#f59e0b' : 'rgba(255,255,255,0.2)',
                      boxShadow: isOn ? '0 0 8px rgba(251,191,36,0.6)' : 'none',
                    }}
                  >
                    <span style={{ fontSize: 10 }}>💡</span>
                  </div>
                  <span className="text-[8px] text-white/50 leading-none whitespace-nowrap">{item.label}</span>
                </button>
              );
            }

            // Switch
            return (
              <div
                key={item.id}
                className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-0.5"
                style={{ left: `calc(${item.x}% + 8px)`, top: `calc(${item.y}% + 8px)` }}
                title={item.label}
              >
                <div
                  className="w-4 h-4 rounded border-2 flex items-center justify-center"
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    borderColor: 'rgba(255,255,255,0.25)',
                  }}
                >
                  <span style={{ fontSize: 8 }}>🔌</span>
                </div>
                <span className="text-[8px] text-white/40 leading-none whitespace-nowrap">{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">💡 Светильник (нажми чтобы вкл/выкл)</span>
        <span className="flex items-center gap-1">🔌 Выключатель</span>
      </div>
    </div>
  );
};

export default RoomFloorPlan;
