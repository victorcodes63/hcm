'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X, Settings, Check, Shield } from 'lucide-react';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

export default function CookieConsent() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Always true as these are required
    analytics: false,
    marketing: false,
    functional: false,
  });

  useEffect(() => {
    // Check if user has already made a choice
    const cookieConsent = localStorage.getItem('cookieConsent');
    if (!cookieConsent) {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true,
    };
    savePreferences(allAccepted);
    setIsVisible(false);
  };

  const handleRejectAll = () => {
    const onlyNecessary = {
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false,
    };
    savePreferences(onlyNecessary);
    setIsVisible(false);
  };

  const handleSavePreferences = () => {
    savePreferences(preferences);
    setIsVisible(false);
  };

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem('cookieConsent', JSON.stringify(prefs));
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    
    // Here you would typically initialize your analytics, marketing tools, etc.
    // based on the user's preferences
    console.log('Cookie preferences saved:', prefs);
  };

  const handlePreferenceChange = (key: keyof CookiePreferences, value: boolean) => {
    if (key === 'necessary') return; // Can't disable necessary cookies
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Never show cookie banner on ATS/dashboard (including login)
  if (pathname?.startsWith('/dashboard')) return null;
  // Hide on interview action pages (confirm/reschedule/withdraw) opened from email links
  if (pathname?.startsWith('/interview/')) return null;
  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-neutral-200 shadow-lg"
      >
        {/* Mobile & Tablet Layout */}
        <div className="block md:hidden">
          <div className="p-4 space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary-900 rounded-full flex items-center justify-center">
                  <Cookie className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-primary-900 text-sm">Cookie Preferences</h3>
                  <p className="text-xs text-neutral-600">We use cookies to enhance your experience</p>
                </div>
              </div>
              {!showPreferences && (
                <button
                  onClick={() => setIsVisible(false)}
                  className="text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Content */}
            <div className="text-sm text-neutral-700 leading-relaxed">
              We use cookies to analyze site usage, provide personalized content, and improve your browsing experience. 
              You can customize your preferences below.
            </div>

            {/* Action Buttons */}
            {!showPreferences ? (
              <div className="flex flex-col space-y-2">
                <button
                  onClick={handleAcceptAll}
                  className="w-full bg-primary-900 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-800 transition-colors duration-300"
                >
                  Accept All Cookies
                </button>
                <div className="flex space-x-2">
                  <button
                    onClick={handleRejectAll}
                    className="flex-1 border border-neutral-300 text-neutral-700 py-3 px-4 rounded-lg font-medium hover:bg-neutral-50 transition-colors duration-300"
                  >
                    Reject All
                  </button>
                  <button
                    onClick={() => setShowPreferences(true)}
                    className="flex-1 bg-neutral-100 text-neutral-700 py-3 px-4 rounded-lg font-medium hover:bg-neutral-200 transition-colors duration-300 flex items-center justify-center"
                  >
                    <Settings className="w-4 h-4 mr-1" />
                    Customize
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Cookie Categories */}
                <div className="space-y-3">
                  {[
                    {
                      key: 'necessary' as keyof CookiePreferences,
                      title: 'Necessary Cookies',
                      description: 'Essential for website functionality and security',
                      required: true
                    },
                    {
                      key: 'analytics' as keyof CookiePreferences,
                      title: 'Analytics Cookies',
                      description: 'Help us understand how visitors interact with our website',
                      required: false
                    },
                    {
                      key: 'marketing' as keyof CookiePreferences,
                      title: 'Marketing Cookies',
                      description: 'Used to deliver relevant advertisements and track campaign performance',
                      required: false
                    },
                    {
                      key: 'functional' as keyof CookiePreferences,
                      title: 'Functional Cookies',
                      description: 'Enable enhanced functionality and personalization',
                      required: false
                    }
                  ].map((category) => (
                    <div key={category.key} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-sm text-primary-900">{category.title}</h4>
                          {category.required && (
                            <Shield className="w-3 h-3 text-secondary-500" />
                          )}
                        </div>
                        <p className="text-xs text-neutral-600 mt-1">{category.description}</p>
                      </div>
                      <div className="ml-3">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={preferences[category.key]}
                            onChange={(e) => handlePreferenceChange(category.key, e.target.checked)}
                            disabled={category.required}
                            className="sr-only peer"
                          />
                          <div className={`w-11 h-6 rounded-full peer ${
                            preferences[category.key] 
                              ? 'bg-primary-900' 
                              : 'bg-neutral-300'
                          } peer-disabled:bg-neutral-200 peer-disabled:cursor-not-allowed transition-colors duration-200`}>
                            <div className={`absolute top-0.5 left-0.5 bg-white rounded-full h-5 w-5 transition-transform duration-200 ${
                              preferences[category.key] ? 'translate-x-5' : 'translate-x-0'
                            }`} />
                          </div>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Save Button */}
                <button
                  onClick={handleSavePreferences}
                  className="w-full bg-primary-900 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-800 transition-colors duration-300 flex items-center justify-center"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Save Preferences
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:block">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                <div className="w-10 h-10 bg-primary-900 rounded-full flex items-center justify-center">
                  <Cookie className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-primary-900 mb-1">We use cookies to enhance your experience</h3>
                  <p className="text-sm text-neutral-600">
                    We use cookies to analyze site usage, provide personalized content, and improve your browsing experience. 
                    <button
                      onClick={() => setShowPreferences(true)}
                      className="text-primary-900 hover:text-primary-800 underline ml-1"
                    >
                      Customize your preferences
                    </button>
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 ml-6">
                <button
                  onClick={handleRejectAll}
                  className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg font-medium hover:bg-neutral-50 transition-colors duration-300"
                >
                  Reject All
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="px-6 py-2 bg-primary-900 text-white rounded-lg font-medium hover:bg-primary-800 transition-colors duration-300"
                >
                  Accept All
                </button>
                <button
                  onClick={() => setIsVisible(false)}
                  className="text-neutral-400 hover:text-neutral-600 transition-colors p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Preferences Modal for Desktop */}
        {showPreferences && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-900 rounded-full flex items-center justify-center">
                      <Settings className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-primary-900">Cookie Preferences</h2>
                      <p className="text-sm text-neutral-600">Manage your cookie settings</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPreferences(false)}
                    className="text-neutral-400 hover:text-neutral-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4 mb-6">
                  {[
                    {
                      key: 'necessary' as keyof CookiePreferences,
                      title: 'Necessary Cookies',
                      description: 'Essential for website functionality and security. These cannot be disabled.',
                      required: true
                    },
                    {
                      key: 'analytics' as keyof CookiePreferences,
                      title: 'Analytics Cookies',
                      description: 'Help us understand how visitors interact with our website by collecting anonymous information.',
                      required: false
                    },
                    {
                      key: 'marketing' as keyof CookiePreferences,
                      title: 'Marketing Cookies',
                      description: 'Used to deliver relevant advertisements and track campaign performance across different websites.',
                      required: false
                    },
                    {
                      key: 'functional' as keyof CookiePreferences,
                      title: 'Functional Cookies',
                      description: 'Enable enhanced functionality and personalization, such as remembering your preferences.',
                      required: false
                    }
                  ].map((category) => (
                    <div key={category.key} className="flex items-start justify-between p-4 bg-neutral-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-semibold text-primary-900">{category.title}</h4>
                          {category.required && (
                            <Shield className="w-4 h-4 text-secondary-500" />
                          )}
                        </div>
                        <p className="text-sm text-neutral-600">{category.description}</p>
                      </div>
                      <div className="ml-4">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={preferences[category.key]}
                            onChange={(e) => handlePreferenceChange(category.key, e.target.checked)}
                            disabled={category.required}
                            className="sr-only peer"
                          />
                          <div className={`w-11 h-6 rounded-full peer ${
                            preferences[category.key] 
                              ? 'bg-primary-900' 
                              : 'bg-neutral-300'
                          } peer-disabled:bg-neutral-200 peer-disabled:cursor-not-allowed transition-colors duration-200`}>
                            <div className={`absolute top-0.5 left-0.5 bg-white rounded-full h-5 w-5 transition-transform duration-200 ${
                              preferences[category.key] ? 'translate-x-5' : 'translate-x-0'
                            }`} />
                          </div>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowPreferences(false)}
                    className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg font-medium hover:bg-neutral-50 transition-colors duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSavePreferences}
                    className="px-6 py-2 bg-primary-900 text-white rounded-lg font-medium hover:bg-primary-800 transition-colors duration-300 flex items-center"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Save Preferences
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
