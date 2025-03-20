import { EventData } from '@/types/account';

const holidayCache = new Map<string, EventData[]>();

export async function fetchHolidaysForRegion(
    region: string,
    year: number,
): Promise<EventData[]> {
    // Skip if no region is provided
    if (!region) {
        return [];
    }

    // Check cache first
    const cacheKey = `${region}-${year}`;
    if (holidayCache.has(cacheKey)) {
        return holidayCache.get(cacheKey) || [];
    }

    try {
        // Using Nager.Date API which supports ISO country codes
        const response = await fetch(
            `https://date.nager.at/api/v3/PublicHolidays/${year}/${region}`,
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch holidays: ${response.status}`);
        }

        const holidays = await response.json();

        // Use a Map to deduplicate holidays based on date + name
        const uniqueHolidays = new Map();

        holidays.forEach((holiday: any) => {
            const holidayDate = new Date(holiday.date);
            const dateKey = holidayDate.toISOString().split('T')[0]; // YYYY-MM-DD format
            const holidayKey = `${dateKey}-${holiday.localName}`;

            // Only add this holiday if we haven't seen one with the same date + name
            if (!uniqueHolidays.has(holidayKey)) {
                // Create end date (same day, end of day)
                const endDate = new Date(holidayDate);
                endDate.setHours(23, 59, 59);

                const holidayEvent: EventData = {
                    id: `holiday-${dateKey}-${holiday.name.replace(/\\s/g, '-')}-${Math.random().toString(36).substring(2, 7)}`, // Add random suffix for uniqueness
                    name: holiday.localName,
                    description: `${holiday.name} (${holiday.localName !== holiday.name ? holiday.name : 'National Holiday'})`,
                    startDate: holidayDate.toISOString(),
                    endDate: endDate.toISOString(),
                    color: '#FF4500', // Orange-red color for holidays
                    isCompleted: false,
                    category: {
                        id: 'holidays',
                        name: 'Holidays',
                        description: 'National and public holidays',
                        color: '#FF4500',
                        createdAt: '',
                        updatedAt: '',
                    },
                    creator: {
                        id: 'system',
                        username: 'System',
                    },
                    createdAt: '',
                    updatedAt: '',
                };

                uniqueHolidays.set(holidayKey, holidayEvent);
            }
        });

        // Convert the Map values to an array
        const holidayEvents = Array.from(uniqueHolidays.values());

        // Cache the result
        holidayCache.set(cacheKey, holidayEvents);

        return holidayEvents;
    } catch (error) {
        console.error('Error fetching holidays:', error);
        return [];
    }
}

export function clearHolidayCache(): void {
    holidayCache.clear();
}
