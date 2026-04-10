import { Router } from 'express'
import { logger } from './shared/logger'
import { IAnalyticsRepository } from './infrastructure/db/analytics-repository'

export function createAnalyticsRoutes(repository: IAnalyticsRepository) {
  const router = Router()

  // Track event
  router.post('/events', async (req, res) => {
    try {
      const { event, userId, data } = req.body

      if (!event || !userId) {
        return res.status(400).json({
          error: 'event and userId are required',
        })
      }

      const analyticsEvent = await repository.trackEvent({
        event,
        userId,
        data,
        timestamp: new Date(),
      })

      logger.info({ event, userId }, 'Event tracked')
      res.status(201).json(analyticsEvent)
    } catch (error) {
      logger.error({ error }, 'Error tracking event')
      res.status(500).json({ error: 'Failed to track event' })
    }
  })

  // Get event analytics
  router.get('/events/:userId', async (req, res) => {
    try {
      const { userId } = req.params

      const events = await repository.getEventsByUser(userId)

      res.status(200).json(events)
    } catch (error) {
      logger.error({ error }, 'Error fetching events')
      res.status(500).json({ error: 'Failed to fetch events' })
    }
  })

  return router
}
