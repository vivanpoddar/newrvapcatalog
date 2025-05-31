import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Divide, File, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuPortal, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { createClient } from '../../utils/supabase/server';
import Catalog from '../../components/catalog/catalog';
import ProductsPageClient from './products-page-client';

export default async function ProductsPage({
  searchParams
}: {
  searchParams: { q?: string; offset?: string };
}) {
  const search = searchParams.q ?? '';
  const offset = searchParams.offset ?? '0';

  const supabase = await createClient();
  // const { data: catalog } = await supabase.from('catalog').select();
  const catalog: any = []
  return <ProductsPageClient catalog={catalog || []} />;
}
