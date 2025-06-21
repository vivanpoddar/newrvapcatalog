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
    console.log('handleTabChange called with:', values);
    let filteredValues = values;
    
    // Handle special tab values (publication-year, search-options) separately
    const specialTabs = ['publication-year', 'search-options'];
    const normalTabs = filteredValues.filter(value => !specialTabs.includes(value));
    const selectedSpecialTabs = filteredValues.filter(value => specialTabs.includes(value));
    
    console.log('Normal tabs:', normalTabs, 'Special tabs:', selectedSpecialTabs);
    
    // Remove dynamic filter values (year-*, search-*) but keep publication-year and search-options
    const cleanNormalTabs = normalTabs.filter(value => !value.startsWith('year-') && !value.startsWith('search-'));
    
    // Combine clean normal tabs with special tabs
    filteredValues = [...cleanNormalTabs, ...selectedSpecialTabs];
    
    // Handle mutual exclusion between "All" and specific category/language tabs
    const categoryLanguageTabs = filteredValues.filter(value => !specialTabs.includes(value));
    
    if (categoryLanguageTabs.includes("") && categoryLanguageTabs.length > 1) {
      // If "All" is being added with other category/language tabs, only keep "All" + special tabs
      if (!selectedTabs.includes("")) {
        filteredValues = ["", ...selectedSpecialTabs];
      } else {
        // If "All" was already selected and other tabs are being added, remove "All"
        filteredValues = categoryLanguageTabs.filter(value => value !== "").concat(selectedSpecialTabs);
      }
    }
    
    // Ensure we always have at least "All" for category/language selection if no category tabs are selected
    if (categoryLanguageTabs.length === 0) {
      filteredValues = ["", ...selectedSpecialTabs];
    }
    
    console.log('Final selected tabs:', filteredValues);
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

  const handleExportCatalog = useCallback(() => {
    try {
      // Define genre and language codes for filter details
      const genreCodes = ["CLB", "DDL", "DMW", "GIT", "HIS", "HMS", "KID", "MNP", "ODL", "OPH", "PIL", "SCI", "SER", "SHR", "SMH", "SNK", "SPD", "SRK", "VED", "VIV", "UVO"];
      const languageCodes = ["E", "S", "H", "B", "T"];
      
      // Prepare the catalog data for export
      const exportData = {
        exportedAt: new Date().toISOString(),
        exportedBy: 'RVAP Catalog System',
        version: '1.0',
        appliedFilters: {
          genres: selectedTabs.filter(tab => genreCodes.includes(tab)),
          languages: selectedTabs.filter(tab => languageCodes.includes(tab)),
          yearRange: isYearFilterActive ? { min: yearRange[0], max: yearRange[1] } : null,
          searchQueries: isSearchFilterActive ? activeSearchQueries : [],
          titleSearch: titleSearchQuery || null,
          idSearch: idSearchQuery || null,
          authorSearch: authorSearchQuery || null
        },
        pagination: paginationInfo,
        totalRecords: paginationInfo?.total || catalogData?.length || 0,
        recordsInExport: catalogData?.length || 0,
        data: catalogData || []
      };

      // Create and download the JSON file
      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = `rvap-catalog-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log('Catalog exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      alert('An error occurred while exporting the catalog');
    }
  }, [catalogData, paginationInfo, selectedTabs, yearRange, isYearFilterActive, activeSearchQueries, isSearchFilterActive, titleSearchQuery, idSearchQuery, authorSearchQuery]);

  return (
      <Tabs value={selectedTabs} onValueChange={handleTabChange}>
          {/* Sticky filter and pagination container - optimized for true mobile */}
          <div className="sticky top-14 md:top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 py-1 md:py-3 px-0 md:px-4">
              {/* Main filter controls row */}
              <div className="mb-1 md:mb-2 flex flex-col gap-2 md:gap-2 md:flex-row md:items-center">
                  {/* Filter controls section */}
                  <div className='flex flex-col w-full md:w-auto md:flex-row gap-2 md:gap-0'>
                      <div className="inline-flex flex-col w-full rounded-md md:w-auto md:flex-row mr-0 md:mr-2" role="group">
                          {/* All tab and filter dropdowns - always stacked on small screens */}
                          <div className="flex flex-col md:flex-row gap-1 md:gap-0 w-full md:w-auto">
                              <TabsList className="w-full md:w-auto overflow-x-auto min-h-[36px] flex flex-wrap md:flex-nowrap gap-1">
                                  <TabsTrigger value="" className="flex-1 md:flex-none text-xs md:text-sm">
                                      All
                                  </TabsTrigger>
                                  <span className="mx-1 h-full w-px bg-border self-center hidden md:block" />
                                  
                                  {/* Publication Year Tab Trigger */}
                                  <TabsTrigger 
                                      value="publication-year" 
                                      className={`flex-1 md:flex-none text-xs md:text-sm relative ${
                                          isYearFilterActive ? 'bg-primary text-primary-foreground' : ''
                                      }`}
                                  >
                                      {isYearFilterActive ? `Year (${yearRange[0]}-${yearRange[1]})` : 'Publication Year'}
                                      {isYearFilterActive && (
                                          <span className="absolute -top-1 -right-1 bg-primary-foreground text-primary text-xs rounded-full w-2 h-2"></span>
                                      )}
                                  </TabsTrigger>
                                  
                                  {/* Search Options Tab Trigger */}
                                  <TabsTrigger 
                                      value="search-options" 
                                      className={`flex-1 md:flex-none text-xs md:text-sm relative ${
                                          isSearchFilterActive ? 'bg-primary text-primary-foreground' : ''
                                      }`}
                                  >
                                      Search Options
                                      {activeSearchQueries.length > 0 && (
                                          <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full min-w-[1.25rem] h-5 flex items-center justify-center px-1">
                                              {activeSearchQueries.length}
                                          </span>
                                      )}
                                  </TabsTrigger>
                              </TabsList>
                              
                              {/* Tab Content for Publication Year */}
                              {selectedTabs.includes('publication-year') && (
                                  <div className="mt-2 p-4 border rounded-lg bg-background w-full md:w-80">
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
                                  </div>
                              )}
                              
                              {/* Tab Content for Search Options */}
                              {selectedTabs.includes('search-options') && (
                                  <div className="mt-2 p-4 border rounded-lg bg-background w-full md:w-80">
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
                                                          <div className="border-t pt-2 mt-2">
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
                                  </div>
                              )}
                  </div>
              </div>

              <form className="flex items-center w-full md:w-auto mt-1 md:mt-0" onSubmit={(e) => {
                      e.preventDefault();
                      if (searchCriteria && searchQuery.trim()) {
                          applySearchFilter();
                      }
                  }}>
                      <label className="sr-only">Search</label>
                      <div className="relative w-full">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-2 md:pl-3 pointer-events-none">
                              <svg aria-hidden="true" className="w-4 h-4 md:w-5 md:h-5 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                              </svg>
                          </div>
                          <input 
                              type="text" 
                              id="simple-search" 
                              value={searchQuery}
                              onChange={(e) => handleSearchQueryChange(e.target.value)}
                              disabled={!searchCriteria}
                              className="outline-gray-400 block w-full p-2 pl-8 md:pl-10 text-xs md:text-sm font-medium border border-gray-300 rounded-lg bg-muted focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed min-h-[36px]" 
                              placeholder={searchCriteria 
                                ? `Search by ${searchCriteria}...${activeSearchQueries.length > 0 ? ` (${activeSearchQueries.length} active)` : ''}` 
                                : "Select search criteria"} 
                          />
                      </div>
                  </form>
              </div>

              <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-2 md:ml-auto mt-1 md:mt-0">
          <Button size="sm" variant="outline" className="hover:bg-black hover:text-white h-8 gap-1 w-full hidden md:flex md:w-auto text-xs md:text-sm" onClick={handleExportCatalog}>
                      <File className="h-3 w-3 md:h-3.5 md:w-3.5" />
                      <span className="md:sr-only lg:not-sr-only lg:whitespace-nowrap">
                          Export Catalog
                      </span>
                  </Button>
                  {isAdmin && (
                    <Button size="sm" className="hover:bg-white hover:text-black h-8 gap-1 border w-full md:w-auto text-xs md:text-sm" onClick={() => setCreateModalOpen(true)}>
                        <PlusCircle className="h-3 w-3 md:h-3.5 md:w-3.5" />
                        <span className="md:sr-only lg:not-sr-only lg:whitespace-nowrap">
                            Add Book
                        </span>
                    </Button>
                  )}
              </div>
          </div>

          {/* Category and Language Tabs - Responsive layout */}
          <div className='mb-1 md:mb-2'>
            {/* Mobile: Multi-row layout to prevent overflow */}
            <div className="md:hidden space-y-1">
              {/* Mobile Row 1: First set of categories */}
              <div className="w-full overflow-hidden px-1">
                <div className="flex items-center gap-1">
                  <div className="overflow-x-auto scrollbar-hide flex-1">
                    <TabsList className="flex min-w-full w-max overflow-visible scrollbar-hide min-h-[20px] p-0">
                      <TabsTrigger value="CLB" title="Class books" className="flex-shrink-0 text-[9px] px-0.5 min-w-[24px]">CLB</TabsTrigger>
                      <TabsTrigger value="DDL" title="Lives of Direct Disciples of Sri Ramakrishna" className="flex-shrink-0 text-[9px] px-0.5 min-w-[24px]">DDL</TabsTrigger>
                      <TabsTrigger value="DMW" title="Divine mother worship" className="flex-shrink-0 text-[9px] px-0.5 min-w-[24px]">DMW</TabsTrigger>
                      <TabsTrigger value="GIT" title="Gita" className="flex-shrink-0 text-[9px] px-0.5 min-w-[24px]">GIT</TabsTrigger>
                      <TabsTrigger value="HIS" title="History" className="flex-shrink-0 text-[9px] px-0.5 min-w-[24px]">HIS</TabsTrigger>
                      <TabsTrigger value="HMS" title="Holy Mother, Life and Teachings" className="flex-shrink-0 text-[9px] px-0.5 min-w-[24px]">HMS</TabsTrigger>
                      <TabsTrigger value="KID" title="Children" className="flex-shrink-0 text-[9px] px-0.5 min-w-[24px]">KID</TabsTrigger>
                      <TabsTrigger value="MNP" title="Mythology & Puranas" className="flex-shrink-0 text-[9px] px-0.5 min-w-[24px]">MNP</TabsTrigger>
                      <TabsTrigger value="ODL" title="Lives of Other Disciples" className="flex-shrink-0 text-[9px] px-0.5 min-w-[24px]">ODL</TabsTrigger>
                      <TabsTrigger value="OPH" title="Other Philosophies" className="flex-shrink-0 text-[9px] px-0.5 min-w-[24px]">OPH</TabsTrigger>
                      <TabsTrigger value="PIL" title="Pilgrimage & Tourism" className="flex-shrink-0 text-[9px] px-0.5 min-w-[24px]">PIL</TabsTrigger>
                    </TabsList>
                  </div>
                </div>
              </div>
              
              {/* Mobile Row 2: Second set of categories */}
              <div className="w-full overflow-hidden px-1">
                <div className="flex items-center gap-1">
                    <div className="overflow-x-auto scrollbar-hide flex-1">
                      <TabsList className="flex min-w-full w-max overflow-visible scrollbar-hide min-h-[20px] p-0">
                        <TabsTrigger value="SCI" title="Science" className="flex-shrink-0 min-w-[24px] text-[9px] px-0.5">SCI</TabsTrigger>
                        <TabsTrigger value="SER" title="Service to humanity" className="flex-shrink-0 min-w-[24px] text-[9px] px-0.5">SER</TabsTrigger>
                        <TabsTrigger value="SHR" title="Subset of Hindu religion" className="flex-shrink-0 min-w-[24px] text-[9px] px-0.5">SHR</TabsTrigger>
                        <TabsTrigger value="SMH" title="Songs, Mantra, Shlokas, Prayers & Hymns" className="flex-shrink-0 min-w-[24px] text-[9px] px-0.5">SMH</TabsTrigger>
                        <TabsTrigger value="SNK" title="Sankara" className="flex-shrink-0 min-w-[24px] text-[9px] px-0.5">SNK</TabsTrigger>
                        <TabsTrigger value="SPD" title="Spiritual Practice & Discipline" className="flex-shrink-0 min-w-[24px] text-[9px] px-0.5">SPD</TabsTrigger>
                        <TabsTrigger value="SRK" title="Sri Ramakrishna, Life & Teachings" className="flex-shrink-0 min-w-[24px] text-[9px] px-0.5">SRK</TabsTrigger>
                        <TabsTrigger value="VED" title="Vedanta Philosophy" className="flex-shrink-0 min-w-[24px] text-[9px] px-0.5">VED</TabsTrigger>
                        <TabsTrigger value="VIV" title="Swami Vivekananda, Life & Teachings" className="flex-shrink-0 min-w-[24px] text-[9px] px-0.5">VIV</TabsTrigger>
                        <TabsTrigger value="UVO" title="Upanishads, Vedas, Sutras etc." className="flex-shrink-0 min-w-[24px] text-[9px] px-0.5">UVO</TabsTrigger>
                      </TabsList>
                    </div>
                </div>
              </div>
              
              {/* Mobile Row 3: Languages */}
              <div className="w-full overflow-hidden px-1">
                <div className="flex items-center gap-1">
                  <div className="overflow-x-auto scrollbar-hide flex-1">
                    <TabsList className="flex min-w-full w-max overflow-visible scrollbar-hide min-h-[20px] p-0">
                      <TabsTrigger value="E" title="English" className="flex-shrink-0 text-[9px] px-1 min-w-[28px]">EN</TabsTrigger>
                      <TabsTrigger value="S" title="Sanskrit" className="flex-shrink-0 text-[9px] px-1 min-w-[28px]">SA</TabsTrigger>
                      <TabsTrigger value="H" title="Hindi" className="flex-shrink-0 text-[9px] px-1 min-w-[28px]">HI</TabsTrigger>
                      <TabsTrigger value="B" title="Bengali" className="flex-shrink-0 text-[9px] px-1 min-w-[28px]">BN</TabsTrigger>
                      <TabsTrigger value="T" title="Tamil" className="flex-shrink-0 text-[9px] px-1 min-w-[28px]">TA</TabsTrigger>
                    </TabsList>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop: Single row layout with horizontal scrolling */}
            <div className="hidden md:block w-full overflow-hidden px-1">
              <div className="overflow-x-auto scrollbar-hide">
                <TabsList className="flex min-w-full w-max overflow-visible scrollbar-hide min-h-[36px] p-0 justify-start">
                  {/* All Categories */}
                  <TabsTrigger value="CLB" title="Class books" className="flex-shrink-0 text-xs px-2 min-w-[36px]">CLB</TabsTrigger>
                  <TabsTrigger value="DDL" title="Lives of Direct Disciples of Sri Ramakrishna" className="flex-shrink-0 text-xs px-2 min-w-[36px]">DDL</TabsTrigger>
                  <TabsTrigger value="DMW" title="Divine mother worship" className="flex-shrink-0 text-xs px-2 min-w-[36px]">DMW</TabsTrigger>
                  <TabsTrigger value="GIT" title="Gita" className="flex-shrink-0 text-xs px-2 min-w-[36px]">GIT</TabsTrigger>
                  <TabsTrigger value="HIS" title="History" className="flex-shrink-0 text-xs px-2 min-w-[36px]">HIS</TabsTrigger>
                  <TabsTrigger value="HMS" title="Holy Mother, Life and Teachings" className="flex-shrink-0 text-xs px-2 min-w-[36px]">HMS</TabsTrigger>
                  <TabsTrigger value="KID" title="Children" className="flex-shrink-0 text-xs px-2 min-w-[36px]">KID</TabsTrigger>
                  <TabsTrigger value="MNP" title="Mythology & Puranas" className="flex-shrink-0 text-xs px-2 min-w-[36px]">MNP</TabsTrigger>
                  <TabsTrigger value="ODL" title="Lives of Other Disciples" className="flex-shrink-0 text-xs px-2 min-w-[36px]">ODL</TabsTrigger>
                  <TabsTrigger value="OPH" title="Other Philosophies" className="flex-shrink-0 text-xs px-2 min-w-[36px]">OPH</TabsTrigger>
                  <TabsTrigger value="PIL" title="Pilgrimage & Tourism" className="flex-shrink-0 text-xs px-2 min-w-[36px]">PIL</TabsTrigger>
                  <TabsTrigger value="SCI" title="Science" className="flex-shrink-0 text-xs px-2 min-w-[36px]">SCI</TabsTrigger>
                  <TabsTrigger value="SER" title="Service to humanity" className="flex-shrink-0 text-xs px-2 min-w-[36px]">SER</TabsTrigger>
                  <TabsTrigger value="SHR" title="Subset of Hindu religion" className="flex-shrink-0 text-xs px-2 min-w-[36px]">SHR</TabsTrigger>
                  <TabsTrigger value="SMH" title="Songs, Mantra, Shlokas, Prayers & Hymns" className="flex-shrink-0 text-xs px-2 min-w-[36px]">SMH</TabsTrigger>
                  <TabsTrigger value="SNK" title="Sankara" className="flex-shrink-0 text-xs px-2 min-w-[36px]">SNK</TabsTrigger>
                  <TabsTrigger value="SPD" title="Spiritual Practice & Discipline" className="flex-shrink-0 text-xs px-2 min-w-[36px]">SPD</TabsTrigger>
                  <TabsTrigger value="SRK" title="Sri Ramakrishna, Life & Teachings" className="flex-shrink-0 text-xs px-2 min-w-[36px]">SRK</TabsTrigger>
                  <TabsTrigger value="VED" title="Vedanta Philosophy" className="flex-shrink-0 text-xs px-2 min-w-[36px]">VED</TabsTrigger>
                  <TabsTrigger value="VIV" title="Swami Vivekananda, Life & Teachings" className="flex-shrink-0 text-xs px-2 min-w-[36px]">VIV</TabsTrigger>
                  <TabsTrigger value="UVO" title="Upanishads, Vedas, Sutras etc." className="flex-shrink-0 text-xs px-2 min-w-[36px]">UVO</TabsTrigger>
                  {/* Visual separator */}
                  <span className="flex-shrink-0 mx-1 h-full w-px bg-border self-center" />
                  {/* Languages */}
                  <TabsTrigger value="E" title="English" className="flex-shrink-0 text-xs px-3 min-w-[40px]">English</TabsTrigger>
                  <TabsTrigger value="S" title="Sanskrit" className="flex-shrink-0 text-xs px-3 min-w-[40px]">Sanskrit</TabsTrigger>
                  <TabsTrigger value="H" title="Hindi" className="flex-shrink-0 text-xs px-3 min-w-[40px]">Hindi</TabsTrigger>
                  <TabsTrigger value="B" title="Bengali" className="flex-shrink-0 text-xs px-3 min-w-[40px]">Bengali</TabsTrigger>
                  <TabsTrigger value="T" title="Tamil" className="flex-shrink-0 text-xs px-3 min-w-[40px]">Tamil</TabsTrigger>
                </TabsList>
              </div>
            </div>
          </div>

          {/* Optimized pagination for small mobile screens */}
          <div className="mb-2 md:mb-4 flex flex-col gap-2 md:gap-3 md:flex-row md:items-center md:justify-between px-1">
              <div className="text-xs md:text-sm text-muted-foreground text-center md:text-left">
                  Showing {((paginationInfo.page - 1) * paginationInfo.pageSize) + 1}-{Math.min(paginationInfo.page * paginationInfo.pageSize, paginationInfo.total)} of {paginationInfo.total} results
              </div>
              <div className="flex items-center justify-center md:justify-end gap-1 md:gap-2">
                  <TabsList className="overflow-x-auto max-w-full min-h-[32px] md:min-h-[40px]">
                      <TabsTrigger 
                          value={`page-first`}
                          onClick={goToFirstPage}
                          disabled={currentPage === 1}
                          className="data-[disabled=true]:opacity-50 data-[disabled=true]:pointer-events-none hover:bg-black hover:text-white transition-colors duration-200 min-w-fit text-xs md:text-sm px-1.5 md:px-3"
                      >
                          First
                      </TabsTrigger>
                      <TabsTrigger 
                          value={`page-prev`}
                          onClick={goToPreviousPage}
                          disabled={!paginationInfo.hasPrev}
                          className="data-[disabled=true]:opacity-50 data-[disabled=true]:pointer-events-none hover:bg-black hover:text-white transition-colors duration-200 min-w-fit text-xs md:text-sm px-1.5 md:px-3"
                      >
                          Prev
                      </TabsTrigger>
                      
                      {/* Page number tabs - more compact for mobile */}
                      {(() => {
                          const pages = [];
                          const totalPages = paginationInfo.totalPages;
                          const current = currentPage;
                          
                          // Use smaller page range for better mobile experience
                          const pageRange = 1; // Show fewer pages for mobile
                          
                          // Always show first page
                          if (current > pageRange + 1) {
                              pages.push(
                                  <TabsTrigger 
                                      key={1}
                                      value={`page-${1}`}
                                      onClick={() => goToPage(1)}
                                      className={`transition-colors duration-200 hover:bg-black hover:text-white min-w-fit text-xs md:text-sm px-1.5 md:px-3 ${current === 1 ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}`}
                                  >
                                      1
                                  </TabsTrigger>
                              );
                              if (current > pageRange + 2) {
                                  pages.push(<span key="ellipsis1" className="px-0.5 md:px-2 text-muted-foreground text-xs md:text-sm">...</span>);
                              }
                          }
                          
                          // Show pages around current page
                          for (let i = Math.max(1, current - pageRange); i <= Math.min(totalPages, current + pageRange); i++) {
                              pages.push(
                                  <TabsTrigger 
                                      key={i}
                                      value={`page-${i}`}
                                      onClick={() => goToPage(i)}
                                      className={`transition-colors duration-200 hover:bg-black hover:text-white min-w-fit text-xs md:text-sm px-1.5 md:px-3 ${current === i ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}`}
                                  >
                                      {i}
                                  </TabsTrigger>
                              );
                          }
                          
                          // Always show last page
                          if (current < totalPages - pageRange) {
                              if (current < totalPages - pageRange - 1) {
                                  pages.push(<span key="ellipsis2" className="px-0.5 md:px-2 text-muted-foreground text-xs md:text-sm">...</span>);
                              }
                              pages.push(
                                  <TabsTrigger 
                                      key={totalPages}
                                      value={`page-${totalPages}`}
                                      onClick={() => goToPage(totalPages)}
                                      className={`transition-colors duration-200 hover:bg-black hover:text-white min-w-fit text-xs md:text-sm px-1.5 md:px-3 ${current === totalPages ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}`}
                                  >
                                      {totalPages}
                                  </TabsTrigger>
                              );
                          }
                          
                          return pages;
                      })()}
                      
                      <TabsTrigger 
                          value={`page-next`}
                          onClick={goToNextPage}
                          disabled={!paginationInfo.hasNext}
                          className="data-[disabled=true]:opacity-50 data-[disabled=true]:pointer-events-none hover:bg-black hover:text-white transition-colors duration-200 min-w-fit text-xs md:text-sm px-1.5 md:px-3"
                      >
                          Next
                      </TabsTrigger>
                      <TabsTrigger 
                          value={`page-last`}
                          onClick={goToLastPage}
                          disabled={currentPage === paginationInfo.totalPages}
                          className="data-[disabled=true]:opacity-50 data-[disabled=true]:pointer-events-none hover:bg-black hover:text-white transition-colors duration-200 min-w-fit text-xs md:text-sm px-1.5 md:px-3"
                      >
                          Last
                      </TabsTrigger>
                  </TabsList>
              </div>
          </div>
          </div>

          {/* Content container with top padding to account for sticky header */}
          <div className="pt-4">
              <Catalog data={filteredCatalog} isAdmin={isAdmin}></Catalog>
          </div>

          <CreateItemModal
            isOpen={isCreateModalOpen}
            onClose={() => setCreateModalOpen(false)}
            onSave={handleCreateItem}
          />
      </Tabs>
  );
}
