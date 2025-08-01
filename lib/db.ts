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
        
        // Get checkout information for all books with user details
        let checkoutsMap = new Map();
        if (catalog) {
            const bookNumbers = catalog.map(book => book.number);
            const { data: checkouts } = await supabase
                .from('checkouts')
                .select('book_id, user_id, checked_out_at, returned_at')
                .in('book_id', bookNumbers)
                .is('returned_at', null); // Only get active checkouts
            
            if (checkouts && checkouts.length > 0) {
                const userIds = checkouts.map(c => c.user_id);
                console.log(userIds)
                
                const { data: users } = await supabase
                    .from('users')
                    .select('id, full_name, email, phone_number')
                    .in('id', userIds);

                // Get phone numbers from auth metadata for users who don't have it in the users table
                const { data: authUsers } = await supabase.auth.admin.listUsers();
                const authUsersMap = new Map();
                authUsers?.users?.forEach(authUser => {
                    authUsersMap.set(authUser.id, {
                        phone: authUser.user_metadata?.phone_number || authUser.phone || ''
                    });
                });

                // Merge phone numbers from auth metadata if not available in users table
                if (users) {
                    users.forEach(user => {
                        if (!user.phone_number && authUsersMap.has(user.id)) {
                            user.phone_number = authUsersMap.get(user.id).phone;
                        }
                    });
                }

                // Create a map of user information
                const usersMap = new Map();
                if (users) {
                    users.forEach(user => {
                        usersMap.set(user.id, user);
                    });
                }

                checkouts.forEach(checkout => {
                    console.log(checkout)
                    const user = usersMap.get(checkout.user_id);
                    console.log(user)
                    checkoutsMap.set(checkout.book_id, {
                        ...checkout,
                        userDisplay: user?.full_name || 'Unknown User',
                        userEmail: user?.email || '',
                        userPhone: user?.phone_number || '',
                        checkedOutDate: new Date(checkout.checked_out_at).toLocaleDateString()
                    });
                });
            }
        }
        
        // Add checkout status to each book
        const catalogWithCheckoutStatus = catalog?.map(book => ({
            ...book,
            isCheckedOut: checkoutsMap.has(book.number),
            checkedOutByCurrentUser: currentUserId && checkoutsMap.has(book.number) && 
                checkoutsMap.get(book.number)?.user_id === currentUserId,
            checkoutDetails: checkoutsMap.get(book.number) || null
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

    // Build search query for RPC search
    let searchQuery = '';
    const searchTerms = [];
    
    // Add individual search fields to search terms
    if (filters.titleSearch && filters.titleSearch.trim()) {
        searchTerms.push(filters.titleSearch.trim());
    }
    
    if (filters.idSearch && filters.idSearch.trim()) {
        searchTerms.push(filters.idSearch.trim());
    }
    
    if (filters.authorSearch && filters.authorSearch.trim()) {
        searchTerms.push(filters.authorSearch.trim());
    }

    // Add search queries to search terms
    if (filters.searchQueries && filters.searchQueries.length > 0) {
        filters.searchQueries.forEach(searchQuery => {
            const { criteria, query: searchValue } = searchQuery;
            // Add all search values to the combined search term
            if (searchValue && searchValue.trim()) {
                searchTerms.push(searchValue.trim());
            }
        });
    }
    
    // Combine all search terms for RPC search
    searchQuery = searchTerms.join(' ');
    
    // Always use RPC search for consistency
    query = supabase.rpc('search_catalog', { query: searchQuery });
    console.log('Applied RPC search with combined query:', searchQuery);

    // Apply additional filters after RPC search
    if (filters.genres && filters.genres.length > 0 && !filters.genres.includes("All")) {
        query = query.in('category', filters.genres);
        console.log('Applied genre filters to RPC:', filters.genres);
    }

    if (filters.languages && filters.languages.length > 0 && !filters.languages.includes("All")) {
        query = query.overlaps('language', filters.languages);
        console.log('Applied language filters to RPC:', filters.languages);
    }

    if (filters.yearRange) {
        query = query.gte('pubyear', filters.yearRange.min).lte('pubyear', filters.yearRange.max);
        console.log('Applied year range filter to RPC:', filters.yearRange);
    }

    // Apply pagination
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 100;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Get total count using RPC search
    let count = 0;
    
    // For RPC search, we need to get the actual results to count them
    // since RPC doesn't support count directly
    let rpcCountQuery = supabase.rpc('search_catalog', { query: searchQuery });
    
    // Apply same filters to RPC count query
    if (filters.genres && filters.genres.length > 0 && !filters.genres.includes("All")) {
        rpcCountQuery = rpcCountQuery.in('category', filters.genres);
    }
    if (filters.languages && filters.languages.length > 0 && !filters.languages.includes("All")) {
        rpcCountQuery = rpcCountQuery.overlaps('language', filters.languages);
    }
    if (filters.yearRange) {
        rpcCountQuery = rpcCountQuery.gte('pubyear', filters.yearRange.min).lte('pubyear', filters.yearRange.max);
    }
    
    const { data: rpcCountData } = await rpcCountQuery;
    count = rpcCountData?.length || 0;
    
    // Apply pagination to the RPC query and fetch data
    // RPC function handles relevance ordering internally
    const orderedQuery = query.range(from, to);
    console.log('Applied pagination to RPC search results');
    
    const { data: catalog } = await orderedQuery;
    
    // Get checkout information for all books with user details
    let checkoutsMap = new Map();
    if (catalog) {
        const bookNumbers = catalog.map(book => book.number);
        const { data: checkouts } = await supabase
            .from('checkouts')
            .select('book_id, user_id, checked_out_at, returned_at')
            .in('book_id', bookNumbers)
            .is('returned_at', null); // Only get active checkouts
        
        if (checkouts && checkouts.length > 0) {
            // Get user information for checkout users from users table
            const userIds = checkouts.map(c => c.user_id);
            
            // Query users table for user details
            const { data: users } = await supabase
                .from('users')
                .select('id, full_name, email, phone_number')
                .in('id', userIds);
            
            // Create a map of user information
            const usersMap = new Map();
            if (users) {
                users.forEach(user => {
                    usersMap.set(user.id, user);
                });
            }

            
            checkouts.forEach(checkout => {
                const user = usersMap.get(checkout.user_id);
                checkoutsMap.set(checkout.book_id, {
                    ...checkout,
                    userDisplay: user?.full_name || 'Unknon User',
                    userEmail: user?.email || '',
                    userPhone: user?.phone_number || '',
                    checkedOutDate: new Date(checkout.checked_out_at).toLocaleDateString()
                });
            });
        }
    }
    
    // Add checkout status to each book
    const catalogWithCheckoutStatus = catalog?.map(book => ({
        ...book,
        isCheckedOut: checkoutsMap.has(book.number),
        checkedOutByCurrentUser: currentUserId && checkoutsMap.has(book.number) && 
            checkoutsMap.get(book.number)?.user_id === currentUserId,
        checkoutDetails: checkoutsMap.get(book.number) || null
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