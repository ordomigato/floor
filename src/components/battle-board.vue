<template>
    <div :class="`battle-board ${skipped ? 'skipped' : ''}`">
        <div v-if="questions.length && !finished" :class="`image-container ${showAnswer ? 'flipped' : ''}`">
            <div class="image-card">
                <div class="image-front">
                    <img v-if="started" :src="questions[questionIndex].image" />
                    <h2 v-else>Ready?</h2>
                </div>
                <div class="image-back">
                    <p v-if="showAnswer">{{questions[questionIndex].answer}}</p>
                </div>
            </div>
        </div>
        <div v-else class="winner-card">
            <div v-if="winner">
                <p>Winner</p>
                <h2>
                    {{ playerStore.getPlayer(winner)?.name }}
                </h2>
                <button
                    @click="submitWinner"
                >
                    Complete Round
                </button>
            </div>
            <h2 v-else>It's a Tie!</h2>
        </div>
        <footer>
            <div class="time-state">
                <p>TIME</p>
                <p class="state">{{timerState}}</p>
            </div>
            <div class="player-columns">
                <div
                    :class="`player-info ${selectedPlayer === 'playerA' ? 'selected' : ''}`"
                    @click="() => setSelectedPlayer('playerA')"
                >
                    {{ playerAComputedTime }}
                    <span class="player-name">({{ playerStore.getPlayer(playerStore.selectedPlayer)?.name }})</span>
                </div>
                <div
                    :class="`player-info ${selectedPlayer === 'playerB' ? 'selected' : ''}`"
                    @click="() => setSelectedPlayer('playerB')"
                >
                    <span class="player-name">({{ playerStore.getPlayer(playerStore.selectedChallenger)?.name }})</span>
                    {{ playerBComputedTime }}
                </div>
            </div>
        </footer>
    </div>
</template>
<script setup lang="ts">
import { db } from '@/services/firebase';
import { useGameSquareStore } from '@/stores/gameSquareStore';
import { usePlayerStore } from '@/stores/playerStore';
import type { IGameSquare } from '@/types';
import { doc, updateDoc } from 'firebase/firestore';
import { computed, onMounted, ref, type Ref } from 'vue';
import { useRoute } from 'vue-router';

interface IQuestion {
    image: string
    answer: string
}

enum Controls {
    correct = 'ArrowRight',
    skip = 'ArrowUp',
    pause = ' ',
    start = 's',
    stop = 'x',
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
    },
    {
        image: 'https://akns-images.eonline.com/eol_images/Entire_Site/20151019/rs_1024x759-151119101713-1024-married-the-children-cast.jpg?fit=around%7C1024:759&output-quality=90&crop=1024:759;center,top',
        answer: 'Married With Childen'
    },
    {
        image: 'https://cdn.abcotvs.com/dip/images/977594_091015-cc-Fresh-Prince-Thumb.jpg  ',
        answer: 'Fresh Prince'
    },
    {
        image: 'https://www.usmagazine.com/wp-content/uploads/2021/05/3rd-Rock-From-Sun-Cast-Where-Are-They-Now-Landing.jpg?quality=78&strip=all',
        answer: '3rd Rock'
    },
] as IQuestion[]

const defaultTime = 1000 * 30

const playerStore = usePlayerStore()
const squareStore = useGameSquareStore()
const route = useRoute()

const emit = defineEmits(['complete'])

const questions: Ref<IQuestion[]> = ref([])
const questionIndex = ref(0)
const showAnswer = ref(false)
const started = ref(false)
const skipped = ref(false)

const millisToMinutesAndSeconds = (millis: number) => {
  var minutes = Math.floor(millis / 60000);
  var seconds = parseInt(((millis % 60000) / 1000).toFixed(0));
  return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}

// 0 is player 1, 1 is player 2
const selectedPlayer: Ref<Players> = ref('playerA')

const playerATime = ref(defaultTime)
const playerBTime = ref(defaultTime)
const winner: Ref<string | null> = ref(null)
const loser: Ref<string | null> = ref(null)
const finished = ref(false)

const playerAComputedTime = computed(() => {
    return millisToMinutesAndSeconds(playerATime.value)
})

const playerBComputedTime = computed(() => {
    return millisToMinutesAndSeconds(playerBTime.value)
})

let timer: NodeJS.Timeout | null = null
const timerState: Ref<TimerState> = ref(TimerState.stopped)

const startTimer = () => {
    if (finished.value) {
        return
    }
    started.value = true
    if (timer) {
        return
    }
    timerState.value = TimerState.started
    if (!selectedPlayer.value) {
        return
    }
    timer = setInterval(() => {
        if (selectedPlayer.value === 'playerA') {
            if (playerATime.value <= 0) {
                handleComplete()
                return
            } else if (playerATime.value > 0) {
                playerATime.value = playerATime.value - 100
            }
        }
        if (selectedPlayer.value === 'playerB') {
            if (playerBTime.value <= 0) {
                handleComplete()
                return
            } else if (playerBTime.value > 0) {
                playerBTime.value = playerBTime.value - 100
            }
        }
    }, 100)
}

