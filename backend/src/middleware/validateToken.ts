import { Request, Response, NextFunction } from 'express'
import { verify } from 'jsonwebtoken'
import { secretKey } from '../config'
import { Player, isPlayer } from '../models/interfaces'
import { logger } from '../utils/logger'

export function validateToken(req: Request, res: Response, next: NextFunction) {
	if (!req.headers.authorization || !req.headers.authorization.split(' ')[1]) {
		logger.warn(`an attempt to connect to a restricted route without a token detected`)
		return res.status(403).json('no token provided')
	}
	const token = req.headers.authorization.split(' ')[1]
	verify(token, secretKey, (err, decoded: any) => {
		if (!err) {
			if (decoded && decoded.player) {
				decoded.player.password = ''
				if (isPlayer(decoded.player)) {
					req.player = decoded.player
					logger.log({ level: 'info', message: `authenticated ${req.player.name}` })
					return next()
				}
			}
		}
		logger.warn(
			`failed to authenticate. decoded: ${decoded}
			error: ${err}`,
		)
		// to be able to run tests without having to make a login call
		if (process.env.NODE_ENV === 'test' && token === 'InsaneHackerToken') {
			req.player = { name: 'anthager', id: 1, password: '' }
			return next()
		}
		return res.status(401).json('Failed to authenticate token')
	})
}
