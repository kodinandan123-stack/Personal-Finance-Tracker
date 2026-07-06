import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { registerUser } from '../services/api'
import { setToken } from '../services/auth'

export default function RegisterScreen({ navigation, onLoginSuccess }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

const handleRegister = async () => {
  if (!name || !email || !password) {
    setError('Please fill in all fields.')
    return
  }
  setError('')
  setLoading(true)
  try {
    const response = await registerUser({ name, email, password })
    await setToken(response.data.token)
    if (onLoginSuccess) onLoginSuccess()
  } catch (err) {
    setError(err.response?.data?.message || 'Unable to create your account.')
  } finally {
    setLoading(false)
  }
}

return (
  <View style={styles.container}>
<Text style={styles.title}>Create an account</Text>
  <Text style={styles.subtitle}>Start tracking your income and expenses</Text>

  {error ? <Text style={styles.error}>{error}</Text> : null}

  <TextInput
   style={styles.input}
  placeholder="Full name"
  value={name}
  onChangeText={setName}
  />
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

  <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
{loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign Up</Text>}
  </TouchableOpacity>

<TouchableOpacity onPress={() => navigation.navigate('Login')}>
<Text style={styles.link}>Already have an account? Log in</Text>
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