const pauseTimer = () => {
    timerState.value = TimerState.paused
    if (timer) clearInterval(timer)
    timer = null
}

const resetGame = () => {
    pauseTimer()
    playerATime.value = defaultTime
    playerBTime.value = defaultTime
    questionIndex.value = 0
    showAnswer.value = false
    started.value = false
    finished.value = false
    winner.value = null
    loser.value = null
}

const handleComplete = () => {
    pauseTimer()
    if (playerATime.value === playerBTime.value) {
        // do nothing
    } else if (playerATime.value > playerBTime.value) {
        winner.value = playerStore.selectedPlayer
        loser.value = playerStore.selectedChallenger
    } else {
        winner.value = playerStore.selectedChallenger
        loser.value = playerStore.selectedPlayer
    }
    finished.value = true
}

const setSelectedPlayer = (p: Players) => {
    selectedPlayer.value = p
}

const handleSkip = () => {
    if (showAnswer.value || !started.value || finished.value) {
        return
    } else {
        showAnswer.value = true
        skipped.value = true
        setTimeout(() => {
            showAnswer.value = false
            nextQuestion()
            skipped.value = false
        }, 3000)
    }
}

const nextQuestion = () => {
    if (questions.value.length - 1 > questionIndex.value) {
        questionIndex.value++
    } else {
        pauseTimer()
        handleComplete()
        return
    }
    startTimer()
}

const handleCorrect = () => {
    if (!started.value || finished.value) {
        return
    }
    if (!showAnswer.value) {
        // pause all time
        pauseTimer()
        showAnswer.value = true 
    } else {
        // start next round
        showAnswer.value = false
        setSelectedPlayer(selectedPlayer.value === 'playerA' ? 'playerB' : 'playerA')
        nextQuestion()
    }
}

const submitWinner = () => {
    try {
        // step 1: Winner takes over losers squares / replacing category id with winner's category id.
        // step 2: Save new game board to db
        if (!winner.value) {
            throw new Error('winner does not exist')
        }
        if (!loser.value) {
            throw new Error('loser does not exist')
        }
        const winnerPlayer = playerStore.getPlayer(winner.value)
        if (!winnerPlayer) {
            throw new Error('winner player data not found')
        }
        if (!winnerPlayer.catId) {
            throw new Error("winner's category could not be found")
        }
        const newSquareData = squareStore.squares.map((s: IGameSquare) => {
            if (s.playerId === loser.value) {
                return {
                    ...s,
                    playerId: winnerPlayer.id,
                    categoryId: winnerPlayer.catId
                }
            } else {
                return s
            }
        })

        // save to db
        const gameRef = doc(db, "games", route.params.id as string)

        updateDoc(gameRef, {
            save: {
                board: newSquareData,
            }
        })
        // set locally
        squareStore.setSquares(newSquareData)

        emit('complete')
    } catch (e) {
        console.error(e)
    }
}

const keyController = (e: KeyboardEvent) => {
    switch (e.key) {
    case Controls.correct:
        // Correct!
        handleCorrect()
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
        handleSkip()
        break
    case Controls.reset:
        // Reset times
        resetGame()
        break
    }
}

onMounted(() => {
    pauseTimer()
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
    &.skipped {
        .player-info.selected {
            background-color: red !important;
        }
    }
    .winner-card {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 600px;
        text-align: center;
    }
    .image-container {
        padding: 1rem;
        // border: 10px solid white;
        // border-radius: 10px;
        height: 600px;
        perspective: 1000px;
        .image-card {
            position: relative;
            width: 100%;
            height: 100%;
            text-align: center;
            transition: transform 0.5s;
            transform-style: preserve-3d;
            .image-front,
            .image-back {
                position: absolute;
                width: 100%;
                height: 100%;
                -webkit-backface-visibility: hidden;
                backface-visibility: hidden;
                top: 0;
                bottom: 0;
            }
            .image-back {
                transform: rotateY(180deg);
                background-color: white;
                color: var(--font-color-dark);
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 600;
                font-size: 2rem;
            }   
            .image-front {
                display: flex;
                align-items: center;
                justify-content: center;
                img {
                    object-fit: cover;
                    width: 100%;
                    height: 100%;
                    // overflow: hidden;
                    box-shadow: 0 12px 32px rgba(0,0,0,0.2);
                    border: 20px solid white;
                    perspective: 1000px;
                }
            }
        }
        &.flipped {
            .image-card {
                transform: rotateY(-180deg);
            }
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

        .player-columns {
            width: 100%;
            display: flex;
            justify-content: space-between;
            .player-info {
                display: flex;
                align-items: center;
                gap: 1rem;
                padding: 1rem 2rem;
                width: 100%;
                font-weight: 700;
                cursor: pointer;
                &.selected {
                    background-color: var(--yellow-color);
                    color: var(--font-color-dark)
                }
                &:nth-child(1) {
                    border-radius: 10px 0 0 0;
                }
                &:nth-child(2) {
                    border-radius: 0 10px 0 0;
                    justify-content: flex-end;
                }
            }
            .player-name {
                font-size: 1rem;
            }
        }
    }
}
</style>