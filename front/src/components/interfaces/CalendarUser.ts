import { Calendar } from './Calendar';
import { Usuario } from './Usuario';

export interface CalendarUser {
  calendarId: number;
  Calendar: Calendar;
  userId: number;
  Usuario: Usuario;
}