'use server';

import { deleteProductById, updateProductById, createProduct as createProductDB } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function deleteProduct(formData: FormData) {
  try {
    const id = formData.get('id') as string;
    if (!id) {
      throw new Error('Product ID is required');
    }
    
    await deleteProductById(id);
    revalidatePath('/');
    
    return { success: true };
  } catch (error) {
    console.error('Delete error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete product' 
    };
  }
}

export async function updateProduct(formData: FormData) {
  try {
    const id = formData.get('id') as string;
    if (!id) {
      throw new Error('Product ID is required');
    }

    const updateData: any = {};
    
    // Get all form data and build update object
    const title = formData.get('title') as string;
    if (title) updateData.title = title;
    
    const category = formData.get('category') as string;
    if (category) updateData.category = category;
    
    const language = formData.get('language') as string;
    if (language && language.trim()) {
      // Handle comma-separated languages - always send as array for PostgreSQL
      const languages = language.split(',').map(lang => lang.trim()).filter(lang => lang);
      updateData.language = languages.length > 0 ? languages : [];
    } else {
      updateData.language = [];
    }
    
    const year = formData.get('year') as string;
    if (year && year.trim()) {
      const yearValue = parseInt(year);
      updateData.pubyear = yearValue > 0 ? yearValue : null;
    } else {
      updateData.pubyear = null;
    }
    
    const firstname = formData.get('firstname') as string;
    updateData.firstname = firstname && firstname.trim() ? firstname.trim() : '';
    
        const lastname = formData.get('lastname') as string;
    updateData.lastname = lastname && lastname.trim() ? lastname.trim() : '';
    
    // The 'editedtranslated' form field maps to the 'editedtranslated' database column
    const editedtranslated = formData.get('editedtranslated') as string;
    if (editedtranslated && editedtranslated.trim()) {
      // Handle comma-separated editedtranslated values
      const translations = editedtranslated.split(',').map(t => t.trim()).filter(t => t);
      updateData.editedtranslated = translations.length > 0 ? translations : null;
    } else {
      updateData.editedtranslated = null;
    }
    
    await updateProductById(id, updateData);
    revalidatePath('/');
    
    return { success: true };
  } catch (error) {
    console.error('Update error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update product' 
    };
  }
}

export async function createProduct(formData: FormData) {
  try {
    // Get all form data and build create object
    const title = formData.get('title') as string;
    if (!title || !title.trim()) {
      throw new Error('Title is required');
    }
    
    const category = formData.get('category') as string;
    if (!category || !category.trim()) {
      throw new Error('Category is required');
    }
    
    const createData: any = {
      title: title.trim(),
      category: category.trim()
    };
    
    const language = formData.get('language') as string;
    if (language && language.trim()) {
      // Handle comma-separated languages - always send as array for PostgreSQL
      const languages = language.split(',').map(lang => lang.trim()).filter(lang => lang);
      createData.language = languages.length > 0 ? languages : [];
    } else {
      throw new Error('Language is required');
    }
    
    const year = formData.get('year') as string;
    if (year && year.trim()) {
      const yearValue = parseInt(year);
      createData.pubyear = yearValue > 0 ? yearValue : null;
    } else {
      createData.pubyear = null;
    }
    
    const firstname = formData.get('firstname') as string;
    createData.firstname = firstname && firstname.trim() ? firstname.trim() : '';
    
    const lastname = formData.get('lastname') as string;
    createData.lastname = lastname && lastname.trim() ? lastname.trim() : '';
    
    // Handle editedtranslated field
    const editedtranslated = formData.get('editedtranslated') as string;
    if (editedtranslated && editedtranslated.trim()) {
      // Handle comma-separated editedtranslated values
      const items = editedtranslated.split(',').map(item => item.trim()).filter(item => item);
      createData.editedtranslated = items.length > 0 ? items : null;
    } else {
      createData.editedtranslated = null;
    }
    
    await createProductDB(createData);
    revalidatePath('/');
    
    return { success: true };
  } catch (error) {
    console.error('Create error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create product' 
    };
  }
}
