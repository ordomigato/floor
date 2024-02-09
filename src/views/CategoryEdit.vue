<template>
    <main>
        <div class="card">
            <button
                @click="$router.push({ name: 'game-categories', params: {id: $route.params.id}})"
            >
                Back to Categories
            </button>
        </div>
        <div class="card">
            <label>
                <span>Answer</span>
                <input
                    type="text"
                    v-model="answer"
                />
            </label>
            <label>
                <span>Upload Image</span>
                <input @change="handleImage" type="file" id="img" name="img" accept="image/*">
            </label>
            <button
                @click="addQuestion"
            >Add Question</button>
            <table>
                <thead>
                    <tr>
                        <th>Answer</th>
                        <th>Pic</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="question in questions" :key="question.id">
                        <th>{{ question.answer }}</th>
                        <th>
                            <img class="question-thumbnail" :src="question.imgUrl" >
                        </th>
                    </tr>
                </tbody>
            </table>
        </div>
        <div class="card">
            <button
                @click="deleteCategory"
            >
                Delete Category
            </button>
        </div>
    </main>
</template>

<script setup lang="ts">
import { auth, db, storage } from '@/services/firebase';
import type { IQuestion } from '@/types';
import { addDoc, collection, deleteDoc, doc, getDocs, query } from 'firebase/firestore';
import { ref as fbref, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import { onMounted, ref, type Ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute()
const router = useRouter()

const image: Ref<File | undefined> = ref()
const answer = ref('')
const questions: Ref<IQuestion[]> = ref([])

const handleImage = (e) => {
    image.value = e.target.files[0]
}

const getQuestions = async () => {
    try {
        if (!auth.currentUser) {
            throw new Error("User not logged in")
        }
        
        const catCollection = collection(db, "games", route.params.id as string, "categories", route.params.catId as string, "questions")

        const q = query(catCollection);

        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            console.log(doc.data())
            questions.value.push({
                id: doc.id,
                ...doc.data()
            } as IQuestion)
        });
    } catch (e) {
        console.error(e)
    }
}

const addQuestion = async () => {
    try {
        if (!auth.currentUser) {
            throw new Error("User not logged in")
        }
        if (!image.value) {
            throw new Error("Please set image")
        }

        console.log(image.value)

        const { name, type } = image.value

        console.log(name, type)
        const storageRef = fbref(storage, 'images/' + name)
        const uploadTask = uploadBytesResumable(storageRef, image.value, {
            contentType: type
        })

        uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          console.log('Upload is ' + progress + '% done')
        },
        (error) => {
          console.log(error)
        },
        () => {
          // successful upload. get url ...
          getDownloadURL(uploadTask.snapshot.ref).then(async(downloadURL) => {
            // ... make a data to write ...
            const question = {
                answer: answer.value,
                imgUrl: downloadURL
            }

            const gameId = route.params.id as string
            const catId = route.params.catId as string

            // ... and call a fn that writes a document to a firestore
            const catCollection = collection(db, "games", gameId, "categories", catId, "questions")

            const doc = await addDoc(catCollection, question)

            questions.value.push({
                id: doc.id,
                ...question
            })
          })
        }
      )
    } catch (e) {
        console.error(e)
    }
}

const deleteCategory = async () => {
    try {
        if (!auth.currentUser) {
            throw new Error("User not logged in")
        }

        const catRef = doc(db, "games", route.params.id as string, "categories", route.params.catId as string)

        await deleteDoc(catRef);

        router.push({ name: 'game-categories', params: { id: route.params.id } })
    } catch (e) {
        console.error(e)
    }
}

onMounted(() => {
    getQuestions()
})
</script>

<style scoped>
.question-thumbnail {
    margin-left: auto;
    height: 100px;
    width: 100px;
    object-fit: cover;
}

</style>