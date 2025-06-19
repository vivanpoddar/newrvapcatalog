import { createClient } from "utils/supabase/server";

export async function getData(filters: {
    genres: string[];
    languages: string[];
    yearRange: { min: number; max: number } | null;
    searchQueries: Array<{ criteria: string; query: string }>;
    titleSearch: string;
    idSearch: string;
    authorSearch: string;
    page?: number;
    pageSize?: number;
}) {
    const supabase = await createClient();
    
    // Get current user for checkout status
    const { data: { user } } = await supabase.auth.getUser();
    const currentUserId = user?.id;
    
    // Base query - we'll process checkout status after getting the data
    let query = supabase.from('catalog').select("*");

    const isAllSelected = (filters.genres && filters.genres.includes("All")) || 
                         (filters.languages && filters.languages.includes("All"));
    
    const hasOtherFilters = filters.yearRange || 
                           (filters.searchQueries && filters.searchQueries.length > 0) ||
                           (filters.titleSearch && filters.titleSearch.trim()) ||
                           (filters.idSearch && filters.idSearch.trim()) ||
                           (filters.authorSearch && filters.authorSearch.trim());

    if (isAllSelected && !hasOtherFilters) {
        // Apply pagination even for "All" case
        const page = filters.page || 1;
        const pageSize = filters.pageSize || 100;
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        // Get total count
        const { count } = await supabase
            .from('catalog')
            .select('*', { count: 'exact', head: true });
        
        // Get paginated data with ordering
        const { data: catalog } = await query.order('number', { ascending: true }).range(from, to);
        
        // Get checkout information for all books if user is authenticated
        let checkoutsMap = new Map();
        if (currentUserId && catalog) {
            const bookNumbers = catalog.map(book => book.number);
            const { data: checkouts } = await supabase
                .from('checkouts')
                .select('book_id, user_id, checked_out_at, returned_at')
                .in('book_id', bookNumbers)
                .is('returned_at', null); // Only get active checkouts
            
            if (checkouts) {
                checkouts.forEach(checkout => {
                    checkoutsMap.set(checkout.book_id, checkout);
                });
            }
        }
        
        // Add checkout status to each book
        const catalogWithCheckoutStatus = catalog?.map(book => ({
            ...book,
            isCheckedOut: checkoutsMap.has(book.number),
            checkedOutByCurrentUser: currentUserId && checkoutsMap.has(book.number) && 
                checkoutsMap.get(book.number)?.user_id === currentUserId
        })) || [];
        
        return {
            data: catalogWithCheckoutStatus,
            pagination: {
                page,
                pageSize,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / pageSize),
                hasNext: to < (count || 0) - 1,
                hasPrev: page > 1
            }
        };
    }
    // Apply genre filters
    if (filters.genres && filters.genres.length > 0 && !filters.genres.includes("All")) {
        query = query.in('category', filters.genres);
        console.log('Applied genre filters:', filters.genres);
    }

    // Apply language filters (for array-type language columns)
    if (filters.languages && filters.languages.length > 0 && !filters.languages.includes("All")) {
        query = query.overlaps('language', filters.languages);
        console.log('Applied language filters:', filters.languages);
    }

    // Apply year range filter
    if (filters.yearRange) {
        query = query.gte('pubyear', filters.yearRange.min).lte('pubyear', filters.yearRange.max);
        console.log('Applied year range filter:', filters.yearRange);
    }

    // Apply search queries
    if (filters.searchQueries && filters.searchQueries.length > 0) {
        filters.searchQueries.forEach(searchQuery => {
            const { criteria, query: searchValue } = searchQuery;
            
            switch (criteria) {
                case "title":
                    query = query.ilike('title', `%${searchValue}%`);
                    console.log('Applied title search:', searchValue);
                    break;
                case "category":
                    query = query.ilike('category', `%${searchValue}%`);
                    console.log('Applied category search:', searchValue);
                    break;
                case "language":
                    // For array-type language columns, use array contains operator
                    query = query.contains('language', [searchValue]);
                    console.log('Applied language search:', searchValue);
                    break;
                case "author":
                    query = query.or(`firstname.ilike.%${searchValue}%,lastname.ilike.%${searchValue}%`);
                    console.log('Applied author search:', searchValue);
                    break;
                case "year":
                    query = query.eq('pubyear', parseInt(searchValue));
                    console.log('Applied year search:', searchValue);
                    break;
            }
        });
    }

    // Apply individual search fields with fuzzy search
    if (filters.titleSearch && filters.titleSearch.trim()) {
        query = query.ilike('title', `%${filters.titleSearch.trim()}%`);
        console.log('Applied titleSearch:', filters.titleSearch.trim());
    }

    if (filters.idSearch && filters.idSearch.trim()) {
        query = query.ilike('id', `%${filters.idSearch.trim()}%`);
        console.log('Applied idSearch:', filters.idSearch.trim());
    }

    if (filters.authorSearch && filters.authorSearch.trim()) {
        const authorSearchTerm = filters.authorSearch.trim();
        query = query.or(`firstname.ilike.%${authorSearchTerm}%,lastname.ilike.%${authorSearchTerm}%`);
        console.log('Applied authorSearch:', authorSearchTerm);
    }

    // Apply pagination
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 100;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Create a separate query for counting (without pagination)
    let countQuery = supabase.from('catalog').select('*', { count: 'exact', head: true });
    
    // Apply same filters to count query
    if (filters.genres && filters.genres.length > 0 && !filters.genres.includes("All")) {
        countQuery = countQuery.in('category', filters.genres);
    }
    if (filters.languages && filters.languages.length > 0 && !filters.languages.includes("All")) {
        countQuery = countQuery.overlaps('language', filters.languages);
    }
    if (filters.yearRange) {
        countQuery = countQuery.gte('pubyear', filters.yearRange.min).lte('pubyear', filters.yearRange.max);
    }
    if (filters.searchQueries && filters.searchQueries.length > 0) {
        filters.searchQueries.forEach(searchQuery => {
            const { criteria, query: searchValue } = searchQuery;
            switch (criteria) {
                case "title":
                    countQuery = countQuery.ilike('title', `%${searchValue}%`);
                    break;
                case "category":
                    countQuery = countQuery.ilike('category', `%${searchValue}%`);
                    break;
                case "language":
                    // For array-type language columns, use array contains operator
                    countQuery = countQuery.contains('language', [searchValue]);
                    break;
                case "author":
                    countQuery = countQuery.or(`firstname.ilike.%${searchValue}%,lastname.ilike.%${searchValue}%`);
                    break;
                case "year":
                    countQuery = countQuery.eq('pubyear', parseInt(searchValue));
                    break;
            }
        });
    }
    if (filters.titleSearch && filters.titleSearch.trim()) {
        countQuery = countQuery.ilike('title', `%${filters.titleSearch.trim()}%`);
    }
    if (filters.idSearch && filters.idSearch.trim()) {
        countQuery = countQuery.ilike('id', `%${filters.idSearch.trim()}%`);
    }
    if (filters.authorSearch && filters.authorSearch.trim()) {
        const authorSearchTerm = filters.authorSearch.trim();
        countQuery = countQuery.or(`firstname.ilike.%${authorSearchTerm}%,lastname.ilike.%${authorSearchTerm}%`);
    }

    // Get total count
    const { count } = await countQuery;
    
    // Apply pagination to the main query and fetch data with ordering
    const { data: catalog } = await query.order('number', { ascending: true }).range(from, to);
    
    // Get checkout information for all books if user is authenticated
    let checkoutsMap = new Map();
    if (currentUserId && catalog) {
        const bookNumbers = catalog.map(book => book.number);
        const { data: checkouts } = await supabase
            .from('checkouts')
            .select('book_id, user_id, checked_out_at, returned_at')
            .in('book_id', bookNumbers)
            .is('returned_at', null); // Only get active checkouts
        
        if (checkouts) {
            checkouts.forEach(checkout => {
                checkoutsMap.set(checkout.book_id, checkout);
            });
        }
    }
    
    // Add checkout status to each book
    const catalogWithCheckoutStatus = catalog?.map(book => ({
        ...book,
        isCheckedOut: checkoutsMap.has(book.number),
        checkedOutByCurrentUser: currentUserId && checkoutsMap.has(book.number) && 
            checkoutsMap.get(book.number)?.user_id === currentUserId
    })) || [];
    
    return {
        data: catalogWithCheckoutStatus,
        pagination: {
            page,
            pageSize,
            total: count || 0,
            totalPages: Math.ceil((count || 0) / pageSize),
            hasNext: to < (count || 0) - 1,
            hasPrev: page > 1
        }
    };
}

