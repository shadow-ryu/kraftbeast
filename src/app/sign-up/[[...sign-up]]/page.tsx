import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <SignUp />
    </div>
  )
}
