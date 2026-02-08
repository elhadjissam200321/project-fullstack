const database = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const { defaultPassword } = require('./sample-accounts');
const { sampleEventImages, sampleEvents } = require('./sample-events');

async function seed() {
    try {
        console.log('🌱 Starting Massive Realistic Seeding...');

        // 1. Cleanup
        await database.run('DELETE FROM registrations');
        await database.run('DELETE FROM events');
        await database.run('DELETE FROM profiles');
        await database.run('DELETE FROM users');
        console.log('🧹 Database cleaned.');

        const passwordHash = await bcrypt.hash(defaultPassword, 10);

        // 2. Generate 20 Organisateurs
        const organisateurs = [];
        const firstNames = ['Youssef', 'Fatima', 'Mohammed', 'Salma', 'Amine', 'Nadia', 'Karim', 'Zineb', 'Omar', 'Laila', 'Rachid', 'Samira', 'Hassan', 'Meriem', 'Mehdi', 'Sara', 'Ayoub', 'Imane', 'Hamza', 'Dounia'];
        const lastNames = ['Bennani', 'El Amrani', 'Alaoui', 'Benjelloun', 'Tazi', 'Chraibi', 'Fassi', 'Kettani', 'Idrissi', 'Bensouda', 'Berrada', 'Tounsi', 'Filali', 'Sefrioui', 'Lazrak', 'Bouazza', 'Ziani', 'Naciri', 'Benmoussa', 'Alami'];

        for (let i = 0; i < 20; i++) {
            const id = uuidv4();
            const fullName = `${firstNames[i]} ${lastNames[i]}`;
            const email = `${firstNames[i].toLowerCase()}.${lastNames[i].toLowerCase()}${i}@academeet.ma`;

            await database.run('INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)', [id, email, passwordHash]);
            await database.run('INSERT INTO profiles (id, user_id, full_name, role) VALUES (?, ?, ?, ?)', [uuidv4(), id, fullName, 'organisateur']);
            organisateurs.push({ id, fullName });
        }
        console.log('👥 20 Organisateurs created.');

        // 3. Generate 20 Participants
        const participants = [];
        for (let i = 0; i < 20; i++) {
            const id = uuidv4();
            // Use different names for participants to avoid collisions
            const firstName = lastNames[(i + 5) % 20];
            const lastName = firstNames[(i + 10) % 20];
            const fullName = `${firstName} ${lastName}`;
            const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@gmail.com`;

            await database.run('INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)', [id, email, passwordHash]);
            await database.run('INSERT INTO profiles (id, user_id, full_name, role) VALUES (?, ?, ?, ?)', [uuidv4(), id, fullName, 'participant']);
            participants.push({ id, firstName, lastName, email, fullName });
        }
        console.log('👥 20 Participants created.');

        // 4. Generate 5-8 Events per Organisateur
        const allEvents = [];
        const locations = ['Casablanca', 'Rabat', 'Marrakech', 'Tanger', 'Agadir', 'Fès', 'Meknès', 'Oujda', 'Kenitra', 'Tétouan'];
        const categories = ['conference', 'workshop', 'networking', 'festival', 'gala', 'other'];

        for (const org of organisateurs) {
            const eventCount = Math.floor(Math.random() * 4) + 5; // 5 to 8
            for (let j = 0; j < eventCount; j++) {
                const eventId = uuidv4();
                const template = sampleEvents[Math.floor(Math.random() * sampleEvents.length)];
                const location = locations[Math.floor(Math.random() * locations.length)];
                const category = categories[Math.floor(Math.random() * categories.length)];
                const capacity = Math.floor(Math.random() * 200) + 50;
                const daysFromNow = Math.floor(Math.random() * 60) - 10; // Some past, some future
                const eventDate = new Date();
                eventDate.setDate(eventDate.getDate() + daysFromNow);

                await database.run(
                    `INSERT INTO events (id, title, description, location, category, capacity, event_date, image_url, created_by) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        eventId,
                        `${template.title.split(' - ')[0]} - ${location} Ed. ${j + 1}`,
                        template.description,
                        `${location}`,
                        category,
                        capacity,
                        eventDate.toISOString(),
                        sampleEventImages[category] || sampleEventImages['conference'],
                        org.id
                    ]
                );
                allEvents.push({ id: eventId, capacity });
            }
        }
        console.log(`📅 ${allEvents.length} Events created.`);

        // 5. Each Participant registers for at least 5 events
        for (const part of participants) {
            const registrationCount = Math.floor(Math.random() * 5) + 5; // 5 to 10
            const shuffledEvents = [...allEvents].sort(() => 0.5 - Math.random());
            const selectedEvents = shuffledEvents.slice(0, registrationCount);

            for (const event of selectedEvents) {
                await database.run(
                    `INSERT INTO registrations (id, event_id, first_name, last_name, email, phone, status) 
                     VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [
                        uuidv4(),
                        event.id,
                        part.firstName,
                        part.lastName,
                        part.email,
                        `+212 6${Math.floor(10000000 + Math.random() * 90000000)}`,
                        'confirmed'
                    ]
                );
            }
        }
        console.log('📝 Dense registrations created.');

        console.log('✅ Massive Realistic Seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

seed();
