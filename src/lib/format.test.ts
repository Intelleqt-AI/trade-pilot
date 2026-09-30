import { describe, it, expect } from 'vitest';
import { formatPropertyLine } from './format';

describe('formatPropertyLine', () => {
  it('does not repeat a postcode the geocoded address already ends with', () => {
    // The real case: reverse geocoding returns the full Nominatim display name.
    const address =
      'Lonemore Road U3693, Lonemore, Gairloch, Highland, Scotland, IV21 2DB, United Kingdom';
    expect(formatPropertyLine(address, 'IV21 2DB')).toBe(address);
  });

  it('appends the postcode when the address lacks it', () => {
    expect(formatPropertyLine('12 Example Street, London', 'SW1A 1AA'))
      .toBe('12 Example Street, London, SW1A 1AA');
  });

  it('strips a trailing comma rather than doubling it', () => {
    expect(formatPropertyLine('12 Example Street,', 'SW1A 1AA'))
      .toBe('12 Example Street, SW1A 1AA');
  });

  it('matches regardless of spacing inside the postcode', () => {
    const address = 'Flat 2, IV212DB, Gairloch';
    expect(formatPropertyLine(address, 'IV21 2DB')).toBe(address);
  });

  it('handles either half being missing', () => {
    expect(formatPropertyLine('', 'SW1A 1AA')).toBe('SW1A 1AA');
    expect(formatPropertyLine('12 Example Street', '')).toBe('12 Example Street');
    expect(formatPropertyLine(null, null)).toBe('');
  });
});
