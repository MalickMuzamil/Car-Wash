import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../component/header/header.component';
import { FooterComponent } from "../../component/footer/footer.component";


@Component({
  selector: 'app-site',
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './site.component.html',
  styleUrl: './site.component.css'
})
export class SiteComponent {

}
