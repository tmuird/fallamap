export type Category =
  | 'crochet-knitting'
  | 'ceramics'
  | 'jewelry'
  | 'woodwork'
  | 'textiles'
  | 'painting'
  | 'leather'
  | 'candles-soaps'
  | 'prints'
  | 'stationery'
  | 'other';

export const CATEGORY_META: Record<Category, { label: string; emoji: string; listingCount: number }> = {
  'crochet-knitting': { label: 'Crochet & Knitting', emoji: '🧶', listingCount: 234 },
  'ceramics':         { label: 'Ceramics',            emoji: '🏺', listingCount: 89  },
  'jewelry':          { label: 'Jewelry',              emoji: '💍', listingCount: 156 },
  'woodwork':         { label: 'Woodwork',             emoji: '🪵', listingCount: 67  },
  'textiles':         { label: 'Textiles & Fabric',    emoji: '🧵', listingCount: 112 },
  'painting':         { label: 'Painting & Art',       emoji: '🎨', listingCount: 198 },
  'leather':          { label: 'Leather Goods',        emoji: '👜', listingCount: 45  },
  'candles-soaps':    { label: 'Candles & Soaps',      emoji: '🕯️', listingCount: 78  },
  'prints':           { label: 'Custom Prints',        emoji: '🖨️', listingCount: 61  },
  'stationery':       { label: 'Stationery',           emoji: '📄', listingCount: 43  },
  'other':            { label: 'Other',                emoji: '✨', listingCount: 29  },
};

export interface Creator {
  id: string;
  name: string;
  username: string;
  initials: string;
  avatarColor: string;
  bio: string;
  categories: Category[];
  rating: number;
  reviewCount: number;
  completedOrders: number;
  responseTime: string;
  location: string;
  badge?: 'top-maker' | 'fast-responder' | 'rising-star' | 'most-loved';
}

export const BADGE_META: Record<string, { label: string; className: string }> = {
  'top-maker':      { label: 'Top Maker',       className: 'bg-falla-fire text-white'   },
  'fast-responder': { label: 'Fast Responder',  className: 'bg-falla-sage text-white'   },
  'rising-star':    { label: 'Rising Star',     className: 'bg-amber-400 text-falla-ink' },
  'most-loved':     { label: 'Most Loved',      className: 'bg-rose-400 text-white'      },
};

export type ListingType = 'pattern' | 'ready-made' | 'commission';

export const LISTING_TYPE_META: Record<ListingType, { label: string; className: string }> = {
  'pattern':    { label: 'Pattern',    className: 'bg-falla-sand text-falla-ink'  },
  'ready-made': { label: 'Ready-made', className: 'bg-falla-sage/20 text-falla-sage' },
  'commission': { label: 'Commission', className: 'bg-falla-fire/10 text-falla-fire' },
};

export interface Listing {
  id: string;
  creator: Creator;
  title: string;
  description: string;
  imageColor: string;
  price: number;
  currency: string;
  category: Category;
  type: ListingType;
  tags: string[];
  isAvailableForCustom: boolean;
}

export type RequestStatus = 'open' | 'in-quotes' | 'in-progress' | 'completed';

export interface CustomRequest {
  id: string;
  buyerInitials: string;
  buyerColor: string;
  title: string;
  description: string;
  category: Category;
  budget: { min: number; max: number; currency: string };
  deadline: string | null;
  status: RequestStatus;
  quoteCount: number;
  hasPattern: boolean;
  tags: string[];
}

export interface Quote {
  id: string;
  requestId: string;
  creator: Creator;
  price: number;
  currency: string;
  estimatedDays: number;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
}

// ─── Shared mock data ────────────────────────────────────────────────────────

