/**
 * FAQSection — Landing page FAQ accordion
 * Premium: animated chevron, hover card lift, gradient heading
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronDown } from 'react-icons/fa';
import Badge from '@/components/common/Badge';

const faqs = [
  {
    q: 'What information is visible when someone scans my QR code?',
    a: 'Only life-saving fields: your name, blood group, emergency contacts, allergies, and current medications. Your address, email, documents, and medical notes are never exposed.',
  },
  {
    q: 'Do first responders need to install an app?',
    a: 'No. Scanning the QR code opens a mobile-friendly web page in any browser — no app download required.',
  },
  {
    q: 'Is my data encrypted?',
    a: 'Yes. Passwords are hashed with bcrypt, API traffic uses HTTPS, JWT tokens secure sessions, and documents are stored with secure URLs.',
  },
  {
    q: 'Can I regenerate my QR code if it is compromised?',
    a: 'Absolutely. From your dashboard, regenerate your QR code at any time. Old links become invalid immediately.',
  },
  {
    q: 'Is LifeVault free to use?',
    a: 'LifeVault is free for individuals. Create your vault, add emergency info, and generate your QR code at no cost.',
  },
];

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section
      id="faq"
      className="py-24 bg-slate-50 dark:bg-slate-900 border-t border-slate-200/50 dark:border-slate-800/50 transition-colors duration-200"
      aria-labelledby="faq-heading"
    >
      <div className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="text-center mb-14">
          <Badge variant="primary" className="mb-4">FAQ</Badge>
          <h2
            id="faq-heading"
            className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight"
          >
            Frequently Asked{' '}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
              Questions
            </span>
          </h2>
          <p className="text-base text-slate-500 dark:text-slate-400 mt-5 max-w-xl mx-auto">
            Everything you need to know about LifeVault and emergency access.
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            const panelId = `faq-panel-${index}`;
            const buttonId = `faq-btn-${index}`;

            return (
              <div
                key={faq.q}
                className={`rounded-2xl border overflow-hidden transition-all duration-200 ${
                  isOpen
                    ? 'border-blue-200 dark:border-blue-800/60 bg-white dark:bg-slate-800/80 shadow-[0_4px_12px_rgba(37,99,235,0.08)]'
                    : 'border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <h3>
                  <button
                    id={buttonId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenIndex(isOpen ? -1 : index)}
                    className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left cursor-pointer"
                  >
                    <span className={`text-sm font-semibold leading-snug transition-colors ${
                      isOpen ? 'text-blue-600 dark:text-blue-400' : 'text-slate-800 dark:text-slate-100'
                    }`}>
                      {faq.q}
                    </span>
                    <motion.span
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="shrink-0"
                    >
                      <FaChevronDown
                        className={`h-3.5 w-3.5 transition-colors ${
                          isOpen ? 'text-blue-500' : 'text-slate-400'
                        }`}
                        aria-hidden="true"
                      />
                    </motion.span>
                  </button>
                </h3>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={panelId}
                      role="region"
                      aria-labelledby={buttonId}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 pt-1 border-t border-blue-100/60 dark:border-blue-900/30">
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                          {faq.a}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
