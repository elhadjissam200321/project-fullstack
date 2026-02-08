import { EventCategory } from '../models/models';

export const categoryLabels: Record<EventCategory, string> = {
    conference: 'Conférence',
    workshop: 'Atelier',
    networking: 'Networking',
    festival: 'Festival',
    gala: 'Gala',
    other: 'Autre',
};

export const categoryColors: Record<EventCategory, string> = {
    conference: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    workshop: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    networking: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    festival: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
    gala: 'bg-pink-500/10 text-pink-600 border-pink-500/20',
    other: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
};
