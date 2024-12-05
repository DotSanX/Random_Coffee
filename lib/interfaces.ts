export interface UserInfo {
  id: number;
  name: string;
  age: number;
  interests: string[];
  geo: Record<string, number>;
  time: string;
  state: string;
  rating: number;
  done: boolean;
}

