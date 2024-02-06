import { getAuth, signOut } from "firebase/auth";
import app from "./firebase";

const auth = getAuth(app);

export const logout = () => {
    signOut(auth).then(() => {
    }).catch((error) => {
        console.error(error)
    });
}