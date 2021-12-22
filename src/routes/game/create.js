
import { addNewGame } from './_database-manager.js';

export async function post(req, res, next) {
    const gameSettings = req.body;
    const id = addNewGame();
    res.end(JSON.stringify({game_id : id}));
}