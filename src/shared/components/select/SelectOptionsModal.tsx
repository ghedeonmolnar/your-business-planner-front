import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Modal, Pressable, View } from 'react-native';
import { Surface, Text } from 'react-native-paper';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { IconButton } from '@/shared/components/IconButton';
import { SearchField } from '@/shared/components/SearchField';
import { SelectOptionRow } from '@/shared/components/select/SelectOptionRow';
import {
  filterSelectOptions,
  SelectOption,
  SelectValue,
  SelectOptionsState,
} from '@/shared/components/select/selectOptions';
import { selectOptionsModalStyles as styles } from '@/shared/components/select/selectOptionsModalStyles';
import { theme } from '@/shared/theme/theme';
import { QueryState } from '@/shared/components/QueryState';
import { PaginationFooter } from '@/shared/components/PaginationFooter';
import { SelectModalActions } from '@/shared/components/select/SelectModalActions';
import { useDialogLayout } from '@/shared/hooks/useDialogLayout';

const SEARCH_FROM_OPTIONS = 7;

type SelectOptionsModalProps<TValue extends SelectValue> = {
  visible: boolean;
  label: string;
  options: SelectOption<TValue>[];
  selectedValues: TValue[];
  single: boolean;
  allowClear: boolean;
  noItemsText: string;
  searchPlaceholder: string;
  onClose: () => void;
  onChange: (selectedValues: TValue[]) => void;
  disabled?: boolean;
  optionsState?: SelectOptionsState;
};

export function SelectOptionsModal<TValue extends SelectValue>({
  visible,
  label,
  options,
  selectedValues,
  single,
  allowClear,
  noItemsText,
  searchPlaceholder,
  onClose,
  onChange,
  disabled = false,
  optionsState,
}: SelectOptionsModalProps<TValue>) {
  const { modalMaxHeight, overlayInsets } = useDialogLayout(
    visible,
    'selection',
  );
  const [query, setQuery] = useState('');
  const [draftValues, setDraftValues] = useState<TValue[]>(selectedValues);
  const selectionKey = JSON.stringify(selectedValues);
  const previous = useRef({ visible: false, selectionKey });

  useEffect(() => {
    if (
      visible &&
      (!previous.current.visible ||
        previous.current.selectionKey !== selectionKey)
    ) {
      setDraftValues(selectedValues);
      setQuery('');
    }
    previous.current = { visible, selectionKey };
  }, [selectedValues, visible, selectionKey]);

  const isSearchable = options.length >= SEARCH_FROM_OPTIONS;
  const filteredOptions = useMemo(
    () => filterSelectOptions(options, query),
    [options, query],
  );
  const canClearSelection = single
    ? selectedValues.length > 0
    : draftValues.length > 0;

  const selectOption = (option: SelectOption<TValue>) => {
    if (disabled || option.disabled) {
      return;
    }

    if (single) {
      onChange([option.id]);
      onClose();
      return;
    }

    setDraftValues(currentValues =>
      currentValues.includes(option.id)
        ? currentValues.filter(value => value !== option.id)
        : [...currentValues, option.id],
    );
  };

  const clearSelection = () => {
    if (disabled) return;
    if (single) {
      onChange([]);
      onClose();
      return;
    }

    setDraftValues([]);
  };

  const confirmSelection = () => {
    if (disabled) return;
    onChange(draftValues);
    onClose();
  };

  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View style={[styles.modalRoot, overlayInsets]}>
        <Pressable
          accessibilityLabel="Închide lista"
          onPress={onClose}
          style={styles.backdrop}
        />
        <Surface
          elevation={3}
          style={[styles.panel, { maxHeight: modalMaxHeight }]}
        >
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={styles.title}>{label}</Text>
              {!single && draftValues.length ? (
                <Text style={styles.selectionCount}>
                  {draftValues.length} selectate
                </Text>
              ) : null}
            </View>
            <IconButton
              accessibilityLabel="Închide lista"
              icon="close"
              onPress={onClose}
            />
          </View>

          <QueryState
            loading={Boolean(optionsState?.loading)}
            error={
              optionsState?.pagination?.error ? undefined : optionsState?.error
            }
            hasData={options.length > 0}
            retry={optionsState?.onRetry}
          />

          {isSearchable ? (
            <View style={styles.searchField}>
              <SearchField
                testID="select-search"
                label={searchPlaceholder}
                onChange={setQuery}
                placeholder={searchPlaceholder}
                value={query}
              />
            </View>
          ) : null}

          <FlatList
            contentContainerStyle={
              filteredOptions.length
                ? styles.listContent
                : styles.emptyListContent
            }
            data={filteredOptions}
            keyboardShouldPersistTaps="handled"
            keyExtractor={option => `${typeof option.id}:${option.id}`}
            ListEmptyComponent={
              !optionsState?.loading && !optionsState?.error ? (
                <View style={styles.emptyState}>
                  <Ionicons
                    color={theme.colors.subtle}
                    name="search-outline"
                    size={28}
                  />
                  <Text style={styles.emptyText}>
                    {query ? 'Niciun rezultat pentru căutarea ta' : noItemsText}
                  </Text>
                </View>
              ) : undefined
            }
            renderItem={({ item }) => (
              <SelectOptionRow
                onPress={selectOption}
                option={disabled ? { ...item, disabled: true } : item}
                selected={draftValues.includes(item.id)}
                single={single}
              />
            )}
            showsVerticalScrollIndicator={false}
            style={styles.list}
          />

          {optionsState?.pagination ? (
            <PaginationFooter
              {...optionsState.pagination}
              hint={
                optionsState.pagination.hasMore
                  ? 'Căutarea se aplică opțiunilor încărcate.'
                  : undefined
              }
            />
          ) : null}

          {(allowClear && canClearSelection) || !single ? (
            <View style={styles.footer}>
              <SelectModalActions
                single={single}
                canClear={allowClear && canClearSelection}
                disabled={disabled}
                onClear={clearSelection}
                onConfirm={confirmSelection}
              />
            </View>
          ) : null}
        </Surface>
      </View>
    </Modal>
  );
}
