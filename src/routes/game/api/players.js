import { getPlayers, gameExists } from '../_database-manager.js';

export async function get(req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    if(req.query.game_id !== undefined && req.query.game_id != 'undefined' && req.query.game_id.length > 0) {
        const gameId = parseInt(req.query.game_id);
        if(gameExists(gameId)) {
            const players = getPlayers(gameId);
            res.end(JSON.stringify(players));
        }
        else {
            res.statusCode = 404;
            res.end(JSON.stringify({error_message : "That game does not exist"}));
        }
    } else {
        res.statusCode = 404;
        res.end(JSON.stringify({error_message : "Invalid game id"}));
    }
}