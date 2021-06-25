import { BrowserRouter, Route } from 'react-router-dom'
import { createContext, useState, useEffect } from 'react'

import { Home } from "./pages/Home";
import { NewRoom } from "./pages/NewRoom"
import { auth, firebase } from './services/firebase';

type User = {
  id: string;
  name: string;
  avatar: string;
}

type AuthContextType = {
  user: User | undefined;
  signInWithGoogle: () => Promise<void>;
}

//cria o contexto e define o tipo AuthContextType e exporta para pegar em todas as telas
export const AuthContext = createContext( {} as AuthContextType);

function App() {

  //state react para enviar o contexto
  const [user, setUser] = useState<User>();

  //se detectar que o usuario já estava logado mesmo recarregando a pagina, 
  //tenta recuperar os dados (recupera contexto)
  useEffect(() => {
    auth.onAuthStateChanged(user => {
      if(user){
        const { displayName, photoURL, uid } = user;

        if(!displayName || !photoURL){
          throw new Error('Missing information from Google Account')
        }

        setUser({
          id: uid,
          name: displayName,
          avatar: photoURL
        })
      }
    })
  }, [])

  //function que faz o login no google
  async function signInWithGoogle(){
    const provider = new firebase.auth.GoogleAuthProvider();

    //abre um pop-up para escolher a conta para realizar o login
    const result = await auth.signInWithPopup(provider)

    if(result.user){
      const { displayName, photoURL, uid } = result.user;

      if(!displayName || !photoURL){
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
    <BrowserRouter>
      <AuthContext.Provider value={{ user, signInWithGoogle }}>
        <Route path="/" exact={true} component={Home} />
        <Route path="/rooms/new" component={NewRoom} />
      </AuthContext.Provider>
    </BrowserRouter>
    );
}

export default App;
