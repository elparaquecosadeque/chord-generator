import { Component, computed, input, ChangeDetectionStrategy } from '@angular/core';
import { ChordsDbPosition } from '../../models/chord.model';

interface BarreSpan {
  fret: number;
  x: number;
  y: number;
  width: number;
  labelX: number;
  labelY: number;
  finger: number | undefined;
}

interface DotMarker {
  fret: number;
  stringIndex: number;
  finger?: number;
}

@Component({
  selector: 'app-chord-diagram',
  imports: [],
  templateUrl: './chord-diagram.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './chord-diagram.scss'
})
export class ChordDiagram {
  title = input.required<string>();
  position = input.required<ChordsDbPosition>();
  positionIndex = input<number>(0);

  readonly width = 240;
  readonly height = 330;
  readonly left = 54;
  readonly top = 112;
  readonly stringGap = 28;
  readonly fretGap = 34;
  readonly dotRadius = 13;
  readonly stringLabels = ['E', 'A', 'D', 'G', 'B', 'E'];

  fretCount = computed(() => Math.max(5, ...this.position().frets.filter((fret) => fret > 0)));

  fretLines = computed(() => Array.from({ length: this.fretCount() + 1 }, (_, index) => index));

  stringLines = computed(() => Array.from({ length: 6 }, (_, index) => index));

  visibleDots = computed<DotMarker[]>(() => {
    const barres = new Set(this.position().barres ?? []);
    const fingers = this.position().fingers ?? [];

    return this.position().frets
      .map((fret, stringIndex) => ({
        fret,
        stringIndex,
        finger: fingers[stringIndex] > 0 ? fingers[stringIndex] : undefined
      }))
      .filter(({ fret }) => fret > 0)
      .filter(({ fret }) => !barres.has(fret));
  });

  barreSpans = computed<BarreSpan[]>(() => {
    const barres = this.position().barres ?? [];
    const fingers = this.position().fingers ?? [];

    return barres
      .map((barreFret) => {
        const playableStrings = this.position().frets
          .map((fret, index) => ({ fret, index }))
          .filter(({ fret }) => fret >= barreFret);

        if (playableStrings.length < 2) return null;

        const firstString = playableStrings[0].index;
        const lastString = playableStrings[playableStrings.length - 1].index;
        const x = this.stringX(firstString) - this.dotRadius;
        const y = this.dotY(barreFret) - this.dotRadius;
        const width = this.stringX(lastString) - this.stringX(firstString) + this.dotRadius * 2;
        const labelX = x + width / 2;
        const labelY = y + this.dotRadius;
        const finger = fingers[firstString] > 0 ? fingers[firstString] : undefined;

        return {
          fret: barreFret,
          x,
          y,
          width,
          labelX,
          labelY,
          finger
        } satisfies BarreSpan;
      })
      .filter((span): span is BarreSpan => span !== null);
  });

  get viewBox(): string {
    return `0 0 ${this.width} ${this.height}`;
  }

  baseFret(): number {
    return this.position().baseFret ?? 1;
  }

  stringX(index: number): number {
    return this.left + index * this.stringGap;
  }

  fretY(index: number): number {
    return this.top + index * this.fretGap;
  }

  dotY(fret: number): number {
    return this.top + (fret - 0.5) * this.fretGap;
  }

  markerFor(fret: number): string {
    if (fret === -1) return '×';
    if (fret === 0) return '○';
    return '';
  }

  fretLabel(): string {
    return String(this.baseFret());
  }

  positionCode(): string {
    return this.position().frets.map((fret) => (fret === -1 ? 'x' : String(fret))).join('');
  }
}
