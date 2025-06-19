"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Catalog from '../../components/catalog/catalog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuPortal, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { File, PlusCircle } from 'lucide-react';
import { CreateItemModal } from "@/components/ui/create-item-modal";

export default function ProductsPageClient({ catalog, isAdmin }: { catalog: any; isAdmin: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [selectedTabs, setSelectedTabs] = useState<string[]>([""]);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  
  // Separate state for categories (genres) and languages
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  
  const [yearRange, setYearRange] = useState<number[]>([1800, 2024]);
  const [tempYearRange, setTempYearRange] = useState<number[]>([1800, 2024]);
  const [isYearFilterActive, setIsYearFilterActive] = useState(false);
  const [searchCriteria, setSearchCriteria] = useState<string>("title");
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  // Individual search field states
  const [titleSearchQuery, setTitleSearchQuery] = useState<string>("");
  const [idSearchQuery, setIdSearchQuery] = useState<string>("");
  const [authorSearchQuery, setAuthorSearchQuery] = useState<string>("");
  
  const [activeSearchQueries, setActiveSearchQueries] = useState<Array<{id: string, criteria: string, query: string}>>([]);
  const [isSearchFilterActive, setIsSearchFilterActive] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(100); // Fixed page size of 100

  // Extract catalog data and pagination info
  const catalogData = catalog?.data || [];
  const paginationInfo = catalog?.pagination || {
    page: 1,
    pageSize: 100,
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false
  };

  const yearFilterId = `year-${yearRange[0]}-${yearRange[1]}`;
  const searchFilterIds = activeSearchQueries.map(sq => `search-${sq.criteria}-${sq.query}`);

  // Initialize state from URL parameters on component mount
  useEffect(() => {
    const currentTabs = searchParams.get('tabs');
    const currentYearMin = searchParams.get('yearMin');
    const currentYearMax = searchParams.get('yearMax');
    const currentTitleSearch = searchParams.get('titleSearch');
    const currentIdSearch = searchParams.get('idSearch');
    const currentAuthorSearch = searchParams.get('authorSearch');
    const currentPage = searchParams.get('page');
    
    // Initialize pagination state
    if (currentPage) {
      const pageNum = parseInt(currentPage);
      if (!isNaN(pageNum) && pageNum > 0) {
        setCurrentPage(pageNum);
      }
    } else {
      setCurrentPage(1);
    }
    
    // Initialize tabs - if no tabs parameter or tabs=All, set to [""]
    if (!currentTabs || currentTabs === 'All') {
      setSelectedTabs([""]);
    } else {
      const tabsArray = currentTabs.split(',').filter(Boolean);
      setSelectedTabs(tabsArray);
    }
    
    // Initialize year filter
    if (currentYearMin && currentYearMax) {
      const minYear = parseInt(currentYearMin);
      const maxYear = parseInt(currentYearMax);
      setYearRange([minYear, maxYear]);
      setTempYearRange([minYear, maxYear]);
      setIsYearFilterActive(true);
    }
    
    // Initialize individual search fields
    if (currentTitleSearch) {
      setTitleSearchQuery(currentTitleSearch);
    }
    if (currentIdSearch) {
      setIdSearchQuery(currentIdSearch);
    }
    if (currentAuthorSearch) {
      setAuthorSearchQuery(currentAuthorSearch);
    }
    
    // Initialize search queries from URL
    const searchCriteria = searchParams.getAll('searchCriteria');
    const searchQuery = searchParams.getAll('searchQuery');
    if (searchCriteria.length > 0 && searchQuery.length > 0) {
      const queries = searchCriteria.map((criteria, index) => ({
        id: `${Date.now()}-${index}`,
        criteria,
        query: searchQuery[index] || ''
      })).filter(sq => sq.query.trim());
      
      if (queries.length > 0) {
        setActiveSearchQueries(queries);
        setIsSearchFilterActive(true);
      }
    }
  }, []); // Only run on mount

  const handleTabChange = useCallback((values: string[]) => {
    let filteredValues = values;
    
    // Remove year and search filters if they exist in the values
    filteredValues = values.filter(value => !value.startsWith('year-') && !value.startsWith('search-'));
    
    // Prevent empty selection - if no tabs selected, keep "All" selected
    if (filteredValues.length === 0) {
      filteredValues = [""];
    }
    
    // Handle mutual exclusion between "All" and specific tabs
    if (filteredValues.includes("") && filteredValues.length > 1) {
      // If "All" is being added with other tabs, only keep "All"
      if (!selectedTabs.includes("")) {
        filteredValues = [""];
      } else {
        // If "All" was already selected and other tabs are being added, remove "All"
        filteredValues = filteredValues.filter(value => value !== "");
      }
    }
    
    // Final check: prevent completely empty selection by keeping "All"
    if (filteredValues.length === 0) {
      filteredValues = [""];
    }
    
    // If filters were active, clear them when other tabs are selected
    if ((isYearFilterActive || isSearchFilterActive) && filteredValues.length > 0 && !filteredValues.includes("")) {
      setIsYearFilterActive(false);
      setYearRange([1800, 2024]);
      setTempYearRange([1800, 2024]);
      setIsSearchFilterActive(false);
      setSearchCriteria("title");
      setSearchQuery("");
      setActiveSearchQueries([]);
      // Clear individual search fields
      setTitleSearchQuery("");
      setIdSearchQuery("");
      setAuthorSearchQuery("");
      // Clear separate category and language filters
      setSelectedCategories([]);
      setSelectedLanguages([]);
    }
    // If "All" is selected, clear all filters
    else if (filteredValues.includes("")) {
      console.log('All tab selected - clearing all filters');
      setIsYearFilterActive(false);
      setYearRange([1800, 2024]);
      setTempYearRange([1800, 2024]);
      setIsSearchFilterActive(false);
      setSearchCriteria("title");
      setSearchQuery("");
      setActiveSearchQueries([]);
      // Clear individual search fields
      setTitleSearchQuery("");
      setIdSearchQuery("");
      setAuthorSearchQuery("");
      // Clear separate category and language filters
      setSelectedCategories([]);
      setSelectedLanguages([]);
    }
    
    console.log('Selected tabs:', filteredValues);
    setSelectedTabs(filteredValues);
  }, [selectedTabs, isYearFilterActive, isSearchFilterActive]);

  const handleYearRangeChange = useCallback((values: number[]) => {
    setTempYearRange(values);
  }, []);

  const applyYearFilter = useCallback(() => {
    setYearRange(tempYearRange);
    setIsYearFilterActive(true);
    
    // Clear other tabs when year filter is applied (similar to tab behavior)
    setSelectedTabs([]);
    
    console.log('Publication year filter applied:', tempYearRange);
    console.log('Selected filters:', {
      genres: [],
      languages: [],
      yearRange: {
        min: tempYearRange[0],
        max: tempYearRange[1],
        id: `year-${tempYearRange[0]}-${tempYearRange[1]}`
      },
      searchQueries: []
    });
  }, [tempYearRange, yearFilterId]);

  const clearYearFilter = useCallback(() => {
    setIsYearFilterActive(false);
    setYearRange([1800, 2024]);
    setTempYearRange([1800, 2024]);
    
    // Return to "All" when year filter is cleared
    setSelectedTabs([""]);
    
    console.log('Publication year filter cleared');
    console.log('Selected filters:', {
      genres: ["All"],
      languages: ["All"],
      yearRange: null,
      searchQueries: []
    });
  }, []);

  const handleSearchCriteriaToggle = useCallback((criteria: string) => {
    // Set the selected criteria (single selection)
    setSearchCriteria(criteria);
    // Don't clear query or deactivate filter when changing criteria
    console.log('Search criteria selected:', criteria);
  }, []);

  const handleSearchQueryChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const applySearchFilter = useCallback(() => {
    if (searchCriteria && searchQuery.trim()) {
      const trimmedQuery = searchQuery.trim();
      
      // Check if there's an existing query for this criteria
      const existingQueryIndex = activeSearchQueries.findIndex(
        sq => sq.criteria === searchCriteria
      );
      
      const newSearchQuery = {
        id: `${Date.now()}-${Math.random()}`,
        criteria: searchCriteria,
        query: trimmedQuery
      };
      
      if (existingQueryIndex !== -1) {
        // Replace existing query for this criteria
        setActiveSearchQueries(prev => {
          const updated = [...prev];
          updated[existingQueryIndex] = newSearchQuery;
          return updated;
        });
        console.log('Search query replaced for criteria:', searchCriteria, 'New query:', trimmedQuery);
      } else {
        // Add new query for this criteria
        setActiveSearchQueries(prev => [...prev, newSearchQuery]);
        console.log('Search filter applied:', newSearchQuery);
      }
      
      setIsSearchFilterActive(true);
      
      // Clear other tabs when search filter is applied (similar to tab behavior)
      setSelectedTabs([]);
      
      console.log('Current filter state after search applied:', {
        genres: [],
        languages: [],
        yearRange: null,
        searchQueries: [...activeSearchQueries, newSearchQuery].map(sq => ({
          id: sq.id,
          criteria: sq.criteria,
          query: sq.query
        }))
      });
      
      // Clear the input fields for next search
      setSearchCriteria("");
      setSearchQuery("");
    }
  }, [searchCriteria, searchQuery, activeSearchQueries]);

  const clearSearchFilter = useCallback(() => {
    setIsSearchFilterActive(false);
    setSearchCriteria("");
    setSearchQuery("");
    setActiveSearchQueries([]);
    // Clear individual search fields
    setTitleSearchQuery("");
    setIdSearchQuery("");
    setAuthorSearchQuery("");
    // Clear separate category and language filters
    setSelectedCategories([]);
    setSelectedLanguages([]);
    
    // Return to "All" when search filter is cleared
    setSelectedTabs([""]);
    
    console.log('All search filters cleared');
    console.log('Selected filters:', {
      genres: ["All"],
      languages: ["All"],
      yearRange: null,
      searchQueries: []
    });
  }, []);

  const removeSearchQuery = useCallback((queryId: string) => {
    setActiveSearchQueries(prev => {
      const updated = prev.filter(sq => sq.id !== queryId);
      
      // If no search queries left, deactivate search filter
      if (updated.length === 0) {
        setIsSearchFilterActive(false);
        // Check if any other filters are active, if not revert to "All"
        if (!isYearFilterActive && (selectedTabs.length === 0 || selectedTabs.every(tab => tab === ""))) {
          setSelectedTabs([""]);
        }
      }
      
      console.log('Search query removed:', queryId);
      console.log('Remaining search queries:', updated);
      return updated;
    });
  }, [isYearFilterActive, selectedTabs]);

  // Individual search field handlers
  const handleTitleSearchChange = useCallback((value: string) => {
    setTitleSearchQuery(value);
    // If clearing the search and no other filters are active, revert to "All"
    if (!value.trim() && !idSearchQuery.trim() && !authorSearchQuery.trim() && 
        !isYearFilterActive && !isSearchFilterActive && 
        (selectedTabs.length === 0 || selectedTabs.every(tab => tab === ""))) {
      setSelectedTabs([""]);
    }
  }, [idSearchQuery, authorSearchQuery, isYearFilterActive, isSearchFilterActive, selectedTabs]);

  const handleIdSearchChange = useCallback((value: string) => {
    setIdSearchQuery(value);
    // If clearing the search and no other filters are active, revert to "All"
    if (!value.trim() && !titleSearchQuery.trim() && !authorSearchQuery.trim() && 
        !isYearFilterActive && !isSearchFilterActive && 
        (selectedTabs.length === 0 || selectedTabs.every(tab => tab === ""))) {
      setSelectedTabs([""]);
    }
  }, [titleSearchQuery, authorSearchQuery, isYearFilterActive, isSearchFilterActive, selectedTabs]);

  const handleAuthorSearchChange = useCallback((value: string) => {
    setAuthorSearchQuery(value);
    // If clearing the search and no other filters are active, revert to "All"
    if (!value.trim() && !titleSearchQuery.trim() && !idSearchQuery.trim() && 
        !isYearFilterActive && !isSearchFilterActive && 
        (selectedTabs.length === 0 || selectedTabs.every(tab => tab === ""))) {
      setSelectedTabs([""]);
    }
  }, [titleSearchQuery, idSearchQuery, isYearFilterActive, isSearchFilterActive, selectedTabs]);

  // Handlers for separate category and language filters
  const handleCategoryChange = useCallback((categoryCode: string) => {
    setSelectedCategories(prev => {
      const updated = prev.includes(categoryCode) 
        ? prev.filter(cat => cat !== categoryCode)
        : [...prev, categoryCode];
      
      // If all categories are deselected and no other filters are active, revert to "All"
      if (updated.length === 0 && selectedLanguages.length === 0 && !isYearFilterActive && !isSearchFilterActive) {
        setSelectedTabs([""]);
      }
      
      return updated;
    });
  }, [selectedLanguages, isYearFilterActive, isSearchFilterActive]);

  const handleLanguageChange = useCallback((languageCode: string) => {
    setSelectedLanguages(prev => {
      const updated = prev.includes(languageCode)
        ? prev.filter(lang => lang !== languageCode)
        : [...prev, languageCode];
      
      // If all languages are deselected and no other filters are active, revert to "All"
      if (updated.length === 0 && selectedCategories.length === 0 && !isYearFilterActive && !isSearchFilterActive) {
        setSelectedTabs([""]);
      }
      
      return updated;
    });
  }, [selectedCategories, isYearFilterActive, isSearchFilterActive]);

  // Log combined filter state whenever filters change
  useEffect(() => {
    const activeFilters: {
      genres: string[];
      languages: string[];
      yearRange: {
        min: number;
        max: number;
        id: string;
      } | null;
      searchQueries: Array<{
        id: string;
        criteria: string;
        query: string;
      }>;
    } = {
      genres: [],
      languages: [],
      yearRange: null,
      searchQueries: []
    };
    
    // Define genre and language codes
    const genreCodes = ["CLB", "DDL", "DMW", "GIT", "HIS", "HMS", "KID", "MNP", "ODL", "OPH", "PIL", "SCI", "SER", "SHR", "SMH", "SNK", "SPD", "SRK", "VED", "VIV", "UVO"];
    const languageCodes = ["E", "S", "H", "B", "T"];
    
    if (selectedTabs.length > 0 && !selectedTabs.includes("")) {
      // Separate selected tabs into genres and languages
      const selectedGenres = selectedTabs.filter(tab => genreCodes.includes(tab));
      const selectedLanguages = selectedTabs.filter(tab => languageCodes.includes(tab));
      
      activeFilters.genres = selectedGenres.length > 0 ? selectedGenres : [];
      activeFilters.languages = selectedLanguages.length > 0 ? selectedLanguages : [];
    } else if (selectedTabs.includes("")) {
      activeFilters.genres = ["All"];
      activeFilters.languages = ["All"];
    }
    
    if (isYearFilterActive) {
      activeFilters.yearRange = {
        min: yearRange[0],
        max: yearRange[1],
        id: yearFilterId
      };
    }
    
    if (isSearchFilterActive) {
      activeFilters.searchQueries = activeSearchQueries.map(sq => ({
        id: sq.id,
        criteria: sq.criteria,
        query: sq.query
      }));
    }
    
    console.log('All active filters:', activeFilters);
    console.log('Individual search fields:', {
      titleSearch: titleSearchQuery,
      idSearch: idSearchQuery,
      authorSearch: authorSearchQuery
    });
    console.log('Separated filter state:', {
      selectedCategories,
      selectedLanguages,
      selectedTabs: selectedTabs
    });
  }, [selectedTabs, isYearFilterActive, yearFilterId, isSearchFilterActive, searchFilterIds, titleSearchQuery, idSearchQuery, authorSearchQuery, selectedCategories, selectedLanguages]);

  // Monitor filter states and revert to "All" when no filters are active
  useEffect(() => {
    const hasSpecificTabs = selectedTabs.length > 0 && !selectedTabs.includes("");
    const hasSearchFields = titleSearchQuery.trim() || idSearchQuery.trim() || authorSearchQuery.trim();
    const hasCategories = selectedCategories.length > 0;
    const hasLanguages = selectedLanguages.length > 0;
    
    const hasAnyActiveFilter = isYearFilterActive || isSearchFilterActive || hasSpecificTabs || hasSearchFields || hasCategories || hasLanguages;
    
    // If no filters are active and we're not already on "All", revert to "All"
    if (!hasAnyActiveFilter && !selectedTabs.includes("")) {
      console.log('No filters active, reverting to "All" tab');
      setSelectedTabs([""]);
    }
  }, [isYearFilterActive, isSearchFilterActive, selectedTabs, titleSearchQuery, idSearchQuery, authorSearchQuery, selectedCategories, selectedLanguages]);

  // Function to update URL with current filters
  const updateURLParams = useCallback(() => {
    const params = new URLSearchParams();
    
    // Add current tab selections - always include tabs parameter for proper state management
    if (selectedTabs.includes("") || selectedTabs.length === 0) {
      // When "All" is selected or no tabs selected, explicitly set tabs=All
      params.set('tabs', 'All');
    } else {
      // Add specific tab selections
      selectedTabs.forEach(tab => params.append('tabs', tab));
    }
    
    // Add year filter
    if (isYearFilterActive) {
      params.set('yearMin', yearRange[0].toString());
      params.set('yearMax', yearRange[1].toString());
    }
    
    // Add search queries
    if (isSearchFilterActive && activeSearchQueries.length > 0) {
      activeSearchQueries.forEach(sq => {
        params.append('searchCriteria', sq.criteria);
        params.append('searchQuery', sq.query);
      });
    }
    
    // Add individual search fields
    if (titleSearchQuery.trim()) {
      params.set('titleSearch', titleSearchQuery.trim());
    }
    if (idSearchQuery.trim()) {
      params.set('idSearch', idSearchQuery.trim());
    }
    if (authorSearchQuery.trim()) {
      params.set('authorSearch', authorSearchQuery.trim());
    }
    
    // Add pagination parameters
    if (currentPage > 1) {
      params.set('page', currentPage.toString());
    }
    if (pageSize !== 100) {
      params.set('pageSize', pageSize.toString());
    }
    
    // Update URL without page reload
    const newURL = params.toString() ? `?${params.toString()}` : '?tabs=All';
    router.replace(newURL, { scroll: false });
  }, [router, selectedTabs, isYearFilterActive, yearRange, isSearchFilterActive, activeSearchQueries, titleSearchQuery, idSearchQuery, authorSearchQuery, currentPage, pageSize]);

  // Update URL when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateURLParams();
    }, 300); // Debounce URL updates
    
    return () => clearTimeout(timeoutId);
  }, [updateURLParams]);

  // Remove client-side filtering since data is now pre-filtered on server
  const filteredCatalog = catalogData;

  // Pagination handlers
  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= paginationInfo.totalPages && page !== currentPage) {
      setCurrentPage(page);
    }
  }, [currentPage, paginationInfo.totalPages]);

  const goToNextPage = useCallback(() => {
    if (paginationInfo.hasNext) {
      setCurrentPage(prev => prev + 1);
    }
  }, [paginationInfo.hasNext]);

  const goToPreviousPage = useCallback(() => {
    if (paginationInfo.hasPrev) {
      setCurrentPage(prev => prev - 1);
    }
  }, [paginationInfo.hasPrev]);

  const goToFirstPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const goToLastPage = useCallback(() => {
    setCurrentPage(paginationInfo.totalPages);
  }, [paginationInfo.totalPages]);

  // Reset to first page when filters change
  useEffect(() => {
    if (currentPage > 1) {
      setCurrentPage(1);
    }
  }, [selectedTabs, isYearFilterActive, yearRange, isSearchFilterActive, activeSearchQueries, titleSearchQuery, idSearchQuery, authorSearchQuery]);

  const handleCreateItem = useCallback(async (newItem: any) => {
    try {
      // Create FormData for the API call
      const formData = new FormData();
      formData.append('title', newItem.title);
      formData.append('category', newItem.category);
      formData.append('language', Array.isArray(newItem.language) ? newItem.language.join(', ') : newItem.language);
      formData.append('year', newItem.year ? newItem.year.toString() : '');
      formData.append('firstname', newItem.first || '');
      formData.append('lastname', newItem.last || '');
      formData.append('editedtranslated', Array.isArray(newItem.editedtranslated) ? newItem.editedtranslated.join(', ') : (newItem.editedtranslated || ''));
      
      // Import the createProduct action
      const { createProduct } = await import('./actions');
      const result = await createProduct(formData);
      
      if (result.success) {
        // Close the modal after successful creation
        setCreateModalOpen(false);
        
        // Refresh the page to show updated data
        window.location.reload();
      } else {
        alert(`Failed to create item: ${result.error}`);
      }
    } catch (error) {
      console.error('Create error:', error);
      alert('An error occurred while creating the item');
    }
  }, []);

  return (
      <Tabs value={selectedTabs} onValueChange={handleTabChange}>
          <div className="mb-2 flex items-center">
              <div className='flex'>
                  <div className="inline-flex flex-col w-full rounded-md shadow-sm md:w-auto md:flex-row mr-2" role="group">
                      <TabsList>
                          <TabsTrigger value="">
                              All
                          </TabsTrigger>
                          <span className="mx-1 h-full w-px bg-border self-center" />
                          <DropdownMenu>
                                <DropdownMenuTrigger className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm m-0.5 p-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
                                  isYearFilterActive 
                                    ? 'bg-background text-foreground shadow-sm' 
                                    : 'hover:bg-background/50'
                                }`}>
                                    {isYearFilterActive ? `Publication Year (${yearRange[0]} - ${yearRange[1]})` : 'Publication Year'}
                                </DropdownMenuTrigger>

                                <DropdownMenuPortal>
                                    <DropdownMenuContent className='animate-slideUpAndFade w-80 p-4'>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <label className="text-sm font-medium">
                                                    Publication Year Range
                                                </label>
                                                {isYearFilterActive && (
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-xs text-muted-foreground">Active</span>
                                                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <div className="px-2">
                                                    <Slider
                                                        value={tempYearRange}
                                                        onValueChange={handleYearRangeChange}
                                                        min={1800}
                                                        max={2024}
                                                        step={1}
                                                        className="w-full"
                                                    />
                                                </div>
                                                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                                                    <span>1800</span>
                                                    <span>2024</span>
                                                </div>
                                                <div className="flex justify-between text-sm font-medium mt-1">
                                                    <span>{tempYearRange[0]}</span>
                                                    <span>{tempYearRange[1]}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                {isYearFilterActive && (
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline" 
                                                        onClick={clearYearFilter}
                                                        className="flex-1"
                                                    >
                                                        Clear Filter
                                                    </Button>
                                                )}
                                                <Button 
                                                    size="sm" 
                                                    onClick={applyYearFilter}
                                                    className="flex-1"
                                                    disabled={tempYearRange[0] === 1800 && tempYearRange[1] === 2024 && !isYearFilterActive}
                                                >
                                                    {isYearFilterActive ? 'Update Filter' : 'Apply Filter'}
                                                </Button>
                                            </div>
                                            {!isYearFilterActive && tempYearRange[0] === 1800 && tempYearRange[1] === 2024 && (
                                                <div className="text-xs text-muted-foreground text-center">
                                                    Adjust slider and click Apply to activate filter
                                                </div>
                                            )}
                                        </div>
                                    </DropdownMenuContent>
                                </DropdownMenuPortal>
                          </DropdownMenu>
                          <DropdownMenu>
                                <DropdownMenuTrigger className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm m-0.5 p-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative ${
                                  isSearchFilterActive 
                                    ? 'bg-background text-foreground shadow-sm' 
                                    : 'hover:bg-background/50'
                                }`}>
                                    Search Options
                                    {activeSearchQueries.length > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full min-w-[1.25rem] h-5 flex items-center justify-center px-1">
                                            {activeSearchQueries.length}
                                        </span>
                                    )}
                                </DropdownMenuTrigger>

                                <DropdownMenuPortal>
                                    <DropdownMenuContent className='animate-slideUpAndFade w-80 p-4'>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <label className="text-sm font-medium">
                                                    Select Search Criteria
                                                </label>
                                                {isSearchFilterActive && (
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-xs text-muted-foreground">Active</span>
                                                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="space-y-2">
                                                <div className="grid gap-2">
                                                    {[
                                                        { value: 'title', label: 'Title' },
                                                        { value: 'id', label: 'ID' },
                                                        { value: 'author', label: 'Author' }
                                                    ].map((criterion) => (
                                                        <Button
                                                            key={criterion.value}
                                                            variant={searchCriteria === criterion.value ? "default" : "outline"}
                                                            size="sm"
                                                            onClick={() => handleSearchCriteriaToggle(criterion.value)}
                                                            className="justify-start"
                                                        >
                                                            {criterion.label}
                                                        </Button>
                                                    ))}
                                                    
                                                    {activeSearchQueries.length > 0 && (
                                                        <>
                                                            <DropdownMenuSeparator />
                                                            <div className="text-xs text-muted-foreground mb-2">
                                                                Active Search Queries ({activeSearchQueries.length}):
                                                            </div>
                                                            <div className="space-y-2">
                                                                {activeSearchQueries.map((searchQuery) => (
                                                                    <div key={searchQuery.id} className="flex items-center justify-between p-2 bg-primary/5 border border-primary/20 rounded-md">
                                                                        <div className="flex items-center gap-2 text-xs">
                                                                            <span className="px-2 py-1 bg-primary/10 rounded text-primary font-medium">
                                                                                {searchQuery.criteria}
                                                                            </span>
                                                                            <span className="text-foreground">{searchQuery.query}</span>
                                                                        </div>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={() => removeSearchQuery(searchQuery.id)}
                                                                            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                                            title="Remove this search query"
                                                                        >
                                                                            ×
                                                                        </Button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            <div className="text-xs text-muted-foreground italic mt-2 p-2 bg-muted/50 rounded">
                                                                💡 Select criteria above and use the search bar to add more queries
                                                            </div>
                                                        </>
                                                    )}
                                                    
                                                    {activeSearchQueries.length > 0 && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={clearSearchFilter}
                                                            className="justify-start text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                                                        >
                                                            Clear All Search Filters
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </DropdownMenuContent>
                                </DropdownMenuPortal>
                          </DropdownMenu>
                      </TabsList>
                  </div>

                  <form className="flex items-center" onSubmit={(e) => {
                      e.preventDefault();
                      if (searchCriteria && searchQuery.trim()) {
                          applySearchFilter();
                      }
                  }}>
                      <label className="sr-only">Search</label>
                      <div className="relative w-full">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                              <svg aria-hidden="true" className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                              </svg>
                          </div>
                          <input 
                              type="text" 
                              id="simple-search" 
                              value={searchQuery}
                              onChange={(e) => handleSearchQueryChange(e.target.value)}
                              disabled={!searchCriteria}
                              className="outline-gray-400 block w-full p-2 pl-10 text-sm font-medium border border-gray-300 rounded-lg bg-muted focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed" 
                              placeholder={searchCriteria 
                                ? `Search by ${searchCriteria}...${activeSearchQueries.length > 0 ? ` (${activeSearchQueries.length} active)` : ''}` 
                                : "Select search criteria"} 
                          />
                      </div>
                  </form>
              </div>

              <div className="ml-auto flex items-center gap-2">
                  <Button size="sm" variant="outline" className="h-8 gap-1">
                      <File className="h-3.5 w-3.5" />
                      <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                          Export Catalog
                      </span>
                  </Button>
                  {isAdmin && (
                    <Button size="sm" className="h-8 gap-1" onClick={() => setCreateModalOpen(true)}>
                        <PlusCircle className="h-3.5 w-3.5" />
                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                            Add Book
                        </span>
                    </Button>
                  )}
              </div>
          </div>

          <div className='mb-2'>
              <TabsList>
                  {/* Genre/Category Tabs */}
                  <TabsTrigger value="CLB" title="Culture & Literature Bengali">CLB</TabsTrigger>
                  <TabsTrigger value="DDL" title="Devotional Drama & Literature">DDL</TabsTrigger>
                  <TabsTrigger value="DMW" title="Devotional Music & Worship">DMW</TabsTrigger>
                  <TabsTrigger value="GIT" title="Gita">GIT</TabsTrigger>
                  <TabsTrigger value="HIS" title="History">HIS</TabsTrigger>
                  <TabsTrigger value="HMS" title="Hymns & Sacred Music">HMS</TabsTrigger>
                  <TabsTrigger value="KID" title="Kids & Children">KID</TabsTrigger>
                  <TabsTrigger value="MNP" title="Mahatma & Nonviolent Philosophy">MNP</TabsTrigger>
                  <TabsTrigger value="ODL" title="Oriya Devotional Literature">ODL</TabsTrigger>
                  <TabsTrigger value="OPH" title="Oriental Philosophy">OPH</TabsTrigger>
                  <TabsTrigger value="PIL" title="Pilgrimage">PIL</TabsTrigger>
                  <TabsTrigger value="SCI" title="Science">SCI</TabsTrigger>
                  <TabsTrigger value="SER" title="Sermons">SER</TabsTrigger>
                  <TabsTrigger value="SHR" title="Shrimad Bhagavatam">SHR</TabsTrigger>
                  <TabsTrigger value="SMH" title="Sanskrit Mantras & Hymns">SMH</TabsTrigger>
                  <TabsTrigger value="SNK" title="Sanskrit">SNK</TabsTrigger>
                  <TabsTrigger value="SPD" title="Spiritual Development">SPD</TabsTrigger>
                  <TabsTrigger value="SRK" title="Sri Krishna">SRK</TabsTrigger>
                  <TabsTrigger value="VED" title="Vedic Literature">VED</TabsTrigger>
                  <TabsTrigger value="VIV" title="Vivekananda">VIV</TabsTrigger>
                  <TabsTrigger value="UVO" title="Upanishads & Vedic Ontology">UVO</TabsTrigger>
                  
                  {/* Visual separator between genres and languages */}
                  <span className="mx-2 h-full w-px bg-border self-center" />
                  
                  {/* Language Tabs */}
                  <TabsTrigger value="E" title="English">EN</TabsTrigger>
                  <TabsTrigger value="S" title="Sanskrit">SA</TabsTrigger>
                  <TabsTrigger value="H" title="Hindi">HI</TabsTrigger>
                  <TabsTrigger value="B" title="Bengali">BN</TabsTrigger>
                  <TabsTrigger value="T" title="Tamil">TA</TabsTrigger>
              </TabsList>
          </div>

          {/* Pagination controls */}
          <div className="mb-4 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                  Showing {((paginationInfo.page - 1) * paginationInfo.pageSize) + 1}-{Math.min(paginationInfo.page * paginationInfo.pageSize, paginationInfo.total)} of {paginationInfo.total} results
              </div>
              <div className="flex items-center gap-2">
                  <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={goToFirstPage}
                      disabled={currentPage === 1}
                  >
                      First
                  </Button>
                  <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={goToPreviousPage}
                      disabled={!paginationInfo.hasPrev}
                  >
                      Previous
                  </Button>
                  
                  {/* Page numbers */}
                  <div className="flex items-center gap-1">
                      {(() => {
                          const pages = [];
                          const totalPages = paginationInfo.totalPages;
                          const current = currentPage;
                          
                          // Always show first page
                          if (current > 3) {
                              pages.push(
                                  <Button 
                                      key={1}
                                      size="sm" 
                                      variant={1 === current ? "default" : "outline"}
                                      onClick={() => goToPage(1)}
                                  >
                                      1
                                  </Button>
                              );
                              if (current > 4) {
                                  pages.push(<span key="ellipsis1" className="px-2">...</span>);
                              }
                          }
                          
                          // Show pages around current page
                          for (let i = Math.max(1, current - 2); i <= Math.min(totalPages, current + 2); i++) {
                              pages.push(
                                  <Button 
                                      key={i}
                                      size="sm" 
                                      variant={i === current ? "default" : "outline"}
                                      onClick={() => goToPage(i)}
                                  >
                                      {i}
                                  </Button>
                              );
                          }
                          
                          // Always show last page
                          if (current < totalPages - 2) {
                              if (current < totalPages - 3) {
                                  pages.push(<span key="ellipsis2" className="px-2">...</span>);
                              }
                              pages.push(
                                  <Button 
                                      key={totalPages}
                                      size="sm" 
                                      variant={totalPages === current ? "default" : "outline"}
                                      onClick={() => goToPage(totalPages)}
                                  >
                                      {totalPages}
                                  </Button>
                              );
                          }
                          
                          return pages;
                      })()}
                  </div>
                  
                  <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={goToNextPage}
                      disabled={!paginationInfo.hasNext}
                  >
                      Next
                  </Button>
                  <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={goToLastPage}
                      disabled={currentPage === paginationInfo.totalPages}
                  >
                      Last
                  </Button>
              </div>
          </div>

          <Catalog data={filteredCatalog} isAdmin={isAdmin}></Catalog>

          <CreateItemModal
            isOpen={isCreateModalOpen}
            onClose={() => setCreateModalOpen(false)}
            onSave={handleCreateItem}
          />
      </Tabs>
  );
}
