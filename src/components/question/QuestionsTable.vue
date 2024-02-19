<template>
    <div>
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
                            @click="() => handleDeleteQuestion(question.id)"
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
        <p v-if="error">{{ error }}</p>
        <button
            @click="handleInitAddQuestion"
        >
            Add Question
        </button>
    </div>
</template>
<script setup lang="ts">
import { type PropType, type Ref, ref } from 'vue';
import { useRoute } from 'vue-router';
import { addQuestion, deleteQuestion, uploadImage } from '@/services/game';
import type { IQuestion } from '@/types';

const route = useRoute()

defineProps({
    questions: {
        type: Object as PropType<IQuestion[]>
    }
})

const emit = defineEmits(['onAddQuestion', 'onDeleteQuestion'])

const image: Ref<File | undefined> = ref()
const answer = ref('')
const url = ref('')
const imageType = ref('url')
const error = ref('')

const handleImage = (e: any) => {
    image.value = e.target.files[0]
}

const handleInitAddQuestion = async () => {
    try {
        if (imageType.value === 'upload') {
            if (!image.value) {
                throw new Error("Please upload image")
            }
            uploadImage(image.value, handleCompleteAddQuestion)
        } else {
            if (!url.value) {
                throw new Error("Please set image url")
            }
            handleCompleteAddQuestion(url.value)
        }

    } catch (e) {
        if (e instanceof Error) {
            error.value = e.message
        } else {
            console.error(e)
        }
    }
}


const handleCompleteAddQuestion = async (url: string) => {
    try {
        const payload = {
            answer: answer.value,
            imgUrl: url
        }

        const gameId = route.params.id as string
        const catId = route.params.catId as string

        const data = await addQuestion(gameId, catId, payload)

        emit('onAddQuestion', data)
    } catch (e) {
        console.log(e)
    }
}

const handleDeleteQuestion = async (qId: string) => {
    try {
        const gameId = route.params.id as string
        const catId = route.params.catId as string

        deleteQuestion(gameId, catId, qId)
        // TODO delete image in db

        emit('onDeleteQuestion', qId)
    } catch (e) {
        console.error(e)
    }
}
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
