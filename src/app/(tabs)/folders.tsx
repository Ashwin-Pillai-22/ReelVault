import { createFolder, getFolders } from '@/database/folder';
import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, StyleSheet, ScrollView, Alert } from 'react-native'
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import React from 'react';

export default function Folder() {
    const [showFolderModal, setShowFolderModal] = useState(false);
    const [folderName, setFolderName] = useState("");
    const [folders, setFolders] = useState<any[]>([]);


    useFocusEffect(
        React.useCallback(() => {
            loadFolders();
        }, [])
    );
    
    useEffect(() => {
        loadFolders();
    }, []);

    async function loadFolders() {
        const data = await getFolders();
        setFolders(data);
    }

    const handleCreateFolder = async () => {
        const name = folderName.trim();

        if (!name) {
            return;
        }

        try {
            await createFolder(name);

            setFolderName("");
            setShowFolderModal(false);

            // Reload folders from SQLite
            await loadFolders();

        } catch (error) {
            Alert.alert('ERROR','Failed to create folder');
        }
    };
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>
                            Your Folders
                        </Text>

                        <TouchableOpacity
                            onPress={() => setShowFolderModal(true)}
                        >
                            <Text style={styles.addText}>+ Add</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.emptyFolder}>
                        {folders.length === 0 ? (
                            <View style={styles.emptyFolder}>
                                <Text style={styles.folderIcon}>📁</Text>
                                <Text style={styles.emptyTitle}>
                                    No folders yet
                                </Text>
                                <Text style={styles.emptyText}>
                                    Create a folder to organize your Reels.
                                </Text>
                            </View>
                        ) : (
                            folders.map((folder) => (
                                <TouchableOpacity
                                    key={folder.id}
                                    style={styles.folderCard}
                                    onPress={() => {
                                        router.push({
                                            pathname: "/Folder/[id]",
                                            params: {
                                                id: folder.id.toString(),
                                                name: folder.name,
                                            },
                                        });
                                    }}
                                >
                                    <Text style={styles.folderIcon}>
                                        📁
                                    </Text>

                                    <Text style={styles.folderName}>
                                        {folder.name}
                                    </Text>
                                </TouchableOpacity>
                            ))
                        )}



                    </View>
                </View>
                <Modal
                    visible={showFolderModal}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setShowFolderModal(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContainer}>

                            <Text style={styles.modalTitle}>
                                Create Folder
                            </Text>

                            <TextInput
                                value={folderName}
                                onChangeText={setFolderName}
                                placeholder="Folder name"
                                placeholderTextColor="#777"
                                autoFocus
                                style={styles.folderInput}
                            />

                            <View style={styles.modalButtons}>

                                <TouchableOpacity
                                    style={styles.cancelButton}
                                    onPress={() => {
                                        setFolderName("");
                                        setShowFolderModal(false);
                                    }}
                                >
                                    <Text style={styles.cancelText}>
                                        Cancel
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.createButton}
                                    onPress={handleCreateFolder}
                                >
                                    <Text style={styles.createText}>
                                        Create
                                    </Text>
                                </TouchableOpacity>

                            </View>
                        </View>
                    </View>
                </Modal>
            </ScrollView>
        </SafeAreaView>
    )
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
    section: {
        marginTop: 10,
    },

    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 14,
    },

    sectionTitle: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "700",
    },

    addText: {
        color: "#7c86ff",
        fontSize: 14,
        fontWeight: "600",
    },

    emptyFolder: {
        // alignItems: "center",
        paddingHorizontal: 20,
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

    folderIcon: {
        fontSize: 35,
        marginBottom: 10,
    },
    //foler style
    folderCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#17171d",
        padding: 16,
        borderRadius: 12,
        marginBottom: 10,
    },

    folderName: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },

    folderSubtitle: {
        color: "#777",
        fontSize: 12,
        marginTop: 3,
    },

    // modal style
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.7)",
        justifyContent: "center",
        alignItems: "center",
    },

    modalContainer: {
        width: "85%",
        backgroundColor: "#17171d",
        borderRadius: 18,
        padding: 20,
    },

    modalTitle: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "700",
        marginBottom: 18,
    },

    folderInput: {
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
        gap: 10,
        marginTop: 20,
    },

    cancelButton: {
        paddingHorizontal: 18,
        paddingVertical: 12,
    },

    cancelText: {
        color: "#999",
        fontWeight: "600",
    },

    createButton: {
        backgroundColor: "#5865f2",
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 10,
    },

    createText: {
        color: "#fff",
        fontWeight: "700",
    },
});

function loadFolders() {
    throw new Error('Function not implemented.');
}
