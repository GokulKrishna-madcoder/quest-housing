import SEO from '../components/SEO';
import { motion } from 'motion/react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

export default function TermsOfService() {
  return (
    <div className="w-full pt-32 pb-32 bg-light-alt relative overflow-hidden text-navy stitch-grid">
      <SEO
        title="Terms of Service"
        description="Read the terms of service for using the Quest Housing platform, services, and website."
      />
      <div className="container mx-auto px-6 md:px-12 relative z-10 max-w-4xl">
        <motion.div initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}>
          <motion.div variants={fadeUp} className="mb-6 inline-flex items-center gap-4">
            <span className="text-navy text-xs uppercase tracking-[0.3em] font-bold border-stitch-b pb-2 pr-8">Legal</span>
          </motion.div>
          <motion.h1 variants={fadeUp} className="text-5xl md:text-[72px] font-display font-medium mb-16 uppercase tracking-tighter leading-[0.9] text-navy">
            Terms of <span className="text-primary italic">Service.</span>
          </motion.h1>

          <motion.div variants={fadeUp} className="prose prose-navy max-w-none space-y-8">
            <p className="text-sm text-navy/50 font-bold uppercase tracking-widest">Last updated: September 30, 2026</p>

            <Section title="1. Acceptance of Terms">
              By accessing or using the Quest Housing website (questhousing.vercel.app) and our services, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you may not access or use our services.
            </Section>

            <Section title="2. Description of Services">
              Quest Housing provides an online platform that connects property owners with potential tenants and buyers in Bengaluru. Our services include:
              <ul className="list-disc pl-6 mt-3 space-y-2 text-navy/70">
                <li>Property listing and discovery</li>
                <li>Tenant-owner matching via AI-powered recommendations</li>
                <li>Scheduled property visit management</li>
                <li>Communication facilitation between parties</li>
              </ul>
            </Section>

            <Section title="3. User Accounts & Registration">
              When registering a property or submitting a lead, you agree to provide accurate, current, and complete information. You are responsible for maintaining the confidentiality of your account information. You must not impersonate any person or misrepresent your affiliation with any entity.
            </Section>

            <Section title="4. Property Listings">
              <strong>For Owners:</strong> By listing a property on Quest Housing, you represent that you have the legal right to list the property, and that all information provided (including images, pricing, and descriptions) is accurate and truthful.
              <br /><br />
              <strong>For Seekers:</strong> Property information displayed on our platform is provided by property owners. While we strive to verify listings, Quest Housing does not guarantee the accuracy of any listing information and is not liable for discrepancies.
            </Section>

            <Section title="5. Prohibited Conduct">
              You agree not to:
              <ul className="list-disc pl-6 mt-3 space-y-2 text-navy/70">
                <li>Post false, misleading, or fraudulent property listings</li>
                <li>Harass, abuse, or threaten other users</li>
                <li>Use the platform for any unlawful purpose</li>
                <li>Scrape, crawl, or extract data from the website without permission</li>
                <li>Interfere with or disrupt the platform's functionality</li>
                <li>Upload malicious content, viruses, or harmful code</li>
              </ul>
            </Section>

            <Section title="6. Intellectual Property">
              All content on the Quest Housing platform — including text, graphics, logos, images, and software — is the property of Quest Housing or its licensors and is protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works without our prior written consent.
            </Section>

            <Section title="7. Limitation of Liability">
              Quest Housing acts as a platform connecting property owners and seekers. We are not a party to any rental agreement, sale, or transaction between users. To the maximum extent permitted by law:
              <ul className="list-disc pl-6 mt-3 space-y-2 text-navy/70">
                <li>We are not liable for any disputes between owners and tenants/buyers</li>
                <li>We do not guarantee the condition, legality, or suitability of any listed property</li>
                <li>We are not responsible for any loss or damage arising from your use of the platform</li>
              </ul>
            </Section>

            <Section title="8. Indemnification">
              You agree to indemnify and hold harmless Quest Housing, its officers, directors, and employees from any claims, losses, or damages arising from your use of the platform, violation of these terms, or infringement of any third-party rights.
            </Section>

            <Section title="9. Termination">
              We reserve the right to suspend or terminate your access to our services at any time, without prior notice, for conduct that we believe violates these Terms of Service or is harmful to other users or the platform.
            </Section>

            <Section title="10. Governing Law">
              These Terms of Service shall be governed by and construed in accordance with the laws of India. Any disputes arising out of these terms shall be subject to the exclusive jurisdiction of the courts in Bengaluru, Karnataka.
            </Section>

            <Section title="11. Changes to Terms">
              We reserve the right to modify these Terms of Service at any time. Changes will be effective immediately upon posting. Your continued use of the platform after changes constitutes your acceptance of the updated terms.
            </Section>

            <Section title="12. Contact Us">
              If you have any questions about these Terms of Service, please contact us:
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
