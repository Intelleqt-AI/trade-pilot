import { UserProfile } from './supabase';

// Check if demo mode is enabled
export const isDemoMode = () => import.meta.env.VITE_DEMO_MODE === 'true';

// Demo user credentials
export const DEMO_CREDENTIALS = {
  customer: {
    email: 'customer@homeplus.com',
    password: 'demo123',
  },
  trade: {
    email: 'trade@homeplus.com',
    password: 'demo123',
  },
};

// Demo profiles
export const mockProfiles: Record<string, UserProfile> = {
  'demo-customer-id': {
    id: 'demo-customer-id',
    user_id: 'demo-customer-user-id',
    email: 'customer@homeplus.com',
    first_name: 'James',
    last_name: 'Wilson',
    role: 'customer',
    phone: '07700 900123',
    address_line_1: '42 Maple Street',
    address_line_2: '',
    city: 'London',
    county: 'Greater London',
    postcode: 'SW1A 1AA',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-03-01T14:30:00Z',
  },
  'demo-trade-id': {
    id: 'demo-trade-id',
    user_id: 'demo-trade-user-id',
    email: 'trade@homeplus.com',
    first_name: 'Michael',
    last_name: 'Thompson',
    role: 'trade',
    phone: '07700 900456',
    address_line_1: '15 Oak Avenue',
    address_line_2: 'Unit 3',
    city: 'Manchester',
    county: 'Greater Manchester',
    postcode: 'M1 1AA',
    business_name: 'Thompson Plumbing Services',
    business_type: 'limited-company',
    years_experience: '10+',
    trade_specialty: 'Plumber',
    has_insurance: true,
    has_license: true,
    agreed_to_terms: true,
    profile_description: 'Experienced plumber with over 12 years in the trade. Specializing in boiler installations, bathroom fitting, and emergency repairs. Gas Safe registered.',
    leads: [1, 3],
    credit: 150,
    created_at: '2024-01-10T09:00:00Z',
    updated_at: '2024-03-05T16:45:00Z',
  },
};

// Additional trade profiles for lead bidders
export const mockTradeProfiles: UserProfile[] = [
  {
    id: 'trade-2',
    user_id: 'trade-user-2',
    email: 'electrician@demo.com',
    first_name: 'Sarah',
    last_name: 'Davies',
    role: 'trade',
    phone: '07700 900789',
    business_name: 'Davies Electrical',
    trade_specialty: 'Electrician',
    has_insurance: true,
    has_license: true,
    years_experience: '8',
    city: 'Birmingham',
    postcode: 'B1 1AA',
    profile_description: 'NICEIC approved contractor. Domestic and commercial installations.',
    credit: 200,
    created_at: '2024-02-01T10:00:00Z',
    updated_at: '2024-03-01T10:00:00Z',
  },
  {
    id: 'trade-3',
    user_id: 'trade-user-3',
    email: 'builder@demo.com',
    first_name: 'Robert',
    last_name: 'Smith',
    role: 'trade',
    phone: '07700 900321',
    business_name: 'Smith & Sons Builders',
    trade_specialty: 'Builder',
    has_insurance: true,
    has_license: true,
    years_experience: '20',
    city: 'Leeds',
    postcode: 'LS1 1AA',
    profile_description: 'Family run building company. Extensions, renovations, and new builds.',
    credit: 300,
    created_at: '2024-01-20T10:00:00Z',
    updated_at: '2024-02-28T10:00:00Z',
  },
];

