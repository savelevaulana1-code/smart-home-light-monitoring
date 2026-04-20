export interface Light {
  id: string;
  name: string;
  room: string;
  isOn: boolean;
  brightness: number;
  x?: number;
  y?: number;
}

export interface ScenarioSchedule {
  enabled: boolean;
  startTime: string;
  endTime: string;
}

export interface Scenario {
  id: string;
  name: string;
  icon: string;
  gradient: string;
  lights: {
    [room: string]: {
      isOn: boolean;
      brightness: number;
    };
  };
  roomColors?: {
    [room: string]: string;
  };
  schedule?: ScenarioSchedule;
}

export interface ScheduleItem {
  id: string;
  time: string;
  action: string;
  room: string;
}

export interface Notification {
  id: string;
  type: 'warning' | 'info' | 'error';
  message: string;
  time: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  type: string;
  image: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Room {
  id: string;
  name: string;
  icon: string;
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
}