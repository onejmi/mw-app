<script>

import { tweened } from 'svelte/motion';
import { cubicOut } from 'svelte/easing';
import { onMount } from 'svelte';
import { goto } from '@sapper/app';

let code;
let invalid = false;
let fullGame = false;
let loading = false;
let shake = false;

let colorVal = tweened(Math.floor(Math.random() * 256), {
		duration: 2000,
		easing: cubicOut
	}
);

onMount(async () => {

	const interval = setInterval(() => {
		colorVal.set(Math.floor(Math.random() * 256));
	}, 2500);

	return () => clearInterval(interval);

});

async function join() {
	loading = true;
	let response = await fetch(`/game/start?code=${code}`);
	if(response.status === 200) {
		invalid = false;
		window.location.href = '/game/play';
		loading = false;
	} else if(response.status === 404 || response.status === 403) {
		if(response.status === 404) invalid = true;
		else fullGame = true;
		shake = true;
		setTimeout(() => shake = false, 1200);
		loading = false;
	}
}

// TODO handle enter (simulates pressing join)

</script>

<style>

	@keyframes shake {
		10%, 90% {
			transform: translate3d(0, -1px, 0);
		}

		20%, 80% {
			transform: translate3d(0, 2px, 0);
		}

		30%, 50%, 70% {
			transform: translate3d(0, -4px, 0);
		}

		40%, 60% {
			transform: translate3d(0, 4px, 0);
		}
	}

	.apply-shake {
		animation: shake 0.82s cubic-bezier(.36,.07,.19,.97) both;
	}

	button {
		font-size: 2em;
		margin-top: 25px;
		border-radius: 10px;
		padding: 5px;
		width: 20%;
		border: none;
		background-color: #4CAF50;
		font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
		transition: background 200ms ease-in-out;
	}

	button:hover {
		background-color: chartreuse; 
	}

	img {
		max-width: 150px;
		max-height: 130px;
		margin-bottom: 30px;
	}

	input {
		font-size: 2em;
		height: 2em;
		max-width: 5em;
		display: block;
		font-weight: bold;
		font-family: 'Permanent Marker';
	}

	#outer {
		height: 100vh;
	}

	div, input {
		text-align: center;
		margin: 0 auto;
	}

	h1 {
		font-size: 1.5em;
		text-transform: uppercase;
		font-weight: 70;
		margin: 0 0 0.5em 0;
		vertical-align: middle;
		font-family: 'Permanent Marker';
	}

	#content {
		position: relative;
		top: 20%;
	}

	@media (min-width: 480px) {
		h1 {
			font-size: 4em;
		}
	}
</style>

<svelte:head>
	<title>Majority Wins!</title>
	<link href="https://fonts.googleapis.com/css?family=Permanent+Marker&display=swap" rel="stylesheet">
</svelte:head>

<div id="outer" style="background-color: rgb({$colorVal}, {255 - $colorVal}, 190);">
	<div id="content">
		<h1>majority wins!</h1>
		<img src="main-logo.png" alt="two red people beside one blue person"/>
		<input bind:value={code} placeholder="PIN">

		{#if invalid || fullGame}
			<p class="{shake ? 'apply-shake' : ''}" style="color:red;font-weight:bold;">
				{invalid ? 'Invalid game id!' : 'Game is full!'}
			</p>
		{:else if loading}
			<div class="loader"></div>
		{/if}

		<button on:click={join}>Join!</button>
	</div>
</div>

