'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Briefcase, Handshake, EyeOff, Banknote } from 'lucide-react';

interface ClientOption {
  id: string;
  name: string;
  isAnonymous: boolean;
}

const JOB_TYPES = ['Full Time', 'Part Time', 'Contract', 'Remote'] as const;
const CATEGORIES = [
  'Executive',
  'Sales & Marketing',
  'Education & Training',
  'Technology',
  'Operations',
  'Finance & Accounting',
];

function parseLines(text: string): string[] {
  return text.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
}

export default function PostJobPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [clientId, setClientId] = useState<string>('');

  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('Eagle HR Consultants');
  const [location, setLocation] = useState('Nairobi');
  const [type, setType] = useState<string>('Full Time');
  const [categorySelect, setCategorySelect] = useState<string>(''); // '' | '__other__' | one of categorySuggestions
  const [categoryCustom, setCategoryCustom] = useState<string>('');
  const [categorySuggestions, setCategorySuggestions] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [requirementsText, setRequirementsText] = useState('');
  const [responsibilitiesText, setResponsibilitiesText] = useState('');
  const [benefitsText, setBenefitsText] = useState('');
  const [concealCompany, setConcealCompany] = useState(false);
  const [applicationDeadline, setApplicationDeadline] = useState(''); // YYYY-MM-DD for expiry
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [salaryCurrency, setSalaryCurrency] = useState('KES');
  const [salaryPublic, setSalaryPublic] = useState(false);
  const [minYearsExperience, setMinYearsExperience] = useState('');
  const [educationLevel, setEducationLevel] = useState('');
  const [educationQualification, setEducationQualification] = useState('');
  const [requiredCertifications, setRequiredCertifications] = useState('');

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch('/api/clients').then((r) => r.json()),
      fetch('/api/jobs/categories').then((r) => r.json()),
    ]).then(([clientsData, categoriesData]) => {
      if (!cancelled && Array.isArray(clientsData)) setClients(clientsData);
      if (!cancelled && Array.isArray(categoriesData)) {
        const merged = [...new Set([...CATEGORIES, ...categoriesData])].sort((a, b) => a.localeCompare(b));
        setCategorySuggestions(merged);
      } else if (!cancelled) {
        setCategorySuggestions([...CATEGORIES]);
      }
    }).catch(() => {
      if (!cancelled) setCategorySuggestions([...CATEGORIES]);
    });
    return () => { cancelled = true; };
  }, []);

  const selectedClient = clientId ? clients.find((c) => c.id === clientId) : null;
  const companyDisplay = selectedClient
    ? selectedClient.isAnonymous
      ? 'Confidential'
      : selectedClient.name
    : company;
  const companyLocked = !!selectedClient;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    if (!title.trim()) {
      setError('Job title is required.');
      setSubmitting(false);
      return;
    }
    if (!description.trim()) {
      setError('Job description is required.');
      setSubmitting(false);
      return;
    }
    const requirements = parseLines(requirementsText);
    const responsibilities = parseLines(responsibilitiesText);
    const benefits = parseLines(benefitsText);
    if (requirements.length === 0) {
      setError('Add at least one requirement (one per line).');
      setSubmitting(false);
      return;
    }
    if (responsibilities.length === 0) {
      setError('Add at least one key responsibility (one per line).');
      setSubmitting(false);
      return;
    }
    const effectiveCompany = clientId && selectedClient
      ? (selectedClient.isAnonymous ? 'Confidential' : selectedClient.name)
      : company.trim();
    if (!effectiveCompany) {
      setError('Company is required (or select a client).');
      setSubmitting(false);
      return;
    }
    if (!location.trim()) {
      setError('Location is required.');
      setSubmitting(false);
      return;
    }
    const effectiveCategory = categorySelect === '__other__' ? categoryCustom.trim() : categorySelect;
    if (!effectiveCategory) {
      setError('Category is required.');
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          company: effectiveCompany,
          clientId: clientId || undefined,
          concealCompany,
          location: location.trim(),
          type,
          category: effectiveCategory,
          description: description.trim(),
          requirements,
          responsibilities,
          benefits: benefits.length > 0 ? benefits : undefined,
          salary:
            salaryMin.trim() || salaryMax.trim()
              ? {
                  min: Number(salaryMin) || 0,
                  max: Number(salaryMax) || 0,
                  currency: salaryCurrency,
                }
              : undefined,
          salaryPublic,
          applicationDeadline: applicationDeadline.trim() || undefined,
          minYearsExperience: minYearsExperience.trim() ? parseInt(minYearsExperience, 10) : undefined,
          educationLevel: educationLevel.trim() || undefined,
          educationQualification: educationQualification.trim() || undefined,
          requiredCertifications: requiredCertifications.trim() || undefined,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || 'Failed to create job.');
        setSubmitting(false);
        return;
      }

      router.push('/dashboard/jobs');
      router.refresh();
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      {/* Breadcrumb: keeps back action visible without a big link block */}
      <nav className="mb-4 sm:mb-5" aria-label="Breadcrumb">
        <ol className="flex items-center gap-1.5 text-sm text-neutral-500">
          <li>
            <Link href="/dashboard/jobs" className="hover:text-primary-700 transition-colors">
              Job openings
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-primary-900 font-medium" aria-current="page">Post a job</li>
        </ol>
      </nav>

      <div className="mb-6 sm:mb-8 w-full min-w-0">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary-900 mb-1">Post a job</h1>
        <p className="text-neutral-600 text-sm sm:text-base w-full">
          Add a new role to the careers page. Title, description, requirements, and key responsibilities are required.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full space-y-6 sm:space-y-8">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-6">
          <h2 className="text-base sm:text-lg font-semibold text-primary-900 flex items-center gap-2">
            <Briefcase className="w-5 h-5 shrink-0" />
            Job details
          </h2>

          <div>
            <label htmlFor="client" className="block text-sm font-medium text-primary-900 mb-2">
              <span className="flex items-center gap-1.5">
                <Handshake className="w-4 h-4" />
                Client (optional)
              </span>
            </label>
            <select
              id="client"
              value={clientId}
              onChange={(e) => {
                const id = e.target.value;
                setClientId(id);
                if (id) {
                  const c = clients.find((x) => x.id === id);
                  if (c) setCompany(c.isAnonymous ? 'Confidential' : c.name);
                } else {
                  setCompany('Eagle HR Consultants');
                }
              }}
              className="w-full min-w-0 px-4 py-2.5 sm:py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-base"
            >
              <option value="">— No client (enter company below) —</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {c.isAnonymous ? ' (anonymous on job board)' : ''}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-neutral-500">
              Select an existing client or leave as &quot;No client&quot; and enter the company name below — it will be added to your Clients list for future jobs.
            </p>
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-primary-900 mb-2">
              Job title <span className="text-red-600">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. CEO and Trust Secretary"
              required
              className="w-full min-w-0 px-4 py-2.5 sm:py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <div className="min-w-0">
              <label htmlFor="company" className="block text-sm font-medium text-primary-900 mb-2">
                Company <span className="text-red-600">*</span>
                {companyLocked && (
                  <span className="ml-1.5 text-xs font-normal text-neutral-500 inline-flex items-center gap-1">
                    <EyeOff className="w-3.5 h-3.5" />
                    from client
                  </span>
                )}
              </label>
              <input
                id="company"
                type="text"
                value={companyDisplay}
                onChange={(e) => !companyLocked && setCompany(e.target.value)}
                readOnly={companyLocked}
                required
                className={`w-full min-w-0 px-4 py-2.5 sm:py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base ${
                  companyLocked ? 'border-neutral-200 bg-neutral-50 text-neutral-700' : 'border-neutral-300'
                }`}
              />
              {!companyLocked && (
                <p className="mt-1 text-xs text-neutral-500">
                  This company will be added to Clients so you can select it from the dropdown next time.
                </p>
              )}
            </div>
            <div className="min-w-0">
              <label htmlFor="location" className="block text-sm font-medium text-primary-900 mb-2">
                Location <span className="text-red-600">*</span>
              </label>
              <input
                id="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Nairobi"
                required
                className="w-full min-w-0 px-4 py-2.5 sm:py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base"
              />
            </div>
          </div>

          <div className="flex items-start gap-3">
            <input
              id="concealCompany"
              type="checkbox"
              checked={concealCompany}
              onChange={(e) => setConcealCompany(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="concealCompany" className="text-sm text-neutral-700">
              <span className="font-medium text-primary-900">Conceal company name on job board</span>
              <span className="block mt-0.5 text-neutral-600">
                When ticked, the public careers page will show &quot;Confidential&quot; instead of the company name for this job.
              </span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <div className="min-w-0">
              <label htmlFor="type" className="block text-sm font-medium text-primary-900 mb-2">
                Job type
              </label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full min-w-0 px-4 py-2.5 sm:py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-base"
              >
                {JOB_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="min-w-0">
              <label htmlFor="category" className="block text-sm font-medium text-primary-900 mb-2">
                Category <span className="text-red-600">*</span>
              </label>
              <select
                id="category"
                value={categorySelect}
                onChange={(e) => setCategorySelect(e.target.value)}
                required={categorySelect !== '__other__' ? true : undefined}
                className="w-full min-w-0 px-4 py-2.5 sm:py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-base"
              >
                <option value="">— Select category —</option>
                {categorySuggestions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
                <option value="__other__">— Other (type below) —</option>
              </select>
              {categorySelect === '__other__' && (
                <input
                  type="text"
                  value={categoryCustom}
                  onChange={(e) => setCategoryCustom(e.target.value)}
                  placeholder="Enter category name"
                  required
                  className="mt-3 w-full min-w-0 px-4 py-2.5 sm:py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base"
                />
              )}
              <p className="mt-1 text-xs text-neutral-500">
                Choose from the list or select &quot;Other&quot; and enter a custom category.
              </p>
            </div>
          </div>

          <div>
            <label htmlFor="applicationDeadline" className="block text-sm font-medium text-primary-900 mb-2">
              Application deadline (expiry date)
            </label>
            <input
              id="applicationDeadline"
              type="date"
              value={applicationDeadline}
              onChange={(e) => setApplicationDeadline(e.target.value)}
              min={new Date().toISOString().slice(0, 10)}
              className="w-full min-w-0 px-4 py-2.5 sm:py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base"
            />
            <p className="mt-1 text-xs text-neutral-500">After this date the job will no longer appear on the public board. Leave empty for no expiry.</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-primary-900 flex items-center gap-1.5">
              <Banknote className="w-4 h-4" />
              Salary expectations (optional)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
              <div className="min-w-0">
                <label htmlFor="salaryMin" className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Min
                </label>
                <input
                  id="salaryMin"
                  type="number"
                  min={0}
                  step={1}
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(e.target.value)}
                  placeholder="e.g. 80000"
                  className="w-full min-w-0 px-4 py-2.5 sm:py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base"
                />
              </div>
              <div className="min-w-0">
                <label htmlFor="salaryMax" className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Max
                </label>
                <input
                  id="salaryMax"
                  type="number"
                  min={0}
                  step={1}
                  value={salaryMax}
                  onChange={(e) => setSalaryMax(e.target.value)}
                  placeholder="e.g. 120000"
                  className="w-full min-w-0 px-4 py-2.5 sm:py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base"
                />
              </div>
              <div className="min-w-0">
                <label htmlFor="salaryCurrency" className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Currency
                </label>
                <select
                  id="salaryCurrency"
                  value={salaryCurrency}
                  onChange={(e) => setSalaryCurrency(e.target.value)}
                  className="w-full min-w-0 px-4 py-2.5 sm:py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-base"
                >
                  <option value="KES">KES</option>
                  <option value="USD">USD</option>
                </select>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <input
                id="salaryPublic"
                type="checkbox"
                checked={salaryPublic}
                onChange={(e) => setSalaryPublic(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="salaryPublic" className="text-sm text-neutral-700">
                <span className="font-medium text-primary-900">Show salary on public job board</span>
                <span className="block mt-0.5 text-neutral-600">
                  When unchecked, salary is kept internal and only visible to staff in the dashboard.
                </span>
              </label>
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-primary-900 mb-2">
              Job description <span className="text-red-600">*</span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the role and what the organization is looking for."
              required
              rows={5}
              className="w-full min-w-0 px-4 py-2.5 sm:py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-y min-h-[120px] sm:min-h-[140px] text-base"
            />
          </div>

          <div>
            <label htmlFor="requirements" className="block text-sm font-medium text-primary-900 mb-2">
              Requirements <span className="text-red-600">*</span>
            </label>
            <textarea
              id="requirements"
              value={requirementsText}
              onChange={(e) => setRequirementsText(e.target.value)}
              placeholder="Enter one requirement per line&#10;e.g. Master's degree in Business Administration&#10;Minimum 10 years of executive leadership experience"
              rows={5}
              className="w-full min-w-0 px-4 py-2.5 sm:py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-y min-h-[120px] sm:min-h-[140px] text-base"
            />
            <p className="mt-1 text-xs text-neutral-500">One item per line.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="minYearsExperience" className="block text-sm font-medium text-primary-900 mb-2">
                Minimum years of experience (for filtering candidates)
              </label>
              <input
                type="number"
                id="minYearsExperience"
                value={minYearsExperience}
                onChange={(e) => setMinYearsExperience(e.target.value)}
                min={0}
                placeholder="e.g. 5"
                className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base"
              />
            </div>
            <div>
              <label htmlFor="educationLevel" className="block text-sm font-medium text-primary-900 mb-2">
                Minimum education level (for filtering candidates)
              </label>
              <select
                id="educationLevel"
                value={educationLevel}
                onChange={(e) => setEducationLevel(e.target.value)}
                className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-base"
              >
                <option value="">Any</option>
                <option value="High School">High School</option>
                <option value="Certificate">Certificate</option>
                <option value="Bachelor">Bachelor</option>
                <option value="Master">Master</option>
                <option value="PhD">PhD</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="educationQualification" className="block text-sm font-medium text-primary-900 mb-2">
              Degree or field (for filtering candidates)
            </label>
            <input
              type="text"
              id="educationQualification"
              value={educationQualification}
              onChange={(e) => setEducationQualification(e.target.value)}
              placeholder="e.g. MBA, Bachelor of Commerce, MSc Computer Science, Law"
              className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base"
            />
            <p className="mt-1 text-xs text-neutral-500">Optional. Used to filter candidates by education keyword.</p>
          </div>

          <div>
            <label htmlFor="requiredCertifications" className="block text-sm font-medium text-primary-900 mb-2">
              Required professional certifications (for filtering)
            </label>
            <input
              type="text"
              id="requiredCertifications"
              value={requiredCertifications}
              onChange={(e) => setRequiredCertifications(e.target.value)}
              placeholder="e.g. CPA, CFA, PMP, Nursing Council registration"
              className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base"
            />
            <p className="mt-1 text-xs text-neutral-500">Optional. Shown on application sidebar so reviewers can compare candidate to role.</p>
          </div>

          <div>
            <label htmlFor="responsibilities" className="block text-sm font-medium text-primary-900 mb-2">
              Key responsibilities <span className="text-red-600">*</span>
            </label>
            <textarea
              id="responsibilities"
              value={responsibilitiesText}
              onChange={(e) => setResponsibilitiesText(e.target.value)}
              placeholder="Enter one responsibility per line&#10;e.g. Provide strategic leadership and direction&#10;Oversee all operational activities"
              rows={5}
              className="w-full min-w-0 px-4 py-2.5 sm:py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-y min-h-[120px] sm:min-h-[140px] text-base"
            />
            <p className="mt-1 text-xs text-neutral-500">One item per line.</p>
          </div>

          <div>
            <label htmlFor="benefits" className="block text-sm font-medium text-primary-900 mb-2">
              Benefits (optional)
            </label>
            <textarea
              id="benefits"
              value={benefitsText}
              onChange={(e) => setBenefitsText(e.target.value)}
              placeholder="Enter one benefit per line&#10;e.g. Competitive salary&#10;Health insurance"
              rows={4}
              className="w-full min-w-0 px-4 py-2.5 sm:py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-y min-h-[100px] sm:min-h-[120px] text-base"
            />
            <p className="mt-1 text-xs text-neutral-500">One item per line.</p>
          </div>

          {/* Actions: inside card, full width, clear separation */}
          <div className="pt-6 sm:pt-8 mt-6 sm:mt-8 border-t border-neutral-200 flex flex-col-reverse sm:flex-row sm:justify-end sm:items-center gap-3 sm:gap-4">
            <Link
              href="/dashboard/jobs"
              className="w-full sm:w-auto order-2 sm:order-1 px-6 py-3 min-h-[44px] sm:min-h-0 border border-neutral-300 text-neutral-700 rounded-lg font-medium hover:bg-neutral-50 transition-colors inline-flex items-center justify-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto order-1 sm:order-2 px-6 py-3 min-h-[44px] sm:min-h-0 bg-primary-900 text-white rounded-lg font-semibold hover:bg-primary-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? 'Publishing…' : 'Publish job'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
