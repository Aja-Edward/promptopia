import NextAuth from 'next-auth/next'
import GoogleProvider from 'next-auth/providers/google'
import User from '@models/user'
import { connectToDB } from '@utils/database'

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ profile }) {
      console.log(profile)
      try {
        await connectToDB()
        // check if a user already exist

        const userExists = await User.findOne({
          email: profile.email,
        })
        //if not,  create a new user
        if (!userExists) {
          await User.create({
            email: profile.email,
            userName: profile.name.replace(' ', '').toLowerCase(),
            image: profile.picture,
          })
        }
      } catch (error) {
        console.log(error)
      }
      return true
    },
  },
  async session({ session }) {
    console.log(session)
    const sessionUser = await User.findOne({
      email: session.user.email,
    })
    console.log(sessionUser)
    console.log(email)
    session.user.id = sessionUser._id.toString()
    return session
  },
})

export { handler as GET, handler as POST }
