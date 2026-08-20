import { Link } from 'react-router-dom'
import Layout from '../../../components/common/Layout/Layout'
import '../profile.css'

export default function RequireLogin() {
  return (
    <Layout>
      <div className="profile-page">
        <div className="profile-content profile-login-required">
          <p>로그인이 필요한 페이지예요.</p>
          <Link to="/login" className="profile-btn-outline">
            로그인하러 가기
          </Link>
        </div>
      </div>
    </Layout>
  )
}
