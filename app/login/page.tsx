

import LoginPageView from '@/views/LoginPageView';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login',
  description: 'This is the login page for LendTrack application. You can also toggle to the registration form if you do not have an account yet.',
};

const AuthPage: React.FC = () => {
  return <LoginPageView />
};

export default AuthPage;