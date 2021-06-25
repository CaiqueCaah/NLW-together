import { createContext, ReactNode, useState, useEffect } from 'react';

import { auth, firebase } from '../services/firebase';

type User = {
    id: string;
    name: string;
    avatar: string;
}

type AuthContextType = {
    user: User | undefined;
    signInWithGoogle: () => Promise<void>;
}

type authContextProviderProps = {
    children: ReactNode;
}

//cria o contexto e define o tipo AuthContextType e exporta para pegar em todas as telas
export const AuthContext = createContext({} as AuthContextType);

export function AuthContextProvider(props: authContextProviderProps) {


    //state react para enviar o contexto
    const [user, setUser] = useState<User>();

    //se detectar que o usuario já estava logado mesmo recarregando a pagina, 
    //tenta recuperar os dados (recupera contexto)
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {

            if (user) {
                const { displayName, photoURL, uid } = user;

                if (!displayName || !photoURL) {
                    throw new Error('Missing information from Google Account')
                }

                setUser({
                    id: uid,
                    name: displayName,
                    avatar: photoURL
                })
            }
        })

        return () => {
            unsubscribe();
        }

    }, [])

    //function que faz o login no google
    async function signInWithGoogle() {
        const provider = new firebase.auth.GoogleAuthProvider();

        //abre um pop-up para escolher a conta para realizar o login
        const result = await auth.signInWithPopup(provider)

        if (result.user) {
            const { displayName, photoURL, uid } = result.user;

            if (!displayName || !photoURL) {
                throw new Error('Missing information from Google Account')
            }

            setUser({
                id: uid,
                name: displayName,
                avatar: photoURL
            })
        }
    }

    return (
        <AuthContext.Provider value={{ user, signInWithGoogle }}>
            {props.children}
        </AuthContext.Provider>
    );
}