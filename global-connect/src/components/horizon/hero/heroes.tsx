import {
  Bank,
  Briefcase,
  Buildings,
  CalendarStar,
  ChartBar,
  ChartLineUp,
  Factory,
  Flask,
  GlobeHemisphereEast,
  GraduationCap,
  Handshake,
  Lightbulb,
  MapPin,
  ShieldCheck,
  Shuffle,
  UsersFour,
  UsersThree,
} from "@phosphor-icons/react";
import connectPhoto from "@/assets/horizon/connect.jpg";
import discoverPhoto from "@/assets/horizon/discover.jpg";
import investPhoto from "@/assets/horizon/invest.jpg";
import partnerPhoto from "@/assets/horizon/partner.jpg";
import talentPhoto from "@/assets/horizon/talent.jpg";
import { HorizonPageHero } from "./HorizonPageHero";

type Props = { reduce: boolean };

export function HorizonInvestHero({ reduce }: Props) {
  return (
    <HorizonPageHero
      reduce={reduce}
      pathway="invest"
      crumb="Invest"
      eyebrow="Invest in Karnataka"
      eyebrowIcon={ChartBar}
      title={["Invest in a State", "Built for Growth"]}
      sub="Clear guidance from your first enquiry to an established investment in Karnataka."
      primary={{ label: "Start Your Journey", href: "#how" }}
      secondary={{ label: "Explore Opportunities", href: "#opportunities" }}
      chips={[
        { icon: ShieldCheck, label: "Single window" },
        { icon: UsersThree, label: "Investor support" },
        { icon: Factory, label: "Land and infrastructure" },
      ]}
      photo={investPhoto}
      photoAlt="Business leaders reviewing plans outside a Bengaluru technology campus"
      facts={[
        { icon: ChartLineUp, value: "₹25 lakh crore+", label: "State GSDP" },
        { icon: Buildings, value: "40+", label: "Global capability centres" },
        { icon: Handshake, value: "One team", label: "Investor facilitation" },
      ]}
    />
  );
}

export function HorizonConnectHero({ reduce }: Props) {
  return (
    <HorizonPageHero
      reduce={reduce}
      pathway="connect"
      crumb="Connect"
      eyebrow="Global Kannadiga Community"
      eyebrowIcon={UsersThree}
      title={["Connect With", "Global Kannadigas"]}
      sub="Stay close to Karnataka, wherever you live and work."
      primary={{ label: "Join the Global Community", href: "#join" }}
      secondary={{ label: "Explore the Community", href: "#community" }}
      chips={[
        { icon: GlobeHemisphereEast, label: "Global community" },
        { icon: Briefcase, label: "Professionals" },
        { icon: UsersFour, label: "Associations" },
        { icon: CalendarStar, label: "Events" },
      ]}
      photo={connectPhoto}
      photoAlt="A Kannadiga family welcomed home with a jasmine garland at the airport"
      facts={[
        { icon: GlobeHemisphereEast, value: "100+", label: "Countries" },
        { icon: UsersFour, value: "Associations", label: "Kannada sanghas worldwide" },
        { icon: CalendarStar, value: "Events", label: "Gatherings and festivals" },
      ]}
    />
  );
}

export function HorizonTalentHero({ reduce }: Props) {
  return (
    <HorizonPageHero
      reduce={reduce}
      pathway="talent"
      crumb="Talent"
      eyebrow="Global Talent"
      eyebrowIcon={GraduationCap}
      title={["Local Talent,", "Global Reach"]}
      sub="Connect students, professionals and researchers with opportunities across the world."
      primary={{ label: "Explore Talent Opportunities", href: "#looking" }}
      secondary={{ label: "Create Your Talent Profile", href: "#profile" }}
      chips={[
        { icon: Briefcase, label: "Employment" },
        { icon: GraduationCap, label: "Higher education" },
        { icon: Flask, label: "Research" },
        { icon: Shuffle, label: "Exchange" },
      ]}
      photo={talentPhoto}
      photoAlt="A data scientist presenting to an international team in a Bengaluru office"
      facts={[
        { icon: UsersThree, value: "1.6M+", label: "Skilled workforce" },
        { icon: GraduationCap, value: "Universities", label: "Research and learning" },
        { icon: Briefcase, value: "Careers", label: "Global employers" },
      ]}
    />
  );
}

export function HorizonPartnerHero({ reduce }: Props) {
  return (
    <HorizonPageHero
      reduce={reduce}
      pathway="partner"
      crumb="Partnerships"
      eyebrow="Partnerships"
      eyebrowIcon={Handshake}
      title={["Partner With", "Karnataka"]}
      sub="Work with Karnataka's industries, institutions, universities and research organisations."
      primary={{ label: "Explore Partnership Opportunities", href: "#opportunities" }}
      secondary={{ label: "Register as a Partner", href: "#build" }}
      chips={[
        { icon: Factory, label: "Industry" },
        { icon: GraduationCap, label: "Academia" },
        { icon: Bank, label: "Government" },
        { icon: Flask, label: "Research" },
      ]}
      photo={partnerPhoto}
      photoAlt="An official and an international delegate signing a memorandum of understanding"
      facts={[
        { icon: Handshake, value: "MoUs", label: "Agreements that deliver" },
        { icon: Bank, value: "Institutions", label: "Universities and laboratories" },
        { icon: GlobeHemisphereEast, value: "Cities", label: "Sister-city links" },
      ]}
    />
  );
}

export function HorizonDiscoverHero({ reduce }: Props) {
  return (
    <HorizonPageHero
      reduce={reduce}
      pathway="discover"
      crumb="Opportunities"
      eyebrow="Opportunities"
      eyebrowIcon={Lightbulb}
      title={["Discover What", "Karnataka Offers"]}
      sub="Investment, partnership, talent and project opportunities, in one place."
      primary={{ label: "Explore Opportunities", href: "#search" }}
      secondary={{ label: "Submit an Opportunity", href: "#share" }}
      chips={[
        { icon: ChartLineUp, label: "Investment" },
        { icon: Buildings, label: "Projects" },
        { icon: Handshake, label: "Partnerships" },
        { icon: UsersThree, label: "Talent" },
      ]}
      photo={discoverPhoto}
      photoAlt="Aerial view of Bengaluru with the metro line at golden hour"
      facts={[
        { icon: MapPin, value: "31", label: "Districts" },
        { icon: Buildings, value: "Projects", label: "Infrastructure and urban" },
        { icon: Lightbulb, value: "5,000+", label: "Startups" },
      ]}
    />
  );
}
