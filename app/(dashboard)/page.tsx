import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { File, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'


// Update the import path below to the correct location of your Supabase client
import { createClient } from '../../utils/supabase/server';
import Catalog from '../../components/catalog/catalog';

export default async function ProductsPage(
  props: {
    searchParams: Promise<{ q: string; offset: string }>;
  }
) {
  const searchParams = await props.searchParams;
  const search = searchParams.q ?? '';
  const offset = searchParams.offset ?? 0;
  // const { products, newOffset, totalProducts } = await getProducts(
  //   search,
  //   Number(offset)
  // );

  const supabase = await createClient();
  const { data: catalog } = await supabase.from("catalog").select();

  return (
    <Tabs defaultValue="all">
      <div className="mb-2 flex items-center">
        {/* <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <span className="mx-1 h-5 w-px bg-muted-foreground/20 self-center" />
            <TabsTrigger value="active">Category</TabsTrigger>
            <TabsTrigger value="draft">Language</TabsTrigger>
            <TabsTrigger value="archived" className="hidden sm:flex">
              Name
            </TabsTrigger>
        </TabsList> */}
        <div className='flex'>
          <div className="inline-flex flex-col w-full rounded-md shadow-sm md:w-auto md:flex-row mr-2" role="group">
            <button type="button"
              className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg md:rounded-lg hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-2 focus:ring-primary-700 focus:text-primary-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-primary-500 dark:focus:text-white">
              All
            </button>
          </div>

          <div className="inline-flex flex-col w-full rounded-md shadow-sm md:w-auto md:flex-row" role="group">
            <Menu>
              <MenuButton className="inline-flex items-center gap-2 rounded-md bg-gray-800 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white data-hover:bg-gray-700 data-open:bg-gray-700">
                Options
              </MenuButton>

              <MenuItems
                transition
                anchor="bottom end"
                className="w-52 origin-top-right rounded-xl border border-white/5 bg-white/5 p-1 text-sm/6 text-white transition duration-100 ease-out [--anchor-gap:--spacing(1)] focus:outline-none data-closed:scale-95 data-closed:opacity-0"
              >
                <MenuItem>
                  <button className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-focus:bg-white/10">
                    Edit
                    <kbd className="ml-auto hidden font-sans text-xs text-white/50 group-data-focus:inline">⌘E</kbd>
                  </button>
                </MenuItem>
                <MenuItem>
                  <button className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-focus:bg-white/10">
                    Duplicate
                    <kbd className="ml-auto hidden font-sans text-xs text-white/50 group-data-focus:inline">⌘D</kbd>
                  </button>
                </MenuItem>
                <div className="my-1 h-px bg-white/5" />
                <MenuItem>
                  <button className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-focus:bg-white/10">
                    Archive
                    <kbd className="ml-auto hidden font-sans text-xs text-white/50 group-data-focus:inline">⌘A</kbd>
                  </button>
                </MenuItem>
                <MenuItem>
                  <button className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-focus:bg-white/10">
                    Delete
                    <kbd className="ml-auto hidden font-sans text-xs text-white/50 group-data-focus:inline">⌘D</kbd>
                  </button>
                </MenuItem>
              </MenuItems>
            </Menu>
            <form className="flex items-center">
              <label className="sr-only">Search</label>
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg aria-hidden="true" className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input type="text" id="simple-search" className="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Search"/>
              </div>
            </form>
          </div>
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
        </TabsList>
      </div>
      
      <Catalog data={catalog}></Catalog>

    </Tabs>
  );
}
