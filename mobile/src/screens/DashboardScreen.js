import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native'
import { getTransactions } from '../services/api'
import { clearToken } from '../services/auth'
import { useCurrency } from '../hooks/useCurrency'

export default function DashboardScreen({ onLogout }) {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const { format } = useCurrency()

useEffect(() => {
  let isMounted = true
  getTransactions({ limit: 5 })
  .then(({ data }) => {
    if (isMounted) setTransactions(data.transactions || data || [])
  })
  .catch(() => {})
  .finally(() => {
    if (isMounted) setLoading(false)
  })
  return () => {
    isMounted = false
  }
}, [])

const income = transactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
  const expenses = transactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)

const handleLogout = async () => {
  await clearToken()
  if (onLogout) onLogout()
}

return (
  <ScrollView style={styles.container} contentContainerStyle={styles.content}>
<View style={styles.header}>
<Text style={styles.title}>Dashboard</Text>
<TouchableOpacity onPress={handleLogout}>
  <Text style={styles.logout}>Log out</Text>
  </TouchableOpacity>
  </View>

<View style={styles.summaryRow}>
<View style={[styles.summaryCard, styles.incomeCard]}>
  <Text style={styles.summaryLabel}>Income</Text>
<Text style={styles.summaryValue}>{format(income)}</Text>
  </View>
<View style={[styles.summaryCard, styles.expenseCard]}>
  <Text style={styles.summaryLabel}>Expenses</Text>
<Text style={styles.summaryValue}>{format(expenses)}</Text>
  </View>
  </View>

<Text style={styles.sectionTitle}>Recent Transactions</Text>
{loading ? (
  <ActivityIndicator style={{ marginTop: 16 }} />
) : transactions.length === 0 ? (
  <Text style={styles.empty}>No recent transactions yet.</Text>
) : (
  transactions.map((t) => (
  <View key={t._id || t.id} style={styles.transactionRow}>
<Text style={styles.transactionCategory}>{t.category}</Text>
<Text style={t.type === 'income' ? styles.incomeAmount : styles.expenseAmount}>
{t.type === 'income' ? '+' : '-'}{format(Math.abs(t.amount))}
</Text>
  </View>
))
)}
  </ScrollView>
)
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: '700' },
  logout: { color: '#dc2626', fontSize: 14 },
  summaryRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  summaryCard: { flex: 1, borderRadius: 10, padding: 16 },
  incomeCard: { backgroundColor: '#dcfce7' },
  expenseCard: { backgroundColor: '#fee2e2' },
  summaryLabel: { fontSize: 13, color: '#374151', marginBottom: 4 },
  summaryValue: { fontSize: 18, fontWeight: '700' },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  empty: { color: '#6b7280' },
  transactionRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  transactionCategory: { fontSize: 15 },
  incomeAmount: { color: '#16a34a', fontWeight: '600' },
  expenseAmount: { color: '#dc2626', fontWeight: '600' },
})
