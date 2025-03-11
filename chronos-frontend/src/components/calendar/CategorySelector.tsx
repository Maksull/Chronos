'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Check, Plus, Edit2, Trash2 } from 'lucide-react';
import { CategoryData } from '@/types/account';
import { Dictionary } from '@/lib/dictionary';

interface CategorySelectorProps {
    categories: CategoryData[];
    selectedCategoryId: string | null;
    onChange: (categoryId: string) => void;
    calendarId: string;
    mode: 'view' | 'edit' | 'create';
    dict: Dictionary;
    onCategoriesUpdated?: () => void;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
    categories,
    selectedCategoryId,
    onChange,
    calendarId,
    mode,
    dict,
    onCategoriesUpdated,
}) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [isEditingCategory, setIsEditingCategory] = useState(false);
    const [categoryBeingEdited, setCategoryBeingEdited] =
        useState<CategoryData | null>(null);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryColor, setNewCategoryColor] = useState('#3B82F6');
    const [newCategoryDescription, setNewCategoryDescription] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedCategory =
        categories.find(cat => cat.id === selectedCategoryId) || categories[0];

    useEffect(() => {
        // Close dropdown when clicking outside
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Reset form if categories are updated
    useEffect(() => {
        setNewCategoryName('');
        setNewCategoryColor('#3B82F6');
        setNewCategoryDescription('');
        setError('');

        if (
            selectedCategoryId &&
            !categories.some(cat => cat.id === selectedCategoryId) &&
            categories.length > 0
        ) {
            onChange(categories[0].id);
        }
    }, [categories, selectedCategoryId, onChange]);

    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) return;

        setLoading(true);
        setError('');

        try {
            const response = await fetch(
                `http://localhost:3001/calendars/${calendarId}/categories`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                    body: JSON.stringify({
                        name: newCategoryName.trim(),
                        description: newCategoryDescription.trim() || undefined,
                        color: newCategoryColor,
                    }),
                },
            );

            const data = await response.json();

            if (data.status === 'success') {
                setIsAddingCategory(false);
                setNewCategoryName('');
                setNewCategoryColor('#3B82F6');
                setNewCategoryDescription('');

                if (onCategoriesUpdated) {
                    onCategoriesUpdated();
                }

                // Select the newly created category
                if (data.data?.id) {
                    onChange(data.data.id);
                }
            } else {
                setError(data.message || 'Failed to create category');
            }
        } catch (error) {
            console.error('Error creating category:', error);
            setError('An error occurred while creating the category');
        } finally {
            setLoading(false);
        }
    };

    const handleEditCategory = async () => {
        if (!categoryBeingEdited || !newCategoryName.trim()) return;

        setLoading(true);
        setError('');

        try {
            const response = await fetch(
                `http://localhost:3001/categories/${categoryBeingEdited.id}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                    body: JSON.stringify({
                        name: newCategoryName.trim(),
                        description: newCategoryDescription.trim() || undefined,
                        color: newCategoryColor,
                    }),
                },
            );

            const data = await response.json();

            if (data.status === 'success') {
                setIsEditingCategory(false);
                setCategoryBeingEdited(null);
                setNewCategoryName('');
                setNewCategoryColor('#3B82F6');
                setNewCategoryDescription('');

                if (onCategoriesUpdated) {
                    onCategoriesUpdated();
                }
            } else {
                setError(data.message || 'Failed to update category');
            }
        } catch (error) {
            console.error('Error updating category:', error);
            setError('An error occurred while updating the category');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCategory = async (categoryId: string) => {
        if (
            !window.confirm(
                dict.calendar?.confirmDeleteCategory ||
                    'Are you sure you want to delete this category?',
            )
        ) {
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch(
                `http://localhost:3001/categories/${categoryId}`,
                {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                },
            );

            const data = await response.json();

            if (data.status === 'success') {
                if (onCategoriesUpdated) {
                    onCategoriesUpdated();
                }

                // If the deleted category was selected, select the first available category
                if (
                    selectedCategoryId === categoryId &&
                    categories.length > 0
                ) {
                    // Find a different category to select
                    const otherCategory = categories.find(
                        cat => cat.id !== categoryId,
                    );
                    if (otherCategory) {
                        onChange(otherCategory.id);
                    }
                }
            } else {
                setError(data.message || 'Failed to delete category');
            }
        } catch (error) {
            console.error('Error deleting category:', error);
            setError('An error occurred while deleting the category');
        } finally {
            setLoading(false);
        }
    };

    const startEditCategory = (category: CategoryData) => {
        setCategoryBeingEdited(category);
        setNewCategoryName(category.name);
        setNewCategoryColor(category.color);
        setNewCategoryDescription(category.description || '');
        setIsEditingCategory(true);
        setIsAddingCategory(false);
    };

    if (mode === 'view') {
        return (
            <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white opacity-80 flex items-center">
                {selectedCategory && (
                    <>
                        <span
                            className="w-4 h-4 rounded-full inline-block mr-2"
                            style={{
                                backgroundColor: selectedCategory.color,
                            }}></span>
                        {selectedCategory.name}
                    </>
                )}
            </div>
        );
    }

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Current selection button */}
            <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                disabled={mode === 'view'}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 
                bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                flex items-center justify-between">
                <div className="flex items-center">
                    {selectedCategory && (
                        <>
                            <span
                                className="w-4 h-4 rounded-full inline-block mr-2"
                                style={{
                                    backgroundColor: selectedCategory.color,
                                }}></span>
                            <span>{selectedCategory.name}</span>
                        </>
                    )}
                </div>
                <svg
                    className="h-5 w-5 text-gray-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true">
                    <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                        clipRule="evenodd"
                    />
                </svg>
            </button>

            {/* Dropdown */}
            {isDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg max-h-96 rounded-md overflow-hidden border border-gray-200 dark:border-gray-700">
                    <div className="py-1 max-h-64 overflow-y-auto">
                        {categories.map(category => (
                            <div
                                key={category.id}
                                className="flex items-center justify-between px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                                <div
                                    className="flex items-center flex-1"
                                    onClick={() => {
                                        onChange(category.id);
                                        setIsDropdownOpen(false);
                                    }}>
                                    <span
                                        className="w-4 h-4 rounded-full inline-block mr-2"
                                        style={{
                                            backgroundColor: category.color,
                                        }}></span>
                                    <span className="text-gray-900 dark:text-white">
                                        {category.name}
                                    </span>
                                    {selectedCategoryId === category.id && (
                                        <Check className="ml-2 h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                    )}
                                </div>
                                <div className="flex items-center space-x-1">
                                    <button
                                        type="button"
                                        onClick={e => {
                                            e.stopPropagation();
                                            startEditCategory(category);
                                        }}
                                        className="p-1 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                                        <Edit2 className="h-4 w-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={e => {
                                            e.stopPropagation();
                                            handleDeleteCategory(category.id);
                                        }}
                                        className="p-1 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {!isAddingCategory && !isEditingCategory && (
                        <div className="border-t border-gray-200 dark:border-gray-700 py-2 px-4">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsAddingCategory(true);
                                    setIsEditingCategory(false);
                                    setCategoryBeingEdited(null);
                                    setNewCategoryName('');
                                    setNewCategoryColor('#3B82F6');
                                    setNewCategoryDescription('');
                                }}
                                className="flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-sm">
                                <Plus className="h-4 w-4 mr-1" />
                                {dict.calendar?.addCategory || 'Add Category'}
                            </button>
                        </div>
                    )}

                    {/* Add Category Form */}
                    {isAddingCategory && (
                        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                                {dict.calendar?.addNewCategory ||
                                    'Add New Category'}
                            </h4>

                            {error && (
                                <div className="mb-2 p-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-md text-xs">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-3">
                                <div>
                                    <input
                                        type="text"
                                        value={newCategoryName}
                                        onChange={e =>
                                            setNewCategoryName(e.target.value)
                                        }
                                        placeholder={
                                            dict.calendar?.categoryName ||
                                            'Category Name'
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                            focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 
                            bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                                        required
                                    />
                                </div>

                                <div>
                                    <input
                                        type="text"
                                        value={newCategoryDescription}
                                        onChange={e =>
                                            setNewCategoryDescription(
                                                e.target.value,
                                            )
                                        }
                                        placeholder={
                                            dict.calendar?.description ||
                                            'Description (optional)'
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                            focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 
                            bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                                    />
                                </div>

                                <div className="flex items-center">
                                    <label className="text-sm text-gray-700 dark:text-gray-300 mr-2">
                                        {dict.calendar?.color || 'Color'}:
                                    </label>
                                    <input
                                        type="color"
                                        value={newCategoryColor}
                                        onChange={e =>
                                            setNewCategoryColor(e.target.value)
                                        }
                                        className="w-8 h-8 p-0 border-0 rounded cursor-pointer"
                                    />
                                </div>

                                <div className="flex justify-end space-x-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsAddingCategory(false);
                                            setError('');
                                        }}
                                        className="px-3 py-1 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
                                        {dict.common?.cancel || 'Cancel'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleAddCategory}
                                        disabled={
                                            loading || !newCategoryName.trim()
                                        }
                                        className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70">
                                        {loading ? (
                                            <span className="flex items-center">
                                                <svg
                                                    className="animate-spin -ml-1 mr-1 h-3 w-3 text-white"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24">
                                                    <circle
                                                        className="opacity-25"
                                                        cx="12"
                                                        cy="12"
                                                        r="10"
                                                        stroke="currentColor"
                                                        strokeWidth="4"></circle>
                                                    <path
                                                        className="opacity-75"
                                                        fill="currentColor"
                                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                {dict.common?.saving ||
                                                    'Saving...'}
                                            </span>
                                        ) : (
                                            dict.common?.save || 'Save'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Edit Category Form */}
                    {isEditingCategory && categoryBeingEdited && (
                        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                                {dict.calendar?.editCategory || 'Edit Category'}
                            </h4>

                            {error && (
                                <div className="mb-2 p-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-md text-xs">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-3">
                                <div>
                                    <input
                                        type="text"
                                        value={newCategoryName}
                                        onChange={e =>
                                            setNewCategoryName(e.target.value)
                                        }
                                        placeholder={
                                            dict.calendar?.categoryName ||
                                            'Category Name'
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                            focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 
                            bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                                        required
                                    />
                                </div>

                                <div>
                                    <input
                                        type="text"
                                        value={newCategoryDescription}
                                        onChange={e =>
                                            setNewCategoryDescription(
                                                e.target.value,
                                            )
                                        }
                                        placeholder={
                                            dict.calendar?.description ||
                                            'Description (optional)'
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                            focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 
                            bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                                    />
                                </div>

                                <div className="flex items-center">
                                    <label className="text-sm text-gray-700 dark:text-gray-300 mr-2">
                                        {dict.calendar?.color || 'Color'}:
                                    </label>
                                    <input
                                        type="color"
                                        value={newCategoryColor}
                                        onChange={e =>
                                            setNewCategoryColor(e.target.value)
                                        }
                                        className="w-8 h-8 p-0 border-0 rounded cursor-pointer"
                                    />
                                </div>

                                <div className="flex justify-end space-x-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsEditingCategory(false);
                                            setCategoryBeingEdited(null);
                                            setError('');
                                        }}
                                        className="px-3 py-1 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md">
                                        {dict.common?.cancel || 'Cancel'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleEditCategory}
                                        disabled={
                                            loading || !newCategoryName.trim()
                                        }
                                        className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70">
                                        {loading ? (
                                            <span className="flex items-center">
                                                <svg
                                                    className="animate-spin -ml-1 mr-1 h-3 w-3 text-white"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24">
                                                    <circle
                                                        className="opacity-25"
                                                        cx="12"
                                                        cy="12"
                                                        r="10"
                                                        stroke="currentColor"
                                                        strokeWidth="4"></circle>
                                                    <path
                                                        className="opacity-75"
                                                        fill="currentColor"
                                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                {dict.common?.saving ||
                                                    'Saving...'}
                                            </span>
                                        ) : (
                                            dict.common?.save || 'Save'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
