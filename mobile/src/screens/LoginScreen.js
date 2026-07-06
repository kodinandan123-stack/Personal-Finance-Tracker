import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { loginUser } from '../services/api'
import { setToken } from '../services/auth'

export default function LoginScreen({ navigation, onLoginSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

const handleLogin = async () => {
  if (!email || !password) {
    setError('Please enter your email and password.')
    return
  }
  setError('')
  setLoading(true)
  try {
    const response = await loginUser({ email, password })
    await setToken(response.data.token)
    if (onLoginSuccess) onLoginSuccess()
  } catch (err) {
    setError(err.response?.data?.message || 'Unable to log in. Please try again.')
  } finally {
    setLoading(false)
  }
}

return (
  <View style={styles.container}>
<Text style={styles.title}>Welcome back</Text>
  <Text style={styles.subtitle}>Log in to track your finances</Text>

  {error ? <Text style={styles.error}>{error}</Text> : null}

  <TextInput
   style={styles.input}
  placeholder="Email"
  autoCapitalize="none"
  keyboardType="email-address"
  value={email}
  onChangeText={setEmail}
  />
    <TextInput
  style={styles.input}
placeholder="Password"
secureTextEntry
value={password}
onChangeText={setPassword}
/>

  <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
{loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Log In</Text>}
  </TouchableOpacity>

<TouchableOpacity onPress={() => navigation.navigate('Register')}>
<Text style={styles.link}>Don't have an account? Sign up</Text>
  </TouchableOpacity>
  </View>
)
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 26, fontWeight: '700', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 24 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 16 },
  button: { backgroundColor: '#2563eb', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  error: { color: '#dc2626', marginBottom: 12 },
  link: { color: '#2563eb', marginTop: 16, textAlign: 'center' },
})
