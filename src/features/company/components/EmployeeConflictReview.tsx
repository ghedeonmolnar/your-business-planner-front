import { useState } from 'react';
import { DirectoryItem } from '@/features/company/types';
import { useReloadEmployeeDirectory } from '@/features/company/hooks/useReloadEmployeeDirectory';
import { VersionConflictNotice } from '@/shared/components/VersionConflictNotice';
import { getSessionGeneration } from '@/shared/api/sessionExpiry';
import { assertCurrentRequestSession } from '@/shared/api/requestSession';

export function EmployeeConflictReview({
  employeeId,
  onReload,
}: {
  employeeId: string;
  onReload: (employee: DirectoryItem) => void;
}) {
  const reload = useReloadEmployeeDirectory();
  const [generation] = useState(getSessionGeneration);
  return (
    <VersionConflictNotice
      onReload={async () => {
        const current = await reload.mutateAsync(employeeId);
        assertCurrentRequestSession(generation);
        onReload(current);
      }}
    />
  );
}
