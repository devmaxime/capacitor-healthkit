# Ionic/Angular Integration Example

## Complete Service Implementation

Here's a complete example of how to integrate the aggregate records functionality in an Ionic/Angular application.

### health-kit.service.ts

```typescript
import { Injectable } from '@angular/core';
import {
  CapacitorHealthkit,
  SampleNames,
  AggregateResponse,
  AggregateGroupBy,
  QueryOutput,
  OtherData,
} from '@devmaxime/capacitor-healthkit';

const READ_PERMISSIONS = [
  'steps',
  'calories',
  'distance',
  'activity',
  'heartRate',
  'weight'
];

@Injectable({
  providedIn: 'root'
})
export class HealthKitService {

  constructor() { }

  /**
   * Request authorization to access HealthKit data
   */
  async requestAuthorization(): Promise<boolean> {
    try {
      await CapacitorHealthkit.requestAuthorization({
        all: [],
        read: READ_PERMISSIONS,
        write: []
      });
      console.log('[HealthKitService] Authorization granted');
      return true;
    } catch (error) {
      console.error('[HealthKitService] Error getting authorization:', error);
      return false;
    }
  }

  /**
   * Check if HealthKit is available on this device
   */
  async isAvailable(): Promise<boolean> {
    try {
      await CapacitorHealthkit.isAvailable();
      return true;
    } catch (error) {
      console.error('[HealthKitService] HealthKit not available:', error);
      return false;
    }
  }

  /**
   * Get daily step counts for a date range
   */
  async getDailySteps(startDate: Date, endDate: Date = new Date()): Promise<AggregateResponse> {
    try {
      return await CapacitorHealthkit.aggregateRecords({
        sampleName: SampleNames.STEP_COUNT,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        groupBy: 'day'
      });
    } catch (error) {
      console.error('[HealthKitService] Error fetching daily steps:', error);
      throw error;
    }
  }

  /**
   * Get hourly step counts for today
   */
  async getTodayHourlySteps(): Promise<AggregateResponse> {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    try {
      return await CapacitorHealthkit.aggregateRecords({
        sampleName: SampleNames.STEP_COUNT,
        startDate: startOfDay.toISOString(),
        endDate: now.toISOString(),
        groupBy: 'hour'
      });
    } catch (error) {
      console.error('[HealthKitService] Error fetching hourly steps:', error);
      throw error;
    }
  }

  /**
   * Get weekly distance totals
   */
  async getWeeklyDistance(startDate: Date, endDate: Date = new Date()): Promise<AggregateResponse> {
    try {
      return await CapacitorHealthkit.aggregateRecords({
        sampleName: SampleNames.DISTANCE_WALKING_RUNNING,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        groupBy: 'week'
      });
    } catch (error) {
      console.error('[HealthKitService] Error fetching weekly distance:', error);
      throw error;
    }
  }

  /**
   * Get daily active calories burned
   */
  async getDailyActiveCalories(startDate: Date, endDate: Date = new Date()): Promise<AggregateResponse> {
    try {
      return await CapacitorHealthkit.aggregateRecords({
        sampleName: SampleNames.ACTIVE_ENERGY_BURNED,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        groupBy: 'day'
      });
    } catch (error) {
      console.error('[HealthKitService] Error fetching daily calories:', error);
      throw error;
    }
  }

  /**
   * Get daily average heart rate
   */
  async getDailyAverageHeartRate(startDate: Date, endDate: Date = new Date()): Promise<AggregateResponse> {
    try {
      return await CapacitorHealthkit.aggregateRecords({
        sampleName: SampleNames.HEART_RATE,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        groupBy: 'day'
      });
    } catch (error) {
      console.error('[HealthKitService] Error fetching daily heart rate:', error);
      throw error;
    }
  }

  /**
   * Get monthly weight average
   */
  async getMonthlyWeight(startDate: Date, endDate: Date = new Date()): Promise<AggregateResponse> {
    try {
      return await CapacitorHealthkit.aggregateRecords({
        sampleName: SampleNames.WEIGHT,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        groupBy: 'month'
      });
    } catch (error) {
      console.error('[HealthKitService] Error fetching monthly weight:', error);
      throw error;
    }
  }

  /**
   * Get detailed step data (individual samples) - for comparison
   * This is the old way using queryHKitSampleType
   */
  async getDetailedSteps(startDate: Date, endDate: Date = new Date()): Promise<QueryOutput<OtherData>> {
    try {
      return await CapacitorHealthkit.queryHKitSampleType<OtherData>({
        sampleName: SampleNames.STEP_COUNT,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        limit: 0 // Get all records
      });
    } catch (error) {
      console.error('[HealthKitService] Error fetching detailed steps:', error);
      throw error;
    }
  }

  /**
   * Helper method to get last N days
   */
  getDateRangeLastNDays(days: number): { startDate: Date; endDate: Date } {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    return { startDate, endDate };
  }

  /**
   * Helper method to get current week
   */
  getCurrentWeek(): { startDate: Date; endDate: Date } {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - dayOfWeek);
    startDate.setHours(0, 0, 0, 0);
    return { startDate, endDate: now };
  }

  /**
   * Helper method to get current month
   */
  getCurrentMonth(): { startDate: Date; endDate: Date } {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    return { startDate, endDate: now };
  }
}
```

