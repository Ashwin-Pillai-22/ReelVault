import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Modal,
    Alert,
    Image,
    ActivityIndicator,
    ScrollView,
} from "react-native";
import { router, Stack, useLocalSearchParams } from "expo-router";

import {
    getFolders,
    createFolder,
} from "@/database/folder";

import {
    saveReel,
} from "@/database/reels";
import { SafeAreaView } from "react-native-safe-area-context";
import { getApiUrl } from "../../../utils/apiConfig";

interface Folder {
    id: number;
    name: string;
}

interface Reel {
    username: string;
    caption: string;
    tags: string[];
    thumbnail_url: string | null;
    reel_url: string;
}

export default function ShareScreen() {

    const { url } = useLocalSearchParams<{
        url?: string;
    }>();
    // Persisted backend API URL — accessible as API variable per requirement
    const [API, setAPI] = useState<string>("");

    const [sharedUrl, setSharedUrl] = useState<string>("");

    const [reel, setReel] = useState<Reel | null>(
        null
    );

    const [folders, setFolders] = useState<Folder[]>(
        []
    );

    const [selectedFolderId, setSelectedFolderId] =
        useState<number | null>(null);

    const [folderName, setFolderName] =
        useState("");

    const [showCreateFolder, setShowCreateFolder] =
        useState(false);

    const [loading, setLoading] =
        useState(false);

    const [saving, setSaving] =
        useState(false);

    const loadApiUrl = async () => {
        try {
            const stored = await getApiUrl();
            if(stored != null){
                setAPI(stored);
            }
        } catch (e) {
            Alert.alert('ERROR','Failed to load API URL')
        }
    };

    useEffect(() => {
        loadApiUrl();
    }, []);

    useEffect(() => {
        if (url) {
            setSharedUrl(url);
            // Only auto-fetch if API is already loaded; otherwise wait for API to load
            // fetch will be triggered by the next effect when API becomes available
            if (API) {
                fetchReel(url);
            }
        }
    }, [url]);

    // If API loads after url was set, fetch then
    useEffect(() => {
        if (url && API && !reel && !loading) {
            // Avoid double fetch if already fetched — check sharedUrl was set
            fetchReel(url as string);
        }
    }, [API]);

    /*
     * Load folders
     */
    useEffect(() => {
        loadFolders();
    }, []);

    const loadFolders = async () => {
        try {
            const data = await getFolders();

            setFolders(data);
        } catch (error) {
            Alert.alert('ERROR', 'Failed to load folders')
        }
    };

    const formatFetchError = (error: unknown, targetUrl: string) => {
        let msg = error instanceof Error ? error.message : "Something went wrong";
        const lower = msg.toLowerCase();
        if (
            lower.includes("network request failed") ||
            lower.includes("failed to connect") ||
            lower.includes("econnrefused") ||
            lower.includes("5562") ||
            lower.includes("127.0.0.1") ||
            lower.includes("connection refused")
        ) {
            return (
                `Could not connect to backend at ${targetUrl}\n\n` +
                `• Android emulator: use http://10.0.2.2:PORT\n` +
                `• iOS simulator: 127.0.0.1 works\n` +
                `• Physical device: use http://192.168.x.x:PORT\n` +
                `• Or use hosted: https://reelvault-backend-ficu.onrender.com\n\n` +
                `Original: ${msg}`
            );
        }
        return `${msg}\n\nBackend: ${targetUrl}`;
    };

    /*
     * Fetch Reel metadata
     */
    const fetchReel = async (url: string) => {
        // Resolve effective API (handles case where API state not yet loaded)
        let effectiveApi = API;
        if (!effectiveApi) {
            const stored = await getApiUrl();
            if(stored != null) effectiveApi = stored;
            if (stored !== API && stored != null) setAPI(stored);
        }

        try {
            setLoading(true);

            if (effectiveApi.includes("127.0.0.1") || effectiveApi.includes("localhost")) {
                Alert.alert('WARNING', 'Using localhost URL on device - will fail on physical device/emulator')
            }

            const response = await fetch(
                `${effectiveApi}/scrape-reel`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify({
                        reel_url: url,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error(
                    "Failed to scrape Reel"
                );
            }

            const data = await response.json();

            setReel(data);

        } catch (error) {
            Alert.alert(
                "ERROR",
                formatFetchError(error, effectiveApi)
            );
        } finally {
            setLoading(false);
        }
    };

    /*
     * Create folder
     */
    const handleCreateFolder = async () => {
        const name = folderName.trim();

        if (!name) {
            Alert.alert(
                "Invalid Folder",
                "Please enter a folder name."
            );
            return;
        }

        try {
            const folderId =
                await createFolder(name);

            setFolderName("");
            setShowCreateFolder(false);

            await loadFolders();

            // Automatically select new folder
            setSelectedFolderId(folderId);

        } catch (error) {
            Alert.alert(
                "ERROR",
                "Failed to create folder."
            );
        }
    };

    /*
     * Save Reel
     */
    const handleSaveReel = async () => {
        if (!reel) {
            Alert.alert(
                "Error",
                "Reel information is missing."
            );
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
            setSaving(true);

            await saveReel(
                reel.reel_url,
                reel.username,
                reel.caption,
                reel.thumbnail_url,
                selectedFolderId
            );

            Alert.alert(
                "Saved",
                "Reel saved successfully.",
                [
                    {
                        text: "OK",
                        onPress: () => {
                            router.replace(
                                "/(tabs)"
                            );
                        },
                    },
                ]
            );

        } catch (error) {
            Alert.alert(
                "ERROR",
                "Failed to save Reel."
            );
        } finally {
            setSaving(false);
        }
    };
    return (
        <>
            <Stack.Screen
                options={{ headerShown: false }}
            />
            <SafeAreaView style={styles.container}>

                {/* Header */}

                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                    >
                        <Text style={styles.back}>
                            ←
                        </Text>
                    </TouchableOpacity>

                    <Text style={styles.headerTitle}>
                        Save Reel
                    </Text>
                </View>

                <ScrollView
                    contentContainerStyle={
                        styles.content
                    }
                >

                    {/* Shared URL */}

                    <View style={styles.urlContainer}>
                        <Text style={styles.label}>
                            Shared Reel
                        </Text>

                        <Text
                            style={styles.url}
                            numberOfLines={2}
                        >
                            {sharedUrl ||
                                "Waiting for shared Reel..."}
                        </Text>
                    </View>

                    {(API.includes("127.0.0.1") || API.includes("localhost")) && (
                        <View style={styles.apiWarning}>
                            <Text style={styles.apiWarningText}>
                                ⚠️ Using localhost ({API}) — will fail on device. Use 10.0.2.2 for emulator or LAN IP. Change in Settings.
                            </Text>
                        </View>
                    )}

                    {/* Loading */}

                    {loading && (
                        <View style={styles.loading}>
                            <ActivityIndicator
                                size="large"
                            />

                            <Text
                                style={
                                    styles.loadingText
                                }
                            >
                                Fetching Reel...
                            </Text>
                        </View>
                    )}

                    {/* Reel Preview */}

                    {reel && !loading && (
                        <View
                            style={
                                styles.reelPreview
                            }
                        >
                            {reel.thumbnail_url ? (
                                <Image
                                    source={{
                                        uri: reel.thumbnail_url,
                                    }}
                                    style={
                                        styles.thumbnail
                                    }
                                />
                            ) : (
                                <View
                                    style={
                                        styles.noThumbnail
                                    }
                                >
                                    <Text
                                        style={
                                            styles.noThumbnailText
                                        }
                                    >
                                        No Image
                                    </Text>
                                </View>
                            )}

                            <View
                                style={
                                    styles.reelInfo
                                }
                            >
                                <Text
                                    style={
                                        styles.username
                                    }
                                >
                                    @{reel.username}
                                </Text>

                                <Text
                                    style={
                                        styles.caption
                                    }
                                    numberOfLines={4}
                                >
                                    {reel.caption ||
                                        "No caption"}
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* Folder Section */}

                    <View style={styles.folderSection}>
                        <Text style={styles.sectionTitle}>
                            Select Folder
                        </Text>

                        {folders.length === 0 ? (
                            <Text
                                style={
                                    styles.emptyText
                                }
                            >
                                No folders yet
                            </Text>
                        ) : (
                            folders.map((folder) => (
                                <TouchableOpacity
                                    key={folder.id}
                                    style={[
                                        styles.folderItem,
                                        selectedFolderId ===
                                        folder.id &&
                                        styles.selectedFolder,
                                    ]}
                                    onPress={() =>
                                        setSelectedFolderId(
                                            folder.id
                                        )
                                    }
                                >
                                    <Text
                                        style={
                                            styles.folderIcon
                                        }
                                    >
                                        📁
                                    </Text>

                                    <Text
                                        style={
                                            styles.folderName
                                        }
                                    >
                                        {folder.name}
                                    </Text>

                                    {selectedFolderId ===
                                        folder.id && (
                                            <Text
                                                style={
                                                    styles.check
                                                }
                                            >
                                                ✓
                                            </Text>
                                        )}
                                </TouchableOpacity>
                            ))
                        )}

                        {/* Create Folder */}

                        <TouchableOpacity
                            style={
                                styles.createFolderButton
                            }
                            onPress={() =>
                                setShowCreateFolder(
                                    true
                                )
                            }
                        >
                            <Text
                                style={
                                    styles.createFolderText
                                }
                            >
                                ＋ Create New Folder
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Save */}

                    <TouchableOpacity
                        style={[
                            styles.saveButton,
                            (!reel ||
                                selectedFolderId ===
                                null ||
                                saving) &&
                            styles.disabledButton,
                        ]}
                        disabled={
                            !reel ||
                            selectedFolderId === null ||
                            saving
                        }
                        onPress={handleSaveReel}
                    >
                        {saving ? (
                            <ActivityIndicator
                                color="#fff"
                            />
                        ) : (
                            <Text
                                style={
                                    styles.saveButtonText
                                }
                            >
                                Save Reel
                            </Text>
                        )}
                    </TouchableOpacity>

                </ScrollView>

                {/* Create Folder Modal */}

                <Modal
                    visible={showCreateFolder}
                    transparent
                    animationType="fade"
                    onRequestClose={() =>
                        setShowCreateFolder(false)
                    }
                >
                    <View
                        style={
                            styles.modalOverlay
                        }
                    >
                        <View
                            style={
                                styles.modalContainer
                            }
                        >
                            <Text
                                style={
                                    styles.modalTitle
                                }
                            >
                                Create Folder
                            </Text>

                            <TextInput
                                value={folderName}
                                onChangeText={
                                    setFolderName
                                }
                                placeholder="Folder name"
                                placeholderTextColor="#777"
                                style={
                                    styles.input
                                }
                                autoFocus
                            />

                            <View
                                style={
                                    styles.modalButtons
                                }
                            >
                                <TouchableOpacity
                                    onPress={() => {
                                        setFolderName(
                                            ""
                                        );
                                        setShowCreateFolder(
                                            false
                                        );
                                    }}
                                >
                                    <Text
                                        style={
                                            styles.cancelText
                                        }
                                    >
                                        Cancel
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={
                                        handleCreateFolder
                                    }
                                >
                                    <Text
                                        style={
                                            styles.createText
                                        }
                                    >
                                        Create
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </SafeAreaView>
        </>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0b0b0f",
    },

    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 15,
    },

    back: {
        color: "#fff",
        fontSize: 30,
        marginRight: 15,
    },

    headerTitle: {
        color: "#fff",
        fontSize: 21,
        fontWeight: "700",
    },

    content: {
        padding: 20,
        paddingBottom: 40,
    },

    urlContainer: {
        marginBottom: 20,
    },

    label: {
        color: "#777",
        fontSize: 12,
        textTransform: "uppercase",
        marginBottom: 6,
    },

    url: {
        color: "#aaa",
        fontSize: 13,
    },

    loading: {
        alignItems: "center",
        paddingVertical: 30,
    },

    loadingText: {
        color: "#aaa",
        marginTop: 10,
    },

    reelPreview: {
        backgroundColor: "#15151b",
        borderRadius: 14,
        padding: 12,
        marginBottom: 25,
    },

    thumbnail: {
        width: "100%",
        height: 350,
        borderRadius: 10,
    },

    noThumbnail: {
        width: "100%",
        height: 350,
        backgroundColor: "#222229",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 10,
    },

    noThumbnailText: {
        color: "#666",
        fontSize: 13,
    },

    reelInfo: {
        paddingTop: 12,
    },

    username: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
        marginBottom: 6,
    },

    caption: {
        color: "#bbb",
        fontSize: 14,
        lineHeight: 20,
    },

    folderSection: {
        marginTop: 5,
    },

    sectionTitle: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 12,
    },

    emptyText: {
        color: "#777",
        marginBottom: 15,
    },

    folderItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#15151b",
        padding: 15,
        borderRadius: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: "#222229",
    },

    selectedFolder: {
        borderColor: "#5865f2",
        backgroundColor: "#17182a",
    },

    folderIcon: {
        fontSize: 20,
        marginRight: 12,
    },

    folderName: {
        color: "#fff",
        fontSize: 15,
        flex: 1,
    },

    check: {
        color: "#5865f2",
        fontSize: 20,
        fontWeight: "700",
    },

    createFolderButton: {
        paddingVertical: 15,
    },

    createFolderText: {
        color: "#7c86ff",
        fontSize: 15,
        fontWeight: "600",
    },

    saveButton: {
        height: 52,
        backgroundColor: "#5865f2",
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 25,
    },

    disabledButton: {
        opacity: 0.4,
    },

    saveButtonText: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "700",
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.7)",
        justifyContent: "center",
        padding: 25,
    },

    modalContainer: {
        backgroundColor: "#17171d",
        borderRadius: 16,
        padding: 20,
    },

    modalTitle: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "700",
        marginBottom: 20,
    },

    input: {
        height: 50,
        backgroundColor: "#222229",
        borderRadius: 10,
        paddingHorizontal: 15,
        color: "#fff",
        fontSize: 15,
    },

    modalButtons: {
        flexDirection: "row",
        justifyContent: "flex-end",
        alignItems: "center",
        marginTop: 20,
        gap: 25,
    },

    cancelText: {
        color: "#888",
        fontSize: 15,
    },

    createText: {
        color: "#7c86ff",
        fontSize: 15,
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