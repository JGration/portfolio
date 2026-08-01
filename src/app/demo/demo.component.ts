import { Component } from '@angular/core';

type TabKey = 'telemetry' | 'game';

interface TabDef {
  key: TabKey;
  label: string;
}

@Component({
  selector: 'app-demo',
  templateUrl: './demo.component.html',
  styleUrls: ['./demo.component.scss'],
})
export class DemoComponent {
  activeTab: TabKey = 'telemetry';

  readonly tabs: TabDef[] = [
    { key: 'telemetry', label: 'Telemetry Monitor' },
    { key: 'game', label: 'Endless Runner' },
  ];
}
