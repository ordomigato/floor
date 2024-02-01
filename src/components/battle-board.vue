<template>
    <div class="battle-board">
        <div class="image-container" v-if="questions.length">
            <img :src="questions[questionIndex].image" />
        </div>
        <footer>
            <div class="player-info">{{ playerAComputedTime }} <span class="player-name">({{ playerStore.getPlayer(playerStore.selectedPlayer)?.name }})</span></div>
            <div class="time-state">
                <p>TIME</p>
                <p class="state">{{timerState}}</p>
            </div>
            <div class="player-info"><span class="player-name">({{ playerStore.getPlayer(playerStore.selectedChallenger)?.name }})</span>{{ playerBComputedTime }}</div>
        </footer>
    </div>
</template>
<script setup lang="ts">
import { usePlayerStore } from '@/stores/playerStore';
import { computed, onMounted, ref, type Ref } from 'vue';

interface IQuestion {
    image: string
    answer: string
}

enum Controls {
    correct = 'c',
    skip = 'k',
    pause = 'p',
    start = 's',
    stop = ' ',
    reset = 'r',
}

enum TimerState {
    stopped = 'Stopped',
    paused = 'Paused',
    started = 'Started',
}

type Players = 'playerA' | 'playerB'

const q = [
    {
        image: 'https://people.com/thmb/CaGmnUJZ5CTru3-l9fRiKKkDTSM=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc():focal(599x0:601x2)/bob-saget-06-cd12af74624741a5bc8c8a061b180d33.jpg',
        answer: 'Full House'
    }
] as IQuestion[]

const defaultTime = 1000 * 30

const playerStore = usePlayerStore()

const questions: Ref<IQuestion[]> = ref([])
const questionIndex = ref(0)

const millisToMinutesAndSeconds = (millis: number) => {
  var minutes = Math.floor(millis / 60000);
  var seconds = parseInt(((millis % 60000) / 1000).toFixed(0));
  return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}

// 0 is player 1, 1 is player 2
const selectedPlayer: Ref<Players> = ref('playerA')

const playerATime = ref(defaultTime)
const playerBTime = ref(defaultTime)

const playerAComputedTime = computed(() => {
    return millisToMinutesAndSeconds(playerATime.value)
})

const playerBComputedTime = computed(() => {
    return millisToMinutesAndSeconds(playerBTime.value)
})

let timer: number | null = null
const timerState: Ref<TimerState> = ref(TimerState.stopped)

const startTimer = () => {
    if (timer) {
        return
    }
    timerState.value = TimerState.started
    if (!selectedPlayer.value) {
        return
    }
    timer = setInterval(() => {
        if (selectedPlayer.value === 'playerA') {
            playerATime.value = playerATime.value - 100
            if (playerATime.value <= 1) {
                stopTimer()
                return
            }
        }
        if (selectedPlayer.value === 'playerB') {
            playerBTime.value = playerBTime.value - 100
            if (playerBTime.value <= 1) {
                stopTimer()
                return
            }
        }
    }, 100)
}

const stopTimer = () => {
    timerState.value = TimerState.stopped
    if (timer) clearInterval(timer)
    timer = null
}

const pauseTimer = () => {
    timerState.value = TimerState.paused
    if (timer) clearInterval(timer)
    timer = null
}

const resetTimes = () => {
    playerATime.value= defaultTime
    playerBTime.value = defaultTime
}

const skipQuestion = () => {

}

const keyController = (e: KeyboardEvent) => {
    switch (e.key) {
    case Controls.correct:
        // Correct!
        stopTimer()
        break
    case Controls.pause:
        // Pause
        pauseTimer()
        break
    case Controls.start:
        // Start
        startTimer()
        break
    case Controls.skip:
        // Skip
        skipQuestion()
        break
    case Controls.stop:
        // Stop
        stopTimer()
        break
    case Controls.reset:
        // Reset times
        resetTimes()
        break
    }
}

onMounted(() => {
    stopTimer()
    questions.value = q
    document.addEventListener( "keydown", keyController );
})
</script>
<style lang="scss" scoped>
.battle-board {
    position: relative;
    width: 750px;
    padding: 1rem;
    background-color: var(--primary-color);
    .image-container {
        padding: 1rem;
        // border: 10px solid white;
        // border-radius: 10px;
        img {
            object-fit: cover;
            width: 100%;
            height: 100%;
            // overflow: hidden;
            box-shadow: 0 12px 32px rgba(0,0,0,0.2);
            border: 20px solid white;
        }
    }
    footer {
        position: fixed;
        max-width: 1000px;
        bottom: 0;
        left: 0;
        right: 0;
        margin: 0 auto;
        display: flex;
        align-items: center;
        justify-content: space-between;
        background-color: var(--primary-color-light);
        padding: 1rem 2rem;
        border-radius: 10px 10px 0 0;
        font-size: 2rem;
        box-shadow: 0 12px 32px rgba(0,0,0,0.2);
        p {
            padding: 0;
            margin: 0;
        }
        .time-state {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background-color: var(--primary-color);
            height: 150px;
            width: 150px;
            border-radius: 100px;
            box-shadow: 0 12px 32px rgba(0,0,0,0.2);
            .state {
                font-size: 1rem;
            }
        }
        .player-info {
            display: flex;
            align-items: center;
            gap: 1rem;
        }
        .player-name {
            font-size: 1rem;
        }
    }
}
</style>