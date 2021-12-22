<svelte:head>
    <link href="https://fonts.googleapis.com/css?family=Permanent+Marker&display=swap" rel="stylesheet">
</svelte:head>

<script>

import { onMount } from 'svelte';
import { goto } from '@sapper/app';

export let socket;
export let gameId;
export let originalPlayer;

let currQuestion;
let answered;
let endQuestion;
let player;
let currPosition;

let lastPointCount = 0;

let gameOver = false;

onMount(() => {
    socket.on('question', function(question) {
        endQuestion = false;
        player = undefined;
        fetch(`game/api/players?game_id=${gameId}`)
            .then(response => response.json()
                .then(val => lastPointCount = val.find(p => p.id == originalPlayer.id).points));
        setTimeout(() => currQuestion = question, 3000);
    });

    socket.on('end-question', function() {
        endQuestion = true;
        currQuestion = undefined;
        fetch(`game/api/players?game_id=${gameId}`)
            .then(response => response.json()
                .then(val => {
                    let places = val.sort((pl, nextPlayer) => (pl.points > nextPlayer.points) ? 1 : -1);
                    player = places.find(p => p.id == originalPlayer.id);
                    currPosition = places.indexOf(player) + 1;
                }
            ));
        });
    });

    socket.on('end-game', () => gameOver = true);

function handleFirst() {
    socket.emit('answer', gameId, originalPlayer.id, 0);
    currQuestion = undefined;
}

function handleSecond() {
    socket.emit('answer', gameId, originalPlayer.id, 1);
    currQuestion = undefined;
}

function returnHome() {
    goto('/');
}

</script>

<style>

    .loading {
            font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
            color: whitesmoke;
            font-size: 3em;
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
    
    #restart {
        left: 31%;
    }

    @media only screen and (max-width: 600px) {
        #restart {
            left: 25%;
        }
    }

</style>

{#if !gameOver}
    {#if currQuestion}
        <div style="width: 200px; left: 10%;">
            <button style = "padding: 30px;" on:click={handleFirst}>1</button>
            <button style = "padding: 30px; margin-left: 35px;"on:click={handleSecond}>2</button>
        </div>
    {:else if endQuestion}
        {#if player}
            {#if player.points > lastPointCount}
                <p class="loading" style="text-align: center;">Nice!</p>
                <img src="checkmark.png" alt="Check-mark" style="width: 220px; height: 220px; margin-left: 7%;"/>
            {:else}
                <p class="loading" style="margin-left: 15%;">Nope!</p>
                <img src="wrong.png" alt="X" style="width: 180px; height: 180px;"/>
            {/if}
            <p style="text-align: center; font-family: 'Permanent Marker'; font-size: 1.5em; color: white;">
                {currPosition}{currPosition == 1 ? 'st' : currPosition == 2 ? 'nd' : currPosition == 3 ? 'rd' : 'th'} place
            </p>
        {:else}
            <div class="loader"></div>
        {/if}
    {:else}
        <p class="loading">Loading...</p>
    {/if}
{:else}
    <p style="text-align: center; font-family: 'Permanent Marker'; font-size: 3em; color: white;">GAME OVER</p>
    {#if currPosition || currPosition == 'undefined'}
        <p class="loading" style="font-size: 1.5em; text-align: center;">You finished {currPosition}{currPosition == 1 ? 'st' : currPosition == 2 ? 'nd' : currPosition == 3 ? 'rd' : 'th'}</p>
    {/if}
    <button id="restart" style="margin-top: 30%; position: fixed; top: 80%;" on:click={returnHome}>Again!</button>
{/if}