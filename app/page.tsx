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
    email: "contact@xyqo.ai"
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
    email: "contact@xyqo.ai"
  }
};

export default function Home() {
  const [lang, setLang] = useState<'fr' | 'en'>('fr');
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const t = content[lang];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Create mailto link with form data
    const subject = encodeURIComponent(`Contact from ${formData.name} - Xyqo.ai`);
    const body = encodeURIComponent(`Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`);
    const mailtoLink = `mailto:contact@xyqo.ai?subject=${subject}&body=${body}`;
    
    window.location.href = mailtoLink;
    
    // Reset form
    setFormData({ name: '', email: '', message: '' });
    setIsSubmitting(false);
  };

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

      <section id="contact" className="py-20 bg-gray-100">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-center">{t.contact}</h2>
          <div className="bg-white rounded-lg shadow-md p-8">
            <p className="text-gray-600 text-center mb-6">
              {t.contactText}
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  {lang === 'fr' ? 'Nom' : 'Name'}
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  id="message"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isSubmitting 
                  ? (lang === 'fr' ? 'Envoi...' : 'Sending...') 
                  : (lang === 'fr' ? 'Envoyer' : 'Send')
                }
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                {lang === 'fr' ? 'Ou contactez-nous directement :' : 'Or contact us directly:'}
              </p>
              <a href={`mailto:${t.email}`} className="text-blue-600 hover:underline font-medium">
                {t.email}
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="text-center text-sm text-gray-400 py-6 border-t">
        &copy; {new Date().getFullYear()} Xyqo.ai — All rights reserved.
      </footer>
    </main>
  );
}