// Mock leads data
// Note: location field must match profile.postcode for filtering to work
export const mockLeads = [
  {
    id: 1,
    title: 'Boiler Installation',
    name: 'James Wilson',
    service: 'Boiler Installation',
    description: 'Need a new combi boiler installed to replace old system boiler. House is 3 bedrooms, looking for a reliable brand like Worcester or Vaillant.',
    category: 'Plumber',
    status: 'open',
    priority: 'high',
    value: 3000,
    budget: '£2,500 - £3,500',
    location: 'M1 1AA', // Matches demo trade postcode
    urgency: 'Within 2 weeks',
    customer_id: 'demo-customer-id',
    customer_name: 'James Wilson',
    phone: '07700 900123',
    email: 'james.wilson@email.com',
    created_at: '2024-03-10T09:00:00Z',
    images: [],
    bids: [
      {
        id: 101,
        lead_id: 1,
        bid_by: 'demo-trade-id',
        proposedValue: 2800,
        message: 'I can install a Worcester Bosch 30i for this price, including 10-year warranty.',
        status: 'pending',
        created_at: '2024-03-10T14:00:00Z',
        bidder: mockProfiles['demo-trade-id'],
      },
    ],
  },
  {
    id: 2,
    title: 'Full Rewire - 3 Bed Semi',
    name: 'Emma Johnson',
    service: 'Electrical Rewire',
    description: 'Complete electrical rewire needed for a 1960s semi-detached house. Current wiring is original and needs replacing for safety.',
    category: 'Electrician',
    status: 'open',
    priority: 'medium',
    value: 5000,
    budget: '£4,000 - £6,000',
    location: 'M1 1AA', // Matches demo trade postcode
    urgency: 'Within 1 month',
    customer_id: 'customer-2',
    customer_name: 'Emma Johnson',
    phone: '07700 900555',
    email: 'emma.johnson@email.com',
    created_at: '2024-03-08T11:00:00Z',
    images: [],
    bids: [],
  },
  {
    id: 3,
    title: 'Kitchen Extension',
    name: 'David Brown',
    service: 'Kitchen Extension',
    description: 'Looking for quotes on a single-storey kitchen extension, approximately 4m x 5m. Planning permission already approved.',
    category: 'Builder',
    status: 'quoted',
    priority: 'low',
    value: 30000,
    budget: '£25,000 - £35,000',
    location: 'M1 1AA', // Matches demo trade postcode
    urgency: 'Flexible',
    customer_id: 'customer-3',
    customer_name: 'David Brown',
    phone: '07700 900888',
    email: 'david.brown@email.com',
    created_at: '2024-03-05T14:00:00Z',
    images: [],
    bids: [
      {
        id: 104,
        lead_id: 3,
        bid_by: 'trade-3',
        proposedValue: 28000,
        message: 'Complete build including foundations, walls, roof, and basic finish. 8-10 weeks.',
        status: 'accepted',
        created_at: '2024-03-06T10:00:00Z',
        bidder: mockTradeProfiles[1],
      },
    ],
  },
  {
    id: 4,
    title: 'Bathroom Renovation',
    name: 'Sarah Mitchell',
    service: 'Bathroom Renovation',
    description: 'Complete bathroom renovation including new suite, tiling, and underfloor heating. Room size approximately 3m x 2.5m.',
    category: 'Plumber',
    status: 'open',
    priority: 'medium',
    value: 6500,
    budget: '£5,000 - £8,000',
    location: 'M1 1AA', // Matches demo trade postcode
    urgency: 'Within 1 month',
    customer_id: 'customer-4',
    customer_name: 'Sarah Mitchell',
    phone: '07700 900123',
    email: 'sarah.mitchell@email.com',
    created_at: '2024-03-12T10:00:00Z',
    images: [],
    bids: [],
  },
  {
    id: 5,
    title: 'Leaking Roof Repair',
    name: 'Lisa Chen',
    service: 'Roof Repair',
    description: 'Water coming through ceiling during heavy rain. Need inspection and repair. Victorian terrace house.',
    category: 'Roofer',
    status: 'urgent',
    priority: 'high',
    value: 1200,
    budget: '£500 - £2,000',
    location: 'M1 1AA', // Matches demo trade postcode
    urgency: 'ASAP',
    customer_id: 'customer-5',
    customer_name: 'Lisa Chen',
    phone: '07700 900999',
    email: 'lisa.chen@email.com',
    created_at: '2024-03-14T08:00:00Z',
    images: [],
    bids: [],
  },
  {
    id: 6,
    title: 'Garden Landscaping',
    name: 'Mark Taylor',
    service: 'Garden Landscaping',
    description: 'Complete garden redesign including patio, lawn, and flower beds. Garden is approx 10m x 8m.',
    category: 'Landscaper',
    status: 'open',
    priority: 'low',
    value: 10000,
    budget: '£8,000 - £12,000',
    location: 'M1 1AA', // Matches demo trade postcode
    urgency: 'Spring 2024',
    customer_id: 'customer-6',
    customer_name: 'Mark Taylor',
    phone: '07700 900111',
    email: 'mark.taylor@email.com',
    created_at: '2024-03-01T09:00:00Z',
    images: [],
    bids: [],
  },
];

