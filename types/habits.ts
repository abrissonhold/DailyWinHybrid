import { MD3Theme } from "react-native-paper";

export enum Priority {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH'
}

export enum Frequency {
    DAILY = 'DAILY',
    WEEKLY = 'WEEKLY',
    MONTHLY = 'MONTHLY'
}

export interface Habit {
    id: string;
    userId: string;
    name: string;
    category: string;
    description: string;
    time: string;
    reminders: string[];
    priority: Priority;
    frequency: Frequency;
    startDate: string; 
    endDate: string;   
    dailyGoal: string;
    additionalGoal: string;
    streak: number;
    daysOfWeek: string[]; 
    completedDates: string[]; 
    imageUri: string;
    location: string;
    createdAt?: Date; 
}

export interface NewHabitInput {
    name: string;
    category: string;
    description?: string;
    time?: string;
    reminders?: string[];
    priority?: Priority;
    frequency?: Frequency;
    startDate?: string;
    endDate?: string;
    dailyGoal?: string;
    additionalGoal?: string;
    daysOfWeek?: string[];
    imageUri?: string;
    location?: string;
}

export interface HabitUpdate extends Partial<Habit> {
    id: string;
}

export interface HabitDTO extends Omit<Habit, 'id'> { }

export const getDefaultHabit = (): Omit<Habit, 'id' | 'userId'> => ({
    name: '',
    category: '',
    description: '',
    time: '',
    reminders: [],
    priority: Priority.LOW,
    frequency: Frequency.DAILY,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    dailyGoal: '',
    additionalGoal: '',
    streak: 0,
    daysOfWeek: [],
    completedDates: [],
    imageUri: '',
    location: ''
});

export const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const formatTime = (date: Date): string => {
    const hours = `${date.getHours()}`.padStart(2, "0");
    const minutes = `${date.getMinutes()}`.padStart(2, "0");
    return `${hours}:${minutes}`;
};

export const parseDate = (dateString: string): Date => {
    return new Date(dateString);
};

export const isCompletedToday = (habit: Habit): boolean => {
    const today = formatDate(new Date());
    return habit.completedDates.includes(today);
};

export const markAsCompleted = (habit: Habit, date?: Date): Habit => {
    const dateStr = date ? formatDate(date) : formatDate(new Date());

    if (habit.completedDates.includes(dateStr)) {
        return habit;
    }

    return {
        ...habit,
        completedDates: [...habit.completedDates, dateStr],
        streak: habit.streak + 1
    };
};

export const unmarkCompleted = (habit: Habit, date?: Date): Habit => {
    const dateStr = date ? formatDate(date) : formatDate(new Date());

    return {
        ...habit,
        completedDates: habit.completedDates.filter(d => d !== dateStr),
        streak: Math.max(0, habit.streak - 1)
    };
};

export const getPriorityColor = (priority: Priority, theme: MD3Theme): string => {
    switch (priority) {
      case Priority.HIGH:
        return theme.colors.error;
      case Priority.MEDIUM:
        return theme.colors.secondary;
      case Priority.LOW:
        return theme.colors.primary;
      default:
        return theme.colors.onSurface;
    }
  };