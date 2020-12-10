import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { data, imag, Tensor3D } from '@tensorflow/tfjs';
import { load, MobileNet } from '@tensorflow-models/mobilenet';

export interface Prediction {
  className: string;
  probability: number;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {

  imageSrc: string | ArrayBuffer | null = null;
  model: MobileNet | any;
  predictions: Prediction[] = [];
  webcam: any;

  private readonly fileReader = new FileReader();

  @ViewChild('webcam') webcamElement: ElementRef | undefined;

  get probability(): number {
    return Math.round(this.predictions[0].probability * 100 * 10) / 10;
  }

  get className(): string {
    return this.predictions[0].className;
  }

  ngOnInit(): void {
    this.fileReader.onload = () => this.onFileRead(this.fileReader.result);
    this.loadModel();
  }

  ngAfterViewInit(): void {
    const element = this.webcamElement?.nativeElement;
    if (element instanceof HTMLVideoElement) {
      this.loadWebcam(element);
    }
  }

  onFileChanged(event: any) {
    if (event.target?.files.length > 0) {
      const [file] = event.target.files;
      this.fileReader.readAsDataURL(file);
    }
  }

  onFileRead(result: string | ArrayBuffer | null) {
    if (result !== null) {
      this.imageSrc = result;
    }
  }

  onImageLoaded(event: Event) {
    if (event.target instanceof HTMLImageElement) {
      this.predict(event.target);
    }
  }

  async capture(): Promise<void> {
    const image = await this.webcam.capture() as Tensor3D;
    await this.predict(image);
    image.dispose();

  }

  private async loadModel(): Promise<void> {
    this.model = await load();
  }

  private async loadWebcam(element: HTMLVideoElement): Promise<void> {
    this.webcam = await data.webcam(element);
  }

  private async predict(image: Tensor3D | ImageData | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement) {
    this.predictions = await this.model.classify(image);
  }
}
