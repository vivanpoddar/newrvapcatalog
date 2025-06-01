import { createClient } from "utils/supabase/server";

export async function getData(filters: {
    genres: string[];
    languages: string[];
    yearRange: { min: number; max: number } | null;
    searchQueries: Array<{ criteria: string; query: string }>;
    titleSearch: string;
    idSearch: string;
    authorSearch: string;
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
        const { data: catalog } = await query;
        return catalog || [];
    }
    // Apply genre filters
    if (filters.genres && filters.genres.length > 0 && !filters.genres.includes("All")) {
        query = query.in('category', filters.genres);
        console.log('Applied genre filters:', filters.genres);
    }

    // Apply language filters
    if (filters.languages && filters.languages.length > 0 && !filters.languages.includes("All")) {
        query = query.in('language', filters.languages);
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
                    query = query.ilike('language', `%${searchValue}%`);
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

    const { data: catalog } = await query;
    return catalog || [];
}