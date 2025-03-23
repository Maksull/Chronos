import { Calendar, Globe, UserCircle, TrendingUp } from 'lucide-react';
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
            {/* Calendar Count Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/20 p-3 rounded-xl">
                        <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {dict.account.stats.totalCalendars}
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {calendarCount}
                        </p>
                    </div>
                </div>
            </div>

            {/* Region Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-800/20 p-3 rounded-xl">
                        <Globe className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {dict.account.stats.region}
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {profileData.region || dict.account.stats.noRegion}
                        </p>
                    </div>
                </div>
            </div>

            {/* Member Since Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-800/20 p-3 rounded-xl">
                        <UserCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {dict.account.stats.member}
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {formatDate(profileData.createdAt)}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
