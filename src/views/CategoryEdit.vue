<template>
    <main>
        <div class="card">
            <button
                @click="$router.push({ name: 'game-categories', params: {id: $route.params.id}})"
            >
                Back to Categories
            </button>
        </div>
        <div class="card" v-if="category">
            <h2>Category Info</h2>
            <label>
                <span>Name</span>
                <input
                    type="text"
                    v-model="catName"
                />
            </label>
            <button
                @click="saveCat"
                :disabled="catName === category.name"
            >
                Save
            </button>
        </div>
        <div class="card">
            <h3>Questions</h3>
            <table>
                <thead>
                    <tr>
                        <th>Answer</th>
                        <th>Pic</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="question in questions" :key="question.id">
                        <th>{{ question.answer }}</th>
                        <th>
                            <img class="question-thumbnail" :src="question.imgUrl" >
                        </th>
                        <th>
                            <button
                                @click="() => deleteQuestion(question.id)"
                            >
                                Delete
                            </button>
                        </th>
                    </tr>
                </tbody>
            </table>
            <h3>Add New Question</h3>
            <label>
                <span>Answer</span>
                <input
                    type="text"
                    v-model="answer"
                />
            </label>
            <div>
                <label class="radio-btn">
                    <input
                        type="radio"
                        v-model="imageType"
                        value="url"
                    />
                    <span>URL</span>
                </label>
                <label class="radio-btn">
                    <input
                        type="radio"
                        v-model="imageType"
                        value="upload"
                    />
                    <span>Upload</span>
                </label>
            </div>
            <label v-if="imageType === 'upload'">
                <span>Upload Image</span>
                <input @change="handleImage" type="file" id="img" name="img" accept="image/*">
            </label>
            <label v-else>
                <span>Image URL</span>
                <input
                    type="text"
                    v-model="url"
                />
            </label>
            <p v-if="questionError">{{ questionError }}</p>
            <button
                @click="addQuestion"
            >Add Question</button>
        </div>
        <div class="card">
            <DeleteSection text="Category" @delete="deleteCategory" />
        </div>
    </main>
</template>

<script setup lang="ts">
import DeleteSection from '@/components/DeleteSection.vue';
import { auth, db, storage } from '@/services/firebase';
import type { ICategory, IQuestion } from '@/types';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, setDoc } from 'firebase/firestore';
import { ref as fbref, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import { onMounted, ref, type Ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute()
const router = useRouter()

const image: Ref<File | undefined> = ref()
const answer = ref('')
const url = ref('')
const imageType = ref('url')
const questions: Ref<IQuestion[]> = ref([])
const category: Ref<ICategory | null> = ref(null)
const catName = ref('')

const questionError = ref('')

// @ts-ignore
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
            questions.value.push({
                id: doc.id,
                ...doc.data()
            } as IQuestion)
        });

        console.log(questions.value)
    } catch (e) {
        console.error(e)
    }
}

const saveCat = async () => {
    try {
        if (!category.value?.name) {
            throw new Error('Cat name cannot be blank')
        }
        const catRef = doc(db, "games", route.params.id as string, "categories", route.params.catId as string)

        await setDoc(catRef, {
            name: catName.value
        })

        category.value.name = catName.value
    } catch (e) {
        console.error(e)
    }
}

const getCategoryInfo = async () => {
    try {
        if (!auth.currentUser) {
            throw new Error("User not logged in")
        }
        
        const catRef = doc(db, "games", route.params.id as string, "categories", route.params.catId as string)

        const docSnapshot =  await getDoc(catRef)

        if (docSnapshot.data()) {
            const data = docSnapshot.data() as ICategory
            category.value = data
            catName.value = data.name
        }
    } catch (e) {
        console.error(e)
    }
}

const addQuestion = async () => {
    try {
        if (!auth.currentUser) {
            throw new Error("User not logged in")
        }

        if (imageType.value === 'upload') {
            if (!image.value) {
                throw new Error("Please upload image")
            }
            await uploadImage(addQuestionPart2)
        } else {
            if (!url.value) {
                throw new Error("Please set image url")
            }
            addQuestionPart2(url.value)
        }

    } catch (e) {
        if (e instanceof Error) {
            questionError.value = e.message
        } else {
            console.error(e)
        }
    }
}

const addQuestionPart2 = async (url: string) => {
    try {
        // ... make a data to write ...
        const question = {
            answer: answer.value,
            imgUrl: url
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
    } catch (e) {
        console.log(e)
    }
}

const uploadImage = async (next: (url: string) => void) => {
    try {
        // @ts-ignore
        const { name, type } = image.value
        
        const storageRef = fbref(storage, 'images/' + name)
        // @ts-ignore
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
                console.error(error)
            },
            async () => {
                // successful upload. get url ...
                const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref)
                next(downloadUrl)
            }
        )
    } catch (e) {
        console.error(e)
    }
}

const deleteQuestion = async (qId: string) => {
    try {
        if (!auth.currentUser) {
            throw new Error("User not logged in")
        }

        const questionRef = doc(db, "games", route.params.id as string, "categories", route.params.catId as string, "questions", qId)

        await deleteDoc(questionRef);
        // TODO delete image in db

        questions.value = questions.value.filter(q => q.id !== qId)
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
    getCategoryInfo()
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

.radio-btn {
    display: flex;
    flex-direction: row;
    align-items: center;
    span {
        margin-bottom: 0;
    }
}
</style>