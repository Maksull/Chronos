import { EventData } from '@/types/account';

interface NagerHoliday {
    date: string;
    localName: string;
    name: string;
}

const holidayCache = new Map<string, EventData[]>();

export async function fetchHolidaysForRegion(
    region: string,
    year: number,
): Promise<EventData[]> {
    if (!region) {
        return [];
    }

    const cacheKey = `${region}-${year}`;
    if (holidayCache.has(cacheKey)) {
        return holidayCache.get(cacheKey) || [];
    }

    try {
        const response = await fetch(
            `https://date.nager.at/api/v3/PublicHolidays/${year}/${region}`,
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch holidays: ${response.status}`);
        }

        const holidays = (await response.json()) as NagerHoliday[];

        // Check if the response is an empty array
        if (!holidays || holidays.length === 0) {
            console.warn(
                `No holidays found for region: ${region}, year: ${year}`,
            );
            return [];
        }

        const uniqueHolidays = new Map();

        holidays.forEach((holiday: NagerHoliday) => {
            const holidayDate = new Date(holiday.date);
            const dateKey = holidayDate.toISOString().split('T')[0];
            const holidayKey = `${dateKey}-${holiday.localName}`;

            if (!uniqueHolidays.has(holidayKey)) {
                const endDate = new Date(holidayDate);
                endDate.setHours(23, 59, 59);

                const holidayEvent: EventData = {
                    id: `holiday-${dateKey}-${holiday.name.replace(/\s/g, '-')}-${Math.random().toString(36).substring(2, 7)}`,
                    name: holiday.localName,
                    description: `${holiday.name} (${holiday.localName !== holiday.name ? holiday.name : 'National Holiday'})`,
                    startDate: holidayDate.toISOString(),
                    endDate: endDate.toISOString(),
                    color: '#FF4500',
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

        const holidayEvents = Array.from(uniqueHolidays.values());

        holidayCache.set(cacheKey, holidayEvents);

        return holidayEvents;
    } catch {
        return [];
    }
}

export function clearHolidayCache(): void {
    holidayCache.clear();
}
