/**
 * pages/LandingPage.jsx — Marketing SaaS Landing Page
 *
 * Implements:
 * - Top Navbar and bottom Footer components integration
 * - Animated sections using Framer Motion
 * - Hero banner layout with a styled CSS SVG phone/card mock
 * - Features grid layout with clean vector icon highlights
 * - Step-by-step onboarding visualizer
 * - Interactive QR scan simulator showcasing the paramedic read-only view
 * - Security certifications and trust badges block
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaShieldAlt,
  FaQrcode,
  FaHeartbeat,
  FaFileMedical,
  FaUserShield,
  FaMobileAlt,
  FaPlay,
  FaCheck,
  FaChevronRight,
  FaInfoCircle,
} from 'react-icons/fa';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import StatsBar from '@/components/landing/StatsBar';
import FAQSection from '@/components/landing/FAQSection';
import ScrollToTop from '@/components/common/ScrollToTop';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import HealthcareImage from '@/components/common/HealthcareImage';
import { ROUTES } from '@/utils/constants';
import { HEALTHCARE_IMAGES } from '@/utils/imageAssets';

const LandingPage = () => {
  const [simulatedScan, setSimulatedScan] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  const steps = [
    {
      num: '01',
      title: 'Create Your Vault',
      desc: 'Sign up for a free account. Your account is secured using industry-standard password hashing and token protocols.',
    },
    {
      num: '02',
      title: 'Add Emergency Profile',
      desc: 'Fill out crucial details like blood type, critical allergies, chronic conditions, and contact details for next of kin.',
    },
    {
      num: '03',
      title: 'Generate & Use QR Code',
      desc: 'Print your unique QR Code onto wallet cards, stickers, or set it as your lock screen. Responders scan to access only safe info.',
    },
  ];

  const features = [
    {
      icon: FaHeartbeat,
      title: 'Critical Medical Info',
      desc: 'Store blood type, allergies, medical history, and medications. Responders see it instantly in an emergency.',
    },
    {
      icon: FaFileMedical,
      title: 'Document Vault',
      desc: 'Upload health insurance cards, living wills, IDs, and reports. Encrypted in transit and at rest.',
    },
    {
      icon: FaQrcode,
      title: 'Emergency QR System',
      desc: 'A scan-friendly code linked to your emergency card. Responders get access instantly without needing your password.',
    },
    {
      icon: FaUserShield,
      title: 'Privacy Safeguards',
      desc: 'Responders only see safe, non-sensitive emergency fields. Financial records and general documents remain locked.',
    },
    {
      icon: FaShieldAlt,
      title: 'Military-Grade Security',
      desc: 'Armed with AES-256 data envelope configurations, rate limits, and audit logs tracking every QR scan.',
    },
    {
      icon: FaMobileAlt,
      title: 'Fully Mobile Optimized',
      desc: 'Works on any smartphone browser. No app install required for first responders to scan and read.',
    },
  ];

  return (
    <div className="bg-slate-50 dark:bg-slate-900 transition-colors duration-200 min-h-screen flex flex-col">
      <Navbar />

      <main id="main-content">
      {/* ── HERO BANNER SECTION ────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 overflow-hidden" aria-labelledby="hero-heading">
        {/* Background blobs */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[500px] h-[500px] rounded-full bg-blue-400/10 dark:bg-blue-600/5 blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[400px] h-[400px] rounded-full bg-indigo-400/10 dark:bg-indigo-600/5 blur-3xl -z-10" />

        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center text-left">
            {/* Left intro copy */}
            <div className="lg:col-span-7 flex flex-col items-start space-y-7">
              <Badge variant="primary" className="py-1 px-3">
                🛡️ Zero-Knowledge Security Standards
              </Badge>

              <h1 id="hero-heading" className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-white leading-[1.1] tracking-tight">
                Your life. One secure vault.{' '}
                <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
                  Ready in every emergency.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                LifeVault is a secure medical information management platform. Safely store critical profiles, document credentials, and next-of-kin contacts. In an emergency, first responders scan your QR Code to view life-saving details instantly — while private files remain locked.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 pt-2 w-full sm:w-auto">
                <Link to={ROUTES.REGISTER} className="w-full sm:w-auto">
                  <Button variant="primary" size="lg" fullWidth icon={FaChevronRight} iconPosition="right">
                    Create Your Free Vault
                  </Button>
                </Link>
                <a href="#demo" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" fullWidth icon={FaPlay}>
                    Simulate Scan Demo
                  </Button>
                </a>
              </div>

              <div className="flex items-center gap-6 pt-4 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <FaCheck className="text-emerald-500" /> Free for Individuals
                </span>
                <span className="flex items-center gap-1.5">
                  <FaCheck className="text-emerald-500" /> HIPAA Ready Design
                </span>
                <span className="flex items-center gap-1.5">
                  <FaCheck className="text-emerald-500" /> Rate Limited Audit Logs
                </span>
              </div>
            </div>

            {/* Right — healthcare hero visual */}
            <div className="lg:col-span-5 flex justify-center order-first lg:order-last">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
                className="w-full max-w-lg"
              >
                <HealthcareImage
                  src={HEALTHCARE_IMAGES.hero}
                  alt="Healthcare professional using secure digital health technology"
                  className="w-full h-[320px] sm:h-[420px] lg:h-[550px]"
                  placeholderLabel="Add hero-healthcare.jpg to public/images/"
                />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <StatsBar />

      {/* ── FEATURES GRID SECTION ──────────────────────────────────────────────── */}
      <section id="features" className="py-24 bg-white dark:bg-slate-950 border-y border-slate-200/40 dark:border-slate-800 transition-colors duration-200" aria-labelledby="features-heading">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="primary" className="mb-4">
              Comprehensive Vault Suite
            </Badge>
            <h2 id="features-heading" className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Built for Security. Designed for Emergencies.
            </h2>
            <p className="text-base text-slate-500 dark:text-slate-400 mt-5 leading-relaxed">
              Every detail is engineered with zero-compromise encryption guidelines to ensure you control your files while ensuring rescuers get rapid access.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <Card
                key={feature.title}
                isHoverable
                className="p-7 border border-slate-100 dark:border-slate-800 flex flex-col text-left space-y-5"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <feature.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2.5 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── STEP Timeline SECTION ──────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24" aria-labelledby="steps-heading">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="primary" className="mb-4">
              Simple Integration Setup
            </Badge>
            <h2 id="steps-heading" className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Secure in Three Simple Steps
            </h2>
            <p className="text-base text-slate-500 dark:text-slate-400 mt-5">
              Setting up your LifeVault emergency profile is fast and straightforward.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 relative">
            {/* Timeline connector lines */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-blue-100 dark:bg-blue-950/40 hidden lg:block -translate-y-12 -z-10" />

            {steps.map((step, idx) => (
              <div key={step.num} className="flex flex-col items-center text-center lg:items-start lg:text-left space-y-5">
                <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 shadow-md flex items-center justify-center font-extrabold text-xl text-blue-600 border border-slate-100 dark:border-slate-700">
                  {step.num}
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  {step.title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INTERACTIVE QR SIMULATOR SECTION ───────────────────────────────────── */}
      <section id="demo" className="py-24 bg-slate-900 text-white transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left description */}
            <div className="lg:col-span-6 text-left space-y-6">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                Interactive Scanner Demo
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight font-heading leading-snug">
                Simulate a Life-Saving QR Scan Right Now
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                Want to see what happens when a first responder scans your QR badge? Click the simulation switch to preview the read-only emergency portal page. Feel the immediate security controls, tracking notices, and clean information layout.
              </p>
              <div className="pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => setSimulatedScan(!simulatedScan)}
                  className="bg-blue-600 hover:bg-blue-500"
                  aria-pressed={simulatedScan}
                >
                  {simulatedScan ? 'Reset Simulator' : 'Simulate Scan Experience'}
                </Button>
              </div>
            </div>

            {/* Right Simulator Screen Panel */}
            <div className="lg:col-span-6 flex justify-center">
              <Card className="w-full max-w-md bg-slate-950 border border-slate-800 text-left p-6 shadow-2xl relative overflow-hidden min-h-[380px] flex flex-col justify-center">
                <AnimatePresence mode="wait">
                  {!simulatedScan ? (
                    // Initial State: QR Scanner scanner graphic
                    <motion.div
                      key="no-scan"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="text-center py-6 space-y-4 flex flex-col items-center"
                    >
                      <div className="w-28 h-28 bg-slate-900 border-2 border-dashed border-blue-500 rounded-2xl flex items-center justify-center p-3 text-blue-500 relative">
                        <FaQrcode className="w-full h-full" />
                        {/* Scanning scanner line indicator */}
                        <div className="absolute inset-x-2 h-1 bg-blue-400 shadow-lg top-0 animate-bounce" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                          Waiting for Scan Trigger
                        </h4>
                        <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                          Click "Simulate Scan Experience" on the left to see the instant Responder portal dashboard.
                        </p>
                      </div>
                    </motion.div>
                  ) : (
                    // Scan Triggered: Read-only Dashboard
                    <motion.div
                      key="scanned"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      className="space-y-4 text-slate-200"
                    >
                      {/* Emergency Alert Label */}
                      <div className="bg-red-600 text-white py-2.5 px-3 rounded-lg flex items-center gap-2 text-xs font-extrabold uppercase shrink-0">
                        <span className="animate-ping">🚨</span>
                        <span>EMERGENCY ACCESS PORTAL ACTIVATED</span>
                      </div>

                      {/* Paramedic view content */}
                      <div className="space-y-3.5 bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-900/50 border border-blue-700/50 flex items-center justify-center text-blue-400 font-extrabold text-sm">
                            JD
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white">John Doe</h4>
                            <p className="text-[10px] text-red-400 font-semibold">Blood Group: O+</p>
                          </div>
                        </div>

                        {/* Medical vitals grids — matches public emergency API fields only */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-slate-950 p-2 rounded border border-slate-800">
                            <span className="text-[9px] text-slate-500 font-bold block uppercase">Allergies</span>
                            <span className="font-bold text-slate-300">Penicillin, Peanuts</span>
                          </div>
                          <div className="bg-slate-950 p-2 rounded border border-slate-800">
                            <span className="text-[9px] text-slate-500 font-bold block uppercase">Medications</span>
                            <span className="font-semibold text-slate-300 block mt-0.5 leading-snug">Albuterol inhaler</span>
                          </div>
                        </div>

                        <div className="bg-slate-950/80 p-2 rounded border border-dashed border-slate-700 text-[9px] text-slate-500">
                          <FaInfoCircle className="inline h-3 w-3 mr-1" aria-hidden="true" />
                          Hidden: address, email, documents, medical notes
                        </div>

                        {/* Emergency Contact List */}
                        <div className="space-y-1.5 pt-1.5 border-t border-slate-800">
                          <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                            Emergency Family Contacts
                          </h5>
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-medium text-slate-400">Jane Doe (Spouse)</span>
                            <a href="tel:5550199" className="text-blue-400 font-bold hover:underline">
                              555-0199
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* Security scan note */}
                      <p className="text-[10px] text-slate-500 text-center leading-relaxed">
                        This view represents the strict emergency profile return parameters. Users general files, account history, settings, and other folders are not loaded on QR scans.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECURITY TRUST BANNER ──────────────────────────────────────────────── */}
      <section id="security" className="py-24 bg-slate-50 dark:bg-slate-900 border-t border-slate-200/50 dark:border-slate-800/50 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center text-left">
            <div>
              <Badge variant="primary" className="mb-3">
                Zero-Trust Encryption
              </Badge>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight font-heading">
                Military-Grade Privacy Shielding
              </h2>
              <p className="text-base text-slate-500 dark:text-slate-400 mt-5 leading-relaxed">
                Your medical files and personal details are valuable. That's why LifeVault protects your databases with advanced envelope structures. General identification codes, billing sheets, and driver licenses are not queryable from standard public nodes.
              </p>
              <div className="mt-6 space-y-3 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-emerald-100 dark:bg-emerald-950/45 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                    <FaCheck className="w-2.5 h-2.5" />
                  </div>
                  <span>Secure SSL connections and HTTP-only cookie JWT security.</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-emerald-100 dark:bg-emerald-950/45 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                    <FaCheck className="w-2.5 h-2.5" />
                  </div>
                  <span>Rate limiting and secure tracking logs alert users to every scan.</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-emerald-100 dark:bg-emerald-950/45 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                    <FaCheck className="w-2.5 h-2.5" />
                  </div>
                  <span>Zero trackers or marketing beacons embedded. Your health data is yours.</span>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <Card className="p-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 max-w-sm w-full shadow-xl flex flex-col space-y-6">
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider text-center">
                  Trust Certifications
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 text-center flex flex-col items-center">
                    <span className="text-xl">🔒</span>
                    <span className="text-[10px] font-bold text-slate-400 mt-2 block uppercase">ENCRYPTION</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">AES-256</span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 text-center flex flex-col items-center">
                    <span className="text-xl">🧑‍⚕️</span>
                    <span className="text-[10px] font-bold text-slate-400 mt-2 block uppercase">COMPLIANCE</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">HIPAA Ready</span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 text-center flex flex-col items-center">
                    <span className="text-xl">✅</span>
                    <span className="text-[10px] font-bold text-slate-400 mt-2 block uppercase">PRIVACY</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">GDPR Compliant</span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 text-center flex flex-col items-center">
                    <span className="text-xl">🛡️</span>
                    <span className="text-[10px] font-bold text-slate-400 mt-2 block uppercase">AUDITED</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">ISO 27001</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <FAQSection />

      {/* ── CTA SECTION ────────────────────────────────────────────────────────── */}
      <section className="relative py-20 md:py-28 text-white overflow-hidden">
        {/* Layered background — avoids flat solid slab */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800" aria-hidden="true" />
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full bg-white/8 blur-3xl" aria-hidden="true" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full bg-indigo-400/15 blur-3xl" aria-hidden="true" />
        <div
          className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] bg-[size:28px_28px]"
          aria-hidden="true"
        />

        <div className="relative max-w-4xl mx-auto text-center px-6 sm:px-8 lg:px-12 space-y-6">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-xs font-bold uppercase tracking-wider text-blue-100">
            Free for individuals
          </span>

          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
            Protect Yourself and Your Family Today
          </h2>

          <p className="text-base text-blue-100/90 max-w-xl mx-auto leading-relaxed">
            Set up your secure vault in under two minutes. It&apos;s free forever and could save your life in an emergency.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to={ROUTES.REGISTER}>
              <Button
                variant="secondary"
                size="lg"
                className="!bg-white !text-blue-700 hover:!bg-blue-50 !font-extrabold px-8 py-3.5 !shadow-[0_8px_32px_rgba(0,0,0,0.2)] hover:!shadow-[0_12px_40px_rgba(0,0,0,0.25)] !border-0"
              >
                Create Your Free Vault
              </Button>
            </Link>
            <Link to={ROUTES.LOGIN}>
              <span className="text-sm font-semibold text-blue-100 hover:text-white transition-colors underline-offset-2 hover:underline cursor-pointer">
                Already have an account? Sign in
              </span>
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-4 text-xs text-blue-200/80 font-medium">
            <span className="flex items-center gap-1.5">
              <FaCheck className="text-emerald-300 h-3 w-3" aria-hidden="true" />
              No credit card
            </span>
            <span className="flex items-center gap-1.5">
              <FaCheck className="text-emerald-300 h-3 w-3" aria-hidden="true" />
              2-minute setup
            </span>
            <span className="flex items-center gap-1.5">
              <FaCheck className="text-emerald-300 h-3 w-3" aria-hidden="true" />
              HIPAA-ready design
            </span>
          </div>
        </div>

        {/* Wave divider — smooth handoff to footer */}
        <div className="absolute bottom-0 left-0 right-0 leading-[0]" aria-hidden="true">
          <svg
            viewBox="0 0 1440 56"
            preserveAspectRatio="none"
            className="w-full h-10 md:h-14 fill-white dark:fill-slate-950"
          >
            <path d="M0,32 C360,56 720,8 1080,32 C1260,44 1380,48 1440,40 L1440,56 L0,56 Z" />
          </svg>
        </div>
      </section>

      </main>

      <ScrollToTop />
      <Footer />
    </div>
  );
};

export default LandingPage;
