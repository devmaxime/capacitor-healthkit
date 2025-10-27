export interface CapacitorHealthkitPlugin {
  /**
   * This functions will open the iOS Screen to let users choose their permissions. Keep in mind as developers, if the access has been denied by the user we will have no way of knowing - the query results will instead just be empty arrays.
   * @param authOptions These define which access we need. Possible Options include ['calories', 'stairs', 'activity', 'steps', 'distance', 'duration', 'weight'].

   */
  requestAuthorization(authOptions: AuthorizationQueryOptions): Promise<void>;
  /**
   * This defines a query to the Healthkit for a single type of data.
   *
   * When pageToken is not provided, automatic pagination is used to retrieve ALL records
   * within the specified time range. This may take longer for large datasets but ensures
   * complete data retrieval.
   *
   * When pageToken is provided, manual pagination is used and only a single page of
   * results is returned along with a nextPageToken for retrieving subsequent pages.
   *
   * @param queryOptions defines the type of data and the timeframe which shall be queried, a limit can be set to reduce the number of results.
   */
  queryHKitSampleType<T>(
    queryOptions: SingleQueryOptions,
  ): Promise<QueryOutput<T>>;
  /**
   * This functions resolves if HealthKitData is available it uses the native HKHealthStore.isHealthDataAvailable() funtion of the HealthKit .
   */
  isAvailable(): Promise<void>;
  /**
   * This defines a query to the Healthkit for multiple types of data.
   *
   * When pageToken is not provided, automatic pagination is used to retrieve ALL records
   * within the specified time range. This may take longer for large datasets but ensures
   * complete data retrieval.
   *
   * When pageToken is provided, manual pagination is used and only a single page of
   * results is returned along with a nextPageToken for retrieving subsequent pages.
   *
   * @param queryOptions defines the sample types which can be queried for
   */
  multipleQueryHKitSampleType(queryOptions: MultipleQueryOptions): Promise<any>;
  /**
   * Checks if there is writing permission for one specific sample type. This function has not been tested.
   * @param queryOptions defines the sampletype for which you need to check for writing permission.
   */
  isEditionAuthorized(queryOptions: EditionQuery): Promise<void>;
  /**
   * Checks if there is writing permission for multiple sample types. This function has not been tested.
   * @param queryOptions defines the sampletypes for which you need to check for writing permission.
   */
  multipleIsEditionAuthorized(
    queryOptions: MultipleEditionQuery,
  ): Promise<void>;
  /**
   * Aggregates records of the specified type within a time range.
   * Returns aggregated data grouped by the specified time period (e.g., daily totals).
   * Uses HKStatisticsCollectionQuery for efficient aggregation.
   * 
   * @param options defines the type of data, timeframe, and grouping period
   */
  aggregateRecords(options: AggregateQueryOptions): Promise<AggregateResponse>;
}

/**
 * This interface is used for any results coming from HealthKit. It always has a count and the actual results.
 *
 * When using automatic pagination (no pageToken provided), all records are returned
 * and nextPageToken will be undefined.
 *
 * When using manual pagination (pageToken provided), nextPageToken will contain
 * the token for the next page, or undefined if this is the last page.
 */
export interface QueryOutput<T = SleepData | ActivityData | OtherData> {
  countReturn: number;
  resultData: T[];
  nextPageToken?: string;
}

export interface DeviceInformation {
  name: string;
  manufacturer: string;
  model: string;
  hardwareVersion: string;
  softwareVersion: string;
}

/**
 * These data points are returned for every entry.
 */
export interface BaseData {
  startDate: string;
  endDate: string;
  source: string;
  uuid: string;
  sourceBundleId: string;
  device: DeviceInformation | null;
  duration: number;
}

/**
 * These data points are specific for sleep data.
 */
export interface SleepData extends BaseData {
  sleepState: string;
  timeZone: string;
}

/**
 * These data points are specific for activities - not every activity automatically has a corresponding entry.
 */
export interface ActivityData extends BaseData {
  totalFlightsClimbed: number;
  totalSwimmingStrokeCount: number;
  totalEnergyBurned: number;
  totalDistance: number;
  workoutActivityId: number;
  workoutActivityName: string;
}

/**
 * These datapoints are used in the plugin for ACTIVE_ENERGY_BURNED and STEP_COUNT.
 */
export interface OtherData extends BaseData {
  unitName: string;
  value: number;
}

/**
 * These Basequeryoptions are always necessary for a query, they are extended by SingleQueryOptions and MultipleQueryOptions.
 */
export interface BaseQueryOptions {
  startDate: string;
  endDate: string;
  limit: number;
  pageToken?: string;
}

/**
 * This extends the Basequeryoptions for a single sample type.
 */
export interface SingleQueryOptions extends BaseQueryOptions {
  sampleName: string;
}

/**
 * This extends the Basequeryoptions for a multiple sample types.
 */
export interface MultipleQueryOptions extends BaseQueryOptions {
  sampleNames: string[];
}

/**
 * Used for authorization of reading and writing access.
 */
export interface AuthorizationQueryOptions {
  read: string[];
  write: string[];
  all: string[];
}

/**
 * This is used for checking writing permissions.
 */
export interface EditionQuery {
  sampleName: string;
}

/**
 * This is used for checking writing permissions.
 */
export interface MultipleEditionQuery {
  sampleNames: string[];
}

/**
 * These Sample names define the possible query options.
 */
export enum SampleNames {
  STEP_COUNT = 'stepCount',
  FLIGHTS_CLIMBED = 'flightsClimbed',
  APPLE_EXERCISE_TIME = 'appleExerciseTime',
  ACTIVE_ENERGY_BURNED = 'activeEnergyBurned',
  BASAL_ENERGY_BURNED = 'basalEnergyBurned',
  DISTANCE_WALKING_RUNNING = 'distanceWalkingRunning',
  DISTANCE_CYCLING = 'distanceCycling',
  BLOOD_GLUCOSE = 'bloodGlucose',
  SLEEP_ANALYSIS = 'sleepAnalysis',
  WORKOUT_TYPE = 'workoutType',
  WEIGHT = 'weight',
  HEART_RATE = 'heartRate',
  RESTING_HEART_RATE = 'restingHeartRate',
  RESPIRATORY_RATE = 'respiratoryRate',
  BODY_FAT = 'bodyFat',
  OXYGEN_SATURATION = 'oxygenSaturation',
  BASAL_BODY_TEMPERATURE = 'basalBodyTemperature',
  BODY_TEMPERATURE = 'bodyTemperature',
  BLOOD_PRESSURE_SYSTOLIC = 'bloodPressureSystolic',
  BLOOD_PRESSURE_DIASTOLIC = 'bloodPressureDiastolic',
}

/**
 * Time period for grouping aggregated data.
 */
export type AggregateGroupBy = 'hour' | 'day' | 'week' | 'month';

/**
 * Options for aggregating health records.
 */
export interface AggregateQueryOptions {
  startDate: string;
  endDate: string;
  sampleName: string;
  groupBy?: AggregateGroupBy;
}

/**
 * Response from aggregating health records.
 * Contains aggregated data grouped by time periods.
 */
export interface AggregateResponse {
  aggregates: AggregateData[];
}

/**
 * Aggregated data for a specific time period.
 */
export interface AggregateData {
  startTime: string;
  endTime: string;
  value: number;
  unit?: string;
}
