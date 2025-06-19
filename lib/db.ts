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
        
        return {
            data: catalog || [],
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
    
    return {
        data: catalog || [],
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
    editedtranslated?: string | string[] | null;
}) {
    const supabase = await createClient();
    
    const { error } = await supabase
        .from('catalog')
        .update(updateData)
        .eq('id', id);
    
    if (error) {
        throw new Error(`Failed to update product: ${error.message}`);
    }
    
    return { success: true };
}