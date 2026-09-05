import type { IncomingMessage, ServerResponse } from 'http'
import { createServer } from '../server/index.ts'

const handler = createServer()

export default async function (req: IncomingMessage, res: ServerResponse) {
  return new Promise<void>((resolve) => {
    handler(req, res, () => resolve())
  })
}
