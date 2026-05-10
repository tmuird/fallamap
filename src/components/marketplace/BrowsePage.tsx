import { useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Funnel,
  ArrowUpRight,
  Star,
  SortDescending,
  X,
} from "@phosphor-icons/react";
import {
  CATEGORY_META,
  LISTING_TYPE_META,
  MOCK_LISTINGS,
  MOCK_REQUESTS,
  type Category,
  type Listing,
  type CustomRequest,
} from "@/types/marketplace";
import { cn } from "@/utils/cn";

type Tab     = 'listings' | 'requests';
type SortKey = 'newest' | 'price-asc' | 'price-desc' | 'popular';

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'newest',     label: 'Newest first'       },
  { value: 'price-asc',  label: 'Price: low → high'  },
  { value: 'price-desc', label: 'Price: high → low'  },
  { value: 'popular',    label: 'Most quotes'         },
];

const ALL_CATEGORIES = Object.keys(CATEGORY_META) as Category[];

// ─── Listing card ─────────────────────────────────────────────────────────────

function ListingCard({ listing }: { listing: Listing }) {
  const meta = LISTING_TYPE_META[listing.type];
  return (
    <Link to={`/listing/${listing.id}`} className="group block">
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="bg-falla-paper border-2 border-falla-ink rounded-2xl overflow-hidden shadow-solid hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all h-full flex flex-col"
      >
        {/* Image placeholder */}
        <div
          className="h-48 flex items-center justify-center border-b-2 border-falla-ink relative"
          style={{ backgroundColor: listing.imageColor }}
        >
          <span className="text-5xl">{CATEGORY_META[listing.category].emoji}</span>
          <span className={`absolute top-3 right-3 text-[10px] font-bold tracking-wide uppercase rounded-full px-2.5 py-1 border-2 border-falla-ink ${meta.className}`}>
            {meta.label}
          </span>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col gap-3 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-falla-ink leading-snug line-clamp-2 flex-1">
              {listing.title}
            </h3>
            <ArrowUpRight
              size={16}
              weight="bold"
              className="text-falla-ink/20 group-hover:text-falla-fire transition-colors shrink-0 mt-0.5"
            />
          </div>

          {/* Creator */}
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-full border-2 border-falla-ink flex items-center justify-center text-[10px] font-bold text-white shrink-0"
              style={{ backgroundColor: listing.creator.avatarColor }}
            >
              {listing.creator.initials}
            </div>
            <span className="text-xs font-bold text-falla-ink/50">
              {listing.creator.name}
            </span>
            <div className="flex items-center gap-0.5 ml-auto">
              <Star size={11} weight="fill" className="text-amber-400" />
              <span className="text-[11px] font-bold text-falla-ink/60">{listing.creator.rating}</span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mt-auto">
            {listing.tags.slice(0, 3).map(tag => (
              <span key={tag} className="text-[10px] font-bold tracking-wide uppercase bg-falla-ink/5 text-falla-ink/50 rounded-full px-2 py-0.5">
                {tag}
              </span>
            ))}
          </div>

          {/* Price + category */}
          <div className="flex items-center justify-between pt-2 border-t-2 border-falla-ink/5">
            <span className="text-xl font-bold text-falla-ink">
              {listing.currency}{listing.price}
            </span>
            <span className="text-[10px] font-bold tracking-wide uppercase text-falla-ink/40">
              {CATEGORY_META[listing.category].emoji} {CATEGORY_META[listing.category].label}
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

// ─── Request card ─────────────────────────────────────────────────────────────

function RequestCard({ req }: { req: CustomRequest }) {
  const statusColors: Record<string, string> = {
    'open':        'bg-green-100 text-green-700',
    'in-quotes':   'bg-amber-100 text-amber-700',
    'in-progress': 'bg-blue-100 text-blue-700',
    'completed':   'bg-falla-ink/10 text-falla-ink/60',
  };
  const statusLabels: Record<string, string> = {
    'open': 'Open', 'in-quotes': 'Quotes in', 'in-progress': 'In progress', 'completed': 'Completed',
  };

  return (
    <Link to={`/request/${req.id}`} className="group block">
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="bg-falla-paper border-2 border-falla-ink rounded-2xl p-6 flex flex-col gap-4 shadow-solid hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all h-full"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div
              className="w-9 h-9 rounded-full border-2 border-falla-ink flex items-center justify-center text-xs font-bold text-white shrink-0"
              style={{ backgroundColor: req.buyerColor }}
            >
              {req.buyerInitials}
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold tracking-wide uppercase text-falla-ink/40">
                {CATEGORY_META[req.category].emoji} {CATEGORY_META[req.category].label}
              </span>
              <span className={`text-[10px] font-bold tracking-wide uppercase rounded-full px-2 py-0.5 mt-0.5 self-start ${statusColors[req.status]}`}>
                {statusLabels[req.status]}
              </span>
            </div>
          </div>
          <ArrowUpRight
            size={16}
            weight="bold"
            className="text-falla-ink/20 group-hover:text-falla-fire transition-colors shrink-0 mt-0.5"
          />
        </div>

        {/* Title */}
        <h3 className="font-bold text-falla-ink leading-snug line-clamp-2">{req.title}</h3>

        {/* Budget + deadline */}
        <div className="flex items-center gap-4 text-sm font-bold">
          <span className="text-falla-fire">
            {req.budget.currency}{req.budget.min}–{req.budget.currency}{req.budget.max}
          </span>
          {req.deadline && (
            <span className="text-falla-ink/40 text-xs">⏱ {req.deadline}</span>
          )}
          {req.hasPattern && (
            <span className="text-xs font-bold text-falla-sage bg-falla-sage/10 rounded-full px-2 py-0.5 border border-falla-sage/20">
              Has pattern
            </span>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mt-auto">
          {req.tags.map(tag => (
            <span key={tag} className="text-[10px] font-bold tracking-wide uppercase bg-falla-ink/5 text-falla-ink/50 rounded-full px-2 py-0.5">
              {tag}
            </span>
          ))}
        </div>

        {/* Quote count + CTA */}
        <div className="flex items-center justify-between pt-3 border-t-2 border-falla-ink/5">
          <span className="text-xs font-bold text-falla-ink/40">
            {req.quoteCount} {req.quoteCount === 1 ? "quote" : "quotes"} received
          </span>
          <Button size="sm" variant="outline" className="text-xs py-1 h-auto">
            Make an offer
          </Button>
        </div>
      </motion.div>
    </Link>
  );
}

// ─── Filter sidebar ────────────────────────────────────────────────────────────

function FilterSidebar({
  selectedCategories,
  onToggleCategory,
  onClearAll,
}: {
  selectedCategories: Category[];
  onToggleCategory: (cat: Category) => void;
  onClearAll: () => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold tracking-[0.2em] uppercase text-falla-ink/40">
          Filter by craft
        </span>
        {selectedCategories.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-xs font-bold text-falla-fire hover:underline flex items-center gap-1"
          >
            <X size={12} weight="bold" /> Clear
          </button>
        )}
      </div>
      <div className="flex flex-col gap-1">
        {ALL_CATEGORIES.map(cat => {
          const active = selectedCategories.includes(cat);
          return (
            <button
              key={cat}
              onClick={() => onToggleCategory(cat)}
              className={cn(
                "flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold transition-all text-left",
                active
                  ? "bg-falla-ink text-falla-paper"
                  : "text-falla-ink hover:bg-falla-ink/5"
              )}
            >
              <span>{CATEGORY_META[cat].emoji}</span>
              <span className="flex-1">{CATEGORY_META[cat].label}</span>
              <span className={cn("text-[10px] font-bold", active ? "text-falla-paper/50" : "text-falla-ink/30")}>
                {CATEGORY_META[cat].listingCount}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get("tab") as Tab) || "listings";
  const initialCategory = searchParams.get("category") as Category | null;

  const [activeTab, setActiveTab]               = useState<Tab>(initialTab);
  const [selectedCategories, setSelectedCategories] = useState<Category[]>(
    initialCategory ? [initialCategory] : []
  );
  const [sort, setSort]             = useState<SortKey>("newest");
  const [showFilters, setShowFilters] = useState(false);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setSearchParams(prev => { prev.set("tab", tab); return prev; });
  };

  const toggleCategory = (cat: Category) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const filteredListings = useMemo(() => {
    let items = [...MOCK_LISTINGS];
    if (selectedCategories.length > 0) {
      items = items.filter(l => selectedCategories.includes(l.category));
    }
    if (sort === 'price-asc')  items.sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') items.sort((a, b) => b.price - a.price);
    return items;
  }, [selectedCategories, sort]);

  const filteredRequests = useMemo(() => {
    let items = [...MOCK_REQUESTS];
    if (selectedCategories.length > 0) {
      items = items.filter(r => selectedCategories.includes(r.category));
    }
    if (sort === 'price-asc')  items.sort((a, b) => a.budget.min - b.budget.min);
    if (sort === 'price-desc') items.sort((a, b) => b.budget.max - a.budget.max);
    if (sort === 'popular')    items.sort((a, b) => b.quoteCount - a.quoteCount);
    return items;
  }, [selectedCategories, sort]);

  const resultCount = activeTab === 'listings' ? filteredListings.length : filteredRequests.length;

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 md:px-8">
      <div className="max-w-6xl mx-auto flex flex-col gap-8">

        {/* Page header */}
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-falla-ink">Browse</h1>

          {/* Tab toggle */}
          <div className="flex items-center gap-0 bg-falla-ink/5 rounded-2xl p-1.5 w-fit">
            {([
              { id: 'listings', label: '🎨 Maker listings' },
              { id: 'requests', label: '📬 Open requests'  },
            ] as { id: Tab; label: string }[]).map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={cn(
                  "px-5 py-2.5 rounded-xl font-bold text-sm transition-all",
                  activeTab === tab.id
                    ? "bg-falla-paper border-2 border-falla-ink text-falla-ink shadow-solid-sm"
                    : "text-falla-ink/50 hover:text-falla-ink"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Toolbar: sort + filter toggle + result count */}
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm font-bold text-falla-ink/40">
            {resultCount} {resultCount === 1 ? "result" : "results"}
            {selectedCategories.length > 0 && ` in ${selectedCategories.length} ${selectedCategories.length === 1 ? "category" : "categories"}`}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(v => !v)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-falla-ink text-sm font-bold transition-all",
                showFilters
                  ? "bg-falla-ink text-falla-paper shadow-solid-sm"
                  : "bg-falla-paper text-falla-ink shadow-solid-sm hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px]"
              )}
            >
              <Funnel size={15} weight="bold" />
              Filters
              {selectedCategories.length > 0 && (
                <span className="bg-falla-fire text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {selectedCategories.length}
                </span>
              )}
            </button>
            <div className="flex items-center gap-1.5 bg-falla-paper border-2 border-falla-ink rounded-xl px-3 py-2 shadow-solid-sm">
              <SortDescending size={15} weight="bold" className="text-falla-ink/40" />
              <select
                value={sort}
                onChange={e => setSort(e.target.value as SortKey)}
                className="text-sm font-bold text-falla-ink bg-transparent outline-none cursor-pointer"
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Main content: sidebar + grid */}
        <div className="flex gap-8">
          {/* Filter sidebar */}
          <AnimatePresence>
            {showFilters && (
              <motion.aside
                initial={{ opacity: 0, x: -16, width: 0 }}
                animate={{ opacity: 1, x: 0, width: 240 }}
                exit={{ opacity: 0, x: -16, width: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="shrink-0 overflow-hidden"
              >
                <div className="w-60 bg-falla-paper border-2 border-falla-ink rounded-2xl p-5 shadow-solid sticky top-28">
                  <FilterSidebar
                    selectedCategories={selectedCategories}
                    onToggleCategory={toggleCategory}
                    onClearAll={() => setSelectedCategories([])}
                  />
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Results grid */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              {activeTab === 'listings' ? (
                <motion.div
                  key="listings"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
                >
                  <AnimatePresence>
                    {filteredListings.length > 0 ? (
                      filteredListings.map(listing => (
                        <ListingCard key={listing.id} listing={listing} />
                      ))
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="col-span-full py-24 flex flex-col items-center gap-3 text-center"
                      >
                        <span className="text-5xl">🔍</span>
                        <p className="font-bold text-falla-ink/40">No listings match your filters.</p>
                        <Button variant="outline" size="sm" onClick={() => setSelectedCategories([])}>
                          Clear filters
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <motion.div
                  key="requests"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
                >
                  <AnimatePresence>
                    {filteredRequests.length > 0 ? (
                      filteredRequests.map(req => (
                        <RequestCard key={req.id} req={req} />
                      ))
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="col-span-full py-24 flex flex-col items-center gap-3 text-center"
                      >
                        <span className="text-5xl">🔍</span>
                        <p className="font-bold text-falla-ink/40">No requests match your filters.</p>
                        <Button variant="outline" size="sm" onClick={() => setSelectedCategories([])}>
                          Clear filters
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* CTA for makers */}
        {activeTab === 'requests' && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-falla-sand/60 border-2 border-falla-ink rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-4"
          >
            <div>
              <p className="font-bold text-falla-ink text-lg">Are you a maker?</p>
              <p className="text-falla-ink/50 text-sm font-medium mt-1">
                Browse open requests and send quotes directly to buyers.
              </p>
            </div>
            <Link to="/sign-up?role=maker">
              <Button className="shrink-0 gap-2">
                Join as a Maker <ArrowUpRight size={16} weight="bold" />
              </Button>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
