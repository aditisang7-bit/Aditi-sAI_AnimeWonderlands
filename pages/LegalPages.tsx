import React from 'react';
import { Shield, FileText, Mail, Users, MapPin } from 'lucide-react';

const LegalLayout: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
  <div className="max-w-4xl mx-auto py-12 px-4 animate-fade-in">
    <div className="mb-8 flex items-center gap-3 border-b border-slate-800 pb-6">
      <div className="p-3 bg-purple-900/30 rounded-xl text-purple-400">
        {icon}
      </div>
      <h1 className="text-3xl font-bold text-white">{title}</h1>
    </div>
    <div className="prose prose-invert prose-slate max-w-none">
      {children}
    </div>
  </div>
);

export const PrivacyPage: React.FC = () => (
  <LegalLayout title="Privacy Policy" icon={<Shield size={32} />}>
    <p>Last updated: {new Date().toLocaleDateString()}</p>
    
    <h3>1. Introduction</h3>
    <p>Welcome to Aditi's AI. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.</p>

    <h3>2. Data We Collect</h3>
    <p>We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:</p>
    <ul>
      <li><strong>Identity Data:</strong> includes first name, last name, username or similar identifier.</li>
      <li><strong>Contact Data:</strong> includes email address.</li>
      <li><strong>Technical Data:</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform.</li>
    </ul>

    <h3>3. Google AdSense & DoubleClick DART Cookie</h3>
    <p>Google is one of a third-party vendor on our site. It also uses cookies, known as DART cookies, to serve ads to our site visitors based upon their visit to our site and other sites on the internet. However, visitors may choose to decline the use of DART cookies by visiting the Google ad and content network Privacy Policy at the following URL – <a href="https://policies.google.com/technologies/ads" className="text-purple-400">https://policies.google.com/technologies/ads</a></p>

    <h3>4. Cookies</h3>
    <p>We use cookies to distinguish you from other users of our website. This helps us to provide you with a good experience when you browse our website and also allows us to improve our site.</p>
  </LegalLayout>
);

export const TermsPage: React.FC = () => (
  <LegalLayout title="Terms of Service" icon={<FileText size={32} />}>
    <h3>1. Agreement to Terms</h3>
    <p>By accessing or using Aditi's AI, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, then you may not access the service.</p>

    <h3>2. Use License</h3>
    <p>Permission is granted to temporarily download one copy of the materials (information or software) on Aditi's AI's website for personal, non-commercial transitory viewing only.</p>

    <h3>3. AI Generated Content</h3>
    <p>You own the rights to the content you generate using our tools, subject to the terms of the underlying AI models (Google Gemini). You agree not to generate content that is illegal, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, or invasive of another's privacy.</p>

    <h3>4. Limitations</h3>
    <p>In no event shall Aditi's AI or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Aditi's AI's website.</p>
  </LegalLayout>
);

export const AboutPage: React.FC = () => (
  <LegalLayout title="About Us" icon={<Users size={32} />}>
    <p className="lead text-lg text-slate-300">Aditi's AI is a next-generation creative platform designed to democratize access to advanced Artificial Intelligence tools.</p>
    
    <h3>Our Mission</h3>
    <p>We believe that everyone has a story to tell. Whether you are a gamer, a digital artist, or a business owner, our suite of tools—from Anime Ludo to our Pro Image Studio—is built to help you express yourself without technical barriers.</p>

    <h3>Technology</h3>
    <p>Powered by the latest models from Google Gemini and Veo, we provide enterprise-grade generation capabilities directly in your browser. Our platform ensures speed, quality, and security for all your creative endeavors.</p>
  </LegalLayout>
);

export const ContactPage: React.FC = () => (
  <LegalLayout title="Contact Us" icon={<Mail size={32} />}>
    <div className="grid md:grid-cols-2 gap-8 mt-8">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <h3 className="text-xl font-bold text-white mb-4">Get in Touch</h3>
        <p className="text-slate-400 mb-6">Have questions about our AI tools, pricing, or enterprise solutions? Our team is here to help.</p>
        
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-slate-300">
            <Mail className="text-purple-400" />
            <span>support@aditisai.com</span>
          </div>
          <div className="flex items-center gap-3 text-slate-300">
            <MapPin className="text-purple-400" />
            <span>Bangalore, India</span>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <form className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Name</label>
            <input type="text" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:border-purple-500 outline-none" placeholder="Your Name" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Email</label>
            <input type="email" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:border-purple-500 outline-none" placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Message</label>
            <textarea className="w-full h-32 bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:border-purple-500 outline-none resize-none" placeholder="How can we help?"></textarea>
          </div>
          <button type="button" className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg transition-colors">Send Message</button>
        </form>
      </div>
    </div>
  </LegalLayout>
);