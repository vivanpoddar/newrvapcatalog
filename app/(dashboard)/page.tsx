import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Divide, File, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuPortal, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { createClient } from '../../utils/supabase/server';
import Catalog from '../../components/catalog/catalog';
import ProductsPageClient from './products-page-client';
import { getData } from '@/lib/db';

// Extract filter state function
async function extractFilters(searchParams?: { [key: string]: string | string[] | undefined }) {
  const filters = {
    genres: [] as string[],
    languages: [] as string[],
    yearRange: null as { min: number; max: number } | null,
    searchQueries: [] as Array<{ criteria: string; query: string }>,
    titleSearch: '',
    idSearch: '',
    authorSearch: ''
  };

  if (!searchParams) return filters;

  // Extract tab selections (genres and languages)
  const selectedTabs = searchParams.tabs;
  const tabArray = Array.isArray(selectedTabs) ? selectedTabs : (selectedTabs ? [selectedTabs] : []);
  
  // If "All" is explicitly selected, set it in the arrays
  if (tabArray.includes("All")) {
    filters.genres = ["All"];
    filters.languages = ["All"];
  } else {
    // Otherwise filter by specific codes
    const genreCodes = ["CLB", "DDL", "DMW", "GIT", "HIS", "HMS", "KID", "MNP", "ODL", "OPH", "PIL", "SCI", "SER", "SHR", "SMH", "SNK", "SPD", "SRK", "VED", "VIV", "UVO"];
    const languageCodes = ["E", "S", "H", "B", "T"];
    
    filters.genres = tabArray.filter(tab => genreCodes.includes(tab));
    filters.languages = tabArray.filter(tab => languageCodes.includes(tab));
  }

  // Extract year range
  const yearMin = searchParams.yearMin;
  const yearMax = searchParams.yearMax;
  if (yearMin && yearMax) {
    filters.yearRange = {
      min: parseInt(yearMin as string),
      max: parseInt(yearMax as string)
    };
  }

  // Extract search queries
  const searchCriteria = searchParams.searchCriteria;
  const searchQuery = searchParams.searchQuery;
  if (searchCriteria && searchQuery) {
    const criteriaArray = Array.isArray(searchCriteria) ? searchCriteria : [searchCriteria];
    const queryArray = Array.isArray(searchQuery) ? searchQuery : [searchQuery];
    
    filters.searchQueries = criteriaArray.map((criteria, index) => ({
      criteria,
      query: queryArray[index] || ''
    })).filter(sq => sq.query.trim());
  }

  // Extract individual search fields
  filters.titleSearch = (searchParams.titleSearch as string) || '';
  filters.idSearch = (searchParams.idSearch as string) || '';
  filters.authorSearch = (searchParams.authorSearch as string) || '';

  return filters;
}

export default async function ProductsPage({
  searchParams
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams;
  const filters = await extractFilters(resolvedSearchParams);
  const catalog = await getData(filters);

  return <ProductsPageClient catalog={catalog || []} />;
}
