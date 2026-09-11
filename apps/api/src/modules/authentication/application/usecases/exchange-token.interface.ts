import { ExchangeTokenInputDto } from '../dto'
import { ExchangeTokenOutputDto } from '../dto/exchange-token.output.dto'

export interface IExchangeTokenUseCase {
  execute(input: ExchangeTokenInputDto): Promise<ExchangeTokenOutputDto>
}

export const EXCHANGE_TOKEN = Symbol('IExchangeTokenUseCase')
