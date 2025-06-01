"use client";

import { useState, useCallback, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Catalog from '../../components/catalog/catalog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuPortal, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { File, PlusCircle } from 'lucide-react';

export default function ProductsPageClient({ catalog }: { catalog: any[] }) {
  const [selectedTabs, setSelectedTabs] = useState<string[]>([""]);
  const [yearRange, setYearRange] = useState<number[]>([1800, 2024]);
  const [tempYearRange, setTempYearRange] = useState<number[]>([1800, 2024]);
  const [isYearFilterActive, setIsYearFilterActive] = useState(false);
  const [searchCriteria, setSearchCriteria] = useState<string>("title");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeSearchQueries, setActiveSearchQueries] = useState<Array<{id: string, criteria: string, query: string}>>([]);
  const [isSearchFilterActive, setIsSearchFilterActive] = useState(false);

  const yearFilterId = `year-${yearRange[0]}-${yearRange[1]}`;
  const searchFilterIds = activeSearchQueries.map(sq => `search-${sq.criteria}-${sq.query}`);

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
    }
    // If "All" is selected, clear all filters
    else if (filteredValues.includes("")) {
      setIsYearFilterActive(false);
      setYearRange([1800, 2024]);
      setTempYearRange([1800, 2024]);
      setIsSearchFilterActive(false);
      setSearchCriteria("title");
      setSearchQuery("");
      setActiveSearchQueries([]);
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
      categories: [],
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
      categories: ["All"],
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
        categories: [],
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
    
    // Return to "All" when search filter is cleared
    setSelectedTabs([""]);
    
    console.log('All search filters cleared');
    console.log('Selected filters:', {
      categories: ["All"],
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
        setSelectedTabs([""]);
      }
      
      console.log('Search query removed:', queryId);
      console.log('Remaining search queries:', updated);
      return updated;
    });
  }, []);

  // Log combined filter state whenever filters change
  useEffect(() => {
    const activeFilters: {
      categories: string[];
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
      categories: [],
      yearRange: null,
      searchQueries: []
    };
    
    if (selectedTabs.length > 0 && !selectedTabs.includes("")) {
      activeFilters.categories = [...selectedTabs];
    } else if (selectedTabs.includes("")) {
      activeFilters.categories = ["All"];
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
  }, [selectedTabs, isYearFilterActive, yearFilterId, isSearchFilterActive, searchFilterIds]);

  // Apply filtering logic based on the new dictionary structure
  const filteredCatalog = catalog.filter(item => {
    // Get current active filters
    const activeFilters: {
      categories: string[];
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
      categories: [],
      yearRange: null,
      searchQueries: []
    };
    
    if (selectedTabs.length > 0 && !selectedTabs.includes("")) {
      activeFilters.categories = [...selectedTabs];
    } else if (selectedTabs.includes("")) {
      activeFilters.categories = ["All"];
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

    // Apply category filter
    if (activeFilters.categories.length > 0 && !activeFilters.categories.includes("All")) {
      const itemCategory = item.category?.toString().trim();
      if (!itemCategory || !activeFilters.categories.includes(itemCategory)) {
        return false;
      }
    }

    // Apply year range filter
    if (activeFilters.yearRange) {
      const itemYear = parseInt(item.pubyear?.toString() || "0");
      if (itemYear < activeFilters.yearRange.min || itemYear > activeFilters.yearRange.max) {
        return false;
      }
    }

    // Apply search queries filter
    if (activeFilters.searchQueries.length > 0) {
      const matchesAllQueries = activeFilters.searchQueries.every(searchQuery => {
        const { criteria, query } = searchQuery;
        const searchValue = query.toLowerCase().trim();
        
        if (!searchValue) return true;
        
        let fieldValue = "";
        switch (criteria) {
          case "title":
            fieldValue = item.title?.toString().toLowerCase() || "";
            break;
          case "category":
            fieldValue = item.category?.toString().toLowerCase() || "";
            break;
          case "language":
            fieldValue = item.language?.toString().toLowerCase() || "";
            break;
          case "author":
            const firstName = item.firstname?.toString().toLowerCase() || "";
            const lastName = item.lastname?.toString().toLowerCase() || "";
            fieldValue = `${firstName} ${lastName}`.trim();
            break;
          case "year":
            fieldValue = item.pubyear?.toString() || "";
            break;
          default:
            return true;
        }
        
        return fieldValue.includes(searchValue);
      });
      
      if (!matchesAllQueries) {
        return false;
      }
    }

    return true;
  });

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
                  <Button size="sm" className="h-8 gap-1">
                      <PlusCircle className="h-3.5 w-3.5" />
                      <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                          Add Book
                      </span>
                  </Button>
              </div>
          </div>

          <div className='mb-2'>
              <TabsList>
                  <TabsTrigger value="CLB">CLB</TabsTrigger>
                  <TabsTrigger value="DDL">DDL</TabsTrigger>
                  <TabsTrigger value="DMW">DMW</TabsTrigger>
                  <TabsTrigger value="GIT">GIT</TabsTrigger>
                  <TabsTrigger value="HIS">HIS</TabsTrigger>
                  <TabsTrigger value="HMS">HMS</TabsTrigger>
                  <TabsTrigger value="KID">KID</TabsTrigger>
                  <TabsTrigger value="MNP">MNP</TabsTrigger>
                  <TabsTrigger value="ODL">ODL</TabsTrigger>
                  <TabsTrigger value="OPH">OPH</TabsTrigger>
                  <TabsTrigger value="PIL">PIL</TabsTrigger>
                  <TabsTrigger value="SCI">SCI</TabsTrigger>
                  <TabsTrigger value="SER">SER</TabsTrigger>
                  <TabsTrigger value="SHR">SHR</TabsTrigger>
                  <TabsTrigger value="SMH">SMH</TabsTrigger>
                  <TabsTrigger value="SNK">SNK</TabsTrigger>
                  <TabsTrigger value="SPD">SPD</TabsTrigger>
                  <TabsTrigger value="SRK">SRK</TabsTrigger>
                  <TabsTrigger value="VED">VED</TabsTrigger>
                  <TabsTrigger value="VIV">VIV</TabsTrigger>
                  <TabsTrigger value="UVO">UVO</TabsTrigger>
                  <span className="mx-1 h-full w-px bg-border self-center" />
                  <TabsTrigger value="E">EN</TabsTrigger>
                  <TabsTrigger value="S">SA</TabsTrigger>
                  <TabsTrigger value="H">HI</TabsTrigger>
                  <TabsTrigger value="B">BN</TabsTrigger>
                  <TabsTrigger value="T">TA</TabsTrigger>
              </TabsList>
          </div>

          <Catalog data={filteredCatalog}></Catalog>

      </Tabs>
  );
}
