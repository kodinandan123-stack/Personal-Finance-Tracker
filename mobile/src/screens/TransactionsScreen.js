import React, { useEffect, useState, useCallback } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native'
import { getTransactions, addTransaction, deleteTransaction } from '../services/api'
import { useCurrency } from '../hooks/useCurrency'

// Mobile port of the web app's Transactions page (frontend/src/pages/Transactions).
// Lists recent transactions and supports adding a new income/expense entry.
export default function TransactionsScreen() {
    const [transactions, setTransactions] = useState([])
    const [loading, setLoading] = useState(true)
    const [category, setCategory] = useState('')
    const [amount, setAmount] = useState('')
    const [type, setType] = useState('expense')
    const [submitting, setSubmitting] = useState(false)
    const { format } = useCurrency()

  const loadTransactions = useCallback(() => {
        setLoading(true)
        getTransactions()
          .then(({ data }) => setTransactions(data.transactions || data || []))
          .catch(() => {})
          .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
        loadTransactions()
  }, [loadTransactions])

  const handleAdd = async () => {
        if (!category || !amount) return
        setSubmitting(true)
        try {
                await addTransaction({ category, amount: parseFloat(amount), type })
                setCategory('')
                setAmount('')
                loadTransactions()
        } catch {
                // surfaced via empty state / retry for now
        } finally {
                setSubmitting(false)
        }
  }

  const handleDelete = async (id) => {
        try {
                await deleteTransaction(id)
                setTransactions((prev) => prev.filter((t) => (t._id || t.id) !== id))
        } catch {
                // no-op; list will resync on next load
        }
  }

  return (
        <View style={styles.container}>
      <Text style={styles.title}>Transactions</Text>

      <View style={styles.form}>
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
        <TouchableOpacity style={styles.addButton} onPress={handleAdd} disabled={submitting}>
                        <Text style={styles.addButtonText}>{submitting ? 'Adding...' : 'Add Transaction'}</Text>
              </TouchableOpacity>
              </View>

{loading ? (
          <ActivityIndicator style={{ marginTop: 16 }} />
      ) : (
                <FlatList
          data={transactions}
          keyExtractor={(item) => item._id || item.id}
          ListEmptyComponent={<Text style={styles.empty}>No transactions yet.</Text>}
          renderItem={({ item }) => (
                        <View style={styles.row}>
              <Text style={styles.rowCategory}>{item.category}</Text>
              <Text style={item.type === 'income' ? styles.income : styles.expense}>
{item.type === 'income' ? '+' : '-'}{format(Math.abs(item.amount))}
</Text>
              <TouchableOpacity onPress={() => handleDelete(item._id || item.id)}>
                  <Text style={styles.delete}>Delete</Text>
  </TouchableOpacity>
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
    input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 10, fontSize: 15 },
    typeRow: { flexDirection: 'row', gap: 8 },
    typeButton: { flex: 1, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 10, alignItems: 'center' },
    typeButtonActive: { backgroundColor: '#111827', borderColor: '#111827' },
    typeText: { color: '#111827' },
    typeTextActive: { color: '#fff' },
    addButton: { backgroundColor: '#2563eb', borderRadius: 8, padding: 12, alignItems: 'center' },
    addButtonText: { color: '#fff', fontWeight: '600' },
    empty: { color: '#6b7280', marginTop: 16 },
    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
    rowCategory: { fontSize: 15, flex: 1 },
    income: { color: '#16a34a', fontWeight: '600', marginRight: 12 },
    expense: { color: '#dc2626', fontWeight: '600', marginRight: 12 },
    delete: { color: '#9ca3af', fontSize: 13 },
})
