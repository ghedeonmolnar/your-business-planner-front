import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useWatch } from 'react-hook-form';
import {
  eventFormStyles,
  SectionTitle,
} from '@/features/events/components/eventForm/EventFormSection';
import { EventFormControl } from '@/features/events/components/eventForm/types';
import { EventFormInput } from '@/features/events/schemas/eventSchema';
import { Employee } from '@/features/employees/types';
import { Mascot } from '@/features/mascots/types';
import { ControlledSelectField } from '@/shared/components/ControlledSelectField';
import { theme } from '@/shared/theme/theme';

type EmployeeAvailability = {
  id: string;
  is_available: boolean;
  conflict: {
    start_time: string;
    end_time: string;
    location: string | null;
  } | null;
};

type AssignmentsStepProps = {
  assignments: EventFormInput['assignments'];
  availability: EmployeeAvailability[];
  availabilityLoading: boolean;
  control: EventFormControl;
  employees: Employee[];
  mascots: Mascot[];
  scheduleComplete: boolean;
};

type AnimatorAssignmentFieldProps = Omit<AssignmentsStepProps, 'mascots'> & {
  assignmentIndex: number;
  mascot: Mascot;
};

export function AssignmentsStep({
  assignments,
  availability,
  availabilityLoading,
  control,
  employees,
  mascots,
  scheduleComplete,
}: AssignmentsStepProps) {
  return (
    <View>
      <SectionTitle title="Animatori" />
      <Text style={eventFormStyles.sectionDescription}>
        Alege câte un animator pentru fiecare mascotă. La rezervările cu detalii
        parțiale poți lăsa asignările necompletate.
      </Text>
      {assignments.map((assignment, index) => {
        const mascot = mascots.find(item => item.id === assignment.mascot_id);

        if (!mascot) {
          return null;
        }

        return (
          <AnimatorAssignmentField
            assignmentIndex={index}
            assignments={assignments}
            availability={availability}
            availabilityLoading={availabilityLoading}
            control={control}
            employees={employees}
            key={assignment.mascot_id}
            mascot={mascot}
            scheduleComplete={scheduleComplete}
          />
        );
      })}
    </View>
  );
}

function AnimatorAssignmentField({
  assignmentIndex,
  assignments,
  availability,
  availabilityLoading,
  control,
  employees,
  mascot,
  scheduleComplete,
}: AnimatorAssignmentFieldProps) {
  const selectedEmployeeId = useWatch({
    control,
    name: `assignments.${assignmentIndex}.employee_id`,
  });
  const availabilityById = new Map(availability.map(item => [item.id, item]));
  const selectedElsewhere = new Set(
    assignments
      .filter((_, index) => index !== assignmentIndex)
      .map(item => item.employee_id)
      .filter(Boolean),
  );

  const options = employees
    .filter(
      employee => employee.is_active || employee.id === selectedEmployeeId,
    )
    .map(employee => {
      const employeeAvailability = availabilityById.get(employee.id);
      const isBusy =
        scheduleComplete && employeeAvailability?.is_available === false;
      const isAlreadySelected = selectedElsewhere.has(employee.id);
      const conflict = employeeAvailability?.conflict;
      let description: string | undefined;

      if (isBusy && conflict) {
        description = `Ocupat ${conflict.start_time}-${conflict.end_time}, ${
          conflict.location ?? 'locație necompletată'
        }`;
      } else if (isAlreadySelected) {
        description = 'Deja ales pentru altă mascotă';
      } else if (!employee.is_active) {
        description = 'Angajat inactiv';
      } else if (scheduleComplete && availabilityLoading) {
        description = 'Se verifică disponibilitatea...';
      }

      return {
        id: employee.id,
        name: employee.name,
        description,
        disabled:
          isBusy ||
          isAlreadySelected ||
          !employee.is_active ||
          (scheduleComplete && availabilityLoading),
      };
    });

  return (
    <View style={styles.assignmentCard}>
      <Text style={styles.assignmentTitle}>{mascot.name}</Text>
      <ControlledSelectField
        control={control}
        label={`Animator ${mascot.name}`}
        name={`assignments.${assignmentIndex}.employee_id`}
        noItemsText="Nu există angajați activi"
        options={options}
        placeholder="Alege animatorul"
        searchPlaceholder="Caută animator..."
        single
        singleEmptyValue=""
      />
    </View>
  );
}

const styles = StyleSheet.create({
  assignmentCard: {
    backgroundColor: theme.colors.surfaceMuted,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.md,
  },
  assignmentTitle: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.bodyBold,
    fontSize: theme.typography.bodyLarge,
    marginBottom: theme.spacing.sm,
  },
});
