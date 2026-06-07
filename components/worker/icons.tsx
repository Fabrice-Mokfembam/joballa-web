import type { ComponentProps } from "react";
import {
  Bell,
  BookOpen,
  Bookmark,
  Briefcase,
  Building2,
  CheckCircle2,
  ChevronDown,
  Expand,
  ChevronLeft,
  CircleDollarSign,
  Ellipsis,
  Download,
  FileDown,
  Globe2,
  Grid3X3,
  LayoutDashboard,
  List,
  Map,
  MapPin,
  PanelLeftClose,
  Pencil,
  Phone,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  User,
  Wallet,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

type IconProps = ComponentProps<typeof Search>;

export function IconDashboard(props: IconProps) {
  return <LayoutDashboard aria-hidden strokeWidth={1.7} {...props} />;
}

export function IconBriefcase(props: IconProps) {
  return <Briefcase aria-hidden strokeWidth={1.7} {...props} />;
}

export function IconBookOpen(props: IconProps) {
  return <BookOpen aria-hidden strokeWidth={1.7} {...props} />;
}

export function IconBookmark(props: IconProps) {
  return <Bookmark aria-hidden strokeWidth={1.7} {...props} />;
}

/** Filled bookmark for saved-job cards */
export function IconBookmarkSolid(props: IconProps) {
  return <Bookmark aria-hidden fill="currentColor" strokeWidth={1.7} {...props} />;
}

export function IconMoney(props: IconProps) {
  return <CircleDollarSign aria-hidden strokeWidth={1.7} {...props} />;
}

export function IconUser(props: IconProps) {
  return <User aria-hidden strokeWidth={1.7} {...props} />;
}

export function IconSettings(props: IconProps) {
  return <Settings aria-hidden strokeWidth={1.7} {...props} />;
}

export function IconGlobe(props: IconProps) {
  return <Globe2 aria-hidden strokeWidth={1.7} {...props} />;
}

export function IconSearch(props: IconProps) {
  return <Search aria-hidden strokeWidth={1.8} {...props} />;
}

export function IconFilter(props: IconProps) {
  return <SlidersHorizontal aria-hidden strokeWidth={1.8} {...props} />;
}

export function IconGrid(props: IconProps) {
  return <Grid3X3 aria-hidden strokeWidth={1.7} {...props} />;
}

export function IconList(props: IconProps) {
  return <List aria-hidden strokeWidth={1.7} {...props} />;
}

export function IconMoreHorizontal(props: IconProps) {
  return <Ellipsis aria-hidden strokeWidth={1.8} {...props} />;
}

export function IconChevronLeft(props: IconProps) {
  return <ChevronLeft aria-hidden strokeWidth={1.8} {...props} />;
}

export function IconClose(props: IconProps) {
  return <X aria-hidden strokeWidth={1.8} {...props} />;
}

export function IconMap(props: IconProps) {
  return <Map aria-hidden strokeWidth={1.7} {...props} />;
}

export function IconPin(props: IconProps) {
  return <MapPin aria-hidden strokeWidth={1.7} {...props} />;
}

export function IconWallet(props: IconProps) {
  return <Wallet aria-hidden strokeWidth={1.7} {...props} />;
}

export function IconBuilding(props: IconProps) {
  return <Building2 aria-hidden strokeWidth={1.7} {...props} />;
}

export function IconBell(props: IconProps) {
  return <Bell aria-hidden strokeWidth={1.7} {...props} />;
}

export function IconPhone(props: IconProps) {
  return <Phone aria-hidden strokeWidth={1.7} {...props} />;
}

export function IconPlus(props: IconProps) {
  return <Plus aria-hidden strokeWidth={2} {...props} />;
}

export function IconDownload(props: IconProps) {
  return <Download aria-hidden strokeWidth={1.8} {...props} />;
}

export function IconFileDown(props: IconProps) {
  return <FileDown aria-hidden strokeWidth={1.8} {...props} />;
}

export function IconPencil(props: IconProps) {
  return <Pencil aria-hidden strokeWidth={1.8} {...props} />;
}

export function IconShieldCheck(props: IconProps) {
  return <ShieldCheck aria-hidden strokeWidth={1.8} {...props} />;
}

export function IconChevronDown(props: IconProps) {
  return <ChevronDown aria-hidden strokeWidth={1.8} {...props} />;
}

export function IconExpand(props: IconProps) {
  return <Expand aria-hidden strokeWidth={1.8} {...props} />;
}

export function IconCollapseSidebar(props: IconProps) {
  return <PanelLeftClose aria-hidden strokeWidth={1.7} {...props} />;
}

export function IconVerified(props: IconProps) {
  return <CheckCircle2 aria-hidden fill="#2563eb" color="#2563eb" stroke="white" strokeWidth={2.4} {...props} />;
}

/** Bottom tab / nav: applications */
export function IconApplicationsNav(props: IconProps) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="M9 5h10a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M7 7H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h1" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M5 9H4a1.5 1.5 0 0 0-1.5 1.5V17A1.5 1.5 0 0 0 4 18.5h1" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" opacity="0.35" />
    </svg>
  );
}

export function JoballaLogoMark({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-[#0e7377]",
        className,
      )}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
        <path
          d="M8 2.5c-1.2 1.8-2 4-2 6.2 0 2.3.8 4.4 2 6.3 1.2-1.9 2-4 2-6.3 0-2.1-.8-4.3-2-6.2Z"
          fill="#fbbf24"
          opacity="0.95"
        />
        <path d="M8 4.2v7.6" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    </div>
  );
}
