import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { NavComponent } from './nav/nav.component';
import { FooterComponent } from './footer/footer.component';
import { ScrollComponent } from './animations/scroll/scroll.component';
import { AboutComponent } from './about/about.component';
import { WorksComponent } from './works/works.component';
import { ContactComponent } from './contact/contact.component';
import { ButtonComponent } from './button/button.component';
import { DemoComponent } from './demo/demo.component';
import { DemoTelemetryComponent } from './demo/telemetry/demo-telemetry.component';
import { DemoGameComponent } from './demo/game/demo-game.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    NavComponent,
    FooterComponent,
    ScrollComponent,
    AboutComponent,
    WorksComponent,
    ContactComponent,
    ButtonComponent,
    DemoComponent,
    DemoTelemetryComponent,
    DemoGameComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
