"use client";

import { Modal } from "./modal";
import { Button } from "./button";
import { Input } from "./input";
import { useState, useEffect } from "react";

interface EditItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: EditableItem) => void;
  item: EditableItem | null;
  isEditing?: boolean;
}

export interface EditableItem {
  number: number;
  title: string;
  category: string;
  language: string | string[];
  count: number;
  categoryCount: number;
  id: string;
  year: number;
  first: string;
  last: string;
  rev: string | string[];
  editedtranslated: string | string[] | null;
}

export function EditItemModal({
  isOpen,
  onClose,
  onSave,
  item,
  isEditing = false
}: EditItemModalProps) {
  const [formData, setFormData] = useState<EditableItem | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (item) {
      setFormData({ ...item });
      setErrors({});
    }
  }, [item]);

  const handleClose = () => {
    if (!isEditing) {
      onClose();
    }
  };

  const handleInputChange = (field: keyof EditableItem, value: string | number) => {
    if (!formData) return;
    
    setFormData({
      ...formData,
      [field]: value
    });
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleLanguageChange = (value: string) => {
    if (!formData) return;
    
    // Split by comma and trim whitespace
    const languages = value.split(',').map(lang => lang.trim()).filter(lang => lang);
    setFormData({
      ...formData,
      language: languages.length === 1 ? languages[0] : languages
    });
    
    if (errors.language) {
      setErrors(prev => ({ ...prev, language: '' }));
    }
  };

  const handleRevChange = (value: string) => {
    if (!formData) return;
    
    // Split by comma and trim whitespace
    const revs = value.split(',').map(rev => rev.trim()).filter(rev => rev);
    setFormData({
      ...formData,
      rev: revs.length === 0 ? '' : (revs.length === 1 ? revs[0] : revs)
    });
    
    if (errors.rev) {
      setErrors(prev => ({ ...prev, rev: '' }));
    }
  };

  const handleEditedTranslatedChange = (value: string) => {
    if (!formData) return;
    
    // Split by comma and trim whitespace
    const items = value.split(',').map(item => item.trim()).filter(item => item);
    setFormData({
      ...formData,
      editedtranslated: items.length === 0 ? null : (items.length === 1 ? items[0] : items)
    });
    
    if (errors.editedtranslated) {
      setErrors(prev => ({ ...prev, editedtranslated: '' }));
    }
  };

  const validateForm = (): boolean => {
    if (!formData) return false;
    
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }
    
    if (!formData.id.trim()) {
      newErrors.id = 'ID is required';
    }
    
    // Year and author fields are now optional - removed validation
    
    // Only validate year format if a year is provided
    if (formData.year && (formData.year < 1000 || formData.year > 9999)) {
      newErrors.year = 'Year must be a valid 4-digit year';
    }
    
    if (formData.number < 1) {
      newErrors.number = 'Number must be greater than 0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!formData || !validateForm()) return;
    
    onSave(formData);
  };

  const formatArrayForInput = (value: string | string[] | null): string => {
    if (!value) return '';
    if (Array.isArray(value)) return value.join(', ');
    return value;
  };

  if (!formData) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="p-6 bg-white">
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Edit Catalog Item
          </h3>
          <p className="text-sm text-gray-500">
            Update the catalog item information below.
          </p>
        </div>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number *
              </label>
              <Input
                type="number"
                value={formData.number}
                onChange={(e) => handleInputChange('number', parseInt(e.target.value) || 0)}
                disabled={isEditing}
                className={errors.number ? 'border-red-500' : ''}
              />
              {errors.number && <p className="text-red-500 text-xs mt-1">{errors.number}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ID *
              </label>
              <Input
                type="text"
                value={formData.id}
                onChange={(e) => handleInputChange('id', e.target.value)}
                disabled={isEditing}
                className={errors.id ? 'border-red-500' : ''}
              />
              {errors.id && <p className="text-red-500 text-xs mt-1">{errors.id}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <Input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              disabled={isEditing}
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <Input
                type="text"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                disabled={isEditing}
                className={errors.category ? 'border-red-500' : ''}
              />
              {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year
              </label>
              <Input
                type="number"
                value={formData.year || ''}
                onChange={(e) => handleInputChange('year', parseInt(e.target.value) || 0)}
                disabled={isEditing}
                className={errors.year ? 'border-red-500' : ''}
                placeholder="Optional"
              />
              {errors.year && <p className="text-red-500 text-xs mt-1">{errors.year}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Language (comma-separated for multiple)
            </label>
            <Input
              type="text"
              value={formatArrayForInput(formData.language)}
              onChange={(e) => handleLanguageChange(e.target.value)}
              disabled={isEditing}
              placeholder="E, S, H"
              className={errors.language ? 'border-red-500' : ''}
            />
            {errors.language && <p className="text-red-500 text-xs mt-1">{errors.language}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <Input
                type="text"
                value={formData.first}
                onChange={(e) => handleInputChange('first', e.target.value)}
                disabled={isEditing}
                placeholder="Optional"
                className={errors.first ? 'border-red-500' : ''}
              />
              {errors.first && <p className="text-red-500 text-xs mt-1">{errors.first}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <Input
                type="text"
                value={formData.last}
                onChange={(e) => handleInputChange('last', e.target.value)}
                disabled={isEditing}
                placeholder="Optional"
                className={errors.last ? 'border-red-500' : ''}
              />
              {errors.last && <p className="text-red-500 text-xs mt-1">{errors.last}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Count
              </label>
              <Input
                type="number"
                value={formData.count}
                onChange={(e) => handleInputChange('count', parseInt(e.target.value) || 0)}
                disabled={isEditing}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category Count
              </label>
              <Input
                type="number"
                value={formData.categoryCount}
                onChange={(e) => handleInputChange('categoryCount', parseInt(e.target.value) || 0)}
                disabled={isEditing}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rev (comma-separated for multiple)
            </label>
            <Input
              type="text"
              value={formatArrayForInput(formData.rev)}
              onChange={(e) => handleRevChange(e.target.value)}
              disabled={isEditing}
              placeholder="T, E"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Edited/Translated (comma-separated for multiple)
            </label>
            <Input
              type="text"
              value={formatArrayForInput(formData.editedtranslated)}
              onChange={(e) => handleEditedTranslatedChange(e.target.value)}
              disabled={isEditing}
              placeholder="T, E"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isEditing}
            className="px-4 py-2"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isEditing}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
          >
            {isEditing ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
