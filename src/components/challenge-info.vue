<template>
    <div class="challenge-info">
        <h3>{{ getCategory(props.battleInfo.categoryId)?.name }}</h3>
        <p><strong>{{ getPlayer(props.battleInfo.playerAId)?.name }}</strong></p>
        <p>VS</p>
        <p><strong>{{ getPlayer(props.battleInfo.playerBId)?.name }}</strong></p>
        <button class="w-100" @click="onBegin">Start</button>
        <button class="w-100" @click="onCancel">Cancel</button>
    </div>
</template>
<script setup lang="ts">
import { useCategoryStore } from '@/stores/categoryStore';
import { usePlayerStore } from '@/stores/playerStore';
import type { IBattleData } from '@/types';
import { storeToRefs } from 'pinia';

const playerStore = usePlayerStore()
const categoryStore = useCategoryStore()

const { getPlayer } = storeToRefs(playerStore)
const { getCategory } = storeToRefs(categoryStore)

const props = defineProps({
    battleInfo: {
        type: Object as () => IBattleData,
        required: true
    }
})

const emit = defineEmits(['cancel', 'begin'])

const onCancel = () => {
    emit('cancel')
}

const onBegin = () => {
    emit('begin')
}
</script>
<style lang="scss" scoped>
.challenge-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    button {
        margin-top: 1rem;
    }
}
</style>