## Component Example

### steps-dashboard.component.ts

```typescript
import { Component, OnInit } from '@angular/core';
import { HealthKitService } from '../services/health-kit.service';
import { AggregateData } from '@devmaxime/capacitor-healthkit';

interface DailyStepData {
  date: string;
  steps: number;
  goal: number;
  percentage: number;
}

@Component({
  selector: 'app-steps-dashboard',
  templateUrl: './steps-dashboard.component.html',
  styleUrls: ['./steps-dashboard.component.scss'],
})
export class StepsDashboardComponent implements OnInit {
  dailySteps: DailyStepData[] = [];
  totalSteps: number = 0;
  averageSteps: number = 0;
  dailyGoal: number = 10000;
  loading: boolean = false;
  error: string | null = null;

  constructor(private healthKitService: HealthKitService) {}

  async ngOnInit() {
    await this.loadStepData();
  }

  async loadStepData() {
    this.loading = true;
    this.error = null;

    try {
      // Check if HealthKit is available
      const isAvailable = await this.healthKitService.isAvailable();
      if (!isAvailable) {
        this.error = 'HealthKit is not available on this device';
        return;
      }

      // Request authorization
      const authorized = await this.healthKitService.requestAuthorization();
      if (!authorized) {
        this.error = 'HealthKit authorization denied';
        return;
      }

      // Get last 7 days of step data
      const { startDate, endDate } = this.healthKitService.getDateRangeLastNDays(7);
      const result = await this.healthKitService.getDailySteps(startDate, endDate);

      // Process the data
      this.dailySteps = result.aggregates.map((aggregate: AggregateData) => {
        const date = new Date(aggregate.startTime);
        const steps = Math.round(aggregate.value);
        const percentage = Math.min((steps / this.dailyGoal) * 100, 100);

        return {
          date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
          steps,
          goal: this.dailyGoal,
          percentage
        };
      });

      // Calculate totals
      this.totalSteps = this.dailySteps.reduce((sum, day) => sum + day.steps, 0);
      this.averageSteps = Math.round(this.totalSteps / this.dailySteps.length);

    } catch (error) {
      console.error('Error loading step data:', error);
      this.error = 'Failed to load step data';
    } finally {
      this.loading = false;
    }
  }

  async refresh(event?: any) {
    await this.loadStepData();
    if (event) {
      event.target.complete();
    }
  }

  getStepColor(percentage: number): string {
    if (percentage >= 100) return 'success';
    if (percentage >= 70) return 'warning';
    return 'danger';
  }
}
```

### steps-dashboard.component.html

```html
<ion-header>
  <ion-toolbar>
    <ion-title>Steps Dashboard</ion-title>
  </ion-toolbar>
</ion-header>

<ion-content>
  <ion-refresher slot="fixed" (ionRefresh)="refresh($event)">
    <ion-refresher-content></ion-refresher-content>
  </ion-refresher>

  <!-- Loading State -->
  <div *ngIf="loading" class="loading-container">
    <ion-spinner></ion-spinner>
    <p>Loading step data...</p>
  </div>

  <!-- Error State -->
  <ion-card *ngIf="error && !loading" color="danger">
    <ion-card-content>
      <ion-icon name="alert-circle-outline"></ion-icon>
      {{ error }}
    </ion-card-content>
  </ion-card>

  <!-- Summary Card -->
  <ion-card *ngIf="!loading && !error">
    <ion-card-header>
      <ion-card-title>7-Day Summary</ion-card-title>
    </ion-card-header>
    <ion-card-content>
      <ion-grid>
        <ion-row>
          <ion-col size="6">
            <div class="stat">
              <h2>{{ totalSteps | number }}</h2>
              <p>Total Steps</p>
            </div>
          </ion-col>
          <ion-col size="6">
            <div class="stat">
              <h2>{{ averageSteps | number }}</h2>
              <p>Daily Average</p>
            </div>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-card-content>
  </ion-card>

  <!-- Daily Steps List -->
  <ion-card *ngIf="!loading && !error">
    <ion-card-header>
      <ion-card-title>Daily Steps</ion-card-title>
    </ion-card-header>
    <ion-list>
      <ion-item *ngFor="let day of dailySteps">
        <ion-label>
          <h2>{{ day.date }}</h2>
          <p>{{ day.steps | number }} steps</p>
        </ion-label>
        <ion-progress-bar 
          [value]="day.percentage / 100" 
          [color]="getStepColor(day.percentage)">
        </ion-progress-bar>
        <ion-note slot="end">{{ day.percentage | number:'1.0-0' }}%</ion-note>
      </ion-item>
    </ion-list>
  </ion-card>
</ion-content>
```

