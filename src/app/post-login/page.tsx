import { redirect } from 'next/navigation';
import { currentUser } from '@/server/session';
import { isStaff } from '@/lib/rbac';

// Central post-login router: sends each user to the right area by role/state.
export default async function PostLoginPage() {
  const user = await currentUser();
  if (!user) redirect('/login');
  if (user.mustChangePassword) redirect('/change-password');
  if (isStaff(user.role)) redirect('/admin');
  redirect('/portal');
}
