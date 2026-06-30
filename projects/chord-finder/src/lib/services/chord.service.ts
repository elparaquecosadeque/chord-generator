import { Injectable } from '@angular/core';
import guitarDbJson from '@tombatossals/chords-db/lib/guitar.json';
import { ChordSearchResult, ChordsDbInstrument, ParsedChord } from '../models/chord.model';

@Injectable({ providedIn: 'root' })
export class ChordService {
  readonly maxBatchSize = 5;

  private readonly guitarDb = guitarDbJson as ChordsDbInstrument;

  private readonly dbRootMap: Record<string, string> = {
    C: 'C',
    'C#': 'Csharp',
    Db: 'Csharp',
    D: 'D',
    'D#': 'Eb',
    Eb: 'Eb',
    E: 'E',
    Fb: 'E',
    'E#': 'F',
    F: 'F',
    'F#': 'Fsharp',
    Gb: 'Fsharp',
    G: 'G',
    'G#': 'Ab',
    Ab: 'Ab',
    A: 'A',
    'A#': 'Bb',
    Bb: 'Bb',
    B: 'B',
    Cb: 'B',
    'B#': 'C'
  };

  private readonly suffixAliases: Record<string, string> = {
    '': 'major',
    M: 'major',
    maj: 'major',
    major: 'major',
    m: 'minor',
    min: 'minor',
    '-': 'minor',
    minor: 'minor',
    Δ: 'maj7',
    maj7: 'maj7',
    M7: 'maj7',
    m7: 'm7',
    min7: 'm7',
    dim: 'dim',
    diminished: 'dim',
    aug: 'aug',
    augmented: 'aug',
    sus: 'sus4',
    sus2: 'sus2',
    sus4: 'sus4',
    add9: 'add9',
    4: 'sus4'
  };

  search(input: string): { results: ChordSearchResult[]; wasLimited: boolean } {
    const tokens = input
      .split(',')
      .map((token) => token.trim())
      .filter(Boolean);

    const limitedTokens = tokens.slice(0, this.maxBatchSize);

    return {
      results: limitedTokens.map((token, index) => this.searchSingle(token, index)),
      wasLimited: tokens.length > this.maxBatchSize
    };
  }

  suffixes(): string[] {
    return this.guitarDb.suffixes;
  }

  private searchSingle(token: string, index: number): ChordSearchResult {
    const parsed = this.parseChordName(token);

    if (!parsed) {
      return {
        id: `${index}-${token}`,
        raw: token,
        displayName: token,
        positions: [],
        error: 'Nombre inválido. Prueba C, F#, C#m, Bb, Am7 o Dsus4.'
      };
    }
    const chordFamily = this.guitarDb.chords[parsed.dbRoot];

    if (!chordFamily) {
      return {
        id: `${index}-${parsed.displayName}`,
        raw: token,
        displayName: parsed.displayName,
        positions: [],
        error: 'Raíz no encontrada en chords-db.'
      };
    }

    const chord = chordFamily.find((item) => item.suffix === parsed.suffix);

    if (!chord) {
      return {
        id: `${index}-${parsed.displayName}`,
        raw: token,
        displayName: parsed.displayName,
        dbName: `${parsed.dbRoot} ${parsed.suffix}`,
        positions: [],
        error: `El tipo "${parsed.suffix}" no existe para este acorde en la base actual.`
      };
    }

    return {
      id: `${index}-${parsed.dbRoot}-${parsed.suffix}`,
      raw: token,
      displayName: parsed.displayName,
      dbName: `${chord.key} ${chord.suffix}`,
      chord,
      positions: chord.positions,
    };
  }

  private parseChordName(raw: string): ParsedChord | null {
    const cleaned = raw
      .replaceAll('♯', '#')
      .replaceAll('♭', 'b')
      .replace(/\s+/g, '');

    const match = cleaned.match(/^([A-Ga-g])([#b]?)(.*)$/);
    if (!match) return null;

    const letter = match[1].toUpperCase();
    const accidental = match[2] ?? '';
    const suffixRaw = match[3] ?? '';
    const root = `${letter}${accidental}`;
    const dbRoot = this.dbRootMap[root];

    if (!dbRoot) return null;

    const suffix = this.normalizeSuffix(suffixRaw);
    if (!suffix) return null;

    return {
      raw,
      root,
      dbRoot,
      displayName: `${root}${this.displaySuffix(suffix)}`,
      suffix
    };
  }

  private normalizeSuffix(rawSuffix: string): string | null {
    const trimmed = rawSuffix.trim();

    if (this.suffixAliases[trimmed] !== undefined) {
      return this.suffixAliases[trimmed];
    }

    const lower = trimmed.toLowerCase();
    if (this.suffixAliases[lower] !== undefined) {
      return this.suffixAliases[lower];
    }

    if (this.guitarDb.suffixes.includes(trimmed)) {
      return trimmed;
    }

    if (this.guitarDb.suffixes.includes(lower)) {
      return lower;
    }

    return null;
  }

  private displaySuffix(suffix: string): string {
    if (suffix === 'major') return '';
    if (suffix === 'minor') return 'm';
    return suffix;
  }
}
