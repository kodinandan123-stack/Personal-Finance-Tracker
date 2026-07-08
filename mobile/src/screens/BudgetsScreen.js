import React, { useEffect, useState, useCallback } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native'
import { getBudgets, addBudget } from '../services/api'
import { useCurrency } from '../hooks/useCurrency'

// Mobile port of the web app's Budgets page (frontend/src/pages/Budgets).
// Lists category budgets with spend progress and lets the user add new limits.
export default function BudgetsScreen() {
    const [budgets, setBudgets] = useState([])
    const [loading, setLoading] = useState(true)
    const [category, setCategory] = useState('')
    const [limit, setLimit] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const { format } = useCurrency()

  const loadBudgets = useCallback(() => {
        setLoading(true)
        getBudgets()
          .then(({ data }) => setBudgets(data.budgets || data || []))
          .catch(() => {})
          .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
        loadBudgets()
  }, [loadBudgets])

  const handleAdd = async () => {
        if (!category || !limit) return
        setSubmitting(true)
        try {
                await addBudget({ category, limit: parseFloat(limit) })
                setCategory('')
                setLimit('')
                loadBudgets()
        } catch {
                // surfaced via empty state / retry for now
        } finally {
                setSubmitting(false)
        }
  }

  const renderProgress = (item) => {
        const spent = item.spent || 0
        const limitValue = item.limit || 0
        const ratio = limitValue > 0 ? Math.min(spent / limitValue, 1) : 0
        const overBudget = limitValue > 0 && spent > limitValue
        return (
                <View style={styles.progressTrack}>
            <View
            style={[
                          styles.progressFill,
            { width: `${ratio * 100}%` },
                          overBudget && styles.progressFillOver,
                        ]}
          />
              </View>
      )
}

  return (
        <View style={styles.container}>
      <Text style={styles.title}>Budgets</Text>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Category"
          value={category}
          onChangeText={setCategory}
        />
                    <TextInput
          style={styles.input}
          placeholder="Monthly limit"
          keyboardType="numeric"
          value={limit}
          onChangeText={setLimit}
        />
                    <TouchableOpacity style={styles.addButton} onPress={handleAdd} disabled={submitting}>
                      <Text style={styles.addButtonText}>{submitting ? 'Adding...' : 'Add Budget'}</Text>
            </TouchableOpacity>
            </View>

{loading ? (
          <ActivityIndicator style={{ marginTop: 16 }} />
      ) : (
                <FlatList
          data={budgets}
          keyExtractor={(item) => item._id || item.id}
          ListEmptyComponent={<Text style={styles.empty}>No budgets set up yet.</Text>}
          renderItem={({ item }) => (
                        <View style={styles.row}>
              <View style={styles.rowHeader}>
                <Text style={styles.rowCategory}>{item.category}</Text>
                <Text style={styles.rowAmounts}>
          {format(item.spent || 0)} / {format(item.limit || 0)}
            </Text>
            </View>
{renderProgress(item)}
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
    addButton: { backgroundColor: '#2563eb', borderRadius: 8, padding: 12, alignItems: 'center' },
    addButtonText: { color: '#fff', fontWeight: '600' },
    empty: { color: '#6b7280', marginTop: 16 },
    row: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
    rowHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    rowCategory: { fontSize: 15, fontWeight: '600' },
    rowAmounts: { fontSize: 13, color: '#6b7280' },
    progressTrack: { height: 8, borderRadius: 4, backgroundColor: '#f3f4f6', overflow: 'hidden' },
    progressFill: { height: '100%', backgroundColor: '#2563eb', borderRadius: 4 },
    progressFillOver: { backgroundColor: '#dc2626' },
})
