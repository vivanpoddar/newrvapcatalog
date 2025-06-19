'use server';

import { deleteProductById, updateProductById } from '@/lib/db';
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
    
    const titlecount = formData.get('titlecount') as string;
    if (titlecount) updateData.titlecount = parseInt(titlecount);
    
    const categorycount = formData.get('categorycount') as string;
    if (categorycount) updateData.categorycount = parseInt(categorycount);
    
    // Note: The 'rev' form field maps to the 'editedtranslated' database column
    const rev = formData.get('rev') as string;
    if (rev && rev.trim()) {
      // Handle comma-separated rev values - store in editedtranslated column
      const revs = rev.split(',').map(r => r.trim()).filter(r => r);
      updateData.editedtranslated = revs.length > 0 ? revs : null;
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
