import { gameExists, removePlayer } from '../../_database-manager.js';

export function del(req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    if(req.query.game_id != 'undefined' && gameExists(req.query.game_id)) {
        removePlayer(req.query.user_id, req.query.game_id);
        res.end(JSON.stringify({status: "Successfully attempted removal of player."}));
    } else {
        res.statusCode = 404;
        res.end(JSON.stringify({error_message: "Invalid game id."}));
    }
}