import { useState } from 'react'
import { IconEye, IconEyeOff } from '@tabler/icons-react'

export const PasswordInput = () => {
  const [isVisible, setIsVisible] = useState(false)

  const toggleVisibility = () => setIsVisible((prevState) => !prevState)

  return (
    <div>
      <label htmlFor="password" className="label">
        <span className="label-text">Password *</span>
      </label>
      <div className="relative">
        <input
          type={!isVisible ? 'password' : 'text'}
          name="password"
          id="password"
          minLength={8}
          placeholder="••••••••"
          className="input input-bordered w-full"
          required={true}
          pattern="[^\s]+"
          title="At least 8 characters. No whitespaces."
        />
        <button
          className="absolute inset-y-0 end-0 flex items-center z-20 px-2.5 cursor-pointer text-base-content   "
          type="button"
          onClick={toggleVisibility}
        >
          {isVisible ? (
            <IconEyeOff size={20} aria-hidden="true" />
          ) : (
            <IconEye size={20} aria-hidden="true" />
          )}
        </button>
      </div>
    </div>
  )
}
