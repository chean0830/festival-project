import { useState } from 'react'
import { Link } from 'react-router-dom'
import { findEmail, requestPasswordReset } from '../api/authApi'
import { formatPhoneNumber } from '../utils/formatPhoneNumber'
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

function AccountRecoveryPage() {
  const [activeTab, setActiveTab] = useState('password')
  const [email, setEmail] = useState('')
  const [nickname, setNickname] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const changeTab = (tab) => {
    setActiveTab(tab)
    setMessage('')
    setError('')
  }

  const handleFindEmail = async (event) => {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')
    try {
      const result = await findEmail({ nickname, phoneNumber })
      if (result.found) {
        setMessage(`가입 이메일: ${result.maskedEmail}`)
      } else {
        setError(result.message)
      }
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordReset = async (event) => {
    event.preventDefault()
    setMessage('')
    setError('')

    if (!EMAIL_PATTERN.test(email.trim())) {
      setError('이메일 형식이 올바르지 않습니다.')
      return
    }

    setLoading(true)
    try {
      const result = await requestPasswordReset(email)
      setMessage(result.message)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="recovery-page">
      <section className="recovery-card" aria-labelledby="recovery-title">
        <h1 id="recovery-title">아이디·비밀번호 찾기</h1>

        <div className="recovery-tabs" role="tablist" aria-label="계정 찾기 방식">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'email'}
            className={activeTab === 'email' ? 'active' : ''}
            onClick={() => changeTab('email')}
          >
            아이디 찾기
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'password'}
            className={activeTab === 'password' ? 'active' : ''}
            onClick={() => changeTab('password')}
          >
            비밀번호 찾기
          </button>
        </div>

        {activeTab === 'password' ? (
          <form className="recovery-form" onSubmit={handlePasswordReset} noValidate>
            <div className="recovery-intro">
              <h2>비밀번호 재설정</h2>
              <p>비밀번호를 재설정할 이메일을 입력해 주세요.</p>
              <p>입력된 메일로 자세한 안내를 보내드립니다.</p>
            </div>

            <label className="recovery-field">
              <span>비밀번호를 재설정할 이메일<em>*</em></span>
              <span className="recovery-input">
                <span className="input-icon"><MailIcon /></span>
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="이메일을 입력해 주세요"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </span>
            </label>

            {error && <p className="recovery-message error" role="alert">{error}</p>}
            {message && <p className="recovery-message success" role="status">{message}</p>}

            <button
              className="recovery-submit"
              type="submit"
              disabled={loading || email.trim() === ''}
            >
              {loading ? '메일 보내는 중...' : '비밀번호 재설정 메일 보내기'}
            </button>
          </form>
        ) : (
          <form className="recovery-form" onSubmit={handleFindEmail}>
            <div className="recovery-intro">
              <h2>아이디 찾기</h2>
              <p>가입할 때 입력한 닉네임과 휴대폰 번호를 입력해 주세요.</p>
              <p>일치하는 이메일을 일부 가려서 알려드립니다.</p>
            </div>

            <label className="recovery-field">
              <span>닉네임<em>*</em></span>
              <span className="recovery-input">
                <input
                  type="text"
                  autoComplete="nickname"
                  placeholder="닉네임을 입력해 주세요"
                  value={nickname}
                  onChange={(event) => setNickname(event.target.value)}
                  required
                />
              </span>
            </label>

            <label className="recovery-field compact-field">
              <span>휴대폰 번호<em>*</em></span>
              <span className="recovery-input">
                <input
                  type="tel"
                  autoComplete="tel"
                  inputMode="numeric"
                  maxLength="13"
                  placeholder="010-1234-5678"
                  value={phoneNumber}
                  onChange={(event) => setPhoneNumber(formatPhoneNumber(event.target.value))}
                  required
                />
              </span>
            </label>

            {error && <p className="recovery-message error" role="alert">{error}</p>}
            {message && <p className="recovery-message success" role="status">{message}</p>}

            <button
              className="recovery-submit"
              type="submit"
              disabled={loading || nickname.trim() === '' || phoneNumber.trim() === ''}
            >
              {loading ? '찾는 중...' : '아이디 찾기'}
            </button>
          </form>
        )}

        <p className="recovery-login-link"><Link to="/login">로그인으로 돌아가기</Link></p>
      </section>
    </main>
  )
}

export default AccountRecoveryPage
