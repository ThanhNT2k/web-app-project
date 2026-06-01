import { useAuth } from '../contexts/AuthContext';
import UserProfile from '../components/UserProfile';

export default function UserProfilePage() {
  const { user } = useAuth();

  return (
    <div className="container py-5">
      <UserProfile user={user} />
    </div>
  );
}