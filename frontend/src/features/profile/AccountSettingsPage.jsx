import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/common/Layout/Layout'
import RequireLogin from './components/RequireLogin'
import useCurrentMember from './hooks/useCurrentMember'
import { changeAccountPassword, fetchAccount, updateAccount, withdrawAccount } from './api/accountApi'
import './account-settings.css'

const menus = [
  { id: 'info', label: '내 정보' },
  { id: 'password', label: '비밀번호 변경' },
  { id: 'inquiry', label: '문의하기' },
  { id: 'terms', label: '이용 약관' },
  { id: 'privacy', label: '개인정보처리 방침' },
  { id: 'withdraw', label: '회원탈퇴', danger: true },
]

export default function AccountSettingsPage() {
  const currentMember = useCurrentMember()
  const navigate = useNavigate()
  const [active, setActive] = useState('info')
  const [account, setAccount] = useState(null)
  const [form, setForm] = useState({ phoneNumber: '', postalCode: '', roadAddress: '', detailAddress: '' })
  const [password, setPassword] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [withdrawPassword, setWithdrawPassword] = useState('')
  const [withdrawConfirmOpen, setWithdrawConfirmOpen] = useState(false)
  const [passwordMismatchOpen, setPasswordMismatchOpen] = useState(false)
  const [passwordChangeConfirmOpen, setPasswordChangeConfirmOpen] = useState(false)
  const [currentPasswordErrorOpen, setCurrentPasswordErrorOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!currentMember) return
    fetchAccount().then((data) => {
      setAccount(data)
      setForm({
        phoneNumber: data.phoneNumber ?? '', postalCode: data.postalCode ?? '',
        roadAddress: data.roadAddress ?? '', detailAddress: data.detailAddress ?? '',
      })
    }).catch((err) => setError(err.message))
  }, [currentMember])

  useEffect(() => {
    if (!withdrawConfirmOpen && !passwordMismatchOpen && !passwordChangeConfirmOpen && !currentPasswordErrorOpen) return undefined
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !busy) {
        setWithdrawConfirmOpen(false)
        setPasswordMismatchOpen(false)
        setPasswordChangeConfirmOpen(false)
        setCurrentPasswordErrorOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [busy, currentPasswordErrorOpen, passwordChangeConfirmOpen, passwordMismatchOpen, withdrawConfirmOpen])

  if (currentMember === undefined) return <Layout><div className="account-settings-state">확인 중입니다...</div></Layout>
  if (currentMember === null) return <RequireLogin />

  const passwordConfirmMismatch = password.confirmPassword !== ''
    && password.newPassword !== password.confirmPassword

  const selectMenu = (id) => { setActive(id); setMessage(''); setError('') }
  const saveInfo = async (event) => {
    event.preventDefault(); setBusy(true); setMessage(''); setError('')
    try { setAccount(await updateAccount(form)); setMessage('회원정보가 수정되었습니다.') }
    catch (err) { setError(err.message) } finally { setBusy(false) }
  }
  const savePassword = async (event) => {
    event.preventDefault(); setMessage(''); setError('')
    if (password.newPassword !== password.confirmPassword) {
      setPasswordMismatchOpen(true)
      return
    }
    setPasswordChangeConfirmOpen(true)
  }
  const confirmPasswordChange = async () => {
    setPasswordChangeConfirmOpen(false)
    setBusy(true)
    try {
      const data = await changeAccountPassword({ currentPassword: password.currentPassword, newPassword: password.newPassword })
      setPassword({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setActive('info')
      setMessage(data.message)
    } catch (err) {
      if (err.message === '잘못된 비밀번호입니다.' || err.message.includes('현재 비밀번호')) {
        setCurrentPasswordErrorOpen(true)
      } else {
        setError(err.message)
      }
    } finally { setBusy(false) }
  }
  const handleWithdraw = async () => {
    setBusy(true); setError('')
    try { await withdrawAccount(withdrawPassword); navigate('/login', { replace: true }) }
    catch (err) { setWithdrawConfirmOpen(false); setError(err.message) } finally { setBusy(false) }
  }

  return (
    <Layout>
      <main className="account-settings-page">
        <div className="account-settings-heading">
          <button type="button" onClick={() => navigate('/profile')} aria-label="프로필로 돌아가기">←</button>
          <h1>계정설정</h1>
        </div>
        <div className="account-settings-layout">
          <nav className="account-settings-nav" aria-label="계정설정 메뉴">
            {menus.map((menu) => <button key={menu.id} type="button" className={`${active === menu.id ? 'is-active' : ''}${menu.danger ? ' is-danger' : ''}`} onClick={() => selectMenu(menu.id)}><span>{menu.label}</span><span aria-hidden="true">›</span></button>)}
          </nav>
          <section className="account-settings-panel">
            {active === 'info' && <form onSubmit={saveInfo}>
              <PanelTitle title="내 정보" description="가입한 계정과 연락처 정보를 확인하고 수정할 수 있어요." />
              <Field label="이메일 주소"><input value={account?.email ?? currentMember.email} disabled /></Field>
              <Field label="휴대전화번호"><input value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} placeholder="01012345678" required /></Field>
              <div className="account-settings-address-row">
                <Field label="우편번호"><input value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} /></Field>
                <Field label="주소"><input value={form.roadAddress} onChange={(e) => setForm({ ...form, roadAddress: e.target.value })} required /></Field>
              </div>
              <Field label="상세주소"><input value={form.detailAddress} onChange={(e) => setForm({ ...form, detailAddress: e.target.value })} /></Field>
              <SubmitButton busy={busy}>변경사항 저장</SubmitButton>
            </form>}
            {active === 'password' && <form onSubmit={savePassword}>
              <PanelTitle title="비밀번호 변경" description="안전한 계정 사용을 위해 8자 이상의 비밀번호를 사용해 주세요." />
              <Field label="현재 비밀번호"><input type="password" value={password.currentPassword} onChange={(e) => setPassword({ ...password, currentPassword: e.target.value })} required /></Field>
              <Field label="새 비밀번호"><input type="password" minLength="8" value={password.newPassword} onChange={(e) => setPassword({ ...password, newPassword: e.target.value })} required /></Field>
              <Field label="새 비밀번호 확인">
                <input
                  type="password"
                  minLength="8"
                  value={password.confirmPassword}
                  aria-invalid={passwordConfirmMismatch}
                  aria-describedby={passwordConfirmMismatch ? 'password-confirm-error' : undefined}
                  onChange={(e) => setPassword({ ...password, confirmPassword: e.target.value })}
                  required
                />
                {passwordConfirmMismatch && <span id="password-confirm-error" className="account-settings-field-error" role="alert">새 비밀번호가 일치하지 않습니다.</span>}
              </Field>
              <SubmitButton busy={busy}>비밀번호 변경</SubmitButton>
            </form>}
            {active === 'inquiry' && <TextPanel title="문의하기"><p>FESTLOG 이용 중 궁금한 점이나 불편한 사항이 있다면 문의해 주세요.</p><a className="account-settings-primary-link" href="mailto:festlog@festlog.co.kr?subject=FESTLOG 문의">이메일로 문의하기</a></TextPanel>}
            {active === 'terms' && <TextPanel title="이용 약관"><h3>FESTLOG 서비스 이용약관</h3><p>회원은 서비스를 관련 법령과 본 약관에 따라 이용해야 합니다. 타인의 권리를 침해하거나 서비스 운영을 방해하는 행위는 제한될 수 있습니다.</p><p>유료 서비스와 거래 기능의 세부 조건은 각 결제 화면에 별도로 안내됩니다.</p></TextPanel>}
            {active === 'privacy' && <TextPanel title="개인정보처리 방침"><h3>수집 및 이용 안내</h3><p>FESTLOG는 회원가입과 서비스 제공을 위해 이메일, 휴대전화번호 및 배송에 필요한 주소를 처리합니다.</p><p>개인정보는 회원탈퇴 또는 보유 목적 달성 시 관련 법령이 정한 기간을 제외하고 안전하게 파기합니다.</p></TextPanel>}
            {active === 'withdraw' && <TextPanel title="회원탈퇴"><p>탈퇴하면 프로필을 이용할 수 없으며 다시 되돌릴 수 없습니다.</p><Field label="현재 비밀번호"><input type="password" value={withdrawPassword} onChange={(e) => setWithdrawPassword(e.target.value)} placeholder="소셜 로그인 계정은 입력하지 않아도 됩니다" /></Field><button type="button" className="account-settings-withdraw" disabled={busy} onClick={() => setWithdrawConfirmOpen(true)}>회원탈퇴</button></TextPanel>}
            {message && <p className="account-settings-message" role="status">{message}</p>}
            {error && <p className="account-settings-error" role="alert">{error}</p>}
          </section>
        </div>

        {withdrawConfirmOpen && (
          <div className="account-confirm-backdrop" onMouseDown={() => !busy && setWithdrawConfirmOpen(false)}>
            <section
              className="account-confirm-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="withdraw-confirm-title"
              onMouseDown={(event) => event.stopPropagation()}
            >
              <div className="account-confirm-icon" aria-hidden="true">!</div>
              <h2 id="withdraw-confirm-title">정말 탈퇴하시겠습니까?</h2>
              <p>탈퇴 후에는 계정과 프로필을 다시 복구할 수 없습니다.</p>
              <div className="account-confirm-actions">
                <button type="button" className="account-confirm-cancel" disabled={busy} onClick={() => setWithdrawConfirmOpen(false)}>취소</button>
                <button type="button" className="account-confirm-danger" disabled={busy} onClick={handleWithdraw}>{busy ? '처리 중...' : '탈퇴하기'}</button>
              </div>
            </section>
          </div>
        )}

        {passwordMismatchOpen && (
          <div className="account-confirm-backdrop" onMouseDown={() => setPasswordMismatchOpen(false)}>
            <section
              className="account-confirm-modal"
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="password-mismatch-title"
              onMouseDown={(event) => event.stopPropagation()}
            >
              <div className="account-confirm-icon" aria-hidden="true">!</div>
              <h2 id="password-mismatch-title">비밀번호를 확인해 주세요</h2>
              <p>새 비밀번호가 서로 일치하지 않습니다.</p>
              <div className="account-confirm-actions account-confirm-actions--single">
                <button type="button" className="account-confirm-primary" onClick={() => setPasswordMismatchOpen(false)}>확인</button>
              </div>
            </section>
          </div>
        )}

        {passwordChangeConfirmOpen && (
          <div className="account-confirm-backdrop" onMouseDown={() => setPasswordChangeConfirmOpen(false)}>
            <section
              className="account-confirm-modal account-confirm-modal--wide"
              role="dialog"
              aria-modal="true"
              aria-labelledby="password-change-confirm-title"
              onMouseDown={(event) => event.stopPropagation()}
            >
              <div className="account-confirm-question" aria-hidden="true">?</div>
              <h2 id="password-change-confirm-title">비밀번호를 변경하시겠습니까?</h2>
              <p>변경 후 다음 로그인부터 새 비밀번호를 사용하게 됩니다.</p>
              <div className="account-confirm-actions">
                <button type="button" className="account-confirm-cancel" onClick={() => setPasswordChangeConfirmOpen(false)}>취소</button>
                <button type="button" className="account-confirm-primary" onClick={confirmPasswordChange}>변경하기</button>
              </div>
            </section>
          </div>
        )}

        {currentPasswordErrorOpen && (
          <div className="account-confirm-backdrop" onMouseDown={() => setCurrentPasswordErrorOpen(false)}>
            <section
              className="account-confirm-modal"
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="current-password-error-title"
              onMouseDown={(event) => event.stopPropagation()}
            >
              <div className="account-confirm-icon" aria-hidden="true">!</div>
              <h2 id="current-password-error-title">비밀번호를 확인해 주세요</h2>
              <p>잘못된 비밀번호입니다.</p>
              <div className="account-confirm-actions account-confirm-actions--single">
                <button type="button" className="account-confirm-primary" onClick={() => setCurrentPasswordErrorOpen(false)}>확인</button>
              </div>
            </section>
          </div>
        )}
      </main>
    </Layout>
  )
}

function PanelTitle({ title, description }) { return <header className="account-settings-panel-title"><h2>{title}</h2>{description && <p>{description}</p>}</header> }
function Field({ label, children }) { return <label className="account-settings-field"><span>{label}</span>{children}</label> }
function SubmitButton({ busy, children }) { return <button type="submit" className="account-settings-submit" disabled={busy}>{busy ? '처리 중...' : children}</button> }
function TextPanel({ title, children }) { return <div className="account-settings-text"><PanelTitle title={title} description="" />{children}</div> }
