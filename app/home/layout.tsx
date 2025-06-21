import Link from 'next/link';
import {
  Home,
  Settings,
  SquareLibrary,
} from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { Analytics } from '@vercel/analytics/react';
import Providers from '../(dashboard)/providers';
import { NavItem } from '../(dashboard)/nav-item';
import { User } from '../(dashboard)/user';
import { DashboardBreadcrumb, MobileNav, DesktopNav } from 'app/(dashboard)/layout';

export default function HomeLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <main className="flex min-h-screen w-full flex-col bg-muted/40">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-[#e5e7eb] bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
        <MobileNav />
        <DashboardBreadcrumb />
        <DesktopNav />
        </header>
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
          <main className="grid flex-1 items-start gap-2 p-4 sm:px-6 sm:py-0 md:gap-4 bg-muted/40">
            {children}
          </main>
        </div>
        <Analytics />
      </main>
    </Providers>
  );
}

function DektopNav() {
  return (
    <aside className="fixed inset-y-0 left-0 z-100 hidden w-14 flex-col border-r bg-background sm:flex">
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
        <Link
          href="#"
          className="bg-white group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
        >
          <img src='/logo.svg' alt="RVAP" />
        </Link>

        <NavItem href="/home" label="Home">
          <Home className="h-5 w-5" />
        </NavItem>

        <NavItem href="/" label="Catalog">
          <SquareLibrary className="h-5 w-5" />
        </NavItem>

        <User />
      </nav>
      <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href="#"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
            >
              <Settings className="h-5 w-5" />
              <span className="sr-only">Settings</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">Settings</TooltipContent>
        </Tooltip>
      </nav>
    </aside>
  );
}

function HomeBreadcrumb() {
  return (
    <Breadcrumb className="flex">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <Home className="h-4 w-4" />
              Catalog
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage className="font-medium">Home</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
