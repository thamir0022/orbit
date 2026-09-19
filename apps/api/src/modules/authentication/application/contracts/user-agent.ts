import { IBrowser, IOS, IDevice } from 'ua-parser-js'

export interface UserAgent {
  device: IDevice
  browser: IBrowser
  os: IOS
}
