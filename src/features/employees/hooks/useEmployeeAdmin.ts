import { useState } from 'react';
import {
  useCreateEmployee,
  useDeleteEmployee,
  useForceDeleteEmployee,
  useUpdateEmployee,
  useReloadEmployeeProfile,
} from '@/features/employees/hooks/useEmployees';
import { EmployeeFormValues } from '@/features/employees/schemas/employeeSchema';
import { Employee } from '@/features/employees/types';
import { confirmAction } from '@/shared/feedback/confirmAction';
import { showError } from '@/shared/feedback/showError';
import { apiErrorCode } from '@/shared/api/apiError';
import { getSessionGeneration } from '@/shared/api/sessionExpiry';
import { assertCurrentRequestSession } from '@/shared/api/requestSession';

export const useEmployeeAdmin = () => {
  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();
  const deleteEmployee = useDeleteEmployee();
  const forceDeleteEmployee = useForceDeleteEmployee();
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [isFormVisible, setFormVisible] = useState(false);
  const [conflict, setConflict] = useState(false);
  const [generation] = useState(getSessionGeneration);
  const reloadEmployee = useReloadEmployeeProfile();

  const openCreate = () => {
    setConflict(false);
    setEditingEmployee(null);
    setFormVisible(true);
  };

  const openEdit = (employee: Employee) => {
    setConflict(false);
    setEditingEmployee(employee);
    setFormVisible(true);
  };

  const closeForm = () => {
    setEditingEmployee(null);
    setFormVisible(false);
  };

  const save = (values: EmployeeFormValues) => {
    if (conflict || generation !== getSessionGeneration()) return;
    const onError = (mutationError: unknown) => {
      if (apiErrorCode(mutationError) === 'RESOURCE_VERSION_CONFLICT')
        setConflict(true);
      showError(mutationError, 'Nu am putut salva angajatul.');
    };

    if (editingEmployee) {
      updateEmployee.mutate(
        {
          id: editingEmployee.id,
          payload: { ...values, version: editingEmployee.version },
        },
        { onSuccess: closeForm, onError },
      );
      return;
    }

    createEmployee.mutate(values, { onSuccess: closeForm, onError });
  };

  const confirmPermanentDelete = (employee: Employee) => {
    confirmAction({
      destructive: true,
      title: 'Ștergere definitivă',
      message: `Sigur dorești să ștergi angajatul ${employee.name}?`,
      cancelLabel: 'Nu',
      confirmLabel: 'Da',
      onConfirm: () => {
        const actionGeneration = getSessionGeneration();

        return forceDeleteEmployee
          .mutateAsync({ id: employee.id, version: employee.version })
          .catch(mutationError => {
            if (actionGeneration !== getSessionGeneration()) return;
            showError(mutationError, 'Nu am putut șterge definitiv angajatul.');
          });
      },
    });
  };

  const confirmDelete = (employee: Employee) => {
    if (!employee.is_active) {
      confirmPermanentDelete(employee);
      return;
    }

    confirmAction({
      destructive: true,
      title: 'Dezactivare angajat',
      message: `Angajatul ${employee.name} va fi trecut în inactiv. Apasă din nou pe coș pentru ștergerea definitivă.`,
      confirmLabel: 'Dezactivează',
      onConfirm: () => {
        const actionGeneration = getSessionGeneration();

        return deleteEmployee
          .mutateAsync({ id: employee.id, version: employee.version })
          .catch(mutationError => {
            if (actionGeneration !== getSessionGeneration()) return;
            showError(mutationError, 'Nu am putut șterge angajatul.');
          });
      },
    });
  };

  return {
    conflict,
    reloadCurrent: async () => {
      if (!editingEmployee) return;
      const current = await reloadEmployee.mutateAsync(editingEmployee.id);
      assertCurrentRequestSession(generation);
      setEditingEmployee(current);
      setConflict(false);
    },
    closeForm,
    confirmDelete,
    editingEmployee,
    isFormVisible,
    isSaving: createEmployee.isPending || updateEmployee.isPending,
    isDeleting: deleteEmployee.isPending || forceDeleteEmployee.isPending,
    openCreate,
    openEdit,
    save,
  };
};
