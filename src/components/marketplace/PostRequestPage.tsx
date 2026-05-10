import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  UploadSimple,
  Scissors,
  BookOpen,
  Question,
} from "@phosphor-icons/react";
import { CATEGORY_META, type Category } from "@/types/marketplace";
import { cn } from "@/utils/cn";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormData {
  category:            Category | null;
  title:               string;
  description:         string;
  hasPattern:          boolean | null;
  budgetMin:           string;
  budgetMax:           string;
  currency:            string;
  deadline:            string;
  isFlexibleDeadline:  boolean;
  additionalNotes:     string;
}

const INITIAL_FORM: FormData = {
  category:           null,
  title:              "",
  description:        "",
  hasPattern:         null,
  budgetMin:          "",
  budgetMax:          "",
  currency:           "£",
  deadline:           "",
  isFlexibleDeadline: false,
  additionalNotes:    "",
};

const STEPS = [
  { id: 1, label: "Your idea"  },
  { id: 2, label: "Pattern"    },
  { id: 3, label: "Budget"     },
  { id: 4, label: "Review"     },
] as const;

const DISPLAY_CATEGORIES = (Object.keys(CATEGORY_META) as Category[]).filter(c => c !== 'other');

// ─── Progress bar ─────────────────────────────────────────────────────────────

