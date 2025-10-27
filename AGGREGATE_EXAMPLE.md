# Aggregate Records Example

## Overview

The `aggregateRecords` method allows you to retrieve aggregated health data grouped by time periods (hour, day, week, or month). This is particularly useful for getting daily step counts, weekly distance totals, or monthly calorie burns without having to process individual samples.

## How it works

Unlike `queryHKitSampleType` which returns individual health records, `aggregateRecords` uses HealthKit's `HKStatisticsCollectionQuery` to efficiently aggregate data:

- **Cumulative data** (steps, distance, calories, etc.) → Returns the **sum** for each period
- **Discrete data** (heart rate, weight, blood pressure, etc.) → Returns the **average** for each period

## Usage Example

### TypeScript/JavaScript

```typescript
import { CapacitorHealthkit, SampleNames, AggregateGroupBy } from '@devmaxime/capacitor-healthkit';

// Get daily step counts for the last 7 days
async function getDailySteps() {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);

  try {
    const result = await CapacitorHealthkit.aggregateRecords({
      sampleName: SampleNames.STEP_COUNT,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      groupBy: 'day' // Optional, defaults to 'day'
    });

    console.log('Daily steps:', result.aggregates);
    
    // Example output:
    // [
    //   { startTime: '2025-10-19T00:00:00Z', endTime: '2025-10-20T00:00:00Z', value: 8543, unit: 'count' },
    //   { startTime: '2025-10-20T00:00:00Z', endTime: '2025-10-21T00:00:00Z', value: 10234, unit: 'count' },
    //   { startTime: '2025-10-21T00:00:00Z', endTime: '2025-10-22T00:00:00Z', value: 7821, unit: 'count' },
    //   ...
    // ]
  } catch (error) {
    console.error('Error fetching aggregated steps:', error);
  }
}

// Get hourly active calories for today
async function getTodayHourlyCalories() {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  try {
    const result = await CapacitorHealthkit.aggregateRecords({
      sampleName: SampleNames.ACTIVE_ENERGY_BURNED,
      startDate: startOfDay.toISOString(),
      endDate: now.toISOString(),
      groupBy: 'hour'
    });

    console.log('Hourly calories:', result.aggregates);
  } catch (error) {
    console.error('Error fetching hourly calories:', error);
  }
}

// Get weekly distance for the last month
async function getWeeklyDistance() {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 1);

  try {
    const result = await CapacitorHealthkit.aggregateRecords({
      sampleName: SampleNames.DISTANCE_WALKING_RUNNING,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      groupBy: 'week'
    });

    console.log('Weekly distance:', result.aggregates);
    // Values will be in meters
  } catch (error) {
    console.error('Error fetching weekly distance:', error);
  }
}

// Get average heart rate per day
async function getDailyAverageHeartRate() {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  try {
    const result = await CapacitorHealthkit.aggregateRecords({
      sampleName: SampleNames.HEART_RATE,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      groupBy: 'day'
    });

    console.log('Daily average heart rate:', result.aggregates);
    // Values will be in BPM (beats per minute)
  } catch (error) {
    console.error('Error fetching heart rate:', error);
  }
}
```

## Supported Sample Types

The `aggregateRecords` method works with all quantity types:

### Cumulative (returns sum):
- `stepCount` - Steps (count)
- `flightsClimbed` - Flights climbed (count)
- `appleExerciseTime` - Exercise time (minutes)
- `activeEnergyBurned` - Active calories (kilocalories)
- `basalEnergyBurned` - Basal calories (kilocalories)
- `distanceWalkingRunning` - Distance (meters)
- `distanceCycling` - Cycling distance (meters)

### Discrete (returns average):
- `heartRate` - Heart rate (BPM)
- `restingHeartRate` - Resting heart rate (BPM)
- `respiratoryRate` - Respiratory rate (breaths per minute)
- `weight` - Weight (kilograms)
- `bodyFat` - Body fat percentage (%)
- `oxygenSaturation` - Oxygen saturation (%)
- `bloodGlucose` - Blood glucose (mmol/L)
- `basalBodyTemperature` - Basal body temperature (°C)
- `bodyTemperature` - Body temperature (°C)
- `bloodPressureSystolic` - Systolic blood pressure (mmHg)
- `bloodPressureDiastolic` - Diastolic blood pressure (mmHg)

## Grouping Options

You can group data by different time periods using the `groupBy` parameter:

- `'hour'` - Hourly aggregates
- `'day'` - Daily aggregates (default)
- `'week'` - Weekly aggregates
- `'month'` - Monthly aggregates

## Response Format

```typescript
interface AggregateResponse {
  aggregates: AggregateData[];
}

interface AggregateData {
  startTime: string;  // ISO 8601 date string
  endTime: string;    // ISO 8601 date string
  value: number;      // Aggregated value (sum or average)
  unit?: string;      // Unit of measurement
}
```

## Comparison with Android Health Connect

This implementation mirrors the Android Health Connect API structure, making it easier to maintain cross-platform consistency:

### Android (Health Connect)
```typescript
aggregateRecords({
  start: startDate,
  end: endDate,
  type: 'STEPS',
  groupBy: 'day'
});
```

### iOS (HealthKit)
```typescript
aggregateRecords({
  startDate: startDate,
  endDate: endDate,
  sampleName: 'stepCount',
  groupBy: 'day'
});
```

## Performance Benefits

Using `aggregateRecords` instead of `queryHKitSampleType` for aggregated data provides:

1. **Better performance** - HealthKit handles aggregation natively
2. **Less data transfer** - Returns only aggregated values, not individual samples
3. **Simpler code** - No need to manually sum or average values
4. **More accurate** - Uses HealthKit's built-in statistics calculations

## Example: Building a Step Chart

```typescript
import { CapacitorHealthkit, SampleNames } from '@devmaxime/capacitor-healthkit';

async function buildStepChart() {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30); // Last 30 days

  const result = await CapacitorHealthkit.aggregateRecords({
    sampleName: SampleNames.STEP_COUNT,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    groupBy: 'day'
  });

  // Transform for chart library (e.g., Chart.js)
  const chartData = {
    labels: result.aggregates.map(a => new Date(a.startTime).toLocaleDateString()),
    datasets: [{
      label: 'Daily Steps',
      data: result.aggregates.map(a => a.value),
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1
    }]
  };

  return chartData;
}
```

## Notes

- You must request appropriate permissions before calling `aggregateRecords`
- If no data is available for a time period, the value will be 0
- Time periods are aligned to calendar boundaries (e.g., days start at midnight)
- All dates use ISO 8601 format
- The method only works with quantity types (not sleep analysis or workouts)