export const MOCK_CREATORS: Creator[] = [
  {
    id: '1', name: 'Clara Webb', username: 'clarawebb', initials: 'CW',
    avatarColor: '#FF7043',
    bio: 'Crochet designer with 8 years of experience. Specialising in oversized garments and home textiles.',
    categories: ['crochet-knitting', 'textiles'],
    rating: 4.9, reviewCount: 142, completedOrders: 187,
    responseTime: 'Usually within 2 hours', location: 'Manchester, UK',
    badge: 'top-maker',
  },
  {
    id: '2', name: 'James Okonkwo', username: 'jamesokonkwo', initials: 'JO',
    avatarColor: '#8B9467',
    bio: 'Wheel-thrown pottery and sculptural ceramics. Every piece is one of a kind.',
    categories: ['ceramics'],
    rating: 4.8, reviewCount: 89, completedOrders: 124,
    responseTime: 'Usually within 4 hours', location: 'London, UK',
    badge: 'fast-responder',
  },
  {
    id: '3', name: 'Ines Sato', username: 'inessato', initials: 'IS',
    avatarColor: '#C4673A',
    bio: 'Fine jewellery in sterling silver and gold fill. Specialising in nature-inspired designs.',
    categories: ['jewelry'],
    rating: 5.0, reviewCount: 67, completedOrders: 89,
    responseTime: 'Usually within 1 hour', location: 'Edinburgh, UK',
    badge: 'rising-star',
  },
  {
    id: '4', name: 'Tom Hargreaves', username: 'tomhargreaves', initials: 'TH',
    avatarColor: '#6B7280',
    bio: 'Reclaimed wood furniture and bespoke joinery. Built to last, made with care.',
    categories: ['woodwork'],
    rating: 4.7, reviewCount: 203, completedOrders: 241,
    responseTime: 'Usually within 6 hours', location: 'Bristol, UK',
    badge: 'most-loved',
  },
  {
    id: '5', name: 'Sara Kim', username: 'sarakim', initials: 'SK',
    avatarColor: '#E8A598',
    bio: 'Hand-embroidery and slow textiles. Linen, cotton, natural dyes.',
    categories: ['textiles'],
    rating: 4.9, reviewCount: 55, completedOrders: 70,
    responseTime: 'Usually within 3 hours', location: 'Glasgow, UK',
    badge: 'fast-responder',
  },
  {
    id: '6', name: 'Alex Chen', username: 'alexchen', initials: 'AC',
    avatarColor: '#7FA8C9',
    bio: 'Watercolour and acrylic commissions. Pets, botanicals, and portraits.',
    categories: ['painting'],
    rating: 4.6, reviewCount: 178, completedOrders: 205,
    responseTime: 'Usually within 5 hours', location: 'Leeds, UK',
    badge: 'top-maker',
  },
];

export const MOCK_LISTINGS: Listing[] = [
  {
    id: '1', creator: MOCK_CREATORS[0],
    title: 'Granny Square Afghan Blanket — Full Pattern PDF',
    description: 'A timeless granny square blanket pattern with detailed instructions for all sizes.',
    imageColor: '#FF7043', price: 12, currency: '£',
    category: 'crochet-knitting', type: 'pattern',
    tags: ['blanket', 'granny-square', 'beginner'],
    isAvailableForCustom: true,
  },
  {
    id: '2', creator: MOCK_CREATORS[1],
    title: 'Hand-thrown Stoneware Yunomi Tea Cup',
    description: 'Wheel-thrown yunomi with a celadon glaze. Food safe and dishwasher friendly.',
    imageColor: '#8B9467', price: 38, currency: '£',
    category: 'ceramics', type: 'ready-made',
    tags: ['mug', 'stoneware', 'celadon'],
    isAvailableForCustom: false,
  },
  {
    id: '3', creator: MOCK_CREATORS[2],
    title: 'Hammered Silver Cuff Bracelet — Commission',
    description: 'Sterling silver hammered cuff, adjustable sizing. Made to order in 7–10 days.',
    imageColor: '#C4673A', price: 55, currency: '£',
    category: 'jewelry', type: 'commission',
    tags: ['silver', 'cuff', 'hammered'],
    isAvailableForCustom: true,
  },
  {
    id: '4', creator: MOCK_CREATORS[3],
    title: 'Custom Engraved Oak Serving Board',
    description: 'Reclaimed oak serving board with laser-engraved personalisation.',
    imageColor: '#D4A96A', price: 65, currency: '£',
    category: 'woodwork', type: 'commission',
    tags: ['oak', 'engraved', 'personalised'],
    isAvailableForCustom: true,
  },
  {
    id: '5', creator: MOCK_CREATORS[4],
    title: 'Linen Throw Pillow Cover — Hand Embroidered',
    description: 'Natural linen cover with hand-embroidered botanical motif. 50×50cm.',
    imageColor: '#E8C4A0', price: 28, currency: '£',
    category: 'textiles', type: 'ready-made',
    tags: ['linen', 'embroidered', 'botanical'],
    isAvailableForCustom: true,
  },
  {
    id: '6', creator: MOCK_CREATORS[5],
    title: 'Watercolour Pet Portrait — Commission',
    description: 'A4 or A3 watercolour portrait from your photo. Delivered as print + original.',
    imageColor: '#7FA8C9', price: 90, currency: '£',
    category: 'painting', type: 'commission',
    tags: ['portrait', 'watercolour', 'pet'],
    isAvailableForCustom: true,
  },
  {
    id: '7', creator: MOCK_CREATORS[0],
    title: 'Chunky Ribbed Beanie — Free-size Pattern',
    description: 'Quick knit beanie pattern using bulky weight yarn. Great for beginners.',
    imageColor: '#F5D47F', price: 6, currency: '£',
    category: 'crochet-knitting', type: 'pattern',
    tags: ['beanie', 'chunky', 'quick-knit'],
    isAvailableForCustom: false,
  },
  {
    id: '8', creator: MOCK_CREATORS[1],
    title: 'Hanging Planter Set — Ceramics Commission',
    description: 'Set of 3 wheel-thrown hanging planters with drainage holes. Your choice of glaze.',
    imageColor: '#A8C5A0', price: 75, currency: '£',
    category: 'ceramics', type: 'commission',
    tags: ['planter', 'hanging', 'set'],
    isAvailableForCustom: true,
  },
];

