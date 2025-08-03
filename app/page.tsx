// Xyqo.ai - Landing page (Next.js 14 + Tailwind CSS + i18n)

'use client';
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const content = {
  fr: {
    slogan: "L’automatisation simplifiée.",
    subtitle: "Le hub digital des services intelligents.",
    services: "Nos Services",
    contact: "Contact",
    servicesList: [
      {
        title: "XBill",
        desc: "Générez et déposez vos factures Factur-X en un clic.",
        link: "https://xbill.xyqo.ai",
        label: "Découvrir"
      },
      {
        title: "MMBooks",
        desc: "Transformez vos SMS Mobile Money en comptabilité OHADA.",
        link: "https://mmbooks.xyqo.ai",
        label: "Accéder"
      },
      {
        title: "SignaTrust",
        desc: "La signature électronique souveraine, mobile-first et légale.",
        link: "https://signatrust.xyqo.ai",
        label: "En savoir plus"
      }
    ],
    contactText: "Pour toute demande ou partenariat :",
    email: "admin@xyqo.ai"
  },
  en: {
    slogan: "Automation made simple.",
    subtitle: "The digital hub for smart services.",
    services: "Our Services",
    contact: "Contact",
    servicesList: [
      {
        title: "XBill",
        desc: "Generate and submit Factur-X invoices in one click.",
        link: "https://xbill.xyqo.ai",
        label: "Explore"
      },
      {
        title: "MMBooks",
        desc: "Convert your Mobile Money SMS into OHADA accounting.",
        link: "https://mmbooks.xyqo.ai",
        label: "Access"
      },
      {
        title: "SignaTrust",
        desc: "Sovereign electronic signature, mobile-first and legal.",
        link: "https://signatrust.xyqo.ai",
        label: "Learn more"
      }
    ],
    contactText: "For any request or partnership:",
    email: "admin@xyqo.ai"
  }
};

export default function Home() {
  const [lang, setLang] = useState<'fr' | 'en'>('fr');
  const t = content[lang];

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <header className="flex justify-between items-center p-6 border-b">
        <div className="flex items-center space-x-2">
          <Image src="/logo.png" alt="Xyqo Logo" width={40} height={40} />
          <h1 className="text-xl font-bold">Xyqo.ai</h1>
        </div>
        <nav className="space-x-4 text-sm">
          <button onClick={() => setLang('fr')} className={lang === 'fr' ? 'underline' : ''}>FR</button>
          <button onClick={() => setLang('en')} className={lang === 'en' ? 'underline' : ''}>EN</button>
        </nav>
      </header>

      <section className="text-center py-20 bg-gray-50">
        <h2 className="text-4xl font-bold mb-4">{t.slogan}</h2>
        <p className="text-lg text-gray-600">{t.subtitle}</p>
      </section>

      <section id="services" className="max-w-5xl mx-auto py-16 px-4">
        <h3 className="text-2xl font-bold mb-6 text-center">{t.services}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {t.servicesList.map((svc, i) => (
            <div key={i} className="border p-6 rounded-2xl shadow hover:shadow-md">
              <h4 className="text-xl font-semibold mb-2">{svc.title}</h4>
              <p className="text-sm text-gray-600 mb-2">{svc.desc}</p>
              <Link href={svc.link} className="text-blue-600 text-sm hover:underline">{svc.label}</Link>
            </div>
          ))}
        </div>
      </section>

      <section id="contact" className="text-center py-20 bg-gray-100">
        <h2 className="text-2xl font-bold mb-4">{t.contact}</h2>
        <p className="text-gray-600">{t.contactText}<br />
          <a href={`mailto:${t.email}`} className="text-blue-600 hover:underline">{t.email}</a>
        </p>
      </section>

      <footer className="text-center text-sm text-gray-400 py-6 border-t">
        &copy; {new Date().getFullYear()} Xyqo.ai — All rights reserved.
      </footer>
    </main>
  );
}