### steps-dashboard.component.scss

```scss
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  
  ion-spinner {
    margin-bottom: 16px;
  }
}

.stat {
  text-align: center;
  
  h2 {
    font-size: 2rem;
    font-weight: bold;
    margin: 0;
  }
  
  p {
    color: var(--ion-color-medium);
    margin: 4px 0 0 0;
  }
}

ion-item {
  --padding-start: 16px;
  
  ion-label {
    margin-bottom: 8px;
  }
  
  ion-progress-bar {
    margin: 8px 0;
  }
}
```

## Advanced Example: Multi-Metric Dashboard

### health-dashboard.component.ts

```typescript
import { Component, OnInit } from '@angular/core';
import { HealthKitService } from '../services/health-kit.service';

interface HealthMetric {
  name: string;
  value: number;
  unit: string;
  icon: string;
  color: string;
  change?: number; // Percentage change from previous period
}

@Component({
  selector: 'app-health-dashboard',
  templateUrl: './health-dashboard.component.html',
  styleUrls: ['./health-dashboard.component.scss'],
})
export class HealthDashboardComponent implements OnInit {
  metrics: HealthMetric[] = [];
  loading: boolean = false;

  constructor(private healthKitService: HealthKitService) {}

  async ngOnInit() {
    await this.loadAllMetrics();
  }

  async loadAllMetrics() {
    this.loading = true;

    try {
      const { startDate, endDate } = this.healthKitService.getDateRangeLastNDays(1);

      // Load all metrics in parallel
      const [steps, calories, distance, heartRate] = await Promise.all([
        this.healthKitService.getDailySteps(startDate, endDate),
        this.healthKitService.getDailyActiveCalories(startDate, endDate),
        this.healthKitService.getWeeklyDistance(startDate, endDate),
        this.healthKitService.getDailyAverageHeartRate(startDate, endDate)
      ]);

      this.metrics = [
        {
          name: 'Steps',
          value: Math.round(steps.aggregates[0]?.value || 0),
          unit: 'steps',
          icon: 'footsteps',
          color: 'primary'
        },
        {
          name: 'Calories',
          value: Math.round(calories.aggregates[0]?.value || 0),
          unit: 'kcal',
          icon: 'flame',
          color: 'danger'
        },
        {
          name: 'Distance',
          value: Math.round((distance.aggregates[0]?.value || 0) / 1000 * 10) / 10, // Convert to km
          unit: 'km',
          icon: 'navigate',
          color: 'success'
        },
        {
          name: 'Heart Rate',
          value: Math.round(heartRate.aggregates[0]?.value || 0),
          unit: 'BPM',
          icon: 'heart',
          color: 'danger'
        }
      ];

    } catch (error) {
      console.error('Error loading metrics:', error);
    } finally {
      this.loading = false;
    }
  }
}
```

## Usage in app.module.ts

```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicModule } from '@ionic/angular';
import { AppComponent } from './app.component';
import { HealthKitService } from './services/health-kit.service';
import { StepsDashboardComponent } from './components/steps-dashboard/steps-dashboard.component';

@NgModule({
  declarations: [
    AppComponent,
    StepsDashboardComponent
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot()
  ],
  providers: [
    HealthKitService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

## Testing on iOS Simulator

Note: HealthKit data is not available in the iOS Simulator. You must test on a real device. However, you can use mock data during development:

```typescript
// health-kit.service.mock.ts
import { Injectable } from '@angular/core';
import { AggregateResponse } from '@devmaxime/capacitor-healthkit';

@Injectable()
export class MockHealthKitService {
  async getDailySteps(startDate: Date, endDate: Date): Promise<AggregateResponse> {
    // Generate mock data
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const aggregates = [];
    
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      aggregates.push({
        startTime: date.toISOString(),
        endTime: new Date(date.getTime() + 24 * 60 * 60 * 1000).toISOString(),
        value: Math.floor(Math.random() * 5000) + 5000, // Random steps between 5000-10000
        unit: 'count'
      });
    }
    
    return { aggregates };
  }
  
  // Add other mock methods as needed...
}
```

Then in your module:

```typescript
import { environment } from '../environments/environment';

providers: [
  {
    provide: HealthKitService,
    useClass: environment.production ? HealthKitService : MockHealthKitService
  }
]
```

