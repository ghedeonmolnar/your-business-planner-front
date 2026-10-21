import React, { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  View,
} from 'react-native';
import { Surface, Text } from 'react-native-paper';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { AppButton } from '@/shared/components/AppButton';
import { IconButton } from '@/shared/components/IconButton';
import { SearchField } from '@/shared/components/SearchField';
import { SelectOptionRow } from '@/shared/components/select/SelectOptionRow';
import {
  filterSelectOptions,
  SelectOption,
  SelectValue,
} from '@/shared/components/select/selectOptions';
import {
  EMPTY_LIST_HEIGHT,
  OPTION_ROW_HEIGHT,
  selectOptionsModalStyles as styles,
} from '@/shared/components/select/selectOptionsModalStyles';
import { theme } from '@/shared/theme/theme';

const SEARCH_FROM_OPTIONS = 7;
const MAX_LIST_HEIGHT = 360;

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
}: SelectOptionsModalProps<TValue>) {
  const [query, setQuery] = useState('');
  const [draftValues, setDraftValues] = useState<TValue[]>(selectedValues);

  useEffect(() => {
    if (visible) {
      setDraftValues(selectedValues);
      setQuery('');
    }
  }, [selectedValues, visible]);

  const isSearchable = options.length >= SEARCH_FROM_OPTIONS;
  const filteredOptions = useMemo(
    () => filterSelectOptions(options, query),
    [options, query],
  );
  const listHeight = Math.min(
    Math.max(options.length * OPTION_ROW_HEIGHT, EMPTY_LIST_HEIGHT),
    MAX_LIST_HEIGHT,
  );
  const canClearSelection = single
    ? selectedValues.length > 0
    : draftValues.length > 0;

  const selectOption = (option: SelectOption<TValue>) => {
    if (option.disabled) {
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
    if (single) {
      onChange([]);
      onClose();
      return;
    }

    setDraftValues([]);
  };

  const confirmSelection = () => {
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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalRoot}
      >
        <Pressable
          accessibilityLabel="Închide lista"
          onPress={onClose}
          style={styles.backdrop}
        />
        <Surface elevation={3} style={styles.panel}>
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

          {isSearchable ? (
            <View style={styles.searchField}>
              <SearchField
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
            }
            renderItem={({ item }) => (
              <SelectOptionRow
                onPress={selectOption}
                option={item}
                selected={draftValues.includes(item.id)}
                single={single}
              />
            )}
            showsVerticalScrollIndicator={false}
            style={[styles.list, { height: listHeight }]}
          />

          {(allowClear && canClearSelection) || !single ? (
            <View style={styles.footer}>
              {allowClear && canClearSelection ? (
                <AppButton
                  label="Golește selecția"
                  onPress={clearSelection}
                  shape="rounded"
                  size="small"
                  style={styles.footerButton}
                  variant="ghost"
                />
              ) : null}
              {!single ? (
                <AppButton
                  label="Confirmă"
                  onPress={confirmSelection}
                  shape="rounded"
                  size="small"
                  style={styles.footerButton}
                />
              ) : null}
            </View>
          ) : null}
        </Surface>
      </KeyboardAvoidingView>
    </Modal>
  );
}
