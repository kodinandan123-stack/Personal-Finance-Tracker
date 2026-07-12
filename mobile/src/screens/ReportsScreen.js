import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native'
import { getSpendingByCategory, getMonthlyTrend } from '../services/api'
import { useCurrency } from '../hooks/useCurrency'

// Mobile port of the web app's Reports page (frontend/src/pages/ReportsPage).
// Shows spending-by-category totals for the current month and a 6-month
// income vs. expense trend. Chart libraries aren't part of the mobile
// dependency set yet, so both reports render as simple summary lists.
export default function ReportsScreen() {
  const [categories, setCategories] = useState([])
  const [trend, setTrend] = useState([])
  const [loading, setLoading] = useState(true)
  const { format } = useCurrency()

  useEffect(() => {
    let isMounted = true
    Promise.all([getSpendingByCategory(), getMonthlyTrend()])
      .then(([categoryRes, trendRes]) => {
        if (!isMounted) return
        setCategories(categoryRes.data.data || categoryRes.data || [])
        setTrend(trendRes.data.data || trendRes.data || [])
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [])

  const categoryTotal = categories.reduce((sum, c) => sum + (c.total || 0), 0)

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Reports</Text>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 16 }} />
      ) : (
        <>
          <Text style={styles.sectionTitle}>Spending by Category (This Month)</Text>
          {categories.length === 0 ? (
            <Text style={styles.empty}>No spending recorded this month.</Text>
          ) : (
            categories.map((c) => {
              const ratio = categoryTotal > 0 ? c.total / categoryTotal : 0
              return (
                <View key={c.category} style={styles.categoryRow}>
                  <View style={styles.categoryHeader}>
                    <Text style={styles.categoryName}>{c.category}</Text>
                    <Text style={styles.categoryAmount}>{format(c.total || 0)}</Text>
                  </View>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${ratio * 100}%` }]} />
                  </View>
                </View>
              )
            })
          )}

          <Text style={[styles.sectionTitle, styles.trendTitle]}>Income vs. Expenses (Last 6 Months)</Text>
          {trend.length === 0 ? (
            <Text style={styles.empty}>No trend data yet.</Text>
          ) : (
            trend.map((m) => (
              <View key={m.month} style={styles.trendRow}>
                <Text style={styles.trendMonth}>{m.month}</Text>
                <View style={styles.trendAmounts}>
                  <Text style={styles.incomeText}>+{format(m.income || 0)}</Text>
                  <Text style={styles.expenseText}>-{format(m.expenses || 0)}</Text>
                  <Text style={m.net >= 0 ? styles.netPositive : styles.netNegative}>
                    {format(m.net || 0)}
                  </Text>
                </View>
              </View>
            ))
          )}
        </>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  trendTitle: { marginTop: 24 },
  empty: { color: '#6b7280' },
  categoryRow: { marginBottom: 14 },
  categoryHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  categoryName: { fontSize: 14, fontWeight: '600' },
  categoryAmount: { fontSize: 13, color: '#6b7280' },
  progressTrack: { height: 8, borderRadius: 4, backgroundColor: '#f3f4f6', overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#2563eb' },
  trendRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  trendMonth: { fontSize: 14, fontWeight: '600' },
  trendAmounts: { flexDirection: 'row', gap: 10 },
  incomeText: { color: '#16a34a', fontSize: 13 },
  expenseText: { color: '#dc2626', fontSize: 13 },
  netPositive: { color: '#16a34a', fontWeight: '700', fontSize: 13 },
  netNegative: { color: '#dc2626', fontWeight: '700', fontSize: 13 },
})
