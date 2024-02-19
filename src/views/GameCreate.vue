<template>
    <main>
        <div class="card">
            <h2>Create Game</h2>
            <label>
                <span>Game Name</span>
                <input
                    type="text"
                    v-model="gameName"
                />
            </label>
            <button
                @click="handleCreateGame"
            >
                Create
            </button>
            <p v-if="error" class="error">{{ error.message }}</p>
        </div>
    </main>
</template>
<script setup lang="ts">
import { ref, type Ref } from 'vue';
import { auth } from '@/services/firebase';


import { useRouter } from 'vue-router';
import { createGame } from '@/services/game';

const router = useRouter()

const gameName = ref('')

const error: Ref<Error | null> = ref(null)
const loading = ref(false)

const handleCreateGame = async () => {
    loading.value = true
    error.value = null
    try {
        if (!auth.currentUser) {
            throw new Error('User is not logged in')
        }

        if (!gameName.value) {
            throw new Error('Please enter a name for your game')
        }

        await createGame(gameName.value, auth.currentUser.uid)

        router.push({ name: 'games' })
    } catch (e) {
        if (e instanceof Error) {
            error.value = e
        } else {
            console.error(e)
        }
    } finally {
        loading
    }
}
</script>
<style lang="scss" scoped>
main {
    .card {
        width: 500px;
        margin: 1rem auto;
    }
}
</style>
