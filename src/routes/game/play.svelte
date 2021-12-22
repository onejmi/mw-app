<script context="module">

export async function preload(page, { userId, gameId }) {

    if(!userId) {
        this.redirect(302, '');
    }

    return { userId, gameId };
}

</script>

<style>

    #outer {
		height: 100vh;
		background: #8E2DE2;  /* fallback for old browsers */
		background: -webkit-linear-gradient(to right, #4A00E0, #8E2DE2);  /* Chrome 10-25, Safari 5.1-6 */
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
    
    .loading {
		font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
		color: whitesmoke;
		font-size: 3em;
	}

</style>

<script>

import { onMount } from 'svelte';
import io from 'socket.io-client';
import GameView from './component/GameView.svelte';

export let userId;
export let gameId;
let player;
let socket;
let started = false;

let waitingMessage = 'Waiting';
let waitingMessageGoal = 'Waiting...';
let currIndex = 7;
let currInterval;

function updateMessage() {
    currInterval = setInterval(() => {
        if(started) clearInterval(currInterval);
        else {
            if(currIndex > 9) {
                currIndex = 7;
            } else currIndex++;
            waitingMessage = waitingMessageGoal.substring(0, currIndex);
        }
    }, 200);
}

onMount(async () => {
    socket = io('/game');

    socket.emit('join', gameId, userId);

    const response = await fetch(`game/api/players?game_id=${gameId}`);
    const players = await response.json();

    player = players.filter(p => p.id == userId)[0];

    setTimeout(() => {
        if(player === undefined) {
            window.location.href = '/';
        }
    }, 300);

    socket.on('begin', () => {
        started = true;
    });

    updateMessage();
});

function disconnect() {
    socket.emit('game-leave', gameId, userId);
}



</script>

<svelte:window on:unload={disconnect}/>

<div id="outer">
    {#if started}

    <div class="content">
        <GameView {socket} originalPlayer={player} {gameId}/>
    </div>

    {:else}
        {#if userId && player}
        
        <div class="content" style="width: 300px; left: 55%;">
            <h1 class="loading">{waitingMessage}</h1>
            <p style="font-weight: bold;">Your name is <span style="color: aqua;">{player.name}</span></p>
        </div>

        {:else}
            <div class="content" style="text-align: center;">
                <div class="loader"></div>
            </div>
        {/if}
    {/if}
</div>