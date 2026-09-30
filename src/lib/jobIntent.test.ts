import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  normaliseTrade,
  normalisePostcode,
  intentFromParams,
  writeJobIntent,
  readJobIntent,
  clearJobIntent,
  requestedTradeLabel,
} from './jobIntent';

// The job form can only select these four (the only trades with CREDIT_RULES).
const SELECTABLE = ['plumber', 'gas_engineer', 'electrician', 'roofer'];

// Every slug the marketing site emits, from an audit of all 22 hero blocks.
const EMITTED: Record<string, string> = {
  plumber: 'plumber',
  electrician: 'electrician',
  roofer: 'roofer',
  gas_engineer: 'gas_engineer',
  // 10 of the 22 landing pages send these — none are selectable.
  builder: '',
  decorator: '',
  kitchen_fitter: '',
  carpenter: '',
};

describe('normaliseTrade', () => {
  for (const [slug, expected] of Object.entries(EMITTED)) {
    it(`maps ${slug} → ${expected || "''"}`, () => {
      expect(normaliseTrade(slug)).toBe(expected);
    });
  }

  it('never produces a trade the form cannot select', () => {
    const mapped = Object.keys(EMITTED).map(normaliseTrade).filter(Boolean);
    expect(mapped.every(t => SELECTABLE.includes(t))).toBe(true);
  });

  it('handles an absent trade (/areas/reading sends none)', () => {
    expect(normaliseTrade(undefined)).toBe('');
    expect(normaliseTrade('')).toBe('');
    expect(normaliseTrade(null)).toBe('');
  });

  it('is case- and separator-insensitive', () => {
    expect(normaliseTrade('PLUMBER')).toBe('plumber');
    expect(normaliseTrade('gas-engineer')).toBe('gas_engineer');
    expect(normaliseTrade(' Gas Engineer ')).toBe('gas_engineer');
  });
});

describe('intentFromParams', () => {
  it('decodes the +-encoded postcode URLSearchParams produces', () => {
    const intent = intentFromParams(new URLSearchParams('postcode=RG1+1AA&trade=plumber'));
    expect(intent.postcode).toBe('RG1 1AA');
    expect(intent.trade).toBe('plumber');
    expect(intent.requestedTrade).toBe('plumber');
  });

  it('keeps the raw trade when it is not selectable, so it can be explained', () => {
    const intent = intentFromParams(new URLSearchParams('postcode=RG1+1AA&trade=kitchen_fitter'));
    expect(intent.trade).toBe('');
    expect(intent.requestedTrade).toBe('kitchen_fitter');
    expect(intent.postcode).toBe('RG1 1AA');
  });

  it('is empty for a bare /join (the contact page links with no params)', () => {
    const intent = intentFromParams(new URLSearchParams(''));
    expect(intent).toEqual({ trade: '', postcode: '', requestedTrade: '' });
  });
});

describe('normalisePostcode', () => {
  it('uppercases and collapses whitespace', () => {
    expect(normalisePostcode('  rg1   1aa ')).toBe('RG1 1AA');
  });
  it('tolerates nothing', () => {
    expect(normalisePostcode(undefined)).toBe('');
  });
});

describe('requestedTradeLabel', () => {
  it('turns a slug into something printable', () => {
    expect(requestedTradeLabel('kitchen_fitter')).toBe('kitchen fitter');
    expect(requestedTradeLabel('gas-engineer')).toBe('gas engineer');
  });
});

describe('storage round-trip', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.useRealTimers();
  });

  it('round-trips an intent', () => {
    writeJobIntent({ trade: 'plumber', postcode: 'RG1 1AA', requestedTrade: 'plumber' });
    expect(readJobIntent()).toEqual({
      trade: 'plumber', postcode: 'RG1 1AA', requestedTrade: 'plumber',
    });
  });

  it('writes nothing when there is nothing to write', () => {
    writeJobIntent({ trade: '', postcode: '', requestedTrade: '' });
    expect(readJobIntent()).toBeNull();
  });

  it('clears — the dashboard consumes it so a refresh cannot reopen the dialog', () => {
    writeJobIntent({ trade: 'plumber', postcode: 'RG1 1AA', requestedTrade: 'plumber' });
    clearJobIntent();
    expect(readJobIntent()).toBeNull();
  });

  it('ignores a stale intent rather than popping a dialog on a later visit', () => {
    vi.useFakeTimers();
    writeJobIntent({ trade: 'plumber', postcode: 'RG1 1AA', requestedTrade: 'plumber' });
    vi.advanceTimersByTime(2 * 60 * 60 * 1000); // TTL is 1h
    expect(readJobIntent()).toBeNull();
  });

  it('survives a corrupt payload', () => {
    sessionStorage.setItem('tp_job_intent', 'not json');
    expect(readJobIntent()).toBeNull();
  });

  it('degrades quietly when storage throws (Safari private mode)', () => {
    const get = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    const set = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(() => {
      writeJobIntent({ trade: 'plumber', postcode: 'X', requestedTrade: 'plumber' });
      readJobIntent();
      clearJobIntent();
    }).not.toThrow();
    get.mockRestore();
    set.mockRestore();
  });
});
