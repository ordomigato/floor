import { signOut } from "firebase/auth";
import { auth } from "./firebase";

export const logout = () => {
    signOut(auth).then(() => {
    }).catch((error) => {
        console.error(error)
    });
}