import { describe, it, expect } from 'vitest';
import {
  isAwaitingQuote, isQuoted, isDecidable, countQuotes, countAwaiting,
  traderName, traderBusiness, type Bid,
} from './bids';

// A lead a trader bought but has not priced. amount is null, status 'purchased'.
const purchased = { status: 'purchased', amount: null };
const quoted = { status: 'pending', amount: '450.00' };
const accepted = { status: 'accepted', amount: '300' };
// HomePlus renders this as £0; ours must treat it as unquoted.
const pendingNoPrice = { status: 'pending', amount: null };

describe('purchased vs quoted', () => {
  it('a purchased lead is awaiting a quote', () => {
    expect(isAwaitingQuote(purchased)).toBe(true);
    expect(isQuoted(purchased)).toBe(false);
  });

  it('a priced bid is a real quote', () => {
    expect(isAwaitingQuote(quoted)).toBe(false);
    expect(isQuoted(quoted)).toBe(true);
  });

  it('pending-but-unpriced counts as awaiting, not a £0 quote', () => {
    expect(isAwaitingQuote(pendingNoPrice)).toBe(true);
  });
});

describe('counting', () => {
  it('counts only real quotes', () => {
    expect(countQuotes([purchased, quoted])).toBe(1);
    expect(countAwaiting([purchased, quoted])).toBe(1);
  });

  it('a purchased-only job has zero quotes', () => {
    expect(countQuotes([purchased])).toBe(0);
  });

  it('tolerates empty and undefined', () => {
    expect(countQuotes([])).toBe(0);
    expect(countQuotes(undefined)).toBe(0);
  });
});

describe('isDecidable — Accept/Decline only when there is a price', () => {
  it('cannot accept an unquoted lead (the server rejects it too)', () => {
    expect(isDecidable(purchased)).toBe(false);
    expect(isDecidable(pendingNoPrice)).toBe(false);
  });

  it('can decide a pending priced quote', () => {
    expect(isDecidable(quoted)).toBe(true);
  });

  it('cannot re-decide an accepted one', () => {
    expect(isDecidable(accepted)).toBe(false);
  });
});

describe('name fallbacks', () => {
  const bid = (over: Partial<Bid>) => over as Bid;

  it('prefers contractor_name — the real serializer field', () => {
    expect(traderName(bid({
      contractor_name: 'Tom R', company_name: 'X', tradepilot_profile: null,
    }))).toBe('Tom R');
  });

  it('falls back to the business name', () => {
    expect(traderName(bid({
      contractor_name: '', tradepilot_profile: { business_name: 'Acme Ltd' } as never,
    }))).toBe('Acme Ltd');
  });

  it('never renders blank', () => {
    expect(traderName(bid({ contractor_name: '', tradepilot_profile: null }))).toBe('Trader');
  });

  it('business prefers company_name', () => {
    expect(traderBusiness(bid({
      company_name: 'Acme Ltd', tradepilot_profile: { business_name: 'Other' } as never,
    }))).toBe('Acme Ltd');
  });
});