// Mock jobs data
export const mockJobs = [
  {
    id: 1,
    lead_id: 3,
    title: 'Kitchen Extension',
    description: 'Single-storey kitchen extension, 4m x 5m',
    status: 'in_progress',
    priority: 'high',
    rate: 28000,
    trade_id: 'trade-3',
    customer_id: 'customer-3',
    customer_name: 'David Brown',
    trade_name: 'Smith & Sons Builders',
    start_date: '2024-03-20',
    estimated_completion: '2024-05-30',
    created_at: '2024-03-15T10:00:00Z',
    updated_at: '2024-03-18T14:00:00Z',
  },
  {
    id: 2,
    lead_id: 1,
    title: 'Boiler Installation',
    description: 'Worcester Bosch 30i combi boiler installation',
    status: 'scheduled',
    priority: 'medium',
    rate: 2800,
    trade_id: 'demo-trade-id',
    customer_id: 'demo-customer-id',
    customer_name: 'James Wilson',
    trade_name: 'Thompson Plumbing Services',
    start_date: '2024-03-25',
    estimated_completion: '2024-03-26',
    created_at: '2024-03-14T11:00:00Z',
    updated_at: '2024-03-14T11:00:00Z',
  },
  {
    id: 3,
    lead_id: null,
    title: 'Emergency Pipe Repair',
    description: 'Burst pipe repair in basement',
    status: 'completed',
    priority: 'urgent',
    rate: 350,
    trade_id: 'demo-trade-id',
    customer_id: 'customer-6',
    customer_name: 'Helen Wright',
    trade_name: 'Thompson Plumbing Services',
    start_date: '2024-03-01',
    estimated_completion: '2024-03-01',
    completed_at: '2024-03-01T18:00:00Z',
    created_at: '2024-03-01T09:00:00Z',
    updated_at: '2024-03-01T18:00:00Z',
  },
];

// Mock bids data (standalone)
export const mockBids = [
  {
    id: 101,
    lead_id: 1,
    bid_by: 'demo-trade-id',
    proposed_value: 2800,
    message: 'I can install a Worcester Bosch 30i for this price, including 10-year warranty.',
    status: 'pending',
    created_at: '2024-03-10T14:00:00Z',
  },
  {
    id: 102,
    lead_id: 1,
    bid_by: 'trade-2',
    proposed_value: 3100,
    message: 'Quote includes Vaillant ecoTEC plus with smart thermostat.',
    status: 'pending',
    created_at: '2024-03-10T15:30:00Z',
  },
  {
    id: 103,
    lead_id: 2,
    bid_by: 'trade-2',
    proposed_value: 4500,
    message: 'Full rewire with new consumer unit and certification. 6-day job.',
    status: 'pending',
    created_at: '2024-03-08T16:00:00Z',
  },
  {
    id: 104,
    lead_id: 3,
    bid_by: 'trade-3',
    proposed_value: 28000,
    message: 'Complete build including foundations, walls, roof, and basic finish. 8-10 weeks.',
    status: 'accepted',
    created_at: '2024-03-06T10:00:00Z',
  },
];

