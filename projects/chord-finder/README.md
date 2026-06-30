# @the-chords/chord-finder

Standalone Angular 22 component for finding guitar chords and rendering SVG chord diagrams.

```ts
import { Component } from '@angular/core';
import { ChordFinderComponent } from '@the-chords/chord-finder';

@Component({
  imports: [ChordFinderComponent],
  template: '<the-chords-chord-finder />'
})
export class App {}
```

Build the package with `npm run build:lib`. The publishable Angular package is written to `dist/chord-finder`.
