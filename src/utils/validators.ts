
import { format, parse } from 'date-fns';


export const ProfileStrength = ({ percentage }: { percentage: number }) => {
    // 1. Determine Color and Status based on percentage
    if (percentage <= 40) {
        return {
            colors: ['#FF4D4D', '#FF2424'], // Red
            status: 'Weak',
            textColor: 'text-red-500'
        };
    } else if (percentage <= 70) {
        return {
            colors: ['#FFB84D', '#FF9D42'], // Yellow/Orange
            status: 'Average',
            textColor: 'text-orange-500'
        };
    } else {
        return {
            colors: ['#34D399', '#10B981'], // Green
            status: 'Excellent',
            textColor: 'text-green-500'
        };
    }
}

export const calculateProfileStrength = (profile: any) => {
    let strength = 0;
    const checklist = [
        { label: 'Profile Photo', weight: 25, isDone: !!profile?.profile_pic },
        { label: 'About Me', weight: 20, isDone: (profile?.about?.length > 20) },
        { label: 'Basics & Lifestyle', weight: 15, isDone: !!profile?.marital_status },
        { label: 'Career & Education', weight: 20, isDone: !!profile?.work_sector },
        { label: 'Family Details', weight: 20, isDone: !!profile?.family_type },
    ];

    checklist.forEach(item => {
        if (item.isDone) strength += item.weight;
    });

    return { strength, checklist };
};


export const dateFormat = (dateStr: any) => {
    const parsedDate = new Date(dateStr);
    const formatted = format(parsedDate, 'dd-MM-yyyy HH:mm');
    console.log(formatted); // Output: 21-05-2026 13:03
    return formatted;
}