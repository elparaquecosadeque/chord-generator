import { Component } from '@angular/core';
import { ChordFinderComponent } from '@the-chords/chord-finder';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ChordFinderComponent],
  template: '<the-chords-chord-finder />'
})
export class App {}
