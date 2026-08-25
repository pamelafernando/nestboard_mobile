import { View, Text, TextInput, TouchableOpacity, Image, ActivityIndicator, StyleSheet, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { AuthAPI } from '../../../api/auth'
import { apiClient } from '../../../api/apiClient'

const Profile = () => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  useEffect(() => {
    AuthAPI.getMe()
      .then((user) => {
        setDisplayName(user.displayName)
        setEmail(user.email)
        setAvatarUrl(user.avatarUrl)
      })
      .catch(() => Alert.alert('Error', 'Could not load your profile.'))
      .finally(() => setLoading(false))
  }, [])

  async function handleSave() {
    setSaving(true)
    try {
      const updated = await AuthAPI.updateProfile({ displayName })
      setDisplayName(updated.displayName)
      Alert.alert('Saved', 'Your profile has been updated.')
    } catch {
      Alert.alert('Error', 'Could not save your profile.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {avatarUrl ? (
        <Image source={{ uri: avatarUrl }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.avatarPlaceholder]}>
          <Text style={styles.avatarInitial}>{displayName.charAt(0).toUpperCase()}</Text>
        </View>
      )}

      <Text style={styles.label}>Display Name</Text>
      <TextInput
        style={styles.input}
        value={displayName}
        onChangeText={setDisplayName}
        placeholder="Your name"
      />

      <Text style={styles.label}>Email</Text>
      <Text style={styles.emailText}>{email}</Text>

      <TouchableOpacity
        style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={saving}
      >
        <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save'}</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  avatar: { width: 96, height: 96, borderRadius: 48, alignSelf: 'center', marginBottom: 24 },
  avatarPlaceholder: { backgroundColor: '#f97316', justifyContent: 'center', alignItems: 'center' },
  avatarInitial: { fontSize: 36, color: '#fff', fontWeight: 'bold' },
  label: { fontSize: 13, fontWeight: '600', color: '#6b7280', marginBottom: 6, marginTop: 16 },
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  emailText: { fontSize: 15, color: '#9ca3af' },
  saveButton: { marginTop: 32, backgroundColor: '#f97316', borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  saveButtonDisabled: { opacity: 0.5 },
  saveButtonText: { color: '#fff', fontWeight: '600', fontSize: 15 },
})

export default Profile