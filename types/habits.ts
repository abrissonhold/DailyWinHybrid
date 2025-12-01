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

export const isScheduledForToday = (habit: Habit): boolean => {
    const today = new Date();
    const todayStr = formatDate(today);
    const dayOfWeek = today.toLocaleString('en-US', { weekday: 'long' }).toUpperCase();
    const dayOfMonth = today.getDate();

    const startDate = parseDate(habit.startDate);
    const endDate = parseDate(habit.endDate);

    if (today < startDate || today > endDate) {
        return false;
    }

    switch (habit.frequency) {
        case Frequency.DAILY:
            return true;
        case Frequency.WEEKLY:
            return habit.daysOfWeek.includes(dayOfWeek);
        case Frequency.MONTHLY:
            const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
            const scheduledDay = startDate.getDate();
            if (scheduledDay > lastDayOfMonth) {
                return dayOfMonth === lastDayOfMonth;
            }
            return dayOfMonth === scheduledDay;
        default:
            return false;
    }
};

const habitColors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FED766', '#2AB7CA',
    '#F0B37E', '#8A6F94', '#939597', '#F4A261', '#E76F51'
];

export const getHabitColor = (habitId: string, theme: MD3Theme): string => {
    const hashCode = (str: string) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash |= 0;
        }
        return hash;
    };

    const index = Math.abs(hashCode(habitId)) % habitColors.length;
    return habitColors[index];
};

export const getPriorityColor = (priority: Priority): string => {
    switch (priority) {
        case Priority.HIGH:
            return '#E53935';
        case Priority.MEDIUM:
            return '#FB8C00';
        case Priority.LOW:
            return '#43A047';
        default:
            return '#000000';
    }
};
