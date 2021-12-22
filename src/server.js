import sirv from 'sirv';
import polka from 'polka';
import compression from 'compression';
import * as sapper from '@sapper/server';

import * as socketManager from './sockets/socket-manager.js';

let session = require('express-session');
let sockets = require('socket.io');
const http = require('http');

const { PORT, NODE_ENV } = process.env;
const dev = NODE_ENV === 'development';

const server = http.createServer();

polka({ server })
	.use(session({secret: "some_secret", saveUninitialized: true, resave: true})) // You can also use Express
	.use(
		compression({ threshold: 0 }),
		sirv('static', { dev }),
		sapper.middleware({
			session: (req, _) => (
				{
					userId: req.session.userId,
					gameId: req.session.gameId
				}
				)
		})
	)
	.listen(PORT, err => {
		if (err) console.log('error', err);
	});
	
const io = sockets(server);
socketManager.setup(io);