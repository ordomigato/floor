<template>
    <div :class="`battle-board ${skipped ? 'skipped' : ''}`">
        <div v-if="questions.length && !finished" :class="`image-container ${showAnswer ? 'flipped' : ''}`">
            <div class="image-card">
                <div class="image-front">
                    <img v-if="started" :src="questions[questionIndex].img?.src" />
                    <div v-else>
                        <h2>Ready?</h2>
                        <p>Questions: {{ questions.length }}</p>
                    </div>
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
import { getQuestions } from '@/services/game';
import { useCategoryStore } from '@/stores/categoryStore';
import { useGameSquareStore } from '@/stores/gameSquareStore';
import { usePlayerStore } from '@/stores/playerStore';
import type { IGameSquare, IQuestion } from '@/types';
import { doc, updateDoc } from 'firebase/firestore';
import { computed, onMounted, onUnmounted, ref, type Ref } from 'vue';
import { useRoute } from 'vue-router';

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

const defaultTime = 1000 * 5

const playerStore = usePlayerStore()
const squareStore = useGameSquareStore()
const categoryStore = useCategoryStore()
const route = useRoute()

const emit = defineEmits(['complete'])

const questions: Ref<IQuestion[]> = ref([])
const questionIndex = ref(0)
const showAnswer = ref(false)
const started = ref(false)
const skipped = ref(false)

const millisToMinutesAndSeconds = (millis: number) => {
  var minutes = Math.floor(millis / 60000);
  var seconds = (millis / 1000 | 0) % 60
  const mil = (millis / 10 | 0).toString().slice(-2)
  return minutes + ":" + (seconds < 10 ? '0' : '') + seconds + ':' + mil;
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
let timerLastUpdate: Ref<number | null> = ref(null)

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
    timerLastUpdate.value = null
    console.log(playerATime.value)
    timer = setInterval(() => {
        const now = Date.now()
        const dt = timerLastUpdate.value ? now - timerLastUpdate.value : 0
        timerLastUpdate.value = now;
        if (selectedPlayer.value === 'playerA') {
            const newTime = playerATime.value - dt
            if (playerATime.value <= 0) {
                handleComplete()
                return
            } else if (playerATime.value > 0) {
                if (newTime <= 0) {
                    playerATime.value = 0
                } else {
                    playerATime.value = newTime
                }
            }
        }
        if (selectedPlayer.value === 'playerB') {
            const newTime = playerBTime.value - dt
            if (playerBTime.value <= 0) {
                handleComplete()
                return
            } else if (playerBTime.value > 0) {
                if (newTime <= 0) {
                    playerBTime.value = 0
                } else {
                    playerBTime.value = newTime
                }
            }
        }
    }, 50)
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
        const loserPlayer = playerStore.getPlayer(loser.value)
        if (!winnerPlayer) {
            throw new Error('winner player data not found')
        }
        if (!loserPlayer) {
            throw new Error("winner's category could not be found")
        }
        const unplayedCatId = categoryStore.selectedCategory === winnerPlayer.catId ? loserPlayer.catId : winnerPlayer.catId
        const newSquareData = squareStore.squares.map((s: IGameSquare) => {
            if (s.playerId === loser.value) {
                return {
                    ...s,
                    playerId: winnerPlayer.id,
                    categoryId: unplayedCatId
                }
            } else if (s.playerId === winner.value) {
                return {
                    ...s,
                    categoryId: unplayedCatId
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
    let key = e.key.toLowerCase()

    if (e.key === Controls.skip || e.key === Controls.correct) {
        key = e.key
    }
    switch (key) {
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

const handleGetQuestions = async () => {
    try {
        const q = await getQuestions(route.params.id as string, categoryStore.selectedCategory)
        console.log(q)
        questions.value = q.map(q => {
            const img = new Image()
            img.src = q.imgUrl
            return {
                ...q,
                img,
            }
        })
    } catch (e) {
        console.error(e)
    }
}

onMounted(async () => {
    pauseTimer()
    await handleGetQuestions()
    document.addEventListener("keydown", keyController);
})

onUnmounted(() => {
    document.removeEventListener("keydown", keyController);
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