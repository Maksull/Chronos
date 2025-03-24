'use client';
import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, Plus, X } from 'lucide-react';
import { CategoryData } from '@/types/account';
import { Dictionary } from '@/lib/dictionary';

interface CategoryManagementProps {
    calendarId: string;
    dict: Dictionary;
    readOnly?: boolean;
}

export const CategoryManagement: React.FC<CategoryManagementProps> = ({
    calendarId,
    dict,
    readOnly = false,
}) => {
    const [categories, setCategories] = useState<CategoryData[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [error, setError] = useState('');
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [isEditingCategory, setIsEditingCategory] = useState(false);
    const [categoryBeingEdited, setCategoryBeingEdited] =
        useState<CategoryData | null>(null);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryColor, setNewCategoryColor] = useState('#3B82F6');
    const [newCategoryDescription, setNewCategoryDescription] = useState('');

    useEffect(() => {
        fetchCategories();
    }, [calendarId]);

    const fetchCategories = async () => {
        setLoadingCategories(true);
        try {
            const response = await fetch(
                `http://localhost:3001/calendars/${calendarId}/categories`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                },
            );
            const data = await response.json();
            if (data.status === 'success') {
                setCategories(data.data || []);
            } else {
                console.error('Error fetching categories:', data.message);
                setError(data.message || 'Failed to load categories');
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            setError('An error occurred while loading categories');
        } finally {
            setLoadingCategories(false);
        }
    };

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
                fetchCategories();
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
                fetchCategories();
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
                fetchCategories();
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
        if (readOnly) return;
        setCategoryBeingEdited(category);
        setNewCategoryName(category.name);
        setNewCategoryColor(category.color);
        setNewCategoryDescription(category.description || '');
        setIsEditingCategory(true);
        setIsAddingCategory(false);
    };

    return (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {dict.calendar?.manageCategories || 'Manage Categories'}
            </h3>

            {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-md text-sm">
                    {error}
                </div>
            )}

            {loadingCategories ? (
                <div className="text-center py-4">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-indigo-500 border-r-transparent"></div>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        {dict.account.common.loading || 'Loading categories...'}
                    </p>
                </div>
            ) : (
                <>
                    {categories.length === 0 ? (
                        <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                            {dict.calendar?.noCategories ||
                                'No custom categories yet. Create one to get started!'}
                        </p>
                    ) : (
                        <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
                            {categories.map(category => (
                                <div
                                    key={category.id}
                                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                                    <div className="flex items-center">
                                        <span
                                            className="w-4 h-4 rounded-full inline-block mr-2"
                                            style={{
                                                backgroundColor: category.color,
                                            }}></span>
                                        <div>
                                            <h4 className="font-medium text-gray-900 dark:text-white">
                                                {category.name}
                                            </h4>
                                            {category.description && (
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                    {category.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    {!readOnly && (
                                        <div className="flex items-center space-x-1">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    startEditCategory(category)
                                                }
                                                className="p-1 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600">
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleDeleteCategory(
                                                        category.id,
                                                    )
                                                }
                                                className="p-1 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {!readOnly && !isAddingCategory && !isEditingCategory && (
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
                    )}

                    {/* Add Category Form */}
                    {!readOnly && isAddingCategory && (
                        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-md mb-4">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                    {dict.calendar?.addNewCategory ||
                                        'Add New Category'}
                                </h4>
                                <button
                                    type="button"
                                    onClick={() => setIsAddingCategory(false)}
                                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

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

                    {!readOnly && isEditingCategory && categoryBeingEdited && (
                        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-md mb-4">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                    {dict.calendar?.editCategory ||
                                        'Edit Category'}
                                </h4>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditingCategory(false);
                                        setCategoryBeingEdited(null);
                                    }}
                                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

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
                </>
            )}
        </div>
    );
};