export const MOCK_REQUESTS: CustomRequest[] = [
  {
    id: '1', buyerInitials: 'SL', buyerColor: '#FF7043',
    title: 'Chunky oversized cardigan in oatmeal — open to pattern suggestions',
    description: 'Looking for a relaxed, oversized cardigan with deep pockets. Oatmeal or cream yarn.',
    category: 'crochet-knitting',
    budget: { min: 80, max: 120, currency: '£' },
    deadline: '3 weeks', status: 'open', quoteCount: 5,
    hasPattern: false, tags: ['cardigan', 'oversized', 'chunky'],
  },
  {
    id: '2', buyerInitials: 'MR', buyerColor: '#8B9467',
    title: 'Set of 3 ceramic herb planters, matte white finish',
    description: 'Indoor herb planters, approx 10cm diameter. Matte white with drainage hole.',
    category: 'ceramics',
    budget: { min: 35, max: 60, currency: '£' },
    deadline: '4 weeks', status: 'in-quotes', quoteCount: 3,
    hasPattern: false, tags: ['planter', 'ceramic', 'matte-white'],
  },
  {
    id: '3', buyerInitials: 'EP', buyerColor: '#C4673A',
    title: 'Sterling silver initial pendant — letter E, simple design',
    description: 'Simple geometric initial pendant in sterling silver on a 45cm chain.',
    category: 'jewelry',
    budget: { min: 25, max: 45, currency: '£' },
    deadline: '2 weeks', status: 'open', quoteCount: 8,
    hasPattern: false, tags: ['silver', 'initial', 'pendant'],
  },
  {
    id: '4', buyerInitials: 'DK', buyerColor: '#6B7280',
    title: 'Reclaimed wood floating shelf, 80cm wide, with hidden brackets',
    description: 'Live-edge or reclaimed wood shelf for a hallway. Dark stain preferred.',
    category: 'woodwork',
    budget: { min: 40, max: 70, currency: '£' },
    deadline: null, status: 'open', quoteCount: 2,
    hasPattern: false, tags: ['shelf', 'reclaimed', 'floating'],
  },
  {
    id: '5', buyerInitials: 'AW', buyerColor: '#7FA8C9',
    title: 'Hand-embroidered linen napkins, set of 6, floral border',
    description: 'I have a pattern I\'d like to use — simple daisy chain border on natural linen.',
    category: 'textiles',
    budget: { min: 30, max: 50, currency: '£' },
    deadline: '5 weeks', status: 'open', quoteCount: 4,
    hasPattern: true, tags: ['napkins', 'embroidered', 'linen'],
  },
  {
    id: '6', buyerInitials: 'JT', buyerColor: '#E8A598',
    title: 'Botanical watercolour print, A3 — lavender and eucalyptus',
    description: 'Loose, impressionistic watercolour of lavender and eucalyptus for a bathroom.',
    category: 'painting',
    budget: { min: 25, max: 40, currency: '£' },
    deadline: '2 weeks', status: 'in-quotes', quoteCount: 6,
    hasPattern: false, tags: ['botanical', 'watercolour', 'lavender'],
  },
];
