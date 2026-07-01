import { ChordService } from './chord.service';

describe('ChordService', () => {
  let service: ChordService;

  beforeEach(() => {
    service = new ChordService();
  });

  it('finds common chords and their positions', () => {
    const { results, wasLimited } = service.search('C, F#, C#m, Bb, Am7');

    expect(wasLimited).toBe(false);
    expect(results.map((result) => result.displayName)).toEqual(['C', 'F#', 'C#m', 'Bb', 'Am7']);
    expect(results.every((result) => result.positions.length > 0)).toBe(true);
  });

  it('limits searches to five chords', () => {
    const { results, wasLimited } = service.search('C, D, E, F, G, A');

    expect(wasLimited).toBe(true);
    expect(results.map((result) => result.displayName)).toEqual(['C', 'D', 'E', 'F', 'G']);
  });

  it('returns a useful error for invalid chord names', () => {
    const { results } = service.search('H');

    expect(results[0].positions).toEqual([]);
    expect(results[0].error).toContain('Nombre');
  });
});
