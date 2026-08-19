import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { confirmPasswordReset } from '../api/authApi'
import '../styles/login.css'

function EyeIcon({ crossed }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M2.5 12s3.5-5 9.5-5 9.5 5 9.5 5-3.5 5-9.5 5-9.5-5-9.5-5Z" />
      <circle cx="12" cy="12" r="2.25" />
      {crossed && <path d="m4 4 16 16" />}
    </svg>
  )
}

function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState(token ? '' : '유효한 재설정 링크가 아닙니다.')
  const [passwordLengthError, setPasswordLengthError] = useState('')
  const [loading, setLoading] = useState(false)
  const [completed, setCompleted] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage('')
    setError('')

    if (password.length < 8) {
      setPasswordLengthError('비밀번호는 8자 이상 입력해 주세요.')
      return
    }
    if (password !== passwordConfirm) {
      setError('비밀번호가 서로 일치하지 않습니다.')
      return
    }

    setLoading(true)
    try {
      const result = await confirmPasswordReset({ token, password })
      setMessage(result.message)
      setCompleted(true)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="recovery-page">
      <section className="recovery-card reset-card" aria-labelledby="reset-title">
        <div className="recovery-intro">
          <h1 id="reset-title">새 비밀번호 설정</h1>
          <p>새로 사용할 비밀번호를 입력해 주세요.</p>
          <p>비밀번호는 8자 이상이어야 합니다.</p>
        </div>

        {!completed ? (
          <form className="reset-form" onSubmit={handleSubmit}>
            <label className="recovery-field">
              <span>새 비밀번호<em>*</em></span>
              <span className="recovery-input">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="8자 이상 입력해 주세요"
                  value={password}
                  onChange={(event) => {
                    const value = event.target.value
                    setPassword(value)
                    setPasswordLengthError(
                      value.length > 0 && value.length < 8
                        ? '비밀번호는 8자 이상 입력해 주세요.'
                        : '',
                    )
                  }}
                  minLength="8"
                  required
                />
                <button
                  className="password-toggle"
                  type="button"
                  aria-label={showPassword ? '새 비밀번호 숨기기' : '새 비밀번호 표시하기'}
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword((current) => !current)}
                >
                  <EyeIcon crossed={!showPassword} />
                </button>
              </span>
            </label>

            <label className="recovery-field compact-field">
              <span>새 비밀번호 확인<em>*</em></span>
              <span className="recovery-input">
                <input
                  type={showPasswordConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="비밀번호를 다시 입력해 주세요"
                  value={passwordConfirm}
                  onChange={(event) => setPasswordConfirm(event.target.value)}
                  minLength="8"
                  required
                />
                <button
                  className="password-toggle"
                  type="button"
                  aria-label={showPasswordConfirm ? '새 비밀번호 확인 숨기기' : '새 비밀번호 확인 표시하기'}
                  aria-pressed={showPasswordConfirm}
                  onClick={() => setShowPasswordConfirm((current) => !current)}
                >
                  <EyeIcon crossed={!showPasswordConfirm} />
                </button>
              </span>
            </label>

            {passwordLengthError && (
              <p className="recovery-message error" role="alert">{passwordLengthError}</p>
            )}
            {error && <p className="recovery-message error" role="alert">{error}</p>}
            {message && <p className="recovery-message success" role="status">{message}</p>}

            <button
              className="recovery-submit"
              type="submit"
              disabled={loading || !token || password === '' || passwordConfirm === ''}
            >
              {loading ? '변경 중...' : '비밀번호 변경하기'}
            </button>
          </form>
        ) : (
          <div className="reset-complete">
            <p>{message}</p>
            <Link className="recovery-submit" to="/login">로그인하기</Link>
          </div>
        )}

        {!completed && (
          <p className="recovery-login-link"><Link to="/login">로그인으로 돌아가기</Link></p>
        )}
      </section>
    </main>
  )
}

export default ResetPasswordPage
