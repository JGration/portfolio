import { Component } from '@angular/core'
import { Animations } from './animations'
import isMobile from 'is-mobile'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: Animations.animate
})
export class AppComponent {
  title = 'portfolio'
  state = 'inactive'
  scrollSlide = 'hide'
  scroll = 'hide'
  scroll2 = 'hide'

  ngOnInit (): void {
    setTimeout(() => {
      this.state = 'active'
    }, 300)
    if (isMobile()) {
      this.scroll = 'show'
      this.scroll2 = 'show'
      this.scrollSlide = 'show'
    }
  }
}
