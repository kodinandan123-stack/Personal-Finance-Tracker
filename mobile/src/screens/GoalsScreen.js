import React, { useEffect, useState, useCallback } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native'
import { getGoals, addGoal } from '../services/api'
import { useCurrency } from '../hooks/useCurrency'

// Mobile port of the web app's Goals page (frontend/src/pages/Goals).
// Lists savings goals with progress toward each target and lets the user add new goals.
export default function GoalsScreen() {
    const [goals, setGoals] = useState([])
    const [loading, setLoading] = useState(true)
    const [name, setName] = useState('')
    const [target, setTarget] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const { format } = useCurrency()

  const loadGoals = useCallback(() => {
        setLoading(true)
        getGoals()
          .then(({ data }) => setGoals(data.goals || data || []))
          .catch(() => {})
          .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
        loadGoals()
  }, [loadGoals])

  const handleAdd = async () => {
        if (!name || !target) return
        setSubmitting(true)
        try {
                await addGoal({ name, target: parseFloat(target) })
                setName('')
                setTarget('')
                loadGoals()
        } catch {
                // surfaced via empty state / retry for now
        } finally {
                setSubmitting(false)
        }
  }

  return (
        <View style={styles.container}>
      <Text style={styles.title}>Savings Goals</Text>

      <View style={styles.form}>
        <TextInput
            style={styles.input}
          placeholder="Goal name"
          value={name}
          onChangeText={setName}
        />
                    <TextInput
          style={styles.input}
          placeholder="Target amount"
          keyboardType="numeric"
          value={target}
          onChangeText={setTarget}
        />
                    <TouchableOpacity style={styles.addButton} onPress={handleAdd} disabled={submitting}>
                      <Text style={styles.addButtonText}>{submitting ? 'Adding...' : 'Add Goal'}</Text>
            </TouchableOpacity>
            </View>

{loading ? (
          <ActivityIndicator style={{ marginTop: 16 }} />
      ) : (
                <FlatList
          data={goals}
          keyExtractor={(item) => item._id || item.id}
          ListEmptyComponent={<Text style={styles.empty}>No savings goals yet.</Text>}
          renderItem={({ item }) => {
            const saved = item.saved || 0
                        const targetValue = item.target || 0
                        const ratio = targetValue > 0 ? Math.min(saved / targetValue, 1) : 0
                        const reached = targetValue > 0 && saved >= targetValue
                        return (
                                        <View style={styles.row}>
                <View style={styles.rowHeader}>
                  <Text style={styles.rowName}>{item.name}</Text>
            {reached && <Text style={styles.reachedBadge}>Reached</Text>}
              </View>
                             <Text style={styles.rowAmounts}>
            {format(saved)} / {format(targetValue)}
              </Text>
                             <View style={styles.progressTrack}>
                                <View style={[styles.progressFill, { width: `${ratio * 100}%` }]} />
              </View>
              </View>
                         )
            }}
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
    rowHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    rowName: { fontSize: 15, fontWeight: '600' },
    reachedBadge: { fontSize: 12, color: '#16a34a', fontWeight: '600' },
    rowAmounts: { fontSize: 13, color: '#6b7280', marginBottom: 8 },
    progressTrack: { height: 8, borderRadius: 4, backgroundColor: '#f3f4f6', overflow: 'hidden' },
    progressFill: { height: '100%', backgroundColor: '#16a34a', borderRadius: 4 },
})
