import { useState } from 'react';
import {
  useCreateEmployee,
  useDeleteEmployee,
  useForceDeleteEmployee,
  useUpdateEmployee,
} from '@/features/employees/hooks/useEmployees';
import { EmployeeFormValues } from '@/features/employees/schemas/employeeSchema';
import { Employee } from '@/features/employees/types';
import { confirmAction } from '@/shared/feedback/confirmAction';
import { showError } from '@/shared/feedback/showError';

export const useEmployeeAdmin = () => {
  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();
  const deleteEmployee = useDeleteEmployee();
  const forceDeleteEmployee = useForceDeleteEmployee();
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [isFormVisible, setFormVisible] = useState(false);

  const openCreate = () => {
    setEditingEmployee(null);
    setFormVisible(true);
  };

  const openEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormVisible(true);
  };

  const closeForm = () => {
    setEditingEmployee(null);
    setFormVisible(false);
  };

  const save = (values: EmployeeFormValues) => {
    const onError = (mutationError: unknown) => {
      showError(mutationError, 'Nu am putut salva angajatul.');
    };

    if (editingEmployee) {
      updateEmployee.mutate(
        { id: editingEmployee.id, payload: values },
        { onSuccess: closeForm, onError },
      );
      return;
    }

    createEmployee.mutate(values, { onSuccess: closeForm, onError });
  };

  const confirmPermanentDelete = (employee: Employee) => {
    confirmAction({
      title: 'Ștergere definitivă',
      message: `Sigur dorești să ștergi angajatul ${employee.name}?`,
      cancelLabel: 'Nu',
      confirmLabel: 'Da',
      onConfirm: () => {
        forceDeleteEmployee.mutate(employee.id, {
          onError: mutationError => {
            showError(mutationError, 'Nu am putut șterge definitiv angajatul.');
          },
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
      title: 'Dezactivare angajat',
      message: `Angajatul ${employee.name} va fi trecut în inactiv. Apasă din nou pe coș pentru ștergerea definitivă.`,
      confirmLabel: 'Dezactivează',
      onConfirm: () => {
        deleteEmployee.mutate(employee.id, {
          onError: mutationError => {
            showError(mutationError, 'Nu am putut șterge angajatul.');
          },
        });
      },
    });
  };

  return {
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
