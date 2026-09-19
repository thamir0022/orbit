import { UAParser } from 'ua-parser-js'
import { UserAgent } from '../../application/contracts'
import { IUserAgentParserService } from '../../application/ports/user-agent-parser.interface'

export class UserAgentParserService implements IUserAgentParserService {
  parse(userAgent: string): UserAgent {
    const { browser, os, device } = UAParser(userAgent)

    return { browser, os, device }
  }
}
