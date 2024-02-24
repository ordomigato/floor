import { addDoc, collection, doc, getDoc, getDocs, query, setDoc, deleteDoc, updateDoc } from "firebase/firestore";
import { ref as fbref, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import { db, storage } from "./firebase";
import { v4 as uuidv4 } from 'uuid';
import type { IAddQuestionRequest, ICategory, IGameSaveState, IQuestion, IUpdateCategoryRequest } from "@/types";


//////////
// Game //
//////////

export async function createGame(gameName: string, ownerId: string): Promise<void> {
    await setDoc(doc(db, "games", uuidv4()), {
        name: gameName,
        owner_id: ownerId,
    });
}

export async function saveGame(gameId: string, payload: IGameSaveState): Promise<void> {
    const gameRef = doc(db, "games", gameId)

    updateDoc(gameRef, {
        save: payload
    })
}

export async function deleteGame(gameId: string) {
    await deleteDoc(doc(db, "games", gameId));
}

///////////////
// Questions //
///////////////

export async function getQuestions(gameId: string, categoryId: string): Promise<IQuestion[]> {
    const catCollection = collection(db, "games", gameId, "categories", categoryId, "questions")
    const q = query(catCollection);
    const querySnapshot = await getDocs(q);

    const questions: IQuestion[] = []

    querySnapshot.forEach((doc) => {
        questions.push({
            id: doc.id,
            ...doc.data()
        } as IQuestion)
    });

    return questions
}

export async function addQuestion(gameId: string, categoryId: string, payload: IAddQuestionRequest): Promise<IQuestion> {
    const catCollection = collection(db, "games", gameId, "categories", categoryId, "questions")

    const doc = await addDoc(catCollection, payload)

    return {
        id: doc.id,
        ...payload,
    }
}

export async function deleteQuestion(gameId: string, categoryId: string, questionId: string): Promise<void> {
    const questionRef = doc(db, "games", gameId as string, "categories", categoryId as string, "questions", questionId)

    await deleteDoc(questionRef);
}

//////////////
// Category //
//////////////

export async function getCategory(gameId: string, categoryId: string): Promise<ICategory> {
    const catRef = doc(db, "games", gameId, "categories", categoryId)
    const docSnapshot =  await getDoc(catRef)
    const data = docSnapshot.data() as ICategory

    return {
        ...data,
        id: docSnapshot.id,
    }
}

export async function updateCategory(gameId: string, categoryId: string, payload: IUpdateCategoryRequest): Promise<ICategory> {
    const catRef = doc(db, "games", gameId, "categories", categoryId)

    await setDoc(catRef, payload)

    return {
        id: categoryId,
        ...payload,
    }
}

//////////
// Misc //
//////////

export async function uploadImage(file: File, next: (url: string) => void): Promise<void> {
    const { name, type } = file
        
    const storageRef = fbref(storage, 'images/' + name)

    const uploadTask = uploadBytesResumable(storageRef, file, {
        contentType: type
    })

    uploadTask.on(
        'state_changed',
        (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            console.log('Upload is ' + progress + '% done')
        },
        (error: Error) => {
            console.error(error)
            throw error
        },
        async () => {
            // successful upload. get url ...
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref)
            next(downloadUrl)
        }
    )
}
