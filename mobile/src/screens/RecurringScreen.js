import React, { useEffect, useState, useCallback } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native'
import {
  getRecurringTransactions,
  addRecurringTransaction,
  deleteRecurringTransaction,
  pauseRecurringTransaction,
  resumeRecurringTransaction,
} from '../services/api'
import { useCurrency } from '../hooks/useCurrency'

const FREQUENCIES = ['daily', 'weekly', 'monthly', 'yearly']

// Mobile port of the web app's Recurring page (frontend/src/pages/RecurringPage).
// Lists recurring transactions and lets the user add, pause/resume, or delete them.
export default function RecurringScreen() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [type, setType] = useState('expense')
  const [category, setCategory] = useState('')
  const [amount, setAmount] = useState('')
  const [frequencyIndex, setFrequencyIndex] = useState(2)
  const [submitting, setSubmitting] = useState(false)
  const { format } = useCurrency()

  const loadItems = useCallback(() => {
    setLoading(true)
    getRecurringTransactions()
      .then(({ data }) => setItems(data.recurringTransactions || data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    loadItems()
  }, [loadItems])

  const handleAdd = async () => {
    if (!category || !amount) return
    setSubmitting(true)
    try {
      await addRecurringTransaction({
        type,
        category,
        amount: parseFloat(amount),
        frequency: FREQUENCIES[frequencyIndex],
        startDate: new Date().toISOString().split('T')[0],
      })
      setCategory('')
      setAmount('')
      loadItems()
    } catch {
      // surfaced via empty state / retry for now
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteRecurringTransaction(id)
      setItems((prev) => prev.filter((i) => i._id !== id))
    } catch {
      // no-op; list will resync on next load
    }
  }

  const handleToggle = async (item) => {
    try {
      if (item.isPaused) {
        await resumeRecurringTransaction(item._id)
      } else {
        await pauseRecurringTransaction(item._id)
      }
      loadItems()
    } catch {
      // no-op; list will resync on next load
    }
  }

  const cycleFrequency = () => {
    setFrequencyIndex((prev) => (prev + 1) % FREQUENCIES.length)
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recurring</Text>

      <View style={styles.form}>
        <View style={styles.typeRow}>
          <TouchableOpacity
            style={[styles.typeButton, type === 'expense' && styles.typeButtonActive]}
            onPress={() => setType('expense')}
          >
            <Text style={type === 'expense' ? styles.typeTextActive : styles.typeText}>Expense</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeButton, type === 'income' && styles.typeButtonActive]}
            onPress={() => setType('income')}
          >
            <Text style={type === 'income' ? styles.typeTextActive : styles.typeText}>Income</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          style={styles.input}
          placeholder="Category"
          value={category}
          onChangeText={setCategory}
        />
        <TextInput
          style={styles.input}
          placeholder="Amount"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />
        <TouchableOpacity style={styles.frequencyButton} onPress={cycleFrequency}>
          <Text style={styles.frequencyText}>Frequency: {FREQUENCIES[frequencyIndex]}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.addButton} onPress={handleAdd} disabled={submitting}>
          <Text style={styles.addButtonText}>{submitting ? 'Adding...' : 'Add Recurring'}</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 16 }} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item._id || item.id}
          ListEmptyComponent={<Text style={styles.empty}>No recurring transactions yet.</Text>}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={styles.rowHeader}>
                <Text style={styles.rowCategory}>{item.category}</Text>
                <Text style={item.type === 'income' ? styles.incomeAmount : styles.expenseAmount}>
                  {item.type === 'income' ? '+' : '-'}{format(item.amount || 0)}
                </Text>
              </View>
              <Text style={styles.rowMeta}>
                {item.frequency} &middot; Next: {item.nextDue ? new Date(item.nextDue).toLocaleDateString() : 'N/A'}
              </Text>
              <View style={styles.rowActions}>
                <TouchableOpacity onPress={() => handleToggle(item)}>
                  <Text style={styles.actionLink}>{item.isPaused ? 'Resume' : 'Pause'}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item._id)}>
                  <Text style={styles.deleteLink}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 16 },
  form: { marginBottom: 20, gap: 8 },
  typeRow: { flexDirection: 'row', gap: 8 },
  typeButton: { flex: 1, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 10, alignItems: 'center' },
  typeButtonActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  typeText: { color: '#374151', fontWeight: '600' },
  typeTextActive: { color: '#fff', fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 10, fontSize: 15 },
  frequencyButton: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 10, alignItems: 'center' },
  frequencyText: { color: '#374151', fontSize: 14 },
  addButton: { backgroundColor: '#2563eb', borderRadius: 8, padding: 12, alignItems: 'center' },
  addButtonText: { color: '#fff', fontWeight: '600' },
  empty: { color: '#6b7280', marginTop: 16 },
  row: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  rowHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  rowCategory: { fontSize: 15, fontWeight: '600' },
  incomeAmount: { color: '#16a34a', fontWeight: '600' },
  expenseAmount: { color: '#dc2626', fontWeight: '600' },
  rowMeta: { fontSize: 12, color: '#6b7280', marginBottom: 8 },
  rowActions: { flexDirection: 'row', gap: 16 },
  actionLink: { color: '#2563eb', fontSize: 13, fontWeight: '600' },
  deleteLink: { color: '#dc2626', fontSize: 13 },
})
