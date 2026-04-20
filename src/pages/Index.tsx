import { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { Light, Scenario, ScenarioSchedule, ScheduleItem, Notification, Product, CartItem, Room } from '@/components/types';
import HeaderWithNotifications from '@/components/HeaderWithNotifications';
import HomeMapShopTabs from '@/components/HomeMapShopTabs';
import RoomsScenariosSettingsTabs from '@/components/RoomsScenariosSettingsTabs';
import RoomManager from '@/components/RoomManager';
import InteractiveMap from '@/components/InteractiveMap';
import { useDemoSync } from '@/hooks/useDemoSync';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const loadRoomsFromStorage = (): Room[] => {
  try {
    const saved = localStorage.getItem('smartHomeRooms');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load rooms from storage:', e);
  }
  return [
    { id: '1', name: 'Гостиная', icon: 'Sofa', color: 'rgba(139, 92, 246, 0.2)', x: 10, y: 80, width: 120, height: 100 },
    { id: '2', name: 'Спальня', icon: 'Bed', color: 'rgba(14, 165, 233, 0.2)', x: 150, y: 80, width: 120, height: 100 },
    { id: '3', name: 'Кухня', icon: 'Utensils', color: 'rgba(249, 115, 22, 0.2)', x: 290, y: 80, width: 100, height: 100 },
  ];
};

const loadLightsFromStorage = (): Light[] => {
  try {
    const saved = localStorage.getItem('smartHomeLights');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load lights from storage:', e);
  }
  return [
    { id: '1', name: 'Люстра', room: 'Гостиная', isOn: true, brightness: 80 },
    { id: '2', name: 'Торшер', room: 'Гостиная', isOn: false, brightness: 60 },
    { id: '3', name: 'Потолок', room: 'Спальня', isOn: true, brightness: 50 },
    { id: '4', name: 'Лента RGB', room: 'Спальня', isOn: true, brightness: 90 },
    { id: '5', name: 'Основной', room: 'Кухня', isOn: false, brightness: 70 },
    { id: '6', name: 'Рабочая зона', room: 'Кухня', isOn: true, brightness: 100 },
  ];
};

const Index = () => {
  const [lights, setLights] = useState<Light[]>(loadLightsFromStorage);
  const [rooms, setRooms] = useState<Room[]>(loadRoomsFromStorage);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [demoMode, setDemoMode] = useState(false);
  const [scenarioSchedules, setScenarioSchedules] = useState<Record<string, ScenarioSchedule>>({});
  const { broadcast } = useDemoSync(lights, setLights, demoMode);

  useEffect(() => {
    try {
      localStorage.setItem('smartHomeRooms', JSON.stringify(rooms));
    } catch (e) {
      console.error('Failed to save rooms:', e);
    }
  }, [rooms]);

  useEffect(() => {
    try {
      localStorage.setItem('smartHomeLights', JSON.stringify(lights));
    } catch (e) {
      console.error('Failed to save lights:', e);
    }
  }, [lights]);

  const updateScenarioSchedule = (id: string, schedule: ScenarioSchedule) => {
    setScenarioSchedules(prev => ({ ...prev, [id]: schedule }));
    toast.success(`Расписание ${schedule.enabled ? 'сохранено' : 'отключено'}`);
  };

  const scenarios: Scenario[] = [
    { 
      id: '1', 
      name: 'Вечер', 
      icon: 'Sunset', 
      gradient: 'gradient-purple-pink',
      lights: {
        'Гостиная': { isOn: true, brightness: 40 },
        'Спальня': { isOn: true, brightness: 30 },
        'Кухня': { isOn: false, brightness: 0 }
      },
      roomColors: {
        'Гостиная': 'rgba(251, 146, 60, 0.25)',
        'Спальня': 'rgba(249, 115, 22, 0.2)',
        'Кухня': 'rgba(120, 113, 108, 0.15)'
      },
      schedule: scenarioSchedules['1'],
    },
    { 
      id: '2', 
      name: 'Работа', 
      icon: 'Laptop', 
      gradient: 'gradient-blue-orange',
      lights: {
        'Гостиная': { isOn: true, brightness: 100 },
        'Спальня': { isOn: false, brightness: 0 },
        'Кухня': { isOn: true, brightness: 100 }
      },
      roomColors: {
        'Гостиная': 'rgba(59, 130, 246, 0.25)',
        'Спальня': 'rgba(120, 113, 108, 0.15)',
        'Кухня': 'rgba(14, 165, 233, 0.25)'
      },
      schedule: scenarioSchedules['2'],
    },
    { 
      id: '3', 
      name: 'Релакс', 
      icon: 'CloudMoon', 
      gradient: 'gradient-purple-pink',
      lights: {
        'Гостиная': { isOn: false, brightness: 0 },
        'Спальня': { isOn: true, brightness: 20 },
        'Кухня': { isOn: false, brightness: 0 }
      },
      roomColors: {
        'Гостиная': 'rgba(120, 113, 108, 0.15)',
        'Спальня': 'rgba(139, 92, 246, 0.2)',
        'Кухня': 'rgba(120, 113, 108, 0.15)'
      },
      schedule: scenarioSchedules['3'],
    },
    { 
      id: '4', 
      name: 'Вечеринка', 
      icon: 'Music', 
      gradient: 'gradient-blue-orange',
      lights: {
        'Гостиная': { isOn: true, brightness: 100 },
        'Спальня': { isOn: true, brightness: 100 },
        'Кухня': { isOn: true, brightness: 80 }
      },
      roomColors: {
        'Гостиная': 'rgba(236, 72, 153, 0.25)',
        'Спальня': 'rgba(168, 85, 247, 0.25)',
        'Кухня': 'rgba(14, 165, 233, 0.25)'
      },
      schedule: scenarioSchedules['4'],
    },
  ];

  const schedule: ScheduleItem[] = [
    { id: '1', time: '07:00', action: 'Включить', room: 'Кухня' },
    { id: '2', time: '09:00', action: 'Включить', room: 'Гостиная' },
    { id: '3', time: '22:00', action: 'Приглушить', room: 'Спальня' },
    { id: '4', time: '23:30', action: 'Выключить', room: 'Все комнаты' },
  ];

  const [notifications] = useState<Notification[]>([
    { id: '1', type: 'warning', message: 'Лампа в спальне работает 8 часов подряд', time: '10 мин назад' },
    { id: '2', type: 'info', message: 'Все светильники в гостиной включены', time: '1 час назад' },
    { id: '3', type: 'error', message: 'Потеря связи с торшером в гостиной', time: '3 часа назад' },
  ]);

  const products: Product[] = [
    { id: '1', name: 'Умная лампочка E27', price: 1290, description: 'RGB, 9W, Wi-Fi', type: 'Лампа', image: 'https://cdn.poehali.dev/projects/79c4a0c8-7dc9-4f99-9fdd-ad9c768b7df0/files/94b60f2e-9aa6-4ca0-8748-81239c56648e.jpg' },
    { id: '2', name: 'LED лента 5м', price: 2490, description: 'RGB, пульт ДУ', type: 'Лента', image: 'https://cdn.poehali.dev/projects/79c4a0c8-7dc9-4f99-9fdd-ad9c768b7df0/files/eaa1a162-83ae-4087-a049-a1e5888d24bc.jpg' },
    { id: '3', name: 'Умный выключатель', price: 1890, description: 'Сенсорный, 2 клавиши', type: 'Выключатель', image: 'https://cdn.poehali.dev/projects/79c4a0c8-7dc9-4f99-9fdd-ad9c768b7df0/files/7decadd3-0e75-4da1-8ebf-cf2ceb73a153.jpg' },
    { id: '4', name: 'Настольная лампа', price: 3490, description: 'RGB, таймер сна', type: 'Лампа', image: 'https://cdn.poehali.dev/projects/79c4a0c8-7dc9-4f99-9fdd-ad9c768b7df0/files/06d2395a-ca8a-4e52-953d-5a380ce05387.jpg' },
    { id: '5', name: 'Потолочный светильник', price: 4990, description: 'Умное управление, 24W', type: 'Светильник', image: 'https://cdn.poehali.dev/projects/79c4a0c8-7dc9-4f99-9fdd-ad9c768b7df0/files/b8b07c0a-9b77-4f83-9bdc-b6304c3a7901.jpg' },
    { id: '6', name: 'Диммер Wi-Fi', price: 1590, description: 'Регулировка яркости', type: 'Аксессуар', image: 'https://cdn.poehali.dev/projects/79c4a0c8-7dc9-4f99-9fdd-ad9c768b7df0/files/b37e5a8b-4490-4a9e-81d7-c039ec4c4c38.jpg' },
  ];

  const [cart, setCart] = useState<CartItem[]>([]);

  const energyDataWeek = [
    { day: 'Пн', consumption: 12 },
    { day: 'Вт', consumption: 15 },
    { day: 'Ср', consumption: 10 },
    { day: 'Чт', consumption: 18 },
    { day: 'Пт', consumption: 14 },
    { day: 'Сб', consumption: 8 },
    { day: 'Вс', consumption: 6 },
  ];

  const energyDataMonth = [
    { month: 'Янв', consumption: 380, cost: 1520 },
    { month: 'Фев', consumption: 340, cost: 1360 },
    { month: 'Мар', consumption: 320, cost: 1280 },
    { month: 'Апр', consumption: 290, cost: 1160 },
    { month: 'Май', consumption: 250, cost: 1000 },
    { month: 'Июн', consumption: 220, cost: 880 },
  ];

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.product.id === product.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.product.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
    toast.success(`${product.name} добавлен в корзину`);
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
    toast.success('Товар удален из корзины');
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(cart.map(item => 
        item.product.id === productId 
          ? { ...item, quantity }
          : item
      ));
    }
  };

  const toggleLight = (id: string) => {
    const light = lights.find(l => l.id === id);
    if (light) {
      const newState = !light.isOn;
      setLights(lights.map(l => 
        l.id === id ? { ...l, isOn: newState } : l
      ));
      broadcast({ type: 'toggle', lightId: id, value: newState });
      toast.success('Состояние изменено');
    }
  };

  const toggleRoomLights = (room: string, turnOn: boolean) => {
    setLights(lights.map(light => 
      light.room === room ? { ...light, isOn: turnOn } : light
    ));
    broadcast({ type: 'room_toggle', roomName: room, value: turnOn });
    toast.success(`Все светильники в комнате "${room}" ${turnOn ? 'включены' : 'выключены'}`);
  };

  const setBrightness = (id: string, value: number) => {
    setLights(lights.map(light => 
      light.id === id ? { ...light, brightness: value } : light
    ));
    broadcast({ type: 'brightness', lightId: id, value });
  };

  const setRoomBrightness = (room: string, value: number) => {
    setLights(lights.map(light => 
      light.room === room ? { ...light, brightness: value } : light
    ));
    broadcast({ type: 'room_brightness', roomName: room, value });
    toast.success(`Яркость в комнате "${room}" установлена на ${value}%`);
  };

  const activateScenario = (name: string) => {
    const scenario = scenarios.find(s => s.name === name);
    if (!scenario) return;

    setLights(prevLights => 
      prevLights.map(light => {
        const roomSettings = scenario.lights[light.room];
        if (roomSettings) {
          return {
            ...light,
            isOn: roomSettings.isOn,
            brightness: roomSettings.brightness
          };
        }
        return light;
      })
    );

    if (scenario.roomColors) {
      setRooms(prevRooms =>
        prevRooms.map(room => ({
          ...room,
          color: scenario.roomColors?.[room.name] || room.color
        }))
      );
    }

    toast.success(`Сценарий "${name}" активирован`);
  };

  const activeCount = lights.filter(l => l.isOn).length;
  const totalPower = lights.filter(l => l.isOn).reduce((sum, l) => sum + l.brightness, 0);

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 md:pb-6">
      <div className="max-w-md md:max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto px-4 py-6 space-y-6">
        <HeaderWithNotifications 
          notifications={notifications}
          activeCount={activeCount}
          totalLights={lights.length}
          totalPower={totalPower}
        />

        <div className="glassmorphism border-0 p-3 rounded-xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Icon name="MonitorPlay" size={18} className="text-purple-500" />
            <Label htmlFor="demo-mode" className="text-sm font-medium cursor-pointer">
              Режим демонстрации
            </Label>
          </div>
          <Switch 
            id="demo-mode"
            checked={demoMode} 
            onCheckedChange={setDemoMode}
          />
        </div>

        <Tabs defaultValue="home" className="animate-scale-in">
          <TabsList className="grid w-full grid-cols-6 bg-muted/50 md:gap-2">
            <TabsTrigger value="home" className="data-[state=active]:gradient-purple-pink flex items-center gap-2">
              <Icon name="Home" size={20} />
              <span className="hidden md:inline">Главная</span>
            </TabsTrigger>
            <TabsTrigger value="map" className="data-[state=active]:gradient-purple-pink flex items-center gap-2">
              <Icon name="Map" size={20} />
              <span className="hidden md:inline">Карта</span>
            </TabsTrigger>
            <TabsTrigger value="rooms" className="data-[state=active]:gradient-purple-pink flex items-center gap-2">
              <Icon name="Lightbulb" size={20} />
              <span className="hidden md:inline">Комнаты</span>
            </TabsTrigger>
            <TabsTrigger value="scenarios" className="data-[state=active]:gradient-purple-pink flex items-center gap-2">
              <Icon name="Sparkles" size={20} />
              <span className="hidden md:inline">Сценарии</span>
            </TabsTrigger>
            <TabsTrigger value="shop" className="data-[state=active]:gradient-purple-pink flex items-center gap-2">
              <Icon name="ShoppingBag" size={20} />
              <span className="hidden md:inline">Магазин</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:gradient-purple-pink flex items-center gap-2">
              <Icon name="Settings" size={20} />
              <span className="hidden md:inline">Настройки</span>
            </TabsTrigger>
          </TabsList>

          <HomeMapShopTabs 
            lights={lights}
            products={products}
            cart={cart}
            energyDataWeek={energyDataWeek}
            energyDataMonth={energyDataMonth}
            toggleLight={toggleLight}
            toggleRoomLights={toggleRoomLights}
            setBrightness={setBrightness}
            setRoomBrightness={setRoomBrightness}
            setLights={setLights}
            addToCart={addToCart}
            removeFromCart={removeFromCart}
            updateQuantity={updateQuantity}
            rooms={rooms}
            setRooms={setRooms}
            selectedRoom={selectedRoom}
            onRoomClick={setSelectedRoom}
          />

          <RoomsScenariosSettingsTabs 
            lights={lights}
            scenarios={scenarios}
            schedule={schedule}
            notifications={notifications}
            toggleLight={toggleLight}
            toggleRoomLights={toggleRoomLights}
            setRoomBrightness={setRoomBrightness}
            activateScenario={activateScenario}
            onUpdateScenarioSchedule={updateScenarioSchedule}
          />
        </Tabs>
      </div>
    </div>
  );
};

export default Index;