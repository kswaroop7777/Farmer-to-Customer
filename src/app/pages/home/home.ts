import { Component } from '@angular/core';
import { Header } from '../shareComponents/header/header';
import { Footer } from '../shareComponents/footer/footer';

@Component({
  selector: 'app-home',
  imports: [Header, Footer],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {

}
