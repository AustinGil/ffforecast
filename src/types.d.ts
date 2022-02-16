export type OpenWeatherOneCall = {
  lat: number,
  lon: number,
  timezone: string,
  timezone_offset: number,
  current: OpenWeatherCurrent,
  minutely: OpenWeatherMinute[],
  hourly: OpenWeatherHour[],
  daily: OpenWeatherDay[],
}

export type OpenWeatherCurrent = {
  dt: number,
  sunrise: number,
  sunset: number,
  temp: number,
  feels_like: number,
  pressure: number,
  humidity: number,
  dew_point: number,
  uvi: number,
  clouds: number,
  visibility: number,
  wind_speed: number,
  wind_deg: number,
  wind_gust: number,
  weather: Array<{
    id: number,
    main: string,
    description: string,
    icon: string,
  }>
}

export type OpenWeatherMinute = {
  dt: number,
  precipitation: number
}

export type OpenWeatherHour = {
  dt: number,
  temp: number,
  feels_like: number,
  pressure: number,
  humidity: number,
  dew_point: number,
  uvi: number,
  clouds: number,
  visibility: number,
  wind_speed: number,
  wind_deg: number,
  wind_gust: number,
  weather: [
    {
      id: number,
      main: string,
      description: string,
      icon: string
    }
  ],
  pop: number
}

export type OpenWeatherDay = {
  dt: number,
  sunrise: number,
  sunset: number,
  moonrise: number,
  moonset: number,
  moon_phase: number,
  temp: {
    day: number,
    min: number,
    max: number,
    night: number,
    eve: number,
    morn: number
  },
  feels_like: {
    day: number,
    night: number,
    eve: number,
    morn: number
  },
  pressure: number,
  humidity: number,
  dew_point: number,
  wind_speed: number,
  wind_deg: number,
  wind_gust: number,
  weather: [
    {
      id: number,
      main: string,
      description: string,
      icon: string
    }
  ],
  clouds: number,
  pop: number,
  rain: number,
  uvi: number
}

// export type OpenWeatherMapResponse = {
//   cod: number|string
//   coord?: {
//    lon: number,
//    lat: number
//   },
//   weather?: Array<{
//    id: number,
//    main: string,
//    description: string,
//    icon: string
//   }>,
//   base?: string,
//   main?: {
//    temp: number,
//    feels_like: number,
//    temp_min: number,
//    temp_max: number,
//    pressure: number,
//    humidity: number
//   },
//   visibility?: number,
//   wind?: {
//    speed: number,
//    deg: number
//   },
//   clouds?: {
//    all: number
//   },
//   dt?: number,
//   sys?: {
//    type: number,
//    id: number,
//    country: string,
//    sunrise: number,
//    sunset: number
//   },
//   timezone?: number,
//   id?: number,
//   name?: string,
//   message?: string
// }
