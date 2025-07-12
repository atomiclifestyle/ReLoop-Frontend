import { BASE_BACKEND_URL, NEXTAUTH_secret } from '@/app/constants';
import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

declare module 'next-auth' {
    interface Session {
        token_type: string;
        access_token : string;
    }
    interface User {
        token_type: string;
        access_token : string;
    }
}

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id : 'user_login',
            name: 'UserLogin',
            credentials: {
                email: { name: 'Email', type: "text" },
                password: { name: 'Password', type: 'password' },
            },
            authorize: async (credentials: Record<string, string> | undefined, req) => {
                if (!credentials) return null
                const { email, password,userType } = credentials

                const res = await fetch(`${BASE_BACKEND_URL}/auth/${userType}/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email , password
                    })
                })

                const data = await res.json()
                console.log(data)
                if (res.ok && data?.access_token && data?.token_type) {
                    return data
                }
                return null;

            },
        }),
        CredentialsProvider({
            id : 'worker_login',
            name: 'WorkerLogin',
            credentials:{
                worker_id : {name : 'WorkeriD' , type : 'text'},
                password : { name : 'Password' , type : 'password'}
            },
            authorize: async(credentials : Record<string , string> | undefined , req)=>{
                if(!credentials) return null
                const {worker_id , password, userType} = credentials

                const res = await fetch(`${BASE_BACKEND_URL}/api/${userType}/login` , {
                    method : 'POST',
                    headers:{
                        'Content-Type' : 'application/json'
                    },
                    body: JSON.stringify({
                        worker_id , password
                    })
                })

                const data = await res.json()
                if(res?.ok && data?.access_token && data?.token_type) return data
                return null
            }
        })
    ],

    callbacks: {
        async jwt({ token, user }) {
            //Store accessToken and name in the JWT on initial login
            if (user) {
                token.token_type = user.token_type,
                token.access_token = user.access_token
            }
            return token
        },

        async session({ session, token }) {
            // Pass accessToken and name to the session
            session.access_token = token.access_token as string;
            session.token_type = token.token_type as string
            return session
        }
    },

    session: {
        strategy: 'jwt'
    },

    pages: {
        signIn: '/auth/signin', 
    },
    secret: NEXTAUTH_secret

}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }