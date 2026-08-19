import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signup } from '../api/authApi'
import { formatPhoneNumber } from '../utils/formatPhoneNumber'
import '../styles/login.css'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_PATTERN = /^01[016789]-?\d{3,4}-?\d{4}$/

function ValidationMessage({ children, id }) {
  return (
    <p className="validation-message" id={id} role="alert">
      <span className="validation-icon" aria-hidden="true">!</span>
      <span>{children}</span>
    </p>
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

function SignupPage() {
  const navigate = useNavigate()
  const detailAddressRef = useRef(null)
  const [email, setEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [roadAddress, setRoadAddress] = useState('')
  const [detailAddress, setDetailAddress] = useState('')
  const [nickname, setNickname] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)
  const [agreement, setAgreement] = useState(false)
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const clearError = (name) => {
    setErrors((current) => {
      const next = { ...current }
      delete next[name]
      return next
    })
  }

  const validate = () => {
    const nextErrors = {}

    if (!email.trim()) {
      nextErrors.email = '이메일을 입력해 주세요.'
    } else if (!EMAIL_PATTERN.test(email.trim())) {
      nextErrors.email = '이메일 형식이 올바르지 않습니다.'
    }

    if (!phoneNumber.trim()) {
      nextErrors.phoneNumber = '휴대폰 번호를 입력해 주세요.'
    } else if (!PHONE_PATTERN.test(phoneNumber.trim())) {
      nextErrors.phoneNumber = '휴대폰 번호 형식이 올바르지 않습니다.'
    }

    if (!postalCode || !roadAddress) {
      nextErrors.address = '우편번호 찾기로 주소를 검색해 주세요.'
    }

    if (!detailAddress.trim()) {
      nextErrors.detailAddress = '상세 주소를 입력해 주세요.'
    }

    if (!nickname.trim()) {
      nextErrors.nickname = '닉네임을 입력해 주세요.'
    } else if (nickname.trim().length < 2 || nickname.trim().length > 20) {
      nextErrors.nickname = '닉네임은 2~20자로 입력해 주세요.'
    }

    if (!password) {
      nextErrors.password = '비밀번호를 입력해 주세요.'
    } else if (password.length < 8) {
      nextErrors.password = '비밀번호는 8자 이상 입력해 주세요.'
    }

    if (!passwordConfirm) {
      nextErrors.passwordConfirm = '비밀번호를 한 번 더 입력해 주세요.'
    } else if (password !== passwordConfirm) {
      nextErrors.passwordConfirm = '비밀번호가 서로 일치하지 않습니다.'
    }

    if (!agreement) {
      nextErrors.agreement = '이용약관 및 개인정보처리방침에 동의해 주세요.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage('')

    if (!validate()) {
      return
    }

    setLoading(true)
    try {
      await signup({
        email,
        phoneNumber,
        postalCode,
        roadAddress,
        detailAddress,
        nickname,
        password,
      })
      navigate('/login?signup=success', { replace: true })
    } catch (requestError) {
      setMessage(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  const openPostcodeSearch = () => {
    if (!window.kakao?.Postcode) {
      setErrors((current) => ({
        ...current,
        address: '주소 검색 서비스를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.',
      }))
      return
    }

    new window.kakao.Postcode({
      oncomplete: (data) => {
        const selectedAddress = data.userSelectedType === 'R'
          ? data.roadAddress
          : data.jibunAddress

        setPostalCode(data.zonecode)
        setRoadAddress(selectedAddress)
        clearError('address')
        window.setTimeout(() => detailAddressRef.current?.focus(), 0)
      },
    }).open()
  }

  return (
    <main className="login-page signup-page">
      <section className="login-card signup-card" aria-labelledby="signup-title">
        <h1 id="signup-title">이메일 회원가입</h1>
        <p className="page-description">페스티벌의 공연과 라이브를 한곳에서 만나보세요.</p>

        <form className="signup-form" onSubmit={handleSubmit} noValidate>
          <label className={`field-group ${errors.email ? 'has-error' : ''}`}>
            <span className="field-label">이메일</span>
            <input
              type="email"
              name="email"
              autoComplete="email"
              placeholder="example@email.com"
              value={email}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'signup-email-error' : undefined}
              onChange={(event) => {
                setEmail(event.target.value)
                clearError('email')
              }}
            />
            {errors.email && (
              <ValidationMessage id="signup-email-error">{errors.email}</ValidationMessage>
            )}
          </label>

          <label className={`field-group ${errors.phoneNumber ? 'has-error' : ''}`}>
            <span className="field-label">휴대폰 번호</span>
            <input
              type="tel"
              name="phoneNumber"
              autoComplete="tel"
              placeholder="010-1234-5678"
              inputMode="numeric"
              maxLength="13"
              value={phoneNumber}
              aria-invalid={Boolean(errors.phoneNumber)}
              aria-describedby={errors.phoneNumber ? 'signup-phone-error' : undefined}
              onChange={(event) => {
                setPhoneNumber(formatPhoneNumber(event.target.value))
                clearError('phoneNumber')
              }}
            />
            {errors.phoneNumber && (
              <ValidationMessage id="signup-phone-error">{errors.phoneNumber}</ValidationMessage>
            )}
          </label>

          <div className={`field-group ${errors.address || errors.detailAddress ? 'has-error' : ''}`}>
            <label className="field-label" htmlFor="postalCode">주소</label>
            <div className="address-search-row">
              <input
                id="postalCode"
                type="text"
                name="postalCode"
                placeholder="우편번호"
                value={postalCode}
                readOnly
                aria-invalid={Boolean(errors.address)}
              />
              <button
                className="address-search-button"
                type="button"
                onClick={openPostcodeSearch}
              >
                우편번호 찾기
              </button>
            </div>
            <input
              type="text"
              name="roadAddress"
              placeholder="주소 검색 후 자동으로 입력됩니다"
              value={roadAddress}
              readOnly
              aria-invalid={Boolean(errors.address)}
              aria-describedby={errors.address ? 'signup-address-error' : undefined}
            />
            {errors.address && (
              <ValidationMessage id="signup-address-error">{errors.address}</ValidationMessage>
            )}
            <input
              ref={detailAddressRef}
              type="text"
              name="detailAddress"
              autoComplete="address-line2"
              maxLength="255"
              placeholder="상세 주소를 입력해 주세요"
              value={detailAddress}
              aria-invalid={Boolean(errors.detailAddress)}
              aria-describedby={errors.detailAddress ? 'signup-detail-address-error' : undefined}
              onChange={(event) => {
                setDetailAddress(event.target.value)
                clearError('detailAddress')
              }}
            />
            {errors.detailAddress && (
              <ValidationMessage id="signup-detail-address-error">
                {errors.detailAddress}
              </ValidationMessage>
            )}
          </div>

          <label className={`field-group ${errors.nickname ? 'has-error' : ''}`}>
            <span className="field-label">닉네임</span>
            <input
              type="text"
              name="nickname"
              autoComplete="nickname"
              minLength="2"
              maxLength="20"
              placeholder="2~20자로 입력해 주세요"
              value={nickname}
              aria-invalid={Boolean(errors.nickname)}
              aria-describedby={errors.nickname ? 'signup-nickname-error' : undefined}
              onChange={(event) => {
                setNickname(event.target.value)
                clearError('nickname')
              }}
            />
            {errors.nickname && (
              <ValidationMessage id="signup-nickname-error">{errors.nickname}</ValidationMessage>
            )}
          </label>

          <label className={`field-group ${errors.password ? 'has-error' : ''}`}>
            <span className="field-label">비밀번호</span>
            <span className="field-input-with-action">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                autoComplete="new-password"
                minLength="8"
                placeholder="8자 이상 입력해 주세요"
                value={password}
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? 'signup-password-error' : undefined}
                onChange={(event) => {
                  const value = event.target.value
                  setPassword(value)
                  setErrors((current) => {
                    const next = { ...current }
                    if (value.length > 0 && value.length < 8) {
                      next.password = '비밀번호는 8자 이상 입력해 주세요.'
                    } else {
                      delete next.password
                    }
                    delete next.passwordConfirm
                    return next
                  })
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
            </span>
            {errors.password && (
              <ValidationMessage id="signup-password-error">{errors.password}</ValidationMessage>
            )}
          </label>

          <label className={`field-group ${errors.passwordConfirm ? 'has-error' : ''}`}>
            <span className="field-label">비밀번호 확인</span>
            <span className="field-input-with-action">
              <input
                type={showPasswordConfirm ? 'text' : 'password'}
                name="passwordConfirm"
                autoComplete="new-password"
                minLength="8"
                placeholder="비밀번호를 다시 입력해 주세요"
                value={passwordConfirm}
                aria-invalid={Boolean(errors.passwordConfirm)}
                aria-describedby={errors.passwordConfirm ? 'signup-confirm-error' : undefined}
                onChange={(event) => {
                  setPasswordConfirm(event.target.value)
                  clearError('passwordConfirm')
                }}
              />
              <button
                className="password-toggle"
                type="button"
                aria-label={showPasswordConfirm ? '비밀번호 확인 숨기기' : '비밀번호 확인 표시하기'}
                aria-pressed={showPasswordConfirm}
                onClick={() => setShowPasswordConfirm((current) => !current)}
              >
                <EyeIcon crossed={!showPasswordConfirm} />
              </button>
            </span>
            {errors.passwordConfirm && (
              <ValidationMessage id="signup-confirm-error">{errors.passwordConfirm}</ValidationMessage>
            )}
          </label>

          <div className="agreement-group">
            <label className="agreement-row">
              <input
                type="checkbox"
                checked={agreement}
                aria-invalid={Boolean(errors.agreement)}
                aria-describedby={errors.agreement ? 'signup-agreement-error' : undefined}
                onChange={(event) => {
                  setAgreement(event.target.checked)
                  clearError('agreement')
                }}
              />
              <span>이용약관 및 개인정보처리방침에 동의합니다.</span>
            </label>
            {errors.agreement && (
              <ValidationMessage id="signup-agreement-error">{errors.agreement}</ValidationMessage>
            )}
          </div>

          {message && (
            <p className="signup-message" role="status">
              {message}
            </p>
          )}

          <button
            className="primary-button signup-submit"
            type="submit"
            disabled={loading}
          >
            {loading ? '가입 중...' : '회원가입하기'}
          </button>
        </form>

        <p className="login-guide">
          이미 계정이 있나요? <Link to="/login">로그인</Link>
        </p>
      </section>
    </main>
  )
}

export default SignupPage
