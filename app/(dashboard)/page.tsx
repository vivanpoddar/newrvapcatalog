import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Divide, File, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuPortal, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { createClient } from '../../utils/supabase/server';
import Catalog from '../../components/catalog/catalog';

export default async function ProductsPage({
  searchParams
}: {
  searchParams: { q?: string; offset?: string };
}) {
  const search = searchParams.q ?? '';
  const offset = searchParams.offset ?? '0';

  const supabase = await createClient();
  // const { data: catalog } = await supabase.from('catalog').select();
  const catalog: any = [];

  return (
    <Tabs defaultValue={[""]}>
      <div className="mb-2 flex items-center">
        <div className='flex'>
          <div className="inline-flex flex-col w-full rounded-md shadow-sm md:w-auto md:flex-row mr-2" role="group">
            <TabsList>
              <TabsTrigger value="">
                All
              </TabsTrigger>
              <span className="mx-1 h-full w-px bg-border self-center" />
              <TabsTrigger value="pubyear">
                Publication Year
              </TabsTrigger>
              <DropdownMenu>
                <DropdownMenuTrigger className='text-sm p-2 font-medium'>
                  Search Options
                </DropdownMenuTrigger>

                <DropdownMenuPortal>
                  <DropdownMenuContent className='animate-slideUpAndFade'>
                    <DropdownMenuItem>
                      Title
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className='m-[5px] h-px bg-secondary'></DropdownMenuSeparator>
                    <DropdownMenuItem>
                      ID
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className='m-[0.25em] bg-secondary'></DropdownMenuSeparator>
                    <DropdownMenuItem>
                      Author
                    </DropdownMenuItem>
                    <DropdownMenuItem>

                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenuPortal>
              </DropdownMenu>
            </TabsList>
         </div>

          <form className="flex items-center">
            <label className="sr-only">Search</label>
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg aria-hidden="true" className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input type="text" id="simple-search" className="outline-gray-400 block w-full p-2 pl-10 text-sm font-medium border border-gray-300 rounded-lg bg-muted focus:ring-primary-500 focus:border-primary-500" placeholder="Search" />
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

      <Catalog data={catalog}></Catalog>

    </Tabs>
  );
}
