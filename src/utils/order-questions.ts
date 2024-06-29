import type { IQuestion } from "@/types";

export function orderQuestions(order: string[], questions: IQuestion[]): IQuestion[] {
    const qArray = new Map(questions.map(q => [q.id, q]))
    const orderedQuestions = order.reduce((acc: IQuestion[], o) => {
        const q = qArray.get(o)
        if (q && q.id) {
            acc.push(q)
            qArray.delete(o)
        }
        return acc
    }, [] as IQuestion[])
    if (qArray.size) {
        qArray.forEach(q => {
            orderedQuestions.push(q)
        })
    }
    return orderedQuestions
}