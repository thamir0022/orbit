import { UserAgent } from '../contracts'

export interface IUserAgentParserService {
  parse(userAgent: string): UserAgent
}

export const USER_AGENT_PARSER = Symbol('IUserAgentParserService')
