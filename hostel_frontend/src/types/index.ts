// src/types/index.ts

export interface AuthToken { // <--- ЭКСПОРТ И ПРАВИЛЬНОЕ ИМЯ
  token: string;
}

export interface Room {
  id: number;
  number: string;
  room_type: 'lux' | 'simple';
  room_type_display: string;
  beds_total: number;
  beds_taken: number;
  is_paid: boolean;
  check_in_date: string | null;
  check_in_time: string | null;
  days_booked: number;
  is_occupied: boolean;
  check_out_date: string | null;
  check_out_date_display: string | null;
}

export interface OccupancyData {
  beds_taken?: number;
  is_paid?: boolean;
  check_in_date?: string | null;
  check_in_time?: string | null;
  days_booked?: number;
}

export interface NewRoomData {
    number: string;
    room_type: 'lux' | 'simple';
    beds_total: number;
}