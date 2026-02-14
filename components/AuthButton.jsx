
"use client"
import React, { useState } from 'react'
import { Button } from './ui/button'
import { LogInIcon, LogOut } from 'lucide-react'
import { AuthModel } from './AuthModel'
import { signOut } from '@/app/action'


const AuthButton = ({ user }) => {

    const [showAuthModal, setShowAuthModal] = useState(false)

    if (user) {
        return (
            <form action={signOut}>
                <Button variant='ghost' size='sm' type='submit' className="gap-2">

                    <LogOut className='w-4 h-4' />
                    Sign Out

                </Button>
            </form>
        )

    }

    return (
        <div>
            <Button
                onClick={() => setShowAuthModal(true)}
                soze="sm"
                className="bg-orange-500 hover:bg-orange-600 gap-2"
                variant="default">
                <LogInIcon className="w-4 h-4" />
                Sign in
            </Button>

            <AuthModel
                isOpen={showAuthModal}
                onClose={() => { setShowAuthModal(false) }}
            />
        </div>
    )
}

export default AuthButton
