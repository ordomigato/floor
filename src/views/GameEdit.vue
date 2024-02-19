<template>
    <main>
        <div class="card">
            <button @click="$router.push({ name: 'games' })">
                Back to Games List
            </button>
        </div>
        <p v-if="error" class="error">{{ error.message }}</p>
        <div class="card">
            <h2>Edit Game</h2>
            <button @click="$router.push({
                name: 'game-players',
                params: {
                    id: $route.params.id
                }
            })">
                Players
            </button>
            <button @click="$router.push({
                name: 'game-categories',
                params: {
                    id: $route.params.id
                }
            })">
                Categories
            </button>
        </div>
        <div class="card">
            <DeleteSection
                text="Game"
                @delete="handleDeleteGame"
            />
        </div>
    </main>
</template>
<script setup lang="ts">
import DeleteSection from '@/components/DeleteSection.vue';
import { deleteGame } from '@/services/game';
import { ref, type Ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute()
const router = useRouter()

const error: Ref<Error | null> = ref(null)
const loading = ref(false)

const handleDeleteGame = async () => {
    loading.value = true
    error.value = null
    try {
        deleteGame(route.params.id as string)

        router.push({ name: 'games' })
    } catch (e) {
        if (e instanceof Error) {
            error.value = e
        } else {
            console.error(e)
        }
    } finally {
        loading.value = false
    }
}
</script>
