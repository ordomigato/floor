<template>
    <main>
        <div class="card">
            <h2>Create Game</h2>
            <label>
                <span>Game Name</span>
                <input
                    type="text"
                />
            </label>
            <button
                @click="createGame"
            >
                Create
            </button>
        </div>
    </main>
</template>
<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter()

const createGame = () => {
    // TODO
    router.push({ name: 'games' })
}
</script>
<style lang="scss" scoped>
main {
    .card {
        width: 500px;
    }
}
</style>
