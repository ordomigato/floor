<template>
    <div>
        <h3>Questions ({{ questions.length }})</h3>
        <table>
            <thead>
                <tr>
                    <th>Number</th>
                    <th>Answer</th>
                    <th>Pic</th>
                    <th>Action</th>
                </tr>
            </thead>
            <draggable
                tag="tbody" 
                v-model="questions"
                group="questions" 
                @start="drag=true" 
                @end="drag=false" 
                item-key="questions"
            >
                <template #item="{element, index}">
                    <tr>
                        <th>{{ index + 1 }}</th>
                        <th>{{ element.answer }}</th>
                        <th>
                            <img class="question-thumbnail" :src="element.imgUrl" >
                        </th>
                        <th>
                            <button
                                @click="() => handleDeleteQuestion(element.id)"
                            >
                                Delete
                            </button>
                        </th>
                    </tr>
                </template>
            </draggable>
        </table>
        <div class="mt-2">
            <button
                :disabled="!orderChanged"
                @click="handleUpdateOrder"
            >
                Save Order
            </button>
        </div>
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
import draggable from 'vuedraggable'
import { type PropType, type Ref, ref, computed, type ComputedRef, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { addQuestion, deleteQuestion, uploadImage, updateQuestionOrder } from '@/services/game';
import type { IQuestion } from '@/types';

const route = useRoute()

const props = defineProps({
    questions: {
        type: Object as PropType<IQuestion[]>,
        required: true,
    }
})

const questions: Ref<IQuestion[]> = ref(props.questions)

const emit = defineEmits(['onAddQuestion', 'onDeleteQuestion', 'onUpdateOrder'])

const image: Ref<File | undefined> = ref()
const answer = ref('')
const url = ref('')
const imageType = ref('url')
const error = ref('')

const savedOrder: ComputedRef<string[]> = computed(() => {
    return props.questions.map(q => q.id)
})

const order: ComputedRef<string[]> = computed(() => {
    return questions.value.map(q => q.id)
})

const orderChanged: ComputedRef<boolean> = computed(() => {
    if (order.value.length && savedOrder.value.length) {
        return order.value.some((o, i) => o !== savedOrder.value[i])
    }
    return false
})

const handleImage = (e: any) => {
    image.value = e.target.files[0]
}

const handleUpdateOrder = async () => {
    try {
        const gameId = route.params.id as string
        const catId = route.params.catId as string

        const payload = questions.value.map(q => q.id)
        await updateQuestionOrder(gameId, catId, payload)

        // update locally
        emit('onUpdateOrder', payload)
    } catch (e) {
        if (e instanceof Error) {
            error.value = e.message
        } else {
            console.error(e)
        }
    }
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

        console.log('yo')

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