// Mock blog articles
export const mockArticles = {
  data: [
    {
      id: 1,
      slug: 'how-to-find-reliable-plumber',
      title: 'How to Find a Reliable Plumber in 2024',
      description: 'Tips and tricks for finding trustworthy plumbing professionals.',
      content: 'Finding a reliable plumber can be challenging. Here are our top tips...',
      publishedAt: '2024-02-15T10:00:00Z',
      author: { name: 'Trade Pilot Team' },
      category: { name: 'Tips & Advice' },
      cover: { url: '/placeholder-blog.jpg' },
    },
    {
      id: 2,
      slug: 'home-renovation-budget-guide',
      title: 'Complete Home Renovation Budget Guide',
      description: 'Everything you need to know about budgeting for your home renovation project.',
      content: 'Planning a home renovation requires careful budgeting...',
      publishedAt: '2024-02-20T10:00:00Z',
      author: { name: 'Trade Pilot Team' },
      category: { name: 'Guides' },
      cover: { url: '/placeholder-blog.jpg' },
    },
    {
      id: 3,
      slug: 'electrical-safety-tips',
      title: '10 Electrical Safety Tips Every Homeowner Should Know',
      description: 'Keep your home safe with these essential electrical safety guidelines.',
      content: 'Electrical safety is crucial for every homeowner...',
      publishedAt: '2024-03-01T10:00:00Z',
      author: { name: 'Trade Pilot Team' },
      category: { name: 'Safety' },
      cover: { url: '/placeholder-blog.jpg' },
    },
  ],
};

// In-memory store for demo mode mutations
let demoLeads = [...mockLeads];
let demoBids = [...mockBids];
let demoJobs = [...mockJobs];
let demoProfiles = { ...mockProfiles };

// Demo store getters and setters
export const getDemoLeads = () => demoLeads;
export const getDemoBids = () => demoBids;
export const getDemoJobs = () => demoJobs;
export const getDemoProfiles = () => demoProfiles;

export const addDemoLead = (lead: any) => {
  const newLead = {
    ...lead,
    id: Math.max(...demoLeads.map(l => l.id)) + 1,
    created_at: new Date().toISOString(),
    bids: [],
  };
  demoLeads = [...demoLeads, newLead];
  return newLead;
};

export const updateDemoLead = (lead: any) => {
  demoLeads = demoLeads.map(l => (l.id === lead.id ? { ...l, ...lead } : l));
  return lead;
};

export const addDemoBid = (bid: any) => {
  const newBid = {
    ...bid,
    id: Math.max(...demoBids.map(b => b.id)) + 1,
    created_at: new Date().toISOString(),
  };
  demoBids = [...demoBids, newBid];

  // Also add bid to the lead
  demoLeads = demoLeads.map(l => {
    if (l.id === bid.lead_id) {
      const bidder = demoProfiles[bid.bid_by] || mockTradeProfiles.find(t => t.id === bid.bid_by);
      return {
        ...l,
        bids: [...l.bids, { ...newBid, bidder }],
      };
    }
    return l;
  });

  return newBid;
};

export const updateDemoBid = (bid: any) => {
  demoBids = demoBids.map(b => (b.id === bid.id ? { ...b, ...bid } : b));

  // Also update bid in leads
  demoLeads = demoLeads.map(l => ({
    ...l,
    bids: l.bids.map((b: any) => (b.id === bid.id ? { ...b, ...bid } : b)),
  }));

  return bid;
};

export const addDemoJob = (job: any) => {
  const newJob = {
    ...job,
    id: Math.max(...demoJobs.map(j => j.id)) + 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  demoJobs = [...demoJobs, newJob];
  return newJob;
};

export const updateDemoJob = (jobId: number, updates: any) => {
  demoJobs = demoJobs.map(j => (j.id === jobId ? { ...j, ...updates, updated_at: new Date().toISOString() } : j));
  return demoJobs.find(j => j.id === jobId);
};

export const updateDemoProfile = (profile: any) => {
  if (demoProfiles[profile.id]) {
    demoProfiles[profile.id] = { ...demoProfiles[profile.id], ...profile, updated_at: new Date().toISOString() };
  }
  return demoProfiles[profile.id];
};

// Reset demo data (useful for testing)
export const resetDemoData = () => {
  demoLeads = [...mockLeads];
  demoBids = [...mockBids];
  demoJobs = [...mockJobs];
  demoProfiles = { ...mockProfiles };
};
