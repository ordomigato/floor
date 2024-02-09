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
                @click="createGame"
            >
                Create
            </button>
            {{ error }}
        </div>
    </main>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { db, auth } from '@/services/firebase';
import { doc, setDoc } from "firebase/firestore"; 
import { v4 as uuidv4 } from 'uuid';

import { useRouter } from 'vue-router';

const router = useRouter()

const gameName = ref('')

const error = ref('')

const createGame = async () => {
    try {
        if (!auth.currentUser) {
            throw new Error('User is not logged in')
        }

        if (!gameName.value) {
            throw new Error('Please enter a name for your game')
        }

        await setDoc(doc(db, "games", uuidv4()), {
            name: gameName.value,
            owner_id: auth.currentUser.uid,
        });

        router.push({ name: 'games' })
    } catch (e) {
        if (e instanceof Error) {
            error.value = e.message
        } else {
            console.error(e)
        }
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