export async function deleteProductById(id: string) {
    const supabase = await createClient();
    
    const { error } = await supabase
        .from('catalog')
        .delete()
        .eq('id', id);
    
    if (error) {
        throw new Error(`Failed to delete product: ${error.message}`);
    }
    
    return { success: true };
}

export async function updateProductById(id: string, updateData: {
    title?: string;
    category?: string;
    language?: string | string[];
    pubyear?: number;
    firstname?: string;
    lastname?: string;
    titlecount?: number;
    categorycount?: number;
    categoryindex?: number;
    id?: string;
    editedtranslated?: string | string[] | null;
}) {
    const supabase = await createClient();
    
    // First, get the current product data
    const { data: currentProduct, error: fetchError } = await supabase
        .from('catalog')
        .select('*')
        .eq('id', id)
        .single();
    
    if (fetchError || !currentProduct) {
        throw new Error(`Failed to fetch current product: ${fetchError?.message || 'Product not found'}`);
    }
    
    // Prepare the final update data
    let finalUpdateData = { ...updateData };
    
    // Check if category or title is being changed, which requires recalculating counts and ID
    const categoryChanged = updateData.category && updateData.category !== currentProduct.category;
    const titleChanged = updateData.title && updateData.title !== currentProduct.title;
    const languageChanged = updateData.language && JSON.stringify(updateData.language) !== JSON.stringify(currentProduct.language);
    
    if (categoryChanged || titleChanged || languageChanged) {
        // Use new values or fall back to current values
        const newCategory = updateData.category || currentProduct.category;
        const newTitle = updateData.title || currentProduct.title;
        const newLanguage = updateData.language || currentProduct.language;
        
        // Recalculate category count for the new category
        if (categoryChanged) {
            const { count: categoryBooks } = await supabase
                .from('catalog')
                .select('*', { count: 'exact', head: true })
                .eq('category', newCategory);
            
            finalUpdateData.categorycount = (categoryBooks || 0) + 1;
        }
        
        // Handle category index and title count
        let categoryIndex: number;
        
        if (titleChanged || categoryChanged) {
            // Check if there's already a book with the same title in the same category (excluding current book)
            const { data: existingTitleBooks } = await supabase
                .from('catalog')
                .select('categoryindex')
                .eq('category', newCategory)
                .eq('title', newTitle)
                .neq('id', id)
                .limit(1);
            
            if (existingTitleBooks && existingTitleBooks.length > 0) {
                // Use the existing book's category index
                categoryIndex = existingTitleBooks[0].categoryindex || 1;
            } else {
                // Get the highest categoryindex for this category
                const { data: existingCategoryBooks } = await supabase
                    .from('catalog')
                    .select('categoryindex')
                    .eq('category', newCategory)
                    .order('categoryindex', { ascending: false })
                    .limit(1);
                
                const maxCategoryIndex = existingCategoryBooks && existingCategoryBooks.length > 0
                    ? existingCategoryBooks[0].categoryindex || 0
                    : 0;
                
                categoryIndex = maxCategoryIndex + 1;
            }
            
            // Get count of books with the same title in the same category (excluding current book)
            const { count: titleCount } = await supabase
                .from('catalog')
                .select('*', { count: 'exact', head: true })
                .eq('category', newCategory)
                .eq('title', newTitle)
                .neq('id', id);
            
            finalUpdateData.titlecount = (titleCount || 0) + 1;
        } else {
            categoryIndex = currentProduct.categoryindex;
        }
        
        // Regenerate ID if any relevant field changed
        const languageString = Array.isArray(newLanguage) 
            ? newLanguage.join(',') 
            : newLanguage;
        
        const generatedId = `${currentProduct.number} ${newCategory}-${languageString} ${categoryIndex}.${finalUpdateData.titlecount || currentProduct.titlecount}`;
        finalUpdateData.id = generatedId;
        
        // Update categoryindex if it was recalculated
        if (titleChanged || categoryChanged) {
            finalUpdateData.categoryindex = categoryIndex;
        }
    }
    
    const { error } = await supabase
        .from('catalog')
        .update(finalUpdateData)
        .eq('id', id);
    
    if (error) {
        throw new Error(`Failed to update product: ${error.message}`);
    }
    
    return { success: true };
}

