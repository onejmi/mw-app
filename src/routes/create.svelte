<svelte:head>
    <title>Create Game</title>
    <link href="https://fonts.googleapis.com/css?family=Permanent+Marker&display=swap" rel="stylesheet">
</svelte:head>

<script>

    import {fade} from 'svelte/transition';
    import io from 'socket.io-client';
    import Leaderboard from './game/component/Leaderboard.svelte';

    let code;
    let players;
    let socket;
    let started = false;
    let leaderboard = false;
    let transition = false;

    let loading;

    let currQuestion;

    let gameOver = false;

    let answerCount = 0;

    async function createGame() {
        loading = true;

        const response = await fetch('/game/create', {
            method: 'post',
            body: JSON.stringify({})
        });

        const body = await response.json();

        code = parseInt(body["game_id"]);

        socket = io('/game');
        socket.emit('admin-join', code);

        socket.on('join', function (userId) {
            fetch(`game/api/players?game_id=${code}`)
                    .then(response => response.json().then(val => players = val));
        });

        socket.on('game-leave', function (userId) {
            fetch(`game/api/players?game_id=${code}`)
                    .then(response => response.json().then(val => players = val));
        });

        loading = false;
    }

    async function disconnect() {
        socket.emit('quit', code);
    }

    async function begin() {
        socket.emit('begin', code);
        started = true;
        transition = true;

        socket.on('question', function (question) {
            setTimeout(() => {
                transition = false;
                currQuestion = question;
                setTimeout(() => next(), 10000);
            }, 3000);
        });

        socket.on('newAnswer', () => answerCount++);

        socket.on('end-game', () => gameOver = true);
    }

    async function next() {
        socket.emit('end-question', code);
        const response = await fetch(`game/api/players?game_id=${code}`)
        players = await response.json();

        players = players.sort((player, nextPlayer) => (player.points > nextPlayer.points) ? 1 : -1);

        leaderboard = true;

        setTimeout(() => {
            socket.emit('next', code);
            setTimeout(() => {
                leaderboard = false;
                transition = true;
                answerCount = 0;
            }, 200);
        }, 8000);
    }

</script>

<style>

    #outer {
        height: 100vh;
        background: #8E2DE2; /* fallback for old browsers */
        background: -webkit-linear-gradient(to right, #4A00E0, #8E2DE2); /* Chrome 10-25, Safari 5.1-6 */
        background: linear-gradient(to right, #4A00E0, #8E2DE2); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
    }

    .content {
        margin: 0 auto;
        position: absolute;
        top: 30%;
        left: 50%;
        -ms-transform: translate(-50%, -50%);
        transform: translate(-50%, -50%);
    }

    button {
        font-size: 2em;
        margin-top: 25px;
        border-radius: 10px;
        padding: 15px;
        border: none;
        background-color: #4CAF50;
        font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
        transition: background 200ms ease-in-out;
    }

    button:hover {
        background-color: chartreuse;
    }

    #code {
        font-weight: bold;
        font-family: 'Permanent Marker';
    }

    .loading {
        font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
        color: whitesmoke;
        font-size: 3em;
    }

    #question {
        font-family: 'Permanent Marker';
        color: aqua;
        font-size: 2.5em;
    }

    .option {
        font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
        color: whitesmoke;
        font-size: 1.5em;
        display: inline-block;
        margin-left: 50px;
        margin-right: 50px;
    }

    .option-image {
        width: 180px;
        height: 180px;
    }

    .chip {
        padding: 0 25px;
        font-size: 16px;
        border-radius: 25px;
        margin-top: 30px;
        font-weight: bold;
        text-align: center;
        word-wrap: break-word;
        color: aqua;
        width: 10vw;
    }

    .chip img {
        align-self: center;
        height: 50px;
        width: 50px;
        border-radius: 50%;
    }

    .wrapper {
        margin: 0 auto;
        position: absolute;
        top: 50%;
        left: 7.5%;
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        grid-gap: 5%;
        grid-auto-rows: minmax(120px, 120px);
        justify-items: center;
    }

</style>


<svelte:window on:unload={disconnect}/>

<div id="outer" style="text-align: center;">
    {#if !started}
        {#if code}
            <div transition:fade class="content">
                <h1 id="code">JOIN GAME: <span style="font-weight: 1;color:white;">{code}</span></h1>
                <button style="font-family: 'Permanent Marker'" on:click={begin}>Begin</button>
                <br>
            </div>
            <div class="wrapper">
                {#if players}
                    {#each players as player}
                        <div transition:fade class="chip">
                            <img src="https://api.adorable.io/avatars/84/{player.id}.png" alt="Player" width="96"
                                 height="96">
                            <br>
                            {player.name}
                        </div>
                    {/each}
                {/if}
            </div>
        {:else}
            <div class="content">
                {#if loading}
                    <div class="loader"></div>
                {:else}
                    <button on:click={createGame}>Start</button>
                {/if}
            </div>
        {/if}
    {:else}
        {#if !gameOver}
            {#if transition}
                <div class="content">
                    <p class="loading">Loading question...</p>
                </div>
            {:else if leaderboard}
                <Leaderboard {players}/>
            {:else}
                <div class="content" style="top: 45%;">
                    <div transition:fade class="question">
                        <div id="question">
                            <p>{currQuestion.desc}?</p> <!--TODO: make a question component and pass currQuestion.-->
                        </div>

                        <div class="option" style="vertical-align: left;">
                            <p>{currQuestion.first.desc}</p>
                            <img class="option-image"
                                 src="{currQuestion.first.image ? currQuestion.first.image : 'options_1.png'}"
                                 alt="Option 1 Image">
                        </div>

                        <div class="option" style="vertical-align: right;">
                            <p>{currQuestion.second.desc}</p>
                            <img class="option-image"
                                 src="{currQuestion.second.image ? currQuestion.second.image : 'options_2.png'}"
                                 alt="Option 2 Image">
                        </div>

                        <div>
                            <p style="color: white; margin-top: 100px; font-family: 'Permanent Marker'; font-size: 2em; text-align: center;">
                                Answers: {answerCount}</p>
                        </div>
                    </div>
                </div>
            {/if}
        {:else}
            <div class="content">
                <p style="font-family: 'Permanent Marker'; font-size: 3em; text-align: center;">GAME OVER</p>
            </div>
        {/if}
    {/if}
</div>