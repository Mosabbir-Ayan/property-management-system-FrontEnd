import LandingNavbar from "@/components/landing/LandingNavbar";
import LandingHero from "@/components/landing/LandingHero";
import LandingFeatureGrid from "@/components/landing/LandingFeatureGrid";
import LandingRoles from "@/components/landing/LandingRoles";
import LandingShowcase from "@/components/landing/LandingShowcase";
import LandingFaq from "@/components/landing/LandingFaq";
import LandingFooter from "@/components/landing/LandingFooter";


export default function LandingPage() {

  const heroProps = {
    TopName: "Dwellix - Property Management",
    headlineTop: "Property management,",
    headlineBottom: "without the mess.",
    copy: "",
    imageSrc: "/property-01.jpg",
    imageAlt: "Dwellix platform preview",
  };

  const featureProps = {
    kicker: "Features",
    titleTop: "The essentials,",
    titleBottom: "Less chasing.",
    intro:
      "A simple property management platform that brings the everyday essentials together- while keeping private property and user information inside authorized workspaces.",
    features: [
      {
        number: "01",
        title: "Stay Organized",
        copy: "Bring property-management workflows into one clean and structured digital experience.",
      },
      {
        number: "02",
        title: "Work Clearly",
        copy: "Keep everyday tasks and communication easier to follow from the right workspace.",
      },
      {
        number: "03",
        title: "Connect People",
        copy: "Help authorized users stay connected through a consistent property-management platform.",
      },
      {
        number: "04",
        title: "Protect Access",
        copy: "Keep personal, property and operational information inside the appropriate authorized workspace.",
      },
    ],
  };

  const rolesProps = {
    titleTop: "Built to make",
    titleBottom: "Simple for everyone.",
    intro:
      "Roles",
    roles: [
      {
        number: "ADMINISTRATOR",
        name: "Admin",
        copy: "Full oversight of properties, people and operational activity.",
        points: ["Manage users & properties", "Review complaints", "Publish announcements"],
      },
      {
        number: "OWNER",
        name: "Landlord",
        copy: "Own the portfolio: properties, tenants and payments.",
        points: ["List properties", "Approve tenants", "Track rent & bills"],
      },
      {
        number: "OPERATIONS",
        name: "Staff",
        copy: "Resolve issues with work orders and worker dispatching.",
        points: ["Triage issues", "Dispatch workers", "Complete work orders"],
      },
      {
        number: "RESIDENT",
        name: "Tenant",
        copy: "A resident portal for rent, bills and maintenance requests.",
        points: ["Pay rent & bills", "Report issues", "Get announcements"],
      },
    ],
  };

  const showcaseProps = {
    kicker: "Public by default. Private where it matters.",
    titleTop: "See the platform.",
    titleBottom: "Never someone else's data.",
    intro:
      "Visitors can explore Dwellix without being shown property addresses, tenant information, financial figures, maintenance records or internal operations.",
    checks: [
      "Public pages contain no real property records",
      "No tenant or landlord information is displayed publicly",
      "No payments, transactions or maintenance records are exposed",
      "Private information is reserved for authorized workspaces",
    ],
    images: [
      { src: "/property-02.jpg", alt: "Dwellix admin dashboard", },
      { src: "/property-04.jpg", alt: "Dwellix property overview", },
      { src: "/property-03.png", alt: "Dwellix building view", },
    ],
  };

  const faqProps = {
    titleTop: "FAQs",
    titleBottom: "Before you step in.",
    intro: "A few quick answers about Dwellix.",
    faqs: [
      {
        question: "What is Dwellix?",
        answer:
          "Dwellix is a property management platform designed to bring everyday property operations into one organized digital experience.",
      },
      {
        question: "Can I explore Dwellix without an account?",
        answer:
          "Yes. The public landing page is designed to explain the platform without exposing private workspace information.",
      },
      {
        question: "Is private property information shown on this page?",
        answer:
          "No. The public page contains only general product information and intentionally avoids real property, tenant, payment and operational records.",
      },
      {
        question: "How do I access my workspace?",
        answer:
          "Use the Member Login button and continue through your authorized Dwellix access flow — Administrator, Landlord, Staff or Tenant.",
      },
      {
        question: "Will different users see different information?",
        answer:
          "Yes. Dwellix is structured around controlled access so users receive the workspace and information appropriate to their authorization.",
      },
    ],
  };

  const footerProps = {
    brand: "Dwellix",
    tagline: "Your trusted partner in property management.",
    accessTitle: "Access",
    accessLinks: [
      { label: "Member Login", href: "/login" },
    ],
    supportTitle: "Support",
    supportEmail: "support@dwellix.com",
    copyright: "© 2026 Dwellix Property Management. All rights reserved.",
    wordmark: "Dwellix",
  };

  return (
    <main>
      <LandingNavbar />
      <LandingHero {...heroProps} />
      <LandingFeatureGrid {...featureProps} />
      <LandingRoles {...rolesProps} />
      <LandingShowcase {...showcaseProps} />

      <section id="how" className="bg-[#f3f1eb] py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-dwellix-500">
              How it works
            </p>
            <h2 className="mt-3 text-4xl font-bold tracking-tight text-gray-900 md:text-6xl">
              Get started in
              <br />
              four steps.
            </h2>
          </div>

          <div className="grid gap-px overflow-hidden rounded-lg border border-gray-300 bg-gray-300 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                step: "1",
                title: "Choose your role",
                copy: "Administrator, Landlord, Staff or Tenant — start with the workspace built for you.",
              },
              {
                step: "2",
                title: "Sign in securely",
                copy: "Use your Dwellix account to enter your role-based workspace.",
              },
              {
                step: "3",
                title: "Enter your workspace",
                copy: "Your authorized workspace shows only the information and tools intended for your access level.",
              },
              {
                step: "4",
                title: "Get things done",
                copy: "Use your private workspace to manage the tasks and information relevant to you.",
              },
            ].map((item) => (
              <div key={item.step} className="bg-[#f3f1eb] p-6">
                <p className="text-5xl font-bold text-dwellix-500">{item.step}</p>
                <h3 className="mt-8 text-lg font-bold text-gray-900">{item.title}</h3>
                <p className="mt-2 text-xs leading-6 text-gray-500">{item.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <LandingFaq {...faqProps} />

      <section className="bg-dwellix-500 py-20 text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 md:flex-row md:items-center md:justify-between">
          <h2 className="max-w-xl text-4xl font-bold leading-tight tracking-tight md:text-6xl">
            Everything your property needs, in one place.
          </h2>
          <div className="max-w-sm">
            <p className="text-sm leading-7 opacity-90">
              Bring your property operation into one connected Dwellix experience.
            </p>
            <a
              href="/login"
              className="mt-6 inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-100"
            >
              Enter Dwellix →
            </a>
          </div>
        </div>
      </section>
      <LandingFooter {...footerProps} />
    </main>
  );
}