export async function createProduct(newItem: {
    title: string;
    category: string;
    language: string | string[];
    pubyear?: number;
    firstname?: string;
    lastname?: string;
    editedtranslated?: string | string[] | null;
}) {
    const supabase = await createClient();
    
    // Get the highest number from database to increment
    const { data: maxNumberData } = await supabase
        .from('catalog')
        .select('number')
        .order('number', { ascending: false })
        .limit(1);
    
    const nextNumber = (maxNumberData?.[0]?.number || 0) + 1;
    
    // Get count of books in the same category
    const { count: categoryBooks } = await supabase
        .from('catalog')
        .select('*', { count: 'exact', head: true })
        .eq('category', newItem.category);
    
    const nextCategoryCount = (categoryBooks || 0) + 1;
    
    // Determine the languages for ID generation
    const languageString = Array.isArray(newItem.language) 
        ? newItem.language.join(',') 
        : newItem.language;

    // Get the highest categoryIndex for this category, excluding books with the same title
    // Check if there's already a book with the same title in the same category
    const { data: existingTitleBooks } = await supabase
        .from('catalog')
        .select('categoryindex')
        .eq('category', newItem.category)
        .eq('title', newItem.title)
        .limit(1);
    
    let categoryIndex: number;
    
    if (existingTitleBooks && existingTitleBooks.length > 0) {
        // Use the existing book's category index
        categoryIndex = existingTitleBooks[0].categoryindex || 1;
    } else {
        // Get the highest categorycount for this category
        const { data: existingCategoryBooks } = await supabase
            .from('catalog')
            .select('categoryindex')
            .eq('category', newItem.category)
            .order('categoryindex', { ascending: false })
            .limit(1);
        
        const maxCategoryIndex = existingCategoryBooks && existingCategoryBooks.length > 0
            ? existingCategoryBooks[0].categoryindex || 0
            : 0;
        
        categoryIndex = maxCategoryIndex + 1;
    }
    
    // Get count of books with the same title in the same category
    const { count: titleCount } = await supabase
        .from('catalog')
        .select('*', { count: 'exact', head: true })
        .eq('category', newItem.category)
        .eq('title', newItem.title);
    
    const nextTitleCount = (titleCount || 0) + 1;
    
    // Generate ID in format: Number Category-Language count.categoryIndex
    const generatedId = `${nextNumber} ${newItem.category}-${languageString} ${categoryIndex}.${nextTitleCount}`;
    
    // Prepare data for insertion
    const insertData = {
        number: nextNumber,
        title: newItem.title,
        category: newItem.category,
        language: newItem.language,
        pubyear: newItem.pubyear || null,
        firstname: newItem.firstname || '',
        lastname: newItem.lastname || '',
        categorycount: nextCategoryCount,
        titlecount: nextTitleCount,
        id: generatedId,
        editedtranslated: newItem.editedtranslated || null
    };
    
    const { data, error } = await supabase
        .from('catalog')
        .insert(insertData)
        .select()
        .single();
    
    if (error) {
        throw new Error(`Failed to create product: ${error.message}`);
    }
    
    return { success: true, data };
}