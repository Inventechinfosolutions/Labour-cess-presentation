import {
  Briefcase,
  Buildings,
  CalendarStar,
  ChartLineUp,
  Flask,
  GlobeHemisphereEast,
  GraduationCap,
  Handshake,
  Shuffle,
  UsersFour,
  UsersThree,
} from "@phosphor-icons/react";
import { PageHero } from "./PageHero";
import { ConnectVisual, DiscoverVisual, InvestVisual, PartnerVisual, TalentVisual } from "./visuals";

type Props = { reduce: boolean };

export function HeritageInvestHero({ reduce }: Props) {
  return (
    <PageHero
      reduce={reduce}
      crumb="Invest"
      eyebrow="Invest in Karnataka"
      title={["Connect Capital", "With Karnataka"]}
      sub="A guided journey from your first enquiry to an established investment in Karnataka."
      primary={{ label: "Start Your Journey", href: "#how" }}
      secondary={{ label: "Explore Opportunities", href: "#opportunities" }}
      visual={<InvestVisual reduce={reduce} />}
    />
  );
}

export function HeritageConnectHero({ reduce }: Props) {
  return (
    <PageHero
      reduce={reduce}
      crumb="Connect"
      eyebrow="The Global Kannadiga Community"
      title={["Connect With", "Kannadigas"]}
      sub="Connect the global Kannadiga community with Karnataka, wherever you live."
      primary={{ label: "Join the Global Community", href: "#join" }}
      secondary={{ label: "Explore the Community", href: "#community" }}
      chips={[
        { icon: GlobeHemisphereEast, label: "Global community" },
        { icon: Briefcase, label: "Professionals" },
        { icon: UsersFour, label: "Associations" },
        { icon: CalendarStar, label: "Events" },
      ]}
      visual={<ConnectVisual reduce={reduce} />}
    />
  );
}

export function HeritageTalentHero({ reduce }: Props) {
  return (
    <PageHero
      reduce={reduce}
      crumb="Talent"
      eyebrow="Global Talent"
      title={["Connect Skills", "With Opportunity"]}
      sub="Connect Karnataka's skills, students and researchers with opportunities across the world."
      primary={{ label: "Explore Talent Opportunities", href: "#looking" }}
      secondary={{ label: "Create Your Talent Profile", href: "#profile" }}
      chips={[
        { icon: Briefcase, label: "Employment" },
        { icon: GraduationCap, label: "Higher education" },
        { icon: Flask, label: "Research" },
        { icon: Shuffle, label: "Exchange" },
      ]}
      visual={<TalentVisual reduce={reduce} />}
    />
  );
}

export function HeritagePartnerHero({ reduce }: Props) {
  return (
    <PageHero
      reduce={reduce}
      crumb="Partnerships"
      eyebrow="Partnerships"
      title={["Build Lasting", "Partnerships"]}
      sub="Collaborate with Karnataka's industries, institutions, universities and research organisations."
      primary={{ label: "Explore Partnership Opportunities", href: "#opportunities" }}
      secondary={{ label: "Register as a Partner", href: "#build" }}
      visual={<PartnerVisual reduce={reduce} />}
    />
  );
}

export function HeritageDiscoverHero({ reduce }: Props) {
  return (
    <PageHero
      reduce={reduce}
      crumb="Opportunities"
      eyebrow="Featured Opportunities"
      title={["Discover What", "Karnataka Offers"]}
      sub="Investment, partnership, talent and project opportunities across Karnataka, in one place."
      primary={{ label: "Explore Opportunities", href: "#search" }}
      secondary={{ label: "Submit an Opportunity", href: "#share" }}
      chips={[
        { icon: ChartLineUp, label: "Investment" },
        { icon: Buildings, label: "Projects" },
        { icon: Handshake, label: "Partnerships" },
        { icon: UsersThree, label: "Talent" },
      ]}
      visual={<DiscoverVisual reduce={reduce} />}
    />
  );
}
