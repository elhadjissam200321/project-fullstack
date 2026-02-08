// Sample participant data for seeding demo registrations
const sampleParticipants = [
    // Moroccan names - Tech enthusiasts
    { firstName: 'Youssef', lastName: 'Bennani', email: 'youssef.bennani@email.ma', phone: '+212 6 12 34 56 78' },
    { firstName: 'Fatima', lastName: 'El Amrani', email: 'fatima.elamrani@email.ma', phone: '+212 6 23 45 67 89' },
    { firstName: 'Mohammed', lastName: 'Alaoui', email: 'mohammed.alaoui@email.ma', phone: '+212 6 34 56 78 90' },
    { firstName: 'Salma', lastName: 'Benjelloun', email: 'salma.benjelloun@email.ma', phone: '+212 6 45 67 89 01' },
    { firstName: 'Amine', lastName: 'Tazi', email: 'amine.tazi@email.ma', phone: '+212 6 56 78 90 12' },
    { firstName: 'Nadia', lastName: 'Chraibi', email: 'nadia.chraibi@email.ma', phone: '+212 6 67 89 01 23' },
    { firstName: 'Karim', lastName: 'Fassi Fihri', email: 'karim.fassifihri@email.ma', phone: '+212 6 78 90 12 34' },
    { firstName: 'Zineb', lastName: 'Kettani', email: 'zineb.kettani@email.ma', phone: '+212 6 89 01 23 45' },
    { firstName: 'Omar', lastName: 'Idrissi', email: 'omar.idrissi@email.ma', phone: '+212 6 90 12 34 56' },
    { firstName: 'Laila', lastName: 'Bensouda', email: 'laila.bensouda@email.ma', phone: '+212 6 01 23 45 67' },

    // Business professionals
    { firstName: 'Rachid', lastName: 'Berrada', email: 'rachid.berrada@email.ma', phone: '+212 6 12 34 56 79' },
    { firstName: 'Samira', lastName: 'Tounsi', email: 'samira.tounsi@email.ma', phone: '+212 6 23 45 67 80' },
    { firstName: 'Hassan', lastName: 'Filali', email: 'hassan.filali@email.ma', phone: '+212 6 34 56 78 91' },
    { firstName: 'Meriem', lastName: 'Sefrioui', email: 'meriem.sefrioui@email.ma', phone: '+212 6 45 67 89 02' },
    { firstName: 'Mehdi', lastName: 'Lazrak', email: 'mehdi.lazrak@email.ma', phone: '+212 6 56 78 90 13' },

    // Students & Young professionals
    { firstName: 'Sara', lastName: 'Bouazza', email: 'sara.bouazza@email.ma', phone: '+212 6 67 89 01 24' },
    { firstName: 'Ayoub', lastName: 'Ziani', email: 'ayoub.ziani@email.ma', phone: '+212 6 78 90 12 35' },
    { firstName: 'Imane', lastName: 'Naciri', email: 'imane.naciri@email.ma', phone: '+212 6 89 01 23 46' },
    { firstName: 'Hamza', lastName: 'Benmoussa', email: 'hamza.benmoussa@email.ma', phone: '+212 6 90 12 34 57' },
    { firstName: 'Dounia', lastName: 'Alami', email: 'dounia.alami@email.ma', phone: '+212 6 01 23 45 68' },

    // Artists & Creatives
    { firstName: 'Hicham', lastName: 'Tahiri', email: 'hicham.tahiri@email.ma', phone: '+212 6 12 34 56 80' },
    { firstName: 'Kenza', lastName: 'Mansouri', email: 'kenza.mansouri@email.ma', phone: '+212 6 23 45 67 81' },
    { firstName: 'Bilal', lastName: 'Cherkaoui', email: 'bilal.cherkaoui@email.ma', phone: '+212 6 34 56 78 92' },
    { firstName: 'Amina', lastName: 'Benkirane', email: 'amina.benkirane@email.ma', phone: '+212 6 45 67 89 03' },
    { firstName: 'Tarik', lastName: 'Ouazzani', email: 'tarik.ouazzani@email.ma', phone: '+212 6 56 78 90 14' },

    // Entrepreneurs
    { firstName: 'Leila', lastName: 'Benani', email: 'leila.benani@email.ma', phone: '+212 6 67 89 01 25' },
    { firstName: 'Saad', lastName: 'Lahlou', email: 'saad.lahlou@email.ma', phone: '+212 6 78 90 12 36' },
    { firstName: 'Houda', lastName: 'Sqalli', email: 'houda.sqalli@email.ma', phone: '+212 6 89 01 23 47' },
    { firstName: 'Adil', lastName: 'Benabdellah', email: 'adil.benabdellah@email.ma', phone: '+212 6 90 12 34 58' },
    { firstName: 'Rim', lastName: 'Bensaid', email: 'rim.bensaid@email.ma', phone: '+212 6 01 23 45 69' },

    // International participants
    { firstName: 'Sophie', lastName: 'Martin', email: 'sophie.martin@email.fr', phone: '+33 6 12 34 56 78' },
    { firstName: 'Ahmed', lastName: 'Hassan', email: 'ahmed.hassan@email.eg', phone: '+20 10 1234 5678' },
    { firstName: 'Maria', lastName: 'Garcia', email: 'maria.garcia@email.es', phone: '+34 612 34 56 78' },
    { firstName: 'David', lastName: 'Johnson', email: 'david.johnson@email.com', phone: '+1 555 123 4567' },
    { firstName: 'Aisha', lastName: 'Diallo', email: 'aisha.diallo@email.sn', phone: '+221 77 123 45 67' },

    // More diverse participants
    { firstName: 'Soufiane', lastName: 'Elhaddad', email: 'soufiane.elhaddad@email.ma', phone: '+212 6 12 34 56 81' },
    { firstName: 'Ghita', lastName: 'Benslimane', email: 'ghita.benslimane@email.ma', phone: '+212 6 23 45 67 82' },
    { firstName: 'Yassine', lastName: 'Benjelloun', email: 'yassine.benjelloun@email.ma', phone: '+212 6 34 56 78 93' },
    { firstName: 'Malika', lastName: 'Tazi', email: 'malika.tazi@email.ma', phone: '+212 6 45 67 89 04' },
    { firstName: 'Ismail', lastName: 'Berrada', email: 'ismail.berrada@email.ma', phone: '+212 6 56 78 90 15' },
    { firstName: 'Hanane', lastName: 'Fassi', email: 'hanane.fassi@email.ma', phone: '+212 6 67 89 01 26' },
    { firstName: 'Othmane', lastName: 'Alaoui', email: 'othmane.alaoui@email.ma', phone: '+212 6 78 90 12 37' },
    { firstName: 'Siham', lastName: 'Chraibi', email: 'siham.chraibi@email.ma', phone: '+212 6 89 01 23 48' },
    { firstName: 'Nabil', lastName: 'Kettani', email: 'nabil.kettani@email.ma', phone: '+212 6 90 12 34 59' },
    { firstName: 'Rajae', lastName: 'Idrissi', email: 'rajae.idrissi@email.ma', phone: '+212 6 01 23 45 70' },
    { firstName: 'Khalid', lastName: 'Bensouda', email: 'khalid.bensouda@email.ma', phone: '+212 6 12 34 56 82' },
    { firstName: 'Wafa', lastName: 'Tounsi', email: 'wafa.tounsi@email.ma', phone: '+212 6 23 45 67 83' },
    { firstName: 'Mustapha', lastName: 'Filali', email: 'mustapha.filali@email.ma', phone: '+212 6 34 56 78 94' },
    { firstName: 'Loubna', lastName: 'Sefrioui', email: 'loubna.sefrioui@email.ma', phone: '+212 6 45 67 89 05' },
];

// Helper function to get random participants
function getRandomParticipants(count) {
    const shuffled = [...sampleParticipants].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, sampleParticipants.length));
}

module.exports = {
    sampleParticipants,
    getRandomParticipants
};
