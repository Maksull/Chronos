'use client';

import React, { useState } from 'react';
import { Filter, X, Check } from 'lucide-react';
import { CategoryData } from '@/types/account';

interface CategoryFilterProps {
    categories: CategoryData[];
    selectedCategoryIds: string[];
    onCategoryChange: (categoryIds: string[]) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
    categories,
    selectedCategoryIds,
    onCategoryChange,
}) => {
    const [showCategoryFilter, setShowCategoryFilter] = useState(false);

    const handleCategoryToggle = (categoryId: string) => {
        let newSelectedIds: string[];

        if (selectedCategoryIds.includes(categoryId)) {
            // Remove the category if already selected
            newSelectedIds = selectedCategoryIds.filter(
                id => id !== categoryId,
            );
        } else {
            // Add the category if not already selected
            newSelectedIds = [...selectedCategoryIds, categoryId];
        }

        onCategoryChange(newSelectedIds);
    };

    const clearCategoryFilter = (e: React.MouseEvent) => {
        e.stopPropagation();
        onCategoryChange([]);
    };

    // Get selected categories objects for display
    const selectedCategories = categories.filter(cat =>
        selectedCategoryIds.includes(cat.id),
    );

    return (
        <div>
            <div className="flex items-center space-x-2 mb-4">
                <button
                    onClick={() => setShowCategoryFilter(!showCategoryFilter)}
                    className={`flex items-center px-3 py-1.5 rounded-md text-sm ${
                        selectedCategoryIds.length > 0
                            ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    } hover:bg-indigo-200 dark:hover:bg-indigo-800/50 transition-colors`}>
                    <Filter className="w-4 h-4 mr-1.5" />
                    {selectedCategoryIds.length === 0
                        ? 'Filter by category'
                        : `Filtered by ${selectedCategoryIds.length} ${selectedCategoryIds.length === 1 ? 'category' : 'categories'}`}
                    {selectedCategoryIds.length > 0 && (
                        <X
                            className="w-4 h-4 ml-1.5 cursor-pointer hover:text-red-500"
                            onClick={clearCategoryFilter}
                        />
                    )}
                </button>

                {/* Display selected category badges */}
                <div className="flex flex-wrap gap-2">
                    {selectedCategories.map(category => (
                        <div
                            key={category.id}
                            className="px-2 py-1 rounded-md text-xs flex items-center group"
                            style={{
                                backgroundColor: `${category.color}20`,
                                color: category.color,
                                border: `1px solid ${category.color}50`,
                            }}>
                            {category.name}
                            <button
                                onClick={() =>
                                    handleCategoryToggle(category.id)
                                }
                                className="ml-1.5 opacity-70 hover:opacity-100">
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Category selection dropdown */}
            {showCategoryFilter && (
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-3 mb-4 shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Select categories:
                        </h4>
                        {selectedCategoryIds.length > 0 && (
                            <button
                                onClick={e => {
                                    e.stopPropagation();
                                    clearCategoryFilter(e);
                                }}
                                className="text-xs text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400">
                                Clear all
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {categories.map(category => {
                            const isSelected = selectedCategoryIds.includes(
                                category.id,
                            );

                            return (
                                <div
                                    key={category.id}
                                    className={`cursor-pointer px-3 py-2 rounded-md border hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                                        isSelected
                                            ? 'ring-2 ring-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 border-transparent'
                                            : 'border-gray-200 dark:border-gray-700'
                                    }`}
                                    onClick={() =>
                                        handleCategoryToggle(category.id)
                                    }>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div
                                                className="w-3 h-3 rounded-full mr-2"
                                                style={{
                                                    backgroundColor:
                                                        category.color,
                                                }}></div>
                                            <div className="text-sm font-medium">
                                                {category.name}
                                            </div>
                                        </div>

                                        {/* Checkbox indicator */}
                                        <div
                                            className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                                                isSelected
                                                    ? 'bg-indigo-500 border-indigo-500 text-white'
                                                    : 'border-gray-300 dark:border-gray-600'
                                            }`}>
                                            {isSelected && (
                                                <Check className="w-3.5 h-3.5" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};
