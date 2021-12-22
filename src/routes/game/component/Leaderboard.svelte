
<script>

import { fade } from 'svelte/transition';
import { onMount } from 'svelte';

export let players;
let visible;
let ready;
let showLoadingIndicator;

const avatarURL = 'https://api.adorable.io/avatars/84/';

onMount(() => {
    if(players.length > 5) {
        players = players.slice(0, 5);
    }
    players = players.reverse();
    for(let i in players) {
        players[i].loading = true;
        let img = new Image();
        img.src = avatarURL + players[i].id + '.png';
        img.onload = () => players[i].loading = false;
    }
    setTimeout(() => visible = true, 1250);
    setTimeout(() => showLoadingIndicator = true, 400);
    ready = true;
})

</script>

<style>
    td, th {
        border: 1px solid #dddddd;
        text-align: left;
        padding: 8px;
    }

    .profile-picture {
        width: 64px;
        height: 64px;
    }

    .content {
        margin: 0 auto;
        position: absolute;
        top: 30%;
        left: 50%;
        -ms-transform: translate(-50%, -50%);
        transform: translate(-50%, -50%);
    }
</style>

{#if visible}
    <div style="margin: 0 auto; width: 500px;" in:fade>
        {#if ready}
            {#if players.length > 0}
                <table style="margin-top: 75px; align-self: center; margin-left: 20%;">
                    <tr>
                        <th>Rank</th>
                        <th>Profile</th>
                        <th>Name</th>
                        <th>Points</th>
                    </tr>
                    {#each players as player, index}
                        <tr>
                            <td>
                                <h3>{index + 1}</h3>
                            </td>
                            <td>
                                {#if player.loading}
                                    <div class="loader"></div>
                                {:else}
                                    <img src="{avatarURL}{player.id}.png" alt="Profile Picture" class="profile-picture">
                                {/if}
                            </td>
                            <td>
                                <p style="color: white; font-weight: bold;">{player.name}</p>
                            </td>
                            <td>
                                <p style="color: white; font-weight: bold;">{player.points}</p>
                            </td>
                        </tr>
                    {/each}
                </table>
            {/if}
        {:else}
            <p style="color: white;">Loading...</p>
        {/if}
    </div>
{:else}
    {#if showLoadingIndicator}
        <div class="content">
            <div class="loader"></div>
        </div>
    {/if}
{/if}