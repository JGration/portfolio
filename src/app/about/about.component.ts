import { Component, OnDestroy, OnInit } from '@angular/core'
import { Animations } from '../animations'
import anime from 'animejs'

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
  animations: Animations.animate
})
export class AboutComponent implements OnInit, OnDestroy {
  state = 'inactive'
  hexagon = 'inactive'
  first = 'inactive'
  second = 'inactive'
  third = 'inactive'

  private spinAnimation: anime.AnimeInstance | undefined
  private timeouts: number[] = []

  constructor () {}

  ngOnInit (): void {
    this.spinAnimation = anime({
      targets: '.spin',
      rotate: 360,
      easing: 'linear',
      loop: true,
      duration: 20000,
      direction: 'reverse'
    })
    this.timeouts.push(window.setTimeout(() => {
      this.state = 'active'
    }, 1500))
    this.timeouts.push(window.setTimeout(() => {
      this.hexagon = 'active'
    }, 2500))
    this.timeouts.push(window.setTimeout(() => {
      this.first = 'active'
    }, 3000))
    this.timeouts.push(window.setTimeout(() => {
      this.second = 'active'
    }, 3500))
    this.timeouts.push(window.setTimeout(() => {
      this.third = 'active'
    }, 4000))
  }

  ngOnDestroy (): void {
    for (const id of this.timeouts) window.clearTimeout(id)
    this.timeouts = []
    this.spinAnimation?.pause()
  }
}
