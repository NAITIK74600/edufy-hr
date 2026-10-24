import { Router } from 'express'

const router = Router()

router.get('/health', (request, response) => {
  response.json({ success: true, data: { service: 'edufyi-hr-api', status: 'ok' } })
})

export default router
