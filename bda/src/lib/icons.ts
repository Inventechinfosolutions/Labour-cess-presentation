import {
  Bank,
  Bell,
  Briefcase,
  Buildings,
  Calculator,
  ChartLineUp,
  ChatCircleDots,
  Coins,
  CreditCard,
  Database,
  Desktop,
  DotsThree,
  FileText,
  Gavel,
  GlobeHemisphereEast,
  HouseLine,
  Images,
  Info,
  Leaf,
  MapPin,
  MapPinArea,
  MapTrifold,
  Newspaper,
  NotePencil,
  Phone,
  Question,
  RoadHorizon,
  Scales,
  SquaresFour,
  Timer,
  UserCircle,
  ChartBar,
  Plant,
  RocketLaunch,
  ShieldCheck,
  UsersThree,
  type Icon,
} from "@phosphor-icons/react";
import type { HeroFeature, HighlightKey, OnlineIcon, QuickIcon, ServiceIcon, ValueKey } from "@/lib/content";

export const FEATURE_ICONS: Record<HeroFeature, Icon> = {
  planned: Plant,
  growth: Buildings,
  amenities: UsersThree,
  future: ShieldCheck,
};

export const VALUE_ICONS: Record<ValueKey, Icon> = {
  citizen: UsersThree,
  sustainable: Leaf,
  transparent: ChartBar,
  future: RocketLaunch,
};

export const HIGHLIGHT_ICONS: Record<HighlightKey, Icon> = {
  helpline: Phone,
  grievance: NotePencil,
  green: Leaf,
  allotment: HouseLine,
  press: Newspaper,
  news: Bell,
};

export const SERVICE_ICONS: Record<ServiceIcon, Icon> = {
  auction: Gavel,
  layouts: MapTrifold,
  online: Desktop,
  rti: FileText,
  casite: MapPin,
  cdrms: Database,
  calculator: Calculator,
  corridor: RoadHorizon,
  map: MapPinArea,
  contact: Phone,
  stray: MapPin,
  jcc: Info,
  commissioner: UserCircle,
  business: ChartLineUp,
  tax: CreditCard,
  flats: HouseLine,
  formed: SquaresFour,
  south: SquaresFour,
  gallery: Images,
  more: DotsThree,
};

export const ONLINE_ICONS: Record<OnlineIcon, Icon> = {
  gis: GlobeHemisphereEast,
  sakala: Timer,
  housing: Buildings,
  ptax: Bank,
  betterment: Coins,
  rti: FileText,
  seva: Briefcase,
  more: DotsThree,
};

export const QUICK_ICONS: Record<QuickIcon, Icon> = {
  acts: Scales,
  zone: MapTrifold,
  tender: FileText,
  faq: Question,
  rti: Info,
  grievance: ChatCircleDots,
  map: MapPinArea,
  gallery: Images,
};
