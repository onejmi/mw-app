import { gameExists, addPlayer, getPlayers } from './_database-manager';

export async function get(req, res, _) {
    res.setHeader('Content-Type', 'application/json');
    if(req.query.code !== 'undefined' && gameExists(parseInt(req.query.code))) {

        if(getPlayers(parseInt(req.query.code)) != null && getPlayers(parseInt(req.query.code)).length >= 10) {
            res.statusCode = 403;
            res.end(JSON.stringify({error_message: "That game is full!"}));
        } else {
            const playerId = Math.floor(Math.random() * 10000);
            await addPlayer(playerId, parseInt(req.query.code));

            req.session.userId = playerId;
            req.session.gameId = parseInt(req.query.code);

            res.end(JSON.stringify({
                code : req.query.code,
                id : playerId
            }));
        }
    } else {
        res.statusCode = 404;
        res.end(JSON.stringify({error_message : "Invalid game ID"}));
    }
}