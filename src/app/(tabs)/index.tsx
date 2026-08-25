import { createFolder, getFolders } from "@/database/folder";
import React, { useCallback, useEffect, useState } from "react";
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    ScrollView,
    StyleSheet,
    Alert,
    ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { saveReel } from "@/database/reels";
import { useFocusEffect } from "expo-router";
import { getApiUrl } from "../../../utils/apiConfig";

interface ReelData {
    username: string;
    caption: string;
    tags: string[];
    thumbnail_url: string | null;
    reel_url: string;
}

export default function HomeScreen() {
    const [reelUrl, setReelUrl] = useState("");
    const [reel, setReel] = useState<ReelData | null>(null);
    const [loading, setLoading] = useState(false);
    const [showFolderModal, setShowFolderModal] = useState(false);
    const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
    const [folders, setFolders] = useState<any[]>([]);
    // Persisted backend API URL — accessible as API variable per requirement
    const [API, setAPI] = useState<string>("");

    const loadApiUrl = async () => {
        try {
            const stored = await getApiUrl();
            if(stored != null){
                setAPI(stored);
            }
        } catch (e) {
            Alert.alert('ERROR','Failed to load API URL.')
        }
    };

    useFocusEffect(
    useCallback(() => {
        loadFolders();
        loadApiUrl();
    }, [])
);

    useEffect(() => {
        loadApiUrl();
    }, []);

    const loadFolders = async () => {
        try {
            const data = await getFolders();

            setFolders(data);
        } catch (error) {
            Alert.alert('ERROR', 'Failed to load the folders')
        }
    };

    const scrapeReel = async () => {
        if (!reelUrl.trim()) {
            Alert.alert("ERROR", "Please enter an Instagram Reel URL");
            return;
        }

        if (!API) {
            Alert.alert(
                "Backend not configured",
                "Please set your Backend API URL in Settings first."
            );
            return;
        }

        try {
            setLoading(true);
            setReel(null);

            // For local testing, 127.0.0.1 on device = device itself. Log hint.
            if (API.includes("127.0.0.1") || API.includes("localhost")) {
                Alert.alert('WARNING', 'Using localhost URL on device - this will fail on physical device/emulator. Use 10.0.2.2 for Android emulator or LAN IP for physical device.')
            }

            const response = await fetch(`${API}/scrape-reel`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    reel_url: reelUrl.trim(),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || "Failed to scrape Reel");
            }

            setReel(data);
        } catch (error) {
            Alert.alert('ERROR', `Fetch failed for ${API}/scrape-reel`)

            let message = error instanceof Error ? error.message : "Something went wrong";
            const lower = message.toLowerCase();

            // Handle TCP / connection refused / Network request failed (common for 127.0.0.1:5562, 8000, etc.)
            if (
                lower.includes("network request failed") ||
                lower.includes("failed to connect") ||
                lower.includes("econnrefused") ||
                lower.includes("5562") ||
                lower.includes("127.0.0.1") ||
                lower.includes("connection refused")
            ) {
                message =
                    `Could not connect to backend at ${API}\n\n` +
                    `• If backend is on your PC, don't use 127.0.0.1 on device.\n` +
                    `• Android emulator: use http://10.0.2.2:PORT\n` +
                    `• iOS simulator: 127.0.0.1 works\n` +
                    `• Physical device: use http://192.168.x.x:PORT\n` +
                    `• Or use hosted URL: https://reelvault-backend-ficu.onrender.com\n\n` +
                    `Original: ${message}`;
            } else {
                message = `${message}\n\nBackend: ${API}`;
            }

            Alert.alert(
                "Scraping Folder",
                message
            );
        } finally {
            setLoading(false);
        }
    };

    const handleSaveReel = async () => {
        if (!reel) {
            return;
        }

        if (selectedFolderId === null) {
            Alert.alert(
                "Select Folder",
                "Please select a folder first."
            );
            return;
        }

        try {
            await saveReel(
                reel.reel_url,
                reel.username,
                reel.caption,
                reel.thumbnail_url,
                selectedFolderId
            );
            setShowFolderModal(false);
            setSelectedFolderId(null);

            Alert.alert(
                "SAVED",
                "Reel saved to folder."
            );

        } catch (error) {

            Alert.alert(
                "ERROR",
                "Could not save the Reel."
            );
        }
    };





    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>ReelVault</Text>
                    <Text style={styles.subtitle}>
                        Save and organize your favorite Reels
                    </Text>
                </View>

                {(API.includes("127.0.0.1") || API.includes("localhost")) && (
                    <View style={styles.apiWarning}>
                        <Text style={styles.apiWarningText}>
                            ⚠️ Using localhost ({API}) — will fail on physical device. Use 10.0.2.2 for Android emulator or LAN IP. Change in Settings.
                        </Text>
                    </View>
                )}

                {/* URL Input */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Instagram Reel URL</Text>

                    <TextInput
                        value={reelUrl}
                        onChangeText={setReelUrl}
                        placeholder="Paste Reel URL..."
                        placeholderTextColor="#777"
                        autoCapitalize="none"
                        autoCorrect={false}
                        style={styles.input}
                    />
                </View>

                {/* Scrape Button */}
                <TouchableOpacity
                    style={styles.scrapeButton}
                    onPress={scrapeReel}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>
                            Fetch Reel
                        </Text>
                    )}
                </TouchableOpacity>

                {/* Preview */}
                {reel && (
                    <View style={styles.card}>
                        {reel.thumbnail_url && (
                            <Image
                                source={{ uri: reel.thumbnail_url }}
                                style={styles.thumbnail}
                                resizeMode="cover"
                            />
                        )}

                        <View style={styles.info}>
                            <Text style={styles.username}>
                                @{reel.username}
                            </Text>

                            {reel.caption ? (
                                <Text style={styles.caption}>
                                    {reel.caption}
                                </Text>
                            ) : (
                                <Text style={styles.noCaption}>
                                    No caption found
                                </Text>
                            )}

                            {/* Tags */}
                            {reel.tags.length > 0 && (
                                <View style={styles.tagsContainer}>
                                    {reel.tags.map((tag, index) => (
                                        <View key={index} style={styles.tag}>
                                            <Text style={styles.tagText}>
                                                {tag}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>

                        {/* Save */}
                        <TouchableOpacity
                            style={styles.saveButton}
                            onPress={() => setShowFolderModal(true)}
                        >
                            <Text style={styles.saveButtonText}>
                                Save Reel
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

                <Modal
                    visible={showFolderModal}
                    transparent
                    animationType="slide"
                    onRequestClose={() => setShowFolderModal(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.folderModal}>

                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>
                                    Save to Folder
                                </Text>

                                <TouchableOpacity
                                    onPress={() => setShowFolderModal(false)}
                                >
                                    <Text style={styles.closeButton}>
                                        ✕
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.modalSubtitle}>
                                Select a folder for this Reel
                            </Text>

                            {folders.length === 0 ? (
                                <View style={styles.emptyFolder}>
                                    <Text style={styles.emptyTitle}>
                                        No folders yet
                                    </Text>

                                    <Text style={styles.emptyText}>
                                        Create a folder first.
                                    </Text>
                                </View>
                            ) : (
                                folders.map((folder) => (
                                    <TouchableOpacity
                                        key={folder.id}
                                        style={[
                                            styles.folderOption,
                                            selectedFolderId === folder.id &&
                                            styles.selectedFolder,
                                        ]}
                                        onPress={() =>
                                            setSelectedFolderId(folder.id)
                                        }
                                    >
                                        <Text style={styles.folderIcon}>
                                            📁
                                        </Text>

                                        <Text style={styles.folderName}>
                                            {folder.name}
                                        </Text>

                                        {selectedFolderId === folder.id && (
                                            <Text style={styles.checkmark}>
                                                ✓
                                            </Text>
                                        )}
                                    </TouchableOpacity>
                                ))
                            )}

                            <TouchableOpacity
                                style={[
                                    styles.confirmButton,
                                    selectedFolderId === null &&
                                    styles.disabledButton,
                                ]}
                                disabled={selectedFolderId === null}
                                onPress={handleSaveReel}
                            >
                                <Text style={styles.confirmButtonText}>
                                    Save Reel
                                </Text>
                            </TouchableOpacity>

                        </View>
                    </View>
                </Modal>

            </ScrollView>
        </SafeAreaView>

    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0b0b0f",
    },

    content: {
        padding: 20,
        paddingBottom: 40,
    },

    header: {
        marginBottom: 30,
    },

    title: {
        fontSize: 32,
        fontWeight: "800",
        color: "#fff",
    },

    subtitle: {
        marginTop: 6,
        fontSize: 15,
        color: "#888",
    },

    inputContainer: {
        marginBottom: 12,
    },

    label: {
        color: "#aaa",
        fontSize: 14,
        marginBottom: 8,
    },

    input: {
        height: 52,
        backgroundColor: "#17171d",
        borderWidth: 1,
        borderColor: "#292931",
        borderRadius: 12,
        paddingHorizontal: 16,
        color: "#fff",
        fontSize: 15,
    },

    scrapeButton: {
        height: 52,
        borderRadius: 12,
        backgroundColor: "#5865f2",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 24,
    },

    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
    },

    card: {
        backgroundColor: "#15151b",
        borderRadius: 16,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#292931",
        marginBottom: 30,
    },

    thumbnail: {
        width: "100%",
        height: 300,
        backgroundColor: "#222",
    },

    info: {
        padding: 16,
    },

    username: {
        color: "#fff",
        fontSize: 17,
        fontWeight: "700",
        marginBottom: 8,
    },

    caption: {
        color: "#ccc",
        fontSize: 14,
        lineHeight: 21,
    },

    noCaption: {
        color: "#666",
        fontSize: 14,
    },

    tagsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 6,
        marginTop: 12,
    },

    tag: {
        backgroundColor: "#22232c",
        paddingHorizontal: 9,
        paddingVertical: 5,
        borderRadius: 8,
    },

    tagText: {
        color: "#8f98ff",
        fontSize: 12,
    },

    saveButton: {
        margin: 16,
        marginTop: 0,
        height: 48,
        borderRadius: 10,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
    },

    saveButtonText: {
        color: "#111",
        fontSize: 15,
        fontWeight: "700",
    },

    // Select folder modal
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        justifyContent: "flex-end",
    },

    folderModal: {
        backgroundColor: "#17171d",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        paddingBottom: 35,
    },

    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    modalTitle: {
        color: "#fff",
        fontSize: 21,
        fontWeight: "700",
    },

    closeButton: {
        color: "#888",
        fontSize: 20,
    },

    modalSubtitle: {
        color: "#777",
        fontSize: 14,
        marginTop: 6,
        marginBottom: 20,
    },

    folderOption: {
        flexDirection: "row",
        alignItems: "center",
        padding: 15,
        backgroundColor: "#222229",
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "transparent",
    },

    selectedFolder: {
        borderColor: "#5865f2",
        backgroundColor: "#1e1f2b",
    },

    folderIcon: {
        fontSize: 24,
        marginRight: 12,
    },

    folderName: {
        flex: 1,
        color: "#fff",
        fontSize: 15,
        fontWeight: "600",
    },

    emptyFolder: {
        alignItems: "center",
        paddingVertical: 35,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#292931",
        borderStyle: "dashed",
    },



    emptyTitle: {
        color: "#ddd",
        fontSize: 16,
        fontWeight: "600",
    },

    emptyText: {
        color: "#666",
        fontSize: 13,
        marginTop: 5,
    },

    checkmark: {
        color: "#5865f2",
        fontSize: 20,
        fontWeight: "700",
    },

    confirmButton: {
        height: 52,
        backgroundColor: "#5865f2",
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 15,
    },

    disabledButton: {
        opacity: 0.4,
    },

    confirmButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
    },

    apiWarning: {
        backgroundColor: "#2a1f1f",
        borderRadius: 10,
        padding: 12,
        borderWidth: 1,
        borderColor: "#3a2a2a",
        marginBottom: 16,
    },
    apiWarningText: {
        color: "#ff9a9a",
        fontSize: 12,
        lineHeight: 16,
    },

});

