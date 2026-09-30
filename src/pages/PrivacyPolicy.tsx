import SEO from '../components/SEO';
import { motion } from 'motion/react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

export default function PrivacyPolicy() {
  return (
    <div className="w-full pt-32 pb-32 bg-light-alt relative overflow-hidden text-navy stitch-grid">
      <SEO
        title="Privacy Policy"
        description="Read the privacy policy of Quest Housing. We are committed to protecting your personal information and being transparent about our data practices."
      />
      <div className="container mx-auto px-6 md:px-12 relative z-10 max-w-4xl">
        <motion.div initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}>
          <motion.div variants={fadeUp} className="mb-6 inline-flex items-center gap-4">
            <span className="text-navy text-xs uppercase tracking-[0.3em] font-bold border-stitch-b pb-2 pr-8">Legal</span>
          </motion.div>
          <motion.h1 variants={fadeUp} className="text-5xl md:text-[72px] font-display font-medium mb-16 uppercase tracking-tighter leading-[0.9] text-navy">
            Privacy <span className="text-primary italic">Policy.</span>
          </motion.h1>

          <motion.div variants={fadeUp} className="prose prose-navy max-w-none space-y-8">
            <p className="text-sm text-navy/50 font-bold uppercase tracking-widest">Last updated: September 30, 2026</p>

            <Section title="1. Introduction">
              Quest Housing ("we", "our", or "us") is committed to protecting the privacy of individuals who visit our website at questhousing.vercel.app and use our services. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our property listing and rental services.
            </Section>

            <Section title="2. Information We Collect">
              <strong>Personal Information:</strong> When you register, list a property, or submit a lead form, we may collect your name, email address, phone number, and property-related details (location, price, images, etc.).
              <br /><br />
              <strong>Usage Data:</strong> We automatically collect information about your interactions with our website, including pages visited, time spent, browser type, device information, IP address, and approximate geographic location (city/country level via Vercel headers).
              <br /><br />
              <strong>Cookies & Analytics:</strong> We use Google Analytics, PostHog, and session-based tracking to understand how users interact with our platform. These tools may store cookies on your device.
            </Section>

            <Section title="3. How We Use Your Information">
              We use the information we collect to:
              <ul className="list-disc pl-6 mt-3 space-y-2 text-navy/70">
                <li>Provide, operate, and maintain our website and services</li>
                <li>Match tenants with suitable properties</li>
                <li>Facilitate communication between property owners and seekers</li>
                <li>Send notifications about property matches, scheduled visits, and updates</li>
                <li>Analyze usage patterns to improve our platform</li>
                <li>Comply with legal obligations</li>
              </ul>
            </Section>

            <Section title="4. Information Sharing">
              We do not sell your personal information. We may share your data with:
              <ul className="list-disc pl-6 mt-3 space-y-2 text-navy/70">
                <li><strong>Property owners/seekers:</strong> To facilitate property inquiries and scheduled visits</li>
                <li><strong>Service providers:</strong> Third-party services like Supabase (database), Vercel (hosting), and analytics platforms</li>
                <li><strong>Legal requirements:</strong> When required by law or to protect our rights</li>
              </ul>
            </Section>

            <Section title="5. Data Security">
              We implement industry-standard security measures including encrypted data transmission (HTTPS), secure database storage via Supabase with Row Level Security (RLS), and access controls. However, no method of electronic transmission is 100% secure.
            </Section>

            <Section title="6. Your Rights">
              You have the right to:
              <ul className="list-disc pl-6 mt-3 space-y-2 text-navy/70">
                <li>Access the personal data we hold about you</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Opt out of marketing communications</li>
              </ul>
              To exercise any of these rights, contact us at <a href="mailto:questhousingblr@gmail.com" className="text-primary hover:underline">questhousingblr@gmail.com</a>.
            </Section>

            <Section title="7. Third-Party Services">
              Our website may contain links to third-party websites or services (WhatsApp, Instagram, Google Maps). We are not responsible for the privacy practices of these external services. We encourage you to review their privacy policies.
            </Section>

            <Section title="8. Changes to This Policy">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
            </Section>

            <Section title="9. Contact Us">
              If you have any questions about this Privacy Policy, please contact us:
              <ul className="list-none mt-3 space-y-2 text-navy/70">
                <li><strong>Email:</strong> <a href="mailto:questhousingblr@gmail.com" className="text-primary hover:underline">questhousingblr@gmail.com</a></li>
                <li><strong>WhatsApp:</strong> <a href="https://wa.me/918886131316" className="text-primary hover:underline">+91-8886131316</a></li>
              </ul>
            </Section>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border-stitch shadow-sm p-6 md:p-8">
      <h2 className="text-lg font-display font-medium text-navy mb-4 uppercase tracking-tight">{title}</h2>
      <div className="text-navy/70 leading-relaxed font-sans text-sm">{children}</div>
    </div>
  );
}