function StepProgress({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0 w-full max-w-lg mx-auto">
      {STEPS.map((step, i) => {
        const done   = step.id < current;
        const active = step.id === current;
        return (
          <div key={step.id} className="flex items-center flex-1 last:flex-none">
            {/* Circle */}
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "w-9 h-9 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-all duration-300",
                  done
                    ? "bg-falla-fire border-falla-fire text-white"
                    : active
                    ? "bg-falla-ink border-falla-ink text-falla-paper"
                    : "bg-falla-paper border-falla-ink/20 text-falla-ink/30"
                )}
              >
                {done ? <Check size={16} weight="bold" /> : step.id}
              </div>
              <span
                className={cn(
                  "text-[10px] font-bold tracking-wide uppercase whitespace-nowrap",
                  active ? "text-falla-ink" : "text-falla-ink/30"
                )}
              >
                {step.label}
              </span>
            </div>

            {/* Connector */}
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-0.5 mx-2 mb-4 transition-all duration-300",
                  done ? "bg-falla-fire" : "bg-falla-ink/10"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Step 1: Category + description ───────────────────────────────────────────

function Step1({
  form,
  onChange,
}: {
  form: FormData;
  onChange: (patch: Partial<FormData>) => void;
}) {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-2xl font-bold text-falla-ink mb-2">What do you want made?</h2>
        <p className="text-falla-ink/50 text-sm font-medium">
          Start by choosing a craft category, then describe your idea.
        </p>
      </div>

      {/* Category grid */}
      <div>
        <label className="block text-xs font-bold tracking-[0.2em] uppercase text-falla-ink/40 mb-3">
          Craft category
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
          {DISPLAY_CATEGORIES.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => onChange({ category: cat })}
              className={cn(
                "flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 font-bold text-sm transition-all",
                form.category === cat
                  ? "bg-falla-fire text-white border-falla-ink shadow-solid-sm"
                  : "bg-falla-paper text-falla-ink border-falla-ink/20 hover:border-falla-ink hover:shadow-solid-sm"
              )}
            >
              <span className="text-2xl">{CATEGORY_META[cat].emoji}</span>
              <span className="text-xs text-center leading-tight">{CATEGORY_META[cat].label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="block text-xs font-bold tracking-[0.2em] uppercase text-falla-ink/40 mb-2">
          Give your request a title
        </label>
        <input
          type="text"
          value={form.title}
          onChange={e => onChange({ title: e.target.value })}
          placeholder="e.g. Chunky oversized cardigan in oatmeal"
          className="w-full border-2 border-falla-ink rounded-xl px-4 py-3 font-bold text-falla-ink bg-falla-paper placeholder:text-falla-ink/25 focus:outline-none focus:ring-2 focus:ring-falla-fire/20 transition-all"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-bold tracking-[0.2em] uppercase text-falla-ink/40 mb-2">
          Describe your idea
        </label>
        <textarea
          value={form.description}
          onChange={e => onChange({ description: e.target.value })}
          placeholder="Tell the maker what you're imagining — colours, size, style, materials, anything that helps them understand your vision..."
          rows={5}
          className="w-full border-2 border-falla-ink rounded-xl px-4 py-3 font-medium text-falla-ink bg-falla-paper placeholder:text-falla-ink/25 focus:outline-none focus:ring-2 focus:ring-falla-fire/20 transition-all resize-none leading-relaxed"
        />
      </div>
    </div>
  );
}

// ─── Step 2: Pattern / inspiration ────────────────────────────────────────────

function Step2({
  form,
  onChange,
}: {
  form: FormData;
  onChange: (patch: Partial<FormData>) => void;
}) {
  const OPTIONS = [
    {
      value: true,
      icon: <BookOpen size={28} weight="fill" />,
      title: "Yes, I have a pattern",
      description: "You can upload a pattern file (PDF, image, etc.) or link to one you already have.",
      color: '#8B9467',
    },
    {
      value: false,
      icon: <Question size={28} weight="fill" />,
      title: "No — describe it to the maker",
      description: "That's totally fine! The maker will work from your description and any inspiration images.",
      color: '#FF7043',
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-2xl font-bold text-falla-ink mb-2">Do you have a pattern or design?</h2>
        <p className="text-falla-ink/50 text-sm font-medium">
          This helps makers understand exactly what you're after — but it's optional.
        </p>
      </div>

      {/* Yes / No cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {OPTIONS.map(opt => (
          <button
            key={String(opt.value)}
            type="button"
            onClick={() => onChange({ hasPattern: opt.value })}
            className={cn(
              "flex flex-col gap-4 p-6 rounded-2xl border-2 text-left transition-all",
              form.hasPattern === opt.value
                ? "border-falla-ink shadow-solid bg-falla-paper"
                : "border-falla-ink/20 hover:border-falla-ink bg-falla-paper"
            )}
          >
            <div
              className="w-12 h-12 rounded-xl border-2 border-falla-ink flex items-center justify-center text-white shadow-solid-sm"
              style={{ backgroundColor: opt.color }}
            >
              {opt.icon}
            </div>
            <div>
              <p className="font-bold text-falla-ink mb-1">{opt.title}</p>
              <p className="text-xs text-falla-ink/50 leading-relaxed font-medium">{opt.description}</p>
            </div>
            {form.hasPattern === opt.value && (
              <div className="mt-auto self-end w-6 h-6 bg-falla-fire rounded-full border-2 border-falla-ink flex items-center justify-center">
                <Check size={12} weight="bold" className="text-white" />
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Pattern upload (if yes) */}
      {form.hasPattern === true && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="overflow-hidden"
        >
          <div className="border-2 border-dashed border-falla-ink/30 rounded-2xl p-8 flex flex-col items-center gap-3 hover:border-falla-fire/50 transition-all cursor-pointer bg-falla-sand/20">
            <UploadSimple size={32} weight="bold" className="text-falla-ink/30" />
            <div className="text-center">
              <p className="font-bold text-falla-ink/60">Drop your pattern here, or click to browse</p>
              <p className="text-xs text-falla-ink/30 mt-1 font-medium">PDF, PNG, JPG up to 20MB</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Inspiration images (always shown) */}
      <div>
        <label className="block text-xs font-bold tracking-[0.2em] uppercase text-falla-ink/40 mb-3">
          Inspiration images <span className="normal-case font-normal text-falla-ink/30">(optional)</span>
        </label>
        <div className="border-2 border-dashed border-falla-ink/20 rounded-2xl p-6 flex flex-col items-center gap-2 cursor-pointer hover:border-falla-ink/40 transition-all bg-falla-paper">
          <UploadSimple size={24} weight="bold" className="text-falla-ink/20" />
          <p className="text-sm font-bold text-falla-ink/40">Upload inspiration photos</p>
          <p className="text-xs text-falla-ink/25 font-medium">Mood boards, colour references, similar items</p>
        </div>
      </div>
    </div>
  );
}

// ─── Step 3: Budget + timeline ────────────────────────────────────────────────

function Step3({
  form,
  onChange,
}: {
  form: FormData;
  onChange: (patch: Partial<FormData>) => void;
}) {
  const CURRENCIES = ['£', '€', '$'];
  const BUDGET_PRESETS = [
    { min: '10', max: '30',  label: '£10–£30'    },
    { min: '30', max: '60',  label: '£30–£60'    },
    { min: '60', max: '100', label: '£60–£100'   },
    { min: '100', max: '200', label: '£100–£200' },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-2xl font-bold text-falla-ink mb-2">Budget & timeline</h2>
        <p className="text-falla-ink/50 text-sm font-medium">
          Help makers understand what you're comfortable spending and when you need it.
        </p>
      </div>

      {/* Currency */}
      <div>
        <label className="block text-xs font-bold tracking-[0.2em] uppercase text-falla-ink/40 mb-3">
          Currency
        </label>
        <div className="flex gap-2">
          {CURRENCIES.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => onChange({ currency: c })}
              className={cn(
                "w-14 h-12 rounded-xl border-2 font-bold text-sm transition-all",
                form.currency === c
                  ? "bg-falla-ink text-falla-paper border-falla-ink shadow-solid-sm"
                  : "bg-falla-paper text-falla-ink border-falla-ink/20 hover:border-falla-ink"
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Budget presets */}
      <div>
        <label className="block text-xs font-bold tracking-[0.2em] uppercase text-falla-ink/40 mb-3">
          Budget range
        </label>
        <div className="flex flex-wrap gap-2 mb-4">
          {BUDGET_PRESETS.map(preset => {
            const active = form.budgetMin === preset.min && form.budgetMax === preset.max;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => onChange({ budgetMin: preset.min, budgetMax: preset.max })}
                className={cn(
                  "px-4 py-2 rounded-xl border-2 font-bold text-sm transition-all",
                  active
                    ? "bg-falla-fire text-white border-falla-ink shadow-solid-sm"
                    : "bg-falla-paper text-falla-ink border-falla-ink/20 hover:border-falla-ink"
                )}
              >
                {preset.label.replace('£', form.currency)}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="text-xs font-bold text-falla-ink/40 mb-1.5">Minimum</p>
            <div className="flex items-center border-2 border-falla-ink rounded-xl overflow-hidden">
              <span className="px-3 py-3 font-bold text-falla-ink/40 bg-falla-ink/5 text-sm border-r-2 border-falla-ink/10">
                {form.currency}
              </span>
              <input
                type="number"
                value={form.budgetMin}
                onChange={e => onChange({ budgetMin: e.target.value })}
                placeholder="0"
                className="flex-1 px-3 py-3 font-bold text-falla-ink bg-transparent outline-none text-sm"
              />
            </div>
          </div>
          <span className="font-bold text-falla-ink/30 mt-5">—</span>
          <div className="flex-1">
            <p className="text-xs font-bold text-falla-ink/40 mb-1.5">Maximum</p>
            <div className="flex items-center border-2 border-falla-ink rounded-xl overflow-hidden">
              <span className="px-3 py-3 font-bold text-falla-ink/40 bg-falla-ink/5 text-sm border-r-2 border-falla-ink/10">
                {form.currency}
              </span>
              <input
                type="number"
                value={form.budgetMax}
                onChange={e => onChange({ budgetMax: e.target.value })}
                placeholder="500"
                className="flex-1 px-3 py-3 font-bold text-falla-ink bg-transparent outline-none text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Deadline */}
      <div>
        <label className="block text-xs font-bold tracking-[0.2em] uppercase text-falla-ink/40 mb-3">
          When do you need it?
        </label>
        <div className="flex items-center gap-3 mb-4">
          <button
            type="button"
            onClick={() => onChange({ isFlexibleDeadline: !form.isFlexibleDeadline, deadline: '' })}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 font-bold text-sm transition-all",
              form.isFlexibleDeadline
                ? "bg-falla-ink text-falla-paper border-falla-ink"
                : "bg-falla-paper text-falla-ink border-falla-ink/20 hover:border-falla-ink"
            )}
          >
            <div className={cn(
              "w-4 h-4 rounded border-2 flex items-center justify-center",
              form.isFlexibleDeadline ? "border-falla-paper bg-falla-paper" : "border-falla-ink"
            )}>
              {form.isFlexibleDeadline && <Check size={10} weight="bold" className="text-falla-ink" />}
            </div>
            I'm flexible — no rush
          </button>
        </div>
        {!form.isFlexibleDeadline && (
          <input
            type="date"
            value={form.deadline}
            onChange={e => onChange({ deadline: e.target.value })}
            className="border-2 border-falla-ink rounded-xl px-4 py-3 font-bold text-falla-ink bg-falla-paper focus:outline-none focus:ring-2 focus:ring-falla-fire/20 transition-all"
          />
        )}
      </div>

      {/* Additional notes */}
      <div>
        <label className="block text-xs font-bold tracking-[0.2em] uppercase text-falla-ink/40 mb-2">
          Anything else to add? <span className="normal-case font-normal text-falla-ink/30">(optional)</span>
        </label>
        <textarea
          value={form.additionalNotes}
          onChange={e => onChange({ additionalNotes: e.target.value })}
          placeholder="Allergies, gifting notes, specific materials to avoid, packaging preferences..."
          rows={3}
          className="w-full border-2 border-falla-ink rounded-xl px-4 py-3 font-medium text-falla-ink bg-falla-paper placeholder:text-falla-ink/25 focus:outline-none focus:ring-2 focus:ring-falla-fire/20 transition-all resize-none leading-relaxed"
        />
      </div>
    </div>
  );
}

// ─── Step 4: Review ───────────────────────────────────────────────────────────

function Step4({ form }: { form: FormData }) {
  const rows = [
    {
      label: 'Category',
      value: form.category ? `${CATEGORY_META[form.category].emoji} ${CATEGORY_META[form.category].label}` : '—',
    },
    { label: 'Title',       value: form.title       || '—' },
    { label: 'Description', value: form.description || '—' },
    {
      label: 'Pattern',
      value: form.hasPattern === null ? '—' : form.hasPattern ? 'Yes — will upload' : 'No — maker works from description',
    },
    {
      label: 'Budget',
      value: form.budgetMin && form.budgetMax
        ? `${form.currency}${form.budgetMin} – ${form.currency}${form.budgetMax}`
        : '—',
    },
    {
      label: 'Deadline',
      value: form.isFlexibleDeadline ? 'Flexible' : form.deadline || '—',
    },
    {
      label: 'Extra notes',
      value: form.additionalNotes || 'None',
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-2xl font-bold text-falla-ink mb-2">Review your request</h2>
        <p className="text-falla-ink/50 text-sm font-medium">
          Double-check your details before posting. Makers will start sending quotes shortly after.
        </p>
      </div>

      <div className="border-2 border-falla-ink rounded-2xl overflow-hidden shadow-solid">
        {rows.map((row, i) => (
          <div
            key={row.label}
            className={cn(
              "flex gap-4 px-6 py-4",
              i < rows.length - 1 && "border-b-2 border-falla-ink/5"
            )}
          >
            <span className="text-xs font-bold tracking-[0.15em] uppercase text-falla-ink/30 pt-0.5 w-24 shrink-0">
              {row.label}
            </span>
            <span className="font-medium text-falla-ink text-sm leading-relaxed">
              {row.value}
            </span>
          </div>
        ))}
      </div>

      <div className="bg-falla-sand/50 border-2 border-falla-ink/10 rounded-2xl p-5 flex gap-3">
        <Scissors size={20} className="text-falla-fire shrink-0 mt-0.5" weight="bold" />
        <p className="text-sm font-medium text-falla-ink/60 leading-relaxed">
          Your request will be visible to all makers on Craftly. You'll receive quotes via your dashboard and can
          choose the maker that feels right for you.
        </p>
      </div>
    </div>
  );
}

// ─── Validation ───────────────────────────────────────────────────────────────

function canProceed(step: number, form: FormData): boolean {
  if (step === 1) return !!form.category && form.title.trim().length > 3 && form.description.trim().length > 10;
  if (step === 2) return form.hasPattern !== null;
  if (step === 3) return !!form.budgetMin && !!form.budgetMax && (form.isFlexibleDeadline || !!form.deadline);
  return true;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PostRequestPage() {
  const navigate              = useNavigate();
  const [step, setStep]       = useState(1);
  const [form, setForm]       = useState<FormData>(INITIAL_FORM);
  const [submitted, setSubmitted] = useState(false);

  const onChange = (patch: Partial<FormData>) => setForm(prev => ({ ...prev, ...patch }));

  const handleSubmit = () => {
    // In a real implementation this would POST to Supabase
    setSubmitted(true);
    setTimeout(() => navigate("/browse?tab=requests"), 2500);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 pt-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center flex flex-col items-center gap-6 max-w-sm"
        >
          <div className="w-20 h-20 bg-falla-fire rounded-2xl border-2 border-falla-ink shadow-solid-lg flex items-center justify-center">
            <Check size={36} weight="bold" className="text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-falla-ink mb-2">Request posted!</h2>
            <p className="text-falla-ink/50 font-medium">
              Makers are already being notified. You'll receive quotes shortly. Redirecting to browse…
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 md:px-8">
      <div className="max-w-2xl mx-auto flex flex-col gap-10">

        {/* Back link */}
        <Link
          to="/browse"
          className="flex items-center gap-2 text-sm font-bold text-falla-ink/40 hover:text-falla-ink transition-colors w-fit"
        >
          <ArrowLeft size={16} weight="bold" /> Back to browse
        </Link>

        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold tracking-tight text-falla-ink">Post a Request</h1>
          <p className="text-falla-ink/50 font-medium">
            Tell makers what you want and receive personalised quotes.
          </p>
        </div>

        {/* Step progress */}
        <StepProgress current={step} />

        {/* Step content */}
        <div className="bg-falla-paper border-2 border-falla-ink rounded-2xl p-8 shadow-solid">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              {step === 1 && <Step1 form={form} onChange={onChange} />}
              {step === 2 && <Step2 form={form} onChange={onChange} />}
              {step === 3 && <Step3 form={form} onChange={onChange} />}
              {step === 4 && <Step4 form={form} />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setStep(s => Math.max(1, s - 1))}
            disabled={step === 1}
            className="gap-2"
          >
            <ArrowLeft size={16} weight="bold" /> Back
          </Button>

          <span className="text-xs font-bold text-falla-ink/30 uppercase tracking-widest">
            Step {step} of {STEPS.length}
          </span>

          {step < 4 ? (
            <Button
              onClick={() => setStep(s => s + 1)}
              disabled={!canProceed(step, form)}
              className="gap-2"
            >
              Next <ArrowRight size={16} weight="bold" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} className="gap-2 bg-falla-fire">
              Post Request <Check size={16} weight="bold" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
