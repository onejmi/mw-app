let database = {
    games: [],
};

const questions = [
    {
        desc: "Best soccer player?",
        image: '',
        first: {
            desc: 'Messi',
            image: 'https://static01.nyt.com/images/2019/04/16/sports/16onsoccerweb-2/merlin_153612873_5bb119b9-8972-4087-b4fd-371cab8c5ba2-superJumbo.jpg'
        },
        second: {
            desc: 'Ronaldo',
            image: 'https://images.cdn.fourfourtwo.com/sites/fourfourtwo.com/files/styles/image_landscape/public/ronaldo_ballon_0.jpg'
        }
    },
    {
        desc: "Is winter fun?",
        image: '',
        first: {
            desc: 'Yes',
            image: ''
        },
        second: {
            desc: 'No',
            image: ''
        }
    },
    {
        desc: "How many hours do you sleep?",
        image: '',
        first: {
            desc: '4-6',
            image: ''
        },
        second: {
            desc: '7-9',
            image: ''
        }
    },
    {
        desc: "Favorite Ice cream flavour?",
        image: '',
        first: {
            desc: 'Chocolate',
            image: ''
        },
        second: {
            desc: 'Vanilla',
            image: ''
        }
    },
    {
        desc: "Is water wet?",
        image: '',
        first: {
            desc: 'yes',
            image: ''
        },
        second: {
            desc: 'no',
            image: ''
        }
    },
];

const axios = require('axios');

export function eraseGame(gameId) {
    database.games = database.games.filter(game => game.id != gameId);
}

export function nextQuestion(gameId) {
    let game = database.games.find(g => g.id == gameId);
    if(game === null) return null;
    if(game.current_question >= questions.length) {
        return null;
    }
    game.last_question_time = Date.now();
    return questions[game.current_question++];
}

export function answerQuestion(gameId, playerId, answer) {
    let game = database.games.find(g => g.id == gameId);
    let player = game.players.find(p => p.id == playerId);
    player.answer = answer;
    player.answer_time = Date.now();
}

export function resetAnswers(gameId) {
    let game = database.games.find(g => g.id == gameId);
    let players = game.players;

    for(let p in players) {
        players[p].answer = -1;
    }
}

export function updatePoints(gameId, majority) {
    let game = database.games.find(g => g.id == gameId);
    let players = game.players;

    if(majority !== -1) {
        for(let p in players) {
            if(players[p].answer === majority) {
                if(players[p].answer !== -1) {
                    let timeElapsed = Math.trunc(players[p].answer_time - game.last_question_time);
                    players[p].points += ((10000 - timeElapsed) / 10);
                }
            }
        }
    } else {
        for(let p in players) {
            if(players[p].answer !== -1) {
                let timeElapsed = game.answer_time - game.last_question_time;
                players[p].points++;
            }
        }
    }
}

export function addNewGame() {
    const gameId = Math.floor(Math.random() * 9000) + 1000;
    database.games.push({
        id : gameId,
        time_created : Date.now(),
        last_question_time : 0,
        players : [],
        current_question: 0,
        templateCode: 'classicqz'
    });

    return gameId;
}

export async function addPlayer(playerId, gameId) {
    let game = database.games.find(g => g.id == gameId);

    const response = await axios.get('http://names.drycodes.com/1?case=lower');

    let generatedName = response.data[0];

    let player = {
        id : playerId,
        name : generatedName,
        points: 0,
        answer: -1,
        answer_time: 0,
    }

    game.players.push(player);
}

export function removePlayer(playerId, gameId) {
    let game = database.games.find(g => g.id == gameId);
    if(game !== undefined) {
        game.players = game.players.filter(player => player.id != playerId);
    }
}

export function gameExists(code) {
    if(code > 999 && database.games.some(game => game.id == code)) return true;
    return false;
}

export function getPlayers(gameId) {
    return database.games.find(g => g.id == gameId).players;
}

