import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChordDiagram } from './components/chord-diagram/chord-diagram';
import { ChordSearchResult, ChordsDbPosition } from './models/chord.model';
import { ChordService } from './services/chord.service';

@Component({
  selector: 'app-root',
  imports: [FormsModule, ChordDiagram],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  query = 'C';
  results = signal<ChordSearchResult[]>([]);
  wasLimited = signal(false);
  selectedPositionIndex: Record<string, number> = {};
  supportedSuffixes = computed(() => this.chordService.suffixes().slice(0, 18).join(', '));

  constructor(private readonly chordService: ChordService) {
    this.runSearch();
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
