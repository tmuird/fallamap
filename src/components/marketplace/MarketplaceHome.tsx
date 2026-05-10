import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Sparkle,
  Package,
  ChatTeardrop,
  Star,
  ArrowUpRight,
} from "@phosphor-icons/react";
import {
  CATEGORY_META,
  BADGE_META,
  MOCK_CREATORS,
  MOCK_REQUESTS,
  type Category,
} from "@/types/marketplace";

// ─── Animation helpers ────────────────────────────────────────────────────────

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay },
});

// ─── Decorative hero grid ─────────────────────────────────────────────────────

const HERO_TILES: { category: Category; color: string; size?: 'tall' | 'wide' | 'normal' }[] = [
  { category: 'crochet-knitting', color: '#FF7043', size: 'tall' },
  { category: 'ceramics',         color: '#8B9467'                },
  { category: 'jewelry',          color: '#C4673A'                },
  { category: 'woodwork',         color: '#D4A96A', size: 'wide'  },
  { category: 'painting',         color: '#7FA8C9'                },
  { category: 'textiles',         color: '#E8A598'                },
  { category: 'leather',          color: '#6B7280', size: 'normal' },
  { category: 'candles-soaps',    color: '#F5D47F'                },
];

// ─── How it works steps ───────────────────────────────────────────────────────

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Share your vision',
    description:
      'Describe the item you want. Upload inspiration images, share a pattern you already have, or just tell us your idea.',
    icon: <Sparkle size={26} weight="fill" />,
    color: '#FF7043',
  },
  {
    step: '02',
    title: 'Collect quotes',
    description:
      'Independent makers review your request and send personalised offers. Compare prices, timelines, and styles.',
    icon: <ChatTeardrop size={26} weight="fill" />,
    color: '#8B9467',
  },
  {
    step: '03',
    title: 'Receive your item',
    description:
      'Choose the maker that feels right. Pay securely, and receive your bespoke item — made just for you.',
    icon: <Package size={26} weight="fill" />,
    color: '#C4673A',
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block text-[10px] font-bold tracking-[0.25em] uppercase text-falla-fire border-2 border-falla-fire/30 bg-falla-fire/5 rounded-full px-4 py-1.5">
      {children}
    </span>
  );
}

