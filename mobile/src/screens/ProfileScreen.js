import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native'
import { getMe, updateProfile, changePassword } from '../services/api'
import { clearToken } from '../services/auth'

// Mobile port of the web app's Profile page (frontend/src/pages/ProfilePage).
// Lets the user view/update their name and email, change their password,
// and log out.
export default function ProfileScreen({ onLogout }) {
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileMessage, setProfileMessage] = useState('')

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState('')

  useEffect(() => {
    let isMounted = true
    getMe()
      .then(({ data }) => {
        if (!isMounted) return
        const user = data.user || data
        setName(user?.name || '')
        setEmail(user?.email || '')
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [])

  const handleSaveProfile = async () => {
    setSavingProfile(true)
    setProfileMessage('')
    try {
      await updateProfile({ name, email })
      setProfileMessage('Profile updated successfully.')
    } catch (err) {
      setProfileMessage(err.response?.data?.message || 'Failed to update profile.')
    } finally {
      setSavingProfile(false)
    }
  }

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) return
    setSavingPassword(true)
    setPasswordMessage('')
    try {
      await changePassword({ currentPassword, newPassword })
      setCurrentPassword('')
      setNewPassword('')
      setPasswordMessage('Password changed successfully.')
    } catch (err) {
      setPasswordMessage(err.response?.data?.message || 'Failed to change password.')
    } finally {
      setSavingPassword(false)
    }
  }

  const handleLogout = async () => {
    await clearToken()
    if (onLogout) onLogout()
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator />
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Profile</Text>

      <Text style={styles.sectionTitle}>Account Details</Text>
      <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      {profileMessage ? <Text style={styles.message}>{profileMessage}</Text> : null}
      <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile} disabled={savingProfile}>
        <Text style={styles.saveButtonText}>{savingProfile ? 'Saving...' : 'Save Profile'}</Text>
      </TouchableOpacity>

      <Text style={[styles.sectionTitle, styles.sectionSpacing]}>Change Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Current password"
        value={currentPassword}
        onChangeText={setCurrentPassword}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="New password"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
      />
      {passwordMessage ? <Text style={styles.message}>{passwordMessage}</Text> : null}
      <TouchableOpacity style={styles.saveButton} onPress={handleChangePassword} disabled={savingPassword}>
        <Text style={styles.saveButtonText}>{savingPassword ? 'Updating...' : 'Change Password'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log out</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  sectionSpacing: { marginTop: 28 },
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 10, fontSize: 15, marginBottom: 10 },
  message: { fontSize: 13, color: '#2563eb', marginBottom: 10 },
  saveButton: { backgroundColor: '#2563eb', borderRadius: 8, padding: 12, alignItems: 'center' },
  saveButtonText: { color: '#fff', fontWeight: '600' },
  logoutButton: { marginTop: 32, borderRadius: 8, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#dc2626' },
  logoutText: { color: '#dc2626', fontWeight: '600' },
})
