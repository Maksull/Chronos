// src/components/account/ProfileSection.tsx
import React from 'react';
import { UserCircle } from 'lucide-react';
import { Dictionary } from '@/lib/dictionary';
import { ProfileData } from '@/types/account';

interface ProfileSectionProps {
    profileData: ProfileData;
    setProfileData: React.Dispatch<React.SetStateAction<ProfileData>>;
    onUpdate: (updatedProfile: Partial<ProfileData>) => Promise<void>;
    isLoading: boolean;
    dict: Dictionary;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({
    profileData,
    setProfileData,
    onUpdate,
    isLoading,
    dict,
}) => {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdate(profileData);
    };

    return (
        <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <UserCircle className="h-6 w-6 text-gray-400" />
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            {dict.account.profile.title}
                        </h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    {dict.account.fields.username}
                                </label>
                                <input
                                    type="text"
                                    value={profileData.username}
                                    disabled
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 px-4 py-2.5 text-gray-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    {dict.account.fields.email}
                                </label>
                                <input
                                    type="email"
                                    value={profileData.email}
                                    disabled
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 px-4 py-2.5 text-gray-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    {dict.account.fields.fullName}
                                </label>
                                <input
                                    type="text"
                                    value={profileData.fullName}
                                    onChange={e =>
                                        setProfileData(prev => ({
                                            ...prev,
                                            fullName: e.target.value,
                                        }))
                                    }
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2.5 text-gray-900 dark:text-white dark:bg-gray-700"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    {dict.account.fields.region}
                                </label>
                                <input
                                    type="text"
                                    value={profileData.region}
                                    onChange={e =>
                                        setProfileData(prev => ({
                                            ...prev,
                                            region: e.target.value,
                                        }))
                                    }
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2.5 text-gray-900 dark:text-white dark:bg-gray-700"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-indigo-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 disabled:opacity-50 transition-colors">
                            {isLoading
                                ? dict.account.common.loading
                                : dict.account.profile.update}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
