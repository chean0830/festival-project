import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { login } from '../api/authApi'
import '../styles/login.css'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3.75 5.75h16.5v12.5H3.75z" />
      <path d="m4.5 6.5 7.5 6 7.5-6" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4.75" y="10" width="14.5" height="10.25" rx="2" />
      <path d="M8 10V7.5a4 4 0 0 1 8 0V10" />
      <circle cx="12" cy="15" r="1" />
    </svg>
  )
}

function EyeIcon({ crossed }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M2.5 12s3.5-5 9.5-5 9.5 5 9.5 5-3.5 5-9.5 5-9.5-5-9.5-5Z" />
      <circle cx="12" cy="12" r="2.25" />
      {crossed && <path d="m4 4 16 16" />}
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.41Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.97-.9 6.62-2.43l-3.24-2.54c-.9.6-2.04.96-3.38.96-2.61 0-4.82-1.76-5.61-4.13H3.05v2.62A10 10 0 0 0 12 22Z"
      />
      <path
        fill="#FBBC05"
        d="M6.39 13.86A6 6 0 0 1 6.08 12c0-.65.11-1.28.31-1.86V7.52H3.05A10 10 0 0 0 2 12c0 1.61.39 3.14 1.05 4.48l3.34-2.62Z"
      />
      <path
        fill="#EA4335"
        d="M12 6.01c1.47 0 2.79.51 3.83 1.5l2.87-2.87A9.63 9.63 0 0 0 12 2a10 10 0 0 0-8.95 5.52l3.34 2.62C7.18 7.77 9.39 6.01 12 6.01Z"
      />
    </svg>
  )
}

function KakaoIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#181600"
        d="M24 11C14.6 11 7 16.9 7 24.2c0 4.7 3.1 8.8 7.8 11.1l-2 7.1c-.2.7.6 1.2 1.2.8l8.5-5.7c.5.1 1 .1 1.5.1 9.4 0 17-5.9 17-13.3S33.4 11 24 11Z"
      />
    </svg>
  )
}

function SocialLoginButton({ provider, label, icon }) {
  return (
    <a
      className="social-login"
      href={`/oauth2/authorization/${provider}`}
      aria-label={`${label} 계정으로 로그인`}
    >
      <span className={`social-icon ${provider}-icon`}>{icon}</span>
      <span>{label}</span>
    </a>
  )
}

function ValidationMessage({ children, id }) {
  return (
    <p className="validation-message" id={id} role="alert">
      <span className="validation-icon" aria-hidden="true">!</span>
      <span>{children}</span>
    </p>
  )
}

function LoginPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailTouched, setEmailTouched] = useState(false)
  const [searchParams] = useSearchParams()

  const signupComplete = searchParams.get('signup') === 'success'
  const oauthSuccess = searchParams.get('oauth') === 'success'
  const oauthError = searchParams.get('oauth') === 'error'
  const trimmedEmail = email.trim()
  const emailInvalid = trimmedEmail !== '' && !EMAIL_PATTERN.test(trimmedEmail)
  const showEmailError = emailTouched && emailInvalid
  const loginDisabled = loading || trimmedEmail === '' || password === ''

  const handleSubmit = async (event) => {
    event.preventDefault()
    setEmailTouched(true)

    if (emailInvalid || loginDisabled) {
      return
    }

    setLoading(true)
    setError('')
    setMessage('')

    try {
      const member = await login({ email, password })
      setMessage(`${member.nickname}님, 로그인되었습니다.`)
      navigate('/')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-card" aria-labelledby="login-title">
        <h1 id="login-title">개인회원 로그인</h1>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <div className="login-field">
            <label className={`input-row ${showEmailError ? 'input-error' : ''}`}>
              <span className="input-icon" aria-hidden="true">
                <MailIcon />
              </span>
              <span className="sr-only">이메일</span>
              <input
                type="email"
                name="username"
                autoComplete="email"
                placeholder="이메일을 입력해 주세요"
                value={email}
                aria-invalid={showEmailError}
                aria-describedby={showEmailError ? 'email-error' : undefined}
                onBlur={() => setEmailTouched(true)}
                onChange={(event) => {
                  setEmail(event.target.value)
                  setError('')
                }}
              />
            </label>
            {showEmailError && (
              <ValidationMessage id="email-error">
                이메일 형식이 올바르지 않습니다.
              </ValidationMessage>
            )}
          </div>

          <div className="login-field">
            <label className={`input-row ${error ? 'input-error' : ''}`}>
              <span className="input-icon" aria-hidden="true">
                <LockIcon />
              </span>
              <span className="sr-only">비밀번호</span>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                autoComplete="current-password"
                placeholder="비밀번호를 입력해 주세요"
                value={password}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? 'login-error' : undefined}
                onChange={(event) => {
                  setPassword(event.target.value)
                  setError('')
                }}
              />
              <button
                className="password-toggle"
                type="button"
                aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 표시하기'}
                aria-pressed={showPassword}
                onClick={() => setShowPassword((current) => !current)}
              >
                <EyeIcon crossed={!showPassword} />
              </button>
            </label>
            {error && (
              <ValidationMessage id="login-error">
                이메일 또는 비밀번호를 다시 확인하세요.
              </ValidationMessage>
            )}
          </div>

          {(signupComplete || oauthSuccess || message) && (
            <p className="form-message success" role="status">
              {message ||
                (signupComplete
                  ? '회원가입이 완료되었습니다. 로그인해 주세요.'
                  : '소셜 로그인이 완료되었습니다.')}
            </p>
          )}
          {oauthError && (
            <p className="form-message error" role="alert">
              소셜 로그인에 실패했습니다. 제공 동의와 설정을 확인해 주세요.
            </p>
          )}

          <button className="primary-button" type="submit" disabled={loginDisabled}>
            {loading ? '로그인 중...' : '로그인하기'}
          </button>
        </form>

        <Link className="signup-button" to="/signup">
          이메일 회원가입
        </Link>

        <nav className="account-links" aria-label="계정 도움말">
          <Link to="/account/recovery">아이디·비밀번호 찾기</Link>
        </nav>

        <div className="social-heading">
          <span>SNS 계정으로 간편하게 시작하기</span>
        </div>

        <div className="social-login-list">
          <SocialLoginButton
            provider="google"
            label="google"
            icon={<GoogleIcon />}
          />
          <SocialLoginButton
            provider="kakao"
            label="kakao"
            icon={<KakaoIcon />}
          />
          <SocialLoginButton
            provider="naver"
            label="naver"
            icon={<span className="naver-letter">N</span>}
          />
        </div>
      </section>
    </main>
  )
}

export default LoginPage
