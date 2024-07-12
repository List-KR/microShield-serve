import * as Commander from 'commander'
import Fastly from 'fastify'

const FastlyInstance = Fastly()

FastlyInstance.get('/token', async (FRequest, FResponse) => {
  FRequest.
})