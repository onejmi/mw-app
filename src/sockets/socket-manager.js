
import { removePlayer, answerQuestion, nextQuestion, getPlayers, 
    updatePoints, resetAnswers, eraseGame } from '../routes/game/_database-manager.js';


export function setup(io) {
    const gameIO = io.of('/game');
    gameIO.on('connection', function (socket) {
        socket.on('join', function(gameId, userId) {
            const id = getId(gameId);
            if(getPlayers(gameId) != null && getPlayers(gameId).length < 10) {
                socket.join(id, () => socket.broadcast.to(id).emit('join', userId));
            }
        });

        socket.on('admin-join', function(gameId) {
            const id = getId(gameId);
            socket.join(id);
        });

        socket.on('game-leave', function(gameId, userId) {
            removePlayer(userId, gameId);
            const id = getId(gameId);
            socket.broadcast.to(id).emit('game-leave', userId);
        });

        socket.on('begin', function (gameId) {
            socket.broadcast.to(getId(gameId)).emit('begin');
            setTimeout(() => {
                gameIO.in(getId(gameId)).emit('question', nextQuestion(gameId));
            }, 5000);
        });

        socket.on('next', function(gameId) {
            const question = nextQuestion(gameId);
            resetAnswers(gameId);
            if(question != null) {
                gameIO.in(getId(gameId)).emit('question', question);
            } else {
                //end game logic
                eraseGame(gameId);
                gameIO.in(getId(gameId)).emit('end-game');
            }
        });

        socket.on('quit', function(gameId) {
            eraseGame(gameId);
            gameIO.in(getId(gameId)).emit('end-game');
        });

        socket.on('answer', function(gameId, playerId, answer) {
            answerQuestion(gameId, playerId, answer);
            socket.broadcast.to(getId(gameId)).emit('newAnswer');
        });

        socket.on('end-question', function(gameId) {
            //do calc logic, update players etc.
            const majority = getMajority(gameId);
            updatePoints(gameId, majority);
            socket.broadcast.to(getId(gameId)).emit('end-question');
        });
    });
}

function getId(gameId) {
    return `match-${gameId}`;
}

function getMajority(gameId) {
    const length = getPlayers(gameId).length;
    const notAnswered = getPlayers(gameId).filter(p => p.answer === -1).length;
    const firstCount = getPlayers(gameId).filter(p => p.answer === 0).length;

    if(firstCount > ((length / 2) - notAnswered)) {
        return 0;
    } else if (firstCount < ((length / 2) - notAnswered)) return 1;
    return -1;
}