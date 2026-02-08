const { format } = require('date-fns');

// Mock data
const participants = [
    {
        registered_at: '2026-02-07T11:00:00.000Z',
        profile: { full_name: 'Malika Tazi', email: 'malika@example.com' },
        event_title: "Conférence Tech Casablanca"
    },
    {
        registered_at: '2026-02-06T15:30:00.000Z',
        profile: { full_name: 'Youssef Bennani', email: 'youssef@example.com' },
        event_title: "Startups Rabat" // Different event
    }
];

// Mock component function
function exportCSV_Simulation(participants) {
    const headers = ['Nom', 'Email', 'Date d\'inscription', 'Événement'];
    const rows = participants.map(p => [
        p.profile.full_name,
        p.profile.email,
        format(new Date(p.registered_at), 'yyyy-MM-dd HH:mm'),
        p.event_title || 'Selected Event Title' // Simulating logic
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    console.log(csvContent);
    return csvContent;
}

exportCSV_Simulation(participants);
