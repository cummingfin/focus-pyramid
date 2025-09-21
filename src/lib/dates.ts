import { startOfWeek, startOfMonth, startOfYear, format, isSameWeek, isSameMonth, isSameYear } from 'date-fns';
import { enUS } from 'date-fns/locale';

export const todayUTC = (): Date => {
  const now = new Date();
  return new Date(now.getTime() + now.getTimezoneOffset() * 60000);
};

export const getWeekStart = (date: Date = todayUTC()): Date => {
  return startOfWeek(date, { weekStartsOn: 1 });
};

export const getMonthStart = (date: Date = todayUTC()): Date => {
  return startOfMonth(date);
};

export const getYearStart = (date: Date = todayUTC()): Date => {
  return startOfYear(date);
};

export const isCurrentWeek = (date: Date): boolean => {
  return isSameWeek(date, todayUTC(), { weekStartsOn: 1 });
};

export const isCurrentMonth = (date: Date): boolean => {
  return isSameMonth(date, todayUTC());
};

export const isCurrentYear = (date: Date): boolean => {
  return isSameYear(date, todayUTC());
};

export const formatDate = (date: Date, formatStr: string = 'MMM dd, yyyy'): string => {
  return format(date, formatStr, { locale: enUS });
};

export const getMonthName = (date: Date = todayUTC()): string => {
  return format(date, 'MMMM', { locale: enUS });
};

export const getYear = (date: Date = todayUTC()): number => {
  return date.getFullYear();
};

export const getWeekDays = (weekStart: Date): Date[] => {
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + i);
    days.push(day);
  }
  return days;
};
