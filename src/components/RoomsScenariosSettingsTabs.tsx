import { useState } from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { Light, Scenario, ScenarioSchedule, ScheduleItem, Notification } from './types';
import RoomFloorPlan from './RoomFloorPlan';

interface RoomsScenariosSettingsTabsProps {
  lights: Light[];
  scenarios: Scenario[];
  schedule: ScheduleItem[];
  notifications: Notification[];
  toggleLight: (id: string) => void;
  toggleRoomLights: (room: string, turnOn: boolean) => void;
  setRoomBrightness: (room: string, value: number) => void;
  activateScenario: (name: string) => void;
  onUpdateScenarioSchedule: (id: string, schedule: ScenarioSchedule) => void;
}

const RoomsScenariosSettingsTabs = ({ 
  lights, 
  scenarios, 
  schedule, 
  notifications,
  toggleLight, 
  toggleRoomLights,
  setRoomBrightness,
  activateScenario,
  onUpdateScenarioSchedule,
}: RoomsScenariosSettingsTabsProps) => {
  const rooms = ['Все', ...Array.from(new Set(lights.map(l => l.room)))];
  const [selectedRoom, setSelectedRoom] = useState('Все');
  const [editingScenario, setEditingScenario] = useState<Scenario | null>(null);
  const [scheduleForm, setScheduleForm] = useState<ScenarioSchedule>({ enabled: false, startTime: '00:00', endTime: '00:00' });

  const openScheduleModal = (scenario: Scenario) => {
    setEditingScenario(scenario);
    setScheduleForm(scenario.schedule ?? { enabled: false, startTime: '08:00', endTime: '22:00' });
  };

  const saveSchedule = () => {
    if (!editingScenario) return;
    onUpdateScenarioSchedule(editingScenario.id, scheduleForm);
    setEditingScenario(null);
  };

  const filteredLights = selectedRoom === 'Все' 
    ? lights 
    : lights.filter(l => l.room === selectedRoom);

  return (
    <>
      <TabsContent value="rooms" className="space-y-4 mt-6">
        <div className="flex gap-2 flex-wrap mb-4">
          {rooms.map((room) => (
            <Badge
              key={room}
              variant={selectedRoom === room ? 'default' : 'outline'}
              className={`cursor-pointer px-4 py-2 transition-all ${
                selectedRoom === room ? 'gradient-purple-pink border-0' : ''
              }`}
              onClick={() => setSelectedRoom(room)}
            >
              {room}
            </Badge>
          ))}
        </div>
        {selectedRoom !== 'Все' && (
          <>
            <Card className="glassmorphism border-0 p-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Управление комнатой</p>
                  <p className="text-sm text-muted-foreground">
                    {filteredLights.filter(l => l.isOn).length} из {filteredLights.length} включено
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="gradient-purple-pink border-0"
                    onClick={() => toggleRoomLights(selectedRoom, true)}
                  >
                    <Icon name="Power" size={16} className="mr-1" />
                    Включить все
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => toggleRoomLights(selectedRoom, false)}
                  >
                    <Icon name="PowerOff" size={16} className="mr-1" />
                    Выключить все
                  </Button>
                </div>
              </div>
            </Card>
            
            <Card className="glassmorphism border-0 p-4 mb-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">Яркость в комнате</p>
                  <Badge className="gradient-blue-orange border-0">
                    {Math.round(filteredLights.reduce((sum, l) => sum + l.brightness, 0) / filteredLights.length)}%
                  </Badge>
                </div>
                <Slider 
                  value={[Math.round(filteredLights.reduce((sum, l) => sum + l.brightness, 0) / filteredLights.length)]} 
                  max={100} 
                  step={10}
                  onValueChange={([value]) => setRoomBrightness(selectedRoom, value)}
                  className="cursor-pointer"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
            </Card>

            <Card className="glassmorphism border-0 p-4 mb-4">
              <RoomFloorPlan
                room={selectedRoom}
                lights={filteredLights}
                onToggleLight={toggleLight}
              />
            </Card>
          </>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredLights.map((light) => (
            <Card 
              key={light.id} 
              className={`glassmorphism p-4 border-0 transition-all duration-500 relative overflow-hidden ${
                light.isOn ? 'neon-glow' : ''
              }`}
            >
              {light.isOn && (
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-orange-500/20 animate-pulse-glow" />
              )}
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg transition-all duration-300 ${
                    light.isOn 
                      ? 'gradient-blue-orange shadow-[0_0_20px_rgba(139,92,246,0.5)]' 
                      : 'bg-muted'
                  }`}>
                    <Icon name="Lightbulb" size={20} className={light.isOn ? 'animate-pulse' : ''} />
                  </div>
                  <div>
                    <h3 className="font-semibold">{light.name}</h3>
                    <p className="text-sm text-muted-foreground">{light.brightness}%</p>
                  </div>
                </div>
                <Switch 
                  checked={light.isOn} 
                  onCheckedChange={() => toggleLight(light.id)}
                />
              </div>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="scenarios" className="space-y-4 mt-6">
        <h2 className="text-xl font-semibold">Сценарии освещения</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {scenarios.map((scenario) => (
            <Card
              key={scenario.id}
              className="glassmorphism border-0 p-6 cursor-pointer transition-all duration-300 hover:scale-105"
              onClick={() => openScheduleModal(scenario)}
            >
              <div className="space-y-3">
                <div className={`${scenario.gradient} p-3 rounded-xl w-fit`}>
                  <Icon name={scenario.icon as string} size={28} />
                </div>
                <h3 className="font-semibold text-lg">{scenario.name}</h3>
                {scenario.schedule?.enabled ? (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Icon name="Clock" size={12} />
                    <span>{scenario.schedule.startTime} – {scenario.schedule.endTime}</span>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Нет расписания</p>
                )}
              </div>
            </Card>
          ))}
        </div>

        <Dialog open={!!editingScenario} onOpenChange={(open) => !open && setEditingScenario(null)}>
          <DialogContent className="glassmorphism border-0 max-w-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {editingScenario && (
                  <div className={`${editingScenario.gradient} p-2 rounded-lg`}>
                    <Icon name={editingScenario.icon as string} size={18} />
                  </div>
                )}
                {editingScenario?.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-5 pt-2">
              <div className="flex items-center justify-between">
                <Label className="text-base">Расписание включено</Label>
                <Switch
                  checked={scheduleForm.enabled}
                  onCheckedChange={(v) => setScheduleForm(prev => ({ ...prev, enabled: v }))}
                />
              </div>
              <div className={`space-y-4 transition-opacity ${scheduleForm.enabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                <div className="space-y-2">
                  <Label>Начало работы</Label>
                  <Input
                    type="time"
                    value={scheduleForm.startTime}
                    onChange={(e) => setScheduleForm(prev => ({ ...prev, startTime: e.target.value }))}
                    className="glassmorphism border-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Конец работы</Label>
                  <Input
                    type="time"
                    value={scheduleForm.endTime}
                    onChange={(e) => setScheduleForm(prev => ({ ...prev, endTime: e.target.value }))}
                    className="glassmorphism border-white/10"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <Button
                  className="flex-1 gradient-purple-pink border-0"
                  onClick={saveSchedule}
                >
                  <Icon name="Check" size={16} className="mr-1" />
                  Сохранить
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => activateScenario(editingScenario!.name)}
                >
                  <Icon name="Play" size={16} className="mr-1" />
                  Активировать
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </TabsContent>

      <TabsContent value="schedule" className="space-y-4 mt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Расписание</h2>
          <Button size="sm" className="gradient-purple-pink border-0">
            <Icon name="Plus" size={16} className="mr-1" />
            Добавить
          </Button>
        </div>
        <div className="space-y-3">
          {schedule.map((item) => (
            <Card key={item.id} className="glassmorphism p-4 border-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="gradient-blue-orange p-3 rounded-lg">
                    <Icon name="Clock" size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-lg">{item.time}</p>
                    <p className="text-sm text-muted-foreground">{item.action} • {item.room}</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="settings" className="space-y-4 mt-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Уведомления</h2>
          <div className="space-y-3">
            {notifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={`glassmorphism p-4 border-0 border-l-4 ${
                  notification.type === 'error' ? 'border-l-destructive' :
                  notification.type === 'warning' ? 'border-l-yellow-500' :
                  'border-l-accent'
                }`}
              >
                <div className="flex gap-3">
                  <div className={`p-2 rounded-lg ${
                    notification.type === 'error' ? 'bg-destructive/20' :
                    notification.type === 'warning' ? 'bg-yellow-500/20' :
                    'bg-accent/20'
                  }`}>
                    <Icon 
                      name={
                        notification.type === 'error' ? 'AlertCircle' :
                        notification.type === 'warning' ? 'AlertTriangle' :
                        'Info'
                      } 
                      size={20}
                      className={
                        notification.type === 'error' ? 'text-destructive' :
                        notification.type === 'warning' ? 'text-yellow-500' :
                        'text-accent'
                      }
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-8 space-y-4">
            <h3 className="text-lg font-semibold">Настройки</h3>
            <Card className="glassmorphism p-4 border-0 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Автоматизация</p>
                  <p className="text-sm text-muted-foreground">Умное управление по расписанию</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Push-уведомления</p>
                  <p className="text-sm text-muted-foreground">Получать оповещения</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Энергосбережение</p>
                  <p className="text-sm text-muted-foreground">Автовыключение неиспользуемых</p>
                </div>
                <Switch />
              </div>
            </Card>
          </div>

          <div className="mt-8 space-y-4">
            <h3 className="text-lg font-semibold">Скачать приложение</h3>
            <Card className="glassmorphism p-5 border-0">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl gradient-purple-pink">
                  <Icon name="Smartphone" size={24} />
                </div>
                <div>
                  <p className="font-semibold text-base">Smart Home</p>
                  <p className="text-sm text-muted-foreground">Управляй домом с телефона</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="https://play.google.com/store"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-black hover:bg-zinc-900 transition-colors rounded-xl px-4 py-3 flex-1"
                >
                  <svg viewBox="0 0 24 24" className="w-7 h-7 shrink-0" fill="none">
                    <path d="M3.18 23.76c.38.22.82.24 1.22.07L16.07 12 12.5 8.43 3.18 23.76Z" fill="#EA4335"/>
                    <path d="M20.82 10.6 17.5 8.72l-3.93 3.28 3.93 3.28 3.35-1.9a1.4 1.4 0 0 0 0-2.78Z" fill="#FBBC04"/>
                    <path d="M4.4.17A1.38 1.38 0 0 0 3.18.24L12.5 9.57l3.57-3.57L4.4.17Z" fill="#4285F4"/>
                    <path d="M3.18.24A1.4 1.4 0 0 0 2.5 1.4v21.2c0 .48.25.9.68 1.16L12.5 14 3.18.24Z" fill="#34A853"/>
                  </svg>
                  <div>
                    <p className="text-[10px] text-gray-400 leading-none">Доступно в</p>
                    <p className="text-sm font-semibold text-white leading-tight mt-0.5">Google Play</p>
                  </div>
                </a>
                <a
                  href="https://apps.apple.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-black hover:bg-zinc-900 transition-colors rounded-xl px-4 py-3 flex-1"
                >
                  <svg viewBox="0 0 24 24" className="w-7 h-7 shrink-0" fill="white">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11Z"/>
                  </svg>
                  <div>
                    <p className="text-[10px] text-gray-400 leading-none">Загрузите в</p>
                    <p className="text-sm font-semibold text-white leading-tight mt-0.5">App Store</p>
                  </div>
                </a>
              </div>
              <p className="text-xs text-muted-foreground mt-3 text-center">
                Бесплатно · iOS 14+ и Android 8+
              </p>
            </Card>
          </div>
        </div>
      </TabsContent>
    </>
  );
};

export default RoomsScenariosSettingsTabs;