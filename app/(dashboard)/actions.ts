'use server';

import { deleteProductById, updateProductById, createProduct as createProductDB } from '@/lib/db';
import { checkUserAdmin } from '@/lib/auth-utils';
import { revalidatePath } from 'next/cache';

export async function deleteProduct(formData: FormData) {
  try {
    // Check if user is admin
    const isAdmin = await checkUserAdmin();
    if (!isAdmin) {
      return { 
        success: false, 
        error: 'Unauthorized: Only admins can delete products' 
      };
    }

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
    // Check if user is admin
    const isAdmin = await checkUserAdmin();
    if (!isAdmin) {
      return { 
        success: false, 
        error: 'Unauthorized: Only admins can update products' 
      };
    }

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
    // Check if user is admin
    const isAdmin = await checkUserAdmin();
    if (!isAdmin) {
      return { 
        success: false, 
        error: 'Unauthorized: Only admins can create products' 
      };
    }

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

export async function checkoutBook(formData: FormData) {
  try {
    const bookId = formData.get('bookId') as string;
    if (!bookId) {
      throw new Error('Book ID is required');
    }

    const { createClient } = await import('@/utils/supabase/server');
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { 
        success: false, 
        error: 'User not authenticated' 
      };
    }

    // Parse book ID to integer
    const bookNumber = parseInt(bookId);
    if (isNaN(bookNumber)) {
      return { 
        success: false, 
        error: 'Invalid book ID' 
      };
    }

    // Check if book is already checked out by this user
    const { data: existingCheckout, error: checkError } = await supabase
      .from('checkouts')
      .select('*')
      .eq('book_id', bookNumber)
      .eq('user_id', user.id)
      .is('returned_at', null)
      .single();

    if (!checkError && existingCheckout) {
      return { 
        success: false, 
        error: 'You have already checked out this book' 
      };
    }

    // Check if book is already checked out by someone else
    const { data: otherCheckout, error: otherError } = await supabase
      .from('checkouts')
      .select('*')
      .eq('book_id', bookNumber)
      .is('returned_at', null)
      .single();

    if (!otherError && otherCheckout) {
      return { 
        success: false, 
        error: 'This book is already checked out by another user' 
      };
    }

    // Create checkout record
    const { error: insertError } = await supabase
      .from('checkouts')
      .insert({
        book_id: bookNumber,
        user_id: user.id,
        checked_out_at: new Date().toISOString()
      });

    if (insertError) {
      throw new Error(insertError.message);
    }

    revalidatePath('/');
    return { success: true };

  } catch (error) {
    console.error('Checkout error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to checkout book' 
    };
  }
}

export async function returnBook(formData: FormData) {
  try {
    const bookId = formData.get('bookId') as string;
    if (!bookId) {
      throw new Error('Book ID is required');
    }

    const { createClient } = await import('@/utils/supabase/server');
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { 
        success: false, 
        error: 'User not authenticated' 
      };
    }

    // Parse book ID to integer
    const bookNumber = parseInt(bookId);
    if (isNaN(bookNumber)) {
      return { 
        success: false, 
        error: 'Invalid book ID' 
      };
    }

    // Update checkout record to mark as returned
    const { error: updateError } = await supabase
      .from('checkouts')
      .update({ 
        returned_at: new Date().toISOString() 
      })
      .eq('book_id', bookNumber)
      .eq('user_id', user.id)
      .is('returned_at', null);

    if (updateError) {
      throw new Error(updateError.message);
    }

    revalidatePath('/');
    return { success: true };

  } catch (error) {
    console.error('Return error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to return book' 
    };
  }
}
