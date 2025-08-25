import ProtectedLayout from '@/components/layout/ProtectedLayout'
import DashboardContent from './components/DashboardContent'

export default function DashboardPage() {
  return (
    <ProtectedLayout>
      <DashboardContent />
    </ProtectedLayout>
  )
}
