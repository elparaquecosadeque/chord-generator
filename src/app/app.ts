import { Component, ElementRef, computed, signal, viewChild, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChordDiagram } from './components/chord-diagram/chord-diagram';
import { ChordSearchResult, ChordsDbPosition } from './models/chord.model';
import { ChordService } from './services/chord.service';

@Component({
  selector: 'app-root',
  imports: [FormsModule, ChordDiagram],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './app.scss'
})
export class App {
  query = 'C';
  results = signal<ChordSearchResult[]>([]);
  wasLimited = signal(false);
  selectedPositionIndex: Record<string, number> = {};
  supportedSuffixes = computed(() => this.chordService.suffixes().slice(0, 18).join(', '));

  resultsRow = viewChild.required<ElementRef<HTMLElement>>('resultsRow');

  constructor(private readonly chordService: ChordService) {
    this.runSearch();
  }

  async exportPng(): Promise<void> {
    const svgs = Array.from(this.resultsRow().nativeElement.querySelectorAll<SVGSVGElement>('svg.chord-svg'));
    if (!svgs.length) return;

    const padding = 32;
    const gap = 24;
    const width = 240;
    const height = 330;
    const scale = 2;

    const canvas = document.createElement('canvas');
    canvas.width = (padding * 2 + svgs.length * width + (svgs.length - 1) * gap) * scale;
    canvas.height = (padding * 2 + height) * scale;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.scale(scale, scale);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (const [index, svg] of svgs.entries()) {
      const clone = svg.cloneNode(true) as SVGSVGElement;

      clone.insertAdjacentHTML('afterbegin', `<style>
      .chord-svg{font-family:Roboto,Arial,sans-serif;font-weight:400}
      .card-bg{fill:#fff}.title{font-size:42px;font-weight:400;fill:#000}
      .grid line{stroke:#000;stroke-width:2.6;stroke-linecap:square}
      .grid line.nut{stroke-width:7}.barres rect,.dots circle{fill:#000}
      .barres text,.dots text{fill:#fff;font-size:16px;font-weight:400;dominant-baseline:central;alignment-baseline:middle}
      .markers text{fill:#000;font-size:30px;font-weight:400}
      .fret-number{fill:#000;font-size:42px;font-weight:400}
      .string-labels text{fill:#000;font-size:18px;font-weight:400}
    </style>`);

      const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(clone)], { type: 'image/svg+xml' }));
      const image = new Image();
      image.src = url;
      await image.decode();

      ctx.drawImage(image, padding + index * (width + gap), padding, width, height);
      URL.revokeObjectURL(url);
    }

    const link = document.createElement('a');
    link.download = 'chords.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }


  runSearch(): void {
    const { results, wasLimited } = this.chordService.search(this.query);
    this.results.set(results);
    this.wasLimited.set(wasLimited);

    for (const result of results) {
      if (this.selectedPositionIndex[result.id] === undefined) {
        this.selectedPositionIndex[result.id] = 0;
      }
    }
  }

  selectPosition(resultId: string, value: string | number): void {
    this.selectedPositionIndex[resultId] = Number(value);
  }

  selectedIndex(resultId: string): number {
    return this.selectedPositionIndex[resultId] ?? 0;
  }

  selectedPosition(result: ChordSearchResult): ChordsDbPosition | null {
    if (!result.positions.length) return null;
    return result.positions[this.selectedPositionIndex[result.id] ?? 0] ?? result.positions[0];
  }

  trackByResultId(_: number, result: ChordSearchResult): string {
    return result.id;
  }
}
