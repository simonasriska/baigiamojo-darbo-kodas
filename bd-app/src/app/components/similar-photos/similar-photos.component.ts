import { Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { PhotoService } from '../../photo-service/photo.service';
import { forkJoin } from 'rxjs';
import { tap } from 'rxjs/operators';

import { Chart, BarElement, BarController, CategoryScale, LinearScale, Title, Tooltip, Legend } from 'chart.js';

Chart.register(BarElement, BarController, CategoryScale, LinearScale, Title, Tooltip, Legend);


interface SimilarUser {
  id: string;
  objectsByFrequency: { [key: string]: number };
  objectsByRelativeSize: { [key: string]: number };
  similarityByFrequency: number;
  similarityByRelativeSize: number;
}

@Component({
  selector: 'app-similar-photos',
  templateUrl: './similar-photos.component.html',
  styleUrls: ['./similar-photos.component.scss'],
})
export class SimilarPhotosComponent implements OnChanges {
  @Input() isUploadCompleted: boolean = false;
  @Input() targets: string[] = [];
  similarityFrequencyMatrix: { [key: string]: any } = {};
  similarityRelativeSizeMatrix: { [key: string]: any } = {};
  distinctPairsFrequencies = new Map();
  distinctPairsRelativeSizes = new Map();
  distinctPairs = new Set();
  chartData: any[] = [];

  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showXAxisLabel = true;
  showYAxisLabel = true;
  xAxisLabel = 'Vartotojų poros';
  yAxisLabel = 'Vartotojų panašumas';

  constructor(private photoService: PhotoService, private el: ElementRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isUploadCompleted'] && this.isUploadCompleted) {
      this.targets.forEach(target => {
        this.similarityFrequencyMatrix[target] = {};
        this.similarityRelativeSizeMatrix[target] = {};
        this.targets.forEach(otherTarget => {
          this.similarityFrequencyMatrix[target][otherTarget] = target === otherTarget ? "-" : 0;
          this.similarityRelativeSizeMatrix[target][otherTarget] = target === otherTarget ? "-" : 0;
        });
      });
  
      const requests = this.targets.map(target => {
        return this.photoService.getUsersSimilarity(target).pipe(
          tap((users: SimilarUser[]) => {
            users.forEach(user => {
              this.similarityFrequencyMatrix[target][user.id] = user.similarityByFrequency;
              this.similarityRelativeSizeMatrix[target][user.id] = user.similarityByRelativeSize;
  
              if (target != user.id) {
                if(!(this.distinctPairs.has(target + " & " + user.id) || this.distinctPairs.has(user.id + " & " + target))) {
                  this.distinctPairs.add(target + " & " + user.id);
                  this.distinctPairsFrequencies.set(target + " & " + user.id, user.similarityByFrequency);
                  this.distinctPairsRelativeSizes.set(target + " & " + user.id, user.similarityByRelativeSize);
                }
              }
            });
          })
        );
      });
  
      forkJoin(requests).subscribe(() => {
        for (let [key, value] of this.distinctPairsFrequencies) {
          let entry = {
            name: key,
            series: [
              { name: 'Panašumas pagal dažnius', value: Math.round((value * 100)*100)/100 },
              { name: 'Panašumas pagal santykinius dydžius', value: Math.round((this.distinctPairsRelativeSizes.get(key) * 100) * 100)/100 || 0 }
            ]
          };
          this.chartData.push(entry);
        }

        const names = Array.from(this.distinctPairsFrequencies.keys());
        const frequencyData = Array.from(this.distinctPairsFrequencies.values());
        const relativeSizeData = Array.from(this.distinctPairsRelativeSizes.values());

        let canvas = document.getElementById('myChart') as HTMLCanvasElement;
        let ctx = canvas.getContext('2d');

        if (ctx) {
            let myChart = new Chart(ctx, {
              type: 'bar',
              data: {
                  labels: names,
                  datasets: [
                      {
                          label: 'Panašumas pagal dažnius',
                          data: frequencyData,
                          backgroundColor: 'rgba(75, 192, 192, 0.2)',
                          borderColor: 'rgba(75, 192, 192, 1)',
                          borderWidth: 1
                      },
                      {
                          label: 'Panašumas pagal santykinius dydžius',
                          data: relativeSizeData,
                          backgroundColor: 'rgba(153, 102, 255, 0.2)',
                          borderColor: 'rgba(153, 102, 255, 1)',
                          borderWidth: 1
                      }
                  ]
              },
              options: {
                  scales: {
                      y: {
                          beginAtZero: true
                      }
                  }
              }
            });
        }
      }
      )
    }
  }
}