function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center pt-32 pb-16 px-4 md:px-8 overflow-hidden">
      {/* Subtle background texture */}
      <div className="absolute inset-0 bg-falla-paper">
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, var(--falla-ink) 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      <div className="relative w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
        {/* Text side */}
        <div className="flex flex-col gap-6">
          <motion.div {...fadeUp(0)}>
            <SectionLabel>Bespoke craft marketplace</SectionLabel>
          </motion.div>

          <motion.h1
            {...fadeUp(0.08)}
            className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[0.95] tracking-tight text-falla-ink"
          >
            Have an idea?{" "}
            <span className="text-falla-fire relative inline-block">
              Find a maker.
              <svg
                className="absolute -bottom-2 left-0 w-full"
                viewBox="0 0 300 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2 8.5C60 3.5 140 1.5 298 8.5"
                  stroke="#FF7043"
                  strokeWidth="3"
                  strokeLinecap="round"
                  opacity="0.4"
                />
              </svg>
            </span>
          </motion.h1>

          <motion.p
            {...fadeUp(0.15)}
            className="text-lg text-falla-ink/60 leading-relaxed max-w-md font-medium"
          >
            Post your vision, collect quotes from independent crafters, and
            receive something made just for you — or browse ready-made patterns
            and commissions.
          </motion.p>

          <motion.div {...fadeUp(0.22)} className="flex flex-wrap gap-3">
            <Link to="/request/new">
              <Button size="lg" className="gap-2">
                Post a Request
                <ArrowRight size={18} weight="bold" />
              </Button>
            </Link>
            <Link to="/browse">
              <Button size="lg" variant="outline" className="gap-2">
                Browse Makers
              </Button>
            </Link>
          </motion.div>

          <motion.div
            {...fadeUp(0.3)}
            className="flex items-center gap-6 pt-2"
          >
            {[
              { label: "Active makers", value: "1,200+" },
              { label: "Completed orders", value: "8,400+" },
              { label: "Avg. response", value: "< 3 hrs" },
            ].map(stat => (
              <div key={stat.label} className="flex flex-col gap-0.5">
                <span className="text-2xl font-bold text-falla-ink">
                  {stat.value}
                </span>
                <span className="text-[11px] font-bold tracking-wide uppercase text-falla-ink/40">
                  {stat.label}
                </span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Decorative craft tile grid */}
        <motion.div
          initial={{ opacity: 0, x: 32 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className="hidden lg:grid grid-cols-3 gap-3 h-[520px]"
        >
          {HERO_TILES.map((tile, i) => (
            <motion.div
              key={tile.category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1],
                delay: 0.15 + i * 0.06,
              }}
              className={`rounded-2xl border-2 border-falla-ink flex flex-col items-center justify-center gap-2 shadow-solid cursor-pointer hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all ${
                tile.size === 'tall' ? 'row-span-2' : tile.size === 'wide' ? 'col-span-2' : ''
              }`}
              style={{ backgroundColor: tile.color }}
            >
              <span className="text-3xl">{CATEGORY_META[tile.category].emoji}</span>
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/80">
                {CATEGORY_META[tile.category].label}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 px-4 md:px-8 bg-falla-sand/30 border-y-2 border-falla-ink/5">
      <div className="max-w-6xl mx-auto flex flex-col gap-14">
        <motion.div {...fadeUp()} className="flex flex-col gap-4 text-center items-center">
          <SectionLabel>How it works</SectionLabel>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-falla-ink">
            Three steps to something made for you
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 relative">
          {/* Connecting line (desktop) */}
          <div className="hidden md:block absolute top-10 left-[calc(16.67%+16px)] right-[calc(16.67%+16px)] h-0.5 bg-falla-ink/10 z-0" />

          {HOW_IT_WORKS.map((item, i) => (
            <motion.div
              key={item.step}
              {...fadeUp(i * 0.1)}
              className="relative z-10 bg-falla-paper border-2 border-falla-ink rounded-2xl p-8 flex flex-col gap-4 shadow-solid"
            >
              {/* Step number + icon */}
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl border-2 border-falla-ink flex items-center justify-center shadow-solid-sm shrink-0"
                  style={{ backgroundColor: item.color }}
                >
                  <span className="text-white">{item.icon}</span>
                </div>
                <span className="text-3xl font-bold text-falla-ink/10 tracking-tight">{item.step}</span>
              </div>
              <h3 className="text-xl font-bold text-falla-ink">{item.title}</h3>
              <p className="text-falla-ink/60 leading-relaxed text-sm">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CategoriesSection() {
  const displayCategories = (Object.keys(CATEGORY_META) as Category[]).filter(c => c !== 'other');

  return (
    <section className="py-24 px-4 md:px-8">
      <div className="max-w-6xl mx-auto flex flex-col gap-12">
        <motion.div {...fadeUp()} className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="flex flex-col gap-3">
            <SectionLabel>Explore</SectionLabel>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-falla-ink">
              Browse by craft
            </h2>
          </div>
          <Link to="/browse">
            <Button variant="outline" className="gap-2 shrink-0">
              See all categories <ArrowRight size={16} weight="bold" />
            </Button>
          </Link>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {displayCategories.map((cat, i) => (
            <motion.div key={cat} {...fadeUp(i * 0.04)}>
              <Link
                to={`/browse?category=${cat}`}
                className="group flex flex-col items-center gap-2 p-5 bg-falla-paper border-2 border-falla-ink rounded-2xl shadow-solid hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all text-center"
              >
                <span className="text-3xl">{CATEGORY_META[cat].emoji}</span>
                <span className="text-xs font-bold text-falla-ink leading-tight">
                  {CATEGORY_META[cat].label}
                </span>
                <span className="text-[10px] text-falla-ink/40 font-bold tracking-wide">
                  {CATEGORY_META[cat].listingCount} listings
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function OpenRequestsSection() {
  const featured = MOCK_REQUESTS.slice(0, 3);

  return (
    <section className="py-24 px-4 md:px-8 bg-falla-ink text-falla-paper">
      <div className="max-w-6xl mx-auto flex flex-col gap-12">
        <motion.div {...fadeUp()} className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="flex flex-col gap-3">
            <span className="inline-block text-[10px] font-bold tracking-[0.25em] uppercase text-falla-fire border-2 border-falla-fire/30 bg-falla-fire/10 rounded-full px-4 py-1.5">
              Live requests
            </span>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              Makers wanted — right now
            </h2>
            <p className="text-falla-paper/50 max-w-lg text-sm leading-relaxed font-medium">
              These buyers are waiting for quotes. If you're a maker, browse and
              send an offer.
            </p>
          </div>
          <Link to="/browse?tab=requests">
            <Button variant="outline" className="shrink-0 border-falla-paper/30 text-falla-paper hover:bg-falla-paper/5 gap-2">
              All open requests <ArrowRight size={16} weight="bold" />
            </Button>
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {featured.map((req, i) => (
            <motion.div key={req.id} {...fadeUp(i * 0.08)}>
              <Link to={`/request/${req.id}`} className="group block">
                <div className="h-full bg-falla-paper/5 border-2 border-falla-paper/10 rounded-2xl p-6 flex flex-col gap-4 hover:bg-falla-paper/10 hover:border-falla-paper/20 transition-all">
                  {/* Buyer avatar + category */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-full border-2 border-falla-paper/20 flex items-center justify-center text-xs font-bold text-white shrink-0"
                        style={{ backgroundColor: req.buyerColor }}
                      >
                        {req.buyerInitials}
                      </div>
                      <span className="text-xs font-bold text-falla-paper/40 uppercase tracking-wide">
                        {CATEGORY_META[req.category].emoji} {CATEGORY_META[req.category].label}
                      </span>
                    </div>
                    <ArrowUpRight
                      size={16}
                      weight="bold"
                      className="text-falla-paper/20 group-hover:text-falla-fire transition-colors"
                    />
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-falla-paper leading-snug line-clamp-2">
                    {req.title}
                  </h3>

                  {/* Budget + deadline */}
                  <div className="flex items-center gap-4 text-xs font-bold">
                    <span className="text-falla-fire">
                      {req.budget.currency}{req.budget.min}–{req.budget.currency}{req.budget.max}
                    </span>
                    {req.deadline && (
                      <span className="text-falla-paper/40">⏱ {req.deadline}</span>
                    )}
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mt-auto">
                    {req.tags.map(tag => (
                      <span
                        key={tag}
                        className="text-[10px] font-bold tracking-wide uppercase bg-falla-paper/10 text-falla-paper/60 rounded-full px-2.5 py-1"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Quote count */}
                  <div className="pt-2 border-t border-falla-paper/10 text-xs font-bold text-falla-paper/40">
                    {req.quoteCount} {req.quoteCount === 1 ? "quote" : "quotes"} received
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TopMakersSection() {
  const featured = MOCK_CREATORS.slice(0, 4);

  return (
    <section className="py-24 px-4 md:px-8">
      <div className="max-w-6xl mx-auto flex flex-col gap-12">
        <motion.div {...fadeUp()} className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="flex flex-col gap-3">
            <SectionLabel>The makers</SectionLabel>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-falla-ink">
              Meet some of our crafters
            </h2>
          </div>
          <Link to="/browse">
            <Button variant="outline" className="gap-2 shrink-0">
              All makers <ArrowRight size={16} weight="bold" />
            </Button>
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {featured.map((creator, i) => (
            <motion.div key={creator.id} {...fadeUp(i * 0.07)}>
              <Link to={`/creator/${creator.username}`} className="group block h-full">
                <div className="h-full bg-falla-paper border-2 border-falla-ink rounded-2xl p-6 flex flex-col gap-4 shadow-solid hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all">
                  {/* Avatar + badge */}
                  <div className="flex items-start justify-between">
                    <div
                      className="w-14 h-14 rounded-xl border-2 border-falla-ink flex items-center justify-center text-lg font-bold text-white shadow-solid-sm"
                      style={{ backgroundColor: creator.avatarColor }}
                    >
                      {creator.initials}
                    </div>
                    {creator.badge && (
                      <span className={`text-[10px] font-bold tracking-wide uppercase rounded-full px-2.5 py-1 border-2 border-falla-ink ${BADGE_META[creator.badge].className}`}>
                        {BADGE_META[creator.badge].label}
                      </span>
                    )}
                  </div>

                  {/* Name + specialty */}
                  <div className="flex flex-col gap-1">
                    <h3 className="font-bold text-falla-ink">{creator.name}</h3>
                    <p className="text-xs text-falla-ink/50 font-bold">
                      {creator.categories.map(c => CATEGORY_META[c].label).join(", ")}
                    </p>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-1.5 mt-auto">
                    <Star size={14} weight="fill" className="text-amber-400" />
                    <span className="text-sm font-bold text-falla-ink">{creator.rating}</span>
                    <span className="text-xs text-falla-ink/40 font-bold">
                      ({creator.reviewCount} reviews)
                    </span>
                  </div>

                  {/* Location + response */}
                  <div className="text-[11px] font-bold text-falla-ink/40 uppercase tracking-wide">
                    {creator.location}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BottomCTASection() {
  return (
    <section className="py-24 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          {...fadeUp()}
          className="bg-falla-fire border-2 border-falla-ink rounded-3xl shadow-solid-lg p-12 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8"
        >
          <div className="flex flex-col gap-3 text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
              Ready to bring your idea to life?
            </h2>
            <p className="text-white/70 font-medium max-w-md">
              Post your request for free. No account needed to browse — sign up
              only when you're ready to connect with a maker.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link to="/request/new">
              <Button
                size="lg"
                className="bg-white text-falla-fire border-2 border-white hover:bg-white/90 gap-2 shadow-solid-sm"
              >
                Post a Request <ArrowRight size={18} weight="bold" />
              </Button>
            </Link>
            <Link to="/browse">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10 gap-2"
              >
                Browse Makers
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MarketplaceHome() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <HowItWorksSection />
      <CategoriesSection />
      <OpenRequestsSection />
      <TopMakersSection />
      <BottomCTASection />
    </div>
  );
}
