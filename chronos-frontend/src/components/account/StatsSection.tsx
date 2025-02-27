// src/components/account/StatsSection.tsx
import { Calendar, Globe, UserCircle } from 'lucide-react';
import { Dictionary } from '@/lib/dictionary';
import { ProfileData } from '@/types/account';

interface StatsSectionProps {
    profileData: ProfileData;
    calendarCount: number;
    dict: Dictionary;
}

const formatDate = (dateString: string): string => {
    return dateString ? new Date(dateString).toLocaleDateString() : '';
};

export const StatsSection: React.FC<StatsSectionProps> = ({
    profileData,
    calendarCount,
    dict,
}) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 transition-all hover:shadow-md">
                <div className="flex items-center gap-4">
                    <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-lg">
                        <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {dict.account.stats.totalCalendars}
                        </p>
                        <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                            {calendarCount}
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 transition-all hover:shadow-md">
                <div className="flex items-center gap-4">
                    <div className="bg-purple-100 dark:bg-purple-900/50 p-3 rounded-lg">
                        <Globe className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {dict.account.stats.region}
                        </p>
                        <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                            {profileData.region || dict.account.stats.noRegion}
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 transition-all hover:shadow-md">
                <div className="flex items-center gap-4">
                    <div className="bg-green-100 dark:bg-green-900/50 p-3 rounded-lg">
                        <UserCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {dict.account.stats.member}
                        </p>
                        <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                            {formatDate(profileData.createdAt)}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
