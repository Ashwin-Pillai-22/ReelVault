import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getApiUrl, getStoredApiUrl, setApiUrl, clearApiUrl } from "../../../utils/apiConfig";

export default function SettingsTab() {
  const [apiUrl, setApiUrlState] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadApiUrl();
  }, []);

  const loadApiUrl = async () => {
    try {
      setLoading(true);
      const effective = await getApiUrl();
      const raw = await getStoredApiUrl();
      if (effective != null) {
        setApiUrlState(effective);
        setInputValue(effective);
      }
    } catch (e) {
      Alert.alert('ERROR','Failed to load API URL')
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const trimmed = inputValue.trim().replace(/\/+$/, "");

    if (!trimmed) {
      Alert.alert("Invalid URL", "Please enter a valid backend API URL.");
      return;
    }

    // Basic URL validation
    try {
      const parsed = new URL(trimmed);
      if (!["http:", "https:"].includes(parsed.protocol)) {
        throw new Error("Invalid protocol");
      }
    } catch {
      Alert.alert(
        "Invalid URL",
        "Please enter a valid URL starting with http:// or https://\nExample: https://api.example.com"
      );
      return;
    }

    // Warn about localhost usage (device cannot reach 127.0.0.1)
    if (trimmed.includes("127.0.0.1") || trimmed.includes("localhost")) {
      Alert.alert(
        "Localhost detected",
        "127.0.0.1 / localhost won't work on a physical device/emulator.\n\n• Android emulator use 10.0.2.2\n• iOS simulator can use 127.0.0.1\n• Physical device use your PC's LAN IP (e.g. 192.168.x.x)\n\nSave anyway?"
        , [
          { text: "Cancel", style: "cancel", onPress: () => setSaving(false) },
          {
            text: "Save", onPress: async () => {
              try {
                await setApiUrl(trimmed);
                setApiUrlState(trimmed);
                setInputValue(trimmed);
                Alert.alert("Saved", "Backend API URL saved successfully.");
              } catch (e) {
                Alert.alert("Error", "Failed to save API URL.");
              } finally {
                setSaving(false);
              }
            }
          }
        ]
      );
      return;
    }

    try {
      setSaving(true);
      await setApiUrl(trimmed);
      setApiUrlState(trimmed);
      setInputValue(trimmed);
      Alert.alert("Saved", "Backend API URL saved successfully.");
    } catch (e) {
      Alert.alert("Error", "Failed to save API URL.");
    } finally {
      setSaving(false);
    }
  };

  const handleClear = () => {
    try {

      Alert.alert(
        "Reset",
        "Reset to null",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "OK",
            onPress: async () => {
              await clearApiUrl();
              setApiUrlState('');
              setInputValue('');
            },
          },
        ]
      );
    } catch (e) {
      Alert.alert("Error", "Failed to clear API URL.");
    }
  };



  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#5865f2" />
          <Text style={styles.loadingText}>Loading settings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Settings</Text>
            <Text style={styles.subtitle}>Configure your backend connection</Text>
          </View>

          {/* Backend API Section */}
          <View style={styles.card}>
            <Text style={styles.label}>Backend API URL</Text>
            <Text style={styles.hint}>
              Paste the URL of your hosted backend. This will be used for scraping reels.
              {"\n"}Example: https://your-backend.onrender.com
            </Text>

            <TextInput
              value={inputValue}
              onChangeText={setInputValue}
              placeholder="https://your-backend.onrender.com"
              placeholderTextColor="#777"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              style={styles.input}
              selectionColor="#5865f2"
            />

            {(apiUrl.includes("127.0.0.1") || apiUrl.includes("localhost")) && (
              <View style={styles.warningContainer}>
                <Text style={styles.warningText}>
                  ⚠️ Localhost URL detected. On Android emulator use 10.0.2.2:PORT instead of 127.0.0.1. On physical device use your PC LAN IP.
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.saveButton, saving && styles.disabledButton]}
              onPress={handleSave}
              disabled={saving}
              activeOpacity={0.8}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Save API URL</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClear}
              activeOpacity={0.7}
            >
              <Text style={styles.clearButtonText}>Reset</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>How it works</Text>
            <Text style={styles.infoText}>
              • This URL is stored persistently on your device{"\n"}• It is
              automatically used in Home and Share screens{"\n"}• Do not include
              a trailing slash or endpoint path (e.g. /scrape-reel)
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b0b0f",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#888",
    marginTop: 10,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: "#888",
  },
  card: {
    backgroundColor: "#15151b",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#292931",
  },
  label: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 6,
  },
  hint: {
    color: "#777",
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 12,
  },
  input: {
    height: 52,
    backgroundColor: "#17171d",
    borderWidth: 1,
    borderColor: "#292931",
    borderRadius: 12,
    paddingHorizontal: 16,
    color: "#fff",
    fontSize: 14,
  },
  currentContainer: {
    marginTop: 12,
    backgroundColor: "#1e1f2b",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#2a2a3a",
  },
  currentLabel: {
    color: "#888",
    fontSize: 12,
    marginBottom: 4,
  },
  currentValue: {
    color: "#8f98ff",
    fontSize: 13,
  },
  defaultHint: {
    color: "#666",
    fontSize: 11,
    marginTop: 6,
    fontStyle: "italic",
  },
  warningContainer: {
    marginTop: 12,
    backgroundColor: "#2a1f1f",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#3a2a2a",
  },
  warningText: {
    color: "#ff9a9a",
    fontSize: 12,
    lineHeight: 16,
  },
  saveButton: {
    height: 52,
    borderRadius: 12,
    backgroundColor: "#5865f2",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  disabledButton: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  clearButton: {
    height: 44,
    borderRadius: 10,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#292931",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  clearButtonText: {
    color: "#ff6b6b",
    fontSize: 14,
    fontWeight: "600",
  },
  infoBox: {
    marginTop: 16,
    backgroundColor: "#111116",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#1f1f28",
  },
  infoTitle: {
    color: "#aaa",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 6,
  },
  infoText: {
    color: "#666",
    fontSize: 12,
    lineHeight: 18,
  },
});
